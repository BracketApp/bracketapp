const decode = ({ _window, string }) => {

  const global = _window ? _window.global : window.global
  if (typeof string !== "string") return string

  string.split("@$").map((state, i) => {

    if (i === 0) return string = state

    let code = state.slice(0, 5)
    let after = state.slice(5)
    let statement = (global.__refs__[`@$${code}`] || {}).data

    let prev, next
    if ((global.__refs__[`@$${code}`] || {}).type === "text") {
      prev = "'"
      next = "'"
    } else {
      prev = "["
      next = "]"
    }

    statement = decode({ _window, string: statement })
    string += prev + statement + next + after
  })

  return string
}

module.exports = { decode }
