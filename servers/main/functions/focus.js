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
