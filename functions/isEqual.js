const isEqual = function (value, other) {
  // if (value === undefined || other === undefined) return false

  if ((value && !other) || (other && !value) || (typeof value !== typeof other)) return false

  // string
  if (typeof value === "string") return value.replace(/\s+/g, ",") === other.replace(/\s+/g, ",");

  // boolean || number
  if (typeof value !== "object" || value === null) return value === other

  var type = Object.prototype.toString.call(value)
  // If the two objects are not the same type, return false
  if (type !== Object.prototype.toString.call(other)) return false

  // views
  if (value.__view__ && other.__view__) return value.id === other.id

  // If items are not an object or array, return false
  if (["[object Array]", "[object Object]"].indexOf(type) < 0) return false;

  // Compare the length of the two items
  const valueLen =
    type === "[object Array]" ? value.length : Object.keys(value).length;
  const otherLen =
    type === "[object Array]" ? other.length : Object.keys(other).length;
  if (valueLen !== otherLen) return false;

  // Compare two items
  const compare = function (item1, item2) {
    // Get the object type
    const itemType = Object.prototype.toString.call(item1);

    // If an object or array, compare recursively
    if (["[object Array]", "[object Object]"].indexOf(itemType) >= 0) {
      if (!isEqual(item1, item2)) return false;
    }

    // Otherwise, do a simple comparison
    else {
      // If the two items are not the same type, return false
      if (itemType !== Object.prototype.toString.call(item2)) return false;

      // Else if it's a function, convert to a string and compare
      // Otherwise, just compare
      if (itemType === "[object Function]") {
        if (item1.toString() != item2.toString()) return false;
      } else {
        if (item1 != item2) return false;
      }
    }
  };

  // Compare properties
  if (type === "[object Array]") {
    for (let i = 0; i < valueLen; i++) {
      if (compare(value[i], other[i]) === false) return false;
    }
  } else {
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        if (compare(value[key], other[key]) === false) return false;
      }
    }
  }

  if (Array.isArray(value)) {
    var equal = true
    if (value.length === other.length) {
      value.map((value, i) => {
        if (!isEqual(value, other[i])) equal = false
      })
    } else equal = false
    return equal
  }

  if (typeof value === "object") {
    var equal = true, valueKeys = Object.keys(value), otherKeys = Object.keys(other)
    if (valueKeys.length === otherKeys.length) {
      valueKeys.map((key, i) => {
        if (!isEqual(valueKeys[key], otherKeys[key])) equal = false
      })
    } else equal = false
    return equal
  }

  // html elements
  if (
    value.nodeType === Node.ELEMENT_NODE &&
    other.nodeType === Node.ELEMENT_NODE
  ) {
    return (
      value.isSameNode(other) ||
      value.contains(other) ||
      other.contains(value)
    );
  } else if (
    (value.nodeType !== Node.ELEMENT_NODE &&
      other.nodeType === Node.ELEMENT_NODE) ||
    (value.nodeType === Node.ELEMENT_NODE &&
      other.nodeType !== Node.ELEMENT_NODE)
  ) {
    return false;
  }

  // If nothing failed, return true
  return true;
}

module.exports = { isEqual }
