const { generate } = require("./generate")
const { toArray } = require("./toArray")
const { isEqual } = require("./isEqual")
const { capitalizeFirst, capitalize } = require("./capitalize")
const { clone } = require("./clone")
const { getDateTime } = require("./getDateTime")
const { getDaysInMonth } = require("./getDaysInMonth")
const { getType } = require("./getType")
const { exportJson } = require("./exportJson")
const { setCookie, getCookie, eraseCookie, parseCookies } = require("./cookie")
const { focus } = require("./focus")
const { toSimplifiedDate } = require("./toSimplifiedDate")
const { toClock } = require("./toClock")
const { note } = require("./note")
const { isParam } = require("./isParam")
const { lengthConverter, resize } = require("./resize")
const { replaceNbsps } = require("./replaceNbsps")
const { colorize } = require("./colorize")
const { override, merge } = require("./merge")
const { nthParent, nthNext, nthPrev } = require("./getView")
const { decode } = require("./decode")
const { executable } = require("./executable")
const { toEvent } = require("./toEvent")
const { isEvent } = require("./isEvent")
const { isCondition } = require("./isCondition")
const { isCalc } = require("./isCalc")
const { logger } = require("./logger")
const { openStack, clearStack, endStack } = require("./stack")
const { watch } = require("./watch")
const { isArabic } = require("./isArabic")
const cssStyleKeyNames = require("./cssStyleKeyNames")
const events = require("./events.json")
const builtinEvents = require("./builtinEvents.json")
const myViews = ["View", "Input", "Text", "Image", "Icon", "Action", "Audio", "Video", "Link"]

// config
const executableRegex = /\(\)|@|^_+$/;
const { encoded } = require("./encoded")
const { jsonToBracket } = require("./jsonToBracket")

