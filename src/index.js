const setupAuth = require('./auth')
const setupRoutes = require('./routes')
const ChallengeVerifier = require('./signing')
const PromiseRouter = require('express-promise-router')
const ethers = require('ethers')

function routes(
  jwtSecret,
  s3BucketName,
  prefix = '/_auth/eeta',
  network = 'kovan',
  ethersProvider,
) {
  if (!ethersProvider) {
    ethersProvider = ethers.getDefaultProvider(network)
  }
  // Setup routes with promise-router
  const verifier = new ChallengeVerifier(jwtSecret, ethersProvider)
  const router = new PromiseRouter()
  setupRoutes(router, verifier, s3BucketName, prefix)

  return router
}

module.exports = {
  setupAuth,
  routes,
}
