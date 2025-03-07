const capitalize = (string, minimize) => {
  if (typeof string !== "string") return string

  if (minimize) return string
    .split(" ")
    .map((string) => string.charAt(0).toLowerCase() + string.slice(1))
    .join(" ")

  return string
      .split(" ")
      .map((string) => string.charAt(0).toUpperCase() + string.slice(1))
      .join(" ")
}

const capitalizeFirst = (string, minimize) => {
  if (typeof string !== "string") return string

  if (minimize) return string.charAt(0).toLowerCase() + string.slice(1)

  return string.charAt(0).toUpperCase() + string.slice(1)
}

module.exports = {capitalize, capitalizeFirst}
