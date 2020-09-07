const fs = require('fs')
const youtubedl = require('youtube-dl')
const path = require('path')

module.exports = async url => {
  return await new Promise(resolve => {
    youtubedl.exec(url, ['-x',  '--audio-format', 'wav', '-f', 'worstaudio'], {
      cwd: __dirname
    }, (err, output) => {
      let outputLine = output.find(l => l.includes('Destination:') && l.includes('ffmpeg'))
      let outputFile = outputLine.slice(outputLine.indexOf(':') + 2)

      resolve(path.join(__dirname, outputFile))
    })
  })
}
