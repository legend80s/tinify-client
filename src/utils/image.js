const { imageToBase64, getFileSize } = require('@legend80s/image-to-base64');

const { getRequest } = require('./request');


/**
 * @param {string} path
 */
const isRemoteFile = (path) => /^https?:\/\//.test(path);

exports.isRemoteFile = isRemoteFile;

exports.getImageSize = getFileSize;

exports.imageToBase64 = imageToBase64;

/**
 *
 * @param {string} url img url
 * @returns {Promise<string>}
 */
const resolveExtFromRemote = url => {
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

exports.resolveExtFromRemote = resolveExtFromRemote;
