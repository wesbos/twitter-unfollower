const camelCase = require('lodash.camelcase');

module.exports.camelify = camelify;
module.exports.isArray = isArray;
module.exports.isObject = isObject;
module.exports.jsonPreview = jsonPreview;

/**
 * Camel Case all object keys, recursively.
 */
function camelify(object, recursive = true) {
  if (object && isArray(object)) {
    return object.map(v => isObject(v) ? camelify(v, recursive) : v);
  } else if (object && typeof object === 'object') {
    return Object.entries(object)
      .reduce((obj, [key, value]) => {
        value = isObject(value) || isArray(value) ? camelify(value) : value;
        obj[camelCase(key)] = value;
        return obj;
      }, {});
  }
  return object;
}

/**
 * Print first <limit> characters of given <object>.
 */
function jsonPreview(limit, object) {
  const toJsonSlice = (object) => {
    let jsonStr = JSON.stringify(object, null, 1);
    const len = jsonStr.length;
    if (jsonStr.length > limit) { 
      jsonStr = jsonStr.slice(0, limit) + `\n... JSON TRUNCATED (showing ${limit}/${len})`; 
    }
    console.log(`JSON PREVIEW:`, jsonStr)
    return object;
  }
  if (isObject(object) || isArray(object)) return toJsonSlice(object);
  return o => toJsonSlice(o);
}

function isObject(object) {
  return object === Object(object) && !isArray(object) && typeof object !== 'function';
}

function isArray(object) {
  return object && Array.isArray(object)
}

