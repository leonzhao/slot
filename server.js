'use strict'

const server = require('http').createServer()
const io = require('socket.io')(server)

io.on('connection', function (client) {
  console.log('connected socket server:', client.id)
  client.on('event', function (client) {
    console.log('>>> recevied one event')
  })
  client.on('disconnect', function (reason) {
    console.log('>>> disconnected from client: ', reason)
  })
  client.on('echo', function (data) { console.log('>>', data) })
  client.emit('event', 'haha')
})

io.on('disconnect', (client) => {
  console.log('disconnect client: ', client.id)
})

setInterval(() => {
  let start = Date.now()
  io.emit('new message', start)
}, 2000)
server.listen(3000)
