(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports={
    "droplist": [
        {
            "event": "[keydown:input()??e().key=Escape]?#close droplist;__droplistMouseleaveTimer__:()=0;():droplist.mouseleave()"
        },
        {
            "event": "[click??__droplistPositioner__:()!=().id];[focus??__droplistPositioner__:()!=().id]?#open droplist on click;clearTimer():[__droplistTimer__:()];if():[__droplistPositioner__:()!=().id]:[__keyupIndex__:()=0;__droplistPositioner__:()=().id;droplist()]:[__droplistMouseleaveTimer__:()=0;():droplist.mouseleave()]"
        },
        {
            "event": "keydown:input()?#choose item on enter;():droplist.children().[__keyupIndex__:()].click();[():droplist.mouseleave()?e().key=Tab]?e().key=Enter||=Tab"
        },
        {
            "event": "mouseenter?#open on hoverin;clearTimer():[.droplistLeaved];if():[__droplistMouseenterer__:()!=().id]:[click();__droplistMouseenterer__:()=().id]?droplist.hoverable"
        },
        {
            "event": "mouseleave?#close on hoverout;__droplistMouseleaveTimer__:()=0;():droplist.mouseleave()?droplist.hoverable"
        },
        {
            "event": "input:input()?#search droplist;droplist()?droplist.searchable"
        },
        {
            "event": "keydown:input()?#moveup/down items;():droplist.children().[__keyupIndex__:()||0].mouseleave();__keyupIndex__:()=if():[e().keyCode=40]:[__keyupIndex__:()+1]:[__keyupIndex__:()-1];():droplist.children().[__keyupIndex__:()].mouseenter()?e().keyCode=40||=38;__droplistPositioner__:();if():[e().keyCode=38]:[__keyupIndex__:()>0].elif():[e().keyCode=40]:[__keyupIndex__:()<():droplist.children().len()-1]"
        }
    ],
    "hover": [
        {
            "event": "mouseenter?hover.style.keys()._():[style().[_]=hover.style.[_]]?!hover.disable"
        },
        {
            "event": "mouseleave?hover.style.keys()._():[style().[_]=style.[_]||null]?!hover.disable"
        }
    ],
    "mininote": [
        {
            "event": "click?():mininote-text.txt()=[.mininote.text||.mininote.note||''];clearTimeout():[mininote-timer:()];():mininote.style():[opacity=1;transform='scale(1)'];mininote-timer:()=():root.timer():[():mininote.style():[opacity=0;transform=scale(0)]]:[.mininote.timer||3000]"
        }
    ],
    "tooltip": [
        {
            "event": "mousemove?if():[!__tooltipTimer__:()]:[__tooltipTimer__:()=timer():[():tooltip.style().opacity=1?mouseentered]:500];():'tooltip-text'.txt()=[().tooltip.text]();():tooltip.position():[positioner=mouse;placement=[().tooltip.placement||left];distance=[().tooltip.distance||0]]?mouseentered;[().tooltip.text]()"
        },
        {
            "event": "mouseleave?mouseentered=false;clearTimer():[__tooltipTimer__:()];__tooltipTimer__:().del();():tooltip.style().opacity=0"
        },
        {
            "event": "mouseenter?mouseentered=true"
        }
    ]
}
},{}],2:[function(require,module,exports){
const capitalize = (string, minimize) => {
  if (typeof string !== "string") return string

  if (minimize) return string
    .split(" ")
    .map((string) => string.charAt(0).toLowerCase() + string.slice(1))
    .join(" ")

  return string
      .split(" ")
      .map((string) => string.charAt(0).toUpperCase() + string.slice(1))
      .join(" ")
}

const capitalizeFirst = (string, minimize) => {
  if (typeof string !== "string") return string

  if (minimize) return string.charAt(0).toLowerCase() + string.slice(1)

  return string.charAt(0).toUpperCase() + string.slice(1)
}

module.exports = {capitalize, capitalizeFirst}

},{}],3:[function(require,module,exports){
const clone = (obj) => {
  
  if (!obj) return obj
  
  var copy
  if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") return obj
  else if (Array.isArray(obj)) copy = [...obj.map(obj => clone(obj))]
  else if (Object.keys(obj).length === 0) copy = {}
  else {
    copy = {}
    Object.entries(obj).map(([key, value]) => {
      if (key !== "element") copy[key] = typeof value === "object" ? clone(value) : value
      else copy[key] = value
    })
  }

  return copy
}

module.exports = {clone}

},{}],4:[function(require,module,exports){
const { decode } = require("./decode")
const { toArray } = require("./toArray")

const _colors = ["#a35521", "#1E90FF", "#FF4500", "#02ad18", "#5260FF", "#bf9202", "#6b6b6e", "#e649c6"]
const arabic = /[\u0600-\u06FF\u0750-\u077F]/
const english = /[a-zA-Z]/

const colorize = ({ _window, string, start = "[", index = 0, colors = _colors }) => {

  colors = toArray(colors)
  
  if (index === 8) index = 1
  if (typeof string !== "string") return string

  string = string.replaceAll("<", "&#60;").replaceAll(">", "&#62;")
  string = string.replaceAll("[]", "__map__")

  // comment
  if (string.charAt(0) === "#" || string.includes("?#") || string.includes(";#") || string.includes("[#")) {

    let string0 = "", operator = ""
    if (string.split("?#")[1]) {

      string0 = string.split("?#")[0]
      operator = "?"

    } else if (string.split(";#")[1]) {

      string0 = string.split(";#")[0]
      operator = ";"

    } else if (string.split("[#")[1]) {

      string0 = string.split("[#")[0]
      operator = "["
    }

    let key = !operator ? string : string.split(string0 + operator).slice(1).join(string0 + operator)

    // comment
    let comment = key.split("?")[0].split(";")[0]
    // [params;#comment]
    if (comment.split("]")[1] !== undefined) comment = key.split("]")[0]

    let string1 = key.split(comment).slice(1).join(comment)
    string1 = colorize({ _window, string: string1, index, colors })

    if (string0) string0 = colorizeCoded({ _window, index, string: string0, colors })

    string = string0 + operator + `<span contenteditable style="background-color:#00000000; color: green; white-space:nowrap">${decode({ _window, string: comment })}</span>` + string1

  } else string = colorizeCoded({ _window, index, string, colors })

  if (index !== 0) string = `<span contenteditable style="background-color:#00000000; color:${colors[index]}; white-space:nowrap">${string}</span>`

  // ?
  string = string.replaceAll("?", "<u>?</u>").replaceAll("__map__", `<span style="color:blue">[]</span>`)

  return string
}

const colorizeCoded = ({ _window, index, string, colors }) => {

  let global = _window ? _window.global : window.global
  let slicer = string.split("@$")
  if (slicer.length < 2) return string
  if (!global.__refs__["@$" + slicer[1].slice(0, 5)]) return (slicer.slice(0, 2).join("@$") + (slicer[2] ? colorize({ _window, index, string: "@$" + slicer.slice(2).join("@$"), colors }) : ""))
  
  let text = ""
  let string0 = slicer[0]
  let string1 = colorize({ _window, index, string: slicer.slice(1).join("@$").slice(5), colors })
  let reference = global.__refs__["@$" + slicer[1].slice(0, 5)]

  if (typeof reference === "object") {

    let data = ""
    if (reference.type === "code") data = colorize({ _window, string: "[" + reference.data + "]", index: index + 1, colors })
    else data = `<span contenteditable style="background-color:#00000000; color:${colors[index + 1]}; white-space:nowrap">'${reference.data}'</span>`

    text += string0 + data + string1
  }

  return text || string
}

module.exports = { colorize }
},{"./decode":9,"./toArray":39}],5:[function(require,module,exports){
const setCookie = ({ _window, name = "", value, expiry = 360, cookies }) => {

  if (_window) return _window.global.manifest.cookies[name] = value 

  var cookie = document.cookie || "", host = window.global.manifest.host
  
  if (cookies) return document.cookie = `${host}=${JSON.stringify(cookies)};path=/`
  
  var decodedCookie = decodeURIComponent(cookie)
  var hostSession = JSON.parse((decodedCookie.split('; ').find(cookie => cookie.split("=")[0] === host) || "").split("=").slice(1).join("=") || "{}")

  hostSession[name] = value
  document.cookie = `${host}=${JSON.stringify(hostSession)};path=/`
}

const getCookie = ({ name, req, _window } = {}) => {
  
  if (_window) {
    if (!name) return _window.global.manifest.cookies
    return _window.global.manifest.cookies[name]
  }

  var host = window.global.manifest.host
  var cookie = document.cookie || ""
  var decodedCookie = decodeURIComponent(cookie)
  var hostSession = JSON.parse((decodedCookie.split('; ').find(cookie => cookie.split("=")[0] === host) || "").split("=").slice(1).join("=") || "{}")

  if (!name) return hostSession
  return hostSession[name]
}

const eraseCookie = ({ _window, name }) => {

  if (_window) return delete _window.global.manifest.cookies[name]
  var host = window.global.manifest.host
  var cookie = document.cookie || ""
  var decodedCookie = decodeURIComponent(cookie)
  var hostSession = JSON.parse((decodedCookie.split('; ').find(cookie => cookie.split("=")[0] === host) || "").split("=").slice(1).join("=") || "{}")
  
  delete hostSession[name]

  document.cookie = `${host}=${JSON.stringify(hostSession)};path=/`
}

function parseCookies (request, host) {

  const list = {};
  const cookieHeader = request.headers?.cookie;
  
  if (!cookieHeader) return request.cookies = list;

  cookieHeader.split(`;`).forEach(function(cookie) {
    let [name, ...rest] = cookie.split(`=`);
    name = name?.trim();
    if (!name) return;
    const value = rest.join(`=`).trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });

  request.cookies = request.headers.cookie = JSON.parse(list[host] || "{}")
}

module.exports = {setCookie, getCookie, eraseCookie, parseCookies}
},{}],6:[function(require,module,exports){
module.exports = {
  counter: ({ length = 0, counter = 0, end, reset = "daily", timer = 0 }) => {

    counter = parseInt(counter)
    var _date = new Date(), timestamp

    if (reset === "daily") timestamp = (new Date(_date.setHours(0,0,0,0))).getTime()
    else if (reset === "weekly") timestamp = (new Date((new Date(_date.getDate() - _date.getDay() + (_date.getDay() === 0 ? -6 : 1))).setHours(0,0,0,0))).getTime()
    else if (reset === "monthly") timestamp = (new Date(new Date(_date.setMonth(_date.getMonth(), 1)).setHours(0,0,0,0))).getTime()
    else timestamp = (new Date(_date.setHours(0,0,0,0))).getTime()

    var diff = timer - timestamp, _reset
    if (reset === "daily") _reset = 60*60*24*1000 - diff <= 0
    else if (reset === "weekly") _reset = 7*60*60*24*1000 - diff <= 0
    else if (reset === "monthly") _reset = ((new Date(_date.getFullYear(), _date.getMonth() + 1, 0)).getDate()*60*60*24*1000) - diff <= 0
    else _reset = 60*60*24*1000 - diff <= 0

    if (_reset) counter = 0

    if (end && end === counter) counter = 0
    counter = counter + 1

    var _counter = counter + ""
    if (length && (length - _counter.length < 0)) _counter = "1"

    var diff = length - _counter.length

    while (diff > 0) {
      _counter = "0" + _counter
      diff -= 1
    }

    // console.log({ counter: _counter, length, reset, timer: timestamp });
    return { counter: _counter, length, reset, timer: timestamp }
  }
}
},{}],7:[function(require,module,exports){
module.exports = {
  "userSelect": "user-select",
  "inlineSize": "inline-size",
  "clipPath": "clip-path",
  "flexWrap": "flex-wrap",
  "wordWrap": "word-wrap",
  "wordBreak": "word-break",
  "verticalAlign": "vertical-align",
  "borderBottom": "border-bottom",
  "borderLeft": "border-left",
  "borderRight": "border-right",
  "borderTop": "border-top",
  "paddingBottom": "padding-bottom",
  "paddingLeft": "padding-left",
  "paddingRight": "padding-right",
  "paddingTop": "padding-top",
  "marginBottom": "margin-bottom",
  "marginLeft": "margin-left",
  "marginRight": "margin-right",
  "marginTop": "margin-top",
  "fontFamily": "font-family",
  "fontSize": "font-size",
  "fontStyle": "font-style",
  "fontWeight": "font-weight",
  "textDecoration": "text-decoration",
  "lineHeight": "line-height",
  "letterSpacing": "letter-spacing",
  "textOverflow": "text-overflow",
  "whiteSpace": "white-space",
  "backgroundImage": "background-image",
  "backgroundColor": "background-color",
  "zIndex": "z-index",
  "boxShadow": "box-shadow",
  "borderRadius": "border-radius",
  "borderColor": "border-color",
  "zIndex": "z-index",
  "gapX": "column-gap",
  "gapY": "row-gap",
  "alignItems": "align-items",
  "alignSelf": "align-self",
  "justifyContent": "justify-content",
  "justifySelf": "justify-self",
  "userSelect": "user-select",
  "userDrag": "user-drag",
  "textAlign": "text-align",
  "pointerEvents": "pointer-events",
  "flexDirection": "flex-direction",
  "flexGrow": "flex-grow",
  "flexShrink": "flex-shrink",
  "maxWidth": "max-width",
  "minWidth": "min-width",
  "maxHeight": "max-height",
  "minHeight": "min-height",
  "overflowX": "overflow-x",
  "overflowY": "overflow-y",
  "rowGap": "row-gap",
  "columnGap": "column-gap",
  "pageBreakInside": "page-break-inside",
  "pageBreakBefore": "page-break-before",
  "pageBreakAfter": "page-break-after",
  "gridTemplateColumns": "grid-template-columns",
  "gridAutoColumns": "grid-auto-columns",
  "gridTemplateRows": "grid-template-rows",
  "gridAutoRows": "grid-auto-columns",
  "writingMode": "writing-mode"
}
},{}],8:[function(require,module,exports){
const { toParam } = require("./kernel");

module.exports = {
    csvToJson: ({ id, e, file, onload, __ }) => {
        
        var reader = new FileReader();
        reader.onload = function () {
            var result = []
            
            // xlsx
            if (e.target.files[0].name.includes(".xlsx")) {

                let data = reader.result
                let workbook = XLSX.read(data,{type:"binary"})
                
                workbook.SheetNames.forEach(sheet => {
                    result = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
                    console.log(result);
                })

            } else if (e.target.files[0].name.includes(".csv")) {

                // csv
                var lines = reader.result.split("\n")
                var headers=lines[0].split(",").map(header => header.replace(/\r?\n|\r/g, ""))
                console.log(headers);
                
                for(var i=1; i<lines.length; i++) {

                    var obj = {}
                    var currentline=lines[i].split(",")

                    for(var j=0; j < headers.length; j++){
                        if (currentline[j] !== undefined) obj[headers[j]] = currentline[j].toString().replace(/\r?\n|\r/g, "")
                    }

                    result.push(obj)
                }
            }

            /* Convert the final array to JSON */
            console.log(result)
            window.views[id].file = window.global.file = { data: result, message: "Data converted successfully!" }
            toParam({ id, e, data: onload, object: [views[id]], __: [window.global.file, ...__] })
        };

        // start reading the file. When it is done, calls the onload event defined above.
        reader.readAsBinaryString(file || e.target.files[0]);
    }
}
},{"./kernel":30}],9:[function(require,module,exports){
const decode = ({ _window, string }) => {

  const global = _window ? _window.global : window.global
  if (typeof string !== "string") return string

  string.split("@$").map((state, i) => {

    if (i === 0) return string = state

    let code = state.slice(0, 5)
    let after = state.slice(5)
    let statement = (global.__refs__[`@$${code}`] || {}).data

    let prev, next
    if ((global.__refs__[`@$${code}`] || {}).type === "text") {
      prev = "'"
      next = "'"
    } else {
      prev = "["
      next = "]"
    }

    statement = decode({ _window, string: statement })
    string += prev + statement + next + after
  })

  return string
}

module.exports = { decode }

},{}],10:[function(require,module,exports){
const { clone } = require("./clone")
const { jsonToBracket } = require("./jsonToBracket")
const { toLine, kernel, toValue, actions } = require("./kernel")

const droplist = ({ id, e, __, stack, props, lookupActions, address, object }) => {
  
  var views = window.views
  var global = window.global
  var view = views[id]

  if (!view.droplist) return
  if (typeof view.droplist.searchable === "string" || view.droplist.searchable === true || view.droplist.searchable === undefined) view.droplist.searchable = {}
  if (typeof view.droplist.filterable === "string" || view.droplist.filterable === true) view.droplist.filterable = {}

  // closedroplist
  var mouseleaveEvent = new Event("mouseleave")
  views.droplist.__element__.dispatchEvent(mouseleaveEvent)
  
  // items
  var items = clone(view.droplist.items) || []
  var __dataPath__ = view.droplist.path !== undefined ? (Array.isArray(view.droplist.path) ? view.droplist.path : view.droplist.path.split(".")) : view.__dataPath__
  var form = view.droplist.form || view.form

  // init droplist
  var droplistView = { ...global.__queries__["view.application"].droplist, children: [], __dataPath__, form, __parent__: "root", __, __childIndex__: views.droplist.__childIndex__, __viewPath__: ["droplist"], __customViewPath__: ["server", "document", "root", "droplist"], __lookupActions__: [...view.__lookupActions__] }

  // input id
  var inputID = toValue({ id, data: "input().id||().id", object })
  var text = views[inputID].__element__.value || views[inputID].__element__.innerText

  // items
  if (typeof items === "string") items = toValue({ id, data: items, lookupActions, __: view.__, props, stack, object })
  
  // filterable
  if (view.droplist.filterable && text) {
      
    items = items.filter(item => view.droplist.filterable.any 
      ? item.toString().toLowerCase().includes(text.toString().toLowerCase())
      : item.toString().toLowerCase().slice(0, text.toString().length) === text.toString().toLowerCase()
    )
    
    global.__keyupIndex__ = 0
  }

  if (!text) global.__keyupIndex__ = 0
  
  // children
  if (items && items.length > 0) {
    
    items = items.filter(item => item !== undefined && item !== '')
    droplistView.children.push(...clone(items).map(item => {

      if (typeof item === "string" || typeof item === "number") item = { text: item }
      item.text = item.text !== undefined ? `${item.text}` : ""

      if (item.icon) {
  
        if (typeof item.icon === "string") item.icon = { name: item.icon }
        if (typeof item.text === "string") item.text = { text: item.text }
        
        return ({
          view: `View?style:[minHeight=3rem;padding=0 1rem;gap=1rem];hover.style.backgroundColor=#eee;${jsonToBracket(view.droplist.item || {})};${jsonToBracket(item || {})};class=flex align-items pointer ${item.class || ""}`,
          children: [{
            view: `View?style:[height=inherit;width=fit-content];${jsonToBracket(item.icon.container || {})};class=flexbox ${(item.icon.container || {}).class || ""}`,
            children: [{
              view: `Icon?style:[color=#666;fontSize=1.7rem];${jsonToBracket(view.droplist.item && view.droplist.item.icon || {})};${jsonToBracket(view.droplist.icon || {})};${jsonToBracket(item.icon || {})};class=flexbox ${(item.icon || {}).class || ""}`
            }]
          }, {
            view: `Text?style:[fontSize=1.3rem;width=100%];${jsonToBracket(view.droplist.item && view.droplist.item.text || {})};${jsonToBracket(view.droplist.text || {})};${jsonToBracket(item.text)};class=flex align-center ${(item.text || {}).class || ""};click:[():[__droplistPositioner__:()].():[txt()=txt();data()=txt()]?!():${id}.droplist.preventDefault]?${item.text.text ? true : false}`
          }]
        })
  
      } else {
        
        return ({
          view: `Text?style:[minHeight=3rem;padding=0 1rem;fontSize=1.3rem;width=100%];[mouseenter?siblings().():[style().backgroundColor=#00000000];style().backgroundColor=#eee];${jsonToBracket(view.droplist.item && view.droplist.item.text || {})};${jsonToBracket(view.droplist.text || {})};${jsonToBracket(item)};${jsonToBracket(view.droplist.item)};class=flex align-center pointer ${item.class || ""};click:[():[__droplistPositioner__:()].():[txt()=..txt();data()=..txt()]?!():${id}.droplist.preventDefault]`,
        })
      }
    }))
    
  } else droplistView.children = []
  
  droplistView.positioner = id

  actions["refresh()"]({ stack, lookupActions, __, address, id, data: { id: "droplist", view: droplistView } })
  var string = "().droplist.style.keys()._():[():droplist.style().[_]=().droplist.style.[_]];():droplist.position():[positioner=().id;[().droplist].flat()];():droplist.style():[opacity=1;transform='scale(1)';pointerEvents=auto]"
  actions["line()"]({ stack, lookupActions, __, address, id, object, data: { string } })
  
  droplistView = views.droplist
  
  // searchable
  var mouseEnterItem = () => {

    var _index, onlyOne

    if (text) {
      
      _index = (items || []).findIndex(item => view.droplist.searchable.any 
        ? item.toString().toLowerCase().includes(text.toString().toLowerCase())
        : item.toString().toLowerCase().slice(0, text.toString().length) === text.toString().toLowerCase()
      )

      // fills input value
      onlyOne = (items || []).filter(item => view.droplist.searchable.any 
        ? item.toString().toLowerCase().includes(text.toString().toLowerCase())
        : item.toString().toLowerCase().slice(0, text.toString().length) === text.toString().toLowerCase()
      ).length === 1
      
      if (_index !== -1) {
        
        if (onlyOne && view.droplist.autoFill) {
          
          if (e.inputType !== "deleteContentBackward" && e.inputType !== "deleteContentForward" && e.inputType !== "deleteWordBackward" && e.inputType !== "deleteWordForward") {

            if (inputID) {

              views[inputID].__element__.value = views[inputID].prevValue = items[_index]
              views[inputID].contenteditable = false

            } else {

              view.__element__.innerHTML = view.prevValue = items[_index]
              view.contenteditable = false
            }
            
            
          } else if (view.contenteditable === false || views[inputID].contenteditable === false) {
            
            if (inputID) {

              views[inputID].__element__.value = items[_index].slice(0, -1)
              views[inputID].contenteditable = true

            } else {

              view.__element__.innerHTML = items[_index].slice(0, -1)
              view.contenteditable = true
            }
          }
        }

        if (view.droplist.autoFill) kernel({ id, data: { path: droplistView.__dataPath__, key: true, value: items[_index], data: global[droplistView.form] }, __ })
        global.__keyupIndex__ = _index
      }
    }

    global.__keyupIndex__ = global.__keyupIndex__ || 0
    droplistView.__element__.children.length > 0 && droplistView.__element__.children[global.__keyupIndex__].dispatchEvent(new Event("mouseenter"))
  }

  global.__droplistTimer__ = setTimeout(mouseEnterItem, 100)
}

module.exports = { droplist }
},{"./clone":3,"./jsonToBracket":29,"./kernel":30}],11:[function(require,module,exports){
const encoded = (string) => {
    if (typeof string !== "string") return false
    return (string.slice(0, 2) === "@$" && string.length === 7)
}

module.exports = { encoded }
},{}],12:[function(require,module,exports){
module.exports=[
  "mouseenter", "mouseleave", "menter", "mleave", "mouseover", "mousemove", "mousedown", "mouseup", "touchstart", 
  "touchend", "touchmove", "touchcancel", "click", "change", "focus", "blur", "keypress", "keyup", 
  "keydown", "scroll", "beforeLoading", "loaded", "controls", "children", "child", "change", "entry", 
  "enter", "longclick", "sibling", "siblings", "prevSiblings", "prevSibling", "unload", "undo", "storage",
  "resize", "redo", "popstate", "online", "offline", "message", "load", "languagechange",
  "error", "afterprint", "beforeprint", "beforeunload", "paste", "auxclick", "hover"
]
},{}],13:[function(require,module,exports){
const {isParam} = require("./isParam")

module.exports = {
    executable: ({ _window, string, encoded = true }) => {
        return typeof string === "string" && (string.includes("()") || (encoded ? string.slice(0, 2) === "@$" || isParam({ _window, string }) : false) || string.includes("_"))
    }
}
},{"./isParam":28}],14:[function(require,module,exports){
module.exports = {
    exportJson: ({ data, name }) => {
        
        var dataStr = JSON.stringify(data, null, 2)
        var dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

        var exportFileDefaultName = `${name || `exportDate-${(new Date()).getTime()}`}.json`

        var linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
        // linkElement.delete()
    }
}
},{}],15:[function(require,module,exports){
const focus = ({ id }) => {

  var view = window.views[id]
  if (!view) return

  var isInput = view.__name__ === "Input" || view.__name__ === "Textarea"
  if (isInput) view.__element__.focus()
  else {
    if (view.__element__) {
      let childElements = view.__element__.getElementsByTagName("INPUT")
      if (childElements.length === 0) {
        childElements = view.__element__.getElementsByTagName("TEXTAREA")
      }
      if (childElements.length > 0) {
        childElements[0].focus()

        var _view = window.views[childElements[0].id]
        // focus to the end of input
        var value = _view.__element__.value
        _view.__element__.value = ""
        _view.__element__.value = value

        return
      } else view.__element__.focus()
    }
  }

  // focus to the end of input
  var value = view.__element__.value
  view.__element__.value = ""
  view.__element__.value = value
}

module.exports = {focus}

},{}],16:[function(require,module,exports){
const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
const numbers = "1234567890"

const generate = (params = {}) => {

  var { length, number, unique, universal, timestamp } = params

  var result = "", chars = number ? numbers : characters

  var charactersLength = chars.length
  var time = (new Date()).getTime() + ""

  if (unique) length = 26
  else if (!unique && !length) length = 5

  if (universal)
    for (let i = 0; i < 13; i++) {
      result += chars.charAt(Math.floor(Math.random() * charactersLength)) + chars.charAt(Math.floor(Math.random() * charactersLength))
      result += time[i]
    }

  else
    for (let i = 0; i < (unique && length >= 26 ? length - 13 : length); i++) {
      result += chars.charAt(Math.floor(Math.random() * charactersLength))
      if (unique && length >= 26 && i <= 13) result += time[i]
    }

    // timestamp => ex. xxxxxxxxxxxxxxxT(xxxxxxxxxxxxx:timestamp)
    if (typeof timestamp === "number") result += "T" + timestamp
    else if (timestamp) result += "T" + time

  return result
}

module.exports = { generate }

},{}],17:[function(require,module,exports){
module.exports = ({ el, id }) => {
  var view = window.views[id]
  el = el || view.__element__

  // crossbrowser version
  var box = el.getBoundingClientRect();

  var body = document.body;
  var docEl = document.documentElement;

  var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
  var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

  var clientTop = docEl.clientTop || body.clientTop || 0;
  var clientLeft = docEl.clientLeft || body.clientLeft || 0;
  
  var height = el.offsetHeight;
  var width = el.offsetWidth;
  var top  = box.top + scrollTop - clientTop;
  var left = box.left + scrollLeft - clientLeft;
  var right = window.screen.availWidth - (left + width);
  var bottom = window.screen.availHeight - (top + height);

  return { top: Math.round(top), left: Math.round(left), right: Math.round(right), bottom: Math.round(bottom), height: Math.round(height), width: Math.round(width) };
}
},{}],18:[function(require,module,exports){
module.exports = {
    getDateTime: (time, format) => {
        
        var sec = parseInt(time.getSeconds())
        var min = parseInt(time.getMinutes())
        var hrs = parseInt(time.getHours())
        var day = parseInt(time.getDate())
        var month = parseInt(time.getMonth()) + 1
        var year = parseInt(time.getFullYear())
        
        if (sec < 10) sec = "0" + sec
        if (min < 10) min = "0" + min
        if (hrs < 10) hrs = "0" + hrs
        if (day < 10) day = "0" + day
        if (month < 10) month = "0" + month
        if (year < 10) year = "0" + year
        
        return format === "yyyy-mm-ddThh-mm-ss" && `${year}-${month}-${day}T${hrs}:${min}:${sec}`
    }
}
},{}],19:[function(require,module,exports){
module.exports = {
    getDaysInMonth: (stampTime) => {
        return new Date(stampTime.getFullYear(), stampTime.getMonth() + 1, 0).getDate()
    }
}
},{}],20:[function(require,module,exports){
const getType = (value) => {
  const { emptySpaces, isNumber } = require("./kernel")

  if (typeof value === "boolean" || value === "true" || value === "false") return "boolean"
  if (typeof value === "object" && Array.isArray(value)) return "list"
  if (typeof value === "object") return "map"
  if (typeof value === "function") return "function"
  if (typeof value === "number" || (typeof value === "string" && isNumber(value))) {
    
    if ((value + "").length === 13 && (value + "").charAt(0) !== "0") return "timestamp"
    if (typeof value === "number") return "number"
    return "text"
  }
  if (typeof value === "string") return "text"
}
module.exports = { getType }
},{"./kernel":30}],21:[function(require,module,exports){
const nthParent = ({ _window, nth, o }) => {

  if (!o.__view__) return 
  var views = _window ? _window.views : window.views

  var n = 0, parent = o.id
  
  while (n < nth) {
    if (views[parent]) parent = views[parent].__parent__
    else parent = undefined
    n++
  }
  
  return parent ? views[parent] : parent
}

const nthNext = ({ _window, nth, o }) => {

  if (!o.__view__) return 
  var views = _window ? _window.views : window.views

  var n = 0, next = o.id
  while (n < nth) {
    if (views[next]) next = (views[views[next].__parent__].__childrenRef__[(views[next].__index__ === undefined ? views[next].__initialIndex__ : views[next].__index__) + 1] || {}).id
    n++
  }

  return views[next]
}

const nthPrev = ({ _window, nth, o }) => {

  if (!o.__view__) return 
  var views = _window ? _window.views : window.views

  var n = 0, prev = o.id
  
  while (n < nth) {
  
    if (views[prev]) prev = (views[views[prev].__parent__].__childrenRef__[(views[prev].__index__ === undefined ? views[prev].__initialIndex__ : views[prev].__index__) - 1] || {}).id
    n++
  }

  return views[prev]
}

const getAllParents = ({ _window, id }) => {

  var views = _window ? _window.views : window.views
  var view = views[id]
  if (!view.__parent__) return []

  var parentId = view.__parent__
  var all = [views[parentId]]

  all.push(...getAllParents({ _window, id: parentId }))

  return all
}

module.exports = { nthParent, getAllParents, nthNext, nthPrev }
},{}],22:[function(require,module,exports){
const { setCookie } = require("./cookie")
const { defaultAppEvents, initView, eventExecuter, starter, addEventListener, loader } = require("./kernel")
const { openStack, endStack } = require("./stack")

window.views = JSON.parse(document.getElementById("views").textContent)
window.global = JSON.parse(document.getElementById("global").textContent)

// test
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
loader({ show: false })
},{"./cookie":5,"./kernel":30,"./stack":38}],23:[function(require,module,exports){
const arabic = /[\u0600-\u06FF\u0750-\u077F]/
const english = /[A-Za-z]/

const isArabic = ({ id, value, text }) => {

  var view = window.views[id]
  if (!view || !view.__element__) return
  text = text || value || view.__element__.value || view.__element__.innerHTML
  if (!text) return

  var isarabic = arabic.test(text)
  var isenglish = english.test(text)

  if (isarabic && !isenglish) {

    view.__element__.classList.add("arabic")
    view.__element__.style.textAlign = view.__element__.style.textAlign || "right"
    if (view.__name__ !== "Input") view.__element__.innerHTML = text.toString().replace(/\d/g, d =>  '٠١٢٣٤٥٦٧٨٩'[d])
    else view.__element__.value = text.toString().replace(/\d/g, d =>  '٠١٢٣٤٥٦٧٨٩'[d])
    if (view["placeholder-ar"]) view.__element__.placeholder = view["placeholder-ar"]

  } else {

    if (view.__element__.className.includes("arabic")) view.__element__.style.textAlign = view.__element__.style.textAlign || "right"
    view.__element__.classList.remove("arabic")
    if (view["placeholder"]) view.__element__.placeholder = view["placeholder"]
  }

  return isarabic && !isenglish
}

module.exports = { isArabic }

},{}],24:[function(require,module,exports){
const isCalc = ({ _window, string }) => {

    if (typeof string !== "string") return false
    
    const global = _window ? _window.global : window.global
    if (string.slice(0, 2) === "@$" && string.length === 7) string = global.__refs__[string].data

    // recheck after decoding
    if (typeof string !== "string") return false

    // tested before
    if (global.__calcTests__[string]) return true
    else if (global.__calcTests__[string] === false) {
        delete global.__calcTests__[string]
        return false
    }

    if (!string.includes(",") && ((string.includes("/") && string.split("/")[1] !== "") || (string.includes("%") && string.split("%")[1] !== "") || string.includes("||") || string.includes("*") || string.includes("+") || string.includes("-")))
    return true

    else return false
}

module.exports = { isCalc }
},{}],25:[function(require,module,exports){
module.exports = {
    isCondition: ({ _window, string }) => {
        
        if (typeof string !== "string") return false

        var global = _window ? _window.global : window.global
        if (string.slice(0, 2) === "@$" && string.length === 7) string = global.__refs__[string].data

        // recheck after decoding
        if (typeof string !== "string") return false

        if (string.slice(0, 1) === "!" || string.includes(">") || string.includes("<") || string.includes("!=") || string.includes("==")) return true
        return false
    }
}
},{}],26:[function(require,module,exports){
const isEqual = function (value, other) {
  // if (value === undefined || other === undefined) return false

  if ((value && !other) || (other && !value) || (typeof value !== typeof other)) return false

  // string
  if (typeof value === "string") return value.replace(/\s+/g, ",") === other.replace(/\s+/g, ",");

  // boolean || number
  if (typeof value !== "object" || value === null) return value === other

  var type = Object.prototype.toString.call(value)
  // If the two objects are not the same type, return false
  if (type !== Object.prototype.toString.call(other)) return false

  // views
  if (value.__view__ && other.__view__) return value.id === other.id

  // If items are not an object or array, return false
  if (["[object Array]", "[object Object]"].indexOf(type) < 0) return false;

  // Compare the length of the two items
  const valueLen =
    type === "[object Array]" ? value.length : Object.keys(value).length;
  const otherLen =
    type === "[object Array]" ? other.length : Object.keys(other).length;
  if (valueLen !== otherLen) return false;

  // Compare two items
  const compare = function (item1, item2) {
    // Get the object type
    const itemType = Object.prototype.toString.call(item1);

    // If an object or array, compare recursively
    if (["[object Array]", "[object Object]"].indexOf(itemType) >= 0) {
      if (!isEqual(item1, item2)) return false;
    }

    // Otherwise, do a simple comparison
    else {
      // If the two items are not the same type, return false
      if (itemType !== Object.prototype.toString.call(item2)) return false;

      // Else if it's a function, convert to a string and compare
      // Otherwise, just compare
      if (itemType === "[object Function]") {
        if (item1.toString() != item2.toString()) return false;
      } else {
        if (item1 != item2) return false;
      }
    }
  };

  // Compare properties
  if (type === "[object Array]") {
    for (let i = 0; i < valueLen; i++) {
      if (compare(value[i], other[i]) === false) return false;
    }
  } else {
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        if (compare(value[key], other[key]) === false) return false;
      }
    }
  }

  if (Array.isArray(value)) {
    var equal = true
    if (value.length === other.length) {
      value.map((value, i) => {
        if (!isEqual(value, other[i])) equal = false
      })
    } else equal = false
    return equal
  }

  if (typeof value === "object") {
    var equal = true, valueKeys = Object.keys(value), otherKeys = Object.keys(other)
    if (valueKeys.length === otherKeys.length) {
      valueKeys.map((key, i) => {
        if (!isEqual(valueKeys[key], otherKeys[key])) equal = false
      })
    } else equal = false
    return equal
  }

  // html elements
  if (
    value.nodeType === Node.ELEMENT_NODE &&
    other.nodeType === Node.ELEMENT_NODE
  ) {
    return (
      value.isSameNode(other) ||
      value.contains(other) ||
      other.contains(value)
    );
  } else if (
    (value.nodeType !== Node.ELEMENT_NODE &&
      other.nodeType === Node.ELEMENT_NODE) ||
    (value.nodeType === Node.ELEMENT_NODE &&
      other.nodeType !== Node.ELEMENT_NODE)
  ) {
    return false;
  }

  // If nothing failed, return true
  return true;
}

