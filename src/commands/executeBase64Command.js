const { imageToBase64 } = require('../utils/image');
const { copyBase64 } = require('../utils/copyBase64');
const { GREEN, EOS } = require('../constants/colors');
const { getFileSize } = require('@legend80s/image-to-base64');

/**
 * @param {Map<string, any>} options
 */
exports.executeBase64Command = async options => {
  const verbose = options.get('verbose');

  verbose && console.log('output base64 with options:', options);

  const img = options.get('rest').find(arg => arg !== 'base64');

  verbose && console.log('img:', img);

  if (img) {
    try {
      console.time('image to base64 costs')
      console.log();

      const size = await getFileSize(img);

      console.log('image size:', size, 'Bytes');

      copyBase64(await imageToBase64(img), { verbose });

      console.log(`${GREEN}base64 has been copied to your clipboard.`, EOS);
    } finally {
      console.timeEnd('image to base64 costs')
      console.log();
    }
  } else {
    console.warn('\nimage required. Usage: $ ' + base64Usage, '\n');
  }
}
