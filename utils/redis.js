const Promise = require('bluebird')
const redis = require('redis')
Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
})

module.exports = {
  del: function(key) {
    return client.delAsync(key)
  },
  get: function(key) {
    return client.getAsync(key).then(value => JSON.parse(value))
  },
  keys: function(pattern) {
    return client.keysAsync(pattern)
  },
  sadd: function(key, value) {
    return client.saddAsync(key, value)
  },
  // count
  scard: function(key) {
    return client.scardAsync(key)
  },
  srem: function(key, value) {
    return client.sremAsync(key, value)
  },
  smembers: function(key) {
    return client.smembersAsync(key)
  },
  set: function(key, value, expire) {
    let promise = client.setAsync(key, JSON.stringify(value))
    if (expire) {
      promise.then(function() {
        return client.expireAsync(key, expire)
      })
    }
    return promise
  }
}
