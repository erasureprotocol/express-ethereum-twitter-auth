const passport = require('passport')
const TwitterStrategy = require('passport-twitter').Strategy

passport.serializeUser(function(user, done) {
  done(null, user)
})

passport.deserializeUser(function(user, done) {
  done(null, user)
})

const setupAuth = (
  app,
  twitterConsumerKey,
  twitterConsumerSecret,
  callbackURL = '/_auth/eeta/twitter/callback',
) => {
  passport.use(
    new TwitterStrategy(
      {
        consumerKey: twitterConsumerKey,
        consumerSecret: twitterConsumerSecret,
        callbackURL: callbackURL,
      },
      function(token, tokenSecret, profile, done) {
        console.log('user signed in successfully', profile.id, profile.username)
        done(null, {
          id: profile.id,
          username: profile.username,
          displayName: profile.displayName,
          photo: profile.photos && profile.photos[0] && profile.photos[0].value,
        })
      },
    ),
  )

  app.use(passport.initialize())
  app.use(passport.session())
}

module.exports = setupAuth