module.exports = { isEqual }

},{}],27:[function(require,module,exports){
var events = require("./events.json")

const isEvent = ({ _window, string }) => {

    var global = _window ? _window.global : window.global
    
    if (string.split("?").length > 1) {

        string = string.split("?")[0]
        // ex: [[click??conditions]?params]
        if (string.slice(0, 2) === "@$" && string.length == 7) string = global.__refs__[string].data
        string = string.split(";")[0]
        // ex: [[click??conditions];[keyup??conditions]?params]
        if (string.slice(0, 2) === "@$" && string.length == 7) string = global.__refs__[string].data
        // ex: click:id
        string = string.split(":")[0]
        if (events.includes(string)) return true
        else return false

    } else return false
}

module.exports = { isEvent }
},{"./events.json":12}],28:[function(require,module,exports){
module.exports = {
  isParam: ({ _window, string = "" }) => {
    
    if (string.slice(0, 2) === "@$" && string.length === 7) string = (_window ? _window.global : window.global).__refs__[string].data

    if (string.includes("=") || string.includes(";") || string === "return()" || string.slice(0, 1) === "!" || string.includes(">") || string.includes("<")) return true
    return false
  }
}
},{}],29:[function(require,module,exports){
const jsonToBracket = (object, field) => {

  if (!object) return ""

  var string = ""
  var length = Object.entries(object).length

  Object.entries(object).map(([key, value], index) => {
    if (field) key = `${field}.${key}`

    if (Array.isArray(value)) {

      if (value.length === 0) string += `${key}=:[]`
      else string += `${key}=:${value.join(":")}`

    } else if (typeof value === "object") {

      if (Object.keys(value).length === 0) string += `${key}=[]`
      else {
        var path = jsonToBracket(value).split(";")
        string += path.map(path => `${key}.${path}`).join(";")
      }

    } else if (typeof value === "string") string += `${key}='${value}'`
    else string += `${key}=${value}`

    if (index < length - 1) string += ";"
  })

  return string || ""
}

module.exports = {jsonToBracket}

},{}],30:[function(require,module,exports){
(function (global){(function (){
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
        else return o.__element__.offsetHeight / 10 + "rem"

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
        var inputs = [], textareas = [], editables = [], input

        if (!o.__rendered__) {
            if (o.__name__ === "Input") return o
            var findInputs = (view) => {
                if (o.__name__ !== "View") return
                o.__childrenRef__.map(({ id }) => {
                    if (input) return
                    if (views[id].__name__ === "Input") return input = o
                    else if (views[id].__name__ === "View") findInputs(view)
                })
            }
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

        if (_window) saveToLogs({ _window, logs })
        return o
    
    }, "parent()": ({ _window, o }) => {

        if (!o.__view__) return
        return nthParent({ _window, nth: 1, o }) || false

    }, "2ndParent()": ({ _window, o }) => {

        if (!o.__view__) return
        return nthParent({ _window, nth: 2, o }) || false

    }, "3rdParent()": ({ _window, o }) => {

        if (!o.__view__) return
        return nthParent({ _window, nth: 3, o }) || false

    }, "nthParent()": ({ _window, o, stack, props, lookupActions, id, e, __, args, object }) => {

        if (!o.__view__) return
        var nth = toValue({ _window, id, e, lookupActions, stack, props: { isValue: true }, __, data: args[1], object })

        return nthParent({ _window, nth, o }) || false

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
        return nthNext({ _window, nth: 1, o }) || false

    }, "2ndNext()": ({ _window, o }) => {

        if (!o.__view__) return
        return nthNext({ _window, nth: 2, o }) || false

    }, "3rdNext()": ({ _window, o }) => {

        if (!o.__view__) return
        return nthNext({ _window, nth: 3, o }) || false

    }, "nthNext()": ({ _window, o, stack, props, lookupActions, id, e, __, args, object }) => {

        if (!o.__view__ || !o.id) return
        var nth = toValue({ _window, __, data: args[1], e, id, lookupActions, stack, props: { isValue: true }, object })
        return nthNext({ _window, nth, o }) || false

    }, "last()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[views[o.__parent__].__childrenRef__.slice(-1)[0].id] || false

    }, "lastSibling()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[views[o.__parent__].__childrenRef__.slice(-1)[0].id] || false

    }, "2ndLast()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[views[o.__parent__].__childrenRef__.slice(-2)[0].id] || false

    }, "3rdLast()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[views[o.__parent__].__childrenRef__.slice(-3)[0].id] || false

    }, "nthLast()": ({ _window, views, o, stack, props, lookupActions, id, e, __, args, object }) => {

        if (!o.__view__ || !o.id) return
        var nth = toValue({ _window, __, data: args[1], e, id, lookupActions, stack, props: { isValue: true }, object })
        if (!isNumber(nth)) return false
        return views[views[o.__parent__].__childrenRef__.slice(-1 * nth)[0].id] || false

    }, "1stSibling()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[views[o.__parent__].__childrenRef__[0].id] || false

    }, "2ndSibling()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[views[o.__parent__].__childrenRef__[1].id] || false

    }, "3rdSibling()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[views[o.__parent__].__childrenRef__[2].id] || false

    }, "nthSibling()": ({ _window, views, o, stack, props, lookupActions, id, e, __, args, object }) => {

        if (!o.__view__ || !o.id) return
        var nth = toValue({ _window, id, e, __, data: args[1], lookupActions, stack, object, props: { isValue: true } })
        return views[views[o.__parent__].__childrenRef__[nth - 1].id] || false

    }, "grandChild()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return o.__childrenRef__[0] && views[views[o.__childrenRef__[0].id].__childrenRef__[0].id] || false

    }, "grandChildren()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return o.__childrenRef__[0] && views[o.__childrenRef__[0].id].__childrenRef__.map(({ id }) => views[id]) || false

    }, "prev()": ({ _window, o }) => {

        if (!o.__view__) return
        return nthPrev({ _window, nth: 1, o }) || false

    }, "2ndPrev()": ({ _window, o }) => {

        if (!o.__view__) return
        return nthPrev({ _window, nth: 2, o }) || false

    }, "3rdPrev()": ({ _window, o }) => {

        if (!o.__view__) return
        return nthPrev({ _window, nth: 3, o }) || false

    }, "nthPrev()": ({ _window, o, stack, props, lookupActions, id, e, __, args, object }) => {

        if (!o.__view__ || !o.id) return
        var nth = toValue({ _window, id, e, __, data: args[1], object, lookupActions, stack, props: { isValue: true } })
        return nthPrev({ _window, nth, o }) || false

    }, "1stChild()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return o.__childrenRef__[0] && views[o.__childrenRef__[0].id] || false

    }, "child()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return o.__childrenRef__[0] && views[o.__childrenRef__[0].id] || false

    }, "2ndChild()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return o.__childrenRef__[1] && views[o.__childrenRef__[1].id] || false

    }, "3rdChild()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return o.__childrenRef__[2] && views[o.__childrenRef__[2].id] || false

    }, "nthChild()": ({ _window, views, o, stack, props, lookupActions, id, e, __, args, object }) => {

        if (!o.__view__ || !o.id) return
        var nth = toValue({ _window, __, data: args[1], e, id, stack, object, props: { isValue: true }, lookupActions })
        if (!isNumber(nth)) return false
        return o.__childrenRef__[nth - 1] && views[o.__childrenRef__[nth - 1].id] || false

    }, "3rdLastChild()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[o.__childrenRef__.slice(-3)[0].id] || false

    }, "2ndLastChild()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[o.__childrenRef__.slice(-2)[0].id] || false

    }, "lastChild()": ({ views, o }) => {

        if (!o.__view__ || !o.id) return
        return views[o.__childrenRef__.slice(-1)[0].id] || false

    }, "nthLastChild()": ({ _window, views, o, id, e, __, args, object }) => {

        if (!o.__view__ || !o.id) return
        var nth = toValue({ _window, __, data: args[1], e, id, object, props: { isValue: true } })
        if (!isNumber(nth)) return false
        return views[o.__childrenRef__.slice(-1 * nth)[0].id] || false

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

        var date = o instanceof Date ? o : new Date()
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

        if (args[1] && underScored) {

            var data = toArray(o).map(o => toValue({ req, res, _window, lookupActions, stack, props: { ...props, isValue: false }, id, data: args[1] || "", object, __: [o, ...__], e }))
            return notArray ? data[0] : data

        } else if (args[1]) {

            return toArray(o).map(o => toValue({ req, res, _window, lookupActions, stack, props: { ...props, isValue: false }, id, data: args[1] || "", object: [o, ...object], __, e }))

        } else if (args[2] && underScored) {

            breakRequest.break = true
            var address;
            ([...toArray(o)]).reverse().map(o => {
                // address
                address = actions["addresser()"]({ _window, id, stack, props: { ...props, isValue: false }, nextAddress: address, __: [o, ...__], lookupActions, data: { string: args[2] }, object }).address
            })

            // address
            if (address) actions["stackManager()"]({ _window, id, lookupActions, stack, props: { ...props, isValue: false }, address, __, req, res })

        } else if (args[2]) {

            breakRequest.break = true
            var address;
            ([...toArray(o)]).reverse().map(o => {
                // address
                address = actions["addresser()"]({ _window, id, stack, props, nextAddress: address, __, lookupActions, data: { string: args[2] }, object: [o, ...toArray(object)] }).address
            })

            // address
            if (address) actions["stackManager()"]({ _window, id, lookupActions, stack, props, address, __, req, res })
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

    }, "type()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

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
        else return o.checked.checked || o.__element__.checked || false

    }, "check()": ({ o, value, breakRequest }) => {

        breakRequest.break = true
        if (!o.__view__) return

        return o.checked.checked = o.__element__.checked = value || false

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

    }, "route()": ({ _window, req, res, o, stack, props, lookupActions, id, __, args, object }) => {

        var { address, data } = actions["addresser()"]({ _window, stack, props, args, interpreting: true, status: "Start", type: "action", asynchronous: true, id: o.id, action: "route()", object, lookupActions, __ })
        if (typeof data === "string") data = { data: data }

        route({ _window, lookupActions, stack, props, address, id, req, res, data: data.data, __ })

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

    }, "upload()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var { address, data } = actions["addresser()"]({ _window, stack, props, args, status: "Start", asynchronous: true, id: o.id || id, type: "Storage", unhold: true, action: "save()", object, lookupActions, __ })
        data.storage = true
        return callServer({ _window, lookupActions, stack, props, address, id, e, __, req, res, data: { data: data === undefined ? __[0] : data, action: "save()", server: "storage" } })

    }, "db()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var { address, data } = actions["addresser()"]({ _window, stack, props, args, status: "Start", asynchronous: true, unhold: true, id: o.id || id, type: "Data", unhold: true, action: "database()", object, lookupActions, __ })
        return callServer({ _window, lookupActions, stack, props, address, id, e, __, req, res, data: { data: (data === undefined ? __[0] : data), action: data.action, server: "datastore" } })

    }, "search()": ({ _window, global, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var action = "search()"
        var { address, data } = actions["addresser()"]({ _window, stack, props, args, status: "Start", asynchronous: true, unhold: true, id: o.id || id, type: "Data", action, object, lookupActions, __ })
        if (!_window) action = `search():[${jsonToBracket(data)}]:[send():[_]]`
        return callServer({ _window, lookupActions, stack, props, address, id, e, __, req, res, data: { data: data === undefined ? __[0] : data, action, server: "datastore" } })

    }, "erase()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var action = "erase()"
        var { address, data } = actions["addresser()"]({ _window, stack, props, args, status: "Start", asynchronous: true, unhold: true, id: o.id || id, type: "Data", action, object, lookupActions, __ })
        if (!_window) action = `erase():[${jsonToBracket(data)}]:[send():[_]]`
        return callServer({ _window, lookupActions, stack, props, address, id, e, __, req, res, data: { data: data === undefined ? __[0] : data, action, server: "datastore" } })

    }, "save()": ({ _window, req, res, o, stack, props, lookupActions, id, e, __, args, object }) => {

        var action = "save()"
        var { address, data } = actions["addresser()"]({ _window, stack, props, args, status: "Start", asynchronous: true, unhold: true, id: o.id || id, type: "Data", action, object, lookupActions, __ })
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

            var parent = views[data.__parent__ || view.__parent__]
            var __index__ = data.__index__ !== undefined ? data.__index__ : (view.__loop__ ? view.__index__ : undefined)
            var __childIndex__ = data.__childIndex__ !== undefined ? data.__childIndex__ : view.__childIndex__
            var __prevViewPath__ = data.__prevViewPath__ || view.__prevViewPath__
            var __prevViewCollection__ = data.__prevViewCollection__ || view.__prevViewCollection__
            var __viewPath__ = [...(data.__viewPath__ || view.__viewPath__)]
            var __customViewPath__ = [...(data.__customViewPath__ || view.__customViewPath__)]
            var __lookupActions__ = [...(data.__lookupActions__ || view.__lookupActions__)]
            var my__ = data.__ || view.__

            var elements = []
            var timer = (new Date()).getTime()

            if (!view) return false

            // close publics
            closePublicViews({ _window, id: data.id, __, stack, props, lookupActions })

            var customView = data.view
            if (!customView) {
                
                if (__prevViewPath__) customView = clone(__prevViewPath__.reduce((o, k) => o[k], global.__queries__[__prevViewCollection__ || "view"]))
                else customView = clone(__viewPath__.reduce((o, k) => o[k], global.__queries__[view.__viewCollection__ || "view"]))
            }

            // get view to be rendered
            var reducedView = {
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
            address = actions["addresser()"]({ _window, id, stack, props, nextAddress: address, status: "Start", type: "function", function: "toView", interpreting: true, __: my__, lookupActions: __lookupActions__, data: { view: reducedView, parent: parent.id } }).address
            
            // render
            var myView = actions["view()"]({ _window, lookupActions: __lookupActions__, stack, props, req, res, address, __: my__, data: { view: reducedView, parent: parent.id } })
            
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
        
        var views = window.views
        var global = window.global
        var parent = views[o.__parent__]
        var passData = {}, myID
        var __childIndex__
    
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
        let view = views[id], parent = views[view.__parent__]
        
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

        var views = _window ? _window.views : window.views
        var global = _window ? _window.global : window.global
        var view = data.view || views[id]
        
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
                
                if (conditionsNotApplied) return removeView({ _window, global, views, id, stack, props, address })
                else view.__subParams__ = subParams
                view.__interpretingSubparams__ = false
            }

            view.__subParamsInterpreted__ = true

            // asynchronous actions within view params
            if (address.hold) return actions["addresser()"]({ _window, id, stack, props, switchNextAddressIDWith: address, type: "function", function: "toView", __, lookupActions, stack, props, data: { view, loop: data.loop } })
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
            if (!approved) return removeView({ _window, global, views, id, stack, props, address })

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
            if (address.hold) return actions["addresser()"]({ _window, id, stack, props, switchNextAddressIDWith: address, type: "function", function: "toView", __, lookupActions, stack, props, data: { view } })
        }

        // no view name
        if (!view.__name__ || typeof view.__name__ !== "string" || view.__name__.charAt(0) === "#") return removeView({ _window, global, views, id, stack, props, address })

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
            if (global.__queries__[collection][view.__name__] === false) return

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
                    ...global.__queries__[collection][view.__name__],
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

                var data = getViewParams({ view })
                
                return actions["view()"]({ _window, stack, props, address, req, res, lookupActions: child.__lookupActions__, __: [...__], data: { view: child, parent: view.__parent__ } })
            }
        }
        
        var toViewAddress = address
        toViewAddress.interpreting = false

        // render children
        if (view.children.length > 0) {

            // html address
            address = actions["addresser()"]({ _window, id, stack, props, type: "function", function: "toHTML", file: "toView", __, lookupActions, nextAddress: address }).address

            var lastIndex = view.children.length - 1;
            var children = [...view.children]

            // address children
            for (let index = lastIndex; index >= 0; index--) {
                const child = children[index];
                
                if (!child) return
                var childID = child.id || generate()
                views[childID] = { ...child, id: childID, __view__: true, __parent__: id, __viewPath__: [...view.__viewPath__, "children", index], __childIndex__: index, __viewCollection__: collection, __prevViewCollection__: view.__viewCollectionUpdated__ ? prevCollection : collection }

                // address
                address = actions["addresser()"]({ _window, id: childID, stack, props, type: "function", function: "toView", __: [...__], lookupActions, nextAddress: address, data: { view: views[childID] } }).address
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
    if (stack.viewID === "document") console.log(address.data);
    
            if (address.function) {
    
                const func = address.function || "toLine"
    
                if (func === "toView") actions["view()"](params)
                else if (func === "toHTML") actions["html()"](params)
                else if (func === "refresh") actions["refresh()"](params)
                else if (func === "createWebApp") actions["createWebApp()"](params)
    
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
            address = actions["addresser()"]({ _window, stack, props, status: "Start", type: "function", function: "toView", nextAddress: address, lookupActions, __ }).address    
            
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
        if ((o === undefined || o === null || o === false) && k0 !== "push()" && k0 !== "replace()" && k0 !== "replaceItem()") return o

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
            return global.__queries__[view.__lookupActions__[0].collection][view.__lookupActions__[0].doc]
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

            } else if (keyName && global.__queries__[collection]) return path.reduce((o, k) => o[k], global.__queries__[collection][doc])
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
        return route({ _window, req, res, id, e, data: { lookupActions: newLookupActions, server: "action", action: action0, data }, __, stack, props, lookupActions, address })
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

        var collection = global.__queries__[lookupAction.collection] || {}
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

            var params = { i: index, __loopIndex__: index, id: `${view.id}_${index}` }
            key = isNumber(key) ? parseInt(key) : key
            if (mount) params = { ...params, form, __dataPath__: [...__dataPath__, key] }

            views[params.id] = { __view__: true, __loop__: true, __mount__: mount, ...clone(view), ...myparams, ...params }

            address = actions["addresser()"]({ _window, id: params.id, stack, props, nextAddress: address, type: "function", function: "toView", renderer: true, blockable: false, __: !mount ? [values[key], ...__] : __, lookupActions, data: { view: views[params.id] } }).address
        }
        
        actions["stackManager()"]({ _window, lookupActions, stack, props, address, id, req, res, __ })
    }

    for (let index = lastIndex; index >= limit; index--) {
        
        var key = myData[index]
        view.__looped__ = true

        var params = { i: index, __loopIndex__: index, id: `${view.id}_${index}` }
        key = isNumber(key) ? parseInt(key) : key
        if (mount) params = { ...params, form, __dataPath__: [...__dataPath__, key] }

        views[params.id] = { __view__: true, __loop__: true, __mount__: mount, ...clone(view), ...myparams, ...params }
        
        address = actions["addresser()"]({ _window, id: params.id, stack, props, nextAddress: address, type: "function", function: "toView", renderer: true, blockable: false, __: !mount ? [values[key], ...__] : __, lookupActions, data: { view: views[params.id] } }).address
    }
    
    address.terminated = false
    actions["stackManager()"]({ _window, lookupActions, stack, props, address, id, req, res, __ })

    removeView({ _window, global, views, id, stack, props, address })
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
        __loop__, __loopIndex__, __looped__, __mount__, i, __interpretingSubparams__, __underscoreLoopIndex__, __prevViewPath__,
        __viewPath__, __customViewPath__, __indexing__, __childIndex__, __initialIndex__, __customView__, __htmlStyles__, __events__, __page__,
        __defaultValue__, __childrenInitialIDRef__, __initialID__, __viewCollection__, __subParamsInterpreted__,
        __parent__, __controls__, __status__, __rendered__, __timers__, __view__, __name__, __customID__, __paramsInterpreted__, __, ...params
    } = view

    return params
}

