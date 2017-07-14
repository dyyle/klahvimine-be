const mongoose = require('mongoose')
const Schema = mongoose.Schema

const wordSchema = new Schema(
  {
    word: { type: String, required: true, unique: true },
    length: { type: Number, required: true },
    guessedCount: { type: Number, default: 0 },
    servedCount: { type: Number, default: 0 },
    mistakesCount: { type: Number, default: 0 },
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

const Word = mongoose.model('Word', wordSchema)

module.exports = Word
