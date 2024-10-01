module.exports = {
  isParam: ({ _window, string = "" }) => {
    
    if (string.slice(0, 2) === "@$" && string.length === 7) string = (_window ? _window.global : window.global).__refs__[string].data

    if (string.includes("=") || string.includes(";") || string === "return()" || string.slice(0, 1) === "!" || string.includes(">") || string.includes("<")) return true
    return false
  }
}