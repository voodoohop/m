// Copyright (c) 2013 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/browser/native_window_mac.h"

#include <string>

#import "atom/browser/ui/cocoa/event_processing_window.h"
#include "atom/common/draggable_region.h"
#include "atom/common/options_switches.h"
#include "base/mac/mac_util.h"
#include "base/strings/sys_string_conversions.h"
#include "content/public/browser/native_web_keyboard_event.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/render_view_host.h"
#include "content/public/browser/render_widget_host_view.h"
#include "native_mate/dictionary.h"
#include "vendor/brightray/browser/inspectable_web_contents.h"
#include "vendor/brightray/browser/inspectable_web_contents_view.h"

static const CGFloat kAtomWindowCornerRadius = 4.0;

@interface NSView (PrivateMethods)
- (CGFloat)roundedCornerRadius;
@end

// This view always takes the size of its superview. It is intended to be used
// as a NSWindow's contentView.  It is needed because NSWindow's implementation
// explicitly resizes the contentView at inopportune times.
@interface FullSizeContentView : NSView
@end

@implementation FullSizeContentView

// This method is directly called by NSWindow during a window resize on OSX
// 10.10.0, beta 2. We must override it to prevent the content view from
// shrinking.
- (void)setFrameSize:(NSSize)size {
  if ([self superview])
    size = [[self superview] bounds].size;
  [super setFrameSize:size];
}

// The contentView gets moved around during certain full-screen operations.
// This is less than ideal, and should eventually be removed.
- (void)viewDidMoveToSuperview {
  [self setFrame:[[self superview] bounds]];
}

@end

@interface AtomNSWindowDelegate : NSObject<NSWindowDelegate> {
 @private
  atom::NativeWindowMac* shell_;
  BOOL acceptsFirstMouse_;
}
- (id)initWithShell:(atom::NativeWindowMac*)shell;
- (void)setAcceptsFirstMouse:(BOOL)accept;
@end

@implementation AtomNSWindowDelegate

- (id)initWithShell:(atom::NativeWindowMac*)shell {
  if ((self = [super init])) {
    shell_ = shell;
    acceptsFirstMouse_ = NO;
  }
  return self;
}

- (void)setAcceptsFirstMouse:(BOOL)accept {
  acceptsFirstMouse_ = accept;
}

- (void)windowDidBecomeMain:(NSNotification*)notification {
  content::WebContents* web_contents = shell_->GetWebContents();
  if (!web_contents)
    return;

  web_contents->RestoreFocus();

  content::RenderWidgetHostView* rwhv = web_contents->GetRenderWidgetHostView();
  if (rwhv)
    rwhv->SetActive(true);

  shell_->NotifyWindowFocus();
}

- (void)windowDidResignMain:(NSNotification*)notification {
  content::WebContents* web_contents = shell_->GetWebContents();
  if (!web_contents)
    return;

  web_contents->StoreFocus();

  content::RenderWidgetHostView* rwhv = web_contents->GetRenderWidgetHostView();
  if (rwhv)
    rwhv->SetActive(false);

  shell_->NotifyWindowBlur();
}

- (void)windowDidResize:(NSNotification*)otification {
  if (!shell_->has_frame())
    shell_->ClipWebView();
}

- (void)windowDidMiniaturize:(NSNotification*)notification {
  shell_->NotifyWindowMinimize();
}

- (void)windowDidDeminiaturize:(NSNotification*)notification {
  shell_->NotifyWindowRestore();
}

- (BOOL)windowShouldZoom:(NSWindow*)window toFrame:(NSRect)newFrame {
  // Cocoa doen't have concept of maximize/unmaximize, so wee need to emulate
  // them by calculating size change when zooming.
  if (newFrame.size.width < [window frame].size.width ||
      newFrame.size.height < [window frame].size.height)
    shell_->NotifyWindowUnmaximize();
  else
    shell_->NotifyWindowMaximize();
  return YES;
}

- (void)windowDidEnterFullScreen:(NSNotification*)notification {
  shell_->NotifyWindowEnterFullScreen();
}

