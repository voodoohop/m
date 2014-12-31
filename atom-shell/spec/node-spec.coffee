assert        = require 'assert'
child_process = require 'child_process'
fs            = require 'fs'
path          = require 'path'
os            = require 'os'
remote        = require 'remote'

describe 'node feature', ->
  fixtures = path.join __dirname, 'fixtures'

  describe 'child_process', ->
    describe 'child_process.fork', ->
      it 'works in current process', (done) ->
        child = child_process.fork path.join(fixtures, 'module', 'ping.js')
        child.on 'message', (msg) ->
          assert.equal msg, 'message'
          done()
        child.send 'message'

      it 'works in forked process', (done) ->
        child = child_process.fork path.join(fixtures, 'module', 'fork_ping.js')
        child.on 'message', (msg) ->
          assert.equal msg, 'message'
          done()
        child.send 'message'

      it 'works in forked process when options.env is specifed', (done) ->
        child = child_process.fork path.join(fixtures, 'module', 'fork_ping.js'),
                                   [],
                                   path: process.env['PATH']
        child.on 'message', (msg) ->
          assert.equal msg, 'message'
          done()
        child.send 'message'

      it 'works in browser process', (done) ->
        fork = remote.require('child_process').fork
        child = fork path.join(fixtures, 'module', 'ping.js')
        child.on 'message', (msg) ->
          assert.equal msg, 'message'
          done()
        child.send 'message'

  describe 'contexts', ->
    describe 'setTimeout in fs callback', ->
      it 'does not crash', (done) ->
        fs.readFile __filename, ->
          setTimeout done, 0

    describe 'setTimeout in pure uv callback', ->
      it 'does not crash', (done) ->
        process.scheduleCallback ->
          setTimeout done, 0

    describe 'throw error in node context', ->
      it 'gets caught', (done) ->
        error = new Error('boo!')
        lsts = process.listeners 'uncaughtException'
        process.removeAllListeners 'uncaughtException'
        process.on 'uncaughtException', (err) ->
          process.removeAllListeners 'uncaughtException'
          for lst in lsts
            process.on 'uncaughtException', lst
          done()
        fs.readFile __filename, ->
          throw error

    describe 'setTimeout called under Chromium event loop in browser process', ->
      it 'can be scheduled in time', (done) ->
        remote.getGlobal('setTimeout')(done, 0)

    describe 'setInterval called under Chromium event loop in browser process', ->
      it 'can be scheduled in time', (done) ->
        clear = ->
          remote.getGlobal('clearInterval')(interval)
          done()
        interval = remote.getGlobal('setInterval')(clear, 10)

  describe 'message loop', ->
    describe 'process.nextTick', ->
      it 'emits the callback', (done) ->
        process.nextTick done

      it 'works in nested calls', (done) ->
        process.nextTick ->
          process.nextTick ->
            process.nextTick done

    describe 'setImmediate', ->
      it 'emits the callback', (done) ->
        setImmediate done

      it 'works in nested calls', (done) ->
        setImmediate ->
          setImmediate ->
            setImmediate done

  describe 'net.connect', ->
    return unless process.platform is 'darwin'

    it 'emit error when connect to a socket path without listeners', (done) ->
      socketPath = path.join os.tmpdir(), 'atom-shell-test.sock'
      script = path.join(fixtures, 'module', 'create_socket.js')
      child = child_process.fork script, [socketPath]
      child.on 'exit', (code) ->
        assert.equal code, 0
        client = require('net').connect socketPath
        client.on 'error', (error) ->
          assert.equal error.code, 'ECONNREFUSED'
          done()

  describe 'Buffer', ->
    it 'can be created from WebKit external string', ->
      p = document.createElement 'p'
      p.innerText = '闲云潭影日悠悠，物换星移几度秋'
      b = new Buffer(p.innerText)
      assert.equal b.toString(), '闲云潭影日悠悠，物换星移几度秋'
      assert.equal Buffer.byteLength(p.innerText), 45
