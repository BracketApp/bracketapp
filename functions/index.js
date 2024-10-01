const { setCookie } = require("./cookie")
const { defaultAppEvents, initView, eventExecuter, starter, addEventListener } = require("./kernel")


window.views = JSON.parse(document.getElementById("views").textContent)
window.global = JSON.parse(document.getElementById("global").textContent)

//
var views = window.views
var global = window.global

views.document.__element__ = document
views.document.__rendered__ = true

// in some casese path changes when rendering
history.replaceState(null, global.manifest.title, global.manifest.path.join("/"))

// cookies
if (global.manifest.cookies) setCookie({ cookies: global.manifest.cookies })

// session
setCookie({ name: "__session__", value: global.manifest.session })

// app default event listeneres
defaultAppEvents()

// start app
var relatedEvents = views.document.__idList__.map(id => starter({ id }))

// document built-in events
views.document.__controls__.map(controls => addEventListener({ id: "document", ...controls, event: controls.event }))

// loaded events
views.document.__idList__.map(id => views[id] && views[id].__loadedEvents__.map(data => eventExecuter(data)))

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