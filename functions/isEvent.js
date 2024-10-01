var events = require("./events.json")

const isEvent = ({ _window, string }) => {

    var global = _window ? _window.global : window.global
    
    if (string.split("?").length > 1) {

        string = string.split("?")[0]
        // ex: [[click??conditions]?params]
        if (string.slice(0, 2) === "@$" && string.length == 7) string = global.__refs__[string].data
        string = string.split(";")[0]
        // ex: [[click??conditions];[keyup??conditions]?params]
        if (string.slice(0, 2) === "@$" && string.length == 7) string = global.__refs__[string].data
        // ex: click:id
        string = string.split(":")[0]
        if (events.includes(string)) return true
        else return false

    } else return false
}

module.exports = { isEvent }