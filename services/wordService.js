const Word = require('../models/word').Word
const Game = require('../models/Game').Game
const Promise = require('bluebird')

module.exports.getWord = function(gameId) {
  let LENGTH = 5
  let word

  //https://alan-mushi.github.io/2015/01/18/mongodb-get-random-document-benchmark.html
  //db.col.find().limit(-1).skip(Math.random() * db.col.count())
  return Word.count({ length: LENGTH }, Word)
    .then(count => {
      return Word.find({ length: LENGTH })
        .limit(1)
        .skip(Math.round(count * Math.random()))
    })
    .then(words => {
      word = words[0].word
      return Game.findOneAndUpdate(
        { _id: gameId, finished: null }, // update only active game
        {
          $push: { words: { id: words[0]._id } }
        },
        { safe: true }
      )
    })
    .then(updatedGame => {
      if (!updatedGame) {
        return Promise.reject(
          'Unable to update game – this game is not active'
        )
      }
      return word
    })
}
