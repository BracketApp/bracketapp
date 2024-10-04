const { setCookie } = require("./cookie")
const { defaultAppEvents, initView, eventExecuter, starter, addEventListener } = require("./kernel")
const { openStack, endStack } = require("./stack")

window.views = JSON.parse(document.getElementById("views").textContent)
window.global = JSON.parse(document.getElementById("global").textContent)

//
const views = window.views, global = window.global

views.document.__element__ = document
views.document.__rendered__ = true

//
global.__refs__ = {}
global.__stacks__ = {}
global.__startAddresses__ = {}

// in some casese path changes when rendering
history.replaceState(null, global.manifest.title, global.manifest.path.join("/"))

// cookies
if (global.manifest.cookies) setCookie({ cookies: global.manifest.cookies })

// session
setCookie({ name: "__session__", value: global.manifest.session })

// app default event listeneres
defaultAppEvents()

// init stack
const stack = openStack({ id: "document" })

// get views ids (slice document id)
const idList = views.document.__html__.split("id='").slice(1).map(id => id.split("'")[0]).slice(1)

// start app
const relatedEvents = idList.map(id => starter({ id, stack }))

// document built-in events
views.document.__controls__.map(controls => addEventListener({ id: "document", ...controls, event: controls.event }))

// loaded events
idList.map(id => views[id] && views[id].__loadedEvents__.map(data => eventExecuter(data)))

// related events
relatedEvents.map(relatedEvents => {
    Object.entries(relatedEvents).map(([eventID, addresses]) => {
        Object.values(addresses).map(address => views[eventID] && views[eventID].__rendered__ && views[eventID].__element__.addEventListener(address.event, address.eventListener))
    })
})

// window
initView({ views, global, id: "window" })

// load arabic font
var arDiv = document.createElement("P")
arDiv.innerHTML = "مرحبا"
arDiv.classList.add("ar")
arDiv.style.position = "absolute"
arDiv.style.top = "-1000px"
views.body.__element__.appendChild(arDiv)

endStack({ stack })