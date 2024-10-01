const encoded = (string) => {
    if (typeof string !== "string") return false
    return (string.slice(0, 2) === "@$" && string.length === 7)
}

module.exports = { encoded }