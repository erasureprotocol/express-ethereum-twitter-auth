# express-twitter-ethereum-auth

## Getting started

```bash
yarn install

# Get these from https://developer.twitter.com/en/apps
# Create an app, make sure to check `Enable Sign in with Twitter`
# and add a callback url of `http://localhost:3000/_auth/eeta/twitter/callback`
export TWITTER_CLIENT_KEY=...
export TWITTER_CLIENT_SECRET=...

node examples/simple/main.js
```