const actions = {
    "global()": () => _window ? _window.global : window.global,
    "scope()": ({object}) => object,
    "e()": () => e,
    "con()": () => console,
    "str()": () => String,
    "obj()": () => Object,
    "arr()": () => Array,
    "win()": () => _window || window,
    "his()": () => _window ? {} : history,
    "nav()": () => _window ? {} : navigator,
    "req()": () => req,
    "res()": () => res,
    "math()": () => Math,
    "id()": ({ o }) => {
        if (typeof o === "object" && o.__props__) return o.__props__.id
    },
    "doc()": ({ o }) => {
        if (typeof o === "object" && o.__props__) return o.__props__.doc
    },
    "if()": () => { }, // inorder not to check in actions
    "__props__()": ({ o, args }) => {
        if (args[1] === "clearActions") return clearActions(o)
    },
    "caret()": ({ o }) => ({ index: getCaretIndex(o) }),
    "device()": ({ global }) => global.manifest.device.device,
    "mobile()": ({ global }) => global.manifest.device.device.type === "smartphone",
    "desktop()": ({ global }) => global.manifest.device.device.type === "desktop",
    "tablet()": ({ global }) => global.manifest.device.device.type === "tablet",
    "stack()": ({ stack }) => stack,
    "props()": ({ object, lookupActions, props, __, stack }) => ({ object, lookupActions, props, __, stack }),
    "address()": ({ stack }) => stack.addresses.find(({ id }) => id === stack.interpretingAddressID),
    "toInt()": ({ o }) => {

        if (!isNumber(o)) return
        return Math.round(toNumber(o))
    }, "clicked()": ({ global, key, value, pathJoined }) => {

        if (key && value !== undefined) global.__droplistPositioner__ = global.__clicked__ = value
        return global.__clicked__

    }, "clicker()": ({ global }) => {

        return global.__clicker__
    }, "focused()": ({ global, key, value }) => {


        if (key && value !== undefined) global.__focused__ = value
        return global.__focused__
    }, "click()": ({ _window, global, views, o, id, pathJoined, e, args, req, res, __, object, lookupActions, stack }) => {

        if (!o.__view__) return

        /*if (_window) return o.__controls__.push({
            event: `loaded?${pathJoined}`
        })*/

        if (!o.__rendered__) return
        const params = toParam({ req, res, _window, lookupActions, stack, object, id, data: args[1], __, e })

        global.__clicker__ = views[id]
        global.__clicked__/* = global.__droplistPositioner__*/ = o

        if (params.default) {
            o.__element__.click()
            return o
        }

        o.__events__.map(event => event.event === "click" && event.eventListener({...e, target: o}))
        // related events
        global.__events__[o.id] && Object.values(global.__events__[o.id]).map(event => event.event === "click" && event.eventListener({...e, target: o}))
        //o.__element__.click()
        return o

    }, "focus()": ({ _window, o, global, views, pathJoined, id, e }) => {

        if (!o.__view__) return

        if (_window) return o.__controls__.push({
            event: `loaded?${pathJoined}`
        })

        global.__clicker__ = views[id]
        global.__focused__/* = global.__droplistPositioner__*/ = o
        focus({ id: o.id || id, e })
        return true

    }, "blur()": ({ _window, view, views, global, o, pathJoined }) => {

        if (!o.__view__) return

        if (_window) return view.__controls__.push({
            event: `loaded?${pathJoined}`
        })

        o.__element__.blur()
        return true

    }, "event()": ({ o }) => {
        toEvent({ _window, event: args[1], action: args[2], id: o.id, __, lookupActions, stack, props })
    }, "mousedown()": ({ o }) => {

        if (!o.__view__) return
        const mousedownEvent = new Event("mousedown")
        o.__element__.dispatchEvent(mousedownEvent)
    }, "mouseup()": ({ o }) => {
        if (!o.__view__) return
        const mouseupEvent = new Event("mouseup")
        o.__element__.dispatchEvent(mouseupEvent)
    }, "mouseenter()": ({ o }) => {

        if (!o.__view__) return
        const mouseenterEvent = new Event("mouseenter")
        o.__element__.dispatchEvent(mouseenterEvent)
    }, "mouseleave()": ({ o }) => {

        if (!o.__view__ || !o.__rendered__) return
        const mouseleaveEvent = new Event("mouseleave")
        o.__element__.dispatchEvent(mouseleaveEvent)
    }, "keyup()": ({ o }) => {
        if (!o.__view__) return
        const keyupevent = new Event("keyup")
        o.__element__.dispatchEvent(keyupevent)
    }, "keydown()": ({ o }) => {
        if (!o.__view__) return
        const keyupevent = new Event("keydown")
        o.__element__.dispatchEvent(keyupevent)
    }, "name()": ({ _window, o, id, e, __, args, object }) => {

        const name = toValue({ _window, id, e, object, data: args[1], props: { isValue: true }, __ })
        if (name === o.__name__) return o
        const children = getDeepChildren({ _window, id: o.id || id })
        return children.find(view => view.__name__ === name)

    }, "names()": ({ _window, o, id, e, __, args, object }) => {

        const name = toValue({ _window, id, e, object, data: args[1], props: { isValue: true }, __ })
        const children = getDeepChildren({ _window, id: o.id || id })
        return children.filter(view => view.__name__ === name)

    }, "tag()": ({ _window, id, e, object, args, __ }) => {

        var tag = toValue({ _window, id, e, object, data: args[1], props: { isValue: true }, __ }), styles = ""
        if (!tag.type) tag.type = "span"

        if (tag.style) {
            Object.entries(tag.style).map(([style, value]) => {
                styles += `${cssStyleKeyNames[style] || style}:${value}; `
            })

            styles = styles.slice(0, -2)
        }

        return `<${tag.type} style="${styles}" class="${tag.class || ""}">${tag.text || ""}</${tag.type}>`

    }, "width()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.width = value
        else return o.__element__.offsetWidth / 10 + "rem"

    }, "height()": ({ o, key, value }) => {

        if (!o.__view__) return
        
        if (key && value !== undefined) return o.__element__.style.height = value
        else return o.__element__ && o.__element__.offsetHeight ? (o.__element__.offsetHeight / 10 + "rem") : o.style.height

    }, "border()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.border = value
        else return o.__element__.border

    }, "left()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.left = value
        else return o.__element__.left

    }, "right()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.right = value
        else return o.__element__.right

    }, "cursor()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.cursor = value
        else return o.__element__.cursor

    }, "transform()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.transform = value
        else return o.__element__.transform

    }, "color()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.color = value
        else return o.__element__.color

    }, "border()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.border = value
        else return o.__element__.border

    }, "borderRight()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.borderRight = value
        else return o.__element__.borderRight

    }, "borderLeft()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.borderLeft = value
        else return o.__element__.borderLeft

    }, "borderTop()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.borderTop = value
        else return o.__element__.borderTop

    }, "borderBottom()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.borderBottom = value
        else return o.__element__.borderBottom

    }, "borderRadius()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.borderRadius = value
        else return o.__element__.borderRadius

    }, "backgroundColor()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.backgroundColor = value
        else return o.__element__.backgroundColor

    }, "padding()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.padding = value
        else return o.__element__.padding

    }, "paddingRight()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.paddingRight = value
        else return o.__element__.paddingRight

    }, "paddingLeft()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.paddingLeft = value
        else return o.__element__.paddingLeft

    }, "paddingTop()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.paddingTop = value
        else return o.__element__.paddingTop

    }, "paddingBottom()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.paddingBottom = value
        else return o.__element__.paddingBottom

    }, "top()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.top = value
        else return o.__element__.top

    }, "right()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.right = value
        else return o.__element__.right

    }, "bottom()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.bottom = value
        else return o.__element__.bottom

    }, "left()": ({ o, key, value }) => {

        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.left = value
        else return o.__element__.left

    }, "display()": ({ o, value, key }) => {

        if (!o.__view__) return
        return o.__element__.style.display = ["flex", "none", "block"].includes(value) ? value : "flex"

    }, "scale()": ({ _window, o, id, e, __, args, object, lastIndex, value, i, key, props = {} }) => {

        if (!o.__view__) return
        var scale = toValue({ _window, id, e, data: args[1], __, object, props: { isValue: true } }) || 0
        var transform = o.__element__.style.transform || ""

        if (key && i === lastIndex && value !== undefined) return o.__element__.style.transform = (transform ? " " : "") + `scale(${value})`
        else if (props.isCondition || (!args[1] && i === lastIndex)) return getNumberAfterString(o.__element__.style.transform, "scale(") || 0
        return o.__element__.style.transform = (transform ? " " : "") + `scale(${scale})`

    }, "rotate()": ({ _window, o, id, e, __, args, object, lastIndex, value, i, key, props }) => {

        if (!o.__view__) return
        var angle = toValue({ _window, id, e, data: args[1], __, object, props: { isValue: true } }) || 0
        var transform = o.__element__.style.transform || ""

        if (key && i === lastIndex && value !== undefined) return o.__element__.style.transform = (transform ? " " : "") + `rotate(${value}deg)`
        else if (props.isCondition || (!args[1] && i === lastIndex)) return getNumberAfterString(o.__element__.style.transform, "rotate(") || 0
        return o.__element__.style.transform = (transform ? " " : "") + `rotate(${angle}deg)`

    }, "pointerEvents()": ({ o, key, value }) => {
        
        if (!o.__view__) return
        if (key && value !== undefined) return o.__element__.style.pointerEvents = value
        else return o.__element__.pointerEvents

    }, "hide()": ({ o }) => {

        if (!o.__view__) return
        return o.__element__.style.display = "none"

    }, "hidden()": ({ o }) => {

        if (!o.__view__) return true
        return o.__element__.style.display === "none"

    }, "fade()": ({ _window, id, e, object, args, __, value, key, lastIndex, i, o }) => {

        var opacity = toValue({ _window, id, e, object, data: args[1], __, props: { isValue: true } }) || 0
        var timer = toValue({ _window, id, e, object, data: args[2], __, props: { isValue: true } }) || 0

        if (key && lastIndex === i && value !== undefined) return o.__element__.style.opacity = 1 - value
        if (!o.__view__) return
        if (timer) o.__element__.style.transition += `, opacity ${timer}ms`
        return o.__element__.style.opacity = 1 - opacity

    }, "fadeIn()": ({ o }) => {

        if (!o.__view__) return false
        return o.__element__.style.opacity = 1

    }, "fadeOut()": ({ o }) => {

        if (!o.__view__) return false
        return o.__element__.style.opacity = 0

    }, "opacity()": ({ _window, id, e, object, args, __, value, key, lastIndex, i, o }) => {

        if (!o.__view__) return
        if (key && lastIndex === i && value !== undefined) return o.__element__.style.opacity = value

        var opacity = toValue({ _window, id, e, object, data: args[1], __, props: { isValue: true } }) || 0
        var timer = toValue({ _window, id, e, object, data: args[2], __, props: { isValue: true } }) || 0

        if (timer) o.__element__.style.transition += `, opacity ${timer}ms`
        return o.__element__.style.opacity = opacity

    }, "style()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        if (!o.__view__) return
        if (!args[1]) {
            if (!o.__element__) {
                o.style = o.style || {}
                return o.style
            } return o.__element__.style
        }

        var styles = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, e, __, data: args[1], object })

        if (Object.keys(styles).length > 0) {

            var obj = o.__element__ ? o.__element__ : o
            if (obj.__view__) obj.style = obj.style || {}

            Object.entries(styles).map(([key, value]) => {
                obj.style[key] = value
            })
        }
        return styles

    }, "qrcode()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        // wait address
        let { address, data } = actions["addresser()"]({ _window, stack, props, args, status: "Start", asynchronous: true, id: o.id || id, action: "qrcode()", object, lookupActions, __, id })
        
        if (stack.server) return require("./database").qrCode({ _window, id, req, res, data, e, __, stack, props, address, lookupActions })
        else return qrcode({ _window, id, req, res, data, e, __, stack, props, address, lookupActions })

    }, "contact()": ({ _window, req, res, o, id, e, __, args, object }) => {

        var data = toValue({ req, res, _window, id, e, __, data: args[1], object, props: { isValue: true } })
        if (typeof data !== "obejct") return o

        if (stack.server) return require("./database").vcard({ _window, id, req, res, data, e, __ })
        else return vcard({ _window, id, req, res, data, e, __ })

    }, "bracket()": ({ o }) => {

        if (typeof o === "object") return require("./jsonToBracket").jsonToBracket(o)

    }, "inputs()": ({ _window, views, o, stack, props, lookupActions, id }) => {

        if (!o.__view__) return
        var inputs = [], textareas = [], editables = []

        if (!o.__rendered__) {
            if (o.__name__ === "Input") return [o]
            var findInputs = (view) => {
                if (o.__name__ !== "View") return
                o.__childrenRef__.map(({ id }) => {
                    if (views[id].__name__ === "Input") return inputs.push(o)
                    else if (views[id].__name__ === "View") findInputs(view)
                })
            }
            return inputs
        }

        inputs = o.__element__.getElementsByTagName("INPUT")
        textareas = o.__element__.getElementsByTagName("TEXTAREA")
        editables = getDeepChildren({ _window, lookupActions, stack, props, id: o.id || id }).filter(view => view.editable)
        if (o.editable) editables.push(o)

        return [...inputs, ...textareas, ...editables].map(o => views[o.id || id])

    }, "input()": ({ _window, views, o, stack, props, lookupActions, id }) => {

        if (!o.__view__) return
        let inputs = [], textareas = [], editables = [], input

        if (!o.__rendered__) {
            if (o.__name__ === "Input") return o
            let findInput = (view) => {
                for (let i = 0; i <= view.__childrenRef__.length - 1; i++) {
                    if (input) return
                    let id = view.__childrenRef__[i].id
                    if (views[id].__name__ === "Input") input = views[id]
                    else if (views[id].__name__ === "View") findInput(views[id])
                }
            }
            if (o.__name__ === "View") findInput(o)
            return input
        }

        inputs = o.__name__ === "Input" ? [o.__element__] : o.__element__.getElementsByTagName("INPUT")
        textareas = o.__element__.getElementsByTagName("TEXTAREA")
        editables = getDeepChildren({ _window, lookupActions, stack, props, id: o.id || id }).filter(view => view.editable)
        if (o.editable) editables.push(o)

        if ([...inputs, ...textareas, ...editables].length === 0) return
        return views[[...inputs, ...textareas, ...editables][0].id]

    }, "px()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        if (args[1]) return lengthConverter(toValue({ req, res, _window, lookupActions, object, stack, props: { isValue: true }, id, e, __, data: args[1] }))
        return lengthConverter(o)

    }, "touchable()": ({ _window, global }) => {

        if (_window) return global.manifest.device.device.type === "smartphone"
        else return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0))

    }, "class()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, answer, object }) => {

        if (!o.__view__) return
        var className = toValue({ req, res, _window, lookupActions, object, stack, props: { isValue: true }, id, e, __, data: args[1] })

        var answer = [...o.__element__.getElementsByClassName(className)]
        return answer.map(o => window.views[o.id || id])

    }, "classList()": ({ o }) => {

        if (!o.__view__) return
        return [...o.__element__.classList]

    }, "log()": ({ _window, req, res, o, stack, props, pathJoined, lookupActions, id, e, __, args, k, underScored, object, i }) => {

        var logs = args.slice(1).map(arg => toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, e, __: underScored ? [o, ...__] : __, data: arg, object }))
        if (args.slice(1).length === 0 && pathJoined !== "log()") logs = [o]

        logs.unshift("LOG:" + (o.id || id), decode({ _window, string: pathJoined }))
        console.log(...logs)
        stack.logs && stack.logs.push(stack.logs.length, ...logs)

        //if (_window) saveToLogs({ _window, logs })
        return o
    
    }, "parent()": ({ _window, o }) => {

        if (!o.__view__) return
        return nthParent({ _window, nth: 1, o }) || null

    }, "2ndParent()": ({ _window, o }) => {

        if (!o.__view__) return
        return nthParent({ _window, nth: 2, o }) || null

    }, "3rdParent()": ({ _window, o }) => {

        if (!o.__view__) return
        return nthParent({ _window, nth: 3, o }) || null

    }, "nthParent()": ({ _window, o, stack, props, lookupActions, id, e, __, args, object }) => {

        if (!o.__view__) return
        var nth = toValue({ _window, id, e, lookupActions, stack, props: { isValue: true }, __, data: args[1], object })

        return nthParent({ _window, nth, o }) || null

    }, "prevSiblings()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[o.__parent__].__childrenRef__.slice(0, o.__index__ + 1).map(({ id }) => views[id])

    }, "nextSiblings()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return o
        return views[o.__parent__].__childrenRef__.slice(o.__index__ + 1).map(({ id }) => views[id])

    }, "siblings()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return o
        var children = clone(views[o.__parent__].__childrenRef__)
        children.splice(o.__index__, 1)
        return children.map(({ id }) => views[id])

    }, "next()": ({ _window, o }) => {

        if (!o.__view__) return
        return nthNext({ _window, nth: 1, o }) || null

    }, "2ndNext()": ({ _window, o }) => {

        if (!o.__view__) return
        return nthNext({ _window, nth: 2, o }) || null

    }, "3rdNext()": ({ _window, o }) => {

        if (!o.__view__) return
        return nthNext({ _window, nth: 3, o }) || null

    }, "nthNext()": ({ _window, o, stack, props, lookupActions, id, e, __, args, object }) => {

        if (!o.__view__ || !o.id) return
        var nth = toValue({ _window, __, data: args[1], e, id, lookupActions, stack, props: { isValue: true }, object })
        return nthNext({ _window, nth, o }) || null

    }, "last()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[views[o.__parent__].__childrenRef__.slice(-1)[0].id] || null

    }, "lastSibling()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[views[o.__parent__].__childrenRef__.slice(-1)[0].id] || null

    }, "2ndLast()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[views[o.__parent__].__childrenRef__.slice(-2)[0].id] || null

    }, "3rdLast()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[views[o.__parent__].__childrenRef__.slice(-3)[0].id] || null

    }, "nthLast()": ({ _window, views, o, stack, props, lookupActions, id, e, __, args, object }) => {

        if (!o.__view__ || !o.id) return
        var nth = toValue({ _window, __, data: args[1], e, id, lookupActions, stack, props: { isValue: true }, object })
        if (!isNumber(nth)) return false
        return views[views[o.__parent__].__childrenRef__.slice(-1 * nth)[0].id] || null

    }, "1stSibling()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[views[o.__parent__].__childrenRef__[0].id] || null

    }, "2ndSibling()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[views[o.__parent__].__childrenRef__[1].id] || null

    }, "3rdSibling()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[views[o.__parent__].__childrenRef__[2].id] || null

    }, "nthSibling()": ({ _window, views, o, stack, props, lookupActions, id, e, __, args, object }) => {

        if (!o.__view__ || !o.id) return
        var nth = toValue({ _window, id, e, __, data: args[1], lookupActions, stack, object, props: { isValue: true } })
        return views[views[o.__parent__].__childrenRef__[nth - 1].id] || null

    }, "grandChild()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return o.__childrenRef__[0] && views[views[o.__childrenRef__[0].id].__childrenRef__[0].id] || null

    }, "grandChildren()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return o.__childrenRef__[0] && views[o.__childrenRef__[0].id].__childrenRef__.map(({ id }) => views[id]) || null

    }, "prev()": ({ _window, o }) => {

        if (!o.__view__) return
        return nthPrev({ _window, nth: 1, o }) || null

    }, "2ndPrev()": ({ _window, o }) => {

        if (!o.__view__) return
        return nthPrev({ _window, nth: 2, o }) || null

    }, "3rdPrev()": ({ _window, o }) => {

        if (!o.__view__) return
        return nthPrev({ _window, nth: 3, o }) || null

    }, "nthPrev()": ({ _window, o, stack, props, lookupActions, id, e, __, args, object }) => {

        if (!o.__view__ || !o.id) return
        var nth = toValue({ _window, id, e, __, data: args[1], object, lookupActions, stack, props: { isValue: true } })
        return nthPrev({ _window, nth, o }) || null

    }, "1stChild()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return o.__childrenRef__[0] && views[o.__childrenRef__[0].id] || null

    }, "child()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return o.__childrenRef__[0] && views[o.__childrenRef__[0].id] || null

    }, "2ndChild()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return o.__childrenRef__[1] && views[o.__childrenRef__[1].id] || null

    }, "3rdChild()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return o.__childrenRef__[2] && views[o.__childrenRef__[2].id] || null

    }, "nthChild()": ({ _window, views, o, stack, props, lookupActions, id, e, __, args, object }) => {

        if (!o.__view__ || !o.id) return
        var nth = toValue({ _window, __, data: args[1], e, id, stack, object, props: { isValue: true }, lookupActions })
        if (!isNumber(nth)) return false
        return o.__childrenRef__[nth - 1] && views[o.__childrenRef__[nth - 1].id] || null

    }, "3rdLastChild()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[o.__childrenRef__.slice(-3)[0].id] || null

    }, "2ndLastChild()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[o.__childrenRef__.slice(-2)[0].id] || null

    }, "lastChild()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[o.__childrenRef__.slice(-1)[0].id] || null

    }, "nthLastChild()": ({ _window, views, o, id, e, __, args, object }) => {

        if (!o.__view__ || !o.id) return
        var nth = toValue({ _window, __, data: args[1], e, id, object, props: { isValue: true } })
        if (!isNumber(nth)) return false
        return views[o.__childrenRef__.slice(-1 * nth)[0].id] || null

    }, "children()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return o.__childrenRef__.map(({ id }) => views[id])

    }, "lastEl()": ({ o }) => {

        return o[o.length - 1]

    }, "2ndLastEl()": ({ o }) => {

        return o[o.length - 2]

    }, "3rdLastEl()": ({ o }) => {

        return o[o.length - 3]

    }, "nthLastEl()": ({ _window, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var nth = toValue({ _window, __, data: args[1], e, id, lookupActions, stack, object, props: { isValue: true } })
        return o[o.length - nth]

    }, "while()": ({ _window, global, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        while (toApproval({ req, res, _window, lookupActions, stack, object, props: { isValue: true }, id, data: args[1], __, e })) {
            toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, data: args[2], __, e })
        }
        return true

    }, "data()": ({ _window, req, res, global, o, stack, props, lookupActions, id, e, __, args, object, i, lastIndex, value, key, path, breakRequest }) => {

        /*if (o.__props__) {
            var {__props__, ...data} = o
            return data
        }*/
        if (!o.__view__) return
        //
        // if (key && value !== undefined) o.__defaultValue__ = value

        breakRequest.break = true

        var data = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] || "" })

        if (data.path) return answer = kernel({ req, res, _window, lookupActions, stack, props, id, e, data: { data: data.data || global[data.form || o.form], value, key, path: data.path }, __, object })

        if (!o.form) return

        // ex: data()=value => ().data=value
        //if (i === lastIndex && key && value !== undefined) o.data = value
        var myPath = [...o.__dataPath__, ...path.slice(i + 1)]

        // np path
        if (myPath.length === 0 && key && value !== undefined) return global[o.form] = value
        else if (myPath.length === 0) return global[o.form]

        return kernel({ req, res, _window, lookupActions, stack, props, id, data: { path: myPath, data: global[o.form], value, key }, __, e, object })

    }, "form()": ({ _window, req, res, global, views, o, stack, props, lookupActions, id, e, __, args, object, i, value, key, path, breakRequest, answer }) => {

        breakRequest.break = true
        var form = o.__view__ ? o.form : views[id].form

        if (args[1]) {

            if (isParam({ _window, string: args[1] })) {

                data = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })
                args[1] = data.path || data.__dataPath__ || []
                if (typeof args[1] === "string") args[1] = args[1].split(".")

                return answer = reducer({ req, res, _window, lookupActions, stack, props, id, e, data: { value, key, path: [`${form}:()`, ...args[1], ...path.slice(i + 1)] }, object, __ })
            }

            if (args[1].slice(0, 2) === "@$") args[1] = global.__refs__[args[1]].data
            args[1] = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, data: args[1], __, e })
            if (typeof args[1] === "string") args[1] = args[1].split(".")

            return answer = reducer({ req, res, _window, lookupActions, stack, props, id, e, data: { value, key, path: [`${form}:()`, ...args[1], ...path.slice(i + 1)] }, object, __ })
        }

        if (path[i + 1] !== undefined) {

            if (path[i + 1] && path[i + 1].slice(0, 2) === "@$") path[i + 1] = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, data: global.__refs__[path[i + 1]].data, __, e, object })
            answer = reducer({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, e, data: { value, key, path: [`${form}:()`, ...path.slice(i + 1)] }, object, __ })

        }

        else if (key && value !== undefined) {
            answer = global[form] = value
            o.data = value
        }

        else answer = global[form]

        return answer

    }, "installApp()": ({ global }) => {

        const installApp = async () => {

            global.__installApp__.prompt();
            const { outcome } = global.__installApp__.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
        }

        installApp()

    }, "clearTimer()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var timer = args[1] ? toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, data: args[1], __, e, object }) : o
        return clearTimeout(timer)

    }, "clearInterval()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var timer = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, data: args[1], __, e, object }) || o
        return clearInterval(timer)

    }, "interval()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        if (!o.__view__) return
        if (!isNaN(toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, data: args[2], __, e }))) { // interval():params:timer

            var timer = parseInt(toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, data: args[2], __, e, object }))
            var myFn = () => toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, e, __, data: args[1], object })
            return setInterval(myFn, timer)
        }

    }, "repeat()": ({ _window, req, res, stack, props, lookupActions, id, e, __, args, object, i }) => {

        var item = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, data: args[1], __, e, object })
        var times = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, data: args[2], __, e, object })
        var loop = []
        for (var i = 0; i < times; i++) {
            loop.push(item)
        }
        return loop

    }, "timer()": ({ _window, o, stack, props, lookupActions, id, e, __, args, object, answer, pathJoined }) => { // timer():params:timer:repeats

        if (_window) return console.log("Cannot run a timer in server => " + decode({ _window, string: pathJoined }))

        const timer = args[2] ? parseInt(toValue({ lookupActions, stack, props: { isValue: true }, id, data: args[2], __, e, object })) : 0
        const repeats = args[3] ? parseInt(toValue({ lookupActions, stack, props: { isValue: true }, id, data: args[3], __, e, object })) : false
        const string = decode({ string: args[1] })
        const myFn = () => eventExecuter({ event: "Timer", eventID: id, lookupActions, id, string, __, e, object })

        if (typeof repeats === "boolean") {

            if (repeats === true) answer = setInterval(myFn, timer)
            else if (repeats === false) answer = setTimeout(myFn, timer)

        } else if (typeof repeats === "number") {

            answer = []
            answer.push(setTimeout(myFn, timer))
            
            if (repeats > 1) {
                for (let index = 0; index < repeats; index++) {
                    answer.push(setTimeout(myFn, timer))
                }
            }
        }

        if (o.__view__) toArray(answer).map(timer => o.__timers__.push(timer))
        return answer

    }, "slice()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object, answer }) => { // slice by text or by number

        if (!Array.isArray(o) && typeof o !== "string" && typeof o !== "number") return

        var start = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, e, data: args[1], __, object })
        var end = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, e, data: args[2], __, object })

        if (end !== undefined) {

            if (!isNaN(end)) {

                if (!isNaN(start)) answer = o.slice(parseInt(start), parseInt(end))
                else {
                    answer = o.split(start)[1]
                    answer = answer.slice(0, end)
                }

            } else {

                if (!isNaN(start)) answer = o.slice(parseInt(start))
                else answer = o.split(start)[1]
                answer = answer.split(end)[0]
            }

        } else {

            if (!isNaN(start)) answer = o.slice(parseInt(start) || 0)
            else answer = o.split(start)[1]
        }
        return answer

    }, "reduce()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, value, key, object }) => { // o.reduce():[path=]

        var data = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, data: args[1], __ })
        if (Array.isArray(data) || typeof data !== "object") data = { path: data }
        return reducer({ _window, lookupActions, stack, props, id, data: { path: data.path, key: data.data !== undefined, value: data.data !== undefined ? data.data : value }, object: [o, ...object], e, req, res, __ })

    }, "path()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, lastIndex, value, key, object }) => {

        if (!o.__view__) return
        var data = {}
        if (args[1]) {

            if (isParam({ _window, string: args[1] })) {

                data = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })

            } else data.path = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, e, data: args[1], __, object })
        }

        if ((key && value !== undefined && lastIndex) || data.value !== undefined) {

            if (data.path !== undefined) return toArray(data.path).reduce((o, k, i) => {
                if (i === data.path.length - 1) return o[k] = data.value !== undefined ? data.value : value
                else return o[k]
            }, o)

            else return o.__dataPath__

        } else {

            if (data.path !== undefined) return toArray(data.path).reduce((o, k) => o[k], o)
            else return o.__dataPath__
        }

    }, "reload()": () => {

        document.location.reload(true)

    }, "contains()": ({ _window, req, res, views, o, stack, props, lookupActions, id, e, __, args, answer, object, pathJoined }) => {
        
        var first = o, next = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, data: args[1], __, e, object })
        if (!first || !next) return

        if (typeof first === "string") first = views[first]
        if (typeof next === "string") next = views[next]

        if (first.nodeType === Node.ELEMENT_NODE) first = views[first.id]
        if (next.nodeType === Node.ELEMENT_NODE) next = views[next.id]

        if (!first.__view__ || !next.__view__) return

        if (first.__element__.nodeType === Node.ELEMENT_NODE && next.__element__.nodeType === Node.ELEMENT_NODE) {
            answer = first.__element__.contains(next.__element__)
            if (!answer) answer = first.__element__.id === next.__element__.id
        }
       
        return answer

    }, "in()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var next = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, data: args[1], __, e, object })

        if (next) {
            if (typeof o === "string" || Array.isArray(o) || typeof o === "number") return next.includes(o)
            else if (typeof o === "object") return next[o] !== undefined
            else if (o.nodeType === Node.ELEMENT_NODE && next.nodeType === Node.ELEMENT_NODE) return next.contains(o)
        } else return false

    }, "is()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var b = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, data: args[1], __, e })
        return isEqual(o, b)

    }, "opp()": ({ o }) => {

        if (typeof o === "number") return -1 * o
        else if (typeof o === "boolean") return !o
        else if (typeof o === "string" && o === "true" || o === "false") {
            if (o === "true") return false
            else return true
        }

    }, "neg()": ({ o }) => {

        return o < 0 ? o : -o

    }, "pos()": ({ o }) => {

        return o > 0 ? o : o < 0 ? -o : o

    }, "sum()": ({ o }) => {

        return o.reduce((o, k) => o + toNumber(k), 0)

    }, "src()": ({ o, lastIndex, value, key }) => {

        if (!o.__view__) return

        if (lastIndex && key && value !== undefined) return o.__element__.src = value
        else return o.__element__.src

    }, "clear()": ({ o }) => {

        if (!o.__view__) return
        o.__element__.value = null
        o.__element__.text = null
        o.__element__.files = null
        return o

    }, "list()": ({ o, answer }) => {

        answer = toArray(o)
        return [...answer]

    }, "notify()": ({ _window, req, res, stack, props, lookupActions, id, e, __, args, object }) => {

        var notify = () => {
            if (isParam({ _window, string: args[1] })) {

                var _params = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })
                new Notification(_params.title || "", _params)

            } else {

                var title = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })
                new Notification(title || "")
            }
        }

        if (!("Notification" in window)) {
            // Check if the browser supports notifications
            alert("This browser does not support notification");
        } else if (Notification.permission === "granted") {
            // Check whether notification permissions have already been granted;
            // if so, create a notification
            notify()
            // …
        } else if (Notification.permission !== "denied") {

            // We need to ask the user for permission
            Notification.requestPermission().then((permission) => {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    notify()
                    // …
                }
            });
        }

    }, "alert()": ({ _window, req, res, stack, props, lookupActions, id, e, __, args, object }) => {

        var text = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, data: args[1], __, e })
        alert(text)

    }, "clone()": ({ o }) => {

        return clone(o)

    }, "override()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var obj1 = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, data: args[1], __, e })
        override(o, obj1)

    }, "icon()": ({ views, o }) => {

        if (o.__name__ === "Icon") return o

        var icon

        var findIcon = (view) => {
            if (view.__name__ !== "View") return
            view.__childrenRef__.map(({ id }) => {
                if (icon) return
                if (views[id].__name__ === "Icon") icon = views[id]
                else findIcon(views[id])
            })
        }

        findIcon(o)
        return icon

    }, "icons()": ({ views, o }) => {

        if (o.__name__ === "Icon") return [o]

        var icons = []

        var findIcons = (view) => {
            if (view.__name__ !== "View") return
            view.__childrenRef__.map(({ id }) => {
                if (views[id].__name__ === "Icon") icons.push(views[id])
                else findIcons(views[id])
            })
        }

        findIcons(o)
        return icons

    }, "txt()": ({ views, o, i, lastIndex, value, key, path, breakRequest, answer, pathJoined }) => {

        if (!o.__view__) return

        if (o.__name__ === "Icon") return o.name

        var el
        if ((o.__islabel__ || o.__labeled__) && o.__name__ !== "Input") el = o.__element__.getElementsByTagName("INPUT")[0]
        else if (views[o.id].__status__ === "Mounted") el = o.__element__

        if (value) value = replaceNbsps(value)

        if (el) {

            if (views[el.id].__name__ === "Input") {

                answer = el.value
                if (i === lastIndex && key && value !== undefined && o.__element__) answer = el.value = value
                else if (path[i + 1] === "del()") {
                    breakRequest.index = i + 1
                    answer = el.value = ""
                }

            } else {

                answer = (el.textContent === undefined) ? el.innerText : el.textContent
                if (i === lastIndex && key && value !== undefined) answer = el.innerHTML = value
                else if (path[i + 1] === "del()") {
                    breakRequest.index = i + 1
                    answer = el.innerHTML = ""
                }
            }

        } else {

            if (i === lastIndex && key && value !== undefined) answer = views[o.id].text = value
            else if (path[i + 1] === "del()") {
                breakRequest.index = i + 1
                answer = views[o.id].text = ""
            }
            answer = views[o.id].text
        }
        return answer

    }, "min()": ({ o, i, lastIndex, value, key }) => {

        if (!o.__view__) return

        if (i === lastIndex && key && value !== undefined) o.min = value
        return o.min

    }, "max()": ({ o, i, lastIndex, value, key }) => {

        if (!o.__view__) return

        if (i === lastIndex && key && value !== undefined) o.max = value
        return o.max

    }, "push()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object, i, path, _object }) => {

        if (!Array.isArray(o)) o = kernel({ req, res, _window, id, stack, props: { isValue: true }, data: { data: _object, path: path.slice(0, i), value: [], key: true }, __, e, object })

        var item = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, data: args[1], __, e, object })
        var index = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, data: args[2], __, e, object })

        if (!Array.isArray(o)) return
        if (index === undefined) index = o.length || 0

        if (Array.isArray(item)) {

            item.map(item => {
                o.splice(index, 0, item)
                index += 1
            })

        } else if (Array.isArray(o)) o.splice(index, 0, item)

        return o

    }, "pushItems()": ({ _window, req, res, o, id, e, __, args, object }) => {

        args.slice(1).map(arg => {
            arg = toValue({ req, res, _window, id, data: args[1], __, e, object, props: { isValue: true } })
            o.splice(o.length, 0, arg)
        })
        return o

    }, "pullIndex()": ({ _window, o, stack, props, lookupActions, id, e, __, args, object, i, lastIndex, pathJoined }) => { // pull by index

        if (!Array.isArray(o)) {
            if (stack.server) return o
            else throw "Pulling index from a non list => " + decode({ _window, string: pathJoined })
        }

        // if no index pull the last element
        var lastIndex = 1, firstIndex = 0
        if (args[1]) firstIndex = toValue({ _window, id, data: args[1], __, e, lookupActions, stack, props: { isValue: true }, object })
        if (args[2]) lastIndex = toValue({ _window, id, data: args[2], __, e, lookupActions, stack, props: { isValue: true }, object })

        o.splice(firstIndex, lastIndex || 1)
        return o

    }, "pull()": ({ _window, o, stack, props, lookupActions, id, e, __, args, object, pathJoined }) => { // pull by conditions

        if (!Array.isArray(o)) {
            if (stack.server) return o
            else throw "Pulling from a non list at pull() => " + decode({ _window, string: pathJoined })
        }
        var items = o.filter(o => toApproval({ _window, e, data: args[1], id, object: [o, ...object], __, lookupActions, stack, props }))

        items.filter(data => data !== undefined && data !== null).map(_item => {
            var _index = o.findIndex(item => isEqual(item, _item))
            if (_index !== -1) o.splice(_index, 1)
        })

        return o

    }, "pullItem()": ({ _window, o, id, e, __, args, stack, props, object, pathJoined }) => { // pull by item

        if (!Array.isArray(o)) {
            if (stack.server) return o
            else throw "Pulling item from a non list => " + decode({ _window, string: pathJoined })
        }
        var item = toValue({ _window, id, data: args[1], __, e, props: { isValue: true }, object })
        var index = o.findIndex(_item => isEqual(_item, item))
        if (index !== -1) o.splice(index, 1)
        return o

    }, "pullLast()": ({ _window, o, stack, props, pathJoined }) => {

        if (!Array.isArray(o)) {
            if (stack.server) return o
            else throw "Pulling last item from a non list => " + decode({ _window, string: pathJoined })
        }
        // if no it pulls the last element
        o.splice(o.length - 1, 1)
        return o

    }, "rem()": ({ _window, id, o, stack, props, __, e, object, args }) => {

        if (!o.__view__) return
        var data = toValue({ _window, id, data: args[1], __, e, props: { isValue: true }, object })
        remove({ id: o.id, __, stack, props, data })
        return true

    }, "keys()": ({ o }) => {

        return Object.keys(o)

    }, "key()": ({ o, i, lastIndex, value, key }) => {

        if (i === lastIndex && value !== undefined && key) return Object.keys(o)[0] = value
        else return Object.keys(o)[0]

    }, "entries()": ({ o }) => {
        return Object.entries(o)
    }, "values()": ({ o }) => { // values in an object

        if (Array.isArray(o)) return o
        else return Object.values(o)

    }, "value()": ({ o, i, lastIndex, value, key }) => { // value 0 in an object

        if (i === lastIndex && value !== undefined && key) return o[Object.keys(o)[0]] = value
        else return Object.values(o)[0]

    }, "gen()": ({ _window, req, res, stack, props, lookupActions, id, e, __, args, object }) => {

        if (isParam({ _window, string: args[1] })) {

            var data = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })
            return generate(data)

        } else {

            var length = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] }) || 5
            return generate({ length })
        }

    }, "inc()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var item = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, data: args[1], __ })

        if (typeof o === "string") return o.split(item).length > 1
        else if (Array.isArray(o)) return o.find(_item => isEqual(_item, item)) ? true : false

    }, "incAny()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, answer, object }) => {

        var items = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, data: args[1], __ })
        answer = false

        if (typeof o === "string") {

            items.map(item => {

                if (answer) return
                answer = o.split(item).length > 1
            })

        } else if (Array.isArray(o)) {

            items.map(item => {

                if (answer) return
                answer = o.find(_item => isEqual(_item, item)) ? true : false
            })
        }
        return answer

    }, "capitalize()": ({ o }) => {

        return capitalize(o)

    }, "capitalizeFirst()": ({ o }) => {

        return capitalizeFirst(o)

    }, "len()": ({ o }) => {

        if (Array.isArray(o)) return o.length
        else if (typeof o === "string") return o.split("").length
        else if (typeof o === "object") return Object.keys(o).length

    }, "require()": ({ _window, req, res, stack, props, lookupActions, id, e, __, args, object }) => {

        require(toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] }))

    }, "new()": ({ _window, req, res, stack, props, lookupActions, id, e, __, args, object }) => {

        var data = [], className = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })
        args.slice(1).map(arg => {
            data.push(toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: arg || "" }))
        })
        if (className && typeof (new [className]()) === "object") return new [className](...data)

    }, "timezone()": () => {

        var _date = new Date()
        var timeZone = Math.abs(_date.getTimezoneOffset()) * 60 * 1000
        return timeZone

    }, "clock()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object, answer }) => { // dd:hh:mm:ss

        var data = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, data: args[1], __ })
        if (!data.timestamp) data.timestamp = o

        return toClock(data)

    }, "toSimplifiedDate()": ({ _window, req, res, o, stack, props, object, lookupActions, id, e, __, args, answer }) => {

        var data = toValue({ _window, req, res, lookupActions, stack, props: { isValue: true }, object, id, e, data: args[1], __ })
        return toSimplifiedDate({ timestamp: o, lang: data.lang || "en", timer: data.time || false })

    }, "lowercase()": ({ o }) => {
        return (o + "").toLowerCase()
    }, "uppercase()": ({ o }) => {
        return (o + "").toUpperCase()
    }, "camelcase()": ({ o }) => {

        var str = o
        // Split the string by spaces, dashes, and underscores
        let words = str.split(/[\s-_]/);

        // Convert the first word to lowercase
        let camelCaseStr = words[0].toLowerCase();

        // Capitalize the first letter of each word except the first word
        for (let i = 1; i < words.length; i++) {
            camelCaseStr += words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
        }

        return camelCaseStr;

    }, "ar()": ({ o }) => {
        //
        if (Array.isArray(o)) return o.map(o => o.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]))
        else return o.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d])

    }, "date()": ({ _window, stack, props, lookupActions, id, e, __, args, object, o }) => {

        if (args[1]) var data = toValue({ _window, id, data: args[1], __, e, lookupActions, stack, props: { isValue: true }, object })
        else data = o

        if (isNumber(data) && typeof data === "string") data = parseInt(data)
        return new Date(data)

    }, "toDateFormat()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => { // returns date for input

        if (isParam({ _window, string: args[1] })) {

            var data = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })
            var format = data.format, day = 0, month = 0, year = 0, hour = 0, sec = 0, min = 0

            if (typeof o === "string") {

                if (format.split("/").length > 1) {

                    var date = o.split("/")
                    format.split("/").map((format, i) => {
                        if (format === "dd") day = date[i]
                        else if (format === "mm") month = date[i]
                        else if (format === "yyyy") year = date[i]
                        else if (format === "hh") hour = date[i]
                        else if (format === "mm") min = date[i]
                        else if (format === "ss") sec = date[i]
                    })
                }

                return new Date(year, month, day, hour, min, sec)

            } else if (data.excel && typeof o === "number") {

                function ExcelDateToJSDate(serial) {

                    var utc_days = Math.floor(serial - 25569)
                    var utc_value = utc_days * 86400
                    var date_info = new Date(utc_value * 1000)

                    var fractional_day = serial - Math.floor(serial) + 0.0000001

                    var total_seconds = Math.floor(86400 * fractional_day)

                    var seconds = total_seconds % 60

                    total_seconds -= seconds

                    var hours = Math.floor(total_seconds / (60 * 60))
                    var minutes = Math.floor(total_seconds / 60) % 60

                    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds)
                }

                return ExcelDateToJSDate(o)
            }

        } else {

            var format = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, data: args[1], __ }) || "format1"

            if (!isNaN(o) && typeof o === "string") o = parseInt(o)
            var date = new Date(o)
            var _year = date.getFullYear()
            var _month = date.getMonth() + 1
            var _day = date.getDate()
            var _dayofWeek = date.getDay()
            var _hour = date.getHours()
            var _mins = date.getMinutes()
            var _daysofWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            var monthsCode = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

            if (format.replace(" ", "") === "format1") return `${_daysofWeek[_dayofWeek]} ${_day.toString().length === 2 ? _day : `0${_day}`}/${_month.toString().length === 2 ? _month : `0${_month}`}/${_year}${args[1] === "time" ? ` ${_hour.toString().length === 2 ? _hour : `0${_hour}`}:${_mins.toString().length === 2 ? _mins : `0${_mins}`}` : ""}`
            else if (format.replace(" ", "") === "format2") return `${_year.toString()}-${_month.toString().length === 2 ? _month : `0${_month}`}-${_day.toString().length === 2 ? _day : `0${_day}`}`
            else if (format.replace(" ", "") === "format3") return `${_day.toString().length === 2 ? _day : `0${_day}`}${monthsCode[_month - 1]}${_year.toString().slice(2)}`
            else if (format.replace(" ", "") === "format4") return `${_daysofWeek[_dayofWeek]} ${_day.toString().length === 2 ? _day : `0${_day}`}/${_month.toString().length === 2 ? _month : `0${_month}`}/${_year}${` | ${_hour.toString().length === 2 ? _hour : `0${_hour}`}:${_mins.toString().length === 2 ? _mins : `0${_mins}`}`}`
        }

    }, "toDateInputFormat()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => { // returns date for input in a specific format

        var data = {}
        if (isParam({ _window, string: args[1] })) {

            data = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })
        } else if (args[1]) {
            data = { date: toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, data: args[1], __ }) }
        } else data = { date: o }

        var format = data.format || "yyyy-mm-dd"
        var date = new Date(data.date || o)
        if (!date) return

        var day = 0, month = 0, year = 0, hour = 0, sec = 0, min = 0
        var newDate = ""

        if (format.split("/").length === 3) {

            format.split("/").map((format, i) => {
                if (i !== 0) newDate += "-"
                format = format.toLowerCase()
                if (format === "dd") {
                    day = date.getDate()
                    newDate += day.toString().length === 2 ? day : `0${day}`
                } else if (format === "mm") {
                    month = date.getMonth() + 1
                    newDate += month.toString().length === 2 ? month : `0${month}`
                } else if (format === "yyyy") {
                    year = date.getFullYear()
                    newDate += year
                } else if (format === "hh") {
                    hour = date.getHours() || 0
                    newDate += hour.toString().length === 2 ? hour : `0${hour}`
                } else if (format === "mm") {
                    min = date.getMinutes() || 0
                    newDate += min.toString().length === 2 ? min : `0${min}`
                } else if (format === "ss") {
                    sec = date.getSeconds() || 0
                    newDate += sec.toString().length === 2 ? sec : `0${sec}`
                } else if (format === "hh:mm:ss") {
                    hour = date.getHours() || 0
                    min = date.getMinutes() || 0
                    sec = date.getSeconds() || 0
                    newDate += (hour.toString().length === 2 ? hour : `0${hour}`) + ":" + (min.toString().length === 2 ? min : `0${min}`) + ":" + (sec.toString().length === 2 ? sec : `0${sec}`)
                } else if (format === "hh:mm") {
                    hour = date.getHours() || 0
                    min = date.getMinutes() || 0
                    newDate += (hour.toString().length === 2 ? hour : `0${hour}`) + ":" + (min.toString().length === 2 ? min : `0${min}`)
                }
            })

        } else if (format.split("T").length === 2 || format.split("T")[0].split("-").length === 3) {

            var length = format.split("T").length
            format.split("T").map((format, i) => {
                format.split("-").map((format, i) => {
                    format = format.toLowerCase()
                    if (i !== 0) newDate += "-"
                    if (format === "dd") {
                        day = date.getDate()
                        newDate += day.toString().length === 2 ? day : `0${day}`
                    } else if (format === "mm") {
                        month = date.getMonth() + 1
                        newDate += month.toString().length === 2 ? month : `0${month}`
                    } else if (format === "yyyy") {
                        year = date.getFullYear()
                        newDate += year
                    } else if (format === "hh") {
                        hour = date.getHours() || 0
                        newDate += (hour.toString().length === 2 ? hour : `0${hour}`)
                    } else if (format === "mm") {
                        min = date.getMinutes() || 0
                        newDate += (min.toString().length === 2 ? min : `0${min}`)
                    } else if (format === "ss") {
                        sec = date.getSeconds() || 0
                        newDate += (sec.toString().length === 2 ? sec : `0${sec}`)
                    } else if (format === "hh:mm:ss") {
                        hour = date.getHours() || 0
                        min = date.getMinutes() || 0
                        sec = date.getSeconds() || 0
                        newDate += (hour.toString().length === 2 ? hour : `0${hour}`) + ":" + (min.toString().length === 2 ? min : `0${min}`) + ":" + (sec.toString().length === 2 ? sec : `0${sec}`)
                    } else if (format === "hh:mm") {
                        hour = date.getHours() || 0
                        min = date.getMinutes() || 0
                        newDate += (hour.toString().length === 2 ? hour : `0${hour}`) + ":" + (min.toString().length === 2 ? min : `0${min}`)
                    }
                })
                if (length === 2 && i === 0) newDate += "T"
            })

        }

        return newDate

    }, "getGeoLocation()": ({ answer }) => {

        navigator.geolocation.getCurrentPosition((position) => { answer = position })
        return answer

    }, "counter()": ({ _window, req, res, stack, props, lookupActions, id, e, __, args, object }) => {

        var data = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, data: args[1], __ })

        data.counter = data.counter || data.start || data.count || 0
        data.length = data.length || data.len || data.maxLength || 0
        data.end = data.end || data.max || data.maximum || 999999999999

        return require("./counter").counter({ ...data })

    }, "time()": ({ o }) => {

        if (isNumber(o)) {

            var _1Day = 24 * 60 * 60 * 1000, _1Hr = 60 * 60 * 1000, _1Min = 60 * 1000
            o = parseInt(o)

            var _days = Math.floor(o / _1Day).toString()
            _days = _days.length === 1 ? ("0" + _days) : _days

            var _hrs = Math.floor(o % _1Day, _1Hr).toString()
            _hrs = _hrs.length === 1 ? ("0" + _hrs) : _hrs

            var _mins = Math.floor(o % _1Hr, _1Min).toString()
            _mins = _mins.length === 1 ? ("0" + _mins) : _mins

            return _days + ":" + _hrs + ":" + _mins
        }

    }, "timestamp()": ({ o }) => {

        if ((typeof o === "number" || typeof o === "string") && new Date(o)) return new Date(o).getTime()
        else return new Date().getTime()

        /*else if (o.length === 5 && o.split(":").length === 2) {

            var _hrs = parseInt(o.split(":")[0]) * 60 * 60 * 1000
            var _mins = parseInt(o.split(":")[1]) * 60 * 1000
            return _hrs + _mins

        } else if (o.length === 8 && o.split(":").length === 3) {

            var _days = parseInt(o.split(":")[0]) * 24 * 60 * 60 * 1000
            var _hrs = parseInt(o.split(":")[1]) * 60 * 60 * 1000
            var _mins = parseInt(o.split(":")[2]) * 60 * 1000
            return _days + _hrs + _mins

        } else {

            o = new Date(o)
            if (o.getTime()) return o.getTime()
            o = new Date()
            return o.getTime()
        }*/

    }, "getDateTime()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var format = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, data: args[1], __ })
        return getDateTime(o, format)

    }, "getDaysInMonth()": ({ o }) => {

        if (o instanceof Date) return new Date(o.getFullYear(), o.getMonth() + 1, 0).getDate()

    }, "1MonthLater()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()
        var month = date.getMonth() + 1 > 11 ? 1 : date.getMonth() + 1
        var year = (month === 1 ? date.getYear() + 1 : date.getYear()) + 1900

        return new Date(date.setYear(year)).setMonth(month, date.getDays())

    }, "2MonthLater()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()
        var month = date.getMonth() + 1 > 11 ? 1 : date.getMonth() + 1
        var year = (month === 1 ? date.getYear() + 1 : date.getYear()) + 1900
        month = month + 1 > 11 ? 1 : month + 1
        year = month === 1 ? year + 1 : year

        return new Date(date.setYear(year)).setMonth(month, date.getDays())

    }, "3MonthLater()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()

        var month = date.getMonth() + 1 > 11 ? 1 : date.getMonth() + 1
        var year = (month === 1 ? date.getYear() + 1 : date.getYear()) + 1900
        month = month + 1 > 11 ? 1 : month + 1
        year = month === 1 ? year + 1 : year
        month = month + 1 > 11 ? 1 : month + 1
        year = month === 1 ? year + 1 : year
        return new Date(date.setYear(year)).setMonth(month, date.getDays())

    }, "1MonthEarlier()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()

        var month = date.getMonth() - 1 < 0 ? 11 : date.getMonth() - 1
        var year = (month === 11 ? date.getYear() - 1 : date.getYear()) + 1900
        return new Date(date.setYear(year)).setMonth(month, date.getDays())

    }, "2MonthEarlier()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()

        var month = date.getMonth() - 1 < 0 ? 11 : date.getMonth() - 1
        var year = (month === 11 ? date.getYear() - 1 : date.getYear()) + 1900
        month = month - 1 < 0 ? 11 : month - 1
        year = month === 11 ? year - 1 : year
        return new Date(date.setYear(year)).setMonth(month, date.getDays())

    }, "3MonthEarlier()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()

        var month = date.getMonth() - 1 < 0 ? 11 : date.getMonth() - 1
        var year = (month === 11 ? date.getYear() - 1 : date.getYear()) + 1900
        month = month - 1 < 0 ? 11 : month - 1
        year = month === 11 ? year - 1 : year
        month = month - 1 < 0 ? 11 : month - 1
        year = month === 11 ? year - 1 : year
        return new Date(date.setYear(year)).setMonth(month, date.getDays())

    }, "today()": () => {

        return new Date().getTime()

    }, "now()": () => {

        return new Date().getTime()

    }, "hourStart()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()
        date.setMinutes(0, 0, 0)
        return date.getTime()

    }, "nextDayStart()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()
  
        // Create a new date object for the next day
        const nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        return nextDay.getTime();

    }, "todayStart()": ({ o }) => {

        let date = o instanceof Date ? o : new Date()
        date.setHours(0, 0, 0, 0)
        
        return date.getTime()

    }, "todayEnd()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()
        date.setHours(23, 59, 59, 999)
        return date.getTime()

    }, "monthStart()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()
        return new Date(date.setMonth(date.getMonth(), 1)).setHours(0, 0, 0, 0)

    }, "monthEnd()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()
        return new Date(date.setMonth(date.getMonth(), getDaysInMonth(date))).setHours(23, 59, 59, 999)

    }, "nextMonthStart()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()
        var month = date.getMonth() + 1 > 11 ? 1 : date.getMonth() + 1
        var year = (month === 1 ? date.getYear() + 1 : date.getYear()) + 1900
        return new Date(new Date(date.setYear(year)).setMonth(month, 1)).setHours(0, 0, 0, 0)

    }, "nextMonthEnd()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()
        var month = date.getMonth() + 1 > 11 ? 1 : date.getMonth() + 1
        var year = (month === 1 ? date.getYear() + 1 : date.getYear()) + 1900
        return new Date(new Date(date.setYear(year)).setMonth(month, getDaysInMonth(date))).setHours(23, 59, 59, 999)

    }, "2ndNextMonthStart()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()
        var month = o.getMonth() + 1 > 11 ? 1 : date.getMonth() + 1
        var year = (month === 1 ? date.getYear() + 1 : date.getYear()) + 1900
        month = month + 1 > 11 ? 1 : month + 1
        year = month === 1 ? year + 1 : year
        return new Date(new Date(date.setYear(year)).setMonth(month, 1)).setHours(0, 0, 0, 0)

    }, "2ndNextMonthEnd()": ({ o }) => {

        var date
        if (typeof o.getMonth === 'function') date = o
        else date = new Date()
        var month = date.getMonth() + 1 > 11 ? 1 : date.getMonth() + 1
        var year = (month === 1 ? date.getYear() + 1 : date.getYear()) + 1900
        month = month + 1 > 11 ? 1 : month + 1
        year = month === 1 ? year + 1 : year
        return new Date(new Date(date.setYear(year)).setMonth(month, getDaysInMonth(date))).setHours(23, 59, 59, 999)

    }, "prevMonthStart()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()
        var month = date.getMonth() - 1 < 0 ? 11 : date.getMonth() - 1
        var year = (month === 11 ? date.getYear() - 1 : date.getYear()) + 1900
        return new Date(new Date(date.setYear(year)).setMonth(month, 1)).setHours(0, 0, 0, 0)

    }, "prevMonthEnd()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()
        var month = date.getMonth() - 1 < 0 ? 11 : date.getMonth() - 1
        var year = (month === 11 ? date.getYear() - 1 : date.getYear()) + 1900
        return new Date(new Date(date.setYear(year)).setMonth(month, getDaysInMonth(date))).setHours(23, 59, 59, 999)

    }, "2ndPrevMonthStart()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()
        var month = date.getMonth() - 1 < 0 ? 11 : date.getMonth() - 1
        var year = (month === 11 ? date.getYear() - 1 : date.getYear()) + 1900
        month = month - 1 < 0 ? 11 : month - 1
        year = month === 11 ? year - 1 : year
        return new Date(new Date(date.setYear(year)).setMonth(month, 1)).setHours(0, 0, 0, 0)

    }, "2ndPrevMonthEnd()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()
        var month = date.getMonth() - 1 < 0 ? 11 : date.getMonth() - 1
        var year = (month === 11 ? date.getYear() - 1 : date.getYear()) + 1900
        month = month - 1 < 0 ? 11 : month - 1
        year = month === 11 ? year - 1 : year
        return new Date(new Date(date.setYear(year)).setMonth(month, getDaysInMonth(date))).setHours(23, 59, 59, 999)

    }, "yearStart()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()
        return new Date(date.setMonth(0, 1)).setHours(0, 0, 0, 0)

    }, "yearEnd()": ({ o }) => {

        var date
        if (typeof o.getMonth === 'function') date = o
        else date = new Date()
        return new Date(date.setMonth(0, getDaysInMonth(date))).setHours(23, 59, 59, 999)

    }, "nextYearStart()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()
        return new Date(date.setMonth(0, 1)).setHours(0, 0, 0, 0)

    }, "nextYearEnd()": ({ o }) => {

        var date
        if (typeof o.getMonth === 'function') date = o
        else date = new Date()
        return new Date(date.setMonth(0, getDaysInMonth(date))).setHours(23, 59, 59, 999)

    }, "prevYearStart()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()
        return new Date(date.setMonth(0, 1)).setHours(0, 0, 0, 0)

    }, "prevYearEnd()": ({ o }) => {

        var date = o instanceof Date ? o : new Date()
        return new Date(date.setMonth(0, getDaysInMonth(date))).setHours(23, 59, 59, 999)

    }, "removeDuplicates()": ({ _window, o, stack, props, lookupActions, id, e, __, args, object }) => { // without condition and by condition. ex: removeDuplicates():number (it will remove items that has the same number value)

        if (args[1]) {

            var keys = toValue({ _window, e, data: args[1], id, __, lookupActions, stack, props: { isValue: true }, object })
            var list = []

            toArray(keys).map(key => {

                var seen = new Set()

                o.map(item => {
                    if (!seen.has(item[key])) {
                        seen.add(item[key])
                        list.push(item)
                    }
                })
            })

            return answer = o = list

        } else {

            if (!Array.isArray(o)) return o
            var removeDuplicates = (array) => {
                for (let i = 0; i < array.length; i++) {
                    if (array.filter(el => isEqual(el, array[i])).length > 1) {

                        array.splice(i, 1);
                        removeDuplicates(array);
                        break;
                    }
                }
            }

            removeDuplicates(o);
            return o
        }

    }, "replaceAll()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        if (typeof o === "string") {

            var rec0 = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] || "" })
            var rec1 = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[2] || "" })
            return o.replaceAll(rec0, rec1)
        }

    }, "replace()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object, i, path, _object, pathJoined }) => { // replace():[conditions]:newItem

        if (typeof o === "string") {

            var rec0 = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] || "" })
            var rec1 = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[2] || "" })
            if (rec1 !== undefined) return o.replace(rec0, rec1)
            else return o.replace(rec0)
        }

        if (!Array.isArray(o)) o = kernel({ req, res, _window, id, stack, props, data: { data: _object, path: path.slice(0, i), value: [], key: true }, __, e, object }) || []

        var newItem = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[2] || "" }), pushed = false

        if (o.length === 0) o.push(newItem)
        else {
            o.map((item, i) => {
                if (toApproval({ _window, lookupActions, stack, props, e, data: args[1], id, __, req, res, object: [item, ...toArray(object)] })) {
                    pushed = true
                    o[i] = newItem
                }
            })

            if (!pushed) o.push(newItem)
        }

        return o

    }, "replaceItem()": ({ o, req, res, _window, lookupActions, stack, props, id, e, __, args, object, _object, path }) => { // replaceItem():item

        if (!Array.isArray(o) && typeof o !== "string") o = kernel({ req, res, _window, id, data: { data: _object, path: path.slice(0, i), value: [], key: true }, __, e, object })

        if (typeof o === "string") {

            var rec0 = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] || "" })
            var rec1 = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[2] || "" })

            if (rec1 !== undefined) return o.replaceAll(rec0, rec1)
            else return o.replaceAll(rec0)
        }

        var newItem = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] || "" })
        var index = o.findIndex(item => isEqual(item, newItem))
        if (index >= 0) o[index] = newItem
        else o.push(newItem)

        return o

    }, "replaceItems()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        if (isParam({ _window, string: args[1] })) {

            var _params = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })
            var _path = _params.path, _data = _params.data.filter(data => data !== undefined && data !== null)
            toArray(_data).map(_data => {

                var _index = o.findIndex((item, index) => isEqual(kernel({ req, res, _window, lookupActions, stack, props, id, data: { path: _path || [], data: item }, __: [o, ...__], e }), kernel({ req, res, _window, lookupActions, stack, props, id, data: { path: _path || [], data: _data }, __: [o, ...__], e })))
                if (_index >= 0) o[_index] = _data
                else o.push(_data)
            })

        } else if (args[1]) {

            var _data = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] }).filter(data => data !== undefined && data !== null)
            if (typeof o[0] === "object") {

                toArray(_data).map(_data => {

                    var _index = o.findIndex(item => item.id === _data.id)
                    if (_index >= 0) o[_index] = _data
                    else o.push(_data)
                })

            } else if (typeof o[0] === "number" || typeof o[0] === "string") {

                toArray(_data).map(_data => {

                    var _index = o.findIndex(item => item === _data)
                    if (_index >= 0) o[_index] = _data
                    else o.push(_data)
                })
            }
        }

        return o

    }, "terminate()": ({ stack, }) => {

        stack.terminated = true

    }, "break()": ({ stack, }) => {

        if (stack.loop) stack.broke = true

    }, "return()": ({ _window, stack, props, lookupActions, id, e, __, args, object, answer, pathJoined }) => {

        stack.returns[0].data = answer = toValue({ _window, data: args[1], e, id, __, stack, props: { isValue: true }, object, lookupActions })
        stack.returns[0].returned = true

        return answer

    }, "export()": ({ _window, req, res, id, e, __, stack, lookupActions, args, object }) => {

        var data = toValue({ _window, req, res, id, e, __, stack, lookupActions, props: {isValue: true}, data: args[1], object })

        if (data.json) data.type = "json"
        if (data.csv) data.type = "csv"
        if (data.excel) data.type = "excel"
        if (data.pdf) data.type = "pdf"

        if (data.type === "json") exportJson(data)
        else if (data.type === "csv") require("./toCSV").toCSV(data)
        else if (data.type === "excel") require("./toExcel").toExcel(data)
        else if (data.type === "pdf") require("./toPdf").toPdf(data)

    }, "flat()": ({ o, object }) => {

        if (typeof o === "object") {
            if (Array.isArray(o)) {
                o = [...o]
                return o.flat()
            } else if (typeof o === "object") {

                Object.entries(o).map(([key, value]) => object[0][key] = value)
                return object[0]
            }
        } else return o

    }, "getDeepChildrenId()": ({ _window, o }) => {

        return getDeepChildrenId({ _window, id: o.id })

    }, "deep()": ({ _window, o }) => {

        return getDeepChildren({ _window, id: o.id })

    }, "deepChildren()": ({ _window, o }) => {

        return getDeepChildren({ _window, id: o.id })

    }, "filter()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, underScored, object }) => {

        var isnot = false
        args = args.slice(1)
        if (!args[0]) isnot = true

        if (isnot) return toArray(o).filter(o => o !== "" && o !== undefined && o !== null)

        if (underScored) return toArray(o).filter((o, index) => toApproval({ _window, lookupActions, stack, props: { isCondition: true, isValue: false }, e, data: args[0], id, __: [o, ...__], object, req, res }))
        else return toArray(o).filter((o, index) => toApproval({ _window, lookupActions, stack, props: { isCondition: true, isValue: false }, e, data: args[0], id, object: [o, ...object], req, res, __ }))

    }, "find()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, underScored, i, lastIndex, value, key, answer, object }) => {

        if (i === lastIndex && key && value !== undefined) {

            var index
            if (underScored) index = toArray(o).findIndex(o => toApproval({ _window, lookupActions, stack, props: { isCondition: true, isValue: false }, e, data: args[1], id, __: [o, ...__], req, res, object }))
            else index = toArray(o).findIndex(o => toApproval({ _window, lookupActions, stack, props, e, data: args[1], id, __, req, res, object: [o, ...toArray(object)] }))
            if (index !== undefined && index !== -1) o[index] = answer = value
            return answer

        } else {

            if (underScored) return toArray(o).find(o => toApproval({ _window, lookupActions, stack, props: { isCondition: true, isValue: false }, e, data: args[1], id, __: [o, ...__], req, res, object }))
            else return toArray(o).find(o => toApproval({ _window, lookupActions, stack, props, e, data: args[1], id, __, req, res, object: [o, ...toArray(object)] }))
        }

    }, "sort()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, answer, object, pathJoined }) => {

        var data = toParam({ req, res, _window, lookupActions, stack, props, object: [{}, ...object], id, e, __, data: args[1] })
        data.data = data.data || o

        data.data = answer = sort({ _window, lookupActions, stack, props, __, id, e, sort: data })

        return answer

    }, "findIndex()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, underScored, object }) => {

        if (typeof o !== "object") return

        if (underScored) return toArray(o).findIndex(o => toApproval({ _window, lookupActions, stack, props, e, data: args[1], id, __: [o, ...__], req, res }))
        else return toArray(o).findIndex(o => toApproval({ _window, lookupActions, stack, props, e, data: args[1], id, __, req, res, object: [o, ...toArray(object)] }))

    }, "map()": ({ _window, req, res, global, o, stack, props, lookupActions, id, e, __, args, object }) => {

        if (args[1] && args[1].slice(0, 2) === "@$" && args[1].length == 7) args[1] = global.__refs__[args[1]].data

        if (args[1] && underScored) {

            toArray(o).map((...o) => toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, data: args[1] || "", __: [o, ...__], e }))
            return o

        } else if (args[1]) {

            return toArray(o).map((...o) => toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, data: args[1] || "", object: [o, ...toArray(object)], __, e }))
        }

    }, "()": ({ _window, req, res, global, o, stack, props, lookupActions, id, e, __, args, underScored, object, breakRequest, pathJoined }) => {// map()

        var notArray = false
        if (args[1] && args[1].slice(0, 2) === "@$" && args[1].length == 7) args[1] = global.__refs__[args[1]].data
        if (args[2] && args[2].slice(0, 2) === "@$" && args[2].length == 7) args[2] = global.__refs__[args[2]].data

        if (typeof o === "object" && !Array.isArray(o)) notArray = true

        stack.loop = true

        if (args[2] && underScored) {

            breakRequest.break = true
            let address = actions["addresser()"]({ _window, req, res, id, stack, props: { ...props, isValue: false }, __, lookupActions, data: { string: args[2] }, object }).address;

            ([...toArray(o)]).reverse().map(o => {
                // address
                address = actions["addresser()"]({ _window, req, res, id, stack, props: { ...props, isValue: false }, nextAddress: address, __: [o, ...__], lookupActions, data: { string: args[1] }, object }).address
            })

            // address
            if (address) actions["stackManager()"]({ _window, id, lookupActions, stack, props: { ...props, isValue: false }, address, __, req, res, object })

        } else if (args[2]) {

            breakRequest.break = true
            let address = actions["addresser()"]({ _window, req, res, id, stack, props: { ...props, isValue: false }, __, lookupActions, data: { string: args[2] }, object }).address;

            ([...toArray(o)]).reverse().map(o => {
                // address
                address = actions["addresser()"]({ _window, id, stack, props, nextAddress: address, __, lookupActions, data: { string: args[1] }, object: [o, ...toArray(object)] }).address
            })

            // address
            if (address) actions["stackManager()"]({ _window, id, lookupActions, stack, props, address, __, req, res })
        } else if (args[1] && underScored) {

            var data = toArray(o).map(o => toValue({ req, res, _window, lookupActions, stack, props: { ...props, isValue: false }, id, data: args[1] || "", object, __: [o, ...__], e }))
            return notArray ? data[0] : data

        } else if (args[1]) {

            return toArray(o).map(o => toValue({ req, res, _window, lookupActions, stack, props: { ...props, isValue: false }, id, data: args[1] || "", object: [o, ...object], __, e }))

        }

        stack.loop = false
        stack.broke = false

        if (notArray) return o

    }, "html2pdf()": ({ _window, o, stack, props, lookupActions, id, __, args, object }) => {

        var { address, data } = actions["addresser()"]({ _window, stack, props, args, asynchronous: true, id: o.id, status: "Start", action: "html2pdf()", object, lookupActions, __, id })

        var options = {
            margin: .25,
            filename: data.name || generate({ length: 20 }),
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, dpi: 300, letterRendering: true },
            jsPDF: { unit: 'mm', format: data.format || 'a4', orientation: 'portrait' }
        }

        data.view = data.view || o
        var exporter = new html2pdf(data.view.__element__, options)

        exporter.getPdf(true).then((pdf) => {
            console.log('pdf file downloaded')
        })

        /*exporter.getPdf(false).then((pdf) => {
            console.log('doing something before downloading pdf file');
            pdf.save();
          });*/

        /*pages.map(page => {

            var _element
            if (typeof page === "object" && page.id) _element = views[page.id].__element__
            else if (page.nodeType === Node.ELEMENT_NODE) _element = page
            else if (typeof page === "string") _element = views[page].__element__

            _elements.push(_element)
            var images = [..._element.getElementsByTagName("IMG")]

            if (images.length > 0) {

                images.map((image, i) => {
                    toDataURL(image.src).then(dataUrl => {

                        image.src = dataUrl
                        if (images.length === i + 1) {

                            if (!once && pages.length > 1 && pages.length === _elements.length) {

                                once = true
                                exportHTMLToPDF({ _window, pages: _elements, opt, lookupActions, stack, props, address, req, res, id, e, __, args })

                            } else if (pages.length === 1) html2pdf().set(opt).from(_element).toPdf().get('pdf').then(pdf => {

                                var totalPages = pdf.internal.getNumberOfPages()

                                for (i = 1; i <= totalPages; i++) {

                                    pdf.setPage(i)
                                    pdf.setFontSize(9)
                                    pdf.setTextColor(150)
                                    pdf.text('page ' + i + ' of ' + totalPages, (pdf.internal.pageSize.getWidth() / 1.1), (pdf.internal.pageSize.getHeight() - 0.08))
                                }

                            }).save().then((pdf) => {

                                // await params
                                if (args[2]) actions["stackManager()"]({ _window, lookupActions, stack, props, address, req, res, id, e, __: [pdf, ...__] })
                                window.devicePixelRatio = 1
                            })
                        }
                    })
                })

            } else html2pdf().set(opt).from(_element).save().then((pdf) => {


                // await params
                if (args[2]) actions["stackManager()"]({ _window, lookupActions, stack, props, address, req, res, id, e, __: [pdf, ...__] })
                window.devicePixelRatio = 1
            })
        })*/

    }, "loader()": ({ _window, req, res, views, o, stack, props, object, lookupActions, id, e, __, args, k }) => {

        var data = {}

        if (isParam({ _window, string: args[1] })) {

            data = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })
            if (data.hide) data.show = false

        } else {

            var show = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })
            if (show === "show") data.show = true
            else if (show === "hide") data.show = false
        }

        var _o
        if (data.id) _o = views[data.id]
        else if (data.window) _o = views.body
        else _o = o

        if (typeof _o !== "object") return
        if (_o.__status__ === "Loading") {
            return _o.__controls__.push({
                event: "loaded?" + k
            })
        }

        if (data.show) {

            var lDiv = document.createElement("div")
            document.body.appendChild(lDiv)
            lDiv.classList.add("loader-container")
            lDiv.setAttribute("id", _o.id + "-loader")
            if (_o.id !== "body") {

                lDiv.style.position = "absolute"
                var coords = require("./getCoords")({ id: _o.id || id })
                lDiv.style.top = coords.top + "px"
                lDiv.style.bottom = coords.bottom + "px"
                lDiv.style.height = coords.height + "px"
                lDiv.style.left = coords.left + "px"
                lDiv.style.right = coords.right + "px"
                lDiv.style.width = coords.width + "px"
            }

            var loader = document.createElement("div")
            lDiv.appendChild(loader)
            loader.classList.add("loader")
            lDiv.style.display = "flex"

            if (data.style) {
                Object.entries(data.style).map(([key, value]) => {
                    loader.style[key] = value
                })
            }

            if (data.background && data.background.style) {
                Object.entries(data.background.style).map(([key, value]) => {
                    lDiv.style[key] = value
                })
            }

            return sleep(10)

        } else if (data.show === false) {

            var lDiv = document.getElementById(_o.id + "-loader")
            if (lDiv) lDiv.parentNode.removeChild(lDiv)
            else console.log("Loader doesnot exist!")
        }

    }, "type()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object, key, value }) => {

        if (typeof o === "object" && o.__view__ && o.__name__ === "Input") {
            if (key && value) return o.__element__.type = value
            return o.__element__.type
        }
        if (args[1]) return getType(toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] }))
        else return getType(o)

    }, "coords()": ({ o }) => {

        if (!o.__view__) return
        require("./getCoords")({ id: o.id })

    }, "price()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        if (!isNumber(o)) return

        var data = toParam({ req, res, _window, lookupActions, stack, props, object, id, e, __, data: args[1] })
        if (!data.decimal) data.decimal = 2
        var formatter = new Intl.NumberFormat("en", {
            style: 'decimal',
            decimal: data.decimal,
        })
        
        return formatter.format(parseFloat(o))

    }, "bool()": ({ o }) => {

        return typeof o === "boolean" ? o : (o === "true" ? true : o === "false" ? false : undefined)

    }, "num()": ({ o }) => {

        return toNumber(o)

    }, "isNum()": ({ o }) => {

        return isNumber(o)

    }, "round()": ({ _window, req, res, o, stack, props, object, lookupActions, id, e, __, args }) => {

        if (isNumber(o)) {
            var nth = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })
            if (!nth && nth !== 0) nth = 2
            return parseFloat(o || 0).toFixed(nth)
        }

    }, "str()": ({ o }) => {

        if (typeof o !== "object") return o + ""
        else return toString(o)

    }, "lastIndex()": ({ o }) => {

        return o.length ? o.length - 1 : 0

    }, "2ndLastIndex()": ({ o }) => {

        return o.length ? (o.length - 1 ? o.length - 2 : o.length - 1) : o.length

    }, "2ndLastIndex()": ({ o }) => {

        return o.length ? (o.length - 1 ? o.length - 2 : o.length - 1) : o.length

    }, "nthLastIndex()": ({ o }) => {

        return o.length ? (o.length - 1 ? o.length - 2 : o.length - 1) : o.length

    }, "el()": ({ o }) => {

        return o.__element__

    }, "index()": ({ o }) => {

        if (!o.__indexed__ && o.__loop__) return o.__loopIndex__
        else if (!o.__indexed__) return o.__childIndex__
        else return o.__index__

    }, "checked()": ({ o, value, key }) => {

        if (!o.__view__) return

        if (value !== undefined && key) return o.checked.checked = o.__element__.checked = value
        else return o.checked.checked || o.__element__.checked || null

    }, "check()": ({ o, value, breakRequest }) => {

        breakRequest.break = true
        if (!o.__view__) return

        return o.checked.checked = o.__element__.checked = value || null

    }, "parseFloat()": ({ o }) => {

        return parseFloat(o)

    }, "parseInt()": ({ o }) => {

        return parseInt(o)

    }, "stringify()": ({ o }) => {

        return JSON.stringify(o)

    }, "parse()": ({ o }) => {

        return JSON.parse(o)

    }, "getCookie()": ({ _window, req, res, stack, props, lookupActions, id, e, __, args, object }) => {

        // getCookie():name
        if (isParam({ _window, string: args[1], req, res })) {

            var data = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })
            return getCookie({ ...data, req, res, _window })
        }

        var _name = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })
        var _cookie = getCookie({ name: _name, req, res, _window })
        return _cookie

    }, "eraseCookie()": ({ _window, req, res, views, stack, props, pathJoined, lookupActions, id, e, __, args, object }) => {

        if (_window) return views.root.__controls__.push({ event: `loading?${pathJoined}` })

        // getCookie():name
        if (isParam({ _window, req, res, string: args[1] })) {
            var data = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })
            return eraseCookie({ ...data, req, res, _window })
        }

        var _name = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })
        var _cookie = eraseCookie({ name: _name, req, res, _window })
        return _cookie

    }, "setCookie()": ({ _window, req, res, views, stack, props, pathJoined, lookupActions, id, e, __, args, object }) => {

        // X setCookie():value:name:expiry-date X // setCookie():[value;name;expiry]
        var cookies = []
        if (isParam({ _window, req, res, string: args[1] })) {

            args.slice(1).map(arg => {

                var data = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: arg })
                setCookie({ ...data, req, res, _window })

                cookies.push(data)
            })

        } else {

            var _name = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })
            var _value = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[2] })
            var _expiryDate = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[3] })

            setCookie({ name: _name, value: _value, expires: _expiryDate, req, res, _window })
        }


        if (cookies.length === 1) return cookies[0]
        else return cookies

    }, "cookie()": ({ _window, req, res, views, stack, props, pathJoined, lookupActions, id, e, __, args, object }) => {

        var data = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })

        if (_window && data.method === "post" || data.method === "delete") return views.root.__controls__.push({ event: `loading?${pathJoined}` })
        if (data.method === "post") return setCookie({ ...data, req, res, _window })
        if (data.method === "delete") return eraseCookie({ ...data, req, res, _window })
        if (data.method === "get") return getCookie({ ...data, req, res, _window })

    }, "clean()": ({ o }) => {

        return o.filter(o => o !== undefined && !Number.isNaN(o) && o !== "")

    }, "colorize()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var data = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, data: args[1] || "", __ })
        var encoded = actions["encode()"]({_window, stack, string: actions["encode()"]({_window, stack, string: o, start: "'" }) })
        return colorize({ _window, string: encoded, ...data })

    }, "deepChildren()": ({ _window, o, stack, props, lookupActions }) => {

        return getDeepChildren({ _window, lookupActions, stack, props, id: o.id })

    }, "note()": ({ _window, req, res, stack, props, lookupActions, id, e, __, args, object }) => { // note

        var data = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })
        note({ _window, note: data })
        return data

    }, "readonly()": ({ _window, o }) => {

        if (!o.__view__) return
        var children = getDeepChildren({ _window, id: o.id })

        children.map(child => {

            child.__element__.setAttribute("readOnly", true)
            child.__element__.setAttribute("contentEditable", false)
        })

    }, "editable()": ({ _window, o }) => {

        if (!o.__view__) return
        var children = getDeepChildren({ _window, id: o.id })

        children.map(child => {

            child.__element__.setAttribute("readOnly", false)
            child.__element__.setAttribute("contentEditable", true)
        })

    }, "range()": ({ _window, req, res, stack, props, lookupActions, id, e, __, args, object }) => {

        var index = 0
        var range = []
        var startIndex = args[2] ? toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] }) : 0 || 0
        var endIndex = args[2] ? toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[2] }) : toValue({ req, res, _window, lookupActions, stack, props, id, object, e, __, data: args[1] })
        var steps = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[3] }) || 1
        var lang = args[4] || ""
        index = startIndex

        while (index < endIndex) {
            if ((index - startIndex) % steps === 0) {
                range.push(index)
                index += steps
            }
        }

        if (lang === "ar") range = range.map(num => num.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]))
        return range

    }, "droplist()": ({ _window, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var { address, data } = actions["addresser()"]({ _window, stack, props, args, id, interpreting: true, status: "Start", action: "droplist()", object, lookupActions, __ })
        require("./droplist").droplist({ id, e, data, __, stack, props, lookupActions, address, object })
        return true

    }, "print()": () => {

    }, "files()": ({ o }) => {

        return o.__files__

    }, "file()": ({ o }) => {

        return o.__file__

    }, "read()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        // wait address
        var { address, data, action } = actions["addresser()"]({ _window, stack, props, args, status: "Start", asynchronous: true, id: o.id, action: "read()", object, lookupActions, __, id, dataInterpretAction: "conditional" })

        if (!data && o.__name__ === "Input") data = {type: "file", files: [...o.__element__.files]}
        else if (!data) return
        if (!data.type) data.type = "file"

        fileReader({ req, res, _window, lookupActions, stack, props, address, id, e, __, data })

    }, "confirmEmail()": ({ _window, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var { address, data } = actions["addresser()"]({ _window, stack, props, args, status: "Start", asynchronous: true, id: o.id, action: "confirmEmail()", object, lookupActions, __ })

    }, "sendEmail()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var { address, data } = actions["addresser()"]({ _window, stack, props, args, status: "Start", asynchronous: true, id: o.id || id, type: "Mail", action: "sendEmail()", object, lookupActions, __ })
        return callServer({ _window, lookupActions, stack, props, address, id, e, __, req, res, data: { data: data === undefined ? __[0] : data, action: "sendEmail()", server: "mail" } })

    }, "passport()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var { address, data } = actions["addresser()"]({ _window, stack, props, args, req, res, status: "Start", dataInterpretAction: "toParam", asynchronous: true, id: o.id, type: "Auth", action: "passport()", object, lookupActions, __, id })
        require("./database").passport({ _window, lookupActions, stack, props, address, id, e, __, req, res, data })

    }, "server()": ({ _window, req, res, o, stack, props, lookupActions, id, __, args, object }) => {

        var { address, data } = actions["addresser()"]({ _window, stack, props, args, interpreting: true, status: "Start", type: "action", asynchronous: true, id: o.id, action: "server()", object, lookupActions, __ })
        if (typeof data === "string") data = { data: data }

        server({ _window, lookupActions, stack, props, address, id, req, res, data: data.data, __ })

    }, "upload()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var { address, data } = actions["addresser()"]({ _window, stack, props, args, status: "Start", id: o.id || id, type: "Storage", action: "save()", object, lookupActions, __ })
        data.storage = true
        return callServer({ _window, lookupActions, stack, props, address, id, e, __, req, res, data: { data: data === undefined ? __[0] : data, action: "save()", server: "storage" } })

    }, "db()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var { address, data } = actions["addresser()"]({ _window, stack, props, args, status: "Start", id: o.id || id, type: "Data", action: "database()", object, lookupActions, __ })
        return callServer({ _window, lookupActions, stack, props, address, id, e, __, req, res, data: { data: (data === undefined ? __[0] : data), action: data.action, server: "datastore" } })

    }, "search()": ({ _window, global, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var action = "search()"
        var { address, data } = actions["addresser()"]({ _window, stack, props, args, status: "Start", id: o.id || id, type: "Data", action, object, lookupActions, __ })
        if (!_window) action = `search():[${jsonToBracket(data)}]:[send():[_]]`
        return callServer({ _window, lookupActions, stack, props, address, id, e, __, req, res, data: { data: data === undefined ? __[0] : data, action, server: "datastore" } })

    }, "erase()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var action = "erase()"
        var { address, data } = actions["addresser()"]({ _window, stack, props, args, status: "Start", id: o.id || id, type: "Data", action, object, lookupActions, __ })
        if (!_window) action = `erase():[${jsonToBracket(data)}]:[send():[_]]`
        return callServer({ _window, lookupActions, stack, props, address, id, e, __, req, res, data: { data: data === undefined ? __[0] : data, action, server: "datastore" } })

    }, "save()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var action = "save()"
        var { address, data } = actions["addresser()"]({ _window, stack, props, args, status: "Start", id: o.id || id, type: "Data", action, object, lookupActions, __ })
        if (!_window) action = `save():[${jsonToBracket(data)}]:[send():[_]]`
        return callServer({ _window, lookupActions, stack, props, address, id, e, __, req, res, data: { data: data === undefined ? __[0] : data, action, server: "datastore" } })

    }, "start()": ({ global, stack, props }) => {

        var address = stack.addresses.find(address => address.id === stack.interpretingAddressID)
        address.starter = true
        var startID = generate()
        global.__startAddresses__[startID] = { id: startID, address }

        stack.logs.push(`${stack.logs.length} Starter STACK ${stack.id} ${stack.event.toUpperCase()} ${stack.string}`)

        return startID

    }, "end()": ({ _window, req, res, stack, props, lookupActions, id, e, __, args, o, object, pathJoined, data }) => {

        if (!data) var { data } = toLine({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, e, __, data: { string: args[1] }, action: "toValue", object })
        endAddress({ req, res, _window, lookupActions, stack, props, object, id, e, __, data, endID: typeof o === "string" && o })
        return true

    }, "send()": ({ _window, req, res, global, stack, props, lookupActions, id, e, __, args, object, breakRequest, pathJoined }) => {

        breakRequest.break = true

        var response, data

        if (isParam({ _window, string: args[1] })) {

            data = toValue({ req, res, _window, lookupActions, stack, props: {isValue:true}, object, id, e, __, data: args[1] })
            
            //console.log(decode({_window, string:args[1]}));
            response = {...data}
            response.success = response.success !== undefined ? response.success : true
            response.message = response.message || response.msg || "Action executed successfully!"
            delete response.msg

        } else {

            data = toValue({ req, res, _window, lookupActions, id, e, __, data: args[1], stack, props: { isValue: true }, object })
            response = { success: true, message: "Action executed successfully!" }
            if (typeof data === "object" && !Array.isArray(data)) response = { ...response, ...data }
            else response.data = data
        }

        if (stack.renderer && !data.preventDefault) return actions["end()"]({ _window, req, res, stack, props, lookupActions, id, e, __, args, object, pathJoined, data })

        require("./database").respond({ res, stack, props, global, response, __ })
        return response

    }, "sent()": ({ res }) => {

        if (!res || res.headersSent) return true
        else return false

    }, "position()": ({ _window, views, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var position = toValue({ req, res, _window, lookupActions, stack, props: {isValue: true}, id, e, __, data: args[1], object })

        if (!position.id) position.id = o.id
        if (!position.positioner) position.positioner = id

        require("./setPosition").setPosition({ position, id, e })
        return views[position.id]

    }, "csvToJson()": ({ _window, req, res, stack, props, lookupActions, id, e, __, args, object }) => {

        var file = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })
        require("./csvToJson").csvToJson({ id, lookupActions, stack, props, object, e, file, onload: args[2] || "", __ })

    }, "copyToClipBoard()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var text
        if (args[1]) text = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: args[1] })
        else text = o

        if (navigator.clipboard) answer = navigator.clipboard.writeText(text)
        else {
            var textArea = document.createElement("textarea")
            textArea.value = text
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            textArea.setSelectionRange(0, 99999)
            if (navigator.clipboard) navigator.clipboard.writeText(text)
            else document.execCommand("copy")
            document.body.removeChild(textArea)
        }

    }, "addClass()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        if (!o.__view__) return o
        var _class = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __: [o, ...__], data: args[1] })
        if (o.__element__) return o.__element__.classList.add(_class)

    }, "remClass()": ({ _window, req, res, o, stack, props, object, lookupActions, id, e, __, args }) => {

        if (!o.__view__) return o
        var _class = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __: [o, ...__], data: args[1] })
        if (o.__element__) return o.__element__.classList.remove(_class)

    }, "toggleClass()": ({ _window, req, res, o, stack, props, object, lookupActions, id, e, __, args }) => {

        if (!o.__view__) return o
        var _class = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __: [o, ...__], data: args[1] })
        if (o.__element__) return o.__element__.classList.toggle(_class)

    }, "encodeURI()": ({ o }) => {

        return encodeURI(o)

    }, "preventDefault()": ({ e }) => {

        e.preventDefault()

    }, "decodeURI()": ({ o }) => {

        return decodeURI(o)

    }, "root()": ({ _window, req, res, o, stack, props, lookupActions, id, __, args, object }) => {

        var { address, data } = actions["addresser()"]({ _window, stack, props: { isValue: true }, args, interpreting: true, status: "Start", type: "action", blockable: false, renderer: true, id, action: "root()", object, lookupActions, __ })
        if (typeof data === "string") data = { page: data }

        root({ _window, lookupActions, stack, props, address, id, req, res, root: data, __ })

    }, "refresh()": ({ _window, req, res, o = {}, stack, props, address, lookupActions, id, __, args, object, data, mount }) => {

        const views = _window ? _window.views : window.views
        const global = _window ? _window.global : window.global

        if (o.__view__) {
            var { address, data = {} } = actions["addresser()"]({ _window, stack, props, args, interpreting: true, status: "Start", type: "action", dataInterpretAction: "toValue", renderer: true, blockable: false, id, action: "refresh()", object, lookupActions, __ })
            data.id = data.id || o.id
        } else if (!data) return false

        const view = views[data.id]

        if (!data.postUpdate) {

            let parent = views[data.__parent__ || view.__parent__]
            let __index__ = data.__index__ !== undefined ? data.__index__ : (view.__loop__ ? view.__index__ : undefined)
            let __childIndex__ = data.__childIndex__ !== undefined ? data.__childIndex__ : view.__childIndex__
            let __prevViewPath__ = data.__prevViewPath__ || view.__prevViewPath__
            let __prevViewCollection__ = data.__prevViewCollection__ || view.__prevViewCollection__
            let __viewPath__ = [...(data.__viewPath__ || view.__viewPath__)]
            let __customViewPath__ = [...(data.__customViewPath__ || view.__customViewPath__)]
            let __lookupActions__ = [...(data.__lookupActions__ || view.__lookupActions__)]
            let my__ = data.__ || view.__

            let elements = []
            let timer = (new Date()).getTime()

            if (!view) return false

            // close publics
            closePublicViews({ _window, id: data.id, __, stack, props, lookupActions })

            let customView = data.view
            if (!customView) {
                
                if (__prevViewPath__) customView = clone(__prevViewPath__.reduce((o, k) => o[k], global.__queries__[__prevViewCollection__ || "view"]))
                else customView = clone(__viewPath__.reduce((o, k) => o[k], global.__queries__[view.__viewCollection__ || "view"]))
            }

            // get view to be rendered
            let reducedView = {
                ...customView,
                __index__,
                __childIndex__,
                __view__: true,
                __loop__: view.__loop__,
                __viewPath__,
                __prevViewPath__,
                __prevViewCollection__,
                __customViewPath__,
                __customView__: data.__customView__ || view.__customView__,
                __lookupActions__,
                __page__: data.id === global.__pageViewID__,
                ...(data.passData || {}),
            }
            
            // data
            if (data.data !== undefined) {

                if ("mount" in data) {

                    reducedView.data = data.data
                    reducedView.form = data.form || view.form || parent.form || generate()
                    global[reducedView.form] = global[reducedView.form] || reducedView.data
                }

                if (!("__" in data)) my__ = [data.data, ...my__]

            } else if (data.form !== undefined) {

                reducedView.form = data.form
                global[reducedView.form] = global[reducedView.form] || reducedView.data || {}
                if (!("__" in data)) my__ = [global[reducedView.form], ...my__]
            }

            // path
            if (data.path !== undefined) reducedView.__dataPath__ = (Array.isArray(data.path) ? data.path : typeof data.path === "number" ? [data.path] : data.path.split(".")) || []

            // remove views
            if (!data.insert && parent.__rendered__) {
                    parent.__childrenRef__.filter(({ index, childIndex }) => 
                    (data.__childIndex__ === undefined && view.__loop__) ? (index === view.__index__) : (childIndex === __childIndex__))
                    .map(({ id }) => elements.push(removeView({ _window, global, views, id, stack, props, main: true, insert: data.insert }))
                )
            } else if (!parent.__rendered__) removeView({ _window, global, views, id: data.id, stack, props, main: true })

            // remove loop
            if (reducedView.view.charAt(0) === "[" && reducedView.view.split(":")[0].slice(-1)[0] === "]") {
                reducedView.view = actions["encode()"]({ id, stack, string: actions["encode()"]({ _window, id, stack, string: reducedView.view, start: "'" }) })
                reducedView.view = global.__refs__[reducedView.view.slice(0, 7)].data + "?" + decode({ string: reducedView.view.split("?").slice(1).join("?") })
            }
            
            // address for delete blocked addresses (switch with second next address => execute after end of update waits)
            blockRelatedAddressesByViewID({ stack, id: data.id })

            // address for post update
            actions["addresser()"]({ _window, id, stack, props, switchNextAddressIDWith: address, type: "function", function: "refresh", __, lookupActions, data: { ...data, childIndex: __childIndex__, index: __index__, elements, timer, parent, postUpdate: true } })

            // address for rendering view
            address = actions["addresser()"]({ _window, id, stack, props, nextAddress: address, status: "Start", type: "function", function: "view", interpreting: true, __: my__, lookupActions: __lookupActions__, data: { view: reducedView, parent: parent.id } }).address
            
            // render
            let myView = actions["view()"]({ _window, lookupActions: __lookupActions__, stack, props, req, res, address, __: my__, data: { view: reducedView, parent: parent.id } })
            
            // seq: END:toView => END:refresh() => START:postUpdate => END:postUpdate => START:waits => END:waits => START:spliceBlockedAddresses

            // address
            actions["stackManager()"]({ _window, lookupActions, stack, props, address, id, req, res, __ })
            
            return myView

        } else { // post update

            const { childIndex, elements, root, timer, parent, inserted, unappend, action } = data
            
            // tohtml parent
            delete parent.__html__
            actions["html()"]({ _window, lookupActions, stack, props, __, id: parent.id })

            const renderedRefView = parent.__childrenRef__.filter(({ id, childIndex: chdIndex }) => (inserted ? chdIndex === childIndex : true) && !views[id].__rendered__ && views[id])
            if (unappend) {
                renderedRefView.map(({ index }) => parent.__childrenRef__.splice(index, 1))
                parent.__indexing__--
            }

            const renderedIDs = renderedRefView.map(({ id }) => id)

            // innerhtml
            const innerHTML = renderedIDs.map(id => views[id].__html__).join("")

            // id list
            const idLists = innerHTML.split("id='").slice(1).map(id => id.split("'")[0])

            // remove prev elements
            elements.map(element => element.nodeType ? element.remove() : (delete views[element.id]))
            
            // browser actions
            if (!_window && innerHTML && parent.__rendered__) {

                var lDiv = document.createElement("div")
                document.body.appendChild(lDiv)
                lDiv.style.position = "absolute"
                lDiv.style.opacity = "0"
                lDiv.style.left = -1000
                lDiv.style.top = -1000
                lDiv.innerHTML = innerHTML

                !unappend && renderedRefView.map(({ index }) => {

                    if (index >= parent.__element__.children.length || parent.__element__.children.length === 0) parent.__element__.appendChild(lDiv.children[0])
                    else parent.__element__.insertBefore(lDiv.children[0], parent.__element__.children[index])
                })
                
                // start
                var relatedEvents = idLists.map(id => starter({ _window, lookupActions, address, stack, props, __, id }))

                // loaded events
                idLists.map(id => views[id] && views[id].__loadedEvents__.map(data => eventExecuter(data)))

                // related events: assign to others
                relatedEvents.map(relatedEvents => {
                    Object.entries(relatedEvents).map(([eventID, address]) => {
                        Object.values(address).map(address => views[eventID] && views[eventID].__rendered__ && views[eventID].__element__.addEventListener(address.event, address.eventListener))
                    })
                })

                // display view
                renderedIDs.map(id => views[id].__element__.style.opacity = "1")

                // state, title, & path
                if (renderedIDs[0] === "root" && views[global.manifest.page]) {

                    document.body.scrollTop = document.documentElement.scrollTop = 0
                    let title = root.title || views[global.manifest.page].title
                    let path = root.path || views[global.manifest.page].path

                    history.pushState(null, title, path)
                    document.title = title
                }

                if (lDiv) {

                    document.body.removeChild(lDiv)
                    lDiv = null
                }
                
                loader({ show: false })

            } else if (!innerHTML) console.log("View has conditions which are not applied!");

            console.log((new Date()).getHours() + ":" + (new Date()).getMinutes(), (action || "REFRESH") + ":" + (action === "ROOT" ? global.manifest.page : renderedIDs[0]), (new Date()).getTime() - timer)

            if (address) {
                address.params.__ = [{
                    view: renderedIDs.length === 1 ? views[renderedIDs[0]] : renderedIDs.map(id => views[id]), 
                    message: "View updated successfully!", 
                    success: true 
                }, ...address.params.__]
                address.params.id = views[address.params.id] ? address.params.id : renderedIDs[0]
            }
        }

    }, "insert()": ({ _window, o = {}, stack, props, lookupActions, id, __, args, object, unappend }) => {

        // wait address
        var { address, data: insert = {} } = actions["addresser()"]({ _window, stack, props, args, interpreting: true, status: "Start", type: "action", renderer: true, id, action: "insert()", lookupActions, __, object })
        if (!args[1] && unappend) insert.view = o
        
        var { index, view, path, data, form, viewPath = [], preventDefault, mount, unappend = false } = insert
        
        var views = window.views
        var global = window.global
        var parent = o
        var passData = {}, myID
        var __childIndex__
    
        if (insert.__view__) {
    
            view = insert
    
        } else if (!view) {
    
            var childrenRef = parent.__childrenRef__.find(({ id: viewID }) => viewID === id || getDeepChildrenId({ id: viewID }).includes(id))
    
            if (childrenRef) view = insert = views[childrenRef.id]
            else view = insert = views[parent.__childrenRef__[0].id]
        }
    
        // clone
        if (typeof view === "object" && view.__view__) {
    
            // id
            myID = view.id
    
            // childIndex
            __childIndex__ = view.__childIndex__
    
            // index
            if (unappend) index = parent.__childrenRef__.length
            else index = index !== undefined ? index : (view.__index__ + 1)
                
            // path
            path = [...(path || view.__dataPath__)]
            form = form || view.form
    
            // get data
            passData.data = (insert.__view__) ? (typeof insert.__[insert.__underscoreLoopIndex__ || 0] === "object" ? {} : "") // insert():[...]
                : (insert.view && !("data" in insert)) ? (typeof insert.view.__[insert.__underscoreLoopIndex__ || 0] === "object" ? {} : "") // insert():[view=...]
                    : (insert.view && ("data" in insert) ? data : undefined); // insert():[view=...;data=...]
    
            if (!preventDefault) {
    
                // increment data index
                if (isNumber(path[path.length - 1])) path[path.length - 1] += 1
    
                // increment next views dataPath index
                var itemIndex = view.__dataPath__.length - 1
                if (index < parent.__childrenRef__.length)
                    parent.__childrenRef__.slice(index).map(viewRef => updateDataPath({ id: viewRef.id, myIndex: view.__dataPath__[itemIndex], index: itemIndex, increment: true }))
    
                // mount data
                passData.data !== undefined && path.reduce((o, k, i) => {
    
                    if (itemIndex === 0) o.splice(path[itemIndex], 0, passData.data)
                    else if (i === itemIndex - 1) o[k].splice(path[itemIndex], 0, passData.data)
                    else if (i >= itemIndex) return
                    else return o[k]
    
                }, global[form])
    
            }
    
            // inserted view params
            passData = {
                __: ((view.__loop__ && view.__mount__) || preventDefault) ? [passData.data, ...view.__.slice((view.__underscoreLoopIndex__ || 0) + 1)] : view.__,
                __viewPath__: [...view.__viewPath__, ...viewPath],
                __prevViewPath__: view.__prevViewPath__,
                __prevViewCollection__: view.__prevViewCollection__,
                __customViewPath__: [...view.__customViewPath__],
                __lookupActions__: [...view.__lookupActions__],
                passData: {
                    __loop__: view.__loop__,
                    __mount__: view.__mount__,
                }
            }
    
            // get raw view
            if (view.__prevViewPath__ && viewPath.length === 0) view = clone(view.__prevViewPath__.reduce((o, k) => o[k], global.__queries__[view.__prevViewCollection__]))
            else view = clone(([...view.__viewPath__, ...viewPath]).reduce((o, k) => o[k], global.__queries__[view.__viewCollection__]))
    
        } else { // new View
    
            if (typeof view !== "string") {

                var genView = []
                global.__queries__.view[genView] = clone(view)
    
                passData = {
                    __viewPath__: [genView, ...viewPath],
                    __customViewPath__: [...parent.__customViewPath__, genView],
                    __lookupActions__: [{ doc: genView, collection: "view" }, ...parent.__lookupActions__]
                }

            } else {
    
                if (global.__queries__.view[view]) view = clone((viewPath).reduce((o, k) => o[k], global.__queries__.view[view]))
                else view = { view }
    
                passData = {
                    __viewPath__: [...viewPath],
                    __customViewPath__: [...toArray(parent.__customViewPath__)],
                    __lookupActions__: [{ doc: genView, collection: "view" }, ...parent.__lookupActions__]
                }
            }
        }
    
        if (typeof view !== "object") return console.log("Missing View!")
    
        // index
        if (index === undefined) index = parent.__element__.children.length
    
        // remove loop
        if (view.view.charAt(0) === "[") {
            view.view = actions["encode()"]({ id, stack, string: actions["encode()"]({ id, stack, string: view.view, start: "'" }) })
            view.view = global.__refs__[view.view.slice(0, 7)].data + "?" + decode({ string: view.view.split("?").slice(1).join("?") })
        }
    
        return actions["refresh()"]({ lookupActions, stack, props, object, address, id, __, data: { view: { ...clone(view), __inserted__: true }, id: myID || id, path, data, form, __childIndex__, __index__: index, insert: true, mount, __parent__: parent.id, action: unappend ? "VIEW" : "INSERT", unappend, ...passData } })

    }, "duplicate()": ({ _window, o = {}, stack, props, lookupActions, id, __, args, object, unappend }) => {

        // wait address
        var { address, data: insert = {} } = actions["addresser()"]({ _window, stack, props, args, interpreting: true, status: "Start", type: "action", renderer: true, id, action: "insert()", lookupActions, __, object })
        if (!args[1] && unappend) insert.view = o
        
        var { index, view, path, data, form, viewPath = [], preventDefault, mount, unappend = false } = insert
        
        let views = window.views
        let global = window.global
        let parent = views[o.__parent__]
        let passData = {}, myID
        let __childIndex__
    
        if (insert.__view__) view = insert
        else if (!view) view = insert = o
    
        // clone
        if (typeof view === "object" && view.__view__) {
    
            // id
            myID = view.id
    
            // childIndex
            __childIndex__ = view.__childIndex__
    
            // index
            if (unappend) index = parent.__childrenRef__.length
            else index = index !== undefined ? index : (view.__index__ + 1)
                
            // path
            path = [...(path || view.__dataPath__)]
            form = form || view.form
    
            // get data
            passData.data = (insert.__view__) ? (typeof insert.__[insert.__underscoreLoopIndex__ || 0] === "object" ? {} : "") // insert():[...]
                : (insert.view && !("data" in insert)) ? (typeof insert.view.__[insert.__underscoreLoopIndex__ || 0] === "object" ? {} : "") // insert():[view=...]
                    : (insert.view && ("data" in insert) ? data : undefined); // insert():[view=...;data=...]
    
            if (!preventDefault) {
    
                // increment data index
                if (isNumber(path[path.length - 1])) path[path.length - 1] += 1
    
                // increment next views dataPath index
                var itemIndex = view.__dataPath__.length - 1
                if (index < parent.__childrenRef__.length)
                    parent.__childrenRef__.slice(index).map(viewRef => updateDataPath({ id: viewRef.id, myIndex: view.__dataPath__[itemIndex], index: itemIndex, increment: true }))
    
                // mount data
                passData.data !== undefined && path.reduce((o, k, i) => {
    
                    if (itemIndex === 0) o.splice(path[itemIndex], 0, passData.data)
                    else if (i === itemIndex - 1) o[k].splice(path[itemIndex], 0, passData.data)
                    else if (i >= itemIndex) return
                    else return o[k]
    
                }, global[form])
            }
    
            // inserted view params
            passData = {
                __: ((view.__loop__ && view.__mount__) || preventDefault) ? [passData.data, ...view.__.slice((view.__underscoreLoopIndex__ || 0) + 1)] : view.__,
                __viewPath__: [...view.__viewPath__, ...viewPath],
                __prevViewPath__: view.__prevViewPath__,
                __prevViewCollection__: view.__prevViewCollection__,
                __customViewPath__: [...view.__customViewPath__],
                __lookupActions__: [...view.__lookupActions__],
                passData: {
                    __loop__: view.__loop__,
                    __mount__: view.__mount__,
                }
            }
    
            // get raw view
            if (view.__prevViewPath__ && viewPath.length === 0) view = clone(view.__prevViewPath__.reduce((o, k) => o[k], global.__queries__[view.__prevViewCollection__]))
            else view = clone(([...view.__viewPath__, ...viewPath]).reduce((o, k) => o[k], global.__queries__[view.__viewCollection__]))
    
        } else { // new View
    
            if (typeof view !== "string") {

                var genView = []
                global.__queries__.view[genView] = clone(view)
    
                passData = {
                    __viewPath__: [genView, ...viewPath],
                    __customViewPath__: [...parent.__customViewPath__, genView],
                    __lookupActions__: [{ doc: genView, collection: "view" }, ...parent.__lookupActions__]
                }

            } else {
    
                if (global.__queries__.view[view]) view = clone((viewPath).reduce((o, k) => o[k], global.__queries__.view[view]))
                else view = { view }
    
                passData = {
                    __viewPath__: [...viewPath],
                    __customViewPath__: [...parent.__customViewPath__],
                    __lookupActions__: [{ doc: genView, collection: "view" }, ...parent.__lookupActions__]
                }
            }
        }
    
        if (typeof view !== "object") return console.log("Missing View!")
    
        // index
        if (index === undefined) index = parent.__element__.children.length
    
        return actions["refresh()"]({ lookupActions, stack, props, object, address, id, __, data: { view: { ...clone(view), __inserted__: true }, id: myID || id, path, data, form, __childIndex__, __index__: index, insert: true, mount, __parent__: parent.id, action: unappend ? "VIEW" : "INSERT", unappend, ...passData } })

    }, "html()": ({ _window, stack, id, o = {} }) => {

        if (o.id) id = o.id
        const views = _window ? _window.views : window.views
        let view = views[id]
        if (!view) return
        let parent = views[view.__parent__]
        
        if (!parent) return 
        let name = view.__name__, html = ""
    
        // remove view
        delete view.view
        delete view.children
    
        if (name === "Action") return
    
        // text
        let text = typeof view.text !== "object" && view.text !== undefined ? view.text : ((view.editable || view.__name__ === "Input" || view.__name__ === "Text") && typeof view.data !== "object" && view.data !== undefined) ? view.data : ""
    
        // replace encoded spaces
        if (text) text = replaceNbsps(text)
    
        // html
        let innerHTML = (view.__childrenRef__.map(({ id }) => views[id].__html__).join("") || text || "") + ""
    
        // required
        if (view.required && name === "Text") {
    
            if (typeof view.required === "string") view.required = {}
            name = "View"
            view.style.display = "block"
            innerHTML += `<span style='color:red; font-size:${(view.required.style && view.required.style.fontSize) || "1.6rem"}; padding:${(view.required.style && view.required.style.padding) || "0 0.4rem"}'>*</span>`
        }
    
        // html attributes
        let atts = Object.entries(view.attribute || {}).map(([key, value]) => `${key}='${value}'`).join(" ")

        // styles
        view.__htmlStyles__ = ""
        if (view.style) {
            Object.entries(view.style).map(([style, value]) => {
                view.__htmlStyles__ += `${cssStyleKeyNames[style] || style}:${value}; `
            })
    
            view.__htmlStyles__ = view.__htmlStyles__.slice(0, -2)
        }
    
        // colorize
        if (view.colorize) {
    
            innerHTML = actions["encode()"]({ _window, id, stack, string: actions["encode()"]({ _window, id, stack, string: innerHTML, start: "'" }) })
            innerHTML = colorize({ _window, string: innerHTML, ...(typeof view.colorize === "object" ? view.colorize : {}) })
        }
        
        if (name === "View") {
            html = `<div ${atts} ${view.draggable !== undefined ? `draggable='${view.draggable}'` : ''} spellcheck='false' ${view.editable && !view.readonly ? `contenteditable='true'` : ''} class='${view.class || ""}' id='${view.id}' style='${view.__htmlStyles__}'>${innerHTML || view.text || ''}</div>`
        } else if (name === "Image") {
            html = `<img ${atts} ${view.draggable !== undefined ? `draggable='${view.draggable}'` : ""} class='${view.class || ""}' alt='${view.alt || ''}' id='${view.id}' style='${view.__htmlStyles__}' ${view.src ? `src='${view.src}'` : ""}></img>`
        } else if (name === "Text") {
            if (view.h1) {
                html = `<h1 ${atts} ${view.draggable !== undefined ? `draggable='${view.draggable}'` : ""} class='${view.class || ""}' id='${view.id}' style='${view.__htmlStyles__}'>${innerHTML}</h1>`
            } else if (view.h2) {
                html = `<h2 ${atts} ${view.draggable !== undefined ? `draggable='${view.draggable}'` : ""} class='${view.class || ""}' id='${view.id}' style='${view.__htmlStyles__}'>${innerHTML}</h2>`
            } else if (view.h3) {
                html = `<h3 ${atts} ${view.draggable !== undefined ? `draggable='${view.draggable}'` : ""} class='${view.class || ""}' id='${view.id}' style='${view.__htmlStyles__}'>${innerHTML}</h3>`
            } else if (view.h4) {
                html = `<h4 ${atts} ${view.draggable !== undefined ? `draggable='${view.draggable}'` : ""} class='${view.class || ""}' id='${view.id}' style='${view.__htmlStyles__}'>${innerHTML}</h4>`
            } else if (view.h5) {
                html = `<h5 ${atts} ${view.draggable !== undefined ? `draggable='${view.draggable}'` : ""} class='${view.class || ""}' id='${view.id}' style='${view.__htmlStyles__}'>${innerHTML}</h5>`
            } else if (view.h6) {
                html = `<h6 ${atts} ${view.draggable !== undefined ? `draggable='${view.draggable}'` : ""} class='${view.class || ""}' id='${view.id}' style='${view.__htmlStyles__}'>${innerHTML}</h6>`
            } else {
                html = `<p ${atts} ${view.editable ? "contenteditable " : ""}class='${view.class || ""}' id='${view.id}' style='${view.__htmlStyles__}'>${text}</p>`
            }
        } else if (name === "Icon") {
            html = `<i ${atts} ${view.draggable !== undefined ? `draggable='${view.draggable}'` : ""} class='${view.outlined ? "material-icons-outlined" : (view.symbol.outlined) ? "material-symbols-outlined" : (view.rounded || view.round) ? "material-icons-round" : (view.symbol.rounded || view.symbol.round) ? "material-symbols-round" : view.sharp ? "material-icons-sharp" : view.symbol.sharp ? "material-symbols-sharp" : (view.filled || view.fill) ? "material-icons" : (view.symbol.filled || view.symbol.fill) ? "material-symbols" : view.twoTone ? "material-icons-two-tone" : ""} ${view.class || "" || ""} ${view.icon.name}' id='${view.id}' style='${view.__htmlStyles__}${_window ? "; opacity:0; transition:.2s" : ""}'>${view.google ? view.icon.name : ""}</i>`
        } else if (name === "Input") {
            if (view.textarea) {
                html = `<textarea ${atts} ${view.draggable !== undefined ? `draggable='${view.draggable}'` : ""} spellcheck='false' class='${view.class || ""}' id='${view.id}' style='${view.__htmlStyles__}' placeholder='${view.placeholder || ""}' ${view.readonly ? "readonly" : ""} ${view.maxlength || ""}>${text}</textarea>`
            } else {
                html = `<input ${atts} ${view.draggable !== undefined ? `draggable='${view.draggable}'` : ""} ${view.multiple ? "multiple" : ""} ${view["data-date-inline-picker"] ? "data-date-inline-picker='true'" : ""} spellcheck='false' class='${view.class || ""}' id='${view.id}' style='${view.__htmlStyles__}' type='${view.input.type || "text"}' ${view.input.accept ? `accept='${view.input.accept}'` : ""} ${view.placeholder ? `placeholder='${view.placeholder}'` : ""} ${text !== undefined ? `value='${text}'` : ""} ${view.readonly ? "readonly" : ""} ${view.input.min ? `min="${view.input.min}"` : ""} ${view.input.max ? `max="${view.input.max}"` : ""} ${view.checked ? "checked" : ""} ${view.disabled ? "disabled" : ''} />`
            }
        } else if (name === "Video") {
            html = `<video ${atts} style='${view.__htmlStyles__}' controls>
            ${toArray(view.src).map(src => typeof src === "string" ? `<source src=${src}>` : typeof src === "object" ? `<source src=${src.src} type=${src.type}>` : "")}
            ${view.alt || view.message || ""}
          </video>`
        } else if (name === "Link") {
            html = `<a ${atts} ${view.draggable !== undefined ? `draggable='${view.draggable}'` : ''} spellcheck='false' ${view.editable && !view.readonly ? 'contenteditable' : ''} class='${view.class || ""}' id='${view.id}' style='${view.__htmlStyles__}' href='${view.src}' type='${view.type||"image/*"}'>${innerHTML || view.text || ''}</a>`
        } else return html = `<></>`
    
        // indexing
        let index = 0
        if (!view.__indexed__) {
    
            // remove from initial index list
            let initialIDIndex = parent.__childrenInitialIDRef__.indexOf(view.__initialID__)
            if (initialIDIndex > -1) parent.__childrenInitialIDRef__.splice(initialIDIndex, 1)

            // find index
            if (view.__index__ === undefined) while (parent.__childrenRef__[index] && ((parent.__childrenRef__[index].childIndex < view.__childIndex__) || (!view.__inserted__ && parent.__childrenRef__[index].childIndex === view.__childIndex__ && parent.__childrenRef__[index].initialIndex < view.__initialIndex__))) { index++ }
            else index = view.__index__
    
            // set index
            view.__index__ = index
    
            // increment next children index
            parent.__childrenRef__.slice(index).map(viewRef => {
                viewRef.index++
                views[viewRef.id].__index__ = viewRef.index
                views[viewRef.id].__rendered__ && views[viewRef.id].__element__.setAttribute("index", viewRef.index)
            })
    
            // push id to parent children ids
            parent.__childrenRef__.splice(index, 0, { id, index, childIndex: view.__childIndex__, initialIndex: view.__initialIndex__ })
    
            view.__indexed__ = true
        }
    
        // init element
        // view.__element__ = view.__element__ || { text, id, index, style: {} }
    
        view.__html__ = html

        //delete view.__initialID__
        delete view.__indexing__
        delete view.__initialIndex__
        delete view.__params__
        delete view.__subParamsInterpreted__
        delete view.__paramsInterpreted__
        delete view.__htmlStyles__
        //delete view.__indexed__
    
        return html

    }, "view()": ({ _window, lookupActions, stack, props = {}, address, req, res, __, id, o, object, args = [], data = {} }) => {

        if (args[1]) return actions["insert()"]({ _window, o, stack, props, lookupActions, id, __, args, object, unappend: true })
        else if (o) return actions["insert()"]({ _window, o, stack, props, lookupActions, id, __, args, object, unappend: true })

        let views = _window ? _window.views : window.views
        let global = _window ? _window.global : window.global
        let view = data.view || views[id]
        
        // interpret subparams
        if (!view.__subParamsInterpreted__) {

            // init view
            var details = initView({ views, global, id, parent: data.parent, ...(data.view || {}), __ })
            id = details.id
            view = views[id]

            // no view
            if (!view.view) return removeView({ _window, global, views, lookupActions, stack, props, id, address, __ })

            // encode
            view.__name__ = actions["encode()"]({ _window, id, stack, string: actions["encode()"]({ _window, id, stack, string: view.__name__, start: "'" }) })

            // 
            var name = view.__name__.split("?")[0]
            view.__params__ = view.__name__.split("?")[1]
            view.__conditions__ = view.__name__.split("?")[2]
            var subParams = name.split(":").slice(1).join(":") || ""
            view.__name__ = name.split(":")[0]

            // loop
            data.loop = view.__name__.slice(0, 2) === "@$" && view.__name__.length == 7 && (subParams.slice(0, 2) === "@$" && subParams.length == 7 || !subParams)

            // global:() || action():[...]
            if (subParams.includes("()") || view.__name__.includes("()")) {
                view.__name__ += ":" + subParams
                subParams = ""
                if (view.__name__ === "manifest:().page") view.__page__ = true
            }

            // interpret subparams
            if (subParams) {

                view.__interpretingSubparams__ = true
                var { data: subParams = {}, conditionsNotApplied } = toLine({ _window, lookupActions, stack, props: { isValue: true }, id, data: { string: subParams }, req, res, object: [view], __ })
                
                if (conditionsNotApplied) return removeView({ _window, global, views, id, stack, props, address, lookupActions, req, res, __ })
                else view.__subParams__ = subParams
                view.__interpretingSubparams__ = false
            }

            view.__subParamsInterpreted__ = true

            // asynchronous actions within view params
            if (address.hold) return actions["addresser()"]({ _window, id, stack, props, switchNextAddressIDWith: address, type: "function", function: "view", __, lookupActions, stack, props, data: { view, loop: data.loop } })
        }

        // interpret params
        if (!view.__paramsInterpreted__) {

            // [View]
            if (data.loop) return loopOverView({ _window, id, stack, props, lookupActions, __, address, data: view.__subParams__ || {}, req, res })

            // subparam is params or id
            if (view.__subParams__ && typeof view.__subParams__ === "string" && view.__subParams__ !== id) {

                var newID = view.__subParams__
                if (views[newID] && view.id !== newID) newID += "_" + generate()

                delete Object.assign(views, { [newID]: views[id] })[id]

                // remove from initial index list
                if (views[view.parent]) {
                    var initialIDIndex = views[view.parent].__childrenInitialIDRef__.indexOf(id)
                    if (initialIDIndex > -1) views[view.parent].__childrenInitialIDRef__.splice(initialIDIndex, 1)
                    views[view.parent].__childrenInitialIDRef__.push(newID)
                }

                id = newID
                views[id].id = id
                view = views[id]
                view.__customID__ = true
            }

            // conditions
            var approved = toApproval({ _window, lookupActions, stack, props, data: view.__conditions__, id, req, res, __, object: [view] })
            if (!approved) return removeView({ _window, global, views, id, stack, props, address, lookupActions, req, res, __ })

            // params
            if (view.__params__) {

                toParam({ _window, lookupActions, stack, props, data: view.__params__, id, req, res, object: [view], __ })

                // id changed
                if (view.id !== id) id = view.id
                if (!views[id] || view.__initialID__ !== views[id].__initialID__) return
            }

            // data
            view.data = kernel({ _window, id, stack, props: {}, lookupActions, data: { path: view.__dataPath__, data: global[view.form], value: view.data, key: true }, __ })

            // set interpreted
            view.__paramsInterpreted__ = true

            // maybe update in params or root
            if (address.blocked) return// actions["stackManager()"]({ _window, lookupActions, stack, props, address, id, req, res, __ })
            
            // asynchronous actions within view params
            if (address.hold) return actions["addresser()"]({ _window, id, stack, props, switchNextAddressIDWith: address, type: "function", function: "view", __, lookupActions, stack, props, data: { view } })
        }

        // no view name
        if (!view.__name__ || typeof view.__name__ !== "string" || view.__name__.charAt(0) === "#") return removeView({ _window, global, views, id, stack, props, address, lookupActions, req, res, __ })

        // @collection.doc
        var collection = view.__viewCollection__, prevCollection = view.__prevViewCollection__
        
        if (view.__name__.charAt(0) === "@" && view.__name__.charAt(1) !== "$") {
            
            // var collectionDoc = toValue({ _window, lookupActions, stack, props, data: view.__name__.slice(1), __, id, e, req, res, object: [view] })
            view.__name__ = view.__name__.slice(1)
            var name = view.__name__.split(".").slice(-1)[0]
            name = toValue({ _window, lookupActions, stack, props: { isValue: true }, data: name, __, id, req, res, object: [view] })
            var collection = view.__name__.split(".").slice(0, -1).join(".")

            //if (collection.charAt(0) === "@") collection = toValue({ _window, lookupActions, stack, props: { isValue: true }, data: collection, __, id, req, res, object: [view] })
            //if (collection === undefined) return
            
            // @.topbar => @view.component.topbar.topbar
            if (!collection) collection = (view.__viewCollection__ || view.__prevViewCollection__) + (collection === "." ? "" : collection)
           
            view.__prevViewCollection__ = prevCollection = view.__prevViewPath__ ? view.__prevViewCollection__ : view.__viewCollection__
            view.__name__ = name
            view.__viewCollection__ = collection
            global.__queries__[collection] = global.__queries__[collection] || {}
            
        } else view.__name__ = toValue({ _window, id, req, res, lookupActions, data: view.__name__, __, stack, props: { isValue: true }, object: [view] })

        // prepare for toHTML
        componentModifier({ _window, view })

        // not builtin view => custom View
        if (!myViews.includes(view.__name__)) {

            // queried before and not found
            if (global.__queries__[collection][view.__name__] === false) return removeView({ _window, global, views, id, stack, props, address, lookupActions, req, res, __ })

            // query custom view
            if (!global.__queries__[collection][view.__name__]) {

                address.interpreting = false
                address.status = "Wait"
                address.data = { view }
                address.params.id = id

                return searchDoc({ _window, lookupActions, stack, props, address, id, __, req, res, object: [view], data: { data: { collection, doc: view.__name__ }, searchDoc: true } })
            }

            // continue to custom view
            else {

                var newView = {
                    ...clone(global.__queries__[collection][view.__name__]),
                    __paramsInterpreted__: false,
                    __subParamsInterpreted__: false,
                    __customView__: view.__name__,
                    __viewPath__: [view.__name__],
                    __prevViewPath__: view.__prevViewPath__ || [...view.__viewPath__],
                    __prevViewCollection__: prevCollection,
                    __customViewPath__: [...view.__customViewPath__, view.__name__],
                    __lookupActions__: [{ collection, doc: view.__name__ }, ...view.__lookupActions__]
                }

                // id
                if (newView.id && views[newView.id] && newView.id !== id) newView.id += "_" + generate()
                else if (newView.id) newView.__customID__ = true
                else if (!newView.id) newView.id = id

                var child = { ...view, ...newView }
                views[child.id] = child

                // inorder to stop recursion 
                if (!newView.view) child.view = ""

                let data = getViewParams({ view })
                
                return actions["view()"]({ _window, stack, props, address, req, res, lookupActions: child.__lookupActions__, __: Object.keys(data).length > 0 ? [data, ...__] : [...__], data: { view: child, parent: view.__parent__ } })
            }
        }
        
        var toViewAddress = address
        toViewAddress.interpreting = false

        // render children
        if (view.children.length > 0) {

            // html address
            address = actions["addresser()"]({ _window, id, stack, props, type: "function", function: "html", file: "view", __, lookupActions, nextAddress: address }).address

            var lastIndex = view.children.length - 1;
            var children = [...view.children]

            // address children
            for (let index = lastIndex; index >= 0; index--) {
                const child = children[index];
                
                if (!child) return
                var childID = child.id || generate()
                views[childID] = { ...child, id: childID, __view__: true, __parent__: id, __viewPath__: [...view.__viewPath__, "children", index], __childIndex__: index, __viewCollection__: collection, __prevViewCollection__: view.__viewCollectionUpdated__ ? prevCollection : collection }

                // address
                address = actions["addresser()"]({ _window, id: childID, stack, props, type: "function", function: "view", __: [...__], lookupActions, nextAddress: address, data: { view: views[childID] } }).address
            }

        } else actions["html()"]({ _window, id, stack, props, __ })

        if (view.__page__) global.__pageViewID__ = view.id
        
        // address
        if (!toViewAddress.hold) actions["stackManager()"]({ _window, lookupActions, stack, props, address, id, req, res, __ })
        return view

    }, "encode()": ({ _window, id, string, e, stack, start = "[", end = "]", ignoreReplace = true }) => {

        if (typeof string !== "string") return string
        let global = _window ? _window.global : window.global

        // text
        if (start === "'") end = "'"
        
        // ignoreReplace
        if (ignoreReplace) string = replaceNbsps(string)
            .replaceAll("[]", "__map__")
            .replaceAll(/\\'(?!['])/g, "__quote__")
            .replace(/\\\[/g, "__openSquareBracket__")
            .replace(/\\\]/g, "__closeSquareBracket__")

        // init
        let type = start === "'" ? "text" : "code"
        let keys = string.split(start)

        if (keys[1] !== undefined) {

            let key = `@$${generate()}`
            let subKey = keys[1].split(end)

            // ex. [ [ [] [] ] ]
            while (subKey[0] === keys[1] && keys[2] !== undefined) {

            keys[1] += `${start}${keys[2]}`
            if (keys[1].includes(end) && keys[2]) {
                keys[1] = actions["encode()"]({ _window, id, stack, string: keys[1], e, start, ignoreReplace: false })
            }
            keys.splice(2, 1)
            subKey = keys[1].split(end)
            }

            // ex. 1.2.3.[4.5.6
            if (subKey[0] === keys[1] && keys.length === 2) return keys.join(start)//.replaceAll("__map__", "[]")

            // text
            if (subKey[0].split("'").length > 1) subKey[0] = actions["encode()"]({ _window, id, stack, string: subKey[0], start: "'" })

            // reference
            global.__refs__[key] = { 
                id, 
                type, 
                data: subKey[0]
                .replaceAll("__map__", "[]")
                .replaceAll("__quote__", "'")
                .replace("__openSquareBracket__", "[")
                .replace("__closeSquareBracket__", "]")
            }

            stack.refs.push(key)

            let value = key
            let before = keys[0]
            subKey = subKey.slice(1)
            keys = keys.slice(2)
            let after = keys.join(start) ? `${start}${keys.join(start)}` : ""

            string = `${before}${value}${subKey.join(end)}${after}`
        }

        if (string.split(start)[1] !== undefined && string.split(start).slice(1).join(start).length > 0) string = actions["encode()"]({ _window, stack, id, string, e, start, ignoreReplace: false })

        if (ignoreReplace) string = string
            .replaceAll("__map__", "[]")
            .replaceAll("__quote__", "'")
            .replace("__openSquareBracket__", "[")
            .replace("__closeSquareBracket__", "]")

        return string

    }, "stackManager()": ({ _window, req, res, address = {}, addressID, lookupActions, stack, props = {}, id, e, _, __ }) => {
        
        // no more addresses
        if (stack.addresses.length === 0) return endStack({ _window, stack })

        const global = _window ? _window.global : window.global
        
        if (addressID && !address.id) address = stack.addresses.find(address => address.id === addressID)
        if (!address.id || stack.terminated || address.hold || address.starter || address.end) return
    
        // params
        address.params = address.params || {}
    
        // modify underscores
        const my__ = _ !== undefined ? [_, ...(address.params.__ || __)] : (address.params.__ || __)
    
        // unblock stack
        if (stack.blocked && !address.blocked) stack.blocked = false
    
        // address
        const nextAddress = stack.addresses.find(nextAddress => nextAddress.id === address.nextAddressID) || {}
    
        if (address.blocked || address.status === "Start") {
    
            address.status = address.blocked ? "Block" : "End"
            address.end = true
            address.interpreting = false
            printAddress({ stack, address, nextAddress })
    
            // remove address
            const index = stack.addresses.findIndex(waitingAddress => waitingAddress.id === address.id)
            if (index !== -1) {
                stack.addresses[index] = null
                stack.addresses.splice(index, 1)
            }
    
            // pass underscores to waits
            if (address.hasWaits && nextAddress.params && !nextAddress.ended) {
                nextAddress.params.__ = my__
                nextAddress.params.id = address.params.id
            }
    
            // logger
            if (address.logger && address.logger.end) logger({ _window, data: { key: address.logger.key, end: true } })
    
        } else if (address.status === "Wait") {
    
            address.status = "Start"
            address.interpreting = true
            // nextAddress.interpreting = false
            printAddress({ stack, address, nextAddress })
    
            // actions executed
            address.action && stack.executedActions.push(address.action)
            address.prevInterpretingAddressID = stack.interpretingAddressID
            stack.interpretingAddressID = address.id
    
            // logger
            if (address.logger && address.logger.start) logger({ _window, data: { key: address.logger.key, start: true } })

            const params = { _window, lookupActions, stack, props, id, e, req, res, address, nextAddress, ...(address.params || {}), data: address.data, __: my__ }
    
            if (address.function) {
                /*const func = address.function || "toLine"
    
                if (func === "view") actions["view()"](params)
                else if (func === "html") actions["html()"](params)
                else if (func === "refresh") actions["refresh()"](params)
                else if (func === "createWebApp") actions["createWebApp()"](params)*/
                actions[`${address.function}()`] && actions[`${address.function}()`](params)

    
                address.interpreting = false
    
                return !address.asynchronous && actions["stackManager()"]({ _window, lookupActions, stack, props, address, id, e, req, res, __: my__ })
    
            } else if (address.type === "line" || address.type === "waits" || address.type === "action") {
                
                return toLine({ _window, address, stack, props: { isValue: false }, id, e, req, res, ...(address.params || {}), data: address.data, __: my__ })
            }
        }
    
        if (stack.terminated) return
    
        // asynchronous unholds nextAddresses
        if (address.nextAddressID && !address.nextStackID && nextAddress.interpreting === false) {
    
            const otherWaiting = stack.addresses.findIndex(waitingAddress => waitingAddress.nextAddressID === address.nextAddressID)
    
            if (otherWaiting === -1 || (otherWaiting > -1 && !stack.addresses.find(waitingAddress => waitingAddress.nextAddressID === address.nextAddressID && !address.blocked))) {
    
                nextAddress.hold = false
                return actions["stackManager()"]({ _window, lookupActions, stack, props, address: nextAddress, id, req, res, __, e })
            }
    
        } else if (nextAddress.interpreting) stack.interpretingAddressID = nextAddress.id
    
        // address is for another stack
        if (address.nextStackID && global.__stacks__[address.nextStackID] && global.__stacks__[address.nextStackID].addresses.find(({ id }) => address.nextStackID === id)) {
    
            actions["stackManager()"]({ _window, lookupActions, stack: global.__stacks__[address.nextStackID], props, address, id, e, req, res, __ })
        }
    
        actions["stackManager()"]({ _window, stack, props })

    }, "addresser()": ({ _window, addressID = generate(), index = 0, stack, unhold = false, hold = false, props = {}, args = [], req, res, e, type = "action", status = "Wait", file, data, waits, hasWaits, params, function: func, newLookupActions, nextAddressID, nextStack = {}, nextAddress = {}, blocked, blockable = true, dataInterpretAction, asynchronous = false, interpreting = false, renderer = false, action, __, id, object, lookupActions, logger, isAction, switchNextAddressIDWith }) => {
        
        const global = _window ? _window.global : window.global
        if (switchNextAddressIDWith) {

            nextAddressID = switchNextAddressIDWith.nextAddressID
            hasWaits = switchNextAddressIDWith.hasWaits
            switchNextAddressIDWith.nextAddressID = addressID
            switchNextAddressIDWith.hasWaits = false
            switchNextAddressIDWith.interpreting = false
        }

        // find nextAddress by nextAddressID
        if (nextAddressID && !nextAddress.id) nextAddress = stack.addresses.find(nextAddress => nextAddress.id === nextAddressID) || {}

        if (status === "Start") nextAddress.interpreting = false

        // waits
        waits = waits || args[2], params = params || args[1] || ""

        // address waits
        if (waits) toArray(waits).reverse().map(waits => {
            if (waits.slice(0, 2) === "@$" && waits.length == 7) waits = global.__refs__[waits].data
            nextAddress = actions["addresser()"]({ _window, stack, props, req, res, e, type: "waits", action: action + "::[...]", data: { string: waits }, nextAddress, blockable, __, id, object, lookupActions }).address
        })

        const address = { id: addressID, stackID: stack.id, props, viewID: id, type, data, status, hold, file, function: func, hasWaits: hasWaits !== undefined ? hasWaits : (toArray(waits).length > 0 ? true : false), nextStackID: nextStack.id, nextAddressID: nextAddress.id, blocked, blockable: nextAddress.starter ? false : blockable, index: stack.addresses.length, action, asynchronous, interpreting, renderer, logger, isAction, executionStartTime: (new Date()).getTime() }
        const stackLength = stack.addresses.length

        // Start => set interpretingAddressID
        if (address.status === "Start" && !asynchronous) {
            //var interpretingAddress = stack.addresses.find(add => add.id === stack.interpretingAddressID)
            //if (interpretingAddress) interpretingAddress.interpreting = false
            stack.interpretingAddressID = address.id
            //address.interpreting = true
        }

        // set nextAddressID
        if (stackLength > 0 && !nextAddress.id) {

            var nextAddressIndex = 0

            // nextAddress is interpreting or renderer
            while (nextAddressIndex < stackLength && !stack.addresses[nextAddressIndex].interpreting && !stack.addresses[nextAddressIndex].renderer) { nextAddressIndex += 1 }

            // there exist a head address
            if (nextAddressIndex < stackLength) {

                address.nextAddressID = stack.addresses[nextAddressIndex].id

                // get head address
                nextAddress = stack.addresses.find(nextAddress => nextAddress.id === address.nextAddressID)
            }
        }

        // set all head addresses asynchronous
        if ((asynchronous && (!unhold || !_window)) || hold) {

            var nextAddressID = !address.nextStackID && address.nextAddressID
            while (nextAddressID) {

                var holdnextAddress = stack.addresses.find(nextAddress => nextAddress.id === nextAddressID)
                if (holdnextAddress) {
                    holdnextAddress.hold = true
                    nextAddressID = !address.nextStackID && holdnextAddress.nextAddressID
                } else nextAddressID = false
            }
        }

        // data
        var { data, executionDuration, action: interpretAction } = toLine({ _window, lookupActions, stack, props: { isValue: true }, req, res, id, e, __, data: { string: params }, action: dataInterpretAction, object })
        address.paramsExecutionDuration = executionDuration

        // pass params
        address.params = { __, id, object, props, lookupActions: newLookupActions || lookupActions }

        // push to stack
        if (index) stack.addresses.splice(index, 0, address)
        else stack.addresses.unshift(address)

        // print
        // if (address.status !== "Wait") printAddress({ stack, address, nextAddress, newAddress: true })

        // actions executed
        address.action && address.status === "Start" && stack.executedActions.push(address.action)

        return { nextAddress, address, data, stack, props, action: interpretAction, __: [...toArray(data), ...__] }

    }, "createWebApp()": ({ _window, id, views, req, res, stack, props, __, lookupActions }) => {
        
        var views = _window ? _window.views : window.views
        var global = _window ? _window.global : window.global
        
        if (!views.document) {
            
            stack.renderer = true

            // log start document
            logger({ _window, data: { key: "document", start: true } })

            // address: document
            var address = actions["addresser()"]({ _window, id, type: "function", function: "createWebApp", stack, props, __, logger: { key: "document", end: true } }).address

            // get public views
            Object.entries(require("./publicViews.json")).map(([doc, data]) => { if (!global.__queries__["view.application"][doc]) global.__queries__["view.application"][doc] = data })

            // address toView document
            address = actions["addresser()"]({ _window, stack, props, status: "Start", type: "function", function: "view", nextAddress: address, lookupActions, __ }).address    
            
            return actions["view()"]({ _window, stack, props, address, req, res, lookupActions, __, data: { view: {view: "document"}, parent: views[id].__parent__ } })
        }

        return require("./document")({ _window, res, stack, props, address, __ })

    }, "line()": ({ _window, lookupActions, stack, props, address, id, e, data, req, res, __, object, action }) => {
        return toLine({ _window, lookupActions, address, stack, props, id, e, req, res, data, object, action, __ })
    }
}

