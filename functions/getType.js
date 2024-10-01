const getType = (value) => {
  const { emptySpaces, isNumber } = require("./kernel")

  if (typeof value === "boolean" || value === "true" || value === "false") return "boolean"
  if (typeof value === "object" && Array.isArray(value)) return "list"
  if (typeof value === "object") return "map"
  if (typeof value === "function") return "function"
  if (typeof value === "number" || (typeof value === "string" && isNumber(value))) {
    
    if ((value + "").length === 13 && (value + "").charAt(0) !== "0") return "timestamp"
    if (typeof value === "number") return "number"
    return "text"
  }
  if (typeof value === "string") return "text"
}
module.exports = { getType }