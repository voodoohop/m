// Copyright (c) 2014 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_BROWSER_NET_ASAR_ASAR_PROTOCOL_HANDLER_H_
#define ATOM_BROWSER_NET_ASAR_ASAR_PROTOCOL_HANDLER_H_

#include "base/containers/scoped_ptr_hash_map.h"
#include "base/files/file_path.h"
#include "base/memory/ref_counted.h"
#include "net/url_request/url_request_job_factory.h"

namespace base {
class TaskRunner;
}

namespace asar {

class Archive;

class AsarProtocolHandler : public net::URLRequestJobFactory::ProtocolHandler {
 public:
  explicit AsarProtocolHandler(
      const scoped_refptr<base::TaskRunner>& file_task_runner);
  virtual ~AsarProtocolHandler();

  Archive* GetOrCreateAsarArchive(const base::FilePath& path) const;

  // net::URLRequestJobFactory::ProtocolHandler:
  virtual net::URLRequestJob* MaybeCreateJob(
      net::URLRequest* request,
      net::NetworkDelegate* network_delegate) const OVERRIDE;
  virtual bool IsSafeRedirectTarget(const GURL& location) const OVERRIDE;

 private:
  const scoped_refptr<base::TaskRunner> file_task_runner_;

  mutable base::ScopedPtrHashMap<base::FilePath, Archive> archives_;

  DISALLOW_COPY_AND_ASSIGN(AsarProtocolHandler);
};

}  // namespace asar

#endif  // ATOM_BROWSER_NET_ASAR_ASAR_PROTOCOL_HANDLER_H_
