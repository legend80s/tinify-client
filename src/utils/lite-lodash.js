/**
 * @param {T[]} arr
 * @returns {T}
 */
exports.last = (arr) => {
  return arr[arr.length - 1];
}

/**
 *
 * @param {any} obj
 * @returns {boolean}
 */
exports.isString = (obj) => {
  return typeof obj === 'string';
}

exports.timeToReadable = (milliseconds) => {
  const seconds = String(milliseconds / 1000);

  return seconds.includes('.') ?  `${seconds}s` : `${seconds}.0s`;
}
