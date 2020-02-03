const ethers = require('ethers')
const jwt = require('jsonwebtoken')
const util = require('util')
const jwtSign = util.promisify(jwt.sign)
const jwtVerify = util.promisify(jwt.verify)

const eip1271Abi = [
  {
    constant: true,
    inputs: [
      {
        name: '_messageHash',
        type: 'bytes',
      },
      {
        name: '_signature',
        type: 'bytes',
      },
    ],
    name: 'isValidSignature',
    outputs: [
      {
        name: 'magicValue',
        type: 'bytes4',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]

class ChallengeVerifier {
  constructor(jwt_secret, provider) {
    this.JWT_SECRET = jwt_secret
    this.provider = provider
  }
  async generateChallenge(twitterID) {
    return jwtSign(
      {
        twitterID: twitterID,
      },
      this.JWT_SECRET,
      { expiresIn: '5m' },
    )
  }

  async verifyChallenge(challenge, twitterID) {
    try {
      const data = await jwtVerify(challenge, this.JWT_SECRET)

      return twitterID === data.twitterID
    } catch (e) {
      console.error('error parsing jwt in verifyChallenge', e, challenge)
    }

    return false
  }

  async verifySignature(contractAddress, data, signature) {
    const magicValue = '0x20c13b0b'
    const instance = new ethers.Contract(
      contractAddress,
      eip1271Abi,
      this.provider,
    )
    const result = await instance.isValidSignature(data, signature)
    const verified = result === magicValue

    return verified
  }
}
module.exports = ChallengeVerifier
