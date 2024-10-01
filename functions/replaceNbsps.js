const replaceNbsps = (str) => {
  if (typeof str !== "string") return str
    var re = new RegExp(String.fromCharCode(160), "g");
    return str.toString().replace(re, " ");
  }

  module.exports = { replaceNbsps }