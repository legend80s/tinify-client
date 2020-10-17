const { EOS } = require('../constants/colors');

/**
 * Make text underlined.
 * @param {string} text
 * @returns {string}
 */
exports.underline = function underline(text) {
  const UNDERLINED = '\x1b[4m';

  return `${UNDERLINED}${text}${EOS}`;
}
