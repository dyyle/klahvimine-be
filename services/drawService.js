const Draw = require('../models/draw')

module.exports.newDraw = function(gameId, wordId) {
  let newDraw = new Draw({ game: gameId, word: wordId })
  return newDraw.save()
}

module.exports.finishDraw = function(
  averageSpeed,
  gameId,
  mistakes,
  totalTime,
  wordId
) {
  let update = {
    averageSpeed: averageSpeed,
    mistakes: mistakes,
    totalTime: totalTime,
    typingFinished: Date.now()
  }

  return Draw.findOneAndUpdate(
    {
      game: gameId,
      word: wordId,
      typed: null // update only not finished word
    },
    update,
    { safe: true }
  )
}

module.exports.saveGuess = function(gameId, guess, wordId) {
  return Draw.findOneAndUpdate(
    { game: gameId, word: wordId, typingFinished: null }, // update only active word
    { $push: { guesses: guess } },
    { safe: true, new: true }
  ).then(draw => draw.guesses[draw.guesses.length - 1]) // return last guess pushed one
}
