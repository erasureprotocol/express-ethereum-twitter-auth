const setupAuth = require('./auth')
const setupRoutes = require('./routes')
const ChallengeVerifier = require('./signing')
const PromiseRouter = require('express-promise-router')

function routes(jwtSecret, prefix = '/_auth/eeta', ethereumNetwork = 'kovan') {
  // Setup routes with promise-router
  const verifier = new ChallengeVerifier(jwtSecret, ethereumNetwork)
  const router = new PromiseRouter()
  setupRoutes(router, verifier, prefix)

  return router
}

module.exports = {
  setupAuth,
  routes,
}
