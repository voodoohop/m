// Copyright (c) 2014 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/browser/ui/tray_icon.h"

namespace atom {

TrayIcon::TrayIcon() {
}

TrayIcon::~TrayIcon() {
}

void TrayIcon::SetPressedImage(const gfx::ImageSkia& image) {
}

void TrayIcon::SetTitle(const std::string& title) {
}

void TrayIcon::SetHighlightMode(bool highlight) {
}

void TrayIcon::DisplayBalloon(const gfx::ImageSkia& icon,
                              const base::string16& title,
                              const base::string16& contents) {
}

void TrayIcon::NotifyClicked() {
  FOR_EACH_OBSERVER(TrayIconObserver, observers_, OnClicked());
}

void TrayIcon::NotifyDoubleClicked() {
  FOR_EACH_OBSERVER(TrayIconObserver, observers_, OnDoubleClicked());
}

void TrayIcon::NotifyBalloonShow() {
  FOR_EACH_OBSERVER(TrayIconObserver, observers_, OnBalloonShow());
}

void TrayIcon::NotifyBalloonClicked() {
  FOR_EACH_OBSERVER(TrayIconObserver, observers_, OnBalloonClicked());
}

void TrayIcon::NotifyBalloonClosed() {
  FOR_EACH_OBSERVER(TrayIconObserver, observers_, OnBalloonClosed());
}

}  // namespace atom
