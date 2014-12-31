assert   = require 'assert'
ipc      = require 'ipc'
path     = require 'path'
remote   = require 'remote'
protocol = remote.require 'protocol'

describe 'protocol module', ->
  describe 'protocol.registerProtocol', ->
    it 'throws error when scheme is already registered', (done) ->
      register = -> protocol.registerProtocol('test1', ->)
      protocol.once 'registered', (event, scheme) ->
        assert.equal scheme, 'test1'
        assert.throws register, /The scheme is already registered/
        protocol.unregisterProtocol 'test1'
        done()
      register()

    it 'calls the callback when scheme is visited', (done) ->
      protocol.registerProtocol 'test2', (request) ->
        assert.equal request.url, 'test2://test2'
        protocol.unregisterProtocol 'test2'
        done()
      $.get 'test2://test2', ->

  describe 'protocol.unregisterProtocol', ->
    it 'throws error when scheme does not exist', ->
      unregister = -> protocol.unregisterProtocol 'test3'
      assert.throws unregister, /The scheme has not been registered/

  describe 'registered protocol callback', ->
    it 'returns string should send the string as request content', (done) ->
      handler = remote.createFunctionWithReturnValue 'valar morghulis'
      protocol.registerProtocol 'atom-string', handler

      $.ajax
        url: 'atom-string://fake-host'
        success: (data) ->
          assert.equal data, handler()
          protocol.unregisterProtocol 'atom-string'
          done()
        error: (xhr, errorType, error) ->
          assert false, 'Got error: ' + errorType + ' ' + error
          protocol.unregisterProtocol 'atom-string'

    it 'returns RequestStringJob should send string', (done) ->
      data = 'valar morghulis'
      job = new protocol.RequestStringJob(mimeType: 'text/html', data: data)
      handler = remote.createFunctionWithReturnValue job
      protocol.registerProtocol 'atom-string-job', handler

      $.ajax
        url: 'atom-string-job://fake-host'
        success: (response) ->
          assert.equal response, data
          protocol.unregisterProtocol 'atom-string-job'
          done()
        error: (xhr, errorType, error) ->
          assert false, 'Got error: ' + errorType + ' ' + error
          protocol.unregisterProtocol 'atom-string-job'

    it 'returns RequestFileJob should send file', (done) ->
      job = new protocol.RequestFileJob(__filename)
      handler = remote.createFunctionWithReturnValue job
      protocol.registerProtocol 'atom-file-job', handler

      $.ajax
        url: 'atom-file-job://' + __filename
        success: (data) ->
          content = require('fs').readFileSync __filename
          assert.equal data, String(content)
          protocol.unregisterProtocol 'atom-file-job'
          done()
        error: (xhr, errorType, error) ->
          assert false, 'Got error: ' + errorType + ' ' + error
          protocol.unregisterProtocol 'atom-file-job'

  describe 'protocol.isHandledProtocol', ->
    it 'returns true if the scheme can be handled', ->
      assert.equal protocol.isHandledProtocol('file'), true
      assert.equal protocol.isHandledProtocol('http'), true
      assert.equal protocol.isHandledProtocol('https'), true
      assert.equal protocol.isHandledProtocol('atom'), false

  describe 'protocol.interceptProtocol', ->
    it 'throws error when scheme is not a registered one', ->
      register = -> protocol.interceptProtocol('test-intercept', ->)
      assert.throws register, /Scheme does not exist/

    it 'throws error when scheme is a custom protocol', (done) ->
      protocol.once 'unregistered', (event, scheme) ->
        assert.equal scheme, 'atom'
        done()
      protocol.once 'registered', (event, scheme) ->
        assert.equal scheme, 'atom'
        register = -> protocol.interceptProtocol('test-intercept', ->)
        assert.throws register, /Scheme does not exist/
        protocol.unregisterProtocol scheme
      protocol.registerProtocol('atom', ->)

    it 'returns original job when callback returns nothing', (done) ->
      targetScheme = 'file'
      protocol.once 'intercepted', (event, scheme) ->
        assert.equal scheme, targetScheme
        free = -> protocol.uninterceptProtocol targetScheme
        $.ajax
          url: "#{targetScheme}://#{__filename}",
          success: ->
            protocol.once 'unintercepted', (event, scheme) ->
              assert.equal scheme, targetScheme
              done()
            free()
          error: (xhr, errorType, error) ->
            free()
            assert false, 'Got error: ' + errorType + ' ' + error
      protocol.interceptProtocol targetScheme, (request) ->
        if process.platform is 'win32'
          pathInUrl = path.normalize request.url.substr(8)
          assert.equal pathInUrl.toLowerCase(), __filename.toLowerCase()
        else
          assert.equal request.url, "#{targetScheme}://#{__filename}"

    it 'can override original protocol handler', (done) ->
      handler = remote.createFunctionWithReturnValue 'valar morghulis'
      protocol.once 'intercepted', ->
        free = -> protocol.uninterceptProtocol 'file'
        $.ajax
          url: 'file://fake-host'
          success: (data) ->
            protocol.once 'unintercepted', ->
              assert.equal data, handler()
              done()
            free()
          error: (xhr, errorType, error) ->
            assert false, 'Got error: ' + errorType + ' ' + error
            free()
      protocol.interceptProtocol 'file', handler
