const http = require('node:http');
const { saveDB, database } = require('../main/functions/database');
const { generate } = require('../main/functions/generate');

const port = 3000;

let queue = [];

const queueHandler = (req, res) => {
    
    const params = {
        data: req.body.data,
        _window: { global: { manifest: req.body.manifest || {}, __queries__: {}, __authorized__: {} } },
        req,
        res,
        action: req.body.action,
        stack: {
            executionStartTime: (new Date()).getTime(),
            action: req.body.action,
            logs: [],
            server: "queue"
        }
    };

    queue.push(params);
    
    if (queue.length === 1) {

        while (queue.length > 0) {
          //console.log(q.req.serverID, req.serverID);

            let q = queue[0]
            let queriedData = database(q);

            q.res.setHeader('Content-Type', 'application/json')
            q.res.write(JSON.stringify(queriedData))
            q.res.end()
            queue.shift();
        }
    }
};

// create app
const app = (req, res) => {

  // parse body
  res.statusCode = 200
  req.body = []
  req
    .on('data', chunk => req.body.push(chunk))
    .on('end', () => {

      req.serverID = generate()
      req.body = JSON.parse(Buffer.concat(req.body).toString() || "{}")
      queueHandler(req, res);
    })
}

const server = http.createServer(app)

server.listen(port, () => {

  console.log(`Server Listening to Port ${port}`)
})