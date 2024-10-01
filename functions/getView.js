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