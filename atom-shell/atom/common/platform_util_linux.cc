// Copyright (c) 2013 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/common/platform_util.h"

#include <stdio.h>

#include "base/file_util.h"
#include "base/process/kill.h"
#include "base/process/launch.h"
#include "url/gurl.h"

namespace {

void XDGUtil(const std::string& util, const std::string& arg) {
  std::vector<std::string> argv;
  argv.push_back(util);
  argv.push_back(arg);

  base::LaunchOptions options;
  options.allow_new_privs = true;
  // xdg-open can fall back on mailcap which eventually might plumb through
  // to a command that needs a terminal.  Set the environment variable telling
  // it that we definitely don't have a terminal available and that it should
  // bring up a new terminal if necessary.  See "man mailcap".
  options.environ["MM_NOTTTY"] = "1";

  base::ProcessHandle handle;
  if (base::LaunchProcess(argv, options, &handle))
    base::EnsureProcessGetsReaped(handle);
}

void XDGOpen(const std::string& path) {
  XDGUtil("xdg-open", path);
}

void XDGEmail(const std::string& email) {
  XDGUtil("xdg-email", email);
}

}  // namespace

namespace platform_util {

// TODO(estade): It would be nice to be able to select the file in the file
// manager, but that probably requires extending xdg-open. For now just
// show the folder.
void ShowItemInFolder(const base::FilePath& full_path) {
  base::FilePath dir = full_path.DirName();
  if (!base::DirectoryExists(dir))
    return;

  XDGOpen(dir.value());
}

void OpenItem(const base::FilePath& full_path) {
  XDGOpen(full_path.value());
}

void OpenExternal(const GURL& url) {
  if (url.SchemeIs("mailto"))
    XDGEmail(url.spec());
  else
    XDGOpen(url.spec());
}

void MoveItemToTrash(const base::FilePath& full_path) {
  XDGUtil("gvfs-trash", full_path.value());
}

void Beep() {
  // echo '\a' > /dev/console
  FILE* console = fopen("/dev/console", "r");
  if (console == NULL)
    return;
  fprintf(console, "\a");
  fclose(console);
}

}  // namespace platform_util
