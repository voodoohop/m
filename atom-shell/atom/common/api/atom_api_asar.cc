// Copyright (c) 2014 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include <vector>

#include "atom/common/asar/archive.h"
#include "atom/common/native_mate_converters/file_path_converter.h"
#include "native_mate/arguments.h"
#include "native_mate/dictionary.h"
#include "native_mate/object_template_builder.h"
#include "native_mate/wrappable.h"

#include "atom/common/node_includes.h"

namespace {

class Archive : public mate::Wrappable {
 public:
  static v8::Handle<v8::Value> Create(v8::Isolate* isolate,
                                      const base::FilePath& path) {
    scoped_ptr<asar::Archive> archive(new asar::Archive(path));
    if (!archive->Init())
      return v8::False(isolate);
    return (new Archive(archive.Pass()))->GetWrapper(isolate);
  }

 protected:
  explicit Archive(scoped_ptr<asar::Archive> archive)
      : archive_(archive.Pass()) {}

  // Reads the offset and size of file.
  v8::Handle<v8::Value> GetFileInfo(v8::Isolate* isolate,
                                    const base::FilePath& path) {
    asar::Archive::FileInfo info;
    if (!archive_ || !archive_->GetFileInfo(path, &info))
      return v8::False(isolate);
    mate::Dictionary dict(isolate, v8::Object::New(isolate));
    dict.Set("size", info.size);
    dict.Set("offset", info.offset);
    return dict.GetHandle();
  }

  // Returns a fake result of fs.stat(path).
  v8::Handle<v8::Value> Stat(v8::Isolate* isolate,
                             const base::FilePath& path) {
    asar::Archive::Stats stats;
    if (!archive_ || !archive_->Stat(path, &stats))
      return v8::False(isolate);
    mate::Dictionary dict(isolate, v8::Object::New(isolate));
    dict.Set("size", stats.size);
    dict.Set("offset", stats.offset);
    dict.Set("isFile", stats.is_file);
    dict.Set("isDirectory", stats.is_directory);
    dict.Set("isLink", stats.is_link);
    return dict.GetHandle();
  }

  // Returns all files under a directory.
  v8::Handle<v8::Value> Readdir(v8::Isolate* isolate,
                                const base::FilePath& path) {
    std::vector<base::FilePath> files;
    if (!archive_ || !archive_->Readdir(path, &files))
      return v8::False(isolate);
    return mate::ConvertToV8(isolate, files);
  }

  // Returns the path of file with symbol link resolved.
  v8::Handle<v8::Value> Realpath(v8::Isolate* isolate,
                                 const base::FilePath& path) {
    base::FilePath realpath;
    if (!archive_ || !archive_->Realpath(path, &realpath))
      return v8::False(isolate);
    return mate::ConvertToV8(isolate, realpath);
  }

  // Copy the file out into a temporary file and returns the new path.
  v8::Handle<v8::Value> CopyFileOut(v8::Isolate* isolate,
                                    const base::FilePath& path) {
    base::FilePath new_path;
    if (!archive_ || !archive_->CopyFileOut(path, &new_path))
      return v8::False(isolate);
    return mate::ConvertToV8(isolate, new_path);
  }

  // Free the resources used by archive.
  void Destroy() {
    archive_.reset();
  }

  // mate::Wrappable:
  mate::ObjectTemplateBuilder GetObjectTemplateBuilder(v8::Isolate* isolate) {
    return mate::ObjectTemplateBuilder(isolate)
        .SetValue("path", archive_->path())
        .SetMethod("getFileInfo", &Archive::GetFileInfo)
        .SetMethod("stat", &Archive::Stat)
        .SetMethod("readdir", &Archive::Readdir)
        .SetMethod("realpath", &Archive::Realpath)
        .SetMethod("copyFileOut", &Archive::CopyFileOut)
        .SetMethod("destroy", &Archive::Destroy);
  }

 private:
  scoped_ptr<asar::Archive> archive_;

  DISALLOW_COPY_AND_ASSIGN(Archive);
};

void Initialize(v8::Handle<v8::Object> exports, v8::Handle<v8::Value> unused,
                v8::Handle<v8::Context> context, void* priv) {
  mate::Dictionary dict(context->GetIsolate(), exports);
  dict.SetMethod("createArchive", &Archive::Create);
}

}  // namespace

NODE_MODULE_CONTEXT_AWARE_BUILTIN(atom_common_asar, Initialize)