const kernel = ({ _window, lookupActions, stack, props = {}, id, __, e, req, res, data: { data: _object, path, pathJoined, value, key }, object = [] }) => {

    var views = _window ? _window.views : window.views
    var global = _window ? _window.global : window.global
    var view = views[id] // || { id, __view__: true }

    var pathJoined = pathJoined || path.join("."), breakRequest = { break: false, index: -1 }

    // no path but there is value
    if (path.length === 0 && key && value !== undefined) return value

    var answer = path.reduce((o, k, i) => {

        // break
        if (breakRequest.break === true || breakRequest.index >= i) return o

        var lastIndex = path.length - 1

        if (k === undefined) return //console.log(view, id, path)

        k = k.toString()
        var k0 = k.split(":")[0]
        var args = k.split(":")
        var path1 = (path[i + 1] || "").toString()
        

        // get underscores
        var underScored = 0
        while (k0.charAt(0) === "_") {
            underScored += 1
            k0 = k0.slice(1)
            k = k.slice(1)
        }

        if (underScored && k0 && !k0.includes("()")) {
            while (underScored > 0) {
                k0 = "_" + k0
                k = "_" + k
                underScored -= 1
            }
        }

        // undefined
        if ((o === undefined || o === null/* || o === false*/) && k0 !== "push()" && k0 !== "replace()" && k0 !== "replaceItem()") return o

        // delete
        if (path1 === "del()" && k0 !== "data()" && k0 !== "form()") {

            breakRequest.index = i + 1
            if (k.slice(0, 2) === "@$" && k.length === 7) k = toValue({ req, res, _window, lookupActions, stack, props, object, id, e, __, data: k })

            if (Array.isArray(o)) {
                if (!isNumber(k)) {
                    if (o[0] && o[0][k]) {
                        delete o[0][k]
                        return o
                    } else return o
                }
                o.splice(k, 1)
            } else delete o[k]

            return o

        }

        else if (path1.split(":")[0] === "then()") {
            breakRequest.break = true
            return then({ _window, req, res, global, views, view, o, stack, props, pathJoined, lookupActions, id, e, __, args, k0, underScored, object, i, lastIndex, value, key, string: path1.split(":")[1], breakRequest, _object, answer })
        }

        // underscore
        else if (underScored && !k0) { // _

            if (o.__view__) {

                if (value !== undefined && key && i === lastIndex) answer = o.__[underScored - 1] = value
                else answer = o.__[underScored - 1]

            } else {

                var underscores = ""
                while (underScored > 0) {
                    underscores += "_"
                    underScored -= 1
                }

                if (value !== undefined && key && i === lastIndex) answer = o[underscores] = value
                else answer = o[underscores]
            }

        }

        // @coded
        else if (k.slice(0, 2) === "@$" && k.length === 7) { // k not k0

            var data
            if (k0.slice(0, 2) === "@$" && global.__refs__[k0].type === "text") data = global.__refs__[k0].data
            else data = toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, data: global.__refs__[k0].data, __ })

            if (typeof data !== "object") {

                if (Array.isArray(o) && isNumber(data) && data < 0) { // negative index

                    var item = o[o.length + data]

                    if (i === lastIndex && key && value !== undefined) {
                        o.splice(o.length + data, 1, value)
                        answer = value
                    } else answer = item

                } else if (i === lastIndex && key && value !== undefined) answer = o[data] = value
                else if (i !== lastIndex && key && value !== undefined && o[data] === undefined) {

                    if (isNumber(toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, data: path1, __, e }))) answer = o[data] = []
                    else answer = o[data] = {}
                }
                else answer = o[data]
                //console.log(decode({_window, string: pathJoined}), clone(answer), data);
            } else answer = data
        }

        // OOP
        else if (actions[k0]) return actions[k0]({ _window, req, res, global, views, view, o, stack, props, pathJoined, lookupActions, id, e, __, args, k, underScored, object, i, lastIndex, value, key, path, breakRequest, _object, answer })

        // js method()
        else if (k0.slice(-2) === "()" && typeof o[k0.slice(0, -2)] === "function") {

            var data = []
            args.slice(1).map(arg => {
                data.push(toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: arg || "" }))
            })

            answer = o[k0.slice(0, -2)](...data)
        }

        // action()
        else if (k0.slice(-2) === "()") answer = toAction({ _window, lookupActions, stack, props, id, req, res, __, e, data: { action: k }, object: [o, ...toArray(object)] })

        // endoced params
        else if (k.includes(":@$")) {

            breakRequest.break = true

            // decode
            if (k0.slice(0, 2) === "@$" && k0.length == 7) k0 = global.__refs__["@$" + k0.slice(-5)].data

            if (events.includes(k0)) {

                if (!o.__view__) return

                var data = global.__refs__["@$" + args[1].slice(-5)].data

                return views[id].__controls__.push({ event: decode({_window, string: k0 + "?" + data}), id, __, lookupActions, eventID: o.id })
            }

            o[k0] = o[k0] || {}

            if (args[1]) answer = toParam({ req, res, _window, lookupActions, stack, props, id, e, object: [o[k0], ...object], data: args[1], __ })
            else return
        }

        // lastindex
        else if ((key && value !== undefined || props.hasValue) && i === lastIndex) {

            if (Array.isArray(o)) {
                if (!isNumber(k)) {
                    if (o.length === 0) o.push({})
                    o = o[0]
                }
            }
            answer = o[k] = value
        }

        // assign {} of []
        else if (key && o[k] === undefined && i !== lastIndex) {

            if (path1 && (isNumber(path1) || path1.slice(0, 3) === "():" || path1.includes("find()") || path1.includes("filter()") || path1.includes("push()"))) answer = o[k] = []
            else {

                if (Array.isArray(o)) {
                    if (isNaN(k)) {
                        if (o.length === 0) o.push({})
                        o = o[0]
                    }
                }
                answer = o[k] = {}
            }
        }

        else answer = o[k]

        return answer

    }, _object)

    return answer
}

