const { decode } = require("./decode")
const { generate } = require("./generate")
const { toArray } = require("./toArray")

const openStack = ({ _window, id: viewID, string = "", ...data }) => {

  const stack = {
    ...data,
    print: false,
    id: generate(),
    viewID,
    terminated: false,
    broke: false,
    returned: false,
    interpreting: true,
    string: string ? decode({ _window, string }) : "",
    executionStartTime: (new Date()).getTime(),
    executedActions: [],
    addresses: [],
    logs: [],
    returns: []
  }

  //stack.logs.push(`# Status TYPE ID Index Action => HeadID HeadIndex HeadAction`)
  //stack.logs.push(`1 Start STACK ${stack.id} ${stack.event.toUpperCase()} ${stack.string}`)

  const global = _window ? _window.global : window.global
  global.__stacks__[stack.id] = stack

  return stack
}

const clearStack = ({ stack }) => {

  console.log("STACK", (new Date()).getTime() - stack.executionStartTime, stack, props.event.toUpperCase())

  stack.terminated = true
  stack.addresses = []
}

const endStack = ({ _window, stack, props }) => {

  if (stack.addresses.length !== 0)  return

  const global = _window ? _window.global : window.global
  const logs = `%cSTACK ${(new Date()).getTime() - stack.executionStartTime} ${stack.event}`
  // stack.logs.push(`${stack.logs.length} End STACK ${(new Date()).getTime() - stack.executionStartTime} ${stack.id} ${stack.event}`)

  // remove stack
  delete global.__stacks__[stack.id]

  // print stack
  stack.print && !stack.printed && console.log("STACK:" + stack.event, logs, "color: blue", stack, props.logs)
  stack.printed = true
  stack.status = "End"
}

module.exports = { openStack, clearStack, endStack }