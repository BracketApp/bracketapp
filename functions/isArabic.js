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
