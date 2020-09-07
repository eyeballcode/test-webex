class AudioQueue {

  constructor() {
    this.mediaStream = new MediaStream()
    this.queue = []
    this.currentlyPlaying = null
  }

  createAudio(filename) {
    let audio = document.createElement('audio')
    audio.setAttribute('src', `http://localhost:8000/${encodeURIComponent(filename)}`)
    audio.setAttribute('crossorigin', 'anonymous')
    audio.setAttribute('controls', '')

    return audio
  }

  schedulePlay(filename) {
    let audio = this.createAudio(filename)
    this.queue.push(audio)
    audio.addEventListener('canplaythrough', async () => {
      let stream = audio.captureStream().getAudioTracks()[0]
      this.mediaStream.addTrack(stream)

      this.checkPlay()
    })
  }

  play(audio) {
    return new Promise(resolve => {
      audio.play()
      this.currentlyPlaying = audio

      audio.addEventListener('ended', () => {
        setTimeout(() => {
          this.currentlyPlaying = null
          this.checkPlay()
        }, 500)
        resolve()
      })
    })
  }

  checkPlay() {
    if (!this.currentlyPlaying && this.queue.length) {
      let next = this.queue.shift()
      this.play(next)
    }
  }
}

window.audioQueue = new AudioQueue()
let currentMediaStream = await navigator.mediaDevices.getUserMedia({audio:1,video:1})
let currentVideoStream = currentMediaStream.getVideoTracks()[0]

audioQueue.mediaStream.addTrack(currentVideoStream)

async function get() {
  console.log('patched function called')
   return audioQueue.mediaStream
}

let t = window
for (let i = 0; i < 4; i++) {
  t.navigator.mediaDevices.getUserMedia = get
  t.navigator.webkitGetUserMedia = get
  t.navigator.mozGetUserMedia = get
  t.navigator.getUserMedia = get
  t = t.top
}
