assert = require 'assert'
ipc    = require 'ipc'
path   = require 'path'
remote = require 'remote'

BrowserWindow = remote.require 'browser-window'

describe 'ipc module', ->
  fixtures = path.join __dirname, 'fixtures'

  describe 'remote.require', ->
    it 'should returns same object for the same module', ->
      dialog1 = remote.require 'dialog'
      dialog2 = remote.require 'dialog'
      assert.equal dialog1, dialog2

    it 'should work when object contains id property', ->
      a = remote.require path.join(fixtures, 'module', 'id.js')
      assert.equal a.id, 1127

    it 'should search module from the user app', ->
      assert.equal path.normalize(remote.process.mainModule.filename), path.resolve(__dirname, 'static', 'main.js')
      assert.equal path.normalize(remote.process.mainModule.paths[0]), path.resolve(__dirname, 'static', 'node_modules')

  describe 'remote.createFunctionWithReturnValue', ->
    it 'should be called in browser synchronously', ->
      buf = new Buffer('test')
      call = remote.require path.join(fixtures, 'module', 'call.js')
      result = call.call remote.createFunctionWithReturnValue(buf)
      assert.equal result.constructor.name, 'Buffer'

  describe 'remote object in renderer', ->
    it 'can change its properties', ->
      property = remote.require path.join(fixtures, 'module', 'property.js')
      assert.equal property.property, 1127
      property.property = 1007
      assert.equal property.property, 1007
      property2 = remote.require path.join(fixtures, 'module', 'property.js')
      assert.equal property2.property, 1007

      # Restore.
      property.property = 1127

    it 'can construct an object from its member', ->
      call = remote.require path.join(fixtures, 'module', 'call.js')
      obj = new call.constructor
      assert.equal obj.test, 'test'

  describe 'remote value in browser', ->
    it 'keeps its constructor name for objects', ->
      buf = new Buffer('test')
      print_name = remote.require path.join(fixtures, 'module', 'print_name.js')
      assert.equal print_name.print(buf), 'Buffer'

  describe 'ipc.sender.send', ->
    it 'should work when sending an object containing id property', (done) ->
      obj = id: 1, name: 'ly'
      ipc.once 'message', (message) ->
        assert.deepEqual message, obj
        done()
      ipc.send 'message', obj

    it 'should work when sending the same object twice in one message', (done) ->
      obj = key: 'some'
      ipc.once 'message', (message) ->
        assert.deepEqual message[0], obj
        assert.deepEqual message[1], obj
        done()
      ipc.send 'message', [obj, obj]

  describe 'ipc.sendSync', ->
    it 'can be replied by setting event.returnValue', ->
      msg = ipc.sendSync 'echo', 'test'
      assert.equal msg, 'test'

    it 'does not crash when reply is not sent and browser is destroyed', (done) ->
      w = new BrowserWindow(show: false)
      remote.require('ipc').once 'send-sync-message', (event) ->
        event.returnValue = null
        w.destroy()
        done()
      w.loadUrl 'file://' + path.join(fixtures, 'api', 'send-sync-message.html')
