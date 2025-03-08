const http = require('node:http')
const fs = require("fs")
// const EasyTunnel = require("./functions/easy-tunnel")
const { getData, start, postData, database, getFolderNames, getDocNames } = require("../db/functions/database")
const router = require('./functions/router')
const { generate } = require('./functions/generate')
const { connectToWebSocket, createWebSocket } = require('./functions/websocket')
const minify = require('@node-minify/core')
const terser = require('@node-minify/terser')
const { gzip, ungzip } = require('node-gzip')

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

  getFolderNames("../storage/cache").map(cacheID => {
    getDocNames(`../storage/cache/${cacheID}`).map(id => {
      fs.unlinkSync(filePath(`../storage/cache/${cacheID}/${id}`))
    })
  })

  // minify
  minify({
    compressor: terser,
    input: "../storage/resources/engine.js",
    output: "../storage/resources/engine.js",
    callback: async (err, min) => {
      
      let engine = await gzip(fs.readFileSync("../storage/resources/engine.js"))
      fs.writeFileSync("../storage/resources/engine.js", engine)
    }
  });

  //createWebSocket()

  // get hosts
  return fetch("http://localhost:3000", { method: "POST", body: JSON.stringify({ action: "search()", data: { db: bracketDB, collection: "host", find: { port: { gte: 80 } } } })})
    .then(response => response.json())
    .then(({ data }) => Object.values(data).map(host => host.port.map(port => start(port, generate({ unique: true })))))
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