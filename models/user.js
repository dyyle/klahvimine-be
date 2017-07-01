const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  gender: { type: String },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  language: { type: String },
  created: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema)

module.exports = {
  User: User
}
