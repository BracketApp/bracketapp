const { lengthConverter } = require("./resize")

const getPadding = (el) => {
    
    var padding = el.style.padding.split(" ")
    if (padding.length === 1) {
        return padding = {
            top: lengthConverter(padding[0]),
            right: lengthConverter(padding[0]),
            bottom: lengthConverter(padding[0]),
            left: lengthConverter(padding[0])
        }
    } else if (padding.length === 2) {
        return padding = {
            top: lengthConverter(padding[0]),
            right: lengthConverter(padding[1]),
            bottom: lengthConverter(padding[0]),
            left: lengthConverter(padding[1])
        }
    } else if (padding.length === 4) {
        return padding = {
            top: lengthConverter(padding[0]),
            right: lengthConverter(padding[1]),
            bottom: lengthConverter(padding[2]),
            left: lengthConverter(padding[3])
        }
    }
}

const position = (el1, el2) => {

    elPos1 = el1.getBoundingClientRect()
    elPos2 = el2.getBoundingClientRect()

    var el2padding = getPadding(el2)

    var top  = elPos1.top - elPos2.top - el2padding.top
    var left = elPos1.left - elPos2.left - el2padding.left
    
    return { top: Math.round(top), left: Math.round(left) }
}

module.exports = {
    position,
    getPadding
}