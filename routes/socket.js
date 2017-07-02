const log = require('../logger')
const gameService = require('../services/gameService')
const wordService = require('../services/wordService')
const socketStorage = require('../utils/socketStorage')
socketStorage.cleanClients()

module.exports = function(socket, io) {
  //socketioJwt, id from token > socket.decoded_token.id
  let userId = '5958785b3fce7c7e4f95f388'
  let socketId = socket.id
  let gameId
  let currentWord

  socketStorage.addClient(userId, socketId)

  socket.on('disconnect', () => {
    socketStorage.removeClient(userId, socketId)
  })

  socket.on('giveNewWord', () => {
    giveNewWord()
  })

  socket.on('letter', l => {
    //TODO calculate time for guess and save to db

    let correctGuess = currentWord.charAt(0) === l
    if (!correctGuess) {
      return socket.emit('wrongGuess')
    }

    currentWord = currentWord.slice(1)
    if (currentWord.length === 0) {
      return giveNewWord()
    }

    return socket.emit('updateWord', currentWord)
  })

  socket.on('startGame', () => {
    gameService
      .finishAllGames(userId)
      .then(finishedGames => {
        log.info(finishedGames)
        return gameService.startGame(userId)
      })
      .then(newGame => {
        log.info('started new game ' + newGame._id)
        gameId = newGame._id
        socket.emit('gameCreated')
        // TODO Notify all other user sockets
      })
  })

  let giveNewWord = function() {
    return wordService
      .getWord(gameId)
      .then(word => {
        currentWord = word
        log.info('"' + word + '"' + ' sent to socket ' + socketId)
        return socket.emit('giveNewWordSuccess', word)
      })
      .catch(err => {
        socket.emit('giveNewWordFail', { error: err })
      })
  }
}
