const express = require('express')
const session = require('express-session')
const eeta = require('../../src/index')

const app = express()

// You need to use express-session to store the logged in user's session
// See https://www.npmjs.com/package/express-session for more options
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

// Setup twitter+eth auth and add routes
eeta.setupAuth(app, consumerKey, consumerSecret)
app.use(eeta.routes())

// These are the routes you should define. For our purposes, we just return a
// simple login link if the user isn't logged in, else we display the username
app.get('/', (req, res) => {
  if (!req.user) {
    res.send(
      `User not logged in, go to <a href="/_auth/eeta/twitter">here</a> to login`,
    )
    return
  }
  // req.user is set if and only if the user has successfully logged in with twitter
  // req.user has the following fields:
  //   id: the permanent twitter id for this twitter user
  //   username: twitter username/handle
  //   displayName: the twitter user's selected display name
  //   photo: a url to the twitter user's profile photo

  res.send(
    `User logged in with: ${req.user.username}
    <br>
    <a href="/logout">Logout</a>`,
  )
})

// Logout by clearing the session
app.get('/logout', (req, res) => {
  req.session.regenerate(() => {
    res.redirect(302, '/')
  })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}!`))
