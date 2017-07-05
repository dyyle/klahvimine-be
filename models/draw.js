const mongoose = require('mongoose')
const Schema = mongoose.Schema

const drawSchema = new Schema(
  {
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true
    },

    wordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Word',
      required: true
    },

    served: { type: Date, default: Date.now },
    typingFinished: { type: Date },
    totalTime: { type: Number },
    mistakes: { type: Number, default: 0 },
    averageSpeed: { type: Number, default: 0 },

    guesses: [
      {
        timestamp: { type: Date }, // only if realtime insertions
        index: { type: Number },
        userString: { type: String },
        correctString: { type: String },
        correctGuess: { type: Boolean, default: true },
        ms: {
          fromServed: { type: Number },
          fromPrevKey: { type: Number },
          extraFromWrong: { type: Number }
        }
      }
    ]
  },
  {
    timestamps: true
  }
)

const Draw = mongoose.model('Draw', drawSchema)

module.exports = {
  Draw: Draw
}