const removeView = ({ _window, global, views, id, stack, props, self = true, main, insert }) => {

    let view = views[id]
    if (!view) return
    let parent = views[view.__parent__], element = {}

    if (!parent) return

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

    let index = parent.__childrenRef__.findIndex(({ id }) => id === view.id)

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

    return element
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
    view.mousedowned = false

    // linkable
    if (events.includes("click") && view.link && typeof view.link === "object" && view.link.preventDefault)
        view.__element__.addEventListener("click", (e) => { e.preventDefault() })

    // input
    if (view.__name__ === "Input" || view.editable) {

        events.includes("focus") && defaultInputHandlerByEvent({ views, view, id, event: "focus", keyName: "focused", value: true })
        events.includes("blur") && defaultInputHandlerByEvent({ views, view, id, event: "blur", keyName: "focused", value: false })
    }

    events.includes("mouseenter") && defaultInputHandlerByEvent({ views, view, id, event: "mouseenter", keyName: "mouseentered", value: true })
    events.includes("mouseleave") && defaultInputHandlerByEvent({ views, view, id, event: "mouseleave", keyName: "mouseentered", value: false })

    events.includes("mousedown") && defaultInputHandlerByEvent({ views, view, id, event: "mousedown", keyName: "mousedowned", value: true })
    events.includes("mouseup") && defaultInputHandlerByEvent({ views, view, id, event: "mouseup", keyName: "mousedowned", value: false })
}

