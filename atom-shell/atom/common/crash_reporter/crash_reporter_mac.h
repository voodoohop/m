// Copyright (c) 2013 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_COMMON_CRASH_REPORTER_CRASH_REPORTER_MAC_H_
#define ATOM_COMMON_CRASH_REPORTER_CRASH_REPORTER_MAC_H_

#include <string>

#include "atom/common/crash_reporter/crash_reporter.h"
#include "base/compiler_specific.h"
#import "vendor/breakpad/src/client/mac/Framework/Breakpad.h"

template <typename T> struct DefaultSingletonTraits;

namespace crash_reporter {

class CrashReporterMac : public CrashReporter {
 public:
  static CrashReporterMac* GetInstance();

  virtual void InitBreakpad(const std::string& product_name,
                            const std::string& version,
                            const std::string& company_name,
                            const std::string& submit_url,
                            bool auto_submit,
                            bool skip_system_crash_handler) OVERRIDE;
  virtual void SetUploadParameters() OVERRIDE;

 private:
  friend struct DefaultSingletonTraits<CrashReporterMac>;

  CrashReporterMac();
  virtual ~CrashReporterMac();

  BreakpadRef breakpad_;

  DISALLOW_COPY_AND_ASSIGN(CrashReporterMac);
};

}  // namespace crash_reporter

#endif  // ATOM_COMMON_CRASH_REPORTER_CRASH_REPORTER_MAC_H_
