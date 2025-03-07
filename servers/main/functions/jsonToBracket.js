const jsonToBracket = (object, field) => {

  if (!object) return ""

  var string = ""
  var length = Object.entries(object).length

  Object.entries(object).map(([key, value], index) => {
    if (field) key = `${field}.${key}`

    if (Array.isArray(value)) {

      if (value.length === 0) string += `${key}=:[]`
      else string += `${key}=:${value.join(":")}`

    } else if (typeof value === "object") {

      if (Object.keys(value).length === 0) string += `${key}=[]`
      else {
        var path = jsonToBracket(value).split(";")
        string += path.map(path => `${key}.${path}`).join(";")
      }

    } else if (typeof value === "string") string += `${key}='${value}'`
    else string += `${key}=${value}`

    if (index < length - 1) string += ";"
  })

  return string || ""
}

module.exports = {jsonToBracket}
