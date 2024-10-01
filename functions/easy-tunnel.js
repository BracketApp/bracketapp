const { exec } = require("child_process")
require("colors")
 
class EasyTunnel {
    /**
     * 
     * @param {number} port 
     * @param {string} subdomain 
     */
    constructor(port, subdomain) {

        this.port = port
        this.subdomain = subdomain
    }

    /*
     * Start the EasyTunnel
     * @param {string} [status] used so redigging does not show initial dig message
    */
   
    start(status) {
        if (status != 'redig') console.log(`> Tunnel on port ${this.port.toString().cyan} at ${("https://" + this.subdomain + ".loca.lt").green}`)
        exec(`lt -s ${this.subdomain} --port ${this.port}`, async (err, out) => {
            if (err === null || err.toString().includes('connection refused')) {
                this.start("redig")
                console.log("> Redigging tunnel")
            } else if (out) console.log("out");
        })
    }
}

module.exports = EasyTunnel