/**
 *
 * @param {number} before
 * @param {number} after
 * @returns {string}
 */
exports.getPercentageOff = function getPercentageOff(before, after) {
  const diff = before - after;

  return (diff / before * 100).toFixed(2) + '%';
}

exports.toReadableSize = function toReadableSize(sizeInByte) {
  if (sizeInByte >= 1024 * 1024) {
    return (sizeInByte / 1024 / 1024).toFixed(2) + 'MB';
  }

  if (sizeInByte >= 1024) {
    return (sizeInByte / 1024).toFixed(2) + 'KB';
  }

  return sizeInByte + 'B';
}
