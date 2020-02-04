let web3
let authereum
let twitter

function initWeb3() {
  authereum = new Authereum('kovan')

  authereum.on('ready', () => {
    console.log('Authereum ready.')
  })
  authereum.on('login', () => {
    console.log('Authereum logged in.')
  })

  authereum.login()

  const provider = authereum.getProvider()
  web3 = new Web3(provider)
  enableButtons()
}

async function initTwitter() {
  return fetch('/user', {
    method: 'GET',
    credentials: 'same-origin',
  })
    .then(resp => {
      if (resp.status != 200) {
        window.location = '/_auth/eeta/twitter'
      } else {
        twitter = resp.json()
        enableButtons()
      }
    })
    .catch(err => {
      console.log(err)
    })
}

function enableButtons() {
  if (!twitter || !web3) {
    return
  }

  document.querySelectorAll('button').forEach(elem => {
    elem.disabled = false
  })
  document.querySelectorAll('.login-info').forEach(elem => {
    elem.style.display = 'none'
  })
}

async function verifyLinkAccounts() {
  const infoBox = document.getElementById('sign-msg-info')
  infoBox.style.display = 'inherit'
  infoBox.innerText = 'verifying...'

  const challengeResp = await fetch('/_auth/eeta/user/linkAccounts/challenge', {
    method: 'GET',
    credentials: 'same-origin',
  })
  if (challengeResp.status != 200) {
    console.error(challengeResp)
    infoBox.innerText = 'failed to get challenge'
    return
  }

  const respData = await challengeResp.json()
  const challenge = respData.challenge

  const address = (await web3.eth.getAccounts())[0]
  const signature = await web3.eth.sign(challenge, address)

  const verifyResponse = await fetch('/_auth/eeta/user/linkAccounts/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      challenge,
      address,
      signature,
    }),
  })
  if (verifyResponse.status != 200) {
    console.error(verifyResponse)
    infoBox.innerText = 'failed to verify'
    return
  }

  infoBox.innerText = 'verified user successfully'
}

async function logout() {
  authereum.logout()

  return fetch('/logout', {
    method: 'POST',
    credentials: 'same-origin',
  })
    .then(() => {
      document.getElementById('logout-info').innerText =
        'Logout Successful. Reloading...'
      window.setTimeout(() => {
        window.location.reload()
      }, 3000)
    })
    .catch(err => {
      document.getElementById('logout-info').innerText = 'Logout Failed: ' + err
    })
}

initWeb3()
initTwitter()
