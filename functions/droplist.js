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