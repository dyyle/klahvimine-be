const mongoose = require('mongoose')
//const Promise = require('bluebird')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },
    passwordResetToken: String,
    passwordResetExpires: Date,

    profile: {
      firstName: { type: String },
      lastName: { type: String },
      gender: { type: String },
      image: { type: String },
      dateOfBirth: { type: String }
    },

    setting: {
      language: { type: String }
    }
  },
  {
    timestamps: true
  }
)

/**
* Password hash middleware.
* Important! Do not use arrow function, will lose ref to (this)
*/
userSchema.pre('save', function(next) {
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

/**
* Helper method for validating user's password on login through user.comparePassword
* Important! Do not use arrow function, will lose ref to (this)
*/
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)

module.exports = User
