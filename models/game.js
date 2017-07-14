const mongoose = require('mongoose')
const Schema = mongoose.Schema

const gameSchema = new Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    started: { type: Date, default: Date.now },
    finished: { type: Date },
    playedUntilEnd: { type: Boolean, default: false },
    draws: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Draw'
      }
    ]
  },
  {
    timestamps: true
  }
)

const Game = mongoose.model('Game', gameSchema)

module.exports = Game
