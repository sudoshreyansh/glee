const Ajv = require('ajv')
const betterAjvErrors = require('better-ajv-errors')
const { pathToRegexp } = require('path-to-regexp')
const Message = require('./message')

const util = module.exports

/**
 * Duplicates a GleeMessage.
 *
 * @param {GleeMessage} message The message to duplicate.
 * @return {GleeMessage}
 */
util.duplicateMessage = (message) => {
  const newMessage = new Message({
    payload: message.payload,
    headers: message.headers,
    channel: message.channel,
    serverName: message.serverName,
    connection: message.connection,
    broadcast: message.broadcast,
  })

  if (message.inbound) {
    newMessage.setInbound()
  } else {
    newMessage.setOutbound()
  }
  
  return newMessage
}

/**
 * Determines if a path matches a channel.
 *
 * @param {String} path The path.
 * @param {String} channel The channel.
 * @return {Boolean}
 */
util.matchchannel = (path, channel) => {
  return (this.getParams(path, channel) !== null)
}

/**
 * Determines if a path matches a channel, and returns an array of matching params.
 *
 * @param {String} path The path.
 * @param {String} channel The channel.
 * @return {Object|null}
 */
util.getParams = (path, channel) => {
  if (path === undefined) return {}

  const keys = []
  const re = pathToRegexp(path, keys)
  const result = re.exec(channel)

  if (result === null) return null

  return keys.map((key, index) => ({ [key.name]: result[index+1] })).reduce((prev, val) => ({
    ...prev,
    ...val,
  }), {})
}

/**
 * Validates data against a given JSON Schema definition
 * @param {Any} data The data to validate
 * @param {Object} schema A JSON Schema definition
 * @returns Object
 */
util.validateData = (data, schema) => {
  const ajv = new Ajv({ allErrors: true, strictSchema: false, jsonPointers: true })
  const validation = ajv.compile(schema)
  const isValid = validation(data)
  let errors, humanReadableError
  if (!isValid) {
    humanReadableError = betterAjvErrors(schema, data, validation.errors, {
      format: 'cli',
      indent: 2,
    })
    errors = betterAjvErrors(schema, data, validation.errors, {
      format: 'js',
    })
  }
  return {
    errors,
    humanReadableError,
    isValid,
  }
}