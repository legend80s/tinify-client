import glob from 'fast-glob';
import ora from 'ora';

import { i18n } from '../i18n';
import { IParsedArgv } from '../cli';
import { GREEN, EOS, YELLOW } from '../constants/colors';
import { decorated } from '../utils/decorated-console';
import { timeToReadable } from '../utils/lite-lodash';
import { ITinify, summarize } from './compress';
import { compressBatch } from './compressBatch';

const dictionary = i18n();

type ICompressBatchOptions = IParsedArgv & {
  tinify: ITinify;
};

/**
 *
 * @param directory image directory or images
 * @param params
 */
export async function compressBatchWrapper(directory: string | string[], params: ICompressBatchOptions): Promise<void> {
  const { verbose, 'dry-run': dryRun } = params;

  let milliseconds = 0;
  const spinner = ora(`${dictionary.compressing}... ${timeToReadable(milliseconds)} 🚀`);
  const GAP = 100;

  const timer = setInterval(() => {
    milliseconds += GAP;

    spinner.text = `${dictionary.compressing}... ${timeToReadable(milliseconds)} 🚀`;
  }, 1 * GAP);

  verbose && typeof directory === 'string' &&
    decorated.time(GREEN + ` ${dictionary.genTotalTimeCostsTips(directory)}` + EOS);

  let errorMsg = '';

  try {
    const images = await retrieveImages(directory);

    // console.log(`images from glob: ${pattern}`, images);

    if (!images.length) {
      errorMsg = `Found 0 images in ${directory}. Aborted`;

      return;
    } else {
      if (Array.isArray(directory)) {
        decorated.info('Found', images.length, `images${GREEN}`, directory.join(', '), EOS);
      } else {
        decorated.info('Found', images.length, `images in${GREEN}`, directory, EOS);
      }

      console.log();
    }

    spinner.start();

    const results = await compressBatch(images, params);
    const beautifulResults = results.map(summarize)

    setTimeout(() => {
      console.log(YELLOW);
      console.table(beautifulResults);
      console.log();
    });
  } catch (error) {
    decorated.error(error);

    process.exit(-1);
  } finally {
    clearInterval(timer);

    if (errorMsg) {
      spinner.clear().fail(errorMsg);
    } else {
      spinner.clear().succeed(dictionary.compressed + ` ${timeToReadable(milliseconds)} ✨`);
    }

    if (verbose && typeof directory === 'string') {
      // console.log('tmpFiles:', tmpFiles);
      decorated.timeEnd(GREEN + ` ${dictionary.genTotalTimeCostsTips(directory)}` + EOS);
      console.log();
    }
  }

  return;
}

async function retrieveImages(directory: string | string[]): Promise<string[]> {
  if (Array.isArray(directory)) {
    return directory;
  }

  const separator = directory.endsWith('/') ? '' : '/';
  const pattern = `${directory}${separator}**/*.{png,jpg}`;

  const images = await glob(pattern, {
    ignore: [
      '**/node_modules',
    ],
    onlyFiles: true,
  });

  return images;
}
