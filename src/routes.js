const passport = require('passport')
const express = require('express')
const util = require('util')

const S3 = require('aws-sdk/clients/s3')

const setupRoutes = (
  app,
  challengeVerifier,
  s3BucketName,
  pathPrefix = '/_auth/eeta',
  loginFailedRouteArg,
) => {
  app.use(express.json())
  var s3bucket = new S3({
    params: { Bucket: s3BucketName },
  })
  const s3Upload = util.promisify(s3bucket.upload.bind(s3bucket))
  const s3GetObject = util.promisify(s3bucket.getObject.bind(s3bucket))

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

  app.get(`${pathPrefix}/user/twitter/:id`, async function(req, res) {
    let data
    try {
      data = await s3GetObject({ Key: `twitterToEth/${req.params.id}` })
    } catch (e) {
      if (e.code === 'NoSuchKey') {
        res.status(404).end()
        return
      }
      console.error(
        'unexpected error getting s3 for twitter id',
        e,
        req.params.id,
      )
      res.status(500).end()
      return
    }

    res.json({
      twitterID: req.params.id,
      address: data.Body.toString(),
    })
  })

  app.get(`${pathPrefix}/user/ethereum/:address`, async function(req, res) {
    let data
    try {
      data = await s3GetObject({
        Key: `ethToTwitter/${req.params.address.toLowerCase()}`,
      })
    } catch (e) {
      if (e.code === 'NoSuchKey') {
        res.status(404).end()
        return
      }
      console.error(
        'unexpected error getting s3 for ethereum address',
        e,
        req.params.address,
      )
      res.status(500).end()
      return
    }

    res.json({
      twitterID: data.Body.toString(),
      address: req.params.address,
    })
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

    await s3Upload({
      Key: `ethToTwitter/${address.toLowerCase()}`,
      Body: `${req.user.id}`,
    })
    await s3Upload({
      Key: `twitterToEth/${req.user.id}`,
      Body: `${address}`,
    })

    res.json({ verified: true })
  })
}

module.exports = setupRoutes
