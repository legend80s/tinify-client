const { extname } = require('path');

function isDirectory(filepath) {
  return extname(filepath) === '';
}

exports.isDirectory = isDirectory;