const toValue = ({ _window, lookupActions = [], stack = { addresses: [], returns: [] }, props = { isValue: true }, address, data: value, key, __, id, e, req, res, object = [] }) => {

    var views = _window ? _window.views : window.views
    var global = _window ? _window.global : window.global

    if (!value) return value

    // coded
    if (value.slice(0, 2) === "@$" && value.length === 7 && global.__refs__[value].type === "text") return global.__refs__[value].data
    if (value.slice(0, 2) === "@$" && value.length === 7) value = global.__refs__[value].data

    // [[value]]
    if (value.slice(0, 2) === "@$" && value.length === 7) {
        value = toValue({ req, res, _window, id, stack, props: { isValue: true }, lookupActions, __, e, data: value, key, object })
        if (typeof value !== "string") return value
        value = actions["encode()"]({ _window, id, stack, string: actions["encode()"]({ _window, id, stack, string: value, start: "'" }) })
    }

    // value?condition?value
    if (value.split("?").length > 1) return toLine({ _window, lookupActions, stack, props, id, e, data: { string: value }, req, res, __, object, action: "toValue" }).data

    // value is a param it has key=value
    if (isParam({ _window, string: value })) return toParam({ req, res, _window, id, lookupActions, address, stack, props, e, data: value, __, object: props.isValue ? [{}, ...object] : object })

    // no value
    if (value === "()") return views[id]
    else if (value === undefined) return generate()
    else if (value === "undefined") return undefined
    else if (value === "false") return false
    else if (value === "true") return true
    else if (value === "device()") return global.manifest.device.device
    else if (value === "desktop()") return global.manifest.device.device.type === "desktop"
    else if (value === "tablet()") return global.manifest.device.device.type === "tablet"
    else if (value === "mobile()") return global.manifest.device.device.type === "smartphone"
    else if (value === "tv()") return global.manifest.device.device.type === "tv"
    else if (value === "clicked()") return global.__clicked__
    else if (value === "focused()") return global.__focused__
    else if (value === "today()") return new Date()
    else if (value === "null") return null
    else if (value.charAt(0) === "_" && !value.split("_").find(i => i !== "_" && i !== "")) return __[value.split("_").length - 2]
    else if (value.charAt(0) === "." && !value.split(".").find(i => i !== "." && i !== "")) return object[value.split(".").length - 2]
    else if (value === "[]") return ({})
    else if (value === ":[]") return ([{}])
    else if (value === " ") return value
    else if (value === ":") return ([])

    // loader
    if (value === "loader.show" || value === "loader.hide") return loader({ _window, show: value === "loader.show" })

    if (value.includes("||")) { // or
        var answer
        value.split("||").map(value => {
            if (!answer) answer = toValue({ _window, lookupActions, stack, props: { isValue: true }, data: value, __, id, e, req, res, object })
        })
        return answer
    }

    // calculations
    if (global.__calcTests__[value] !== false) {

        if (value.includes("+")) { // addition

            // increment
            if (value.slice(-2) === "++") {

                value = value.slice(0, -2)
                value = `${value}=${value}+1`
                toParam({ req, res, _window, lookupActions, id, e, data: value, __, object, props })
                return (toValue({ _window, lookupActions, stack, props, data: value, __, id, e, req, res, object }) - 1)

            } else {

                var values = [], allAreNumbers = false, allAreArrays = false, allAreObjects = false

                var val0 = values[0] = toValue({ _window, lookupActions, stack, props: { isValue: true }, object, data: value.split("+")[0], __, id, e, req, res })

                if (isNumber(val0) || typeof val0 === "number") allAreNumbers = true
                else if (Array.isArray(val0)) allAreArrays = true
                else if (typeof val0 === "object") allAreObjects = true

                value.split("+").slice(1).map(value => {

                    var val0 = toValue({ _window, lookupActions, stack, props: { isValue: true }, object, data: value, __, id, e, req, res })

                    if (allAreNumbers) {

                        allAreArrays = false
                        allAreObjects = false
                        if (isNumber(value) || (executable({ _window, string: value }) && typeof val0 === "number")) allAreNumbers = true
                        else allAreNumbers = false

                    } else if (allAreObjects) {

                        allAreNumbers = false
                        allAreArrays = false
                        if (typeof val0 !== "object") allAreObjects = false
                    }

                    values.push(val0)
                })

                if (allAreArrays) {

                    var array = [...values[0]]
                    values.slice(1).map(val => {
                        // push map, string, num... but flat array
                        if (!Array.isArray(val)) array.push(val)
                        else array.push(...val)
                    })
                    return array

                } else if (allAreNumbers) {

                    var value = 0
                    values.map(val => value += (parseFloat(val) || 0))
                    return value

                } else if (allAreObjects) {

                    var object0 = {}
                    values.map(obj => object0 = { ...object0, ...obj })
                    return object0

                } else {

                    var value = ""
                    values.map(val => value += val + "")
                    return value
                }
            }
        }

        if (value.includes("-")) { // subtraction

            var _value = calcSubs({ _window, lookupActions, stack, props, value, __, id, e, req, res, object })
            if (_value !== value) return _value
        }

        if (value.includes("*") && value.split("*")[1] !== "") { // multiplication

            var values = value.split("*").map(value => toValue({ _window, lookupActions, stack, props: { isValue: true }, data: value, __, id, e, req, res, object }))
            var newVal = values[0]
            values.slice(1).map(val => {
                if (!isNaN(newVal) && !isNaN(val)) newVal *= val
                else if (isNaN(newVal) && !isNaN(val)) {
                    while (val > 1) {
                        newVal += newVal
                        val -= 1
                    }
                } else if (!isNaN(newVal) && isNaN(val)) {
                    var index = newVal
                    newVal = val
                    while (index > 1) {
                        newVal += newVal
                        index -= 1
                    }
                }
            })
            return value = newVal
        }

        if (value.includes("/") && value.split("/")[1] !== "") { // division

            var _value = calcDivision({ _window, lookupActions, stack, props, value, __, id, e, req, res, object })
            if (_value !== value && _value !== undefined) return _value
        }

        if (value.includes("%") && value.split("%")[1] !== "") { // modulo

            var _value = calcModulo({ _window, lookupActions, stack, props, value, __, id, e, req, res, object })
            if (_value !== value && _value !== undefined) return _value
        }
    }

    // list => check calculations then list
    if (value.charAt(0) === ":") return value.split(":").slice(1).map(item => toValue({ req, res, _window, id, stack, props: { isValue: true }, lookupActions, __, e, data: item, key, object })) // :item1:item2

    var path = typeof value === "string" ? value.split(".") : []

    // number
    if (isNumber(value)) value = parseFloat(value)
    else if (path.length > 1 || path.find(path => executableRegex.test(path)) || !props.isValue || props.isKey) value = reducer({ _window, lookupActions, stack, props, id, data: { path, value, keyName: key }, object, __, e, req, res })

    return value
}

