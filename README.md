# klahvimine-be

Node.js Server with MongoDB for typing game for Estonian language

.env
```
MONGODB_URI=mongodb://host:port/db

SECRET=this is the secret secret secret 12356
TOKEN_EXPIRES_IN_SECONDS=60*60*24

SOCKET_STORAGE_POSTFIX = -sockets

PORT=3000

REDIS_HOST=localhost
REDIS_PORT=6379

SITE_URL=https://app.ee

EMAIL=app@app.ee
DEV_EMAIL=app@app.ee

DEVELOPMENT=true

LOG_LEVEL=7

APP_NAME=app

```

Development
```
nodemon --debug bin/www
```
