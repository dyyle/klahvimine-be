const Draw = require('../models/draw').Draw

module.exports.newDraw = function(gameId, wordId) {
  let newDraw = new Draw({ gameId: gameId, wordId: wordId })
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
      gameId: gameId,
      wordId: wordId,
      typed: null // update only not finished word
    },
    update,
    { safe: true }
  )
}

module.exports.saveGuess = function(gameId, guess, wordId) {
  return Draw.findOneAndUpdate(
    { gameId: gameId, wordId: wordId, typingFinished: null }, // update only active word
    { $push: { guesses: guess } },
    { safe: true, new: true }
  ).then(draw => draw.guesses[draw.guesses.length - 1]) // return last guess pushed one
}
