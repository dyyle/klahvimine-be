const mongoose = require('mongoose')
//const Promise = require('bluebird')
const bcrypt = require('bcrypt')

const socketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    socketId: { type: String, required: true, unique: true }
  },
  {
    timestamps: true
  }
)

/**
* Password hash middleware.
* Important! Do not use arrow function, will lose ref to (this)
*/
socketSchema.pre('save', function(next) {
  const user = this
  if (!user.isModified('password')) {
    return next()
  }
  return bcrypt
    .genSalt(10)
    .then(salt => {
      return bcrypt.hash(user.password, salt)
    })
    .then(hash => {
      user.password = hash
      return next()
    })
    .catch(err => {
      return next(err)
    })
})

const Socket = mongoose.model('Socket', socketSchema)

module.exports = Socket
