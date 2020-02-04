const setupAuth = require('./auth')
const setupRoutes = require('./routes')
const ChallengeVerifier = require('./signing')
const PromiseRouter = require('express-promise-router')
const ethers = require('ethers')

function routes(jwtSecret, prefix = '/_auth/eeta', ethersProvider) {
  if (!ethersProvider) {
    ethersProvider = ethers.getDefaultProvider('kovan')
  }
  // Setup routes with promise-router
  const verifier = new ChallengeVerifier(jwtSecret, ethersProvider)
  const router = new PromiseRouter()
  setupRoutes(router, verifier, prefix)

  return router
}

module.exports = {
  setupAuth,
  routes,
}