- (void)windowDidExitFullScreen:(NSNotification*)notification {
  if (!shell_->has_frame()) {
    NSWindow* window = shell_->GetNativeWindow();
    [[window standardWindowButton:NSWindowFullScreenButton] setHidden:YES];
  }

  shell_->NotifyWindowLeaveFullScreen();
}

- (void)windowWillClose:(NSNotification*)notification {
  shell_->NotifyWindowClosed();
  [self autorelease];
}

- (BOOL)windowShouldClose:(id)window {
  // When user tries to close the window by clicking the close button, we do
  // not close the window immediately, instead we try to close the web page
  // fisrt, and when the web page is closed the window will also be closed.
  shell_->CloseWebContents();
  return NO;
}

- (BOOL)acceptsFirstMouse:(NSEvent*)event {
  return acceptsFirstMouse_;
}

@end

@interface AtomNSWindow : EventProcessingWindow {
 @private
  atom::NativeWindowMac* shell_;
  bool enable_larger_than_screen_;
}
- (void)setShell:(atom::NativeWindowMac*)shell;
- (void)setEnableLargerThanScreen:(bool)enable;
@end

@implementation AtomNSWindow

- (void)setShell:(atom::NativeWindowMac*)shell {
  shell_ = shell;
}

- (void)setEnableLargerThanScreen:(bool)enable {
  enable_larger_than_screen_ = enable;
}

// Enable the window to be larger than screen.
- (NSRect)constrainFrameRect:(NSRect)frameRect toScreen:(NSScreen*)screen {
  if (enable_larger_than_screen_)
    return frameRect;
  else
    return [super constrainFrameRect:frameRect toScreen:screen];
}

- (IBAction)reload:(id)sender {
  content::WebContents* web_contents = shell_->GetWebContents();
  content::NavigationController::LoadURLParams params(web_contents->GetURL());
  web_contents->GetController().LoadURLWithParams(params);
}

- (IBAction)showDevTools:(id)sender {
  shell_->OpenDevTools();
}

// Returns an empty array for AXChildren attribute, this will force the
// SpeechSynthesisServer to use its classical way of speaking the selected text:
// by invoking the "Command+C" for current application and then speak out
// what's in the clipboard. Otherwise the "Text to Speech" would always speak
// out window's title.
// This behavior is taken by both FireFox and Chrome, see also FireFox's bug on
// more of how SpeechSynthesisServer chose which text to read:
// https://bugzilla.mozilla.org/show_bug.cgi?id=674612
- (id)accessibilityAttributeValue:(NSString*)attribute {
  if ([attribute isEqualToString:@"AXChildren"])
    return [NSArray array];
  return [super accessibilityAttributeValue:attribute];
}

@end

@interface ControlRegionView : NSView {
 @private
  atom::NativeWindowMac* shellWindow_;  // Weak; owns self.
}
@end

@implementation ControlRegionView

- (id)initWithShellWindow:(atom::NativeWindowMac*)shellWindow {
  if ((self = [super init]))
    shellWindow_ = shellWindow;
  return self;
}

- (BOOL)mouseDownCanMoveWindow {
  return NO;
}

- (NSView*)hitTest:(NSPoint)aPoint {
  if (!shellWindow_->IsWithinDraggableRegion(aPoint)) {
    return nil;
  }
  return self;
}

- (void)mouseDown:(NSEvent*)event {
  shellWindow_->HandleMouseEvent(event);
}

- (void)mouseDragged:(NSEvent*)event {
  shellWindow_->HandleMouseEvent(event);
}

@end

@interface AtomProgressBar : NSProgressIndicator
@end

@implementation AtomProgressBar

- (void)drawRect:(NSRect)dirtyRect {
  if (self.style != NSProgressIndicatorBarStyle)
    return;
  // Draw edges of rounded rect.
  NSRect rect = NSInsetRect([self bounds], 1.0, 1.0);
  CGFloat radius = rect.size.height / 2;
  NSBezierPath* bezier_path = [NSBezierPath bezierPathWithRoundedRect:rect xRadius:radius yRadius:radius];
  [bezier_path setLineWidth:2.0];
  [[NSColor grayColor] set];
  [bezier_path stroke];

  // Fill the rounded rect.
  rect = NSInsetRect(rect, 2.0, 2.0);
  radius = rect.size.height / 2;
  bezier_path = [NSBezierPath bezierPathWithRoundedRect:rect xRadius:radius yRadius:radius];
  [bezier_path setLineWidth:1.0];
  [bezier_path addClip];

  // Calculate the progress width.
  rect.size.width = floor(rect.size.width * ([self doubleValue] / [self maxValue]));

  // Fill the progress bar with color blue.
  [[NSColor colorWithSRGBRed:0.2 green:0.6 blue:1 alpha:1] set];
  NSRectFill(rect);
}

