const search = require('./youtube-search')
const downloader = require('./youtube-downloader')

module.exports = async query => {
  let bestVideo = await search(query)
  if (bestVideo.title) {
    return {
      ...bestVideo,
      path: await downloader(bestVideo.url)
    }
  } else return bestVideo
}

module.exports('wii channel unnatural pauses').then(console.log)
