const { decode } = require("./decode")
const { addEventListener } = require("./kernel")
const { toArray } = require("./toArray")

const toEvent = ({ _window, id, string, __, lookupActions, stack, props }) => {

  var view = _window ? _window.views[id] : window.views[id]

  if (view.__rendered__) addEventListener({ event: string, id, __, stack, props, lookupActions })
  else toArray(view.__controls__).push({ event: decode({_window, string}), __, lookupActions })
  
  return "__event__"
}

module.exports = { toEvent }