const toParam = ({ _window, lookupActions, stack = { addresses: [], returns: [] }, props = {}, address, data: string, e, id, req, res, object = [], __ }) => {

    let views = _window ? _window.views : window.views
    let global = _window ? _window.global : window.global
    let view = views[id] || { id, __view__: true, __fake__: true }

    // returned
    if ((stack.returns && stack.returns[0] || {}).returned || stack.terminated || stack.broke || stack.blocked) return

    if (typeof string !== "string" || !string) return string || {}

    // decode
    if (string.slice(0, 2) === "@$" && string.length == 7 && global.__refs__[string].type === "text") return global.__refs__[string].data
    if (string.slice(0, 2) === "@$" && string.length == 7) string = global.__refs__[string].data

    // [[params]]
    if (string.slice(0, 2) === "@$" && string.length === 7) {
        string = toValue({ req, res, _window, id, stack, props: { isValue: true }, lookupActions, __, e, data: string, object })
        
        if (typeof string !== "string") return string

        string = actions["encode()"]({ _window, id, stack, string: actions["encode()"]({ _window, id, stack, string, start: "'" }) })
        return toParam({ req, res, _window, lookupActions, stack, props, id, e, object, data: string, __ })
    }

    // check event else interpret
    if (string.split("?").length > 1) {

        // check if event
        if (isEvent({ _window, string })) return toEvent({ _window, string, id, __, lookupActions, stack, props })

        // line interpreter
        return toLine({ _window, lookupActions, stack, props: { isValue: false, ...props }, id, e, data: { string }, req, res, __, object, action: "toParam" }).data
    }

    // conditions
    if (props.isCondition || isCondition({ _window, string })) return toApproval({ id, lookupActions, stack, props, e, data: string, req, res, _window, __, object })

    // init
    if (object.length === 0) object.push({})
    let params = object[0]

    props.isValue = false

    let strings = string.split(";")

    for (let j = 0; j < strings.length; j++) {

        let param = strings[j]
        if (!param || param.charAt(0) === "#") continue

        // set interpreting
        if (address && address.id) stack.interpretingAddressID = address.id

        // case id was changed during rendering
        id = view.id

        // returned || comment
        if ((stack.returns && stack.returns[0] || {}).returned || stack.terminated || stack.broke || stack.blocked) return

        let key = undefined, value = undefined

        // =
        if (param.includes("=")) {

            key = param.split("=")[0]
            value = param.substring(key.length + 1)

        } else key = param

        // key = key1 = ... = value
        if (value && value.includes("=")) {

            value = param.split("=").at(-1)
            param = param.slice(0, value.length * (-1) - 1)

            let newParam = key + "=" + value
            param.split("=").slice(1).map(key => { newParam += ";" + key + "=" + value })
            params = { ...params, ...toParam({ _window, lookupActions, stack, props, data: param, e, id, req, res, object, __ }) }
            continue
        }

        // increment
        if (key && value === undefined && key.slice(-2) === "++") {
            key = key.slice(0, -2)
            value = parseFloat(toValue({ _window, lookupActions, stack, props: { isValue: true }, req, res, id, e, data: key, __, object }) || 0) + 1
        }

        // decrement
        else if (key && value === undefined && key.slice(-2) === "--") {
            key = key.slice(0, -2)
            value = parseFloat(toValue({ _window, lookupActions, stack, props: { isValue: true }, req, res, id, e, data: key, __, object }) || 0) - 1
        }

        // ||=
        else if (key && value && key.slice(-2) === "||") {
            key = key.slice(0, -2)
            value = `${key}||${value}`
        }

        // +=
        else if (key && value && key.slice(-1) === "+") {

            key = key.slice(0, -1)
            var myVal = (key.split(".")[0].slice(0, 2) === "()" || key.split(".")[0].slice(-3) === ":()" || key.includes("_") || key.split(".")[0] === "") ? key : (`().` + key)
            var data = `[${myVal}||[if():[type():[${value}]=number]:0.elif():[type():[${value}]=map]:[].elif():[type():[${value}]=list]:[:]:'']]`
            data = actions["encode()"]({ _window, id, stack, string: actions["encode()"]({ _window, id, stack, string: data, start: "'" }) })
            value = `${data}+${value}`
        }

        // -=
        else if (key && value && key.slice(-1) === "-") {

            key = key.slice(0, -1)
            var myVal = (key.split(".")[0].slice(0, 2) === "()" || key.split(".")[0].slice(-3) === ":()" || key.includes("_") || key.split(".")[0] === "") ? key : (`().` + key)
            var data = actions["encode()"]({ _window, id, stack, string: `[${myVal}||0]` })
            var data1 = actions["encode()"]({ _window, id, stack, string: `[${value}||0]` })
            value = `${data}-${data1}`
        }

        // *=
        else if (key && value && key.slice(-1) === "*") {

            key = key.slice(0, -1)
            var myVal = (key.split(".")[0].slice(0, 2) === "()" || key.split(".")[0].slice(-3) === ":()" || key.includes("_") || key.split(".")[0] === "") ? key : (`().` + key)
            var data = actions["encode()"]({ _window, id, stack, string: `[${myVal}||0]` })
            value = `${data}*${value}`
        }

        // !key
        if (param.slice(0, 1) === "!" && value === undefined) {
            value = false
            key = key.slice(1)
        }

        let path = typeof key === "string" ? key.split(".") : [], path0 = path[0].split(":")[0], hasValue, keyValue

        // interpret value
        if (typeof value === "string") {

            keyValue = toValue({ _window, lookupActions, stack, props: { /*...props, hasValue: false, */isValue: true }, req, res, id, e, data: value, __, object, key, param })
            if (keyValue === "__promise__") continue
            if (keyValue && typeof keyValue === "string") keyValue = replaceNbsps(keyValue)
            hasValue = true
            
        } else if (keyValue === undefined && value === undefined) keyValue = generate()
        else keyValue = value

        // :@1asd1
        if (!path0 && path[0]) continue
        
        // reduce
        var data = reducer({ _window, lookupActions, stack, props: {isParam:true, isValue:false, hasValue}, id, data: { path, value: keyValue, key, strings, index: j }, object, e, req, res, __, action: "toParam" })
        if (data === "__promise__") return params

        // path & data & doc
        if ((object[0] || {}).__view__ && !view.__fake__/* && data !== "__promise__"*/) mountData({ _window, view, views, global, key, id, stack, lookupActions, object, params, __, e, req, res })
    }

    return params
}

