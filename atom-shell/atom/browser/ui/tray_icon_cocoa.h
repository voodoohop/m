// Copyright (c) 2014 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_BROWSER_UI_TRAY_ICON_COCOA_H_
#define ATOM_BROWSER_UI_TRAY_ICON_COCOA_H_

#import <Cocoa/Cocoa.h>

#include <string>

#include "atom/browser/ui/tray_icon.h"
#include "base/mac/scoped_nsobject.h"

@class AtomMenuController;
@class StatusItemController;

namespace atom {

class TrayIconCocoa : public TrayIcon {
 public:
  TrayIconCocoa();
  virtual ~TrayIconCocoa();

  virtual void SetImage(const gfx::ImageSkia& image) OVERRIDE;
  virtual void SetPressedImage(const gfx::ImageSkia& image) OVERRIDE;
  virtual void SetToolTip(const std::string& tool_tip) OVERRIDE;
  virtual void SetTitle(const std::string& title) OVERRIDE;
  virtual void SetHighlightMode(bool highlight) OVERRIDE;
  virtual void SetContextMenu(ui::SimpleMenuModel* menu_model) OVERRIDE;

 private:
  base::scoped_nsobject<NSStatusItem> item_;

  base::scoped_nsobject<StatusItemController> controller_;

  // Status menu shown when right-clicking the system icon.
  base::scoped_nsobject<AtomMenuController> menu_;

  DISALLOW_COPY_AND_ASSIGN(TrayIconCocoa);
};

}  // namespace atom

#endif  // ATOM_BROWSER_UI_TRAY_ICON_COCOA_H_
