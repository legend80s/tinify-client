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
