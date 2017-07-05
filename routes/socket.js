const log = require('../logger')
const gameService = require('../services/gameService')
const wordService = require('../services/wordService')
const drawService = require('../services/drawService')
const socketStorage = require('../utils/socketStorage')
socketStorage.cleanClients()

module.exports = function(socket) {
  //socketioJwt, id from token > socket.decoded_token.id
  let userId = '5958785b3fce7c7e4f95f388'
  let socketId = socket.id
  let gameId

  let word = {} //Object for storing data between user events
  let wordLength = 5

  socketStorage.addClient(userId, socketId)

  socket.on('disconnect', () => {
    socketStorage.removeClient(userId, socketId)
  })

  socket.on('word:new', () => {
    giveNewWord()
  })

  socket.on('word:letter', letter => {
    if (!word.wordLeft) {
      //TODO stop game on client side if no word to guess
      return Promise.reject()
    }

    let correctGuess = word.wordLeft.charAt(0) === letter
    let guessObj = makeGuessObj(letter, correctGuess)
    word.lastGuess = guessObj

    drawService
      .saveGuess(gameId, guessObj, word._id)
      .then(savedGuess => {
        if (!correctGuess) {
          word.guessMistakes++
          return socket.emit('word:wrongGuess')
        }

        word.letterIndex += 1
        word.wordLeft = word.wordLeft.slice(1)

        // whole word guessed
        if (word.wordLeft.length === 0) {
          let totalTime = savedGuess.ms.fromServed
          let averageSpeed = parseInt(totalTime / word.word.length)

          return drawService
            .finishDraw(
              averageSpeed,
              gameId,
              word.guessMistakes,
              totalTime,
              word._id
            )
            .then(() => {
              return giveNewWord()
            })
        }
        return socket.emit('word:update', word.wordLeft)
      })
      .catch(err => {
        log.error(err)
        return socket.emit('error', {
          tag: 'guess',
          msg: 'Unable to save guess'
        })
      })
  })

  socket.on('game:start', () => {
    gameService
      .finishAllGames(userId)
      .then(() => {
        return gameService.startGame(userId)
      })
      .then(newGame => {
        gameId = newGame._id

        log.info(userId + ' started new game ' + gameId)
        socket.emit('game:created')
        // TODO Notify all other user sockets
      })
      .catch(err => {
        log.error(err)
        return socket.emit('error', {
          tag: 'start',
          msg: 'Unable to start the game'
        })
      })
  })

  //HELPERS
  let giveNewWord = function() {
    return wordService
      .getWord(gameId, wordLength)
      .then(w => {
        word = makeWordObj(w)

        log.info(
          userId + ' "' + word.word + '"' + ' sent to socket ' + socketId
        )
        return socket.emit('word:recieve', word.word)
      })
      .catch(err => {
        log.error(err)
        //socket.emit('giveNewWordFail', err)
        return socket.emit('game:error', {
          tag: 'newWord',
          msg: 'Unable to get new word'
        })
      })
  }

  let makeWordObj = function(w) {
    return {
      _id: w._id,
      word: w.word,
      letterIndex: 0,
      served: w.served,
      wordLeft: w.word,
      extraFromWrong: 0,
      guessMistakes: 0,

      //For calculations on first run
      lastGuess: {
        ms: {
          fromServed: 0,
          fromPrevKey: 0
        }
      }
    }
  }

  let makeGuessObj = function(userString, correctGuess) {
    let timestamp = Date.now()
    let fromServed = timestamp - word.served
    let fromPrevKey = fromServed - word.lastGuess.ms.fromServed
    let correctString = word.wordLeft.charAt(0)

    return {
      index: word.letterIndex,
      timestamp: timestamp,
      userString: userString,
      correctString: correctString,
      correctGuess: correctGuess,
      ms: {
        fromServed: fromServed,
        fromPrevKey: fromPrevKey
      }
    }
  }
}
