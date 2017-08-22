const bodyParser = require('body-parser')
const express = require('express')
const log = require('./logger')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const expressValidator = require('express-validator')
const Promise = require('bluebird')

const passport = require('passport')
const passportStrategies = require('./utils/passportStrategies')
passport.use(passportStrategies.LocalStrategy)

// Load config
const dotenv = require('dotenv')
dotenv.load({ path: '.env' })

// connect to db
mongoose.Promise = Promise
mongoose.connect(process.env.MONGODB_URI, {
  useMongoClient: true
})

const app = express()

app.use(expressValidator())
app.use(log.middleWare())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(passport.initialize())

// Routes
let upload = require('./routes/upload')
app.use('/api/upload', upload)
let auth = require('./routes/auth')
app.use('/api/auth', auth)
let users = require('./routes/users')
app.use('/api/users', users)
let games = require('./routes/games')
app.use('/api/games', games)

// catch 404
app.use(function(req, res) {
  return res.status(404).send('Not Found')
})

// error handlers
app.use(function(err, req, res) {
  //catch jwt expired
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('UnauthorizedError')
  }
  res.status(err.status || 500).json({
    message: err.message,
    error: process.env.PRODUCTION ? {} : err
  })
})

// https://strongloop.com/strongblog/robust-node-applications-error-handling/
process.on('uncaughtException', function(err) {
  log.error(err.stack)

  if (!process.env.PRODUCTION) {
    return process.exit(1)
  }

  let transport = nodemailer.createTransport()

  transport.sendMail(
    {
      from: process.env.EMAIL,
      to: process.env.DEV_EMAIL,
      subject:
        '[' + process.env.APP_NAME + '][uncaughtException] - ' + err.message,
      text: err.stack
    },
    function(err) {
      if (err) log.error(err)
      log.warning('Email sent to developer about error')
      process.exit(1)
    }
  )
})

module.exports = app
