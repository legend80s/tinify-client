const { isRemoteFile } = require('@legend80s/image-to-base64');
const { extname } = require('path');

function isDirectory(filepath) {
  return !isRemoteFile(filepath) && extname(filepath) === '';
}

exports.isDirectory = isDirectory;
