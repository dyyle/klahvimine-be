const log = require('../logger')
const Word = require('../models/word').Word
const socketStorage = require('../utils/socketStorage')
socketStorage.cleanClients()

module.exports = function(socket) {
  //socketioJwt, id from token > socket.decoded_token.id
  let userId = 'socket.decoded_token.id'

  socketStorage.addClient(userId, socket.id)

  socket.on('giveNewWord', function() {
    let LENGTH = 5

    //https://alan-mushi.github.io/2015/01/18/mongodb-get-random-document-benchmark.html
    //db.col.find().limit(-1).skip(Math.random() * db.col.count())
    Word.count({ length: LENGTH }, Word)
      .then(count => {
        return Word.find({ length: LENGTH })
          .limit(1)
          .skip(Math.round(count * Math.random()))
          .then(words => words[0].word)
      })
      .then(word => {
        log.info('"' + word + '"' + ' sent to socket ' + socket.id)
        socket.emit('giveNewWordSuccess', word)
      })
      .catch(err => {
        socket.emit('giveNewWordFail', { error: err })
      })
  })

  socket.on('disconnect', function() {
    socketStorage.removeClient(userId, socket.id)
  })
}
