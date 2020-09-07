const request = require('request-promise')
const requestFull = require('request')
const url = require('url')
const cheerio = require('cheerio')
const querystring = require('querystring')
const jsonic = require('jsonic')
const WebSocket = require('ws')

let username = encodeURIComponent('Ned\'s Music Bot')
let email = encodeURIComponent('ned@transportsg.me')

function parseString(str) {
  return str.replace(/\\x([a-f0-9]{2})/g, (_, charCodeHex) => {
    return String.fromCharCode(parseInt(charCodeHex, 16))
  })
}

async function getPageWCookies(options) {
  let data

  await new Promise(resolve => {
    requestFull(options, (err, resp, body) => {
      data = { cookies: resp.caseless.dict['set-cookie'], body }
      resolve()
    })
  })

  return data
}

async function main() {
  let mainPage = await getPageWCookies({
    method: 'GET',
    uri: 'https://eduvic.webex.com/eduvic/k2/j.php?MTID=t56c8dc4ced9ed2c42e02a05b2e29fd91'
  })

  let startData = mainPage.body
  let redirectURL = parseString(startData.match(/location\.href="(.+)"/)[1])
  let fullURL = decodeURIComponent(decodeURIComponent(redirectURL))
  let frameURL = fullURL.slice(fullURL.lastIndexOf('main_url=') + 9)

  let jsession = mainPage.cookies.find(x => x.startsWith('JSESSIONID')).split(';')[0]
  let nsc = mainPage.cookies.find(x => x.startsWith('NSC')).split(';')[0]
  fullCookies = `${jsession}; ${nsc};`

  let frameURLQuery = url.parse(frameURL).query
  let sessionInfoURL = 'https://eduvic.webex.com/tc3300/trainingcenter/meeting/sessionInfo.do?' + frameURLQuery

  let $ = cheerio.load(await request(sessionInfoURL))
  let passwordTicket = $('[name=passwordForJoinTicket]').val()

  let query = querystring.parse(frameURLQuery)
  let loginData = `siteurl=eduvic&hidForLanguageTimezoneTag=&
passwordForJoinTicket=${passwordTicket}&
screenName=${username}&
email=${email}&
password=%26%26%26%26%26%26&
confID=${query.confID}`.replace(/\n/g, '')

 let meetingData = await request({
    method: 'POST',
    uri: 'https://eduvic.webex.com/tc3300/trainingcenter/meeting/joinSession.do?waitForHost=1&categoryTicket=null&joinByBrowser=1',
    body: loginData,
    headers: {
      'Content-Length': loginData.length,
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: fullCookies,
      Host: 'eduvic.webex.com',
      Origin: 'https://eduvic.webex.com',
      Referer: 'https://eduvic.webex.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36'
    }
  })

  let rawJSONData = meetingData.slice(meetingData.indexOf('$.extend(window.thinClientConfig') + 33, meetingData.indexOf('onEscalateThin: function')).trim().slice(0, -1) + '}'
  rawJSONData = rawJSONData.replace(/\.replace.+/, ',')
  let jsonData = jsonic(rawJSONData).pbSettings
  Object.keys(jsonData).forEach(k => {
    if (typeof jsonData[k] === 'string' && jsonData[k].startsWith('"')) {
      jsonData[k] = jsonData[k].slice(1, -1)
    }
  })

  let nobrowserData = `AT=JM&MK=${jsonData.meetingKey}&
DN=${username}&EM=${email}&PPW=${jsonData.eventPassword}&RegID=&
MeetingUUID=${jsonData.meetingUUID}&TTK=${jsonData.mtgKeyAndPwdTicket}&
DocshowVer=2.0&FeatureSupport=0&OS=ThinClient&isUTF8=1&
IT=43&REFNUM5=NaN&REFNUM4=NaN&`.replace(/\n/g, '')

  let meetingWSData = (await request({
    method: 'POST',
    uri: 'https://eduvic.webex.com/eduvic/nobrowser.php',
    body: nobrowserData,
    headers: {
      'Content-Length': nobrowserData.length,
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: fullCookies,
      Host: 'eduvic.webex.com',
      Origin: 'https://eduvic.webex.com',
      Referer: 'https://eduvic.webex.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36'
    }
  })).split('\n')
  let meetingID = meetingWSData.find(l => l.startsWith('meetingid')).split('=')[1].trim()
  let userID = meetingWSData.find(l => l.includes('GuestID'))
  userID = userID.slice(userID.lastIndexOf('=') + 1).trim()
  let clientParam = Buffer.from(meetingWSData.find(l => l.includes('clientparam')).trim().slice(12), 'base64').toString()
  let siteID = cheerio.load(clientParam)('MeetingSiteID').text()

  let wsQueryBody = `action=join_meeting&gdm=1&site_id=${siteID}&meeting_id=${encodeURIComponent(meetingID)}&user_id=-${encodeURIComponent(userID)}&meeting_key=${encodeURIComponent(jsonData.meetingKey)}`
  let ping = await request({
    method: 'POST',
    uri: 'https://eapcbmm10.webex.com/__ping__?',
    body: nobrowserData,
    headers: {
      'Content-Length': 0,
      Url_Parameters: wsQueryBody
    }
  })

  let $$ = cheerio.load(ping)
  let wsAddress = $$('top_address').text()
  let ip = $$('client_ext_ip').text()
  let wsURL = `wss://${wsAddress.slice(6).split(':')[0]}/direct?type=websocket&dtype=binary&rand=${+new Date()}&gatewayip=${ip}`

  let ws = new WebSocket(wsURL)
  ws.on('message', console.log)
}

main()
