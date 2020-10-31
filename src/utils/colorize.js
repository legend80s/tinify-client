const { EOS, GREEN, UNDERLINED } = require('../constants/colors');

/**
 * Make text underlined.
 * @param {string} text
 * @returns {string}
 */
exports.underline = function underline(text) {
  return `${UNDERLINED}${text}${EOS}`;
}

exports.green = (text) => {
  return `${GREEN}${text}${EOS}`;
}
