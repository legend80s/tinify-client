const { imageToBase64 } = require('../utils/image');
const { copyBase64 } = require('../utils/copyBase64');
const { getFileSize } = require('@legend80s/image-to-base64');
const { base64Usage } = require('../constants');
const { decorated } = require('../utils/decorated-console');
const { toReadableSize } = require('../utils/number');

/**
 * @param {Map<string, any>} options
 */
exports.executeBase64Command = async options => {
  const verbose = options.get('verbose');

  verbose && decorated.info('output base64 with options:', options);

  const img = options.get('rest').find(arg => arg !== 'base64');

  verbose && decorated.info('img:', img);

  if (img) {
    // const start = Date.now();
    decorated.time('image to base64 costs:');

    try {
      const size = await getFileSize(img);

      if (!size) {
        throw new Error('invalid image, size is ' + size);
      }

      decorated.info('image size:', toReadableSize(size));

      const base64 = await imageToBase64(img);

      copyBase64(base64, { verbose: verbose || size < 1024 });

      decorated.success('base64 has been copied to your clipboard.');
      decorated.timeEnd('image to base64 costs:');
      console.log();
    } catch (error) {
      decorated.error(error);
    }
  } else {
    decorated.warn('image required. Usage: $ ' + base64Usage, '\n');
  }
}
