const fs = require("fs")
const mime = require('mime-types')

var getLocalFile = ({ req, res }) => {
  
  var path = req.url.split("?")[0].slice(1)
  var timer = new Date().getTime()
  var docType = path.split(".").slice(-1)[0]
  var contentType = mime.contentType(docType)
  var file = fs.createReadStream(path)
  
  res.setHeader('Cache-Control', 'max-age=604800')
  res.setHeader("Expires", new Date(Date.now() + 604800000).toUTCString())

  file.on("open", () => {
    
    res.setHeader("Content-Type", contentType)
    var stream = file.pipe(res)
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