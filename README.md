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
# go to http://localhost:3000 in your browser
```

### Full Example

This also requires an AWS account. Assuming you've already setup an AWS user with access to S3, you should run the example like so:

```
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...

export TWITTER_CLIENT_KEY=...
export TWITTER_CLIENT_SECRET=...

node examples/kitchen-sink/main.js
```
