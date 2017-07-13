const redis = require('./redis')
const log = require('../logger')
const Promise = require('bluebird')

//Stores connected user id and his socket clients
//userid-sockets
function getKey(userId) {
  return userId + process.env.SOCKET_REDIS_POSTFIX
}

exports.addClient = function(userId, socketId) {
  let key = getKey(userId)

  return redis
    .sadd(key, socketId)
    .then(() => {
      return redis.scard(key).then(count => {
        log.info(userId + ' connected socket ' + socketId + ' (' + count + ')')
      })
    })
    .catch(err => {
      log.error(err)
    })
}

exports.cleanClients = function() {
  let pattern = '*' + process.env.SOCKET_REDIS_POSTFIX

  return redis
    .keys(pattern)
    .then(keys => {
      if (!keys || (keys && keys.length < 1)) {
        return Promise.resolve(0)
      }
      return redis.del(keys)
    })
    .then(nr => {
      log.info('cleaned disconnected sockets from REDIS (' + nr + ')')
    })
    .catch(err => {
      log.error(err)
    })
}

exports.getUserClients = function(userId) {
  let key = getKey(userId)
  return redis.smembers(key)
}

exports.removeClient = function(userId, socketId) {
  let key = getKey(userId)

  return redis
    .srem(key, socketId)
    .then(() => {
      return redis.scard(key).then(count => {
        log.info(
          userId + ' disconnected socket ' + socketId + ' (' + count + ')'
        )
      })
    })
    .catch(err => {
      log.error(err)
    })
}
