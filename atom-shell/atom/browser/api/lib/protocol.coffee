app = require 'app'
throw new Error('Can not initialize protocol module before app is ready') unless app.isReady()

protocol = process.atomBinding('protocol').protocol
EventEmitter = require('events').EventEmitter

protocol.__proto__ = EventEmitter.prototype

protocol.RequestStringJob =
class RequestStringJob
  constructor: ({mimeType, charset, data}) ->
    if typeof data isnt 'string' and not data instanceof Buffer
      throw new TypeError('Data should be string or Buffer')

    @mimeType = mimeType ? 'text/plain'
    @charset = charset ? 'UTF-8'
    @data = String data

protocol.RequestFileJob =
class RequestFileJob
  constructor: (@path) ->

module.exports = protocol
