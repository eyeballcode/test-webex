const request = require('request-promise')

module.exports = async search => {
  let data = await request(`https://www.youtube.com/results?search_query=${search}`)
  let lines = data.split('\n')

  let searchKey = 'window["ytInitialData"] ='
  let dataLine = lines.find(l => l.includes(searchKey))

  if (dataLine) {
    let jsonData = JSON.parse(dataLine.trim().slice(searchKey.length + 1, -1))

    let firstVideo = jsonData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents.find(l => l.videoRenderer).videoRenderer
    if (firstVideo) {
      if (!firstVideo.lengthText) return { error: 'Cannot play livestreams' }

      let length = firstVideo.lengthText.simpleText
      let parts = length.split(':').reverse()
      let seconds = parts[0], minutes = parts[1], hours = parts[2] || 0
      let lengthMinutes = seconds / 60 + minutes + hours * 60
      if (lengthMinutes > 30) return { error: 'Too long' }

      let title = firstVideo.title.runs[0].text
      let url = `https://www.youtube.com/watch?v=${firstVideo.videoId}`
      return { title, url }
    } else return { error: 'No match' }
  } else return { error: 'Unknown' }
}
