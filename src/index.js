const setupAuth = require('./auth')
const setupRoutes = require('./routes')
const ChallengeVerifier = require('./signing')
const PromiseRouter = require('express-promise-router')

function routes(prefix = '/_auth/eeta') {
  // Setup routes with promise-router
  const verifier = new ChallengeVerifier(
    process.env.JWT_SECRET,
    process.env.NETWORK,
  )
  const router = new PromiseRouter()
  setupRoutes(router, verifier, prefix)

  return router
}

module.exports = {
  setupAuth,
  routes,
}
