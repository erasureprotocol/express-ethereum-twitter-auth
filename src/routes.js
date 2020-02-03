const passport = require('passport')
const express = require('express')

// const S3 = require('aws-sdk/clients/s3')

const setupRoutes = (
  app,
  challengeVerifier,
  pathPrefix = '/_auth/eeta',
  loginFailedRouteArg,
  s3BucketName,
) => {
  app.use(express.json())
  // var s3bucket = new S3({
  //   params: { Bucket: s3BucketName },
  // })

  let loginFailedRoute = loginFailedRouteArg
  if (!loginFailedRouteArg) {
    loginFailedRoute = `${pathPrefix}/login-failed`

    app.get(loginFailedRoute, function(req, res) {
      res.send('failed to login')
    })
  }

  app.get(`${pathPrefix}/twitter`, passport.authenticate('twitter'))

  app.get(
    `${pathPrefix}/twitter/callback`,
    passport.authenticate('twitter', {
      successRedirect: '/',
      failureRedirect: loginFailedRoute,
    }),
  )

  app.get(`${pathPrefix}/user`, function(req, res) {
    if (!req.user) {
      res.status(403)
      res.json({ error: 'not logged in' })
      return
    }
    res.json(req.user)
  })

  app.get(`${pathPrefix}/user/linkAccounts/challenge`, async function(
    req,
    res,
  ) {
    if (!req.user) {
      res.status(403)
      res.json({ error: 'not logged in' })
      return
    }

    res.json({
      challenge: await challengeVerifier.generateChallenge(req.user.id),
    })
  })

  app.post(`${pathPrefix}/user/linkAccounts/verify`, async (req, res) => {
    if (!req.user) {
      res.status(403)
      res.json({ error: 'not logged in' })
      return
    }

    const { challenge, signature, address } = req.body

    const data = '0x' + Buffer.from(challenge).toString('hex')

    if (!(await challengeVerifier.verifyChallenge(challenge, req.user.id))) {
      console.error('Challenge verification failed', req.user, challenge)
      res.status(400).json({ verified: false })
      return
    }

    console.log(
      'verifySignature(address, data, signature)',
      address,
      data,
      signature,
    )
    if (!(await challengeVerifier.verifySignature(address, data, signature))) {
      console.error(
        'Signature verification failed',
        req.user,
        address,
        challenge,
        signature,
      )
      res.status(400).json({ verified: false })
      return
    }

    res.json({ verified: true })
  })
}

module.exports = setupRoutes
