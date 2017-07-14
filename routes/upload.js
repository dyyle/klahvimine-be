const express = require('express')
const router = express.Router()
const multiparty = require('connect-multiparty')
const multipartyMiddleware = multiparty()

const Word = require('../models/word')
const Promise = require('bluebird')

const fs = require('fs')
Promise.promisifyAll(fs)

const log = require('../logger')

router.post('/add-words/', multipartyMiddleware, function(req, res) {
  var file = req.files.file

  if (!file) {
    return res.status(400).send('no file found with the request')
  }

  // has to be < 10mb m10 1000k 1000b
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
      this.words = fileData.toString().split('\n').filter(word => word !== '')

      log.info(this.words.length + ' trying to insert')
      this.savedCount = 0

      return Promise.map(
        this.words,
        word => {
          return new Word({ word: word, length: word.length })
            .save()
            .then(() => {
              this.savedCount++
              if (this.savedCount % 1000 === 0) {
                log.info('saved count ' + this.savedCount)
              }
              return
            })
            .catch(err => {
              // if duplicate error continue loop
              if (err.code === 11000) {
                if (dups % 1000 === 0) {
                  log.info('dups count ' + dups)
                }
                return dups++
              }

              log.warn(err)
              return Promise.reject('Fail import process for Mongo error')
            })
        },
        { concurrency: 100 }
      )
    })
    .then(() => {
      return res
        .status(200)
        .send(this.savedCount + ' words inserted ' + dups + ' duplicates found')
    })
    .catch(error => {
      log.error(error)
      return res.status(500).send('could not import file')
    })
})

module.exports = router
