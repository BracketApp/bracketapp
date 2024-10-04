const http = require('node:http')
// const EasyTunnel = require("./functions/easy-tunnel")
const { getData, start, postData, database } = require("./functions/database")
const router = require('./functions/router')
const { generate } = require('./functions/generate')
const networkInterfaces = require('os').networkInterfaces()
const { connectToWebSocket, createWebSocket } = require('./functions/websocket')

// config
require('dotenv').config()

// project DB
const bracketDB = process.env.BRACKETDB

// get private ip
const serverID = global.serverID = process.argv[3]

// port
const port = parseInt(process.argv[2])

// get hosts => run applications
if (!port) {

  //createWebSocket()

  // get hosts
  const { data } = database({ action: "search()", data: { db: bracketDB, collection: "host", find: { port: { gte: 80 } } } })
  return Object.values(data).map(host => host.port.map(port => start(port, generate({ unique: true }))))
}

// Connect to the WebSocket server
//const ws = connectToWebSocket({ serverID, port })

// create app
const app = (req, res) => {

  // parse body
  res.statusCode = 200
  req.body = []
  req
    .on('data', chunk => req.body.push(chunk))
    .on('end', () => {

      //req.ip = ip
      res.serverID = serverID
      //req.ws = ws
      req.body = JSON.parse(Buffer.concat(req.body).toString() || "{}")
      router({ req, res })
    })
}

const server = http.createServer(app)

server.listen(port, "0.0.0.0", () => {

  console.log(`Server Listening to Port ${port}`)
  // new EasyTunnel(port, "brc" + host.subdomain).start()
})