const reducer = ({ _window, lookupActions = [], stack = { addresses: [], returns: [] }, props = {}, id, data: { path, value, key, keyName, strings = [], index }, object = [], __, e, req, res, action }) => {

    if ((stack.returns && stack.returns[0] || {}).returned || stack.terminated || stack.blocked || stack.broke) return

    var views = _window ? _window.views : window.views
    var global = _window ? _window.global : window.global
    var view = views[id] || { id, __view__: true }

    // path is a string
    if (typeof path === "string") path = path.split(".")
    // path is a number
    if (typeof path === "number") path = [path]

    var pathJoined = path.join(".")

    // init
    var path0 = path[0] ? path[0].toString().split(":")[0] : "", args
    if (path[0] !== undefined) args = path[0].toString().split(":")
        
    // toParam
    if (isParam({ _window, string: pathJoined })) return toParam({ req, res, _window, lookupActions, stack, props, id, e, data: pathJoined, __, object })
        
    // toValue
    if (isCalc({ _window, string: pathJoined }) && !key) return toValue({ _window, lookupActions, stack, props, data: pathJoined, __, id, e, req, res, object })

    // [actions?conditions?elseActions]():[path;view]:[waits]
    else if (path0.length === 9 && path0.slice(-2) === "()" && path0.slice(0, 2) === "@$") {

        var myLookupActions = lookupActions, myID, my__ = __, myObject = object
        var { address, data } = actions["addresser()"]({ _window, stack, props, args, waits: args.slice(2), id, type: "action", action: "[...]()", data: { string: global.__refs__[path0.slice(0, -2)].data, dblExecute: true }, __, lookupActions, object })

        // doc, view, path, collection, db
        if (typeof data === "object" && data.__view__) {

            myID = data.id
            my__ = [...data.__, ...my__]
            myObject = [data, ...myObject]
            myLookupActions = [data.__lookupActions__.slice(0, -1), ...myLookupActions]

        } else if (typeof data === "object") {

            if ("condition" in data) {
                address.params.props.isCondition = data.condition
                if (address.hasWaits) stack.addresses.find(({ id }) => id === address.nextAddressID).params.isCondition = data.condition
            }

            if (data.view) {

                myID = data.view.id
                myObject = [data.view, ...myObject]
                my__ = [...data.view.__, ...my__]
                myLookupActions = [...data.view.__lookupActions__.slice(0, -1), ...myLookupActions]
            }

            if ("data" in data) {
                my__ = [data.data, ...my__]
            }

            if (data.doc || data.path || data.collection || data.db) {

                if (typeof data.path === "string") data.path = data.path.split(".")
                myLookupActions = [{ doc: data.doc || myLookupActions[0].doc, path: data.path, collection: data.collection || myLookupActions[0].collection, db: data.db }, ...myLookupActions]
            }

        } else if (typeof data === "string") myLookupActions = [{ doc: data, collection: "view" }, ...myLookupActions]

        address.params = { ...address.params, id: myID || id, lookupActions: myLookupActions, __: my__, object: myObject }

        //console.log("before", decode({ _window, string: path0.slice(0, -2)}), clone(object));
        props.hasValue = false
        var data = actions["stackManager()"]({ _window, lookupActions: myLookupActions, stack, props, object: myObject, address, id: myID || id, e, req, res, __: my__ }).data
        if (path[1]) return kernel({ _window, lookupActions, stack, props, id, __, e, req, res, object, data: { data, path: path.slice(1), value, key, pathJoined } })
        else return data
    }

    // key=@collection.doc
    else if (pathJoined.charAt(0) === "@" && pathJoined.charAt(1) !== "$") {

        pathJoined = pathJoined.slice(1)
        var path = pathJoined.split(":")[1]
        if (path) path = path.split(".")
        else path = []

        // @collection.doc
        if (pathJoined.length === 7 && pathJoined.slice(0, 2) === "@$") pathJoined = toValue({ _window, lookupActions, stack, props: { isValue: true }, data: pathJoined, __, id, req, res, object })

        var doc = toValue({ _window, lookupActions, stack, props: { isValue: true }, data: pathJoined.split(".").slice(-1)[0], __, id, req, res, object })
        var collection = pathJoined.split(".").slice(0, -1).join(".")

        // @. || @.collection
        if (pathJoined.charAt(0) === ".") collection = (view.__viewCollection__ || view.__prevViewCollection__) + collection
        else if (!collection) collection = view.__viewCollection__ || view.__prevViewCollection__

        if (pathJoined === ".") {
            lookupActions = view.__lookupActions__
            return clone(global.__queries__[view.__lookupActions__[0].collection][view.__lookupActions__[0].doc])
        }

        if (doc && collection) {

            if (!keyName) {

                lookupActions = [{ doc, collection, path }, ...lookupActions]
            }

            if (keyName && (!global.__queries__[collection] || !(doc in global.__queries__[collection]))) {

                var mydata = { data: { collection, doc }, searchDoc: true }
                var waits = keyName ? [`${keyName}=__queries__:().'${collection}'.'${doc}'.reduce():[path=:${path.join(":")}];${strings.slice(index+1).join(";")}`] : []
                searchDoc({ _window, lookupActions, stack, id, __, e, req, res, data: mydata, object, waits })
            
            } else if (!keyName) {
                
                toParam({ req, res, _window, lookupActions, stack, props, id, e, data: strings.slice(index+1).join(";"), __, object })

            } else if (keyName && global.__queries__[collection]) return clone(path.reduce((o, k) => o[k], global.__queries__[collection][doc]))
        }

        return "__promise__"
    }

    // if()
    else if (path0 === "if()") {

        var data
        var approved = toApproval({ _window, lookupActions, stack, props: { isValue: true }, e, data: args[1], id, __, req, res, object })

        if (!approved) {

            if (args[3]) {

                if (props.isCondition) return toApproval({ _window, lookupActions, stack, props, e, data: args[3], id, __, req, res, object })
                else return toValue({ req, res, _window, lookupActions, stack, props, id, data: args[3], __, e, object })

            } else if (path[1] && path[1].includes("elif()")) {

                path.shift()
                path[0] = path[0].slice(2)
                return reducer({ _window, lookupActions, stack, props, id, data: { path, value, key }, object, __, e, req, res })

            } else return data

        } else {

            //if (props.isCondition) return toApproval({ _window, lookupActions, stack, props, e, data: args[2], id, __, req, res, object })
            if (path[1]) data = toValue({ req, res, _window, lookupActions, stack, props, id, data: args[2], __, e, object })
            else return toValue({ req, res, _window, lookupActions, stack, props, id, data: args[2], __, e, object })

            path.shift()

            // remove elses and elifs
            while (path[0] && path[0].includes("elif()")) { path.shift() }

            // empty path
            if (!path[0]) return data
        }

        return kernel({ _window, lookupActions, stack, props, id, __, e, req, res, object, data: { data, path, value, key, pathJoined } })
    }

    // while()
    /*else if (path0 === "while()") {

        while (toApproval({ _window, lookupActions, stack, props, e, data: args[1], id, __, req, res, object })) {
            toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, id, data: args[2], __, e, object })
        }
        // path = path.slice(1)
        return global.return = false
    }*/

    // global:()
    else if (path0 && args[1] === "()" && !args[2]) {

        var globalVariable = toValue({ req, res, _window, id, e, data: args[0], __, stack, props: { isValue: true }, lookupActions, object })
        if (path.length === 1 && key && globalVariable) return global[globalVariable] = value

        path.splice(0, 1, globalVariable)
        return kernel({ _window, lookupActions, stack, props, id, __, e, req, res, object, data: { data: global, path, value, key, pathJoined } })
    }

    // view => ():id
    else if (path0 === "()" && args[1]) {

        // id
        var customID = toValue({ req, res, _window, lookupActions, stack, id, e, data: args[1], __, object, props: { isValue: true } })
        path.shift()
        return kernel({ _window, lookupActions, stack, props, id, __, e, req, res, object, data: { data: views[customID || args[1] || id], path, value, key, pathJoined } })
    }

    // .value
    else if (path[0] === "" && path.length > 1) {

        if (!isNumber(path[1].charAt(0))) {

            var index = 0
            while (pathJoined.charAt(index) === ".") { index++ }
            path = path.slice(index)
            var t = kernel({ _window, lookupActions, stack, props, id, __, e, req, res, object, data: { data: object[index - 1], path, value, key, pathJoined } })
            //console.log(decode({_window, string: pathJoined}), clone(object), t);
            return t
        } else return pathJoined
    }

    // @$coded
    else if (path0.slice(0, 2) === "@$" && path[0].length === 7) {

        var data

        // text
        if (global.__refs__[path[0]].type === "text" && key && value !== undefined) {
            kernel({ _window, lookupActions, stack, props, id, __, e, req, res, object, data: { data: object[0], path, value, key, pathJoined } })
            return object[0]
        }
        // text
        if (global.__refs__[path[0]].type === "text") return global.__refs__[path[0]].data
        
        // data
        else data = toLine({ _window, req, res, lookupActions, stack, props: {isParam: path[1] ? false : props.isParam}, object, id, data: { string: path[0] }, __, e }).data

        if (path[1] === "flat()") {

            if (Array.isArray(data)) {

                data = [...data]
                data.flat()

            } else if (typeof object[0] === "object") override(object[0], data)

            return object[0]

        } else {

            if (path[1]) {

                path.splice(0, 1)
                return kernel({ _window, lookupActions, stack, props, id, __, e, req, res, object, data: { data, path, value, key, pathJoined } })

            } else if (key && (typeof data === "string" || typeof data === "number")) {

                if (value !== undefined) object[0][data] = value
                return object[0][data]

            } else if (key && typeof data === "object") {
                
                override(object[0], data)
            } 
            
            return data
        }
    }

    // action()
    else if (path0.slice(-2) === "()") {

        var action = toAction({ _window, lookupActions, stack, props, id, req, res, __, e, data: { action: path[0] }, object })
        if (action !== "__continue__") return kernel({ _window, lookupActions, stack, props, id, __, e, req, res, object, data: { data: action, path: path.slice(1), value, key, pathJoined } })
    }

    if (path0 === "class()") {
        return kernel({ _window, lookupActions, stack, props, id, __, e, req, res, object, data: { data: views.document, path, value, key, pathJoined } })
    }

    // assign reserved vars
    var mainVars = {
        "()": view,
        "global()": _window ? _window.global : window.global,
        "e()": e,
        "con()": console,
        "str()": String,
        "obj()": Object,
        "arr()": Array,
        "win()": _window || window,
        "his()": _window ? {} : history,
        "nav()": _window ? {} : navigator,
        "nav()": _window ? {} : navigator,
        "req()": req,
        "res()": res,
        "math()": Math
    }

    // assign
    var underScored = path0 && path0.charAt(0) === "_" && !path0.split("_").find(i => i !== "_" && i !== "")

    // main var (win(), e()...) or underscore
    if ((path0 in mainVars) || underScored) {

        var data
        if (path0 in mainVars) data = mainVars[path0]
        else data = __[path0.split("_").length - 2]
        
        path.shift()
        return kernel({ _window, lookupActions, stack, props, id, __, e, req, res, object, data: { data, path, value, key, pathJoined } })
    }
    
    // lookup object
    if (props.isValue || path.length > 1 || executableRegex.test(pathJoined) && object.length > 0) {

        var index = 0, answer

        while (object[index] !== undefined && answer === undefined) {
            
            answer = kernel({ _window, lookupActions, stack, props, id, __, e, req, res, object, data: { data: object[index], path, value, key, pathJoined } })
            index++
        }
        /*if (answer === undefined && path0.slice(-2) === "()" && eval("typeof " + path0.slice(0, -2)) === "function") return then({ _window, req, res, stack, props, lookupActions, id, e, __, object, path })
        else */
        if (answer === undefined && !props.isCondition && props.isValue && !executableRegex.test(pathJoined)) answer = pathJoined

    } else answer = kernel({ _window, lookupActions, stack, props, id, __, e, req, res, object, data: { data: object[0], path, value, key, pathJoined } })

    return answer
}

const toApproval = ({ _window, lookupActions, stack, props, e, data: string, id, __, req, res, object = [] }) => {

    // no string but object exists
    if (!string)
        if (object[0]) return true
        else if (object[0] !== undefined) return false

    // no string
    if (!string || typeof string !== "string") return true

    let views = _window ? _window.views : window.views
    let global = _window ? _window.global : window.global
    let view = views[id], approval = true

    if ((stack.returns && stack.returns[0] || {}).returned) return

    // coded
    if (string.slice(0, 2) === "@$" && string.length == 7) string = global.__refs__[string].data

    // ==
    string = string.replaceAll("==", "=")

    string.split(";").map(condition => {

        let key, value, conditions, equalOp, greaterOp, lessOp, notEqual
        
        // no condition
        if (condition === "") return true
        if (!approval) return false

        if (condition.charAt(0) === "#") return

        // or
        if (condition.includes("||")) {

            conditions = condition.split("||"), i = 0
            key = conditions[0].split("=")[0]
            if (key.at(-1) === "!") key = key.slice(0, -1)
            approval = false

            while (!approval && conditions[i] !== undefined) {

                if (conditions[i].charAt(0) === "=" || conditions[i].slice(0, 2) === "!=") conditions[i] = key + conditions[i]
                approval = toValue({ _window, lookupActions, stack, props: { isCondition: true }, e, data: conditions[i], id, __, req, res, object })
                i += 1
            }

            return approval
        }

        condition = condition.split("=")
        equalOp = condition.length > 1
        greaterOp = condition[0].split(">")[1] !== undefined
        if (greaterOp) {
            condition[1] = condition[1] || condition[0].split(">")[1]
            condition[0] = condition[0].split(">")[0]
        }
        lessOp = condition[0].split("<")[1] !== undefined
        if (lessOp) {
            condition[1] = condition[1] || condition[0].split("<")[1]
            condition[0] = condition[0].split("<")[0]
        }

        key = condition[0] || ""
        value = condition[1]

        // get value
        if (value) value = toValue({ _window, lookupActions, stack, props: { isCondition: true, isValue: true }, id, data: value, e, __, req, res, object })

        // encoded
        if (key.slice(0, 2) === "@$" && key.length == 7 && global.__refs__[key].type === "text") {
            if (value === undefined) return approval = global.__refs__[key].data ? true : false
            else return approval = global.__refs__[key].data === value
        }

        // operator has !
        if (key.at(0) === "!" || key.at(-1) === "!") {

            if (key.at(-1) === "!") {

                if (condition[1]) {
                    notEqual = true
                    key = key.split("!")[0]
                }

            } else {

                key = key.slice(1)
                notEqual = true
                if (key.slice(0, 2) === "@$" && key.length === 7) {
                    key = toApproval({ _window, lookupActions, stack, props, e, data: key, id, __, req, res, object })
                }
            }
        }

        // get key
        if (typeof key === "string") {

            key = toValue({ _window, lookupActions, stack, props: { isCondition: true, isValue: true, isKey: true }, id, data: key, e, __, req, res, object })
        }

        // evaluate
        if (!equalOp && !greaterOp && !lessOp) approval = notEqual ? !key : key
        else {

            if (equalOp) approval = notEqual ? !isEqual(key, value) : isEqual(key, value)
            if (greaterOp && (equalOp ? !approval : true)) approval = notEqual ? !(parseFloat(key) > parseFloat(value)) : (parseFloat(key) > parseFloat(value))
            if (lessOp && (equalOp ? !approval : true)) approval = notEqual ? !(parseFloat(key) < parseFloat(value)) : (parseFloat(key) < parseFloat(value))
        }
    })
    return approval
}

const toAction = ({ _window, id, req, res, __, e, data: { action }, object = [], lookupActions = [], stack, props = {} }) => {

    var views = _window ? _window.views : window.views

    if (!views[id]) return "__continue__"

    var action0 = action.split(":")[0]

    var { newLookupActions, checkInViewsInDatastore, serverAction, actionFound } = isAction({ _window, lookupActions, stack, props, address, id, __, e, req, res, action, name: action0.slice(0, -2), object })
    
    // lookup in server views for action
    if (checkInViewsInDatastore) return true
    
    // action not found
    if (actionFound === undefined) return "__continue__"
        
    var { address, data } = actions["addresser()"]({ _window, req, res, stack, props, args: action.split(":"), waits: action.split(":").slice(2), newLookupActions, asynchronous: serverAction, e, id, data: { string: serverAction ? "" : actionFound }, action: action0, isAction: true, __, id, object, lookupActions })

    // server action
    if (serverAction) {

        address.status = "Start"
        return server({ _window, req, res, id, e, data: { lookupActions: newLookupActions, server: "action", action: action0, data }, __, stack, props, lookupActions, address })
    }

    var answer = actions["stackManager()"]({ _window, lookupActions, stack, props, address, id, e, req, res, __, _: data }).data
    
    if (answer === "__continue__") return
    else return answer
}

const toLine = ({ _window, lookupActions, stack, props = {}, address = {}, id, e, data: { string, dblExecute, index: i = 0, splitter = "?" }, req, res, __, object = [], action, startTime = (new Date()).getTime(), success = true, message = "", conditionsNotApplied = false }) => {

    var global = _window ? _window.global : window.global
    var view = _window ? _window.views[id] : window.views[id]

    // missing stack or __
    if (!stack) stack = { addresses: [], returns: [] }
    if (!__) __ = view.__

    var data, returnForWaitActionExists = false

    // splitter is for ? or :
    // i is for using name?params?conditions?elseparams

    const terminator = ({ data, order }) => {

        if (stack.terminated || !address.id) return data

        address.interpreting = false

        // execute waits
        actions["stackManager()"]({ _window, lookupActions, stack, props, address, id, e, req, res, __, _: returnForWaitActionExists ? data.data : undefined })

        return data
    }

    // action is a variable
    if (typeof string !== "string") return terminator({ data: {success:true, data:string} })

    if (stack.terminated || stack.broke || stack.blocked) return terminator({ data: { success: false, message: `Action terminated!`, executionDuration: 0 }, order: 0 })
    if (!string) return terminator({ data: { success: true, message: `No action to execute!`, executionDuration: 0 }, order: 1 })

    // encode
    string = actions["encode()"]({ _window, id, stack, string: actions["encode()"]({ _window, id, stack, string, start: "'" }) })

    // decode
    if (string.slice(0, 2) === "@$" && string.length === 7) {

        // data is text
        if (global.__refs__[string].type === "text")
            return terminator({ data: { data: global.__refs__[string].data, success: true, message: `No action to execute!`, executionDuration: 0 }, order: 2 })

        string = global.__refs__[string].data
        // [[string]]
        if (string.slice(0, 2) === "@$" && string.length === 7) {
            string = toValue({ req, res, _window, id, stack, props: { isValue: true }, lookupActions, __, e, data: string, object })
            if (typeof string !== "string") return terminator({ data: { data: string } })
            else return terminator({ data: toLine({ _window, lookupActions, stack, props, id, e, data: { string }, req, res, __, object }) })
        }
    }

    // check if event
    if (string.split("?").length > 1 && isEvent({ _window, string })) {

        toEvent({ _window, string, id, __, lookupActions, stack, props })
        return terminator({ data: { success: true, message: `Event`, executionDuration: 0 } })
    }

    // subparams
    if (i === 1) {

        // list
        var substring = string.split(splitter)[0]
        if (!substring) return terminator({ data: { success: false, message: `Missing name!`, executionDuration: 0 }, order: 3 })

        // decode
        if (substring.slice(0, 2) === "@$" && substring.length === 7) substring = global.__refs__[substring].data

        // name has subparams => interpret
        if (substring.includes("?")) {

            var data = toLine({ lookupActions, stack, props, id, e, data: { string: substring, i: 1 }, req, res, __, object })
            if (data.conditionsNotApplied) return terminator({ data, order: 4 })
        }
    }

    var stringList = string.split(splitter), elseIfList = string.split("??")

    if (splitter === "?" && elseIfList[1]) {

        // case: key=value??elseValue (condition is the key)
        if (elseIfList[1] && !elseIfList[0].split("?")[1] && elseIfList[0].split("=")[1]) {

            var key = elseIfList[0].split("=")[0]
            string = actions["encode()"]({ _window, id, stack, string: key + "=[" + elseIfList[0].split("=").slice(1).join("=") + "?" + key + "?" + elseIfList.slice(1).join("?") + "]" })

            // case: key=value?condition??value1?condition1??value2?condition2 (?? is elseif)
        } else if (elseIfList[1] && elseIfList[0].split("?")[1]) {

            string = elseIfList.at(-1)
            elseIfList.slice(0, -1).reverse().map(elseIf => string = elseIf + "?[" + string + "]")
            console.log(string);
            string = actions["encode()"]({ _window, id, stack, string })
        }

        stringList = string.split("?")
    }

    var conditions = stringList[i + 1]
    var elseParams = stringList[i + 2]
    string = stringList[i + 0]

    var approved = toApproval({ _window, data: conditions || "", id, e, req, res, __, stack, props, lookupActions, object })

    if (!approved && elseParams) {

        string = stringList.slice(2).join("?")
        message = "Else actions executed!"
        conditionsNotApplied = true
        return toLine({ _window, lookupActions, stack, props, address, id, e, data: { string, dblExecute, splitter }, req, res, __, object, action, startTime, message, conditionsNotApplied })

    } else if (!approved) return terminator({ data: { success, message: `Conditions not applied!`, conditionsNotApplied: true, executionDuration: (new Date()).getTime() - startTime } })
    else message = `Action executed successfully!`

    var actionReturnID = generate(), data
    stack.returns.unshift({ id: actionReturnID })

    // no params
    if (!string) message = "No actions to execute!"

    if (!action || props.isCondition) {

        action = "toValue"
        if (props.isValue || dblExecute) action = "toValue"
        else if (props.isParam) {
            action = "toParam"
            props.isParam = false
        } else if (props.isCondition || isCondition({ _window, string })) action = "toApproval"
        else if (isParam({ _window, string })) action = "toParam"

    } else if (action === "conditional") {

        if (isParam({ _window, string })) action = "toParam"
        else action = "toValue"
    }

    if (action === "toValue") data = toValue({ _window, lookupActions, address, stack, props, id, e, data: string, req, res, __, object })
    else if (action === "toApproval") data = toApproval({ _window, lookupActions, address, stack, props, id, e, data: string, req, res, __, object })
    else if (action === "toParam") data = toParam({ _window, lookupActions, address, stack, props, id, e, data: string, req, res, __, object })

    if (dblExecute && executable({ _window, string: data })) data = toLine({ _window, lookupActions, stack, props, id, e, data: { string: data }, req, res, __, object, tt: true }).data

    if (stack.returns && stack.returns[0].returned) {
        returnForWaitActionExists = true
        data = stack.returns[0].data
    }

    // remove return address
    stack.returns.splice(stack.returns.findIndex(ret => ret.id === actionReturnID), 1)

    // set interpreting address id
    if (address.id) stack.interpretingAddressID = address.prevInterpretingAddressID

    return terminator({ data: { success, message, data, action, conditionsNotApplied, executionDuration: (new Date()).getTime() - startTime }, order: 5 })
}

