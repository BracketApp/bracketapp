const { actions } = require("./kernel")
const { database, respond } = require("./database")
const { logger } = require("./logger")
const { generate } = require("./generate")
const fs = require("fs")
const { gzip } = require("node-gzip")

// config
require('dotenv').config()

// project DB
const bracketDB = process.env.BRACKETDB

const authorizer = async ({ _window, req, res }) => {

  const global = _window.global

  logger({ _window, data: { key: "authorization", start: true } })

  const { data, success, message } = await getSession({ _window, req, res })
  global.manifest.session = data

 logger({ _window, data: { key: "authorization", end: true } })

  if (!success) respond({ res, response: { success, message } }) // not auth

  return { success }
}

const getSession = async ({ _window, req, res, success = true, cached = false }) => {

  const global = _window.global, sessionID = global.manifest.cookies.__session__

  // get session by sessionID
  if (sessionID) {

    // get session
    let { data: session } = database({ _window, req, action: "search()", data: { db: bracketDB, collection: "session", findOne: { "__props__.id": sessionID, publicID: global.manifest.publicID } } })
    global.manifest.session = session

    // session expired
    if (!session || session.expiryDate < new Date().getTime()) {

      // delete old session
      if (session) database({ _window, req, action: "erase()", data: { db: bracketDB, collection: "session", doc: session.__props__.doc } })

      // create session
      createSession({ _window, req, session })

      // session garbage collector
      let { data: sessions } = database({ _window, req, action: "erase()", data: { db: bracketDB, collection: "session", find: { expiryDate: { "<": (new Date()).getTime() - 259200000 } } } })
      
      // remove sessions
      removeAppCaches(sessions)

    } else {
      let canLoadCache = session.path.join("/") === global.manifest.path.join("/") && session.host === global.manifest.host && global.manifest.action === "createWebApp()"
      
      updateSession({ _window, req, session })
      global.manifest.session.canLoadCache = canLoadCache
    }
  }

  // create session
  if (!global.manifest.session) createSession({ _window, req })

  // session
  const session = global.manifest.session

  // permissions
  if (session.userID) {
    const { data: permissions } = database({ _window, req, action: "search()", data: { db: bracketDB, collection: "permission", findOne: { userID: { equal: session.userID } } } })
    session.permissions = permissions || {}
  }

  // accsessabilities
  getAccessabilities({ _window, publicID: session.publicID, session })

  // activity
  // recordActivity({ _window, session })

  return { data: session, success, cached }
}

const updateSession = ({ _window, req, session }) => {
  if (_window.global.manifest.action === "createWebApp()") {
    session.path = _window.global.manifest.path
  }
  session.expiryDate = new Date().getTime() + 86400000
  _window.global.manifest.session = session = database({ _window, req, action: "save()", data: { db: bracketDB, collection: "session", data: session } }).data
}

const createSession = ({ _window, req, res, session = {} }) => {

  const global = _window.global

  // project
  let { data: project } = database({ _window, req, action: "search()", data: { db: bracketDB, collection: "project", findOne: { publicID: global.manifest.publicID } } })

  // project does not exist
  if (!project) return { message: "Project does not exist!", success: false }

  // session
  const newSession = {

    // related to the opened project not the user
    publicID: project.publicID,
    projectID: project.__props__.id,
    projectDoc: project.__props__.doc,
    subdomain: project.subdomain,
    host: global.manifest.host,
    path: global.manifest.path,
    db: project.db,
    storage: project.storage,
    devDB: project.devDB || "",
    dev: global.manifest.dev || false,
    expiryDate: new Date().getTime() + 86400000,
    encryptionKey: generate(),

    // related to the user logged in to the platform
    userID: session.userID || "",
    username: session.username || "",
  }

  // save
  global.manifest.session = session = database({ _window, req, action: "save()", data: { db: bracketDB, collection: "session", data: newSession } }).data

  return { data: session, success: true, message: "Session created successfully!" }
}

