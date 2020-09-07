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
  '--allow-running-insecure-content',
  '--mute-audio'
  // '--headless'
]

let chromeOptions = new chrome.Options()
chromeOptions.addExtensions(encodeExt(path.join(__dirname, 'chrome-csp-disable.crx')))
arguments.forEach(a => chromeOptions.addArguments(a))


const driver = new webdriver.Builder()
  .forBrowser('chrome')
  .setChromeOptions(chromeOptions)
  .build()

driver.get('https://www.onlinemictest.com/').then(async () => {
// driver.get('https://webrtc.github.io/samples/src/content/getusermedia/audio/').then(async () => {
// driver.get('https://meetingsapac21.webex.com/webappng/sites/meetingsapac21/meeting/download/07726931877317ce88086d429d58187c').then(async () => {
// driver.get('https://webrtc.github.io/samples/src/content/devices/input-output/').then(async () => {
// await sleep(30 * 1000)
// await driver.switchTo().frame(1)
//
  await driver.executeScript(injectJS)
//
//   await driver.executeScript(`window.audioQueue.schedulePlay("mii.mp3")`)
//   await driver.executeScript(`window.audioQueue.schedulePlay("mii.mp3")`)
//   await driver.executeScript(`window.audioQueue.schedulePlay("mii.mp3")`)
//   await driver.executeScript(`window.audioQueue.schedulePlay("mii.mp3")`)
//   await driver.executeScript(`window.audioQueue.schedulePlay("mii.mp3")`)
})