const addEventListener = ({ event, id, string, __, stack, props, lookupActions, address, eventID: mainEventID, executable }) => {

    var views = window.views
    var global = window.global
    var view = views[id]

    if (executable) return eventExecuter({ string, event, eventID: mainEventID, id, address, stack, props, lookupActions, __ })

    if (!view || !event) return

    // inherit from view
    if (!__) __ = view.__
    if (!lookupActions) lookupActions = view.__lookupActions__
    
    var mainString = actions["encode()"]({ id, stack, string: actions["encode()"]({ id, stack, string: event, start: "'" }) })

    mainString.split("?")[0].split(";").map(substring => {

        // decode
        if (substring.slice(0, 2) === "@$" && substring.length === 7) substring = global.__refs__[substring].data

        // event:id
        let { data: eventID } = toLine({ id, data: { string: substring.split("?")[0].split(":")[1] }, props: { isValue: true } })
        eventID = eventID || mainEventID || id

        toArray(eventID).map(eventID => {

            if (typeof eventID === "object" && eventID.__view__) eventID = eventID.id

            // modify
            let { event, string } = modifyEvent({ eventID, event: substring, string: mainString, id, __, stack, props, lookupActions, address })

            string = decode({string})

            // watch
            if (event === "watch") return watch({ lookupActions, __, stack, props, address, string, id })

            // loaded event
            if (event === "loaded") return views[eventID].__loadedEvents__.push({ string, event, eventID, id, address, stack, props, lookupActions, __ })

            // event id
            var genID = generate()
            var eventAddress = { genID, event, id, eventListener: (e) => eventExecuter({ string, event, eventID, id, stack, props, lookupActions, __, address, e }) }

            //
            if (id !== eventID) {

                // push to global
                global.__events__[eventID] = global.__events__[eventID] || {}
                global.__events__[eventID][genID] = eventAddress

                // relate event
                views[id].__relEvents__[eventID] = views[id].__relEvents__[eventID] || {}
                views[id].__relEvents__[eventID][genID] = eventAddress

            } else {

                views[id].__events__.unshift(eventAddress)
                views[id].__element__.addEventListener(event, eventAddress.eventListener)
            }
        })
    })
}

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////// 
/////////////////////////////////////////////////////////////////////////////////////////

const isAction = ({ _window, lookupActions, stack, props, address, id, __, e, req, res, action, name, object }) => {
    
    if (actions[name + "()"]) return {}

    var global = _window ? _window.global : window.global
    var serverAction = false, actionFound = false, newLookupActions, checkInViewsInDatastore = false

    // lookup through parent map actions
    for (let indexx = 0; indexx < lookupActions.length; indexx++) {

        var lookupAction = lookupActions[indexx]
        
        if (actionFound || !lookupAction.collection) break;

        var collection = clone(global.__queries__[lookupAction.collection]) || {}
        var doc = collection[lookupAction.doc]
        
        // queried before and not found
        if (collection && doc === false) continue
        
        // not queried yet => query
        if (!collection || !doc || (doc.__props__.secured && !stack.server && !(name in (lookupAction.path || []).reduce((o, k, i) => o[k] ? o[k] : {}, doc.__props__.actions)))) {
            
            checkInViewsInDatastore = true
            var mydata = { data: { ...lookupAction, path: [...(lookupAction.path || []), name] }, action, lookupServerActions: true, searchDoc: true }
            
            searchDoc({ _window, lookupActions, stack, props, address, id, __, e, req, res, data: mydata, object, waits: ["loader.hide", action] })
            break;
        }

        var viewActions = doc.__props__.actions
        
        // lookup through path
        if ((!stack.server ? !doc.__props__.secured : true) && lookupAction.path && lookupAction.path.length > 0) {

            var path = lookupAction.path
            clone(path).reverse().map((x, i) => {

                if (actionFound) return

                actionFound = clone((path.slice(0, path.length - i).reduce((o, k) => o[k], viewActions) || {})[name])
                
                // found map action
                if (typeof actionFound === "object" && actionFound._) {

                    actionFound = actionFound._ || ""
                    newLookupActions = [{ ...lookupAction, path: [...path.slice(0, path.length - i), name] }, ...lookupActions.slice(indexx)]

                // found action
                } else if (actionFound && lookupActions.length > 1) newLookupActions = lookupActions.slice(indexx)
            })

        // calling server action from browser
        } else if (doc.__props__.secured && !stack.server && viewActions[name]/* === true*/) {
            
            actionFound = true
            serverAction = true
            newLookupActions = [{ doc: lookupAction.doc, collection: lookupAction.collection }]
        
        // action in the view main actions
        } else if (viewActions[name]) {
            
            actionFound = clone(viewActions[name])

            if (typeof actionFound === "object" && actionFound._) {

                actionFound = actionFound._ || ""
                newLookupActions = [{ ...lookupAction, path: [name] }, ...lookupActions]
            }
        }
    }

    return { newLookupActions, checkInViewsInDatastore, serverAction, actionFound }
}

const then = async ({ _window, req, res, o, stack, props, lookupActions, k0, id, e, __, args, object, string, path }) => {
    
    if (path) {
        args = path[0].split(":")
        k0 = args[0]
        if ((path[1] || "").split(":")[0] === "then()") string = (path[1] || "").split(":")[1]
    }

    var data = [], response
    args.slice(1).map(arg => {
        data.push(toValue({ req, res, _window, lookupActions, stack, props: { isValue: true }, object, id, e, __, data: arg || "" }))
    })

    /*if (path) await eval(k0)
    else */if (k0.slice(-2) === "()" && typeof o[k0.slice(0, -2)] === "function") response = await o[k0.slice(0, -2)](...data)
    else response = await o[k0]
    
    if (string) toParam({ _window, lookupActions, stack, props, data: string, e, id, req, res, object, __: [response, ...__] })
}

const getDeepChildren = ({ _window, id }) => {

    var views = _window ? _window.views : window.views
    var view = views[id]
    var all = [view]
    if (!view) return []

    if (view.__childrenRef__.length > 0)
        view.__childrenRef__.map(({ id }) => {

            var _view = views[id]
            if (!_view) return

            if (_view.__childrenRef__.length > 0)
                all.push(...getDeepChildren({ _window, id }))

            else all.push(_view)
        })

    return all
}

const getDeepChildrenId = ({ _window, id }) => {

    var views = _window ? _window.views : window.views
    var view = views[id]
    var all = [id]
    if (!view) return []

    if (view.__childrenRef__.length > 0)
        view.__childrenRef__.map(({ id }) => {

            var _view = views[id]
            if (!_view) return

            if (_view.__childrenRef__.length > 0)
                all.push(...getDeepChildrenId({ _window, id }))

            else all.push(id)
        })

    return all
}

const getDeepParentId = ({ _window, lookupActions, stack, props, id }) => {

    var views = _window ? _window.views : window.views
    var view = views[id]

    if (!view) return []
    if (!view.__element__.parentNode || view.__element__.parentNode.nodeName === "BODY") return []

    var parentId = view.__element__.parentNode.id
    var all = [parentId]

    all.push(...getDeepParentId({ _window, lookupActions, stack, props, id: parentId }))

    return all
}

const exportHTMLToPDF = async ({ _window, pages, opt, lookupActions, stack, props, address, req, res, id, e, __ }) => {

    const { jsPDF } = jspdf
    const doc = new jsPDF(opt.jsPDF)
    const pageSize = jsPDF.getPageSize(opt.jsPDF)

    if (opt.execludeImages) {

        var promises = []
        pages.map(page => { promises.push(html2pdf().from(page).set(opt).outputImg()) })
        await Promise.all(promises)

        promises.map((pageImage, i) => {
            console.log(i + 1);
            if (i != 0) { doc.addPage() }
            doc.addImage(pageImage._result.src, 'jpeg', 0.1, 0.1, pageSize.width - 0.2, pageSize.height - 0.2);
        })

    } else {

        for (let i = 0; i < pages.length; i++) {

            const page = pages[i]
            const pageImage = await html2pdf().from(page).set(opt).outputImg()
            console.log(i + 1);
            if (i != 0) { doc.addPage() }
            doc.addImage(pageImage.src, 'jpeg', 0.1, 0.1, pageSize.width - 0.2, pageSize.height - 0.2);
        }
    }

    doc.save(opt.filename)

    // await params
    if (args[2]) actions["stackManager()"]({ _window, lookupActions, stack, props, address, req, res, id, e, __ })
}

const toDataURL = url => fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
    }))

