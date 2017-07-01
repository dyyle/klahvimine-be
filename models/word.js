const mongoose = require('mongoose')
const Schema = mongoose.Schema

const wordSchema = new Schema(
  {
    word: { type: String, required: true, unique: true },
    length: { type: Number },
    guessCount: { type: Number, default: 0 },
    mistakesCount: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
)

wordSchema.pre('save', function(next) {
  this.length = this.word.length
  next()
})

const Word = mongoose.model('Word', wordSchema)

module.exports = {
  Word: Word
}