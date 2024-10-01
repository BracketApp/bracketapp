const isCalc = ({ _window, string }) => {

    if (typeof string !== "string") return false
    
    var global = _window ? _window.global : window.global
    if (string.slice(0, 2) === "@$" && string.length === 7) string = global.__refs__[string].data

    // recheck after decoding
    if (typeof string !== "string") return false

    // tested before
    if (global.__calcTests__[string]) return true
    else if (global.__calcTests__[string] === false) {
        delete global.__calcTests__[string]
        return false
    }

    if (!string.includes(",") && ((string.includes("/") && string.split("/")[1] !== "") || (string.includes("%") && string.split("%")[1] !== "") || string.includes("||") || string.includes("*") || string.includes("+") || string.includes("-")))
    return true

    else return false
}

module.exports = { isCalc }