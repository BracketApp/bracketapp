const { decode } = require("./decode")
const { toArray } = require("./toArray")

const _colors = ["#a35521", "#1E90FF", "#FF4500", "#02ad18", "#5260FF", "#bf9202", "#6b6b6e", "#e649c6"]
const arabic = /[\u0600-\u06FF\u0750-\u077F]/
const english = /[a-zA-Z]/

const colorize = ({ _window, string, start = "[", index = 0, colors = _colors }) => {

  colors = toArray(colors)
  
  if (index === 8) index = 1
  if (typeof string !== "string") return string

  string = string.replaceAll("<", "&#60;").replaceAll(">", "&#62;")
  string = string.replaceAll("[]", "__map__")

  // comment
  if (string.charAt(0) === "#" || string.includes("?#") || string.includes(";#") || string.includes("[#")) {

    var string0 = "", operator = ""
    if (string.split("?#")[1]) {

      string0 = string.split("?#")[0]
      operator = "?"

    } else if (string.split(";#")[1]) {

      string0 = string.split(";#")[0]
      operator = ";"

    } else if (string.split("[#")[1]) {

      string0 = string.split("[#")[0]
      operator = "["
    }

    var key = !operator ? string : string.split(string0 + operator).slice(1).join(string0 + operator)

    // comment
    var comment = key.split("?")[0].split(";")[0]
    // [params;#comment]
    if (comment.split("]")[1] !== undefined) comment = key.split("]")[0]

    var string1 = key.split(comment).slice(1).join(comment)
    string1 = colorize({ _window, string: string1, index, colors })

    if (string0) string0 = colorizeCoded({ _window, index, string: string0, colors })

    string = string0 + operator + `<span contenteditable style="background-color:#00000000; color: green; white-space:nowrap">${decode({ _window, string: comment })}</span>` + string1

  } else string = colorizeCoded({ _window, index, string, colors })

  if (index !== 0) string = `<span contenteditable style="background-color:#00000000; color:${colors[index]}; white-space:nowrap">${string}</span>`

  // ?
  string = string.replaceAll("?", "<u>?</u>").replaceAll("__map__", `<span style="color:blue">[]</span>`)

  return string
}

const colorizeCoded = ({ _window, index, string, colors }) => {

  var global = _window ? _window.global : window.global
  var slicer = string.split("@$")
  if (slicer.length < 2) return string
  if (!global.__refs__["@$" + slicer[1].slice(0, 5)]) return (slicer.slice(0, 2).join("@$") + (slicer[2] ? colorize({ _window, index, string: "@$" + slicer.slice(2).join("@$"), colors }) : ""))
  
  var text = ""

  var string0 = slicer[0]
  var string1 = colorize({ _window, index, string: slicer.slice(1).join("@$").slice(5), colors })
  var reference = global.__refs__["@$" + slicer[1].slice(0, 5)]

  if (typeof reference === "object") {

    var data = ""
    if (reference.type === "code") data = colorize({ _window, string: "[" + reference.data + "]", index: index + 1, colors })
    else data = `<span contenteditable style="background-color:#00000000; color:${colors[index + 1]}; white-space:nowrap">'${reference.data}'</span>`

    text += string0 + data + string1
  }

  return text || string
}

module.exports = { colorize }