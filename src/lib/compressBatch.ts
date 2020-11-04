import { IParsedArgv } from '../cli';

import ora from 'ora';
import { join } from 'path';
// import { promisify } from 'util';
import { GREEN, EOS } from '../constants/colors';

import glob from 'fast-glob';
import tinify from 'tinify';
// const exec = promisify(require('child_process').exec);

import { i18n } from '../i18n';
import { decorated } from '../utils/decorated-console';
import { timeToReadable } from '../utils/lite-lodash';
import { compress, ITinify } from './compress';

const dictionary = i18n();

type ICompressBatchOptions = Pick<IParsedArgv, 'verbose' | 'max-count' | 'in-place' | 'output'> & {
  tinify: ITinify;
};

export const compressBatch = async (directory: string, params: ICompressBatchOptions) => {
  const { verbose, "max-count": maxCount, "in-place": inPlace, output } = params;

  let milliseconds = 0;
  const spinner = ora(`${dictionary.compressing}... ${timeToReadable(milliseconds)} 🚀`);
  const GAP = 100;

  const timer = setInterval(() => {
    milliseconds += GAP;

    spinner.text = `${dictionary.compressing}... ${timeToReadable(milliseconds)} 🚀`;
  }, 1 * GAP);

  decorated.time(GREEN + ` ${dictionary.genTotalTimeCostsTips(directory)}` + EOS);

  let errorMsg = '';

  const separator = directory.endsWith('/') ? '' : '/';
  const pattern = `${directory}${separator}**/*.{png,jpg}`;

  try {
    const images = await glob(pattern, {
      ignore: [
        '**/node_modules',
      ],
      onlyFiles: true,
    });

    console.log(`images from glob: ${pattern}`, images);

    if (!images.length) {
      errorMsg = `Found 0 images in ${directory}. Aborted`;

      return;
    } else {
      decorated.info(`Found ${images.length} images in ${directory}`);
    }

    spinner.start();

    // const cliPath = join(__dirname, './cli');

    // const args = images
    //   .map(file => {
    //     return [
    //       `"node ${cliPath} ${file}`,
    //       `--max-count=${params['max-count']}`,
    //       `--in-place=${params['in-place']}`,
    //       `--no-base64"`,
    //     ].join(' ');
    //   })
    //   .join(' ')
    // ;

    // const cmd = `BATCH=true npx concurrently ${args}`;
    // const cmd = `BATCH=false npx concurrently -n "${images.join(',')}" ${args}`;
    // console.log(cmd);

    // console.log('params:', params);

    const results = await Promise.all(images.map(img =>
      compress(img, {
        tinify,
        output,
        verbose,
        maxCount,
        inPlace,
      })
    ));

    // const { stdout } = await exec(cmd)

    console.table(results);
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

    if (verbose) {
      // console.log('tmpFiles:', tmpFiles);
      decorated.timeEnd(GREEN + ` ${dictionary.genTotalTimeCostsTips(directory)}` + EOS);
      console.log();
    }
  }

  return;
}
