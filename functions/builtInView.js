const { toApproval } = require("./kernel")
const { toParam } = require("./kernel")

module.exports = {
  builtInView: ({ _window, lookupActions, stack, props, id, __ }) => {
    
    var views = _window ? _window.views : window.views
    var view = views[id]
    
    views[id] = view = builtInViews[view.__name__](view)
    view.__builtInViewMounted__ = true
    
    // encode
    view.__name__ = toCode({ _window, id, string: toCode({ _window, id, string: view.view, start: "'", end: "'" }) })
    
    view.__name__ = view.__name__.split("?")[0]
    var params = view.__name__.split("?")[1]
    var conditions = view.__name__.split("?")[2]
    var elseParams = view.__name__.split("?")[3]

    // approval
    var approved = toApproval({ _window, lookupActions, stack, props, data: conditions, id, __ })
    if (!approved) {
      if (elseParams) params = otherParams
      else return delete views[id]
    }

    // params
    if (params) {
      
      params = toParam({ _window, lookupActions, stack, props, data: params, id, object: [view], __ })

      if (params.id) {
        
        delete Object.assign(views, { [params.id]: views[id] })[id]
        id = params.id
      }
    }
  }
}
