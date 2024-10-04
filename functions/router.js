const { authorizer } = require("./authorizer")
const { getLocalFile } = require("./storageLocal")
const { openStack, endStack } = require("./stack")
const { isNumber, actions } = require("./kernel")
const { database, respond } = require("./database")
const { logger } = require("./logger")
const { parseCookies } = require("./cookie")

const detector = new (require('node-device-detector'))({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false,
})

// config
require('dotenv').config()

// project DB
const bracketDB = process.env.BRACKETDB

module.exports = ({ req, res }) => {

  const path = decodeURI(req.url).split("/"), id = "server"

  // storage/resources
  if (path[1] === "storage") return getLocalFile({ req, res })

  // initialize
  const _window = initializer({ id, req, res, path })
  const global = _window.global, __ = global.__

  // authorize
  authorizer({ _window, req, res })

  // open stack
  const stack = openStack({ _window, id, event: req.method.toLowerCase(), server: global.manifest.server, action: global.manifest.action })

  // address end server request
  actions["addresser()"]({ _window, id, stack, props: {}, __: [], object: [{}], data: { string: "send():[success=true;message=Done!]" } })

  // get view view
  const { data } = database({ _window, req, res, stack, props: {}, action: "search()", preventDefault: true, data: { collection: "view.application", doc: "server" } })

  // init view
  const view = { ...data, __customView__: "server", __viewPath__: ["server"], __customViewPath__: ["server"], __viewCollection__: "view.application", __prevViewCollection__: "view.application" }

  // lookup actions
  view.__lookupActions__ = [...global.__lookupActions__, { doc: "server", collection: "view.application" }]

  // log start render
  logger({ _window, data: { key: "server", start: true } })

  // address toView
  const address = actions["addresser()"]({ _window, id, status: "Start", type: "function", function: "toView", nextAddress: stack.addresses[0], stack, props: {}, __, data: { view }, logger: { key: "server", end: true } }).address

  // render view
  actions["view()"]({ _window, req, res, stack, props: { rendering: true }, __, address, lookupActions: view.__lookupActions__, data: { view } })

  // end stack
  endStack({ _window, stack })
}

const checkHost = ({ _window, global, host }) => {

  const props = {}
  let success = false, message

  // host is ip:port
  if (isIPv4(host)) {

    let port = host.split(":")[1] || "80"
    if (isNumber(port)) port = parseInt(port)
    else return ({ success, message: "Wrong port number!" })

    global.manifest.port = port
    message = "Port number is not registered!"
    props.findOne = { port }
  }

  // check host
  else {

    message = "Host is not registered!"
    props.findOne = { localhost: host }
  }

  // get host
  const { data } = database({ _window, action: "search()", data: { db: bracketDB, collection: "host", ...props } })

  // wrong port
  if (!data) return ({ success: false, message })

  // publicID
  global.manifest.publicID = data.publicID
  if (data.dev) global.manifest.dev = true

  return { success: true }
}

const initializer = ({ id, req, res }) => {

  // parse cookies (req.headers.cookies coming from client request)
  const host = req.headers.host
  const __ = req.body.data !== undefined ? [req.body.data] : []
  const props = req.body.__props__ || {}
  const lookupServerActions = props.lookupServerActions ? req.body.data : false
  const lookupActions = props.lookupActions || []
  const path = props.path || decodeURI(req.url).split("/")
  const page = props.page || path[1] || "main"
  const server = props.server || "renderer"
  const action = req.body.action || "createWebApp()"

  // cookies
  parseCookies(req, host)

  const global = {
    __,
    __lookupActions__: lookupActions,
    __authorized__: {},
    __queries__: { view: {} },
    __stacks__: {},
    __refs__: {},
    __events__: {},
    __calcTests__: {},
    __startAddresses__: {},
    __page__: page,
    __prevPage__: ["main"],
    __prevPath__: ["/"],
    __server__: { startTime: (new Date()).getTime() },

    //
    path: path.join("/"),
    manifest: {
      datastore: "bracketDB",
      server,
      host,
      page,
      path,
      action,
      lookupServerActions,
      os: req.headers["sec-ch-ua-platform"],
      browser: req.headers["sec-ch-ua"],
      cookies: req.cookies,
      device: detector.detect(req.headers['user-agent']),
    },
    data: { view: {} }
  }

  const views = { [id]: { id } }
  const _window = { views, global, req, res }

  // check host
  const { success, message } = checkHost({ host, _window, global })
  if (!success) {
    respond({ res, __, response: { success, message } }) // wrong host
    process.exit()
  }

  // log
  console.log((new Date()).getHours() + ":" + (new Date()).getMinutes() + " " + req.method, path.join("/"), action || "");

  return _window
}

const isIPv4 = (host) => {
  const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(host);
}