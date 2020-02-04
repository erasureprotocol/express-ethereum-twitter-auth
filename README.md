# express-twitter-ethereum-auth

## Usage

In your express app's initialization, do the following:

```js
const express = require('express')
const session = require('express-session')
const eeta = require('express-ethereum-twitter-auth')
const app = express()

// You need to use express-session for the default auth to persist
// If you're using your own auth, you can skip this
var sess = {
  secret: 'THIS_SHOULD_BE_A_SECRET',
  cookie: {},
}
app.use(session(sess))

// Get these keys by going to https://developer.twitter.com/en/apps
// Create an app, make sure to check `Enable Sign in with Twitter`
// and add a callback url of `http://localhost:3000/_auth/eeta/twitter/callback`
const consumerKey = process.env.TWITTER_CLIENT_KEY
const consumerSecret = process.env.TWITTER_CLIENT_SECRET

// Setup twitter OAuath. You can skip this if you have your own method of auth.
// The only requirement is that req.user.id exists if an only if the user is logged in
eeta.setupAuth(app, consumerKey, consumerSecret)

const JWT_SECRET = 'THIS_SHOULD_BE_A_SECRET'
// Setup the routes
app.use(eeta.routes(JWT_SECRET))

// Define your own routes
app.get(...)
```

## Simple example

```bash
yarn install

# Get these from https://developer.twitter.com/en/apps
export TWITTER_CLIENT_KEY=...
export TWITTER_CLIENT_SECRET=...

node examples/simple/main.js
# go to http://localhost:3000 in your browser
```

## Full Example

This also requires an AWS account. Assuming you've already setup an AWS user with access to S3, you should run the example like so:

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...

export TWITTER_CLIENT_KEY=...
export TWITTER_CLIENT_SECRET=...

node examples/kitchen-sink/main.js
# go to http://localhost:3000 in your browser
```
