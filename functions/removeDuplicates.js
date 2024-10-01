const removeDuplicates = (object) => {
  
  if (typeof object === "string" || typeof object === "number" || !object) {
    return object;
  }

  if (Array.isArray(object)) {
    if (object.length === 0) return [];
    return (object = [removeDuplicates(object[0])]);
  }

  if (typeof object === "object") {
    Object.entries(object).map(([key, value]) => {
      object[key] = removeDuplicates(value);
    });

    return object;
  }
};

module.exports = {removeDuplicates};
