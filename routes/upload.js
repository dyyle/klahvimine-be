const express = require('express')
const router = express.Router()
const multiparty = require('connect-multiparty')
const multipartyMiddleware = multiparty()

const Word = require('../models/word').Word
const Promise = require('bluebird')

const fs = require('fs')
Promise.promisifyAll(fs)

const log = require('../logger')

router.post('/add-words/', multipartyMiddleware, function(req, res) {
  var file = req.files.file

  if (!file) {
    return res.status(400).send('no file found with the request')
  }

  // has to be < 10mb
  if (file.size > 10 * 1000 * 1000) {
    return res.status(400).send('file too large')
  }

  if (file.type.toLowerCase() !== 'text/plain') {
    return res.status(400).send('unsupported file type')
  }

  let dups = 0

  fs
    .readFileAsync(file.path)
    .then(fileData => {
      let words = fileData.toString().split('\n').filter(word => word !== '')

      return Promise.map(words, word => {
        return new Word({ word: word }).save().catch(err => {
          // if duplicate error continue loop
          if (err.code === 11000) {
            dups++
          } else {
            return Promise.reject('Fail import process for Mongo error')
          }
        })
      })
    })
    .then(insertedWords => {
      insertedWords = insertedWords.filter(word => typeof word !== 'undefined')
      return res
        .status(200)
        .send(
          insertedWords.length + ' words inserted ' + dups + ' duplicates found'
        )
    })
    .catch(error => {
      log.error(error)
      return res.status(500).send('could not import file')
    })
})

module.exports = router