const defaultInputHandlerByEvent = ({ views, view, id, event, keyName, value }) => {

    // function
    var fn = (e) => {
        if (views[id]) view[keyName] = value
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
                name: file.name,
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

const callServer = async ({ _window, lookupActions, stack, props, address, id, req, res, e, __, data }) => {

    data.server = data.server || "datastore"

    // call server
    if (!_window) return route({ lookupActions, stack, props, address, id, req, __, res, e, data })

    // storage
    else if (data.data.storage) var data = await require("./storage").storage({ _window, req, res, action: data.action, stack, props, data: data.data || {}, __ })

    // database
    else if (data.server === "datastore") var data = require("./database").database({ _window, req, res, action: data.action, stack, props, data: data.data || {}, __ })

    // mail
    else if (data.server === "mail") var data = await mail({ _window, req, res, action: data.action, stack, props, data: data.data || {}, __ })
    
    // awaits
    return actions["stackManager()"]({ _window, lookupActions, stack, props, id, address, e, req, res, _: data, __ })
}

const route = async ({ lookupActions, stack, props, address, id, req, __, res, e, data }) => {

    loader({ show: "loader.show" })

    // headers
    var options = {
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
    var response = await fetch("/", options).then(response => response.json())

    // cookies
    if (response.__props__.cookies) setCookie({ cookies: response.__props__.cookies })

    // update session
    if (response.__props__.session) setCookie({ name: "__session__", value: response.__props__.session })

    // check data for queries
    /*if (data.searchDoc) */queriesClient({ global: window.global, data: response })

    // search doc
    if (data.searchDoc && !response.data) {
        window.global.__queries__[data.data.collection] = window.global.__queries__[data.data.collection] || {}
        window.global.__queries__[data.data.collection][data.data.doc] = false
    }

    loader({})

    // await
    actions["stackManager()"]({ lookupActions, address, stack, props, id, e, req, res, _: response, __ })
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

module.exports = {
    actions, kernel, toValue, toParam, reducer, toApproval, toAction, toLine, addEventListener,
    getDeepChildren, getDeepChildrenId, calcSubs, calcDivision, calcModulo, emptySpaces, isNumber, printAddress, endAddress, resetAddress,
    closePublicViews, updateDataPath, remove, initView, getViewParams, removeView, defaultEventHandler,
    toNumber, defaultAppEvents, clearActions, route, eventExecuter, starter, loader
}
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./builtinEvents.json":1,"./capitalize":2,"./clone":3,"./colorize":4,"./cookie":5,"./counter":6,"./cssStyleKeyNames":7,"./csvToJson":8,"./database":undefined,"./decode":9,"./document":undefined,"./droplist":10,"./encoded":11,"./events.json":12,"./executable":13,"./exportJson":14,"./focus":15,"./generate":16,"./getCoords":17,"./getDateTime":18,"./getDaysInMonth":19,"./getType":20,"./getView":21,"./isArabic":23,"./isCalc":24,"./isCondition":25,"./isEqual":26,"./isEvent":27,"./isParam":28,"./jsonToBracket":29,"./logger":31,"./merge":32,"./note":33,"./publicViews.json":34,"./replaceNbsps":35,"./resize":36,"./setPosition":37,"./stack":38,"./storage":undefined,"./toArray":39,"./toCSV":40,"./toClock":41,"./toEvent":42,"./toExcel":43,"./toPdf":44,"./toSimplifiedDate":45,"./watch":46,"easyqrcodejs":47}],31:[function(require,module,exports){
const logger = ({ _window: { global }, data: { key, start, end } }) => {
    
    if (!key) return
    if (start) global.__server__[`${key}StartTime`] = (new Date()).getTime()
    else if (end) {

        global.__server__[`${key}EndTime`] = (new Date()).getTime()
        global.__server__[`${key}Duration`] = global.__server__[`${key}EndTime`] - global.__server__[`${key}StartTime`]
        console.log((new Date()).getHours() + ":" + (new Date()).getMinutes() + " " + key.toUpperCase(), global.__server__[`${key}Duration`], global.manifest.host)
    }
}
module.exports = { logger }
},{}],32:[function(require,module,exports){
const { toArray } = require("./toArray")
const { clone } = require("./clone")

const merge = (array) => {

  array = clone(array)
  if (typeof array !== "object") return array

  var type = typeof array[0]
  array.map(obj => {
    if (typeof obj !== type) type = false
  })

  if (type === false) return array[0]
  var merged = toArray(array[0]).flat()

  array.shift()

  array.map((obj) => {
    merged.push(...toArray(obj).flat())

    if (!Array.isArray(obj) && typeof obj === "object") {
      Object.entries(obj).map(([key, value]) => {

        if (merged[key]) {

          if (typeof value === "string" || typeof value === "number") {

            merged[key] = toArray(merged[key])
            merged[key].push(value)

          } else if (Array.isArray(value)) {

            merged[key].push(...value)

          } else if (typeof value === "object") {

            merged[key] = merge([value, merged[key]])

          }

        } else merged[key] = value
      })
    }
  })

  return merged
}

const override = (obj1, obj2) => { // (old, new)
  obj1 = obj1 || {}

  Object.entries(obj2).map(([key, value]) => {

    if (obj1[key]) {
      if (!Array.isArray(value) && typeof value === "object") {

        obj1[key] = override(obj1[key], value)

      } else obj1[key] = value

    } else obj1[key] = value

  })

  return obj1
}

module.exports = { merge, override }

},{"./clone":3,"./toArray":39}],33:[function(require,module,exports){
const { isArabic } = require("./isArabic")

const note = ({ _window, note: data }) => {

  if (_window) return
  var views = window.views
  var note = views["note"]
  if (typeof data === "string") data = { text: data }
  var type = (data.type || (data.danger && "danger") || (data.info && "info") || (data.warning && "warning") || "success").toLowerCase()
  var noteText = views["note-text"]
  var backgroundColor = type === "success" 
  ? "#2FB886" : type === "danger" 
  ? "#F66358" : type === "info"
  ? "#47A8F5" : type === "warning"
  && "#FFA92B"
  
  if (!data || !noteText) return

  clearTimeout(note["note-timer"])

  noteText.__element__.innerHTML = data.text
  // isArabic({ id: "note-text" })

  var width = note.__element__.offsetWidth
  note.__element__.style.backgroundColor = backgroundColor
  note.__element__.style.left = `calc(50% - ${width/2}px)`
  note.__element__.style.opacity = "1"
  note.__element__.style.transition = "transform .2s"
  note.__element__.style.transform = "translateY(0)"

  const myFn = () => note.__element__.style.transform = "translateY(-200%)"

  note["note-timer"] = setTimeout(myFn, 5000)
}

module.exports = { note }

},{"./isArabic":23}],34:[function(require,module,exports){
module.exports={
    "droplist": {
        "view": "View:droplist?__droplistMouseleaveTimer__:()=400;class=box-shadow flex column;[mouseleave?mouseleaveDroplist()];[mouseenter?mouseenterDroplist()];[click:document?outClickDroplist()];style:[width=fit-content;transition=opacity .1s, transform .1s, background-color .1s;height=fit-content;overflowY=auto;overflowX=hidden;maxWidth=40rem;transform=scale(0.5);opacity=0;pointerEvents=none;position=fixed;borderRadius=.5rem;backgroundColor=#fff;zIndex=998]",
        "__props__": {
            "id": "H1Q7f0a828R8d7d0Q060p1E5l2",
            "creationDate": 0,
            "doc": "droplist",
            "active": true,
            "dirPath": [],
            "collapsed": [],
            "comments": [],
            "public": true,
            "actions": {
                "mouseleaveDroplist": "mouseentered=false;clearTimer():[__droplistTimer__:()];__droplistTimer__:()=timer():[__keyupIndex__:()=0;__droplistMouseenterer__:().del();__droplistPositioner__:().del();():droplist.style():[opacity=0;transform='scale(0.5)';pointerEvents=none]]:[__droplistMouseleaveTimer__:()]",
                "mouseenterDroplist": "mouseentered=true;__droplistMouseleaveTimer__:()=400;clearTimer():[__droplistTimer__:()]",
                "outClickDroplist": "__droplistMouseleaveTimer__:()=400;mouseleave()?!().contains():[clicked()];!().contains():[focused()];!():[__droplistPositioner__:()].contains():[clicked()];!():[__droplistPositioner__:()].contains():[focused()]"
            }
        }
    },
    "loader": {
        "view": "View:loader-container?class=loader-container;style.display=flex",
        "children": [
            {
                "view": "View:loader?class=loader"
            }
        ],
        "__props__": {
            "id": "r1H7q0M8K8b8O7Q060t0u1w4v6",
            "creationDate": 0,
            "doc": "loader",
            "public": true,
            "active": true,
            "actions": {},
            "dirPath": [],
            "collapsed": [],
            "comments": []
        }
    },
    "mininote": {
        "view": "View:mininote?class=flex-start;style:[zIndex=99999;width=fit-content;alignItems=center;position=absolute;transform=scale(0);transition=transform .1s, opacity .2s;opacity=0;pointerEvents=none;padding=.5rem 1rem;backgroundColor=#444444dd;borderRadius=.5rem];():document.mousemove:[position():[positioner=mouse;placement=right]]",
        "children": [
            {
                "view": "Text:mininote-text?style.width=fit-content;style.fontSize=1.1rem;style.color=#fff"
            }
        ],
        "__props__": {
            "id": "01o73078J8D8T7T0n1d4P0g3o6",
            "creationDate": 0,
            "doc": "mininote",
            "public": true,
            "active": true,
            "actions": {},
            "dirPath": [],
            "collapsed": [],
            "comments": []
        }
    },
    "note": {
        "view": "View:note?class=flexbox box-shadow;style:[position=fixed;zIndex=9999;if():mobile():[maxWidth=40rem];minWidth=25rem;opacity=0;backgroundColor=#0d6efd;padding=1rem 3rem;left=center;top=0;transform=translateY(-200%);transition=transform .2s;borderRadius=0 0 1.5rem 1.5rem];mouseenter:[clearTimer():[().note-timer]];mouseleave:[note-timer=timer():[style().transform=translateY(-200%)]:5000]",
        "children": [
            {
                "view": "View?class=flexbox;style.width=100%",
                "children": [
                    {
                        "view": "Text?id=note-text;text=Action Note;style.color=#fff;style.fontSize=1.4rem"
                    },
                    {
                        "view": "Icon?icon.name=bi-x;style.color=#fff;style.position=absolute;style.fontSize=1.8rem;style.right=.4rem;style.cursor=pointer;click:[():note.style():[transform=translateY(-200%);opacity=0]]"
                    }
                ]
            }
        ],
        "__props__": {
            "id": "31V7U0w8O8l8K7R0N0m7o8u4X3",
            "creationDate": 0,
            "doc": "note",
            "public": true,
            "active": true,
            "actions": {},
            "dirPath": [],
            "collapsed": [],
            "comments": []
        }
    },
    "popup": {
        "view": "View:popup?class=box-shadow;style:[zIndex=10;pointerEvents=none;opacity=0;transition=opacity .1s;position=fixed];[click:document?closePopup()];mouseenter:[enterPopup()];mouseleave:[leavePopup()]",
        "children": [
            {
                "view": "View?style:[border=1px solid #f0f0f0;transform='scale(0.5)';borderRadius=.5rem;backgroundColor=#fff;transition=.2s]?():[__popupPositioner__:()].popup.model=model1",
                "children": [
                    {
                        "view": "Icon?class=pointer;id=popup-confirm;name=bi-check2;tooltip.text=Confirm;hover.style.backgroundColor=#0000ff22;style:[fontSize=1.8rem;height=4rem;width=3rem];click:[confirmPopup()]"
                    },
                    {
                        "view": "Icon?class=pointer;id=popup-cancel;name=bi-x;tooltip.text=Cancel;hover.style.backgroundColor=#ff000022;style:[fontSize=2rem;height=4rem;width=3rem];click:[cancelPopup()]"
                    }
                ]
            },
            {
                "view": "View?class=flexbox;style:[position=fixed;top=0;right=0;left=0;bottom=0;backgroundColor=#00000040;zIndex=10;transition=.2s]?():[__popupPositioner__:()].popup.model=model2",
                "children": [
                    {
                        "view": "View?class=flex column;style:[position=relative;borderRadius=.5em;backgroundColor=#fff;padding=2rem;gap=2rem]",
                        "children": [
                            {
                                "view": "Icon?class=flexbox pointer;name=bi-x;style:[position=absolute;top=1rem;right=1rem;height=2.5rem;width=2.5rem;fontSize=2.5rem;color=#666;transition=.2s;borderRadius=.5rem];hover:[style.backgroundColor=#eee];click:[():popup-cancel.click()]"
                            },
                            {
                                "view": "Text?style:[width=fit-content;fontSize=1.4rem];fontWeight=bold;text=[():[__popupPositioner__:()].popup.title.text||'Do you confirm!']"
                            },
                            {
                                "view": "View?class=flex align-center;style:[gap=2rem;justifyContent=flex-end]",
                                "children": [
                                    {
                                        "view": "Text:popup-confirm?class=flexbox pointer;hover.style.opacity=1;style:[fontSize=1.3rem;transition=.2s;color=#fff;borderRadius=.5rem;backgroundColor=blue;height=3rem;width=12rem];text=[():[__popupPositioner__:()].popup.confirm.text||'Confirm'];click:[confirmPopupModel2()]"
                                    },
                                    {
                                        "view": "Text:popup-cancel?class=flexbox pointer;hover.style.opacity=1;style:[fontSize=1.3rem;transition=.2s;borderRadius=.5rem;backgroundColor=#bbb;height=3rem;width=12rem];text=[():[__popupPositioner__:()].popup.cancel.text||'Cancel'];click:[cancelPopupModel2()]"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        "__props__": {
            "id": "51e7D0G8Z8y8k7U0y1D4X9F4T1",
            "creationDate": 0,
            "doc": "popup",
            "public": true,
            "active": true,
            "dirPath": [],
            "collapsed": [],
            "comments": [],
            "actions": {
                "cancelPopup": "__popupPositioner__:().del();__popupConfirmed__:()=false;():popup.():[style():[opacity=0;pointerEvents=none];1stChild().style().transform=scale(0.5)]",
                "confirmPopup": "__popupConfirmed__:()=true;():popup.():[style():[opacity=0;pointerEvents=none];1stChild().style().transform=scale(0.5)]",
                "confirmPopupModel2": "__popupConfirmed__:()=true;():popup.style():[opacity=0;pointerEvents=none]",
                "cancelPopupModel2": "__popupPositioner__:().del();__popupConfirmed__:()=false;():popup.():[style():[opacity=0;pointerEvents=none]]",
                "closePopup": "leavePopup()?__popupPositioner__:();!__popupPositioner__:().contains():[clicked()];!popup.contains():[clicked()]",
                "leavePopup": "clearTimer():[popup-timer:()];popup-timer:()=timer():[():[__popupPositioner__:()].popup.style.keys()._():[():popup.style().[_]=():popup.style.[_]];clearTimer():[popup-timer:()];timer():[():[__popupPositioner__:()].popup.style.keys()._():[():popup.style().[_]=():popup.style.[_]];():popup.():[1stChild().style().transform=scale(0.5);style():[opacity=0;pointerEvents=none]];__popupPositioner__:().del()]:0]:400",
                "enterPopup": "clearTimer():[popup-timer:()]"
            }
        }
    },
    "tooltip": {
        "view": "View:tooltip?class=flex-start;style.zIndex=999;style.width=fit-content;style.alignItems=center;style.position=fixed;style.opacity=0;style.pointerEvents=none;style.padding=.5rem 1rem;style.backgroundColor=#444444dd;style.borderRadius=.5rem",
        "children": [
            {
                "view": "Text:tooltip-text?style.width=fit-content;style.fontSize=1.1rem;style.color=#fff"
            }
        ],
        "__props__": {
            "id": "z1W7Z0s8o87837a0z1N4k1D6C0",
            "creationDate": 0,
            "doc": "tooltip",
            "public": true,
            "active": true,
            "actions": {},
            "dirPath": [],
            "collapsed": [],
            "comments": []
        }
    }
}
},{}],35:[function(require,module,exports){
const replaceNbsps = (str) => {
  if (typeof str !== "string") return str
    var re = new RegExp(String.fromCharCode(160), "g");
    return str.toString().replace(re, " ");
  }

  module.exports = { replaceNbsps }
},{}],36:[function(require,module,exports){
const resize = ({ id }) => {

  var view = window.views[id]
  if (!view) return
  
  if (view.__name__ !== "Input" && view.__name__ !== "Entry" && (width !== "fit-content" || height !== "fit-content")) return

  var results = dimensions({ id })

  // for width
  var width = view.style.width
  if (width === "fit-content" && view.__element__) {
    view.__element__.style.width = results.width + "px"
    view.__element__.style.minWidth = results.width + "px"
  }

  // for height
  var height = view.style.height
  if (height === "fit-content" && view.__element__) {
    view.__element__.style.height = results.height + "px"
    view.__element__.style.minHeight = results.height + "px"
  }
}

const arabic = /[\u0600-\u06FF\u0750-\u077F]/
const english = /[a-zA-Z]/

const dimensions = ({ id, text }) => {

  var view = window.views[id]
  if (!view) return

  var lDiv = document.createElement("div")
  document.body.appendChild(lDiv)

  var pStyle = view.style
  var pText = text || (view.__name__ === "Input" && view.__element__ && view.__element__.value) || "A"
  if (pText.includes("<") || pText.includes(">")) pText = pText.split("<").join("&lt;").split(">").join("&gt;")
  
  if (pStyle != null) lDiv.style = pStyle

  // pText = pText.split(" ").join("-")
  if (pText.charAt(pText.length - 1) === " ") pText = pText.slice(0, -1) + "-"
  while (pText.includes("  ")) { pText = pText.replace("  ", "--") }
  
  if (arabic.test(pText) && !english.test(pText)) {
    lDiv.style.fontFamily = "Noto Sans Arabic, sans-serif"
    lDiv.style.textAlign = "right"
    lDiv.classList.add("arabic")
  }

  lDiv.style.fontSize = pStyle.fontSize || "initial"
  lDiv.style.fontWeight = pStyle.fontWeight || "initial"
  lDiv.style.padding = pStyle.padding || "initial"
  lDiv.style.maxWidth = pStyle.maxWidth || "initial"
  lDiv.style.minWidth = pStyle.minWidth || "initial"
  lDiv.style.width = pStyle.width || "initial"
  lDiv.style.height = pStyle.height || "initial"
  lDiv.style.maxHeight = pStyle.maxHeight || "initial"
  lDiv.style.minHeight = pStyle.minHeight || "initial"
  lDiv.style.transform = pStyle.transform || "initial"
  lDiv.style.whiteSpace = pStyle.whiteSpace || "nowrap"
  lDiv.style.flexWrap = pStyle.flexWrap || "initial"
  lDiv.style.display = "flex"
  lDiv.style.position = "absolute"
  lDiv.style.left = "-1000px"
  lDiv.style.top = "-1000px"
  lDiv.style.opacity = "0"
  lDiv.innerHTML = pText
  
  if (pStyle.width === "100%") lDiv.style.width = (view.__element__ ? view.__element__.clientWidth : lDiv.style.width) + "px"
  var height, width = lDiv.clientWidth + 2

  if (view.__element__.tagName === "TEXTAREA") {

    height = lDiv.clientHeight
    if (lDiv.clientHeight < view.__element__.scrollHeight) height = view.__element__.scrollHeight
    if (!pText) height = lDiv.clientHeight
  }
  
  var lResult = { width, height }
  
  document.body.removeChild(lDiv)
  lDiv = null

  return lResult
}

var lengthConverter = (length) => {
  
  if (!length) return 0
  if (typeof length === "number") return length
  if (!isNaN(length) && parseFloat(length).toString().length === length.toString().length) return parseFloat(length)
  if (length.includes("rem")) return parseFloat(length) * 10
  if (length.includes("px")) return parseFloat(length)
  if (length.includes("100vw")) return window.innerWidth
  if (length.includes("100vh")) return window.innerHeight
  else return length
}

module.exports = {resize, dimensions, lengthConverter}

},{}],37:[function(require,module,exports){
const setPosition = ({ position = {}, id, e }) => {

  var views = window.views
  var align = position.align || "center"
  var element = views[position.id || id].__element__
  if (!element) return
  var mousePos = position.positioner === "mouse"
  var fin = element.getElementsByClassName("fin")[0]
  var positioner = position.positioner || id

  if (!views[positioner] && !mousePos) return
  
  var positionerTop, positionerBottom, positionerRight, positionerLeft, positionerHeight, positionerWidth

  if (mousePos) {

    positionerTop = e.clientY + window.scrollY
    positionerBottom = e.clientY + window.scrollY
    positionerRight = e.clientX + window.scrollX
    positionerLeft = e.clientX + window.scrollX
    positionerHeight = 0
    positionerWidth = 0
    
  } else {

    positioner = views[positioner].__element__
    positionerTop = positioner.getBoundingClientRect().top
    positionerBottom = positioner.getBoundingClientRect().bottom
    positionerRight = positioner.getBoundingClientRect().right
    positionerLeft = positioner.getBoundingClientRect().left
    positionerHeight = positioner.offsetHeight
    positionerWidth = positioner.offsetWidth

    // set height to fit content
    element.style.height = views[element.id].style.height
  }

  var top 
  var left 
  var bottom 
  var distance 
  var placement
  var height = element.offsetHeight
  var width = element.offsetWidth

  if (position.width === "inherit") {

    width = positioner.offsetWidth
    element.style.width = width + "px"

  } else if (position.height === "inherit") {

    height = positioner.offsetHeight
    element.style.height = height + "px"
  }
  
  placement = position.placement || "bottom"
  distance = position.distance === undefined ? 10 : position.distance

  if (placement === "right") {

    left = positionerRight + distance + (position.gapX || 0)
    top = positionerTop + positionerHeight / 2 - height / 2 + (position.gapY || 0)
      
    if (fin) {
      fin.style.right = "unset"
      fin.style.left = "-0.5rem"
      fin.style.top = "unset"
      fin.style.bottom = "unset"
      fin.style.borderRadius = "0 0 0 0.4rem"
    }

  } else if (placement === "left") {
    
    left = positionerLeft - distance - width + (position.gapX || 0)
    top = positionerTop + positionerHeight / 2 - height / 2 + (position.gapY || 0)
    
    if (fin) {
      fin.style.right = "-0.5rem"
      fin.style.left = "unset"
      fin.style.top = "unset"
      fin.style.bottom = "unset"
      fin.style.borderRadius = "0 0.4rem 0 0"
    }

  } else if (placement === "top") {

    top = positionerTop - height - distance + (position.gapY || 0)
    left = positionerLeft + positionerWidth / 2 - width / 2 + (position.gapX || 0)

    if (fin) {
      fin.style.right = "unset"
      fin.style.left = "unset"
      fin.style.top = "unset"
      fin.style.bottom = "-0.5rem"
      fin.style.borderRadius = "0 0 0.4rem 0"
    }

  } else if (placement === "bottom") {

    top = positionerTop + positionerHeight + distance + (position.gapY || 0)
    left = positionerLeft + positionerWidth / 2 - width / 2 + (position.gapX || 0)
    
    if (fin) {
      fin.style.right = "unset"
      fin.style.left = "unset"
      fin.style.top = "-0.5rem"
      fin.style.bottom = "unset"
      fin.style.borderRadius = "0 0.4rem 0 0"
    }
  }

  if (("top" in position) || ("left" in position) || ("bottom" in position) || ("right" in position)) {
    
    element.style.top = top + 'px'
    element.style.left = left + 'px'
    if ("top" in position) element.style.top = position.top + 'px'
    if ("left" in position) element.style.left = position.left + 'px'
    if ("bottom" in position) element.style.bottom = position.bottom + 'px'
    if ("right" in position) element.style.right = position.right + 'px'
    return
  }

  // fix height overflow
  bottom = top + height
  if (mousePos && window.scrollY) bottom = top - window.scrollY

  if (top - 10 < 0) {

    if (fin) fin.style.top = height / 2 - 5 - 10 + top + "px"
    
    element.style.top = 10 + 'px'
    
    if (20 + height >= window.innerHeight)
    element.style.height = window.innerHeight - 20 + "px"

  } else if (bottom + 10 > window.innerHeight) {

    if (fin) fin.style.top = height / 2 - (fin ? 5 : 0) + 10 + bottom - window.innerHeight + "px"
    
    element.style.top = (window.innerHeight - 10 - height) + 'px'
    
    if (window.innerHeight - 20 - height <= 0) {
      element.style.top = 10 + "px"
      element.style.height = window.innerHeight - 20 + "px"
    }

  } else element.style.top = top + 'px'

  // fix width overflow
  right = left + width
  var windowWidth = window.innerWidth
  var bodyHeight = document.body.offsetHeight
  if (bodyHeight > window.innerHeight) windowWidth -= 12

  if (mousePos && window.scrollX) right = left - window.scrollX
  
  if (left - 10 < 0) {

    if (fin) fin.style.left = width / 2 - 5 - 10 + left + "px"

    element.style.left = 10 + 'px'
    
    if (20 + width >= windowWidth)
    element.style.width = windowWidth - 20 + "px"

  } else if (right + 10 > windowWidth) {

    if (fin) fin.style.left = width / 2 - (fin ? 5 : 0) + 10 + right - windowWidth + "px"
    
    element.style.left = windowWidth - 10 - width + 'px'
    
    if (windowWidth - 20 - width <= 0) {
      element.style.left = 10 + "px"
      element.style.width = windowWidth - 20 + "px"
    }

  } else element.style.left = left + 'px'
  
  // align
  if (align === "left") element.style.left = positionerLeft + (position.gapX || 0) + "px"
  else if (align === "top") element.style.top = positionerTop - height + positionerHeight + (position.gapY || 0) + "px"
  else if (align === "bottom") element.style.bottom = positionerBottom + (position.gapY || 0) + "px"
  else if (align === "right") element.style.left = positionerLeft - width + positionerWidth + (position.gapX || 0) + "px"
  
  if (fin) fin.style.left = "unset"
}

module.exports = {setPosition}

},{}],38:[function(require,module,exports){
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
    returns: [],
    refs: []
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

const endStack = ({ _window, stack }) => {

  if (stack.addresses.length !== 0) return

  const global = _window ? _window.global : window.global
  //const logs = `%cSTACK ${(new Date()).getTime() - stack.executionStartTime} ${stack.event}`
  // stack.logs.push(`${stack.logs.length} End STACK ${(new Date()).getTime() - stack.executionStartTime} ${stack.id} ${stack.event}`)

  // print stack
  //stack.print && !stack.printed && console.log("STACK:" + stack.event, logs, "color: blue", stack, props.logs)
  //stack.printed = true
  stack.status = "End"
  stack.refs.map(ref => delete global.__refs__[ref])

  // remove stack
  delete global.__stacks__[stack.id]
}

module.exports = { openStack, clearStack, endStack }
},{"./decode":9,"./generate":16,"./toArray":39}],39:[function(require,module,exports){
const toArray = (data) => {
  return data !== undefined ? (Array.isArray(data) ? data : [data]) : [];
}

module.exports = {toArray}

},{}],40:[function(require,module,exports){
module.exports = {
    toCSV: (file = {}) => {

        var data = file.data
        var fileName = file.name
        var CSV = ''
        
        //Set Report title in first row or line

        // This condition will generate the Label/Header
        var row = ""
        var keys = file.headers || []

        // get all headers
        if (headers.length === 0)
        data.slice(0, 5).map(data => {
            Object.keys(data).map(key => {
                if (!headers.includes(key)) headers.push(key)
            })
        })

        //This loop will extract the label from 1st index of on array
        headers.map(key => row += key + ',')

        row = row.slice(0, -1)

        // line break
        CSV += row + '\n'

        // extract each row
        data.map(d => {
            var row = ""

            // extract each column and convert it in string comma-separated
            headers.map(k => { 
                if (d[k] !== undefined) row += `${d[k]},`
                else row += ','
            })

            row = row.slice(0, -1)

            //add a line break after each row
            CSV += row + '\n'
        })

        if (CSV == '') {
            alert("Invalid data")
            return
        }

        var blob = new Blob([CSV], { type: 'text/csv;charset=utf-8;' })

        if (navigator.msSaveBlob) { // IE 10+

            navigator.msSaveBlob(blob, fileName)

        } else {

            var link = document.createElement("a")
            if (link.download !== undefined) { // feature detection

                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob)
                link.setAttribute("href", url)
                link.style = "visibility:hidden"
                link.download = fileName + ".csv"
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

            }
        }
    }
}
},{}],41:[function(require,module,exports){
module.exports = {
    toClock: (data) => {

        var timestamp, day, hr, min, sec
        if (typeof data === "number") timestamp = data
        else { 
            timestamp = data.timestamp
            day = data.day
            hr = data.hr
            min = data.min
            sec = data.sec
        }

        if (!timestamp) return "00:00"
        var days_ = Math.floor(timestamp / 86400000) + ""
        var _days = timestamp % 86400000
        var hrs_ = Math.floor(_days / 3600000) + ""
        var _hrs = _days % 3600000
        var mins_ = Math.floor(_hrs / 60000) + ""
        var _mins = _hrs % 60000
        var secs_ = Math.floor(_mins / 1000) + ""

        if (days_.length === 1) days_ = "0" + days_
        if (hrs_.length === 1) hrs_ = "0" + hrs_
        if (mins_.length === 1) mins_ = "0" + mins_
        if (secs_.length === 1) secs_ = "0" + secs_

        return (day ? days_ + ":" : "") + (hr ? hrs_ + ":" : "") + (min ? mins_ : "") + (sec ? ":" + secs_ : "")
    }
}
},{}],42:[function(require,module,exports){
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
},{"./decode":9,"./kernel":30,"./toArray":39}],43:[function(require,module,exports){
// const XLSX = require("xlsx")

module.exports = {
    toExcel: (file = {}) => {

        var data = file.data || file.json
        var fileName = file.name
        var myObject = []

        // This condition will generate the Label/Header
        var keys = file.fields || file.keys || file.headers || []
        if (keys.length > 0) data.map((data, i) => {
            myObject[i] = {}
            keys.map(key => myObject[i][key] = data[key])
        })
        else myObject = data

        var myFile = `${fileName}.xlsx`
        var myWorkSheet = XLSX.utils.json_to_sheet(myObject)
        var myWorkBook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(myWorkBook, myWorkSheet, "Sheet")
        XLSX.writeFile(myWorkBook, myFile)
    }
}
},{}],44:[function(require,module,exports){
module.exports = {
    toPdf: async (options) => {

        var blob = new Blob([`<html><head><meta charset="UTF-8"></head><body>${options.html}</body></html>`], { type: 'text/html' })
 
        //Check the Browser type and download the File.
        var isIE = false || !!document.documentMode;
        if (isIE) {
            window.navigator.msSaveBlob(blob, options.name);
        } else {
            var url = window.URL || window.webkitURL;
            link = url.createObjectURL(blob);
            
            var a = document.createElement("a");
            a.setAttribute("download", options.name);
            a.setAttribute("href", link);
            /*document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);*/
            var evt = new MouseEvent('click', {
                'view': window,
                'bubbles': true,
                'cancelable': false
            });
            a.dispatchEvent(evt);
        }
    }
}
},{}],45:[function(require,module,exports){
// arabic
var daysAr = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"]
var monthsAr = ["كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"]
var toArabicNum = (string) => string.replace(/\d/g, d =>  '٠١٢٣٤٥٦٧٨٩'[d])

// english
var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
var simpleDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
var simpleMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

//Both Persian and Arabic to English digits.
var IntoEn = (string) => string.replace(/[\u06F0-\u06F9\u0660-\u0669]/g, d => ((c=d.charCodeAt()) > 1775 ? c - 1776 : c - 1632))

module.exports = {
    toSimplifiedDate: ({ timestamp, lang, simplified, time }) => {

        timestamp = parseInt(timestamp)
        var date = new Date(timestamp)

        var dayofWeek = date.getDay()
        var dayofMonth = date.getDate()
        var month = date.getMonth()
        var year = date.getFullYear()
        var hours = date.getHours()
        var mins = date.getMinutes()
        var secs = date.getSeconds()

        if (hours.toString().length === 1) hours = "0" + hours
        if (mins.toString().length === 1) mins = "0" + mins
        if (secs.toString().length === 1) secs = "0" + secs

        var simplifiedDate

        if (lang === "ar") simplifiedDate = daysAr[dayofWeek] + " " + dayofMonth + " " + monthsAr[month] + " " + year
        
        else if (lang === "en" && simplified) simplifiedDate = simpleDays[dayofWeek] + " " + dayofMonth + " " + simpleMonths[month] + " " + year
        
        else if (lang === "en" && !simplified) simplifiedDate = days[dayofWeek] + " " + dayofMonth + " " + months[month] + " " + year

        if (time) simplifiedDate += " | " + hours + ":" + mins + ":" + secs

        if (lang === "ar") simplifiedDate = toArabicNum(simplifiedDate)

        return simplifiedDate
    }
}
},{}],46:[function(require,module,exports){
const { toApproval, actions } = require("./kernel")
const { clone } = require("./clone")
const { toParam } = require("./kernel")
const { toValue } = require("./kernel")
const { isEqual } = require("./isEqual")
const { generate } = require("./generate")

const watch = ({ lookupActions, __, stack, string, id }) => {

    let view = window.views[id]
    if (!view) return

    let watch = actions["encode()"]({ _window, id, stack, string: actions["encode()"]({ _window, id, stack, string, start: "'" }) })

    let approved = toApproval({ id, lookupActions, stack, props, __, data: watch.split('?')[2] })
    if (!approved || !watch) return

    watch.split('?')[0].split(';').map(_watch => {

        let timer = 500, watchAddress = { id: generate() }
        view[`${_watch}-watch`] = clone(toValue({ id, lookupActions, stack, props:{isValue:true}, __, data: _watch }))
        
        const myFn = async () => {
            
            let value = toValue({ id, lookupActions, stack, props, data: _watch })

            if ((value === undefined && view[`${_watch}-watch`] === undefined) || isEqual(value, view[`${_watch}-watch`])) return

            view[`${_watch}-watch`] = clone(value)
            
            // params
            toParam({ id, lookupActions, stack, props, data: watch.split('?')[1], object: [view], __ })
            
            // approval
            let approved = toApproval({ id, lookupActions, stack, props, data: watch.split('?')[2], __ })
            if (!approved) return
                
            // params
            if (view.await) toParam({ id, lookupActions, stack, props, data: view.await.join(';'), __ })
        }

        view.__timers__.push(setInterval(myFn, timer))
    })
}

module.exports = { watch }
},{"./clone":3,"./generate":16,"./isEqual":26,"./kernel":30}],47:[function(require,module,exports){
(function (global){(function (){
/**
 * EasyQRCodeJS
 * 
 * Cross-browser QRCode generator for pure javascript. Support Canvas, SVG and Table drawing methods. Support Dot style, Logo, Background image, Colorful, Title etc. settings. Support Angular, Vue.js, React, Next.js, Svelte framework. Support binary(hex) data mode.(Running with DOM on client side)
 * 
 * Version 4.6.0
 * 
 * @author [ inthinkcolor@gmail.com ]
 * 
 * @see https://github.com/ushelp/EasyQRCodeJS 
 * @see http://www.easyproject.cn/easyqrcodejs/tryit.html
 * @see https://github.com/ushelp/EasyQRCodeJS-NodeJS
 * 
 * Copyright 2017 Ray, EasyProject
 * Released under the MIT license
 * 
 * [Support AMD, CMD, CommonJS/Node.js]
 * 
 */
!function(){"use strict";function a(a,b){var c,d=Object.keys(b);for(c=0;c<d.length;c++)a=a.replace(new RegExp("\\{"+d[c]+"\\}","gi"),b[d[c]]);return a}function b(a){var b,c,d;if(!a)throw new Error("cannot create a random attribute name for an undefined object");b="ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",c="";do{for(c="",d=0;d<12;d++)c+=b[Math.floor(Math.random()*b.length)]}while(a[c]);return c}function c(a){var b={left:"start",right:"end",center:"middle",start:"start",end:"end"};return b[a]||b.start}function d(a){var b={alphabetic:"alphabetic",hanging:"hanging",top:"text-before-edge",bottom:"text-after-edge",middle:"central"};return b[a]||b.alphabetic}var e,f,g,h,i;i=function(a,b){var c,d,e,f={};for(a=a.split(","),b=b||10,c=0;c<a.length;c+=2)d="&"+a[c+1]+";",e=parseInt(a[c],b),f[d]="&#"+e+";";return f["\\xa0"]="&#160;",f}("50,nbsp,51,iexcl,52,cent,53,pound,54,curren,55,yen,56,brvbar,57,sect,58,uml,59,copy,5a,ordf,5b,laquo,5c,not,5d,shy,5e,reg,5f,macr,5g,deg,5h,plusmn,5i,sup2,5j,sup3,5k,acute,5l,micro,5m,para,5n,middot,5o,cedil,5p,sup1,5q,ordm,5r,raquo,5s,frac14,5t,frac12,5u,frac34,5v,iquest,60,Agrave,61,Aacute,62,Acirc,63,Atilde,64,Auml,65,Aring,66,AElig,67,Ccedil,68,Egrave,69,Eacute,6a,Ecirc,6b,Euml,6c,Igrave,6d,Iacute,6e,Icirc,6f,Iuml,6g,ETH,6h,Ntilde,6i,Ograve,6j,Oacute,6k,Ocirc,6l,Otilde,6m,Ouml,6n,times,6o,Oslash,6p,Ugrave,6q,Uacute,6r,Ucirc,6s,Uuml,6t,Yacute,6u,THORN,6v,szlig,70,agrave,71,aacute,72,acirc,73,atilde,74,auml,75,aring,76,aelig,77,ccedil,78,egrave,79,eacute,7a,ecirc,7b,euml,7c,igrave,7d,iacute,7e,icirc,7f,iuml,7g,eth,7h,ntilde,7i,ograve,7j,oacute,7k,ocirc,7l,otilde,7m,ouml,7n,divide,7o,oslash,7p,ugrave,7q,uacute,7r,ucirc,7s,uuml,7t,yacute,7u,thorn,7v,yuml,ci,fnof,sh,Alpha,si,Beta,sj,Gamma,sk,Delta,sl,Epsilon,sm,Zeta,sn,Eta,so,Theta,sp,Iota,sq,Kappa,sr,Lambda,ss,Mu,st,Nu,su,Xi,sv,Omicron,t0,Pi,t1,Rho,t3,Sigma,t4,Tau,t5,Upsilon,t6,Phi,t7,Chi,t8,Psi,t9,Omega,th,alpha,ti,beta,tj,gamma,tk,delta,tl,epsilon,tm,zeta,tn,eta,to,theta,tp,iota,tq,kappa,tr,lambda,ts,mu,tt,nu,tu,xi,tv,omicron,u0,pi,u1,rho,u2,sigmaf,u3,sigma,u4,tau,u5,upsilon,u6,phi,u7,chi,u8,psi,u9,omega,uh,thetasym,ui,upsih,um,piv,812,bull,816,hellip,81i,prime,81j,Prime,81u,oline,824,frasl,88o,weierp,88h,image,88s,real,892,trade,89l,alefsym,8cg,larr,8ch,uarr,8ci,rarr,8cj,darr,8ck,harr,8dl,crarr,8eg,lArr,8eh,uArr,8ei,rArr,8ej,dArr,8ek,hArr,8g0,forall,8g2,part,8g3,exist,8g5,empty,8g7,nabla,8g8,isin,8g9,notin,8gb,ni,8gf,prod,8gh,sum,8gi,minus,8gn,lowast,8gq,radic,8gt,prop,8gu,infin,8h0,ang,8h7,and,8h8,or,8h9,cap,8ha,cup,8hb,int,8hk,there4,8hs,sim,8i5,cong,8i8,asymp,8j0,ne,8j1,equiv,8j4,le,8j5,ge,8k2,sub,8k3,sup,8k4,nsub,8k6,sube,8k7,supe,8kl,oplus,8kn,otimes,8l5,perp,8m5,sdot,8o8,lceil,8o9,rceil,8oa,lfloor,8ob,rfloor,8p9,lang,8pa,rang,9ea,loz,9j0,spades,9j3,clubs,9j5,hearts,9j6,diams,ai,OElig,aj,oelig,b0,Scaron,b1,scaron,bo,Yuml,m6,circ,ms,tilde,802,ensp,803,emsp,809,thinsp,80c,zwnj,80d,zwj,80e,lrm,80f,rlm,80j,ndash,80k,mdash,80o,lsquo,80p,rsquo,80q,sbquo,80s,ldquo,80t,rdquo,80u,bdquo,810,dagger,811,Dagger,81g,permil,81p,lsaquo,81q,rsaquo,85c,euro",32),e={strokeStyle:{svgAttr:"stroke",canvas:"#000000",svg:"none",apply:"stroke"},fillStyle:{svgAttr:"fill",canvas:"#000000",svg:null,apply:"fill"},lineCap:{svgAttr:"stroke-linecap",canvas:"butt",svg:"butt",apply:"stroke"},lineJoin:{svgAttr:"stroke-linejoin",canvas:"miter",svg:"miter",apply:"stroke"},miterLimit:{svgAttr:"stroke-miterlimit",canvas:10,svg:4,apply:"stroke"},lineWidth:{svgAttr:"stroke-width",canvas:1,svg:1,apply:"stroke"},globalAlpha:{svgAttr:"opacity",canvas:1,svg:1,apply:"fill stroke"},font:{canvas:"10px sans-serif"},shadowColor:{canvas:"#000000"},shadowOffsetX:{canvas:0},shadowOffsetY:{canvas:0},shadowBlur:{canvas:0},textAlign:{canvas:"start"},textBaseline:{canvas:"alphabetic"},lineDash:{svgAttr:"stroke-dasharray",canvas:[],svg:null,apply:"stroke"}},g=function(a,b){this.__root=a,this.__ctx=b},g.prototype.addColorStop=function(b,c){var d,e,f=this.__ctx.__createElement("stop");f.setAttribute("offset",b),-1!==c.indexOf("rgba")?(d=/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d?\.?\d*)\s*\)/gi,e=d.exec(c),f.setAttribute("stop-color",a("rgb({r},{g},{b})",{r:e[1],g:e[2],b:e[3]})),f.setAttribute("stop-opacity",e[4])):f.setAttribute("stop-color",c),this.__root.appendChild(f)},h=function(a,b){this.__root=a,this.__ctx=b},f=function(a){var b,c={width:500,height:500,enableMirroring:!1};if(arguments.length>1?(b=c,b.width=arguments[0],b.height=arguments[1]):b=a||c,!(this instanceof f))return new f(b);this.width=b.width||c.width,this.height=b.height||c.height,this.enableMirroring=void 0!==b.enableMirroring?b.enableMirroring:c.enableMirroring,this.canvas=this,this.__document=b.document||document,b.ctx?this.__ctx=b.ctx:(this.__canvas=this.__document.createElement("canvas"),this.__ctx=this.__canvas.getContext("2d")),this.__setDefaultStyles(),this.__stack=[this.__getStyleState()],this.__groupStack=[],this.__root=this.__document.createElementNS("http://www.w3.org/2000/svg","svg"),this.__root.setAttribute("version",1.1),this.__root.setAttribute("xmlns","http://www.w3.org/2000/svg"),this.__root.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink"),this.__root.setAttribute("width",this.width),this.__root.setAttribute("height",this.height),this.__ids={},this.__defs=this.__document.createElementNS("http://www.w3.org/2000/svg","defs"),this.__root.appendChild(this.__defs),this.__currentElement=this.__document.createElementNS("http://www.w3.org/2000/svg","g"),this.__root.appendChild(this.__currentElement)},f.prototype.__createElement=function(a,b,c){void 0===b&&(b={});var d,e,f=this.__document.createElementNS("http://www.w3.org/2000/svg",a),g=Object.keys(b);for(c&&(f.setAttribute("fill","none"),f.setAttribute("stroke","none")),d=0;d<g.length;d++)e=g[d],f.setAttribute(e,b[e]);return f},f.prototype.__setDefaultStyles=function(){var a,b,c=Object.keys(e);for(a=0;a<c.length;a++)b=c[a],this[b]=e[b].canvas},f.prototype.__applyStyleState=function(a){var b,c,d=Object.keys(a);for(b=0;b<d.length;b++)c=d[b],this[c]=a[c]},f.prototype.__getStyleState=function(){var a,b,c={},d=Object.keys(e);for(a=0;a<d.length;a++)b=d[a],c[b]=this[b];return c},f.prototype.__applyStyleToCurrentElement=function(b){var c=this.__currentElement,d=this.__currentElementsToStyle;d&&(c.setAttribute(b,""),c=d.element,d.children.forEach(function(a){a.setAttribute(b,"")}));var f,i,j,k,l,m,n=Object.keys(e);for(f=0;f<n.length;f++)if(i=e[n[f]],j=this[n[f]],i.apply)if(j instanceof h){if(j.__ctx)for(;j.__ctx.__defs.childNodes.length;)k=j.__ctx.__defs.childNodes[0].getAttribute("id"),this.__ids[k]=k,this.__defs.appendChild(j.__ctx.__defs.childNodes[0]);c.setAttribute(i.apply,a("url(#{id})",{id:j.__root.getAttribute("id")}))}else if(j instanceof g)c.setAttribute(i.apply,a("url(#{id})",{id:j.__root.getAttribute("id")}));else if(-1!==i.apply.indexOf(b)&&i.svg!==j)if("stroke"!==i.svgAttr&&"fill"!==i.svgAttr||-1===j.indexOf("rgba")){var o=i.svgAttr;if("globalAlpha"===n[f]&&(o=b+"-"+i.svgAttr,c.getAttribute(o)))continue;c.setAttribute(o,j)}else{l=/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d?\.?\d*)\s*\)/gi,m=l.exec(j),c.setAttribute(i.svgAttr,a("rgb({r},{g},{b})",{r:m[1],g:m[2],b:m[3]}));var p=m[4],q=this.globalAlpha;null!=q&&(p*=q),c.setAttribute(i.svgAttr+"-opacity",p)}},f.prototype.__closestGroupOrSvg=function(a){return a=a||this.__currentElement,"g"===a.nodeName||"svg"===a.nodeName?a:this.__closestGroupOrSvg(a.parentNode)},f.prototype.getSerializedSvg=function(a){var b,c,d,e,f,g,h=(new XMLSerializer).serializeToString(this.__root);if(g=/xmlns="http:\/\/www\.w3\.org\/2000\/svg".+xmlns="http:\/\/www\.w3\.org\/2000\/svg/gi,g.test(h)&&(h=h.replace('xmlns="http://www.w3.org/2000/svg','xmlns:xlink="http://www.w3.org/1999/xlink')),a)for(b=Object.keys(i),c=0;c<b.length;c++)d=b[c],e=i[d],f=new RegExp(d,"gi"),f.test(h)&&(h=h.replace(f,e));return h},f.prototype.getSvg=function(){return this.__root},f.prototype.save=function(){var a=this.__createElement("g"),b=this.__closestGroupOrSvg();this.__groupStack.push(b),b.appendChild(a),this.__currentElement=a,this.__stack.push(this.__getStyleState())},f.prototype.restore=function(){this.__currentElement=this.__groupStack.pop(),this.__currentElementsToStyle=null,this.__currentElement||(this.__currentElement=this.__root.childNodes[1]);var a=this.__stack.pop();this.__applyStyleState(a)},f.prototype.__addTransform=function(a){var b=this.__closestGroupOrSvg();if(b.childNodes.length>0){"path"===this.__currentElement.nodeName&&(this.__currentElementsToStyle||(this.__currentElementsToStyle={element:b,children:[]}),this.__currentElementsToStyle.children.push(this.__currentElement),this.__applyCurrentDefaultPath());var c=this.__createElement("g");b.appendChild(c),this.__currentElement=c}var d=this.__currentElement.getAttribute("transform");d?d+=" ":d="",d+=a,this.__currentElement.setAttribute("transform",d)},f.prototype.scale=function(b,c){void 0===c&&(c=b),this.__addTransform(a("scale({x},{y})",{x:b,y:c}))},f.prototype.rotate=function(b){var c=180*b/Math.PI;this.__addTransform(a("rotate({angle},{cx},{cy})",{angle:c,cx:0,cy:0}))},f.prototype.translate=function(b,c){this.__addTransform(a("translate({x},{y})",{x:b,y:c}))},f.prototype.transform=function(b,c,d,e,f,g){this.__addTransform(a("matrix({a},{b},{c},{d},{e},{f})",{a:b,b:c,c:d,d:e,e:f,f:g}))},f.prototype.beginPath=function(){var a,b;this.__currentDefaultPath="",this.__currentPosition={},a=this.__createElement("path",{},!0),b=this.__closestGroupOrSvg(),b.appendChild(a),this.__currentElement=a},f.prototype.__applyCurrentDefaultPath=function(){var a=this.__currentElement;"path"===a.nodeName?a.setAttribute("d",this.__currentDefaultPath):console.error("Attempted to apply path command to node",a.nodeName)},f.prototype.__addPathCommand=function(a){this.__currentDefaultPath+=" ",this.__currentDefaultPath+=a},f.prototype.moveTo=function(b,c){"path"!==this.__currentElement.nodeName&&this.beginPath(),this.__currentPosition={x:b,y:c},this.__addPathCommand(a("M {x} {y}",{x:b,y:c}))},f.prototype.closePath=function(){this.__currentDefaultPath&&this.__addPathCommand("Z")},f.prototype.lineTo=function(b,c){this.__currentPosition={x:b,y:c},this.__currentDefaultPath.indexOf("M")>-1?this.__addPathCommand(a("L {x} {y}",{x:b,y:c})):this.__addPathCommand(a("M {x} {y}",{x:b,y:c}))},f.prototype.bezierCurveTo=function(b,c,d,e,f,g){this.__currentPosition={x:f,y:g},this.__addPathCommand(a("C {cp1x} {cp1y} {cp2x} {cp2y} {x} {y}",{cp1x:b,cp1y:c,cp2x:d,cp2y:e,x:f,y:g}))},f.prototype.quadraticCurveTo=function(b,c,d,e){this.__currentPosition={x:d,y:e},this.__addPathCommand(a("Q {cpx} {cpy} {x} {y}",{cpx:b,cpy:c,x:d,y:e}))};var j=function(a){var b=Math.sqrt(a[0]*a[0]+a[1]*a[1]);return[a[0]/b,a[1]/b]};f.prototype.arcTo=function(a,b,c,d,e){var f=this.__currentPosition&&this.__currentPosition.x,g=this.__currentPosition&&this.__currentPosition.y;if(void 0!==f&&void 0!==g){if(e<0)throw new Error("IndexSizeError: The radius provided ("+e+") is negative.");if(f===a&&g===b||a===c&&b===d||0===e)return void this.lineTo(a,b);var h=j([f-a,g-b]),i=j([c-a,d-b]);if(h[0]*i[1]==h[1]*i[0])return void this.lineTo(a,b);var k=h[0]*i[0]+h[1]*i[1],l=Math.acos(Math.abs(k)),m=j([h[0]+i[0],h[1]+i[1]]),n=e/Math.sin(l/2),o=a+n*m[0],p=b+n*m[1],q=[-h[1],h[0]],r=[i[1],-i[0]],s=function(a){var b=a[0];return a[1]>=0?Math.acos(b):-Math.acos(b)},t=s(q),u=s(r);this.lineTo(o+q[0]*e,p+q[1]*e),this.arc(o,p,e,t,u)}},f.prototype.stroke=function(){"path"===this.__currentElement.nodeName&&this.__currentElement.setAttribute("paint-order","fill stroke markers"),this.__applyCurrentDefaultPath(),this.__applyStyleToCurrentElement("stroke")},f.prototype.fill=function(){"path"===this.__currentElement.nodeName&&this.__currentElement.setAttribute("paint-order","stroke fill markers"),this.__applyCurrentDefaultPath(),this.__applyStyleToCurrentElement("fill")},f.prototype.rect=function(a,b,c,d){"path"!==this.__currentElement.nodeName&&this.beginPath(),this.moveTo(a,b),this.lineTo(a+c,b),this.lineTo(a+c,b+d),this.lineTo(a,b+d),this.lineTo(a,b),this.closePath()},f.prototype.fillRect=function(a,b,c,d){var e,f;e=this.__createElement("rect",{x:a,y:b,width:c,height:d,"shape-rendering":"crispEdges"},!0),f=this.__closestGroupOrSvg(),f.appendChild(e),this.__currentElement=e,this.__applyStyleToCurrentElement("fill")},f.prototype.strokeRect=function(a,b,c,d){var e,f;e=this.__createElement("rect",{x:a,y:b,width:c,height:d},!0),f=this.__closestGroupOrSvg(),f.appendChild(e),this.__currentElement=e,this.__applyStyleToCurrentElement("stroke")},f.prototype.__clearCanvas=function(){for(var a=this.__closestGroupOrSvg(),b=a.getAttribute("transform"),c=this.__root.childNodes[1],d=c.childNodes,e=d.length-1;e>=0;e--)d[e]&&c.removeChild(d[e]);this.__currentElement=c,this.__groupStack=[],b&&this.__addTransform(b)},f.prototype.clearRect=function(a,b,c,d){if(0===a&&0===b&&c===this.width&&d===this.height)return void this.__clearCanvas();var e,f=this.__closestGroupOrSvg();e=this.__createElement("rect",{x:a,y:b,width:c,height:d,fill:"#FFFFFF"},!0),f.appendChild(e)},f.prototype.createLinearGradient=function(a,c,d,e){var f=this.__createElement("linearGradient",{id:b(this.__ids),x1:a+"px",x2:d+"px",y1:c+"px",y2:e+"px",gradientUnits:"userSpaceOnUse"},!1);return this.__defs.appendChild(f),new g(f,this)},f.prototype.createRadialGradient=function(a,c,d,e,f,h){var i=this.__createElement("radialGradient",{id:b(this.__ids),cx:e+"px",cy:f+"px",r:h+"px",fx:a+"px",fy:c+"px",gradientUnits:"userSpaceOnUse"},!1);return this.__defs.appendChild(i),new g(i,this)},f.prototype.__parseFont=function(){var a=/^\s*(?=(?:(?:[-a-z]+\s*){0,2}(italic|oblique))?)(?=(?:(?:[-a-z]+\s*){0,2}(small-caps))?)(?=(?:(?:[-a-z]+\s*){0,2}(bold(?:er)?|lighter|[1-9]00))?)(?:(?:normal|\1|\2|\3)\s*){0,3}((?:xx?-)?(?:small|large)|medium|smaller|larger|[.\d]+(?:\%|in|[cem]m|ex|p[ctx]))(?:\s*\/\s*(normal|[.\d]+(?:\%|in|[cem]m|ex|p[ctx])))?\s*([-,\'\"\sa-z0-9]+?)\s*$/i,b=a.exec(this.font),c={style:b[1]||"normal",size:b[4]||"10px",family:b[6]||"sans-serif",weight:b[3]||"normal",decoration:b[2]||"normal",href:null};return"underline"===this.__fontUnderline&&(c.decoration="underline"),this.__fontHref&&(c.href=this.__fontHref),c},f.prototype.__wrapTextLink=function(a,b){if(a.href){var c=this.__createElement("a");return c.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a.href),c.appendChild(b),c}return b},f.prototype.__applyText=function(a,b,e,f){var g=this.__parseFont(),h=this.__closestGroupOrSvg(),i=this.__createElement("text",{"font-family":g.family,"font-size":g.size,"font-style":g.style,"font-weight":g.weight,"text-decoration":g.decoration,x:b,y:e,"text-anchor":c(this.textAlign),"dominant-baseline":d(this.textBaseline)},!0);i.appendChild(this.__document.createTextNode(a)),this.__currentElement=i,this.__applyStyleToCurrentElement(f),h.appendChild(this.__wrapTextLink(g,i))},f.prototype.fillText=function(a,b,c){this.__applyText(a,b,c,"fill")},f.prototype.strokeText=function(a,b,c){this.__applyText(a,b,c,"stroke")},f.prototype.measureText=function(a){return this.__ctx.font=this.font,this.__ctx.measureText(a)},f.prototype.arc=function(b,c,d,e,f,g){if(e!==f){e%=2*Math.PI,f%=2*Math.PI,e===f&&(f=(f+2*Math.PI-.001*(g?-1:1))%(2*Math.PI));var h=b+d*Math.cos(f),i=c+d*Math.sin(f),j=b+d*Math.cos(e),k=c+d*Math.sin(e),l=g?0:1,m=0,n=f-e;n<0&&(n+=2*Math.PI),m=g?n>Math.PI?0:1:n>Math.PI?1:0,this.lineTo(j,k),this.__addPathCommand(a("A {rx} {ry} {xAxisRotation} {largeArcFlag} {sweepFlag} {endX} {endY}",{rx:d,ry:d,xAxisRotation:0,largeArcFlag:m,sweepFlag:l,endX:h,endY:i})),this.__currentPosition={x:h,y:i}}},f.prototype.clip=function(){var c=this.__closestGroupOrSvg(),d=this.__createElement("clipPath"),e=b(this.__ids),f=this.__createElement("g");this.__applyCurrentDefaultPath(),c.removeChild(this.__currentElement),d.setAttribute("id",e),d.appendChild(this.__currentElement),this.__defs.appendChild(d),c.setAttribute("clip-path",a("url(#{id})",{id:e})),c.appendChild(f),this.__currentElement=f},f.prototype.drawImage=function(){var a,b,c,d,e,g,h,i,j,k,l,m,n,o,p=Array.prototype.slice.call(arguments),q=p[0],r=0,s=0;if(3===p.length)a=p[1],b=p[2],e=q.width,g=q.height,c=e,d=g;else if(5===p.length)a=p[1],b=p[2],c=p[3],d=p[4],e=q.width,g=q.height;else{if(9!==p.length)throw new Error("Invalid number of arguments passed to drawImage: "+arguments.length);r=p[1],s=p[2],e=p[3],g=p[4],a=p[5],b=p[6],c=p[7],d=p[8]}h=this.__closestGroupOrSvg(),this.__currentElement;var t="translate("+a+", "+b+")";if(q instanceof f){if(i=q.getSvg().cloneNode(!0),i.childNodes&&i.childNodes.length>1){for(j=i.childNodes[0];j.childNodes.length;)o=j.childNodes[0].getAttribute("id"),this.__ids[o]=o,this.__defs.appendChild(j.childNodes[0]);if(k=i.childNodes[1]){var u,v=k.getAttribute("transform");u=v?v+" "+t:t,k.setAttribute("transform",u),h.appendChild(k)}}}else"CANVAS"!==q.nodeName&&"IMG"!==q.nodeName||(l=this.__createElement("image"),l.setAttribute("width",c),l.setAttribute("height",d),l.setAttribute("preserveAspectRatio","none"),l.setAttribute("opacity",this.globalAlpha),(r||s||e!==q.width||g!==q.height)&&(m=this.__document.createElement("canvas"),m.width=c,m.height=d,n=m.getContext("2d"),n.drawImage(q,r,s,e,g,0,0,c,d),q=m),l.setAttribute("transform",t),l.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","CANVAS"===q.nodeName?q.toDataURL():q.originalSrc),h.appendChild(l))},f.prototype.createPattern=function(a,c){var d,e=this.__document.createElementNS("http://www.w3.org/2000/svg","pattern"),g=b(this.__ids);return e.setAttribute("id",g),e.setAttribute("width",a.width),e.setAttribute("height",a.height),"CANVAS"===a.nodeName||"IMG"===a.nodeName?(d=this.__document.createElementNS("http://www.w3.org/2000/svg","image"),d.setAttribute("width",a.width),d.setAttribute("height",a.height),d.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","CANVAS"===a.nodeName?a.toDataURL():a.getAttribute("src")),e.appendChild(d),this.__defs.appendChild(e)):a instanceof f&&(e.appendChild(a.__root.childNodes[1]),this.__defs.appendChild(e)),new h(e,this)},f.prototype.setLineDash=function(a){a&&a.length>0?this.lineDash=a.join(","):this.lineDash=null},f.prototype.drawFocusRing=function(){},f.prototype.createImageData=function(){},f.prototype.getImageData=function(){},f.prototype.putImageData=function(){},f.prototype.globalCompositeOperation=function(){},f.prototype.setTransform=function(){},"object"==typeof window&&(window.C2S=f),"object"==typeof module&&"object"==typeof module.exports&&(module.exports=f)}(),function(){"use strict";function a(a,b,c){if(this.mode=q.MODE_8BIT_BYTE,this.data=a,this.parsedData=[],b){for(var d=0,e=this.data.length;d<e;d++){var f=[],g=this.data.charCodeAt(d);f[0]=g,this.parsedData.push(f)}this.parsedData=Array.prototype.concat.apply([],this.parsedData)}else this.parsedData=function(a){for(var b=[],c=0;c<a.length;c++){var d=a.charCodeAt(c);d<128?b.push(d):d<2048?b.push(192|d>>6,128|63&d):d<55296||d>=57344?b.push(224|d>>12,128|d>>6&63,128|63&d):(c++,d=65536+((1023&d)<<10|1023&a.charCodeAt(c)),b.push(240|d>>18,128|d>>12&63,128|d>>6&63,128|63&d))}return b}(a);this.parsedData=Array.prototype.concat.apply([],this.parsedData),c||this.parsedData.length==this.data.length||(this.parsedData.unshift(191),this.parsedData.unshift(187),this.parsedData.unshift(239))}function b(a,b){this.typeNumber=a,this.errorCorrectLevel=b,this.modules=null,this.moduleCount=0,this.dataCache=null,this.dataList=[]}function c(a,b){if(a.length==i)throw new Error(a.length+"/"+b);for(var c=0;c<a.length&&0==a[c];)c++;this.num=new Array(a.length-c+b);for(var d=0;d<a.length-c;d++)this.num[d]=a[d+c]}function d(a,b){this.totalCount=a,this.dataCount=b}function e(){this.buffer=[],this.length=0}function f(){var a=!1,b=navigator.userAgent;if(/android/i.test(b)){a=!0;var c=b.toString().match(/android ([0-9]\.[0-9])/i);c&&c[1]&&(a=parseFloat(c[1]))}return a}function g(a,b){for(var c=b.correctLevel,d=1,e=h(a),f=0,g=w.length;f<g;f++){var i=0;switch(c){case r.L:i=w[f][0];break;case r.M:i=w[f][1];break;case r.Q:i=w[f][2];break;case r.H:i=w[f][3]}if(e<=i)break;d++}if(d>w.length)throw new Error("Too long data. the CorrectLevel."+["M","L","H","Q"][c]+" limit length is "+i);return 0!=b.version&&(d<=b.version?(d=b.version,b.runVersion=d):(console.warn("QR Code version "+b.version+" too small, run version use "+d),b.runVersion=d)),d}function h(a){return encodeURI(a).toString().replace(/\%[0-9a-fA-F]{2}/g,"a").length}var i,j,k="object"==typeof global&&global&&global.Object===Object&&global,l="object"==typeof self&&self&&self.Object===Object&&self,m=k||l||Function("return this")(),n="object"==typeof exports&&exports&&!exports.nodeType&&exports,o=n&&"object"==typeof module&&module&&!module.nodeType&&module,p=m.QRCode;a.prototype={getLength:function(a){return this.parsedData.length},write:function(a){for(var b=0,c=this.parsedData.length;b<c;b++)a.put(this.parsedData[b],8)}},b.prototype={addData:function(b,c,d){var e=new a(b,c,d);this.dataList.push(e),this.dataCache=null},isDark:function(a,b){if(a<0||this.moduleCount<=a||b<0||this.moduleCount<=b)throw new Error(a+","+b);return this.modules[a][b][0]},getEye:function(a,b){if(a<0||this.moduleCount<=a||b<0||this.moduleCount<=b)throw new Error(a+","+b);var c=this.modules[a][b];if(c[1]){var d="P"+c[1]+"_"+c[2];return"A"==c[2]&&(d="A"+c[1]),{isDark:c[0],type:d}}return null},getModuleCount:function(){return this.moduleCount},make:function(){this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(a,c){this.moduleCount=4*this.typeNumber+17,this.modules=new Array(this.moduleCount);for(var d=0;d<this.moduleCount;d++){this.modules[d]=new Array(this.moduleCount);for(var e=0;e<this.moduleCount;e++)this.modules[d][e]=[]}this.setupPositionProbePattern(0,0,"TL"),this.setupPositionProbePattern(this.moduleCount-7,0,"BL"),this.setupPositionProbePattern(0,this.moduleCount-7,"TR"),this.setupPositionAdjustPattern("A"),this.setupTimingPattern(),this.setupTypeInfo(a,c),this.typeNumber>=7&&this.setupTypeNumber(a),null==this.dataCache&&(this.dataCache=b.createData(this.typeNumber,this.errorCorrectLevel,this.dataList)),this.mapData(this.dataCache,c)},setupPositionProbePattern:function(a,b,c){for(var d=-1;d<=7;d++)if(!(a+d<=-1||this.moduleCount<=a+d))for(var e=-1;e<=7;e++)b+e<=-1||this.moduleCount<=b+e||(0<=d&&d<=6&&(0==e||6==e)||0<=e&&e<=6&&(0==d||6==d)||2<=d&&d<=4&&2<=e&&e<=4?(this.modules[a+d][b+e][0]=!0,this.modules[a+d][b+e][2]=c,this.modules[a+d][b+e][1]=-0==d||-0==e||6==d||6==e?"O":"I"):this.modules[a+d][b+e][0]=!1)},getBestMaskPattern:function(){for(var a=0,b=0,c=0;c<8;c++){this.makeImpl(!0,c);var d=t.getLostPoint(this);(0==c||a>d)&&(a=d,b=c)}return b},createMovieClip:function(a,b,c){var d=a.createEmptyMovieClip(b,c);this.make();for(var e=0;e<this.modules.length;e++)for(var f=1*e,g=0;g<this.modules[e].length;g++){var h=1*g,i=this.modules[e][g][0];i&&(d.beginFill(0,100),d.moveTo(h,f),d.lineTo(h+1,f),d.lineTo(h+1,f+1),d.lineTo(h,f+1),d.endFill())}return d},setupTimingPattern:function(){for(var a=8;a<this.moduleCount-8;a++)null==this.modules[a][6][0]&&(this.modules[a][6][0]=a%2==0);for(var b=8;b<this.moduleCount-8;b++)null==this.modules[6][b][0]&&(this.modules[6][b][0]=b%2==0)},setupPositionAdjustPattern:function(a){for(var b=t.getPatternPosition(this.typeNumber),c=0;c<b.length;c++)for(var d=0;d<b.length;d++){var e=b[c],f=b[d];if(null==this.modules[e][f][0])for(var g=-2;g<=2;g++)for(var h=-2;h<=2;h++)-2==g||2==g||-2==h||2==h||0==g&&0==h?(this.modules[e+g][f+h][0]=!0,this.modules[e+g][f+h][2]=a,this.modules[e+g][f+h][1]=-2==g||-2==h||2==g||2==h?"O":"I"):this.modules[e+g][f+h][0]=!1}},setupTypeNumber:function(a){for(var b=t.getBCHTypeNumber(this.typeNumber),c=0;c<18;c++){var d=!a&&1==(b>>c&1);this.modules[Math.floor(c/3)][c%3+this.moduleCount-8-3][0]=d}for(var c=0;c<18;c++){var d=!a&&1==(b>>c&1);this.modules[c%3+this.moduleCount-8-3][Math.floor(c/3)][0]=d}},setupTypeInfo:function(a,b){for(var c=this.errorCorrectLevel<<3|b,d=t.getBCHTypeInfo(c),e=0;e<15;e++){var f=!a&&1==(d>>e&1);e<6?this.modules[e][8][0]=f:e<8?this.modules[e+1][8][0]=f:this.modules[this.moduleCount-15+e][8][0]=f}for(var e=0;e<15;e++){var f=!a&&1==(d>>e&1);e<8?this.modules[8][this.moduleCount-e-1][0]=f:e<9?this.modules[8][15-e-1+1][0]=f:this.modules[8][15-e-1][0]=f}this.modules[this.moduleCount-8][8][0]=!a},mapData:function(a,b){for(var c=-1,d=this.moduleCount-1,e=7,f=0,g=this.moduleCount-1;g>0;g-=2)for(6==g&&g--;;){for(var h=0;h<2;h++)if(null==this.modules[d][g-h][0]){var i=!1;f<a.length&&(i=1==(a[f]>>>e&1));var j=t.getMask(b,d,g-h);j&&(i=!i),this.modules[d][g-h][0]=i,e--,-1==e&&(f++,e=7)}if((d+=c)<0||this.moduleCount<=d){d-=c,c=-c;break}}}},b.PAD0=236,b.PAD1=17,b.createData=function(a,c,f){for(var g=d.getRSBlocks(a,c),h=new e,i=0;i<f.length;i++){var j=f[i];h.put(j.mode,4),h.put(j.getLength(),t.getLengthInBits(j.mode,a)),j.write(h)}for(var k=0,i=0;i<g.length;i++)k+=g[i].dataCount;if(h.getLengthInBits()>8*k)throw new Error("code length overflow. ("+h.getLengthInBits()+">"+8*k+")");for(h.getLengthInBits()+4<=8*k&&h.put(0,4);h.getLengthInBits()%8!=0;)h.putBit(!1);for(;;){if(h.getLengthInBits()>=8*k)break;if(h.put(b.PAD0,8),h.getLengthInBits()>=8*k)break;h.put(b.PAD1,8)}return b.createBytes(h,g)},b.createBytes=function(a,b){for(var d=0,e=0,f=0,g=new Array(b.length),h=new Array(b.length),i=0;i<b.length;i++){var j=b[i].dataCount,k=b[i].totalCount-j;e=Math.max(e,j),f=Math.max(f,k),g[i]=new Array(j);for(var l=0;l<g[i].length;l++)g[i][l]=255&a.buffer[l+d];d+=j;var m=t.getErrorCorrectPolynomial(k),n=new c(g[i],m.getLength()-1),o=n.mod(m);h[i]=new Array(m.getLength()-1);for(var l=0;l<h[i].length;l++){var p=l+o.getLength()-h[i].length;h[i][l]=p>=0?o.get(p):0}}for(var q=0,l=0;l<b.length;l++)q+=b[l].totalCount;for(var r=new Array(q),s=0,l=0;l<e;l++)for(var i=0;i<b.length;i++)l<g[i].length&&(r[s++]=g[i][l]);for(var l=0;l<f;l++)for(var i=0;i<b.length;i++)l<h[i].length&&(r[s++]=h[i][l]);return r};for(var q={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},r={L:1,M:0,Q:3,H:2},s={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},t={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(a){for(var b=a<<10;t.getBCHDigit(b)-t.getBCHDigit(t.G15)>=0;)b^=t.G15<<t.getBCHDigit(b)-t.getBCHDigit(t.G15);return(a<<10|b)^t.G15_MASK},getBCHTypeNumber:function(a){for(var b=a<<12;t.getBCHDigit(b)-t.getBCHDigit(t.G18)>=0;)b^=t.G18<<t.getBCHDigit(b)-t.getBCHDigit(t.G18);return a<<12|b},getBCHDigit:function(a){for(var b=0;0!=a;)b++,a>>>=1;return b},getPatternPosition:function(a){return t.PATTERN_POSITION_TABLE[a-1]},getMask:function(a,b,c){switch(a){case s.PATTERN000:return(b+c)%2==0;case s.PATTERN001:return b%2==0;case s.PATTERN010:return c%3==0;case s.PATTERN011:return(b+c)%3==0;case s.PATTERN100:return(Math.floor(b/2)+Math.floor(c/3))%2==0;case s.PATTERN101:return b*c%2+b*c%3==0;case s.PATTERN110:return(b*c%2+b*c%3)%2==0;case s.PATTERN111:return(b*c%3+(b+c)%2)%2==0;default:throw new Error("bad maskPattern:"+a)}},getErrorCorrectPolynomial:function(a){for(var b=new c([1],0),d=0;d<a;d++)b=b.multiply(new c([1,u.gexp(d)],0));return b},getLengthInBits:function(a,b){if(1<=b&&b<10)switch(a){case q.MODE_NUMBER:return 10;case q.MODE_ALPHA_NUM:return 9;case q.MODE_8BIT_BYTE:case q.MODE_KANJI:return 8;default:throw new Error("mode:"+a)}else if(b<27)switch(a){case q.MODE_NUMBER:return 12;case q.MODE_ALPHA_NUM:return 11;case q.MODE_8BIT_BYTE:return 16;case q.MODE_KANJI:return 10;default:throw new Error("mode:"+a)}else{if(!(b<41))throw new Error("type:"+b);switch(a){case q.MODE_NUMBER:return 14;case q.MODE_ALPHA_NUM:return 13;case q.MODE_8BIT_BYTE:return 16;case q.MODE_KANJI:return 12;default:throw new Error("mode:"+a)}}},getLostPoint:function(a){for(var b=a.getModuleCount(),c=0,d=0;d<b;d++)for(var e=0;e<b;e++){for(var f=0,g=a.isDark(d,e),h=-1;h<=1;h++)if(!(d+h<0||b<=d+h))for(var i=-1;i<=1;i++)e+i<0||b<=e+i||0==h&&0==i||g==a.isDark(d+h,e+i)&&f++;f>5&&(c+=3+f-5)}for(var d=0;d<b-1;d++)for(var e=0;e<b-1;e++){var j=0;a.isDark(d,e)&&j++,a.isDark(d+1,e)&&j++,a.isDark(d,e+1)&&j++,a.isDark(d+1,e+1)&&j++,0!=j&&4!=j||(c+=3)}for(var d=0;d<b;d++)for(var e=0;e<b-6;e++)a.isDark(d,e)&&!a.isDark(d,e+1)&&a.isDark(d,e+2)&&a.isDark(d,e+3)&&a.isDark(d,e+4)&&!a.isDark(d,e+5)&&a.isDark(d,e+6)&&(c+=40);for(var e=0;e<b;e++)for(var d=0;d<b-6;d++)a.isDark(d,e)&&!a.isDark(d+1,e)&&a.isDark(d+2,e)&&a.isDark(d+3,e)&&a.isDark(d+4,e)&&!a.isDark(d+5,e)&&a.isDark(d+6,e)&&(c+=40);for(var k=0,e=0;e<b;e++)for(var d=0;d<b;d++)a.isDark(d,e)&&k++;return c+=Math.abs(100*k/b/b-50)/5*10}},u={glog:function(a){if(a<1)throw new Error("glog("+a+")");return u.LOG_TABLE[a]},gexp:function(a){for(;a<0;)a+=255;for(;a>=256;)a-=255;return u.EXP_TABLE[a]},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)},v=0;v<8;v++)u.EXP_TABLE[v]=1<<v;for(var v=8;v<256;v++)u.EXP_TABLE[v]=u.EXP_TABLE[v-4]^u.EXP_TABLE[v-5]^u.EXP_TABLE[v-6]^u.EXP_TABLE[v-8];for(var v=0;v<255;v++)u.LOG_TABLE[u.EXP_TABLE[v]]=v;c.prototype={get:function(a){return this.num[a]},getLength:function(){return this.num.length},multiply:function(a){for(var b=new Array(this.getLength()+a.getLength()-1),d=0;d<this.getLength();d++)for(var e=0;e<a.getLength();e++)b[d+e]^=u.gexp(u.glog(this.get(d))+u.glog(a.get(e)));return new c(b,0)},mod:function(a){if(this.getLength()-a.getLength()<0)return this;for(var b=u.glog(this.get(0))-u.glog(a.get(0)),d=new Array(this.getLength()),e=0;e<this.getLength();e++)d[e]=this.get(e);for(var e=0;e<a.getLength();e++)d[e]^=u.gexp(u.glog(a.get(e))+b);return new c(d,0).mod(a)}},
d.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],d.getRSBlocks=function(a,b){var c=d.getRsBlockTable(a,b);if(c==i)throw new Error("bad rs block @ typeNumber:"+a+"/errorCorrectLevel:"+b);for(var e=c.length/3,f=[],g=0;g<e;g++)for(var h=c[3*g+0],j=c[3*g+1],k=c[3*g+2],l=0;l<h;l++)f.push(new d(j,k));return f},d.getRsBlockTable=function(a,b){switch(b){case r.L:return d.RS_BLOCK_TABLE[4*(a-1)+0];case r.M:return d.RS_BLOCK_TABLE[4*(a-1)+1];case r.Q:return d.RS_BLOCK_TABLE[4*(a-1)+2];case r.H:return d.RS_BLOCK_TABLE[4*(a-1)+3];default:return i}},e.prototype={get:function(a){var b=Math.floor(a/8);return 1==(this.buffer[b]>>>7-a%8&1)},put:function(a,b){for(var c=0;c<b;c++)this.putBit(1==(a>>>b-c-1&1))},getLengthInBits:function(){return this.length},putBit:function(a){var b=Math.floor(this.length/8);this.buffer.length<=b&&this.buffer.push(0),a&&(this.buffer[b]|=128>>>this.length%8),this.length++}};var w=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]],x=function(){return"undefined"!=typeof CanvasRenderingContext2D}()?function(){function a(){if("svg"==this._htOption.drawer){var a=this._oContext.getSerializedSvg(!0);this.dataURL=a,this._el.innerHTML=a}else try{var b=this._elCanvas.toDataURL("image/png");this.dataURL=b}catch(a){console.error(a)}this._htOption.onRenderingEnd&&(this.dataURL||console.error("Can not get base64 data, please check: 1. Published the page and image to the server 2. The image request support CORS 3. Configured `crossOrigin:'anonymous'` option"),this._htOption.onRenderingEnd(this._htOption,this.dataURL))}function b(a,b){var c=this;if(c._fFail=b,c._fSuccess=a,null===c._bSupportDataURI){var d=document.createElement("img"),e=function(){c._bSupportDataURI=!1,c._fFail&&c._fFail.call(c)},f=function(){c._bSupportDataURI=!0,c._fSuccess&&c._fSuccess.call(c)};d.onabort=e,d.onerror=e,d.onload=f,d.src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="}else!0===c._bSupportDataURI&&c._fSuccess?c._fSuccess.call(c):!1===c._bSupportDataURI&&c._fFail&&c._fFail.call(c)}if(m._android&&m._android<=2.1){var c=1/window.devicePixelRatio,d=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(a,b,e,f,g,h,i,j,k){if("nodeName"in a&&/img/i.test(a.nodeName))for(var l=arguments.length-1;l>=1;l--)arguments[l]=arguments[l]*c;else void 0===j&&(arguments[1]*=c,arguments[2]*=c,arguments[3]*=c,arguments[4]*=c);d.apply(this,arguments)}}var e=function(a,b){this._bIsPainted=!1,this._android=f(),this._el=a,this._htOption=b,"svg"==this._htOption.drawer?(this._oContext={},this._elCanvas={}):(this._elCanvas=document.createElement("canvas"),this._el.appendChild(this._elCanvas),this._oContext=this._elCanvas.getContext("2d")),this._bSupportDataURI=null,this.dataURL=null};return e.prototype.draw=function(a){function b(){d.quietZone>0&&d.quietZoneColor&&(j.lineWidth=0,j.fillStyle=d.quietZoneColor,j.fillRect(0,0,k._elCanvas.width,d.quietZone),j.fillRect(0,d.quietZone,d.quietZone,k._elCanvas.height-2*d.quietZone),j.fillRect(k._elCanvas.width-d.quietZone,d.quietZone,d.quietZone,k._elCanvas.height-2*d.quietZone),j.fillRect(0,k._elCanvas.height-d.quietZone,k._elCanvas.width,d.quietZone))}function c(a){function c(a){var c=Math.round(d.width/3.5),e=Math.round(d.height/3.5);c!==e&&(c=e),d.logoMaxWidth?c=Math.round(d.logoMaxWidth):d.logoWidth&&(c=Math.round(d.logoWidth)),d.logoMaxHeight?e=Math.round(d.logoMaxHeight):d.logoHeight&&(e=Math.round(d.logoHeight));var f,g;void 0===a.naturalWidth?(f=a.width,g=a.height):(f=a.naturalWidth,g=a.naturalHeight),(d.logoMaxWidth||d.logoMaxHeight)&&(d.logoMaxWidth&&f<=c&&(c=f),d.logoMaxHeight&&g<=e&&(e=g),f<=c&&g<=e&&(c=f,e=g));var h=(d.realWidth-c)/2,i=(d.realHeight-e)/2,k=Math.min(c/f,e/g),l=f*k,m=g*k;(d.logoMaxWidth||d.logoMaxHeight)&&(c=l,e=m,h=(d.realWidth-c)/2,i=(d.realHeight-e)/2),d.logoBackgroundTransparent||(j.fillStyle=d.logoBackgroundColor,j.fillRect(h,i,c,e));var n=j.imageSmoothingQuality,o=j.imageSmoothingEnabled;j.imageSmoothingEnabled=!0,j.imageSmoothingQuality="high",j.drawImage(a,h+(c-l)/2,i+(e-m)/2,l,m),j.imageSmoothingEnabled=o,j.imageSmoothingQuality=n,b(),s._bIsPainted=!0,s.makeImage()}d.onRenderingStart&&d.onRenderingStart(d);for(var h=0;h<e;h++)for(var i=0;i<e;i++){var k=i*f+d.quietZone,l=h*g+d.quietZone,m=a.isDark(h,i),n=a.getEye(h,i),o=d.dotScale;j.lineWidth=0;var p,q;n?(p=d[n.type]||d[n.type.substring(0,2)]||d.colorDark,q=d.colorLight):d.backgroundImage?(q="rgba(0,0,0,0)",6==h?d.autoColor?(p=d.timing_H||d.timing||d.autoColorDark,q=d.autoColorLight):p=d.timing_H||d.timing||d.colorDark:6==i?d.autoColor?(p=d.timing_V||d.timing||d.autoColorDark,q=d.autoColorLight):p=d.timing_V||d.timing||d.colorDark:d.autoColor?(p=d.autoColorDark,q=d.autoColorLight):p=d.colorDark):(p=6==h?d.timing_H||d.timing||d.colorDark:6==i?d.timing_V||d.timing||d.colorDark:d.colorDark,q=d.colorLight),j.strokeStyle=m?p:q,j.fillStyle=m?p:q,n?(o="AO"==n.type?d.dotScaleAO:"AI"==n.type?d.dotScaleAI:1,d.backgroundImage&&d.autoColor?(p=("AO"==n.type?d.AI:d.AO)||d.autoColorDark,q=d.autoColorLight):p=("AO"==n.type?d.AI:d.AO)||p,m=n.isDark,j.fillRect(Math.ceil(k+f*(1-o)/2),Math.ceil(d.titleHeight+l+g*(1-o)/2),Math.ceil(f*o),Math.ceil(g*o))):6==h?(o=d.dotScaleTiming_H,j.fillRect(Math.ceil(k+f*(1-o)/2),Math.ceil(d.titleHeight+l+g*(1-o)/2),Math.ceil(f*o),Math.ceil(g*o))):6==i?(o=d.dotScaleTiming_V,j.fillRect(Math.ceil(k+f*(1-o)/2),Math.ceil(d.titleHeight+l+g*(1-o)/2),Math.ceil(f*o),Math.ceil(g*o))):(d.backgroundImage,j.fillRect(Math.ceil(k+f*(1-o)/2),Math.ceil(d.titleHeight+l+g*(1-o)/2),Math.ceil(f*o),Math.ceil(g*o))),1==d.dotScale||n||(j.strokeStyle=d.colorLight)}if(d.title&&(j.fillStyle=d.titleBackgroundColor,j.fillRect(d.quietZone,d.quietZone,d.width,d.titleHeight),j.font=d.titleFont,j.fillStyle=d.titleColor,j.textAlign="center",j.fillText(d.title,this._elCanvas.width/2,+d.quietZone+d.titleTop)),d.subTitle&&(j.font=d.subTitleFont,j.fillStyle=d.subTitleColor,j.fillText(d.subTitle,this._elCanvas.width/2,+d.quietZone+d.subTitleTop)),d.logo){var r=new Image,s=this;r.onload=function(){c(r)},r.onerror=function(a){console.error(a)},null!=d.crossOrigin&&(r.crossOrigin=d.crossOrigin),r.originalSrc=d.logo,r.src=d.logo}else b(),this._bIsPainted=!0,this.makeImage()}var d=this._htOption,e=a.getModuleCount(),f=d.width/e,g=d.height/e;f<=1&&(f=1),g<=1&&(g=1);var h=f*e,i=g*e;d.heightWithTitle=i+d.titleHeight,d.realHeight=d.heightWithTitle+2*d.quietZone,d.realWidth=h+2*d.quietZone,this._elCanvas.width=d.realWidth,this._elCanvas.height=d.realHeight,"canvas"!=d.drawer&&(this._oContext=new C2S(this._elCanvas.width,this._elCanvas.height)),this.clear();var j=this._oContext;j.lineWidth=0,j.fillStyle=d.colorLight,j.fillRect(0,0,this._elCanvas.width,this._elCanvas.height),j.clearRect(d.quietZone,d.quietZone,d.width,d.titleHeight);var k=this;if(d.backgroundImage){var l=new Image;l.onload=function(){j.globalAlpha=1,j.globalAlpha=d.backgroundImageAlpha;var b=j.imageSmoothingQuality,e=j.imageSmoothingEnabled;j.imageSmoothingEnabled=!0,j.imageSmoothingQuality="high",(d.title||d.subTitle)&&d.titleHeight?j.drawImage(l,d.quietZone,d.quietZone+d.titleHeight,d.width,d.height):j.drawImage(l,0,0,d.realWidth,d.realHeight),j.imageSmoothingEnabled=e,j.imageSmoothingQuality=b,j.globalAlpha=1,c.call(k,a)},null!=d.crossOrigin&&(l.crossOrigin=d.crossOrigin),l.originalSrc=d.backgroundImage,l.src=d.backgroundImage}else c.call(k,a)},e.prototype.makeImage=function(){this._bIsPainted&&b.call(this,a)},e.prototype.isPainted=function(){return this._bIsPainted},e.prototype.clear=function(){this._oContext.clearRect(0,0,this._elCanvas.width,this._elCanvas.height),this._bIsPainted=!1},e.prototype.remove=function(){this._oContext.clearRect(0,0,this._elCanvas.width,this._elCanvas.height),this._bIsPainted=!1,this._el.innerHTML=""},e.prototype.round=function(a){return a?Math.floor(1e3*a)/1e3:a},e}():function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){var b=this._htOption,c=this._el,d=a.getModuleCount(),e=b.width/d,f=b.height/d;e<=1&&(e=1),f<=1&&(f=1);var g=e*d,h=f*d;b.heightWithTitle=h+b.titleHeight,b.realHeight=b.heightWithTitle+2*b.quietZone,b.realWidth=g+2*b.quietZone;var i=[],j="",k=Math.round(e*b.dotScale),l=Math.round(f*b.dotScale);k<4&&(k=4,l=4);var m=b.colorDark,n=b.colorLight;if(b.backgroundImage){b.autoColor?(b.colorDark="rgba(0, 0, 0, .6);filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr='#99000000', EndColorStr='#99000000');",b.colorLight="rgba(255, 255, 255, .7);filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr='#B2FFFFFF', EndColorStr='#B2FFFFFF');"):b.colorLight="rgba(0,0,0,0)";var o='<div style="display:inline-block; z-index:-10;position:absolute;"><img src="'+b.backgroundImage+'" width="'+(b.width+2*b.quietZone)+'" height="'+b.realHeight+'" style="opacity:'+b.backgroundImageAlpha+";filter:alpha(opacity="+100*b.backgroundImageAlpha+'); "/></div>';i.push(o)}if(b.quietZone&&(j="display:inline-block; width:"+(b.width+2*b.quietZone)+"px; height:"+(b.width+2*b.quietZone)+"px;background:"+b.quietZoneColor+"; text-align:center;"),i.push('<div style="font-size:0;'+j+'">'),i.push('<table  style="font-size:0;border:0;border-collapse:collapse; margin-top:'+b.quietZone+'px;" border="0" cellspacing="0" cellspadding="0" align="center" valign="middle">'),i.push('<tr height="'+b.titleHeight+'" align="center"><td style="border:0;border-collapse:collapse;margin:0;padding:0" colspan="'+d+'">'),b.title){var p=b.titleColor,q=b.titleFont;i.push('<div style="width:100%;margin-top:'+b.titleTop+"px;color:"+p+";font:"+q+";background:"+b.titleBackgroundColor+'">'+b.title+"</div>")}b.subTitle&&i.push('<div style="width:100%;margin-top:'+(b.subTitleTop-b.titleTop)+"px;color:"+b.subTitleColor+"; font:"+b.subTitleFont+'">'+b.subTitle+"</div>"),i.push("</td></tr>");for(var r=0;r<d;r++){i.push('<tr style="border:0; padding:0; margin:0;" height="7">');for(var s=0;s<d;s++){var t=a.isDark(r,s),u=a.getEye(r,s);if(u){t=u.isDark;var v=u.type,w=b[v]||b[v.substring(0,2)]||m;i.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:'+e+"px;height:"+f+'px;"><span style="width:'+e+"px;height:"+f+"px;background-color:"+(t?w:n)+';display:inline-block"></span></td>')}else{var x=b.colorDark;6==r?(x=b.timing_H||b.timing||m,i.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:'+e+"px;height:"+f+"px;background-color:"+(t?x:n)+';"></td>')):6==s?(x=b.timing_V||b.timing||m,i.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:'+e+"px;height:"+f+"px;background-color:"+(t?x:n)+';"></td>')):i.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:'+e+"px;height:"+f+'px;"><div style="display:inline-block;width:'+k+"px;height:"+l+"px;background-color:"+(t?x:b.colorLight)+';"></div></td>')}}i.push("</tr>")}if(i.push("</table>"),i.push("</div>"),b.logo){var y=new Image;null!=b.crossOrigin&&(y.crossOrigin=b.crossOrigin),y.src=b.logo;var z=b.width/3.5,A=b.height/3.5;z!=A&&(z=A),b.logoWidth&&(z=b.logoWidth),b.logoHeight&&(A=b.logoHeight);var B="position:relative; z-index:1;display:table-cell;top:-"+(b.height/2+A/2+b.quietZone)+"px;text-align:center; width:"+z+"px; height:"+A+"px;line-height:"+z+"px; vertical-align: middle;";b.logoBackgroundTransparent||(B+="background:"+b.logoBackgroundColor),i.push('<div style="'+B+'"><img  src="'+b.logo+'"  style="max-width: '+z+"px; max-height: "+A+'px;" /> <div style=" display: none; width:1px;margin-left: -1px;"></div></div>')}b.onRenderingStart&&b.onRenderingStart(b),c.innerHTML=i.join("");var C=c.childNodes[0],D=(b.width-C.offsetWidth)/2,E=(b.heightWithTitle-C.offsetHeight)/2;D>0&&E>0&&(C.style.margin=E+"px "+D+"px"),this._htOption.onRenderingEnd&&this._htOption.onRenderingEnd(this._htOption,null)},a.prototype.clear=function(){this._el.innerHTML=""},a}();j=function(a,b){if(this._htOption={width:256,height:256,typeNumber:4,colorDark:"#000000",colorLight:"#ffffff",correctLevel:r.H,dotScale:1,dotScaleTiming:1,dotScaleTiming_H:i,dotScaleTiming_V:i,dotScaleA:1,dotScaleAO:i,dotScaleAI:i,quietZone:0,quietZoneColor:"rgba(0,0,0,0)",title:"",titleFont:"normal normal bold 16px Arial",titleColor:"#000000",titleBackgroundColor:"#ffffff",titleHeight:0,titleTop:30,subTitle:"",subTitleFont:"normal normal normal 14px Arial",subTitleColor:"#4F4F4F",subTitleTop:60,logo:i,logoWidth:i,logoHeight:i,logoMaxWidth:i,logoMaxHeight:i,logoBackgroundColor:"#ffffff",logoBackgroundTransparent:!1,PO:i,PI:i,PO_TL:i,PI_TL:i,PO_TR:i,PI_TR:i,PO_BL:i,PI_BL:i,AO:i,AI:i,timing:i,timing_H:i,timing_V:i,backgroundImage:i,backgroundImageAlpha:1,autoColor:!1,autoColorDark:"rgba(0, 0, 0, .6)",autoColorLight:"rgba(255, 255, 255, .7)",onRenderingStart:i,onRenderingEnd:i,version:0,tooltip:!1,binary:!1,drawer:"canvas",crossOrigin:null,utf8WithoutBOM:!0},"string"==typeof b&&(b={text:b}),b)for(var c in b)this._htOption[c]=b[c];this._htOption.title||this._htOption.subTitle||(this._htOption.titleHeight=0),(this._htOption.version<0||this._htOption.version>40)&&(console.warn("QR Code version '"+this._htOption.version+"' is invalidate, reset to 0"),this._htOption.version=0),(this._htOption.dotScale<0||this._htOption.dotScale>1)&&(console.warn(this._htOption.dotScale+" , is invalidate, dotScale must greater than 0, less than or equal to 1, now reset to 1. "),this._htOption.dotScale=1),(this._htOption.dotScaleTiming<0||this._htOption.dotScaleTiming>1)&&(console.warn(this._htOption.dotScaleTiming+" , is invalidate, dotScaleTiming must greater than 0, less than or equal to 1, now reset to 1. "),this._htOption.dotScaleTiming=1),this._htOption.dotScaleTiming_H?(this._htOption.dotScaleTiming_H<0||this._htOption.dotScaleTiming_H>1)&&(console.warn(this._htOption.dotScaleTiming_H+" , is invalidate, dotScaleTiming_H must greater than 0, less than or equal to 1, now reset to 1. "),this._htOption.dotScaleTiming_H=1):this._htOption.dotScaleTiming_H=this._htOption.dotScaleTiming,this._htOption.dotScaleTiming_V?(this._htOption.dotScaleTiming_V<0||this._htOption.dotScaleTiming_V>1)&&(console.warn(this._htOption.dotScaleTiming_V+" , is invalidate, dotScaleTiming_V must greater than 0, less than or equal to 1, now reset to 1. "),this._htOption.dotScaleTiming_V=1):this._htOption.dotScaleTiming_V=this._htOption.dotScaleTiming,(this._htOption.dotScaleA<0||this._htOption.dotScaleA>1)&&(console.warn(this._htOption.dotScaleA+" , is invalidate, dotScaleA must greater than 0, less than or equal to 1, now reset to 1. "),this._htOption.dotScaleA=1),this._htOption.dotScaleAO?(this._htOption.dotScaleAO<0||this._htOption.dotScaleAO>1)&&(console.warn(this._htOption.dotScaleAO+" , is invalidate, dotScaleAO must greater than 0, less than or equal to 1, now reset to 1. "),this._htOption.dotScaleAO=1):this._htOption.dotScaleAO=this._htOption.dotScaleA,this._htOption.dotScaleAI?(this._htOption.dotScaleAI<0||this._htOption.dotScaleAI>1)&&(console.warn(this._htOption.dotScaleAI+" , is invalidate, dotScaleAI must greater than 0, less than or equal to 1, now reset to 1. "),this._htOption.dotScaleAI=1):this._htOption.dotScaleAI=this._htOption.dotScaleA,(this._htOption.backgroundImageAlpha<0||this._htOption.backgroundImageAlpha>1)&&(console.warn(this._htOption.backgroundImageAlpha+" , is invalidate, backgroundImageAlpha must between 0 and 1, now reset to 1. "),this._htOption.backgroundImageAlpha=1),this._htOption.quietZone||(this._htOption.quietZone=0),this._htOption.titleHeight||(this._htOption.titleHeight=0),this._htOption.width=Math.round(this._htOption.width),this._htOption.height=Math.round(this._htOption.height),this._htOption.quietZone=Math.round(this._htOption.quietZone),this._htOption.titleHeight=Math.round(this._htOption.titleHeight),"string"==typeof a&&(a=document.getElementById(a)),(!this._htOption.drawer||"svg"!=this._htOption.drawer&&"canvas"!=this._htOption.drawer)&&(this._htOption.drawer="canvas"),this._android=f(),this._el=a,this._oQRCode=null,this._htOption._element=a;var d={};for(var c in this._htOption)d[c]=this._htOption[c];this._oDrawing=new x(this._el,d),this._htOption.text&&this.makeCode(this._htOption.text)},j.prototype.makeCode=function(a){this._oQRCode=new b(g(a,this._htOption),this._htOption.correctLevel),this._oQRCode.addData(a,this._htOption.binary,this._htOption.utf8WithoutBOM),this._oQRCode.make(),this._htOption.tooltip&&(this._el.title=a),this._oDrawing.draw(this._oQRCode)},j.prototype.makeImage=function(){"function"==typeof this._oDrawing.makeImage&&(!this._android||this._android>=3)&&this._oDrawing.makeImage()},j.prototype.clear=function(){this._oDrawing.remove()},j.prototype.resize=function(a,b){this._oDrawing._htOption.width=a,this._oDrawing._htOption.height=b,this._oDrawing.draw(this._oQRCode)},j.prototype.download=function(a){var b=this._oDrawing.dataURL,c=document.createElement("a");if("svg"==this._htOption.drawer){a+=".svg";var d=new Blob([b],{type:"text/plain"});if(navigator.msSaveBlob)navigator.msSaveBlob(d,a);else{c.download=a;var e=new FileReader;e.onload=function(){c.href=e.result,c.click()},e.readAsDataURL(d)}}else if(a+=".png",navigator.msSaveBlob){var f=function(a){var b=atob(a.split(",")[1]),c=a.split(",")[0].split(":")[1].split(";")[0],d=new ArrayBuffer(b.length),e=new Uint8Array(d);for(v=0;v<b.length;v++)e[v]=b.charCodeAt(v);return new Blob([d],{type:c})}(b);navigator.msSaveBlob(f,a)}else c.download=a,c.href=b,c.click()},j.prototype.noConflict=function(){return m.QRCode===this&&(m.QRCode=p),j},j.CorrectLevel=r,"function"==typeof define&&(define.amd||define.cmd)?define([],function(){return j}):o?((o.exports=j).QRCode=j,n.QRCode=j):m.QRCode=j}.call(this);
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[22]);
