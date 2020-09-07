const webdriver = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const { By, until } = webdriver
const path = require('path')

const fs = require('fs')

const injectJS = fs.readFileSync(path.join(__dirname, 'inject.js')).toString()
const encodeExt = file => Buffer.from(fs.readFileSync(file)).toString('base64')

let sleep = t => new Promise(r => setTimeout(r, t))

let arguments = [
  '--allow-file-access-from-files',
  '--use-fake-ui-for-media-stream',
  '--use-fake-device-for-media-stream',
  '--use-file-for-fake-audio-capture=' + path.join(__dirname, 'wii.wav'),
  '--use-file-for-fake-video-capture=' + path.join(__dirname, 'test.y4m'),
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

driver.get('https://meetingsapac21.webex.com/webappng/sites/meetingsapac21/meeting/download/07726931877317ce88086d429d58187c').then(async () => { //thomo
  await sleep(4000)
  await (await driver.findElement(By.id('push_download_join_by_browser'))).click()
  await sleep(1700)
  await driver.switchTo().frame(await driver.findElement(By.id('pbui_iframe')))
  // await driver.executeScript(injectJS)
  await sleep(6000)

  let usernameField = await driver.findElement(By.css('[placeholder="Your full name"]'))
  let emailField = await driver.findElement(By.css('[placeholder="Email address"]'))
  let joinButton = await driver.findElement(By.id('guest_next-btn'))

  await usernameField.sendKeys('Ned\'s music bot')
  await emailField.sendKeys('ned@transportsg.me')
  await joinButton.click()

  await sleep(5000)

  await (await driver.findElement(By.id('welcome_skip'))).click()
  await sleep(500)
  await (await driver.findElement(By.id('interstitial_join_btn'))).click()

  // await driver.executeScript(injectJS)
  //
  // for (let i = 0; i < 15; i++) {
  //   try {
  //     let connectButton = await driver.findElement(By.css('[datadoi="AUDIO:VOIP:MENU_AUDIO"]'))
  //     await connectButton.click()
  //     break
  //   } catch (e) {
  //     await sleep(2000)
  //   }
  // }
  //
  // await sleep(7000)
  //
  // for (let i = 0; i < 20; i++)
  //   await driver.executeScript(`window.audioQueue.schedulePlay("mii.mp3")`)
  //
  // await sleep(60 * 1000)
})
