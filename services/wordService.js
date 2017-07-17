const Word = require('../models/word')
const Game = require('../models/game')
const drawService = require('../services/drawService')
const Promise = require('bluebird')

module.exports.getWord = function(gameId, wordLength) {
  let word

  //https://alan-mushi.github.io/2015/01/18/mongodb-get-random-document-benchmark.html
  //db.col.find().limit(-1).skip(Math.random() * db.col.count())
  return Word.count({ length: wordLength }, Word)
    .then(count => {
      return Word.find({ length: wordLength })
        .limit(1)
        .skip(Math.round(count * Math.random()))
    })
    .then(words => {
      word = words[0]
      return drawService.newDraw(gameId, word._id)
    })
    .then(draw => {
      word.served = draw.served

      return Promise.all([
        Game.findOneAndUpdate(
          { _id: gameId, finished: null }, // update only active game
          { $push: { draws: draw._id } },
          { safe: true, new: true }
        ),
        Word.findOneAndUpdate(
          { _id: word._id },
          { $push: { draws: draw._id } },
          { safe: true, new: true }
        )
      ])
    })
    .then(updates => {
      if (updates.indexOf(null) !== -1) {
        //here if one of update failed - game not active
        return Promise.reject('Current game not active')
      }
      return Promise.resolve(word)
    })
}
