// Copyright (c) 2013 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/browser/browser.h"

#import "atom/browser/mac/atom_application.h"
#import "atom/browser/mac/atom_application_delegate.h"
#include "atom/browser/native_window.h"
#include "atom/browser/window_list.h"
#import "base/mac/bundle_locations.h"
#import "base/mac/foundation_util.h"
#include "base/strings/sys_string_conversions.h"

namespace atom {

void Browser::Focus() {
  [[AtomApplication sharedApplication] activateIgnoringOtherApps:YES];
}

void Browser::AddRecentDocument(const base::FilePath& path) {
  NSURL* u = [NSURL fileURLWithPath:base::mac::FilePathToNSString(path)];
  [[NSDocumentController sharedDocumentController] noteNewRecentDocumentURL:u];
}

void Browser::ClearRecentDocuments() {
}

std::string Browser::GetExecutableFileVersion() const {
  NSDictionary* infoDictionary = base::mac::OuterBundle().infoDictionary;
  NSString *version = [infoDictionary objectForKey:@"CFBundleVersion"];
  return base::SysNSStringToUTF8(version);
}

std::string Browser::GetExecutableFileProductName() const {
  NSDictionary* infoDictionary = base::mac::OuterBundle().infoDictionary;
  NSString *version = [infoDictionary objectForKey:@"CFBundleName"];
  return base::SysNSStringToUTF8(version);
}

int Browser::DockBounce(BounceType type) {
  return [[AtomApplication sharedApplication] requestUserAttention:(NSRequestUserAttentionType)type];
}

void Browser::DockCancelBounce(int rid) {
  [[AtomApplication sharedApplication] cancelUserAttentionRequest:rid];
}

void Browser::DockSetBadgeText(const std::string& label) {
  NSDockTile *tile = [[AtomApplication sharedApplication] dockTile];
  [tile setBadgeLabel:base::SysUTF8ToNSString(label)];
}

std::string Browser::DockGetBadgeText() {
  NSDockTile *tile = [[AtomApplication sharedApplication] dockTile];
  return base::SysNSStringToUTF8([tile badgeLabel]);
}

void Browser::DockHide() {
  WindowList* list = WindowList::GetInstance();
  for (WindowList::iterator it = list->begin(); it != list->end(); ++it)
    [(*it)->GetNativeWindow() setCanHide:NO];

  ProcessSerialNumber psn = { 0, kCurrentProcess };
  TransformProcessType(&psn, kProcessTransformToUIElementApplication);
}

void Browser::DockShow() {
  ProcessSerialNumber psn = { 0, kCurrentProcess };
  TransformProcessType(&psn, kProcessTransformToForegroundApplication);
}

void Browser::DockSetMenu(ui::MenuModel* model) {
  AtomApplicationDelegate* delegate = (AtomApplicationDelegate*)[NSApp delegate];
  [delegate setApplicationDockMenu:model];
}

}  // namespace atom
