const async = require('async')
const sc = require('socket.io-client')
const debug = require('debug')('client')

function connect (url, connections, callback) {
  let clients = []
  let inits = []

  let start = Date.now()
  console.log('>>> start:', start)
  for (let i = 0; i < connections; ++i) {
    inits.push(next => {
      let con = sc.connect(url, {})
      con.on('connect', () => {
        debug('connected sessionid: ', i, con.id)
        clients.push(con)
        next()
      })
      con.on('disconnect', reason => {
        debug('disconnect for:', reason)
      })
    })
  }

  async.parallel(inits, err => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    callback(clients)
  })
}

function connectServer (url, connections) {
  return new Promise((resolve, reject) => {
    let clients = []
    for (let i = 0; i < connections; ++i) {
      let client = sc.connect(url, {})
      client.on('connect', () => {
        debug('client connected: ', i, client.id)
        clients.push(client)
      }).on('new message', start => {
        let end = Date.now() - start 
        debug('received new message:', client.id, ':', end)
      })
    }
    // return clients
    resolve(clients)
  })
  
}

function disconnect (clients) {
 for (let i = 0; i < clients.length; ++i) {
   let c = clients[i]
   debug('disconnect client: ', c.id)
   c.disconnect()
 }
}

async function test () {
  debug('>>> start load test')
  let clients = await connectServer('http://localhost:3000', 10)
  debug('>>> setup connections')


  process.on('exit', () => {
    disconnect(clients)
  })
}

function testSync() {
  connect('http://localhost:3000', 100, (clients) => {
    debug('>>> setup connections')
    process.on('exit', () => {
      disconnect(clients)
    })
  })
}
test()
// testSync()