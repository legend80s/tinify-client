/**
 * @param {T[]} arr
 * @returns {T}
 */
exports.last = function last(arr) {
  return arr[arr.length - 1];
}

/**
 *
 * @param {any} obj
 * @returns {boolean}
 */
exports.isString = function isString(obj) {
  return typeof obj === 'string';
}