const recordActivity = ({ _window, session }) => {

  let todayStart = actions["todayStart()"]({}), hourStart = actions["hourStart()"]({}), now = actions["now()"]({})

  // user activity
  const userActivity = () => {


    if (!session.userID) return
    let { data: userActivity } = database({ _window, action: "search()", data: { db: bracketDB, collection: "userActivity", findOne: { date: todayStart, userID: session.userID } } })
    if (!userActivity) userActivity = { firstTrigger: now, serverTriggers: 0, date: todayStart, userID: session.userID, activityPerHour: [] }

    // day activity
    userActivity.serverTriggers += 1
    userActivity.lastTrigger = now

    // hour activity
    if (!userActivity.activityPerHour.find(({ time }) => time === hourStart)) {
      userActivity.activityPerHour.push({ time: hourStart, firstTrigger: now, serverTriggers: 0 })
    }

    let hourActivity = userActivity.activityPerHour[userActivity.activityPerHour.length - 1]
    hourActivity.serverTriggers += 1
    hourActivity.lastTrigger = now

    database({ _window, action: "save()", data: { db: bracketDB, collection: "userActivity", data: userActivity, verified: true } })
  }

  // project activity
  const projectActivity = () => {

    let { data: projectActivity } = database({ _window, action: "search()", data: { db: bracketDB, collection: "projectActivity", findOne: { date: todayStart, projectID: session.projectID } } })
    if (!projectActivity) projectActivity = { firstTrigger: now, serverTriggers: 0, date: todayStart, projectID: session.projectID, activityPerHour: [] }

    // day activity
    projectActivity.serverTriggers += 1
    projectActivity.lastTrigger = now

    // hour activity
    if (!projectActivity.activityPerHour.find(({ time }) => time === hourStart)) {
      projectActivity.activityPerHour.push({ time: hourStart, firstTrigger: now, serverTriggers: 0 })
    }
    
    let hourActivity = projectActivity.activityPerHour[projectActivity.activityPerHour.length - 1]
    hourActivity.serverTriggers += 1
    hourActivity.lastTrigger = now

    database({ _window, action: "save()", data: { db: bracketDB, collection: "projectActivity", data: projectActivity, verified: true } })
  }

  userActivity()
  projectActivity()
}

const getAccessabilities = ({ _window, publicID, session }) => {

  // get subscriptions
  let { data: subscriptions } = database({ _window, action: "search()", data: { db: bracketDB, collection: "subscription", find: { expiryDate: { greater: new Date().getTime() }, publicID } } })
  subscriptions = Object.values(subscriptions || {})

  // get accessabilities
  if (subscriptions.length === 0) return session.accessabilities = []

  let { data: accessabilities } = database({ _window, action: "search()", data: { db: bracketDB, collection: "accessability", find: { packageID: { in: subscriptions.map(subs => subs.packageID) } } } })
  accessabilities = Object.values(accessabilities || {})

  // accessabilities
  session.accessabilities = accessabilities.map(({ accessabilities }) => accessabilities).flat()

  // if (session) session.accessabilities = accessabilities
}

const getCache = ({_window}) => {
  
  const session = _window.global.manifest.session
  const cacheID = session.dev ? session.devDB : session.db

  if (!session.canLoadCache) return ({})

  if (!fs.existsSync(`cache/${cacheID}/${session.__props__.id}`)) return ({})

  logger({ _window, data: { key: "LoadCache", start: true } })

  let data = fs.readFileSync(`cache/${cacheID}/${session.__props__.id}`)

  return {data}
}

const appCacheHandler = async ({ _window, lookupActions, stack, props, id, address, req, res, __, data }) => {

  // encode
  data = await gzip(data)

  res.setHeader("Content-Encoding", "gzip")
  res.write(data)
  res.end()

  logger({ _window, data: { key: "LoadCache", end: true } })

  actions["stackManager()"]({ _window, lookupActions, stack, props, id, address, req, res, __ })
}

const removeAppCaches = (sessions) => {
  Object.values(sessions).map(session => {
    if (fs.existsSync(`cache/${session.dev ? session.devDB : session.db}/${session.__props__.id}`))
      fs.unlinkSync(`cache/${session.dev ? session.devDB : session.db}/${session.__props__.id}`)
})
}

module.exports = { authorizer, appCacheHandler, getCache }