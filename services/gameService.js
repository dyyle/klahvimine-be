const Game = require('../models/Game').Game

module.exports.startGame = function(userId) {
  let game = new Game({
    player: userId
  })
  return game.save()
}

module.exports.finishAllGames = function(userId) {
  return Game.update(
    { player: userId, finished: null },
    { finished: new Date() },
    {
      safe: true,
      multi: true
    }
  )
}

module.exports.finishGame = function(gameId) {
  return Game.findOneAndUpdate({ _id: gameId }, { finished: new Date() })
}
