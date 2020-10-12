const imageToBase64 = require("image-to-base64")
const { extname } = require('path');
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

/**
 *
 * @param {string} url url or local image patch
 */
exports.imageToBase64 = async url => {
  const [ext, base64Str] = await Promise.all([
    resolveExt(url),
    imageToBase64(url).catch(error => {
      console.error('[imageToBase64] url failed', error);

      return '';
    }),
  ])

  // console.log({ ext, base64Str }); // "iVBORw0KGgoAAAANSwCAIA..."

  if (!base64Str) {
    return '';
  }

  if (ext) {
    return `data:image/${ext};base64,${base64Str}`;
  }

  console.error('[imageToBase64] file extension cannot be resolved');

  return base64Str;
};

/**
 *
 * @param {string} url url or local image patch
 */
async function resolveExt(url) {
  const ext = extname(url);

  if (ext) {
    return ext.split('.').pop();
  }

  if (isRemoteFile(url)) {
    return resolveExtFromRemote(url);
  }

  return '';
}

/**
 *
 * @param {string} url img url
 * @returns {Promise<string>}
 */
exports.resolveExtFromRemote = function resolveExtFromRemote(url) {
  return new Promise(resolve => {
    const req = getRequest(url)
      .get(url, (resp) => {
        resp.on('readable', () => {
          const { headers } = resp;

          // console.log('resp.headers:', resp.headers['content-type']);

          let ext = '';

          if (headers['content-type']) {
            ext = headers['content-type'].split('/').pop();
          }

          resolve(ext);

          req.abort();
        })
      })
      .on('error', (error) => {
        console.error('HEAD', url, 'failed', error);

        resolve('');
      })
      .on('timeout', (error) => {
        console.error('HEAD', url, 'timeout:', error);

        resolve('');

        req.abort()
      })
  })
}
