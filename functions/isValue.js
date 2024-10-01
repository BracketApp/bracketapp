const { isCalc } = require("./isCalc")

const isValue = ({ _window, string }) => {

    if (typeof string !== "string") return false
    
    var global = _window ? _window.global : window.global
    if (string.slice(0, 2) === "@$" && string.length === 7) string = global.__refs__[string].data

    // recheck after decoding
    if (typeof string !== "string") return false

    if (isCalc({ _window, string })) return true

    else return false
}

module.exports = { isValue }