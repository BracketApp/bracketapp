module.exports = {
    getImage: async ({ req, res }) => {
        
        var data = await require("axios/dist/browser/axios.cjs").get(req.headers.url, { responseType: "arraybuffer" })
          .then(res => {
            const buffer = Buffer.from(res.data, 'base64')
            console.log(buffer);
          })
          .catch(err => err.response.data)
          console.log(data);
          res.end(data)
    }
}