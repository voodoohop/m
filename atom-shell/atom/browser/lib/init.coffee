fs     = require 'fs'
path   = require 'path'
module = require 'module'
util   = require 'util'

# Expose information of current process.
process.type = 'browser'
process.resourcesPath = path.resolve process.argv[1], '..', '..', '..', '..'

# We modified the original process.argv to let node.js load the atom.js,
# we need to restore it here.
process.argv.splice 1, 1

# Pick out switches appended by atom-shell.
startMark = process.argv.indexOf '--atom-shell-switches-start'
endMark = process.argv.indexOf '--atom-shell-switches-end'
# And --force-device-scale-factor on Linux.
endMark++ if process.platform is 'linux'
process.argv.splice startMark, endMark - startMark + 1

# Add browser/api/lib to require's search paths,
# which contains javascript part of Atom's built-in libraries.
globalPaths = module.globalPaths
globalPaths.push path.join process.resourcesPath, 'atom', 'browser', 'api', 'lib'

# Following operations need extra bindings by AtomBindings.
process.once 'BIND_DONE', ->
  # Import common settings.
  require path.resolve(__dirname, '..', '..', 'common', 'lib', 'init.js')

  if process.platform is 'win32'
    # Redirect node's console to use our own implementations, since node can not
    # handle console output when running as GUI program.
    print = (args...) ->
      process.log util.format(args...)
    console.log = console.error = console.warn = print
    process.stdout.write = process.stderr.write = print

    # Always returns EOF for stdin stream.
    Readable = require('stream').Readable
    stdin = new Readable
    stdin.push null
    process.__defineGetter__ 'stdin', -> stdin

  # Don't quit on fatal error.
  process.on 'uncaughtException', (error) ->
    # Show error in GUI.
    stack = error.stack ? "#{error.name}: #{error.message}"
    message = "Uncaught Exception:\n#{stack}"
    require('dialog').showErrorBox 'A JavaScript error occured in the browser process', message

  # Emit 'exit' event on quit.
  require('app').on 'quit', ->
    process.emit 'exit'

  # Load the RPC server.
  require './rpc-server'

  # Load the guest view manager.
  require './guest-view-manager'
  require './guest-window-manager'

  # Now we try to load app's package.json.
  packageJson = null

  searchPaths = [ 'app', 'app.asar', 'default_app' ]
  for packagePath in searchPaths
    try
      packagePath = path.join process.resourcesPath, packagePath
      packageJson = JSON.parse(fs.readFileSync(path.join(packagePath, 'package.json')))
      break
    catch e
      continue

  throw new Error("Unable to find a valid app") unless packageJson?

  # Set application's version.
  app = require 'app'
  app.setVersion packageJson.version if packageJson.version?

  # Set application's name.
  if packageJson.productName?
    app.setName packageJson.productName
  else if packageJson.name?
    app.setName packageJson.name

  # Set application's desktop name.
  if packageJson.desktopName?
    app.setDesktopName packageJson.desktopName
  else
    app.setDesktopName '#{app.getName()}.desktop'

  # Load the chrome extension support.
  require './chrome-extension.js'

  # Finally load app's main.js and transfer control to C++.
  module._load path.join(packagePath, packageJson.main), module, true
