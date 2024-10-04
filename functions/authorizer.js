const { actions } = require("./kernel")
const { database } = require("./database")
const { logger } = require("./logger")
const { generate } = require("./generate")

// config
require('dotenv').config()

// project DB
const bracketDB = process.env.BRACKETDB

const authorizer = ({ _window, req, res }) => {

  const global = _window.global

  logger({ _window, data: { key: "authorization", start: true } })

  const { data, success, message } = getSession({ _window, req, res })
  global.manifest.session = data

  logger({ _window, data: { key: "authorization", end: true } })

  if (!success) {
    respond({ res, __, response: { success, message } }) // not auth
    process.exit()
  }
}

const getSession = ({ _window, req }) => {

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
      database({ _window, req, action: "erase()", data: { db: bracketDB, collection: "session", find: { expiryDate: { "<": (new Date()).getTime() - 259200000 } } } })
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

  // plugins
  getPlugins({ _window, publicID: session.publicID, session })

  // activity
  // recordActivity({ _window, session })

  return { data: session, success: true }
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

const getPlugins = ({ _window, publicID, session }) => {

  // recheck subscriptions
  let accessabilities = [], subscriptions = []

  // get subscriptions
  let { data } = database({ _window, action: "search()", data: { db: bracketDB, collection: "subscription", find: { expiryDate: { greater: new Date().getTime() }, publicID } } })
  subscriptions = Object.values(data || {})

  // get plugins
  if (subscriptions.length > 0) {
    let { data } = database({ _window, action: "search()", data: { db: bracketDB, collection: "accessability", find: { packageID: { in: subscriptions.map(subs => subs.packageID) } } } })
    accessabilities = Object.values(data || {})
  }

  // accessabilities
  accessabilities = accessabilities.map(({ accessabilities }) => accessabilities).flat()

  if (session) session.plugins = accessabilities

  return accessabilities
}

module.exports = { authorizer }