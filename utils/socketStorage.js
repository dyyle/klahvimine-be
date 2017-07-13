const log = require('../logger')
const Promise = require('bluebird')
const Socket = require('../models/Socket')

//Stores connected user id and his socket clients

exports.addClient = function(userId, socketId) {
  let newSocket = new Socket({
    userId: userId,
    socketId: socketId
  })

  return newSocket
    .save()
    .then(() => {
      return Socket.count({ userId: userId })
    })
    .then(count => {
      log.info(userId + ' connected socket ' + socketId + ' (' + count + ')')
    })
    .catch(err => {
      log.error(err)
    })
}

exports.cleanClients = function() {
  return Socket.count({})
    .then(count => {
      if (count < 1) return Promise.resolve(0)
      return Socket.remove({}).then(removed => removed.result.n)
    })
    .then(removed => {
      log.info('cleaned (' + removed + ') disconnected sockets')
    })
    .catch(err => {
      log.error(err)
    })
}

exports.removeClient = function(userId, socketId) {
  return Socket.remove({ userId: userId, socketId: socketId })
    .then(removed => {
      if (removed.result.n < 1) log.info('no sockets removed from DB')

      return Socket.count({ userId: userId })
    })
    .then(count => {
      log.info(userId + ' disconnected socket ' + socketId + ' (' + count + ')')
    })
    .catch(err => {
      log.error(err)
    })
}
