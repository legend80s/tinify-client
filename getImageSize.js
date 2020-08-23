const { tmpdir } = require('os');
const { join } = require('path');
const url = require('url');
const fs = require('fs');
const { getRequest } = require('./request');

const { createWriteStream } = fs;

/**
 * @param {string} path
 */
const isRemoteFile = (path) => /^https?:\/\//.test(path);

exports.isRemoteFile = isRemoteFile;

exports.getImageSize = (imgPath) => {
  return new Promise((resolve, reject) => {
    const isRemoteImage = isRemoteFile(imgPath);

    if (!isRemoteImage) {
      try {
        const { size } = fs.statSync(imgPath, 'utf8');

        resolve(size);
      } catch (error) {
        reject(error);
      }

      return;
    }

    const tmpFilePath = join(tmpdir(), `${Date.now()}_${Math.random() * 1000000}` );
    const dest = createWriteStream(tmpFilePath);
    const request = getRequest(imgPath);
    const options = url.parse(imgPath);

    request
      .get(options, function (response) {
        response
          .on('error', error => {
            reject(error);
          })
          .pipe(dest);

        dest.on('finish', () => {
          const { size } = fs.statSync(tmpFilePath, 'utf8');

          // delete local image
          fs.unlink(tmpFilePath, err => {
            if (err) { return reject(err); };

            resolve(size);
          })
        })
      })
      .on('error', reject);
  });
}
