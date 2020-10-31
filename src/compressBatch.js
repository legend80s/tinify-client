const ora = require('ora');
const { promisify } = require('util');
const { GREEN, EOS } = require('./constants/colors');

const glob = promisify(require("glob"))
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

  try {
    /** @type {string[]} */
    const files = await glob('*.{png,jpg}');
    // const files = await glob('{alipay-logo,contact}.png');

    if (!files.length) {
      errorMsg = `Found 0 images in ${directory}. Aborted`;

      return;
    } else {
      decorated.info(`Found ${files.length} images in ${directory}`);
    }

    spinner.start();

    const args = files
      .map(file => {
        return [
          `"node src ${file}`,
          `--max-count=${params.get('max-count')}`,
          `--in-place=${params.get('in-place')}`,
          `--no-base64"`,
        ].join(' ');
      })
      .join(' ')
    ;

    const cmd = `BATCH=true npx concurrently ${args}`;
    // const cmd = `BATCH=false npx concurrently -n "${files.join(',')}" ${args}`;
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
