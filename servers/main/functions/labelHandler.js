const { generate } = require("./generate")
const { toStyle } = require("./toStyle")

module.exports = {
  labelHandler: ({ _window, tag, id }) => {

    var views = _window ? _window.views : window.views
    var view = views[id]

    if (typeof view.label === "string") view.label = { text: view.label }
    if (!view.container) view.container = {}

    // container
    var containerId = view.container.id || generate()
    var container = views[containerId] = {id: containerId, __index__: view.__index__, class: `flex column ${view.container.class || ""}`, style: { gap: ".5rem", ...view.container.style }, parent: view.id}
    var containerStyle = toStyle({ _window, id: containerId })
    var containerAtts = Object.entries(view.container.att || view.container.attribute || {}).map(([key, value]) => `${key}='${value}'`).join(" ")

    // label
    var labelId = view.label.id || generate()
    var label = views[labelId] = {id: labelId, __index__: 0, style: { fontSize: "1.3rem", textAlign: "left", ...view.label.style }, parent: containerId}
    var labelStyles = toStyle({ _window, id: labelId })
    var labelAtts = Object.entries(view.label.att || view.label.attribute || {}).map(([key, value]) => `${key}='${value}'`).join(" ")
    var labelTag = `<p ${labelAtts} ${label.editable || label.contenteditable ? "contenteditable ": ""}class='${label.class || ""}' id='${labelId}' style='${labelStyles}' index='0'>${view.label.text||""}</p>`

    // view
    view.__parent__ = containerId
    view.__index__ = 1
    
    return `<div ${containerAtts} ${container.draggable !== undefined ? `draggable='${container.draggable}'` : ''} spellcheck='false' ${container.editable && !container.readonly ? 'contenteditable' : ''} class='${container.class}' id='${containerId}' style='${containerStyle}' index='${container.__index__ || 0}'>${labelTag}${tag}</div>`
  }
}