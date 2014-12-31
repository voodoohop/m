app  = require 'app'
fs   = require 'fs'
path = require 'path'
url  = require 'url'

# Mapping between hostname and file path.
hostPathMap = {}
hostPathMapNextKey = 0

getHostForPath = (path) ->
  key = "extension-#{++hostPathMapNextKey}"
  hostPathMap[key] = path
  key

getPathForHost = (host) ->
  hostPathMap[host]

# Cache extensionInfo.
extensionInfoMap = {}

getExtensionInfoFromPath = (srcDirectory) ->
  manifest = JSON.parse fs.readFileSync(path.join(srcDirectory, 'manifest.json'))
  unless extensionInfoMap[manifest.name]?
    # We can not use 'file://' directly because all resources in the extension
    # will be treated as relative to the root in Chrome.
    page = url.format
      protocol: 'chrome-extension'
      slashes: true
      hostname: getHostForPath srcDirectory
      pathname: manifest.devtools_page
    extensionInfoMap[manifest.name] =
      startPage: page
      name: manifest.name
      srcDirectory: srcDirectory
  extensionInfoMap[manifest.name]

# Load persistented extensions.
loadedExtensionsPath = path.join app.getDataPath(), 'DevTools Extensions'

try
  loadedExtensions = JSON.parse fs.readFileSync(loadedExtensionsPath)
  loadedExtensions = [] unless Array.isArray loadedExtensions
  # Preheat the extensionInfo cache.
  getExtensionInfoFromPath srcDirectory for srcDirectory in loadedExtensions
catch e

# Persistent loaded extensions.
app.on 'will-quit', ->
  try
    loadedExtensions = Object.keys(extensionInfoMap).map (key) -> extensionInfoMap[key].srcDirectory
    try
      fs.mkdirSync path.dirname(loadedExtensionsPath)
    catch e
    fs.writeFileSync loadedExtensionsPath, JSON.stringify(loadedExtensions)
  catch e

# We can not use protocol or BrowserWindow until app is ready.
app.once 'ready', ->
  protocol = require 'protocol'
  BrowserWindow = require 'browser-window'

  # The chrome-extension: can map a extension URL request to real file path.
  protocol.registerProtocol 'chrome-extension', (request) ->
    parsed = url.parse request.url
    return unless parsed.hostname and parsed.path?
    return unless /extension-\d+/.test parsed.hostname

    directory = getPathForHost parsed.hostname
    return unless directory?
    return new protocol.RequestFileJob(path.join(directory, parsed.path))

  BrowserWindow::_loadDevToolsExtensions = (extensionInfoArray) ->
    @devToolsWebContents?.executeJavaScript "WebInspector.addExtensions(#{JSON.stringify(extensionInfoArray)});"

  BrowserWindow.addDevToolsExtension = (srcDirectory) ->
    extensionInfo = getExtensionInfoFromPath srcDirectory
    window._loadDevToolsExtensions [extensionInfo] for window in BrowserWindow.getAllWindows()
    extensionInfo.name

  BrowserWindow.removeDevToolsExtension = (name) ->
    delete extensionInfoMap[name]

  # Load persistented extensions when devtools is opened.
  init = BrowserWindow::_init
  BrowserWindow::_init = ->
    init.call this
    @on 'devtools-opened', ->
      @_loadDevToolsExtensions Object.keys(extensionInfoMap).map (key) -> extensionInfoMap[key]
