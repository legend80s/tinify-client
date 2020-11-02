const ora = require('ora');
const { join } = require('path');
const { promisify } = require('util');
const { GREEN, EOS } = require('./constants/colors');

const glob = require('fast-glob');
const exec = promisify(require('child_process').exec);

const { i18n } = require('./i18n');
const { decorated } = require('./utils/decorated-console');
const { timeToReadable } = require('./utils/lite-lodash');

const dictionary = i18n();

/**
 *
 * @param {string} directory
 * @param {Map<string, any>} params
 */
exports.compressBatch = async (directory, params) => {
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
    /** @type {string[]} */
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

    const cliPath = join(__dirname, './cli');

    const args = images
      .map(file => {
        return [
          `"node ${cliPath} ${file}`,
          `--max-count=${params.get('max-count')}`,
          `--in-place=${params.get('in-place')}`,
          `--no-base64"`,
        ].join(' ');
      })
      .join(' ')
    ;

    const cmd = `BATCH=true npx concurrently ${args}`;
    // const cmd = `BATCH=false npx concurrently -n "${images.join(',')}" ${args}`;
    // console.log(cmd);

    // console.log('params:', params);

    const { stdout } = await exec(cmd)

    console.log(stdout);
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

    if (params.get('verbose')) {
      console.log('sizes:', sizes);
      // console.log('tmpFiles:', tmpFiles);
      decorated.timeEnd(GREEN + ` ${dictionary.genTotalTimeCostsTips(directory)}` + EOS);
      console.log();
    }
  }

  return;
}
