const ChallengeVerifier = require('./signing')
const jwt = require('jsonwebtoken')
const ethers = require('ethers')

const verifier = new ChallengeVerifier(
  'foobar',
  ethers.getDefaultProvider('kovan'),
)

it('generateChallenge works', async () => {
  expect.assertions(2)
  const challenge = await verifier.generateChallenge('foo1')
  expect(challenge).toBeTruthy()
  const data = jwt.decode(challenge)
  expect(data.twitterID).toEqual('foo1')
})

it('verifyChallenge works', async () => {
  expect.assertions(1)
  const challenge = await verifier.generateChallenge('foo1')
  const ret = await verifier.verifyChallenge(challenge, 'foo1')
  expect(ret).toEqual(true)
})

it('verifyChallenge with badUserID', async () => {
  expect.assertions(1)
  const challenge = await verifier.generateChallenge('foo1')
  const ret = await verifier.verifyChallenge(challenge, 'wrongUserID')
  expect(ret).toEqual(false)
})

it('verifyChallenge expired', async () => {
  const currentDate = new Date()
  jest.spyOn(global.Date, 'now').mockImplementation(() => {
    currentDate.setHours(currentDate.getHours() + 12)
    return currentDate
  })

  expect.assertions(1)
  const challenge = await verifier.generateChallenge('foo1')
  const ret = await verifier.verifyChallenge(challenge, 'foo1')
  expect(ret).toEqual(false)
})

it('verifySignature works', async () => {
  // This is taken from a real contract on kovan
  // disable this test if it ever gets flakey, since it relies on a working eth node
  const ret = await verifier.verifySignature(
    '0x529A0A1F3a2e4B794eB833728ab19a0B496CCCbA',
    '0x65794a68624763694f694a49557a49314e694973496e523563434936496b705856434a392e65794a3064326c3064475679535551694f6949784d6a41324e6a67344d6a4d354d7a4d334d544d324d5449344969776961574630496a6f784e5467774d6a59784e5459794c434a6c654841694f6a45314f4441794e6a45344e6a4a392e72476c385f6a4942485a5965645459484e41614c2d523567706d2d49587434784b6333585951636e4a4b38',
    '0x7ac5ff6b48695d3f61d38c53cd02174852fd6d961de4b399dc3dfa15d6bbca4561a2ea3df7ee23f74a8b9f2083c7d0061b5ddd9b5bb0a52b33d6d09fb337289d1c4045a8f8dfb0c2130e73a0226a86b6ef548ba43a751239b94d16a44e3bac867202c8bae9a7037e65a63f60c9bc6f771ee0f0f4fe67d8e96737b6ec008e89cda11c000000000000000000000000000000000000000000000000000000005e581141',
  )
  expect(ret).toEqual(true)
})
