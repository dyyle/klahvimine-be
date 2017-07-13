const express = require('express')
const router = express.Router()
const redis = require('../utils/redis')
const log = require('../logger')
const ensureLoggedIn = require('../utils/ensureLoggedIn')
const User = require('../models/user')
const signToken = require('../utils/signToken')

router.get('/me', ensureLoggedIn, (req, res) => {
  // Check if user from token exists
  User.findById(req.user.id)
    .then(user => {
      if (!user) {
        return res.status(401).send({ error: { msg: 'Unauthorized' } })
      }

      let response = {
        user: {
          id: user._id,
          email: user.email,
          updatedAt: user.updatedAt
        }
      }

      // update token if more than X seconds from last token update
      // time to send update token (1h)
      let secondsFromtoUpdate =
        req.user.iat + parseInt(process.env.TOKEN_UPDATE_IN_SECONDS)
      let currentTimestampInSecons = Date.now() / 1000
      let updateToken = secondsFromtoUpdate <= currentTimestampInSecons
      if (!updateToken) {
        return Promise.resolve(response)
      }

      // save revoked token to REDIS
      return redis
        .set(JSON.stringify(req.user), req.user.id, req.user.exp - req.user.iat)
        .then(() => {
          log.info('sending updated token to ' + req.user.id)
          response.token = signToken(user)
          return Promise.resolve(response)
        })
    })
    .then(response => {
      return res.json(response)
    })
    .catch(() => {
      return res.status(500).send({ error: { msg: 'Server error' } })
    })
})

module.exports = router
