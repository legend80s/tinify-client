const clipboardy = require('clipboardy');
const { decorated } = require('./decorated-console');

/**
 *
 * @param {string} base64
 * @param {{ verbose: boolean; }}
 */
exports.copyBase64 = function copyBase64(base64, { verbose }) {
  // console.log('verbose:', verbose);
  (verbose || base64.length < 4096) && console.info(base64, '\n');

  decorated.info('base64 string length:', base64.length);

  clipboardy.writeSync(base64);
}
