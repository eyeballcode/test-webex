const webdriver = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const { By, until } = webdriver
const path = require('path')

const fs = require('fs')

const injectJS = fs.readFileSync(path.join(__dirname, 'inject.js')).toString()
const encodeExt = file => Buffer.from(fs.readFileSync(file)).toString('base64')

let sleep = t => new Promise(r => setTimeout(r, t))

let arguments = [
  '--use-fake-ui-for-media-stream',
  '--use-fake-device-for-media-stream',
  '--allow-file-access-from-files',
  '--disable-translate',
  '--start-maximized',
  '--autoplay-policy=no-user-gesture-required',
  '--disable-web-security',
  '--allow-running-insecure-content'
  // '--headless'
]

let chromeOptions = new chrome.Options()
chromeOptions.addExtensions(encodeExt(path.join(__dirname, 'chrome-csp-disable.crx')))
arguments.forEach(a => chromeOptions.addArguments(a))

const driver = new webdriver.Builder()
  .forBrowser('chrome')
  .setChromeOptions(chromeOptions)
  .build()

// driver.get('https://eduvic.webex.com/eduvic/k2/j.php?MTID=td7a4a8900de7e34813f313aa13be6b4d').then(async () => { // cook
driver.get('https://eduvic.webex.com/eduvic/k2/j.php?MTID=t700b7d0d2e084d4ec4f50c4403710eed').then(async () => { //thomo
// driver.get('https://eduvic.webex.com/eduvic/k2/j.php?MTID=t49280c11e404adbf1c189124f903eedb').then(async () => { // chem
  await driver.switchTo().frame(1)
  await driver.switchTo().frame(1)

  let usernameField = await driver.findElement(By.name('screenName'))
  let emailField = await driver.findElement(By.name('email'))
  let joinButton = await driver.findElement(By.id('ec-btn-joinnow-thin-client'))

  let usernameDisabled = await usernameField.getAttribute('disabled')

  if (usernameDisabled === 'true') { // string not boolean
    console.log(JSON.stringify({ error: 'Session not started' }))
    driver.quit()
  }

  await usernameField.sendKeys('Ned\'s music bot')
  await emailField.sendKeys('ned@transportsg.me')
  await joinButton.click()

  await sleep(2000)
  driver.switchTo().defaultContent()

  await driver.switchTo().frame(1)
  await driver.switchTo().frame(1)
  await driver.switchTo().frame(0)

  await driver.executeScript(injectJS)

  for (let i = 0; i < 15; i++) {
    try {
      let connectButton = await driver.findElement(By.css('[datadoi="AUDIO:VOIP:MENU_AUDIO"]'))
      await connectButton.click()
      break
    } catch (e) {
      await sleep(2000)
    }
  }

  await sleep(7000)

  for (let i = 0; i < 20; i++)
    await driver.executeScript(`window.audioQueue.schedulePlay("mii.mp3")`)

  await sleep(60 * 1000)
})
