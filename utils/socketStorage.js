const redis = require('./redis')
const log = require('../logger')

// Stores connected user id and his socket clients
function getKey(userId) {
  return userId + process.env.SOCKET_STORAGE_POSTFIX
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
  let pattern = '*' + process.env.SOCKET_STORAGE_POSTFIX

  return redis
    .keys(pattern)
    .then(keys => {
      if (!keys || (keys && keys.length < 1)) {
        return Promise.reject('REDIS alredy clean from sockets')
      }
      return redis.del(keys)
    })
    .then(nr => {
      log.info('cleaned disconnected sockets from REDIS (' + nr + ')')
    })
    .catch(err => {
      log.warning(err)
    })
}

exports.getClients = function(userId) {
  let key = getKey(userId)

  return redis.smembers(key).then(clients => clients)
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
