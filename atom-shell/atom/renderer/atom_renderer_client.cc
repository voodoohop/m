// Copyright (c) 2013 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "atom/renderer/atom_renderer_client.h"

#include <algorithm>
#include <string>

#include "atom/common/node_bindings.h"
#include "atom/common/options_switches.h"
#include "atom/renderer/api/atom_renderer_bindings.h"
#include "atom/renderer/atom_render_view_observer.h"
#include "chrome/renderer/printing/print_web_view_helper.h"
#include "chrome/renderer/tts_dispatcher.h"
#include "content/public/common/content_constants.h"
#include "content/public/renderer/render_frame.h"
#include "content/public/renderer/render_frame_observer.h"
#include "content/public/renderer/render_thread.h"
#include "base/command_line.h"
#include "native_mate/converter.h"
#include "third_party/WebKit/public/web/WebCustomElement.h"
#include "third_party/WebKit/public/web/WebFrame.h"
#include "third_party/WebKit/public/web/WebPluginParams.h"
#include "third_party/WebKit/public/web/WebKit.h"
#include "third_party/WebKit/public/web/WebRuntimeFeatures.h"

#include "atom/common/node_includes.h"

namespace atom {

namespace {

bool IsSwitchEnabled(base::CommandLine* command_line,
                     const char* switch_string,
                     bool* enabled) {
  std::string value = command_line->GetSwitchValueASCII(switch_string);
  if (value == "true")
    *enabled = true;
  else if (value == "false")
    *enabled = false;
  else
    return false;
  return true;
}

// Helper class to forward the WillReleaseScriptContext message to the client.
class AtomRenderFrameObserver : public content::RenderFrameObserver {
 public:
  AtomRenderFrameObserver(content::RenderFrame* frame,
                          AtomRendererClient* renderer_client)
      : content::RenderFrameObserver(frame),
        renderer_client_(renderer_client) {}

  // content::RenderFrameObserver:
  virtual void WillReleaseScriptContext(v8::Handle<v8::Context> context,
                                        int world_id) OVERRIDE {
    renderer_client_->WillReleaseScriptContext(
        render_frame()->GetWebFrame(), context, world_id);
  }

 private:
  AtomRendererClient* renderer_client_;

