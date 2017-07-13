const redis = require('./redis')
const expressJwt = require('express-jwt')
const jwtSecret = process.env.SECRET
const validateJwt = expressJwt({ secret: jwtSecret })
const log = require('../logger')

module.exports = function(req, res, next) {
  validateJwt(req, res, function(err) {
    if (err) {
      // token not valid or expired
      return res.status(401).send({ error: 'Unauthorized' })
    }

    // check if blacklisted
    redis
      .get(JSON.stringify(req.user))
      .then(isBlacklisted => {
        if (isBlacklisted) {
          log.info(
            'blacklisted token tried. user:' +
              req.user +
              ' token:' +
              isBlacklisted
          )
          return Promise.reject({ msg: 'Unauthorized' })
        }
        // check if token valid after user data changed
        return redis.get(req.user.id + process.env.USER_UPDATE_REDIS_POSTFIX)
      })
      .then(userPasswordUpdate => {
        // allow only if user password not changed after last token issued
        if (userPasswordUpdate < req.user.iat) return Promise.resolve()
        return redis
          .set(
            JSON.stringify(req.user),
            req.user.id,
            req.user.exp - req.user.iat
          )
          .then(() => {
            return Promise.reject({ msg: 'Unauthorized' })
          })
      })
      .then(() => {
        return next()
      })
      .catch(err => {
        return res.status(401).send({ error: err })
      })
  })
}
