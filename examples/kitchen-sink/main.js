const express = require('express')
const session = require('express-session')
const path = require('path')

const eeta = require('../../src/index')

const app = express()

// You need to use express-session to store the logged in user's session
// See https://www.npmjs.com/package/express-session for more options
var sess = {
  secret: 'THIS_SHOULD_BE_A_SECRET',
  cookie: {},
}
app.use(session(sess))
app.use(express.json())

// Get these keys by going to https://developer.twitter.com/en/apps
// Create an app, make sure to check `Enable Sign in with Twitter`
// and add a callback url of `http://localhost:3000/_auth/eeta/twitter/callback`
const consumerKey = process.env.TWITTER_CLIENT_KEY
const consumerSecret = process.env.TWITTER_CLIENT_SECRET

// Setup twitter+eth auth and add routes
eeta.setupAuth(app, consumerKey, consumerSecret)
const JWT_SECRET = 'THIS_SHOULD_BE_A_SECRET'
app.use(eeta.routes(JWT_SECRET, 'erasurebay-dev'))

// Disables caching on our GET routes
app.set('etag', false)

// These are the routes you should define below
app.get('/user', (req, res) => {
  if (!req.user) {
    res.status(403)
    res.json({ msg: 'user not logged in' })
    return
  }

  // req.user is set if and only if the user has successfully logged in with twitter
  // req.user has the following fields:
  //   id: the permanent twitter id for this twitter user
  //   username: twitter username/handle
  //   displayName: the twitter user's selected display name
  //   photo: a url to the twitter user's profile photo
  res.json({ user: req.user })
})

// Logout by clearing the session
app.post('/logout', (req, res) => {
  req.session.regenerate(err => {
    if (err) {
      console.error(err)

      res.status(500)
      res.json({ msg: 'logout unsuccessful' })
      return
    }

    res.json({ msg: 'logout successful' })
  })
})

// Serve html from static directory
app.use(express.static(path.join(__dirname, 'static')))

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}!`))
