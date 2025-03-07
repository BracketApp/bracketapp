const { generate } = require("./generate")

const toId = ({ string, checklist = [] }) => {

  var newId
  string = string.split(" ").join("-").toLowerCase()
  var candidates = [
    string, string.split("-").join(""), string.split("-").slice(1).join("-") + string.split("-")[0],
    string + "1", string + "2", string + "3", string + "4", string + "5", string + "6", string + "7",
    string + "8", string + "9", string + "10", string + "11", string + "12", string + "13", string + "14",
    string + "15", string + "16", string + "17", string + "18", string + "19", string + "20", string + "21"
  ]

  candidates.map(cand => {

    if (newId) return
    var exists = checklist.find(id => id === cand)
    if (!exists) newId = cand
  })

  if (!newId) newId = generate(12)
  // checklist.push(newId)

  return newId
}

module.exports = { toId }
