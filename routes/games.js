const express = require('express')
const router = express.Router()
const log = require('../logger')
const ensureLoggedIn = require('../utils/ensureLoggedIn')
const Game = require('../models/game')

router.get('/', ensureLoggedIn, (req, res) => {
  // Check if user from token exists
  Game.find({ playerId: req.user.id })
    .populate({ path: 'draws', populate: { path: 'word' } })
    .exec()
    .then(games => {
      return res.json(games)
    })
    .catch(err => {
      log.warning(err)
      return res.status(500).send({ error: { msg: 'Server error' } })
    })
})

module.exports = router
