const camelCase = require('lodash.camelcase');

module.exports.camelify = camelify;
module.exports.isArray = isArray;
module.exports.isObject = isObject;

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


function isObject(object) {
  return object === Object(object) && !isArray(object) && typeof object !== 'function';
}

function isArray(object) {
  return object && Array.isArray(object)
}


// const single = camelify({first_name: 'dan', last_name: 'levy'})
// const nested = camelify({
//   data_list: [
//     {first_name: 'dan', last_name: 'levy'},
//     {first_name: 'rosie', last_name: 'the kitty', skills: ['biting', 'scratching', 'being cute']}
//   ]
// })
// const extraNested = camelify({
//   result_set: {
//     data_list: [
//       {first_name: 'dan', last_name: 'levy'},
//       {first_name: 'rosie', last_name: 'the kitty', skills: ['biting', 'scratching', 'being cute']}
//     ]
//   }
// })

// console.log('single', JSON.stringify(single, null, 2))
// console.log('nested', JSON.stringify(nested, null, 2))