const { toCondition, actions } = require("./kernel")
const { clone } = require("./clone")
const { toParam } = require("./kernel")
const { toValue } = require("./kernel")
const { isEqual } = require("./isEqual")
const { generate } = require("./generate")

const watch = ({ lookupActions, __, stack, string, id }) => {

    let view = window.views[id]
    if (!view) return

    let watch = actions["encode()"]({ _window, id, stack, string: actions["encode()"]({ _window, id, stack, string, start: "'" }) })

    let approved = toCondition({ id, lookupActions, stack, props, __, data: watch.split('?')[2] })
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
            let approved = toCondition({ id, lookupActions, stack, props, data: watch.split('?')[2], __ })
            if (!approved) return
                
            // params
            if (view.await) toParam({ id, lookupActions, stack, props, data: view.await.join(';'), __ })
        }

        view.__timers__.push(setInterval(myFn, timer))
    })
}

module.exports = { watch }