const sleep = (milliseconds) => {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

const isNumber = (value) => {
    return typeof value === "number" ? true : (typeof value === "string" && !isNaN(value) && !emptySpaces(value))
}

const emptySpaces = (string) => {
    if (typeof string === "string") {
        var empty = true
        while (string.length > 0) {

            if (string.charAt(0) === " ") empty = true
            else empty = false
            string = string.slice(1)
        }
        return empty
    }
    return false
}

const calcSubs = ({ _window, lookupActions, stack, props, value, __, id, e, req, res, object, index = 1 }) => {

    var allAreNumbers = true, test = value, global = _window ? _window.global : window.global
    if (value.split("-").length > index) {

        var _value = value.split("-").slice(0, index).join("-")
        var _values = value.split("-").slice(index)
        _values.unshift(_value)

        var values = _values.map(value => {

            if (!allAreNumbers) return
            if (!executable({ _window, string: value }) && !isNumber(value)) return allAreNumbers = false

            if (allAreNumbers) {

                var num = toValue({ _window, lookupActions, stack, props: { isValue: true }, data: value, __, id, e, req, res, object })
                if (!isNaN(num) && num !== " " && num !== "") return num
                else allAreNumbers = false
            }
        })

        if (allAreNumbers) {

            value = parseFloat(values[0])
            values.slice(1).map(val => value -= parseFloat(val))
            global.__calcTests__[test] = true

        } else value = calcSubs({ _window, lookupActions, stack, props, value, __, id, e, req, res, object: value.charAt(0) === "." ? object : [], index: index + 1 })

    } else return value

    if (value === test) global.__calcTests__[test] = false
    return value
}

const calcDivision = ({ _window, lookupActions, stack, props, value, __, id, e, req, res, object, index = 1 }) => {

    var allAreNumbers = true, test = value, global = _window ? _window.global : window.global
    if (value.split("/").length > index) {

        var _value = value.split("/").slice(0, index).join("/")
        var _values = value.split("/").slice(index)
        _values.unshift(_value)

        var values = _values.map(value => {

            if (!allAreNumbers) return
            if (!executable({ _window, string: value }) && !isNumber(value)) return allAreNumbers = false

            if (allAreNumbers) {

                var num = toValue({ _window, lookupActions, stack, props: { isValue: true }, data: value, __, id, e, req, res, object })
                if (!isNaN(num) && num !== " " && num !== "") return num
                else allAreNumbers = false
            }
        })

        if (allAreNumbers) {

            value = parseFloat(values[0])
            values.slice(1).map(val => {
                if (isNumber(value) && isNumber(val)) value /= val
            })

            // push 
            global.__calcTests__[test] = true

        } else calcDivision({ _window, lookupActions, stack, props, value, __, id, e, req, res, object, index: index + 1 })
    }

    if (value === test) global.__calcTests__[test] = false
    return value
}

const calcModulo = ({ _window, lookupActions, stack, props, value, __, id, e, req, res, object, index = 1 }) => {

    var allAreNumbers = true, test = value, global = _window ? _window.global : window.global
    if (value.split("%").length > index) {

        var _value = value.split("%").slice(0, index).join("%")
        var _values = value.split("%").slice(index)
        _values.unshift(_value)

        var values = _values.map(value => {

            if (!executable({ _window, string: value }) && !isNumber(value)) return allAreNumbers = false

            if (allAreNumbers) {

                var num = toValue({ _window, lookupActions, stack, props: { isValue: true }, data: value, __, id, e, req, res, object })

                if (!isNaN(num) && num !== " " && num !== "") return num
                else allAreNumbers = false
            }
        })

        if (allAreNumbers) {

            value = parseFloat(values[0])
            values.slice(1).map(val => value %= val)

            global.__calcTests__[test] = true

        } else value = calcModulo({ _window, lookupActions, stack, props, value, __, id, e, req, res, object, index: index + 1 })
    }

    if (value === test) global.__calcTests__[test] = false
    return value
}

const endAddress = ({ _window, stack, props, data, req, res, id, e, __, lookupActions, endID }) => {

    const global = _window ? _window.global : window.global
    let nextAddressID = stack.interpretingAddressID, currentStackID = stack.id
    let address = stack.addresses.find(address => address.id === nextAddressID)

    const endStarterAddress = ({ address, stack, props }) => {

        address.starter = false

        // get start nextAddress to push data to its underscores
        let starterNextAddress = stack.addresses.find(nextAddress => nextAddress.id === address.nextAddressID)
        if (starterNextAddress) {

            // push response to underscore
            starterNextAddress.params.__ = [data, ...starterNextAddress.params.__]
            starterNextAddress.hasWaits = false
            starterNextAddress.ended = true

            // start again from the current interpreting address and set blocked until reaching nextAddress
            let stack = global.__stacks__[currentStackID], blockedAddress = true
            nextAddressID = stack.interpretingAddressID

            while (blockedAddress && nextAddressID && nextAddressID !== starterNextAddress.id) {

                blockedAddress = stack.addresses.find(address => address.id === nextAddressID)
                if (blockedAddress) {

                    if (blockedAddress.blockable) {

                        blockedAddress.blocked = true
                        blockedAddress.status = "End"
                        stack.blocked = true
                    }

                    nextAddressID = blockedAddress.nextAddressID

                    // address coming from different stack
                    if (blockedAddress.nextStackID) stack = global.__stacks__[blockedAddress.nextStackID]
                }
            }

            address.hold = false

            stack = global.__stacks__[currentStackID]
            stack.blocked = true

            // block current address
            address = stack.addresses.find(address => address.id === stack.interpretingAddressID)
            address.blocked = true
            address.status = "End"

           // actions["stackManager()"]({ req, res, _window, lookupActions, stack, props, address, id, e, __ })

            if (endID) {

                let stack = global.__stacks__[global.__startAddresses__[endID].address.stackID]
                let address = global.__startAddresses__[endID].address

                delete global.__startAddresses__[endID]
                actions["stackManager()"]({ req, res, _window, lookupActions, stack, props, address, id, e, __ })
            }
        }
    }

    if (endID) {

        if (!global.__startAddresses__[endID]) return
        let stack = global.__stacks__[global.__startAddresses__[endID].address.stackID]
        let address = global.__startAddresses__[endID].address

        endStarterAddress({ address, stack, props })

    } else {

        while (nextAddressID && stack) {

            // start from self address (by interpretingAddressID) to reach the start head address
            let address = stack.addresses.find(address => address.id === nextAddressID)
            if (!address) break

            if (address.starter) {

                endStarterAddress({ address, stack, props })
                break;
            }

            // move to head address
            nextAddressID = address.nextAddressID

            // reached index 0 address => check stack if it has nextAddress
            if (address.nextStackID) stack = global.__stacks__[address.nextStackID]
        }
    }
}

const printAddress = ({ stack, address, nextAddress = {}, newAddress }) => {

    if (newAddress) stack.logs.push(`${stack.logs.length} ${address.status} ${address.type.toUpperCase()} ${address.id} ${address.index} ${address.type === "function" ? address.function : address.action}${nextAddress.id ? ` => ${nextAddress.id || ""} ${nextAddress.index !== undefined ? nextAddress.index : ""} ${nextAddress.type === "function" ? nextAddress.function : nextAddress.action || ""}` : ""}`)
    else stack.logs.push(`${stack.logs.length} ${address.status}${address.status === "End" ? (" (" + ((new Date()).getTime() - address.executionStartTime) + ") ") : " "}${address.type.toUpperCase()} ${address.id} ${address.index} ${address.type === "function" ? address.function : address.action}${nextAddress.id ? ` => ${nextAddress.id || ""} ${nextAddress.index !== undefined ? nextAddress.index : ""} ${nextAddress.type === "function" ? nextAddress.function : nextAddress.action || ""}` : ""}`)
    // console.log(stack.logs.at(-1));
}

const resetAddress = ({ address, ...data }) => {

    Object.entries(data || {}).map(([key, value]) => {
        address[key] = value
    })
}

const closePublicViews = ({ _window, stack, id, __, lookupActions }) => {

    if (_window) return

    // close droplist
    if (id !== "droplist") toParam({ id: "droplist", data: actions["encode()"]({ stack, string: "__droplistMouseleaveTimer__:()=0;():droplist.mouseleave()" }), __, lookupActions })

    // close tooltip
    toParam({ id: "tooltip", data: actions["encode()"]({ stack, string: "clearTimer():[__tooltipTimer__:()];__tooltipTimer__:().del();():tooltip.style().opacity=0" }), __, lookupActions })

    // close mininote
    toParam({ id: "mininote", data: actions["encode()"]({ stack, string: "():mininote.style():[opacity=0;transform=scale(0)]" }), __, lookupActions })
}

const remove = ({ _window, stack, props, data = {}, id, __, lookupActions }) => {

    var global = window.global
    var views = window.views
    var view = window.views[id]

    var path = data.path, __dataPath__ = []

    if (path) __dataPath__ = path
    else __dataPath__ = clone(view.__dataPath__) || []

    if (__dataPath__.length > 0 && !data.preventDefault) {

        var string = `${view.form}:().` + __dataPath__.join(".").slice(0, -1)
        var parentData = toLine({ id, data: { string } })

        // remove data
        if (Array.isArray(parentData) && parentData.length === 0) {

            var string = `${view.form}:().` + __dataPath__.join(".").slice(0, -1) + "=:"
            toLine({ id, data: { string }, __, lookupActions })

        } else {

            var string = `${view.form}:().` + __dataPath__.join(".") + ".del()"
            toLine({ id, data: { string }, __, lookupActions })
        }
    }

    // close publics
    closePublicViews({ _window, id, __, stack, props, lookupActions })

    // no data
    if (__dataPath__.length === 0) {

        removeView({ id, global, views, stack, props, main: true }).remove()

    } else {

        // reset length and __dataPath__
        var itemIndex = view.__dataPath__.length - 1
        var parent = views[view.__parent__]

        // update data path
        if (!data.preventDefault) parent.__childrenRef__.slice(view.__index__ + 1).map(({ id }) => updateDataPath({ id, myIndex: view.__dataPath__[itemIndex], index: itemIndex, decrement: true }))
        removeView({ id, global, views, stack, props, main: true }).remove()
    }

    console.log("REMOVE:" + id)
}

const updateDataPath = ({ id, myIndex, index, decrement, increment }) => {

    var views = window.views
    var view = views[id]

    if (!view) return
    if (!isNumber(view.__dataPath__[index])) return
    if (decrement && view.__dataPath__[index] <= myIndex) return
    else if (increment && view.__dataPath__[index] >= myIndex) return

    if (decrement) view.__dataPath__[index] -= 1
    else if (increment) view.__dataPath__[index] += 1

    view.__childrenRef__.map(({ id }) => updateDataPath({ id, myIndex, index, decrement, increment }))
}

const sort = ({ _window, sort = {}, id, e, lookupActions, __, stack, props, object }) => {

    var view = _window ? _window.views[id] : window.views[id]

    // data
    var form = sort.form || view.form
    var data = sort.data || global[form]
    var sortBy = "ascending"

    if (sort.ascending) sortBy = "ascending"
    else if (sort.descending) sortBy = "descending"

    // path
    var path = sort.path
    if (typeof sort.path === "string") path = toArray(actions["encode()"]({ _window, stack, string: path }).split("."))
    if (!path) path = []

    if (!Array.isArray(data) && typeof data === "object") data = Object.values(data)

    data.sort((a, b) => {

        a = reducer({ _window, id, data: { path }, object: [a, ...toArray(object)], e, lookupActions, __, stack, props })
        b = reducer({ _window, id, data: { path }, object: [b, ...toArray(object)], e, lookupActions, __, stack, props })

        if (sortBy === "descending") {

            if (typeof a === "string" && typeof b === "string") return b.localeCompare(a, undefined, { numeric: true })
            else return b - a

        } else {

            if (typeof a === "string" && typeof b === "string") return a.localeCompare(b, undefined, { numeric: true })
            else return a - b
        }
    })

    // sort by
    if (form) global[form] = data

    return data
}

const sortAndArrange = ({ _window, data, sort: _sort, arrange, id }) => {

    if (_sort) data = sort({ _window, id, sort: { data, ascending: true } })

    if (arrange) {

        var orderMap = new Map()
        arrange.forEach((value, index) => {
            orderMap.set(value, index)
        })

        var sortedSecondList = data.sort((a, b) => {
            const indexA = orderMap.has(a) ? orderMap.get(a) : arrange.length + 1
            const indexB = orderMap.has(b) ? orderMap.get(b) : arrange.length + 1
            return indexA - indexB
        })

        data = sortedSecondList
    }

    return data
}

const componentModifier = ({ _window, view }) => {

    if (!view) return console.log("No view in componentModifier");
    // icon
    if (view.__name__ === "Icon") {

        view.icon = view.icon || {}
        view.icon.name = view.name || view.icon.name || (typeof view.data === "string" && view.data) || ""
        /*if ((view.icon.google || view.google) && (!view.google.symbol && !view.symbol)) {

            view.symbol = {}
            view.google.symbol = {}
            if (view.google.outlined) view.outlined = true
            else if (view.google.filled) view.filled = true
            else if (view.google.rounded) view.rounded = true
            else if (view.google.sharp) view.sharp = true
            else if (view.google.twoTone) view.twoTone = true
            else view.google = {}

        } else */if (view.icon.google || view.google) {

            view.symbol = {}
            if (typeof view.google !== "object" || view.google.symbol) view.symbol.outlined = true
            else {
                view.google = {symbol:{}}
            
                if (view.google.symbol.filled) view.symbol.filled = true
                else if (view.google.symbol.rounded) view.symbol.rounded = true
                else if (view.google.symbol.sharp) view.symbol.sharp = true
                else if (view.google.symbol.twoTone) view.symbol.twoTone = true
                else view.google = {}
            }

        } else {

            view.symbol = {}
        }
    }

    // input
    else if (view.__name__ === "Input") {

        view.input = view.input || {}
        if ("type" in view) view.input.type = view.type
        if ("value" in view) view.input.value = view.input.text = view.text = view.input.value || view.input.text || view.value
        if (view.checked !== undefined) view.input.checked = view.checked
        if (view.max !== undefined) view.input.max = view.max
        if (view.min !== undefined) view.input.min = view.min
        if (view.name !== undefined) view.input.name = view.name
        if (view.accept !== undefined) view.input.accept = view.input.accept
        if (view.multiple !== undefined) view.input.multiple = true
        if (view.input.placeholder) view.placeholder = view.input.placeholder
        if ("text" in view) view.input.value = view.text

    }

    else if (view.__name__ === "Image") {

        view.src = view.src || (typeof view.data === "string" && view.data) || ""

    }

    else if (view.__name__ === "Text") {

        view.text = view.text !== undefined ? view.text : ((typeof view.data === "string" && view.data) || "")
    }
}

const loopOverView = ({ _window, id, stack, props, lookupActions, __, address, data = {}, req, res }) => {

    var global = _window ? _window.global : window.global
    var views = _window ? _window.views : window.views
    var view = views[id]

    // mount
    if (data.form || data.path) data.mount = true

    // path
    var path = Array.isArray(data.path) ? data.path : data.path !== undefined ? (data.path || "").split(".") : []

    if (data.mount) {

        data.__dataPath__ = [...((data.form || data.data) ? [] : view.__dataPath__), ...path]
        data.form = data.form || ((("path" in data) || ("keys" in data)) && view.form) || generate()
        global[data.form] = global[data.form] || data.data || {}

        data.data = kernel({ _window, lookupActions, stack, props: {}, id, data: { path: data.__dataPath__, data: global[data.form] }, req, res, __ })
    }

    var { form, data = {}, __dataPath__ = [], path, keys, mount, preventDefault, ...myparams } = data

    var loopData = []
    var isObj = !Array.isArray(data) && typeof data === "object"
    if (isObj && keys) loopData = Object.keys(data)
    else if (Array.isArray(data)) {
        if (data.length === 1) loopData = ["0"]
        else loopData = Object.keys(data)
    } else if (isObj) loopData = ["0"]

    var values = keys ? data : toArray(data), address = {}
    if (keys && !Array.isArray(data)) loopData = sortAndArrange({ _window, id, data: loopData, sort: myparams.sort, arrange: myparams.arrange })

    // name
    if (encoded(view.__name__)) view.__name__ = global.__refs__[view.__name__].data

    // 
    view.__paramsInterpreted__ = false
    view.__subParamsInterpreted__ = false
    view.view = view.__name__ + "?" + view.view.split("?").slice(1).join("?")
    if (view.view.slice(-1)[0] === "?") view.view = view.view.slice(0, -1)

    var lastIndex = loopData.length - 1, limit = 0
    var myData = [...loopData]
    if (lastIndex > 20) {
        address.terminated = true
        limit = 20
    }

    if (limit) {
        for (let index = limit - 1; index >= 0; index--) {
            
            var key = myData[index]
            view.__looped__ = true

            var params = { __loopIndex__: index, id: `${view.id}_${index}` }
            key = isNumber(key) ? parseInt(key) : key
            if (mount) params = { ...params, form, __dataPath__: [...__dataPath__, key] }

            views[params.id] = { __view__: true, __loop__: true, __mount__: mount, ...clone(view), ...myparams, ...params }

            address = actions["addresser()"]({ _window, id: params.id, stack, props, nextAddress: address, type: "function", function: "view", renderer: true, blockable: false, __: !mount ? [values[key], ...__] : __, lookupActions, data: { view: views[params.id] } }).address
        }
        
        actions["stackManager()"]({ _window, lookupActions, stack, props, address, id, req, res, __ })
    }

    for (let index = lastIndex; index >= limit; index--) {
        
        var key = myData[index]
        view.__looped__ = true

        var params = { __loopIndex__: index, id: `${view.id}_${index}` }
        key = isNumber(key) ? parseInt(key) : key
        if (mount) params = { ...params, form, __dataPath__: [...__dataPath__, key] }

        views[params.id] = { __view__: true, __loop__: true, __mount__: mount, ...clone(view), ...myparams, ...params }
        
        address = actions["addresser()"]({ _window, id: params.id, stack, props, nextAddress: address, type: "function", function: "view", renderer: true, blockable: false, __: !mount ? [values[key], ...__] : __, lookupActions, data: { view: views[params.id] } }).address
    }
    
    address.terminated = false
    // actions["stackManager()"]({ _window, lookupActions, stack, props, address, id, req, res, __ })

    removeView({ _window, global, views, id, stack, props, address, lookupActions, req, res, __ })
}

const clearActions = (data) => {
    if (typeof data !== "object") return
    Object.entries(data || {}).map(([action, mapAction]) => {
        if (typeof mapAction === "object") return clearActions(mapAction)
        data[action] = ""
    })
    return data
}

const initView = ({ views, global, id = generate(), form, children = [], parent, style = {}, __parent__, __status__ = "Loading", __dataPath__, __controls__ = [], ...data }) => {

    var parentView = (parent || __parent__ ? views[parent || __parent__] : { __childrenInitialIDRef__: [] }) || { __childrenInitialIDRef__: [] }

    views[id] = {
        ...data,
        id,
        children,
        style,
        form: form || parentView.form,
        __initialID__: id,
        __status__,
        __view__: true,
        __parent__: parent || __parent__,
        __dataPath__: __dataPath__ || [...(parentView.__dataPath__ || [])],
        __indexing__: 0,
        __name__: data.view,
        __controls__,
        __events__: [],
        __loadedEvents__: [],
        __relEvents__: {},
        __childrenRef__: [],
        __childrenInitialIDRef__: [],
        __timers__: [],
        __rendered__: false,
        __initialIndex__: parentView.__indexing__ || 0,
        __viewPath__: [...(data.__viewPath__ || [])],
        __viewCollection__: data.__viewCollection__ || parentView.__viewCollection__,
        __prevViewCollection__: data.__prevViewCollection__ || parentView.__prevViewCollection__,
        __lookupActions__: [...(data.__lookupActions__ || parentView.__lookupActions__ || [])],
        __customViewPath__: [...(data.__customViewPath__ || parentView.__customViewPath__ || [])]
    }

    // 
    if (!parentView.__childrenInitialIDRef__.includes(id)) parentView.__childrenInitialIDRef__.push(id)

    if (parentView.__indexing__ > -1) parentView.__indexing__ += 1

    return { id, view: views[id] }
}

const getViewParams = ({ view }) => {

    var {
        id, form, data, view, children, style, __lookupActions__, __element__, __dataPath__, __childrenRef__, __index__, __relEvents__, __loadedEvents__,
        __loop__, __loopIndex__, __looped__, __mount__, __interpretingSubparams__, __underscoreLoopIndex__, __prevViewPath__, __conditions__, __subParams__,
        __viewPath__, __customViewPath__, __indexing__, __childIndex__, __initialIndex__, __customView__, __htmlStyles__, __events__, __page__, __inserted__,
        __defaultValue__, __childrenInitialIDRef__, __initialID__, __viewCollection__, __subParamsInterpreted__, __prevViewCollection__, __params__,
        __parent__, __controls__, __status__, __rendered__, __timers__, __view__, __name__, __customID__, __paramsInterpreted__, __, ...params
    } = view

    return params
}

const removeView = ({ _window, global, views, id, lookupActions, stack, props, self = true, main, insert, address, req, res, __ }) => {

    let view = views[id]
    if (!view) return
    let parent = views[view.__parent__] || {}, element = {}

    // if (!parent) return

    view.__childrenRef__.map(({ id }) => id).map(id => removeView({ _window, global, views, id, stack, props, insert }))
    if (main || !self) view.__childrenInitialIDRef__.map(initialID => {

        let unrenderedView = Object.values(views).find(view => initialID === (view || {}).__initialID__)
        if (unrenderedView) removeView({ _window, global, views, id: unrenderedView.id, stack, props, insert })
    })

    // remove events
    view.__element__ && view.__events__.map(event => view.__element__.removeEventListener(event.event, event.eventListener))

    // remove related events
    Object.entries(view.__relEvents__).map(([eventID, events]) => {
        Object.entries(events).map(([genID, address]) => {
            views[eventID] && views[eventID].__rendered__ && views[eventID].__element__.removeEventListener(address.event, address.eventListener)
            delete global.__events__[eventID][genID]
        })
    })

    // remove loader()
    if (!_window) {
        let loader = document.getElementById(view.id + "-loader")
        if (loader) loader.remove()
    }

    if (!self) {

        // remove from initial index list
        let initialIDIndex = parent.__childrenInitialIDRef__.indexOf(view.__initialID__)
        if (initialIDIndex > -1) parent.__childrenInitialIDRef__.splice(initialIDIndex, 1)

        return element
    }

    view.__timers__.map(timerID => clearTimeout(timerID))

    let index = parent.__childrenRef__ && parent.__childrenRef__.findIndex(({ id }) => id === view.id)
    
    if (index > -1) {
        main && parent.__childrenRef__.slice(index + 1).map(viewRef => {

            viewRef.index--
            views[viewRef.id].__index__ = viewRef.index
            views[viewRef.id].__rendered__ && views[viewRef.id].__element__.setAttribute("index", viewRef.index)
        })
        parent.__childrenRef__.splice(index, 1)
    }
    
    if (main && view.__rendered__) element = view.__element__

    views[id] = null
    delete views[id]
    
    if (address) actions["stackManager()"]({ _window, lookupActions, stack, props, address, id, req, res, __ })
    else return element
}

const deepDelete = ({ obj, key }) => {

    if (typeof obj !== "object" || obj[key] === null) return
    if (typeof obj[key] === "object")
        Object.keys(obj[key]).map(key => {
            deepDelete({ obj: obj[key], key })
        })

    obj[key] = null
    delete obj[key]
}

const blockRelatedAddressesBynextAddress = ({ stack, index }) => {

    var address = stack.addresses[index], index
    address.interpreting = false

    // block nextAddress
    if (address.blockable) stack.addresses[index].blocked = true

    // remove child addresses
    while (index !== -1) {
        
        index = stack.addresses.findIndex(({ nextAddressID, blocked, blockable }) => blockable && !blocked && nextAddressID === address.id)
        if (index !== -1) blockRelatedAddressesBynextAddress({ stack, index })
    }
}

const blockRelatedAddressesByViewID = ({ stack, id }) => {

    // delete addresses
    var index = stack.addresses.findIndex(({ viewID, blocked, blockable, action }) => blockable && !blocked && viewID === id && action !== "refresh()::[...]")
    if (index !== -1) blockRelatedAddressesBynextAddress({ stack, index })
}

const eventExecuter = ({ _window, event, eventID, id, lookupActions, e, string, stack: nextStack, props, address: nextAddress, __, object = [] }) => {

    const views = window.views, global = window.global

    lookupActions = [...lookupActions]

    // view doesnot exist
    if (!views[id] || !views[eventID]) return

    object = [views[id], ...object]

    // e.target is not necessarily the element clicked. consider a btn in a container. the click event is on the container however the exact click was on the btn.
    if (event === "click" || event === "mousedown" || event === "mouseup") global.__clicked__ = views[e.target.id]

    // prevent unrelated droplists
    if (eventID === "droplist" && id !== "droplist" && (!global.__droplistPositioner__ || !views[global.__droplistPositioner__] || !views[global.__droplistPositioner__].__element__.contains(views[id].__element__))) return

    // init stack
    const stack = openStack({ _window, event, id, eventID, string, e })

    // address line
    const address = actions["addresser()"]({ _window, stack, props, id, status: "Start", type: "line", event, interpreting: true, lookupActions, __, nextStack, nextAddress, object }).address

    // main params
    toLine({ _window, lookupActions, stack, props, id, e, address, data: { string }, __, object, action: "toParam" })

    endStack({ _window, stack, props })
}

const defaultEventHandler = ({ id, events = ["click", "focus", "blur", "mouseenter", "mouseleave", "mousedown", "mouseup"] }) => {

    var views = window.views
    var view = views[id]

    view.focused = false
    view.touchstarted = false
    view.mouseentered = false
    view.mentered = false
    view.mousedowned = false
    view.mdowned = false

    // linkable
    if (events.includes("click") && view.link && typeof view.link === "object" && view.link.preventDefault)
        view.__element__.addEventListener("click", (e) => { e.preventDefault() })

    // input
    if (view.__name__ === "Input" || view.editable) {

        events.includes("focus") && defaultInputHandlerByEvent({ views, view, id, event: "focus", keyName: "focused", value: true })
        events.includes("blur") && defaultInputHandlerByEvent({ views, view, id, event: "blur", keyName: "focused", value: false })
    }

    events.includes("mouseenter") && defaultInputHandlerByEvent({ views, view, id, event: "mouseenter", keyName: ["mouseentered", "mentered"], value: true })
    events.includes("mouseleave") && defaultInputHandlerByEvent({ views, view, id, event: "mouseleave", keyName: ["mouseentered", "mentered"], value: false })

    events.includes("mousedown") && defaultInputHandlerByEvent({ views, view, id, event: "mousedown", keyName: ["mousedowned", "mdowned"], value: true })
    events.includes("mouseup") && defaultInputHandlerByEvent({ views, view, id, event: "mouseup", keyName: ["mousedowned", "mdowned"], value: false })
}

const defaultInputHandlerByEvent = ({ views, view, id, event, keyName, value }) => {

    // function
    const fn = (e) => {
        if (views[id]) toArray(keyName).map(keyName => view[keyName] = value)
    }
    view.__element__.addEventListener(event, fn)
}

const modifyEvent = ({ eventID, event, string, id, __, stack, props, lookupActions, address }) => {

    var view = window.views[eventID]
    var subparams = event.split("?")[1] || ""
    var subconditions = event.split("?")[2] || ""
    event = event.split("?")[0].split(":")[0]

    string = string.split("?").slice(1)
    var conditions = string[1] || ""

    if (event === "change" && (view.editable || view.input.type === "text" || view.input.type === "number")) {

        event = "keyup"
        subconditions += "e().key!=Tab;e().key!=Alt;e().key!=Shift;e().key!=Control;e().key!=ArrowUp;e().key!=ArrowDown;e().key!=ArrowRight;e().key!=ArrowLeft;e().key!=Enter"

    } else if (event === "entry") {

        event = "input"

    } else if (event === "menter") {

        event = "mouseenter"

    } else if (event === "mleave") {

        event = "mouseleave"

    } else if (event === "enter") {

        event = "keyup"
        conditions += "e().key=Enter||e().keyCode=13"

    } else if (event === "ctrl") {

        event = "keydown"
        conditions += "e().ctrlKey"

    } else if (event === "hover") {

        event = "mouseleave"
        defaultEventHandler({ id, events: ["mouseenter", "mouseleave"] })
        addEventListener({ event: `mouseenter?[${subparams};${string[0]}?${conditions}?${string.slice(2).join("?") || ""}]?${subconditions}`, eventID, id, __, stack, props, lookupActions, address })

    } else if (event === "dblclick") {

    }

    string = `[${subparams};${string[0]}?${conditions}?${string.slice(2).join("?") || ""}]?${subconditions}`
    while (string.slice(-1) === "?") string = string.slice(0, -1)

    return { string, event }
}

const starter = ({ lookupActions, stack, props, __, address, id }) => {

    const view = window.views[id], global = window.global
    if (!view) return {}

    // status
    view.__status__ = "Mounted"
    view.__rendered__ = true

    // element
    view.__element__ = document.getElementById(id)
    if (!view.__element__) { delete window.views[id]; return {} }
    view.__element__.setAttribute("index", view.__index__)

    // default input handlers
    defaultInputHandler({ id })

    // built in events
    Object.keys(builtinEvents).map(key => view[key] && view.__controls__.push(...builtinEvents[key]))

    // events
    view.__controls__.map(data => addEventListener({ lookupActions, stack, props, address, __, id, ...data }))

    // related events
    global.__events__[id] && Object.values(global.__events__[id]).map(address => view.__element__.addEventListener(address.event, address.eventListener))

    return view.__relEvents__ || {}
}

const defaultInputHandler = ({ id }) => {

    let views = window.views, global = window.global, view = views[id]

    if (!view) return
    if (view.__name__ !== "Input" && !view.editable) return

    view.__element__.addEventListener("focus", (e) => { if (view) global.__focused__ = view })
    view.__element__.addEventListener("blur", (e) => { if (view) global.__focused__ = undefined })

    if (typeof view.preventDefault === "string") return

    // checkbox input
    if ((view.input || view).type === "checkbox") {

        if (view.data === true) view.__element__.checked = true

        var changeEventHandler = (e) => {

            // view doesnot exist
            if (!window.views[id]) return e.target.removeEventListener("change", myFn)

            var data = e.target.checked
            view.data = data

            if (global[view.form] && view.__dataPath__[0] !== "") {

                // reset Data
                setData({ id, data })
            }
        }

        return view.__element__.addEventListener("change", changeEventHandler)
    }

    // mousewheel
    if ((view.input || view).type === "number") view.__element__.addEventListener("mousewheel", (e) => e.target.blur())

    // readonly
    if (view.readonly) return

    if (view.__name__ === "Input") view.prevValue = view.__element__.value
    else if (view.editable) view.prevValue = (view.__element__.textContent === undefined) ? view.__element__.innerText : view.__element__.textContent

    const inputEventHandler = async (e) => {

        e.preventDefault()

        let value
        if (view.__name__ === "Input") value = e.target.value
        else if (view.editable) value = (e.target.textContent === undefined) ? e.target.innerText : e.target.textContent

        // views[id] doesnot exist
        if (!window.views[id]) {
            if (e.target) e.target.removeEventListener("input", myFn)
            return
        }

        // contentfull
        if ((view.input || view).type === "text") {

            value = replaceNbsps(value.replace('&amp;', '&'))
            e.target.value = value
        }

        if (view.__name__ === "Input" && view.input.type === "number") {

            if (e.data !== ".") {

                if (isNaN(value)) value = value.toString().slice(0, -1)
                if (!value) value = 0
                if (value.toString().charAt(0) === "0" && value.toString().length > 1) value = value.toString().slice(1)
                if (view.input.min && view.input.min > parseFloat(value)) value = view.input.min
                if (view.input.max && view.input.max < parseFloat(value)) value = view.input.max
                value = parseFloat(value)
                // prevent default for 0 values
                if (e.target.value === "" && (typeof view.preventDefault === "object" ? view.preventDefault.zeroValue : false)) value = null
                else view.__element__.value = value.toString()

            } else value = parseFloat(value + ".0")
        }

        if (view.form) setData({ id, data: { value, noValue: value === null }, __: view.__ })

        // resize
        resize({ id })

        // arabic values
        // isArabic({ id, value })

        console.log(value, global[view.form], view.__dataPath__)

        view.prevValue = value
    }

    const blurEventHandler = (e) => {

        let value
        if (view.__name__ === "Input") value = view.__element__.value
        else if (view.editable) value = (view.__element__.textContent === undefined) ? view.__element__.innerText : view.__element__.textContent

        // colorize
        if (view.colorize) {

            let _value = actions["encode()"]({ id, stack, string: actions["encode()"]({ id, stack, string: value, start: "'" }) })
            if (view.__name__ === "Input") e.target.value = colorize({ string: _value, ...(typeof view.colorize === "object" ? view.colorize : {}) })
            else e.target.innerHTML = colorize({ string: _value, ...(typeof view.colorize === "object" ? view.colorize : {}) })

            /*
            let sel = window.getSelection()
            let selected_node = sel.anchorNode
            
            let prevValue = view.prevValue.split("")
            let position = value.split("").findIndex((char, i) => char !== prevValue[i])
      
            sel.collapse(selected_node, position + 1)
            */
        }

        // 
        if (value !== view.prevContent && global.__ISBRACKET__) {
            global.redo = []
            global.undo.push({
                collection: global["openCollection"],
                form: global["openDoc"],
                path: view.__dataPath__,
                value: view.prevContent,
                id: view.__element__.parentNode.parentNode.parentNode.parentNode.id
            })
        }
    }

    const focusEventHandler = (e) => {

        let value = ""
        if (view.__name__ === "Input") value = view.__element__.value
        else if (view.editable) value = (view.__element__.textContent === undefined) ? view.__element__.innerText : view.__element__.textContent

        view.prevContent = value
    }

    const fileEventHandler = (e) => {

        view.__file__ = e.target.files[0]
        return view.__files__ = [...e.target.files]
    }

    if (view.input ? view.input.type !== "file" : true) {

        view.__element__.addEventListener("input", inputEventHandler)
    }

    view.__element__.addEventListener("blur", blurEventHandler)
    view.__element__.addEventListener("focus", focusEventHandler)
    view.input && view.input.type === "file" && view.__element__.addEventListener("change", fileEventHandler)
}

const getCaretIndex = (view) => {

    let position = 0;
    const isSupported = typeof window.getSelection !== "undefined";
    if (isSupported) {
        const selection = window.getSelection();
        if (selection.rangeCount !== 0) {
            const range = window.getSelection().getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(view.__element__);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            position = preCaretRange.toString().length;
        }
    }
    return position + 1;
}

const toNumber = (string) => {

    if (!string) return string
    if (typeof string === 'number') return string
    if (isNumber(string)) return parseFloat(string)
    return string
}

const defaultAppEvents = () => {

    var views = window.views
    var global = window.global

    window.addEventListener('popstate', (e) => {
        // this detects back click
    })

    // clicked element
    document.addEventListener('mousedown', e => {

        // droplist
        //global.__clicked__ = views[e.target.id]
        if (global.__clicked__ && views.droplist && views.droplist.__element__ && views.droplist.__element__.contains(global.__clicked__.__element__)) global["droplist-txt"] = global.__clicked__.__element__.innerHTML
    })

    // clicked element
    document.addEventListener('mouseup', e => {

        // droplist
        //global.__clicked__ = views[e.target.id]
        if (global.__clicked__ && views.droplist && views.droplist.__element__ && views.droplist.__element__.contains(global.__clicked__.__element__)) global["droplist-txt"] = global.__clicked__.__element__.innerHTML
    })

    // clicked element
    document.addEventListener('focus', e => {
        global.__focused__ = views[e.target.id]
    })

    // window default event listeners

    window.addEventListener("focus", (e) => {

        // views.root.__element__.click()
        document.activeElement.blur()
    })

    // show icons
    window.addEventListener("load", () => {

        var icons = views.document.__html__.split("id='").slice(1).map((id) => id.split("'")[0]).filter(id => views[id] && views[id].__name__ === "Icon").map(id => views[id])

        icons.map(view => {
            if (view.__element__) {
                view.__element__.style.opacity = view.style.opacity !== undefined ? view.style.opacity : "1"
                view.__element__.style.transition = view.style.transition !== undefined ? view.style.transition : "none"
            }
        })
    })

    window.addEventListener('beforeinstallprompt', function (e) {

        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault()
        console.log('👍', 'beforeinstallprompt', e);

        // Stash the event so it can be triggered later.
        window.global.__installApp__ = e
        //setTimeout(() => { console.log(window.global.__installApp__); window.global.__installApp__.prompt() }, 1000)
    })

    window.addEventListener('appinstalled', () => {
        // Log install to analytics
        console.log('INSTALL: Success')
    })
}

const setData = ({ id, data, __, stack = { addresses: [], returns: [] }, props = {} }) => {

    var view = window.views[id]
    var global = window.global
    
    if (!global[view.form]) return

    // defualt value
    var defValue = data.value
    if (defValue === undefined) defValue = ""

    // path
    var path = data.path
    if (path) path = path.split(".")
    else path = []

    // convert string numbers paths to num
    path = path.map((k) => {
        if (!isNaN(k)) k = parseFloat(k)
        return k
    })

    // keys
    var __dataPath__ = clone(view.__dataPath__)
    var keys = [...__dataPath__, ...path]

    if (data.noValue) keys.push("del()")

    // set value
    kernel({ id, data: { data: global[view.form], path: keys, value: defValue, key: !data.noValue }, stack, props, __ })
}

const fileReader = ({ req, res, _window, lookupActions, stack, props, address, id, e, __, data }) => {

    // files to read
    if (data.files) data.files = [...data.files]
    data.files = toArray(data.file || data.files)
    if (!data.files) return console.log("No data to read!")

    // read type
    var type = data.type
    if (!type && data.url) type = "url"
    else if (!type && data.json) type = "json"
    else if (!type && data.text) type = "text"
    else if (!type && data.buffer) type = "buffer"
    else if (!type && data.binary) type = "binary"
    else if (!type) type = "url"

    // init
    global.__fileReader__ = {
        files: [],
        length: data.files.length,
        count: 0
    };

    data.files.map(file => {

        let reader = new FileReader()
        reader.onload = (e) => {

            global.__fileReader__.count++;

            global.__fileReader__.files.push({
                type: file.type,
                lastModified: file.lastModified,
                name: file.name.split('.').slice(0, -1).join('.'),
                extension: getFileExtension(file.name),
                size: file.size,
                data: e.target.result
            })

            if (global.__fileReader__.count === global.__fileReader__.length) {

                let files = global.__fileReader__.files

                // parse JSON
                if (type === "json") files.map(file => file.data = JSON.parse(file.data))

                let data = { success: true, message: "File read successfully!", data: files.length === 1 ? files[0] : files }

                actions["stackManager()"]({ req, res, _window, lookupActions, stack, props, address, id, e, __, _: data })
            }
        }

        try {

            if (type === "url" || type === "file") reader.readAsDataURL(file)
            else if (type === "text" || type === "json") reader.readAsText(file)
            else if (type === "binary") reader.readAsBinaryString(file)
            else if (type === "buffer") reader.readAsArrayBuffer(file)

        } catch (er) {
            document.getElementById("loader-container").style.display = "none"
        }
    })
}

const root = ({ id, _window, root = {}, stack, props, lookupActions, address, req, res, __ }) => {

    var views = _window ? _window.views : window.views
    var global = _window ? _window.global : window.global

    // path
    var path = root.path || (root.page.includes("/") ? root.page : global.manifest.path.join("/"))

    // page
    var page = root.page && (root.page.includes("/") ? (!root.page.split("/")[0] ? root.page.split("/")[1] : root.page.split("/")[0]) : root.page) || path.split("/")[1] || "main"

    // recheck path
    path = root.path ? path : page === "main" ? "/" : `/${page}`

    // prevs
    global.__prevPath__.push(global.manifest.path.join("/"))
    global.__prevPage__.push(global.manifest.page)

    // page & path
    global.manifest.page = page
    global.manifest.path = path.split("/")

    // params
    root.path = path
    root.page = page

    if (!views.root) return

    var anotherRootAddress = stack.addresses.find(({ data = {} }) => data.id === "root" && data.postUpdate)
    if (anotherRootAddress) {
        anotherRootAddress.blocked = true
        anotherRootAddress.data.elements.map(element => element.remove())
    }

    actions["refresh()"]({ _window, id, req, res, stack, props, lookupActions, address, data: { root, id: "root", action: "ROOT" }, __ })
}

const getNumberAfterString = (str, variable) => {

    if (!str) return false

    // Execute the regular expression on the input string
    let match = str.split(variable)[1];

    // Check if a match is found and return the number
    if (match) {
        return parseInt(match, 10); // Convert the matched string to an integer
    } else {
        return null; // Return null if no match is found
    }
}

const searchDoc = ({ _window, lookupActions, stack, props, address, id, __, req, res, data, object, waits }) => {

    var { address } = actions["addresser()"]({ _window, id, stack, props, __, lookupActions, nextAddress: address, stack, props, type: "data", action: "search()", status: "Start", waits, asynchronous: true, unhold: _window ? true : false, object })
    
    // action
    if (!_window) data.action = `search():[collection=${data.data.collection};doc=${data.data.doc}]:[send():[_]]`
    else data.action = "search()"

    return callServer({ _window, lookupActions, stack, props, address, id, __, req, res, data: { ...data, action: data.action } })
}

const callServer = async ({ _window, lookupActions, stack, props, address, id, req, res, e, __, data, object }) => {

    data.server = data.server || "datastore"

    // call server
    if (!_window) {

        address = actions["addresser()"]({ stack, props, status: "Start", type: "function", nextAddress: address, interpreting: true, asynchronous: true, id, action: "server()", hasWaits: true, object, lookupActions, __ }).address
        return server({ lookupActions, stack, props, address, id, req, __, res, e, data })
    }

    // storage
    else if (data.data.storage) var data = await require("./storage").storage({ _window, req, res, action: data.action, stack, props, data: data.data || {}, __ })

    // database
    else if (data.server === "datastore") var data = require("./database").database({ _window, req, res, action: data.action, stack, props, data: data.data || {}, __ })

    // mail
    else if (data.server === "mail") var data = await mail({ _window, req, res, action: data.action, stack, props, data: data.data || {}, __ })
    
    // awaits
    return actions["stackManager()"]({ _window, lookupActions, stack, props, id, address, e, req, res, _: data, __ })
}

const server = async ({ lookupActions, stack, props, address, id, __, data }) => {

    loader({ show: "loader.show" })

    // headers
    let options = {
        method: "POST",
        headers: {
            ...(data.headers || {}),
            timestamp: (new Date()).getTime(),
            timezone: Math.abs((new Date()).getTimezoneOffset()),
            "Access-Control-Allow-Headers": "Access-Control-Allow-Headers",
            cookies: JSON.stringify(getCookie())
        },
        // body
        body: JSON.stringify({
            __props__: {
                server: data.server,
                lookupActions: data.lookupActions,
                page: window.global.manifest.page,
                path: window.global.manifest.path,
                lookupServerActions: data.lookupServerActions
            },
            action: data.action,
            data: data.data
        })
    }

    // fetch
    let response = await fetch("/", options).then(response => response.json())

    // cookies
    if (response.__props__.cookies) setCookie({ cookies: response.__props__.cookies })

    // update session
    if (response.__props__.session) setCookie({ name: "__session__", value: response.__props__.session })

    // check data for queries
    queriesClient({ global: window.global, data: response })

    // search doc
    if (data.searchDoc && !response.data) {
        window.global.__queries__[data.data.collection] = window.global.__queries__[data.data.collection] || {}
        window.global.__queries__[data.data.collection][data.data.doc] = false
    }

    loader({})

    let my__ = [response, ...__]

    address.params.__ = my__

    // address toView document
    address = actions["addresser()"]({ stack, props, status: "Start", type: "function", function: "view", nextAddress: address, lookupActions, __: my__ }).address    
    
    return actions["view()"]({ stack, props, address, lookupActions, __: my__, data: { view: { view: "@view.application.browser" } } })
}

const loader = ({ _window, show }) => {

    if (_window) return

    if (!document.getElementById("loader-container")) return
    document.getElementById("loader-container").style.display = show ? "flex" : "none"
}

const mountData = ({ _window, object, view, views, global, key, id, stack, lookupActions, params, props, __, e, req, res }) => {

    // data without doc => push to underscore
    if (key === "data" && view.data !== undefined && !view.__interpretingSubparams__) {

        view.__.unshift(view.data)
        delete view.data
        delete params.data

        if (view.__loop__) {
            view.__underscoreLoopIndex__ = view.__underscoreLoopIndex__ || 0
            view.__underscoreLoopIndex__ += 1
        }
    }

    // doc or (data with prev doc)
    else if (key === "form" && view.form !== undefined) {

        view.__dataPath__ = []
        //view.form = view.form || generate()
        //if (key === "data") global[view.form] = view.data
        /*else */global[view.form] = global[view.form] || {}
        /*if (key === "form") */delete view.data
    }

    // mount path directly when found
    else if (key === "path" && view.path !== undefined) {

        var dataPath = view.path
        // console.log(dataPath);
        // setup doc
        if (!view.form) {

            view.form = generate()
            global[view.form] = {}
        }

        // list path
        var myPath = (typeof dataPath === "string" || typeof dataPath === "number") ? dataPath.toString().split(".") : dataPath || []

        // push path to __dataPath__
        view.__dataPath__.push(...myPath)
    }

    // assign view params to new view ID
    else if (view.id !== id && views[id]) {

        var newID = view.id

        // remove from initial index list
        if (views[view.parent]) {
            var initialIDIndex = views[view.parent].__childrenInitialIDRef__.indexOf(id)
            if (initialIDIndex > -1) views[view.parent].__childrenInitialIDRef__.splice(initialIDIndex, 1)
            views[view.parent].__childrenInitialIDRef__.push(newID)
        }

        if (views[newID] && newID !== "root") newID += "_" + generate()
        Object.assign(views, { [newID]: views[id] || view })
        delete views[id]
        view.id = id = newID
        view.__customID__ = true
    }
}

const queriesClient = ({ global, data }) => {
    Object.entries(data).map(([key, data]) => {
        if (typeof data === "object" && !Array.isArray(data)) {
            if (data.__props__ && data.__props__.collection && data.__props__.doc) {
                global.__queries__[data.__props__.collection] = global.__queries__[data.__props__.collection] || {}
                // override
                if (global.__queries__[data.__props__.collection][data.__props__.doc] && global.__queries__[data.__props__.collection][data.__props__.doc].__props__.secured) override(global.__queries__[data.__props__.collection][data.__props__.doc], data)
                // mount
                else global.__queries__[data.__props__.collection][data.__props__.doc] = data
            } else queriesClient({ global, data })
        }
    })
}

const vcard = ({ res, data: { info, firstName, middleName, lastName, org, title, img, phone, address, email } }) => {

    let vcard = `BEGIN:VCARD
    VERSION:3.0
    N:${info}
    FN:${firstName}
    MN:${middleName}
    LN:${lastName}
    ORG:${org}
    TITLE:${title}
    PHOTO;TYPE=JPEG;ENCODING=b:[${img}]
    TEL;TYPE=WORK,VOICE:${phone}
    ADR;TYPE=WORK,PREF:;;${address}
    EMAIL:${email}
    REV:${new Date().toISOString()}
    END:VCARD`;

    downloadToFile(vcard, 'vcard.vcf', 'text/vcard');
}

const downloadToFile = (content, filename, contentType) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });

    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();

    URL.revokeObjectURL(a.href);
}

const qrcode = async ({ _window, id, req, res, data: qrData, __, e, stack, props, lookupActions, address }) => {

    let QRCode = require("easyqrcodejs")

    // get image
    let view = window.views[qrData.id], imageEl
    if (view) imageEl = view.__element__
    
    let qrcode = new QRCode(document.getElementById(qrData.id), qrData)
    let data = { message: "QR generated successfully!", data: qrcode, success: true }

    console.log("QR", data)

    actions["stackManager()"]({ _window, lookupActions, id, e, asyncer: true, address, stack, props, req, res, __, _: data })
}

const getFileExtension = (fileName) => {
    let regex = new RegExp('[^.]+$');
    let extension = fileName.match(regex);
    return extension[0]
}

module.exports = {
    actions, kernel, toValue, toParam, reducer, toApproval, toAction, toLine, addEventListener,
    getDeepChildren, getDeepChildrenId, calcSubs, calcDivision, calcModulo, emptySpaces, isNumber, printAddress, endAddress, resetAddress,
    closePublicViews, updateDataPath, remove, initView, getViewParams, removeView, defaultEventHandler,
    toNumber, defaultAppEvents, clearActions, server, eventExecuter, starter, loader
}