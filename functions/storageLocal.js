const fs = require("fs")
const mime = require('mime-types')

const getLocalFile = ({ req, res }) => {
  
  let path = req.url.split("?")[0].slice(1)
  let timer = new Date().getTime()
  let docType = path.split(".").slice(-1)[0]
  let contentType = mime.contentType(docType)
  let file = fs.createReadStream(path)
  
  res.setHeader("Content-Type", contentType)
  res.setHeader('Cache-Control', 'max-age=604800')
  res.setHeader("Expires", new Date(Date.now() + 604800000).toUTCString())

  // gzip
  if (path.split("/").slice(-1)[0] === "engine.js") res.setHeader("Content-Encoding", "gzip")

  file.on("open", () => {
    
    let stream = file.pipe(res)
    stream.on("finish", () => {
  
      console.log(path, new Date().getTime() - timer);
    })
  })
}

const postFile = ({  req, res, save = {} }) => {
  //
}

const deleteFile = ({  req, res, erase = {} }) => {
  //
}

module.exports = { getLocalFile, postFile, deleteFile }