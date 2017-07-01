const mongoose = require('mongoose')
const Schema = mongoose.Schema

const gameSchema = new Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, default: 0 },
  begin: { type: Date, default: Date.now }, // ?
  end: { type: Date },
  words: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Word', required: true },
      served: { type: Date },
      guessed: { type: Date },
      mistakesCount: { type: Number, default: 0 },
      mistakes: [
        {
          index: { type: Number },
          string: { type: String }
        }
      ],
      score: { type: Number, default: 0 }
    }
  ]
})

const Game = mongoose.model('Game', gameSchema)

module.exports = {
  Game: Game
}
