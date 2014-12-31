// Copyright (c) 2013 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/app/atom_main_delegate.h"

#include <string>

#include "atom/app/atom_content_client.h"
#include "atom/browser/atom_browser_client.h"
#include "atom/common/google_api_key.h"
#include "atom/renderer/atom_renderer_client.h"
#include "base/command_line.h"
#include "base/debug/stack_trace.h"
#include "base/environment.h"
#include "base/logging.h"
#include "content/public/common/content_switches.h"
#include "ui/base/resource/resource_bundle.h"

namespace atom {

AtomMainDelegate::AtomMainDelegate() {
}

AtomMainDelegate::~AtomMainDelegate() {
}

bool AtomMainDelegate::BasicStartupComplete(int* exit_code) {
  // Disable logging out to debug.log on Windows
#if defined(OS_WIN)
  logging::LoggingSettings settings;
#if defined(DEBUG)
  settings.logging_dest = logging::LOG_TO_ALL;
  settings.log_file = L"debug.log";
  settings.lock_log = logging::LOCK_LOG_FILE;
  settings.delete_old = logging::DELETE_OLD_LOG_FILE;
#else
  settings.logging_dest = logging::LOG_TO_SYSTEM_DEBUG_LOG;
#endif
  logging::InitLogging(settings);
#endif  // defined(OS_WIN)

  // Logging with pid and timestamp.
  logging::SetLogItems(true, false, true, false);

  // Enable convient stack printing.
#if defined(DEBUG) && defined(OS_LINUX)
  base::debug::EnableInProcessStackDumping();
#endif

  return brightray::MainDelegate::BasicStartupComplete(exit_code);
}

void AtomMainDelegate::PreSandboxStartup() {
  brightray::MainDelegate::PreSandboxStartup();

  // Set google API key.
  scoped_ptr<base::Environment> env(base::Environment::Create());
  if (!env->HasVar("GOOGLE_API_KEY"))
    env->SetVar("GOOGLE_API_KEY", GOOGLEAPIS_API_KEY);

  CommandLine* command_line = CommandLine::ForCurrentProcess();
  std::string process_type = command_line->GetSwitchValueASCII(
      switches::kProcessType);

  // Only append arguments for browser process.
  if (!process_type.empty())
    return;

  // Add a flag to mark the start of switches added by atom-shell.
  command_line->AppendSwitch("atom-shell-switches-start");

#if defined(OS_WIN)
  // Disable the LegacyRenderWidgetHostHWND, it made frameless windows unable
  // to move and resize. We may consider enabling it again after upgraded to
  // Chrome 38, which should have fixed the problem.
  command_line->AppendSwitch(switches::kDisableLegacyIntermediateWindow);
#endif

  // Disable renderer sandbox for most of node's functions.
  command_line->AppendSwitch(switches::kNoSandbox);

#if defined(OS_MACOSX)
  // Enable AVFoundation.
  command_line->AppendSwitch("enable-avfoundation");
#endif

  // Add a flag to mark the end of switches added by atom-shell.
  command_line->AppendSwitch("atom-shell-switches-end");
}

content::ContentBrowserClient* AtomMainDelegate::CreateContentBrowserClient() {
  browser_client_.reset(new AtomBrowserClient);
  return browser_client_.get();
}

content::ContentRendererClient*
    AtomMainDelegate::CreateContentRendererClient() {
  renderer_client_.reset(new AtomRendererClient);
  return renderer_client_.get();
}

scoped_ptr<brightray::ContentClient> AtomMainDelegate::CreateContentClient() {
  return scoped_ptr<brightray::ContentClient>(new AtomContentClient).Pass();
}

void AtomMainDelegate::AddDataPackFromPath(
    ui::ResourceBundle* bundle, const base::FilePath& pak_dir) {
#if defined(OS_WIN)
  bundle->AddDataPackFromPath(
      pak_dir.Append(FILE_PATH_LITERAL("ui_resources_200_percent.pak")),
      ui::SCALE_FACTOR_200P);
  bundle->AddDataPackFromPath(
      pak_dir.Append(FILE_PATH_LITERAL("content_resources_200_percent.pak")),
      ui::SCALE_FACTOR_200P);
#endif
}

}  // namespace atom
