import { imageToBase64 } from '../utils/image';
import { copyBase64 } from '../utils/copyBase64';
import { getFileSize } from '@legend80s/image-to-base64';
import { BASE64_USAGE } from '../constants';
import { decorated } from '../utils/decorated-console';
import { toReadableSize } from '../utils/number';
import { IParsedArgv } from '../cli';

export const executeBase64Command = async (options: IParsedArgv) => {
  const { verbose, _: rest } = options;

  verbose && decorated.info('output base64 with options:', options);

  const img = rest.find(arg => arg !== 'base64');

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
    decorated.warn('image required. Usage: $ ' + BASE64_USAGE, '\n');
  }
}
