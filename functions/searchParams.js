const { decode } = require("./decode")
const { toLine, actions } = require("./kernel")

const searchParams = ({ _window, lookupActions, stack, props, req, res, id, e, __, string, object }) => {

    var global = _window ? _window.global : window.global

    if (string.slice(0, 2) === "@$" && string.length === 7) string = global.__refs__[string].data

    string = decode({ _window, string })
    string = string.replaceAll("field:", "field=")
    
    // case: collection=value;field:[key1=value1;key2>=value2;key3<=value3;key4.in():[value4];key5.inc():[value6]]

    var i = 1, stringList = string.split("field=")
    while (stringList[i]) {

        stringList[i] = actions["encode()"]({ _window, string: stringList[i] })
        var code = stringList[i].slice(0, 7)
        global.__refs__[code].type = "text"
        i++
    }

    string = stringList.join("field=")
    
    var data = toLine({ _window, lookupActions, stack, props, req, res, id, e, __, data: { string }, object }).data

    if (!data.field || typeof data.field !== "string") return data

    // convert operators to texts
    var fields = data.field
    
    fields = fields.replaceAll("<=", ".lessorequal=")
    fields = fields.replaceAll(">=", ".greaterorequal=")
    fields = fields.replaceAll("!=", ".notequal=")
    fields = fields.replaceAll("<", ".less=")
    fields = fields.replaceAll(">", ".greater=")
    fields = fields.replaceAll("in():", "in=")
    fields = fields.replaceAll("inc():", "contains=")

    var string = ""
    fields.split(";").map(field => {
        if (field.charAt(0) === "!" && field.includes(".in=")) {

            field = field.slice(1)
            field = fields.replace(".in=", ".not-in=")

        } else if (field.charAt(0) === "!") {

            field = field.slice(1)
            field = field + "=null"
        }
        string += field + ";"
    })

    string = string.slice(0, -1)

    data.field = toLine({ _window, lookupActions, stack, props, req, res, id, e, __, data: { string, action: "toParam" }, object }).data

    return data
}

module.exports = { searchParams }