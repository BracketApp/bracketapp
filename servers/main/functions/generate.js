const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
const numbers = "1234567890"

const generate = (params = {}) => {

  var { length, number, unique, universal, timestamp } = params

  var result = "", chars = number ? numbers : characters

  var charactersLength = chars.length
  var time = (new Date()).getTime() + ""

  if (unique) length = 26
  else if (!unique && !length) length = 5

  if (universal)
    for (let i = 0; i < 13; i++) {
      result += chars.charAt(Math.floor(Math.random() * charactersLength)) + chars.charAt(Math.floor(Math.random() * charactersLength))
      result += time[i]
    }

  else
    for (let i = 0; i < (unique && length >= 26 ? length - 13 : length); i++) {
      result += chars.charAt(Math.floor(Math.random() * charactersLength))
      if (unique && length >= 26 && i <= 13) result += time[i]
    }

    // timestamp => ex. xxxxxxxxxxxxxxxT(xxxxxxxxxxxxx:timestamp)
    if (typeof timestamp === "number") result += "T" + timestamp
    else if (timestamp) result += "T" + time

  return result
}

module.exports = { generate }
