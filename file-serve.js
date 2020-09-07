const http = require('http')
const express = require('express')

let app = express()
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
})

app.use('/', express.static(__dirname))

http.createServer(app).listen(8000)
