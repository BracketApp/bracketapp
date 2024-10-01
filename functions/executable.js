const {isParam} = require("./isParam")

module.exports = {
    executable: ({ _window, string, encoded = true }) => {
        return typeof string === "string" && (string.includes("()") || (encoded ? string.slice(0, 2) === "@$" || isParam({ _window, string }) : false) || string.includes("_"))
    }
}