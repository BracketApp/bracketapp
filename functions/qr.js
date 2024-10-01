const { actions } = require("./kernel")

const qr = async ({ _window, id, req, res, data, __, e, stack, props, lookupActions, address }) => {

    if (res && !res.headersSent) return qrServer({ _window, id, req, res, data, __, e, stack, props, lookupActions, address })
    
    var QRCode = require("easyqrcodejs")

    // get image
    var view = window.views[data.id], imageEl
    if (view) imageEl = view.__element__
    
    var qrcode = new QRCode(document.getElementById(data.id), data)
    var data = { message: "QR generated successfully!", data: qrcode, success: true }

    console.log("QR", data)

    actions["wait()"]({ _window, lookupActions, id, e, asyncer: true, address, stack, props, req, res, __, _: data })
}

const qrServer = async ({ _window, id, req, res, data, __, e, stack, props, lookupActions, address }) => {

    var text = data.text || data.url
    if (data.wifi) text = wifiQrText({ data })

    var qrcode = await require('qrcode').toDataURL(text)
    var data = { message: "QR generated successfully!", data: qrcode, success: true }

    actions["wait()"]({ _window, lookupActions, id, e, asyncer: true, address, stack, props, req, res, __, _: data })
}

const wifiQrText = ({ data }) => {
    
    return `WIFI:S:${data.name || data.ssid || ""};T:${data.type || "WPA"};P:${data.password || ""};;${data.url || ""}`
}

module.exports = { qr }