@end

namespace atom {

NativeWindowMac::NativeWindowMac(content::WebContents* web_contents,
                                 const mate::Dictionary& options)
    : NativeWindow(web_contents, options),
      is_kiosk_(false),
      attention_request_id_(0) {
  int width = 800, height = 600;
  options.Get(switches::kWidth, &width);
  options.Get(switches::kHeight, &height);

  NSRect main_screen_rect = [[[NSScreen screens] objectAtIndex:0] frame];
  NSRect cocoa_bounds = NSMakeRect(
      round((NSWidth(main_screen_rect) - width) / 2) ,
      round((NSHeight(main_screen_rect) - height) / 2),
      width,
      height);

  AtomNSWindow* atomWindow;

  atomWindow = [[AtomNSWindow alloc]
      initWithContentRect:cocoa_bounds
                styleMask:NSTitledWindowMask | NSClosableWindowMask |
                          NSMiniaturizableWindowMask | NSResizableWindowMask |
                          NSTexturedBackgroundWindowMask
                  backing:NSBackingStoreBuffered
                    defer:YES];

  [atomWindow setShell:this];
  [atomWindow setEnableLargerThanScreen:enable_larger_than_screen_];
  window_.reset(atomWindow);

  AtomNSWindowDelegate* delegate =
      [[AtomNSWindowDelegate alloc] initWithShell:this];
  [window_ setDelegate:delegate];

  // We will manage window's lifetime ourselves.
  [window_ setReleasedWhenClosed:NO];

  // On OS X the initial window size doesn't include window frame.
  bool use_content_size = false;
  options.Get(switches::kUseContentSize, &use_content_size);
  if (has_frame_ && !use_content_size)
    SetSize(gfx::Size(width, height));

  // Enable the NSView to accept first mouse event.
  bool acceptsFirstMouse = false;
  options.Get(switches::kAcceptFirstMouse, &acceptsFirstMouse);
  [delegate setAcceptsFirstMouse:acceptsFirstMouse];

  // Disable fullscreen button when 'fullscreen' is specified to false.
  bool fullscreen;
  if (!(options.Get(switches::kFullscreen, &fullscreen) &&
        !fullscreen)) {
    NSUInteger collectionBehavior = [window_ collectionBehavior];
    collectionBehavior |= NSWindowCollectionBehaviorFullScreenPrimary;
    [window_ setCollectionBehavior:collectionBehavior];
  }

  NSView* view = inspectable_web_contents()->GetView()->GetNativeView();
  [view setAutoresizingMask:NSViewWidthSizable | NSViewHeightSizable];

  InstallView();
}

NativeWindowMac::~NativeWindowMac() {
  // Force InspectableWebContents to be destroyed before we destroy window,
  // because it may still be observing the window at this time.
  DestroyWebContents();
}

void NativeWindowMac::Close() {
  [window_ performClose:nil];
}

void NativeWindowMac::CloseImmediately() {
  [window_ close];
}

void NativeWindowMac::Move(const gfx::Rect& pos) {
  NSRect cocoa_bounds = NSMakeRect(pos.x(), 0,
                                   pos.width(),
                                   pos.height());
  // Flip coordinates based on the primary screen.
  NSScreen* screen = [[NSScreen screens] objectAtIndex:0];
  cocoa_bounds.origin.y =
      NSHeight([screen frame]) - pos.height() - pos.y();

  [window_ setFrame:cocoa_bounds display:YES];
}

void NativeWindowMac::Focus(bool focus) {
  if (!IsVisible())
    return;

  if (focus) {
    [[NSApplication sharedApplication] activateIgnoringOtherApps:YES];
    [window_ makeKeyAndOrderFront:nil];
  } else {
    [window_ orderBack:nil];
  }
}

bool NativeWindowMac::IsFocused() {
  return [window_ isKeyWindow];
}

void NativeWindowMac::Show() {
  [window_ makeKeyAndOrderFront:nil];
}

void NativeWindowMac::ShowInactive() {
  [window_ orderFrontRegardless];
}

void NativeWindowMac::Hide() {
  [window_ orderOut:nil];
}

bool NativeWindowMac::IsVisible() {
  return [window_ isVisible];
}

void NativeWindowMac::Maximize() {
  [window_ zoom:nil];
}

void NativeWindowMac::Unmaximize() {
  [window_ zoom:nil];
}

bool NativeWindowMac::IsMaximized() {
  return [window_ isZoomed];
}

void NativeWindowMac::Minimize() {
  [window_ miniaturize:nil];
}

void NativeWindowMac::Restore() {
  [window_ deminiaturize:nil];
}

bool NativeWindowMac::IsMinimized() {
  return [window_ isMiniaturized];
}

void NativeWindowMac::SetFullScreen(bool fullscreen) {
  if (fullscreen == IsFullscreen())
    return;

  if (!base::mac::IsOSLionOrLater()) {
    LOG(ERROR) << "Fullscreen mode is only supported above Lion";
    return;
  }

  [window_ toggleFullScreen:nil];
}

bool NativeWindowMac::IsFullscreen() {
  return [window_ styleMask] & NSFullScreenWindowMask;
}

void NativeWindowMac::SetSize(const gfx::Size& size) {
  NSRect frame = [window_ frame];
  frame.origin.y -= size.height() - frame.size.height;
  frame.size.width = size.width();
  frame.size.height = size.height();

  [window_ setFrame:frame display:YES];
}

gfx::Size NativeWindowMac::GetSize() {
  NSRect frame = [window_ frame];
  return gfx::Size(frame.size.width, frame.size.height);
}

void NativeWindowMac::SetContentSize(const gfx::Size& size) {
  NSRect frame_nsrect = [window_ frame];
  NSSize frame = frame_nsrect.size;
  NSSize content = [window_ contentRectForFrameRect:frame_nsrect].size;

  int width = size.width() + frame.width - content.width;
  int height = size.height() + frame.height - content.height;
  frame_nsrect.origin.y -= height - frame_nsrect.size.height;
  frame_nsrect.size.width = width;
  frame_nsrect.size.height = height;
  [window_ setFrame:frame_nsrect display:YES];
}

gfx::Size NativeWindowMac::GetContentSize() {
  NSRect bounds = [[window_ contentView] bounds];
  return gfx::Size(bounds.size.width, bounds.size.height);
}

void NativeWindowMac::SetMinimumSize(const gfx::Size& size) {
  NSSize min_size = NSMakeSize(size.width(), size.height());
  NSView* content = [window_ contentView];
  [window_ setContentMinSize:[content convertSize:min_size toView:nil]];
}

gfx::Size NativeWindowMac::GetMinimumSize() {
  NSView* content = [window_ contentView];
  NSSize min_size = [content convertSize:[window_ contentMinSize]
                                fromView:nil];
  return gfx::Size(min_size.width, min_size.height);
}

void NativeWindowMac::SetMaximumSize(const gfx::Size& size) {
  NSSize max_size = NSMakeSize(size.width(), size.height());
  NSView* content = [window_ contentView];
  [window_ setContentMaxSize:[content convertSize:max_size toView:nil]];
}

gfx::Size NativeWindowMac::GetMaximumSize() {
  NSView* content = [window_ contentView];
  NSSize max_size = [content convertSize:[window_ contentMaxSize]
                                fromView:nil];
  return gfx::Size(max_size.width, max_size.height);
}

void NativeWindowMac::SetResizable(bool resizable) {
  if (resizable) {
    [[window_ standardWindowButton:NSWindowZoomButton] setEnabled:YES];
    [window_ setStyleMask:[window_ styleMask] | NSResizableWindowMask];
  } else {
    [[window_ standardWindowButton:NSWindowZoomButton] setEnabled:NO];
    [window_ setStyleMask:[window_ styleMask] ^ NSResizableWindowMask];
  }
}

bool NativeWindowMac::IsResizable() {
  return [window_ styleMask] & NSResizableWindowMask;
}

void NativeWindowMac::SetAlwaysOnTop(bool top) {
  [window_ setLevel:(top ? NSFloatingWindowLevel : NSNormalWindowLevel)];
}

bool NativeWindowMac::IsAlwaysOnTop() {
  return [window_ level] == NSFloatingWindowLevel;
}

void NativeWindowMac::Center() {
  [window_ center];
}

void NativeWindowMac::SetPosition(const gfx::Point& position) {
  Move(gfx::Rect(position, GetSize()));
}

gfx::Point NativeWindowMac::GetPosition() {
  NSRect frame = [window_ frame];
  NSScreen* screen = [[NSScreen screens] objectAtIndex:0];

  return gfx::Point(frame.origin.x,
      NSHeight([screen frame]) - frame.origin.y - frame.size.height);
}

void NativeWindowMac::SetTitle(const std::string& title) {
  [window_ setTitle:base::SysUTF8ToNSString(title)];
}

std::string NativeWindowMac::GetTitle() {
  return base::SysNSStringToUTF8([window_ title]);
}

void NativeWindowMac::FlashFrame(bool flash) {
  if (flash) {
    attention_request_id_ = [NSApp requestUserAttention:NSInformationalRequest];
  } else {
    [NSApp cancelUserAttentionRequest:attention_request_id_];
    attention_request_id_ = 0;
  }
}

void NativeWindowMac::SetSkipTaskbar(bool skip) {
}

void NativeWindowMac::SetKiosk(bool kiosk) {
  if (kiosk && !is_kiosk_) {
    kiosk_options_ = [NSApp currentSystemPresentationOptions];
    NSApplicationPresentationOptions options =
        NSApplicationPresentationHideDock +
        NSApplicationPresentationHideMenuBar +
        NSApplicationPresentationDisableAppleMenu +
        NSApplicationPresentationDisableProcessSwitching +
        NSApplicationPresentationDisableForceQuit +
        NSApplicationPresentationDisableSessionTermination +
        NSApplicationPresentationDisableHideApplication;
    [NSApp setPresentationOptions:options];
    is_kiosk_ = true;
    SetFullScreen(true);
  } else if (!kiosk && is_kiosk_) {
    is_kiosk_ = false;
    SetFullScreen(false);
    [NSApp setPresentationOptions:kiosk_options_];
  }
}

bool NativeWindowMac::IsKiosk() {
  return is_kiosk_;
}

void NativeWindowMac::SetRepresentedFilename(const std::string& filename) {
  [window_ setRepresentedFilename:base::SysUTF8ToNSString(filename)];
}

std::string NativeWindowMac::GetRepresentedFilename() {
  return base::SysNSStringToUTF8([window_ representedFilename]);
}

void NativeWindowMac::SetDocumentEdited(bool edited) {
  [window_ setDocumentEdited:edited];
}

bool NativeWindowMac::IsDocumentEdited() {
  return [window_ isDocumentEdited];
}

bool NativeWindowMac::HasModalDialog() {
  return [window_ attachedSheet] != nil;
}

gfx::NativeWindow NativeWindowMac::GetNativeWindow() {
  return window_;
}

void NativeWindowMac::SetProgressBar(double progress) {
  NSDockTile* dock_tile = [NSApp dockTile];

  // For the first time API invoked, we need to create a ContentView in DockTile.
  if (dock_tile.contentView == NULL) {
    NSImageView* image_view = [[NSImageView alloc] init];
    [image_view setImage:[NSApp applicationIconImage]];
    [dock_tile setContentView:image_view];

    NSProgressIndicator* progress_indicator = [[AtomProgressBar alloc]
        initWithFrame:NSMakeRect(0.0f, 0.0f, dock_tile.size.width, 15.0)];
    [progress_indicator setStyle:NSProgressIndicatorBarStyle];
    [progress_indicator setIndeterminate:NO];
    [progress_indicator setBezeled:YES];
    [progress_indicator setMinValue:0];
    [progress_indicator setMaxValue:1];
    [progress_indicator setHidden:NO];
    [image_view addSubview:progress_indicator];
  }

  NSProgressIndicator* progress_indicator =
      static_cast<NSProgressIndicator*>([[[dock_tile contentView] subviews]
           objectAtIndex:0]);
  if (progress < 0) {
    [progress_indicator setHidden:YES];
  } else if (progress > 1) {
    [progress_indicator setHidden:NO];
    [progress_indicator setIndeterminate:YES];
    [progress_indicator setDoubleValue:1];
  } else {
    [progress_indicator setHidden:NO];
    [progress_indicator setDoubleValue:progress];
  }
  [dock_tile display];
}

void NativeWindowMac::ShowDefinitionForSelection() {
  content::WebContents* web_contents = GetWebContents();
  if (!web_contents)
    return;
  content::RenderWidgetHostView* rwhv = web_contents->GetRenderWidgetHostView();
  if (!rwhv)
    return;
  rwhv->ShowDefinitionForSelection();
}

bool NativeWindowMac::IsWithinDraggableRegion(NSPoint point) const {
  if (!draggable_region_)
    return false;
  NSView* webView = GetWebContents()->GetNativeView();
  NSInteger webViewHeight = NSHeight([webView bounds]);
  // |draggable_region_| is stored in local platform-indepdent coordiate system
  // while |point| is in local Cocoa coordinate system. Do the conversion
  // to match these two.
  return draggable_region_->contains(point.x, webViewHeight - point.y);
}

void NativeWindowMac::HandleMouseEvent(NSEvent* event) {
  NSPoint eventLoc = [event locationInWindow];
  NSRect mouseRect = [window_ convertRectToScreen:NSMakeRect(eventLoc.x, eventLoc.y, 0, 0)];
  NSPoint current_mouse_location = mouseRect.origin;


  if ([event type] == NSLeftMouseDown) {
    NSPoint frame_origin = [window_ frame].origin;
    last_mouse_offset_ = NSMakePoint(
        frame_origin.x - current_mouse_location.x,
        frame_origin.y - current_mouse_location.y);
  } else if ([event type] == NSLeftMouseDragged) {
    [window_ setFrameOrigin:NSMakePoint(
        current_mouse_location.x + last_mouse_offset_.x,
        current_mouse_location.y + last_mouse_offset_.y)];
  }
}

void NativeWindowMac::UpdateDraggableRegions(
    const std::vector<DraggableRegion>& regions) {
  // Draggable region is not supported for non-frameless window.
  if (has_frame_)
    return;

  UpdateDraggableRegionsForCustomDrag(regions);
  InstallDraggableRegionViews();
}

void NativeWindowMac::HandleKeyboardEvent(
    content::WebContents*,
    const content::NativeWebKeyboardEvent& event) {
  if (event.skip_in_browser ||
      event.type == content::NativeWebKeyboardEvent::Char)
    return;

  if (event.os_event.window == window_) {
    EventProcessingWindow* event_window =
        static_cast<EventProcessingWindow*>(window_);
    DCHECK([event_window isKindOfClass:[EventProcessingWindow class]]);
    [event_window redispatchKeyEvent:event.os_event];
  } else {
    // The event comes from detached devtools view, and it has already been
    // handled by the devtools itself, we now send it to application menu to
    // make menu acclerators work.
    BOOL handled = [[NSApp mainMenu] performKeyEquivalent:event.os_event];
    // Handle the cmd+~ shortcut.
    if (!handled && (event.os_event.modifierFlags & NSCommandKeyMask) &&
        (event.os_event.keyCode == 50  /* ~ key */))
      Focus(true);
  }
}

void NativeWindowMac::InstallView() {
  NSView* view = inspectable_web_contents()->GetView()->GetNativeView();
  if (has_frame_) {
    // Add layer with white background for the contents view.
    base::scoped_nsobject<CALayer> layer([[CALayer alloc] init]);
    [layer setBackgroundColor:CGColorGetConstantColor(kCGColorWhite)];
    [view setLayer:layer];
    [view setFrame:[[window_ contentView] bounds]];
    [[window_ contentView] addSubview:view];
  } else {
    if (base::mac::IsOSYosemiteOrLater()) {
      // In OSX 10.10, adding subviews to the root view for the NSView hierarchy
      // produces warnings. To eliminate the warnings, we resize the contentView
      // to fill the window, and add subviews to that.
      // http://crbug.com/380412
      content_view_.reset([[FullSizeContentView alloc] init]);
      [content_view_
          setAutoresizingMask:NSViewWidthSizable | NSViewHeightSizable];
      [content_view_ setFrame:[[[window_ contentView] superview] bounds]];
      [window_ setContentView:content_view_];

      [view setFrame:[content_view_ bounds]];
      [content_view_ addSubview:view];
    } else {
      NSView* frameView = [[window_ contentView] superview];
      [view setFrame:[frameView bounds]];
      [frameView addSubview:view];
    }

    ClipWebView();

    [[window_ standardWindowButton:NSWindowZoomButton] setHidden:YES];
    [[window_ standardWindowButton:NSWindowMiniaturizeButton] setHidden:YES];
    [[window_ standardWindowButton:NSWindowCloseButton] setHidden:YES];
    [[window_ standardWindowButton:NSWindowFullScreenButton] setHidden:YES];
  }
}

void NativeWindowMac::UninstallView() {
  NSView* view = inspectable_web_contents()->GetView()->GetNativeView();
  [view removeFromSuperview];
}

void NativeWindowMac::ClipWebView() {
  NSView* view = GetWebContents()->GetNativeView();
  view.layer.masksToBounds = YES;
  view.layer.cornerRadius = kAtomWindowCornerRadius;
}

void NativeWindowMac::InstallDraggableRegionViews() {
  DCHECK(!has_frame_);

  // All ControlRegionViews should be added as children of the WebContentsView,
  // because WebContentsView will be removed and re-added when entering and
  // leaving fullscreen mode.
  NSView* webView = GetWebContents()->GetNativeView();
  NSInteger webViewHeight = NSHeight([webView bounds]);

  // Remove all ControlRegionViews that are added last time.
  // Note that [webView subviews] returns the view's mutable internal array and
  // it should be copied to avoid mutating the original array while enumerating
  // it.
  base::scoped_nsobject<NSArray> subviews([[webView subviews] copy]);
  for (NSView* subview in subviews.get())
    if ([subview isKindOfClass:[ControlRegionView class]])
      [subview removeFromSuperview];

  // Create and add ControlRegionView for each region that needs to be excluded
  // from the dragging.
  for (std::vector<gfx::Rect>::const_iterator iter =
           system_drag_exclude_areas_.begin();
       iter != system_drag_exclude_areas_.end();
       ++iter) {
    base::scoped_nsobject<NSView> controlRegion(
        [[ControlRegionView alloc] initWithShellWindow:this]);
    [controlRegion setFrame:NSMakeRect(iter->x(),
                                       webViewHeight - iter->bottom(),
                                       iter->width(),
                                       iter->height())];
    [webView addSubview:controlRegion];
  }
}

void NativeWindowMac::UpdateDraggableRegionsForCustomDrag(
    const std::vector<DraggableRegion>& regions) {
  // We still need one ControlRegionView to cover the whole window such that
  // mouse events could be captured.
  NSView* web_view = GetWebContents()->GetNativeView();
  gfx::Rect window_bounds(
      0, 0, NSWidth([web_view bounds]), NSHeight([web_view bounds]));
  system_drag_exclude_areas_.clear();
  system_drag_exclude_areas_.push_back(window_bounds);

  // Aggregate the draggable areas and non-draggable areas such that hit test
  // could be performed easily.
  SkRegion* draggable_region = new SkRegion;
  for (std::vector<DraggableRegion>::const_iterator iter = regions.begin();
       iter != regions.end();
       ++iter) {
    const DraggableRegion& region = *iter;
    draggable_region->op(
        region.bounds.x(),
        region.bounds.y(),
        region.bounds.right(),
        region.bounds.bottom(),
        region.draggable ? SkRegion::kUnion_Op : SkRegion::kDifference_Op);
  }
  draggable_region_.reset(draggable_region);
}

// static
NativeWindow* NativeWindow::Create(content::WebContents* web_contents,
                                   const mate::Dictionary& options) {
  return new NativeWindowMac(web_contents, options);
}

}  // namespace atom
