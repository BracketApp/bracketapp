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