  DISALLOW_COPY_AND_ASSIGN(AtomRenderFrameObserver);
};

}  // namespace

AtomRendererClient::AtomRendererClient()
    : node_bindings_(NodeBindings::Create(false)),
      atom_bindings_(new AtomRendererBindings),
      main_frame_(NULL) {
}

AtomRendererClient::~AtomRendererClient() {
}

void AtomRendererClient::WebKitInitialized() {
  EnableWebRuntimeFeatures();

  blink::WebCustomElement::addEmbedderCustomElementName("webview");
  blink::WebCustomElement::addEmbedderCustomElementName("browserplugin");

  node_bindings_->Initialize();
  node_bindings_->PrepareMessageLoop();

  DCHECK(!global_env);

  // Create a default empty environment which would be used when we need to
  // run V8 code out of a window context (like running a uv callback).
  v8::Isolate* isolate = blink::mainThreadIsolate();
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context = v8::Context::New(isolate);
  global_env = node::Environment::New(context, uv_default_loop());
}

void AtomRendererClient::RenderThreadStarted() {
  content::RenderThread::Get()->AddObserver(this);
}

void AtomRendererClient::RenderFrameCreated(
    content::RenderFrame* render_frame) {
  new AtomRenderFrameObserver(render_frame, this);
}

void AtomRendererClient::RenderViewCreated(content::RenderView* render_view) {
  new printing::PrintWebViewHelper(render_view);
  new AtomRenderViewObserver(render_view, this);
}

blink::WebSpeechSynthesizer* AtomRendererClient::OverrideSpeechSynthesizer(
    blink::WebSpeechSynthesizerClient* client) {
  return new TtsDispatcher(client);
}

bool AtomRendererClient::OverrideCreatePlugin(
    content::RenderFrame* render_frame,
    blink::WebLocalFrame* frame,
    const blink::WebPluginParams& params,
    blink::WebPlugin** plugin) {
  base::CommandLine* command_line = base::CommandLine::ForCurrentProcess();
  if (params.mimeType.utf8() == content::kBrowserPluginMimeType ||
      command_line->HasSwitch(switches::kEnablePlugins))
    return false;

  *plugin = nullptr;
  return true;
}

void AtomRendererClient::DidCreateScriptContext(blink::WebFrame* frame,
                                                v8::Handle<v8::Context> context,
                                                int extension_group,
                                                int world_id) {
  // The first web frame is the main frame.
  if (main_frame_ == NULL)
    main_frame_ = frame;

  v8::Context::Scope scope(context);

  // Check the existance of process object to prevent duplicate initialization.
  if (context->Global()->Has(
        mate::StringToV8(context->GetIsolate(), "process")))
    return;

  // Give the node loop a run to make sure everything is ready.
  node_bindings_->RunMessageLoop();

  // Setup node environment for each window.
  node::Environment* env = node_bindings_->CreateEnvironment(context);

  // Add atom-shell extended APIs.
  atom_bindings_->BindToFrame(frame);

  // Store the created environment.
  web_page_envs_.push_back(env);

  // Make uv loop being wrapped by window context.
  if (node_bindings_->uv_env() == NULL)
    node_bindings_->set_uv_env(env);
}

void AtomRendererClient::WillReleaseScriptContext(
    blink::WebLocalFrame* frame,
    v8::Handle<v8::Context> context,
    int world_id) {
  node::Environment* env = node::Environment::GetCurrent(context);
  if (env == NULL) {
    LOG(ERROR) << "Encounter a non-node context when releasing script context";
    return;
  }

  // Clear the environment.
  web_page_envs_.erase(
      std::remove(web_page_envs_.begin(), web_page_envs_.end(), env),
      web_page_envs_.end());

  // Notice that we are not disposing the environment object here, because there
  // may still be pending uv operations in the uv loop, and when they got done
  // they would be needing the original environment.
  // So we are leaking the environment object here, just like Chrome leaking the
  // memory :) . Since it's only leaked when refreshing or unloading, so as long
  // as we make sure renderer process is restared then the memory would not be
  // leaked.
  // env->Dispose();

  // Wrap the uv loop with another environment.
  if (env == node_bindings_->uv_env()) {
    node::Environment* env = web_page_envs_.size() > 0 ? web_page_envs_[0] :
                                                         NULL;
    node_bindings_->set_uv_env(env);
  }
}

bool AtomRendererClient::ShouldFork(blink::WebFrame* frame,
                                    const GURL& url,
                                    const std::string& http_method,
                                    bool is_initial_navigation,
                                    bool is_server_redirect,
                                    bool* send_referrer) {
  // Never fork renderer process for guests.
  if (frame->uniqueName().utf8() == "ATOM_SHELL_GUEST_WEB_VIEW")
    return false;

  // Handle all the navigations and reloads in browser.
  // FIXME We only support GET here because http method will be ignored when
  // the OpenURLFromTab is triggered, which means form posting would not work,
  // we should solve this by patching Chromium in future.
  return http_method == "GET";
}

void AtomRendererClient::EnableWebRuntimeFeatures() {
  base::CommandLine* command_line = base::CommandLine::ForCurrentProcess();
  bool b;
  if (IsSwitchEnabled(command_line, switches::kExperimentalFeatures, &b))
    blink::WebRuntimeFeatures::enableExperimentalFeatures(b);
  if (IsSwitchEnabled(command_line, switches::kExperimentalCanvasFeatures, &b))
    blink::WebRuntimeFeatures::enableExperimentalCanvasFeatures(b);
  if (IsSwitchEnabled(command_line, switches::kSubpixelFontScaling, &b))
    blink::WebRuntimeFeatures::enableSubpixelFontScaling(b);
  if (IsSwitchEnabled(command_line, switches::kOverlayScrollbars, &b))
    blink::WebRuntimeFeatures::enableOverlayScrollbars(b);
  if (IsSwitchEnabled(command_line, switches::kOverlayFullscreenVideo, &b))
    blink::WebRuntimeFeatures::enableOverlayFullscreenVideo(b);
  if (IsSwitchEnabled(command_line, switches::kSharedWorker, &b))
    blink::WebRuntimeFeatures::enableSharedWorker(b);
}

}  // namespace atom
