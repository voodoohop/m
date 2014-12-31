// Copyright (c) 2013 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_RENDERER_ATOM_RENDERER_CLIENT_H_
#define ATOM_RENDERER_ATOM_RENDERER_CLIENT_H_

#include <string>
#include <vector>

#include "content/public/renderer/content_renderer_client.h"
#include "content/public/renderer/render_process_observer.h"

namespace node {
class Environment;
}

namespace atom {

class AtomRendererBindings;
class NodeBindings;

class AtomRendererClient : public content::ContentRendererClient,
                           public content::RenderProcessObserver {
 public:
  AtomRendererClient();
  virtual ~AtomRendererClient();

  // Forwarded by RenderFrameObserver.
  void WillReleaseScriptContext(blink::WebLocalFrame* frame,
                                v8::Handle<v8::Context> context,
                                int world_id);

  AtomRendererBindings* atom_bindings() const { return atom_bindings_.get(); }

 private:
  enum NodeIntegration {
    ALL,
    EXCEPT_IFRAME,
    MANUAL_ENABLE_IFRAME,
    DISABLE,
  };

  // content::RenderProcessObserver:
  virtual void WebKitInitialized() OVERRIDE;

  // content::ContentRendererClient:
  void RenderThreadStarted() override;
  void RenderFrameCreated(content::RenderFrame* render_frame) override;
  void RenderViewCreated(content::RenderView*) override;
  blink::WebSpeechSynthesizer* OverrideSpeechSynthesizer(
      blink::WebSpeechSynthesizerClient* client) override;
  bool OverrideCreatePlugin(content::RenderFrame* render_frame,
                            blink::WebLocalFrame* frame,
                            const blink::WebPluginParams& params,
                            blink::WebPlugin** plugin) override;
  void DidCreateScriptContext(blink::WebFrame* frame,
                              v8::Handle<v8::Context> context,
                              int extension_group,
                              int world_id) override;
  bool ShouldFork(blink::WebFrame* frame,
                  const GURL& url,
                  const std::string& http_method,
                  bool is_initial_navigation,
                  bool is_server_redirect,
                  bool* send_referrer) override;

  void EnableWebRuntimeFeatures();

  std::vector<node::Environment*> web_page_envs_;

  scoped_ptr<NodeBindings> node_bindings_;
  scoped_ptr<AtomRendererBindings> atom_bindings_;

  // The main frame.
  blink::WebFrame* main_frame_;

  DISALLOW_COPY_AND_ASSIGN(AtomRendererClient);
};

}  // namespace atom

#endif  // ATOM_RENDERER_ATOM_RENDERER_CLIENT_H_