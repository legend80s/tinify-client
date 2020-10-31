#!/usr/bin/env node
const tinify = require("tinify");
const ora = require('ora');

const { getImageSize, isRemoteFile, imageToBase64 } = require('./utils/image');
const { resolveExtFromRemote } = require('./utils/image');
const { EOS, GREEN, YELLOW, RED } = require('./constants/colors');
const { i18n } = require('./i18n');
const { getPercentageOff } = require('./utils/number');
const { CLI } = require('cli-aid');
const { last } = require('./utils/lite-lodash');
const package = require('../package.json');
const { join, basename } = require('path');
const { isDirectory } = require('./utils/lite-fs');
const { executeBase64Command } = require('./commands/executeBase64Command');
const { copyBase64 } = require('./utils/copyBase64');
const { base64Usage } = require('./constants');

// console.log('process.argv.slice(2):', process.argv.slice(2));
// process.exit(0)

let base64CmdExecuting = false;

/**
 * @type {Map<'debug' | 'key' | 'src' | 'max-count' | 'output' | 'verbose' | 'version' | 'no-base64' | 'rest', string | string[]>}
 */
const params = new CLI()
  .package(package)
  .usage('$ npx tinify-client IMG_URL_OR_LOCAL_IMG_PATH [OPTIONS]')
  .option('key', { help: 'The Tinify key. Accessible at https://tinypng.com/developers.' })
  .option('src', { help: 'Image url or local image path to compress.' })
  .option('output', 'o', { help: 'The compressed image file path.' })
  .option('max-count', 'm', { defaultVal: 15, help: 'The max compressing turns. Default 15.' })
  .option('verbose', { defaultVal: false, help: 'Show more information about each compressing turn.' })
  .option('no-base64', { defaultVal: false, help: 'Not output the base64 of the compressed image. base64 encoded by default.' })

  .option('debug', 'd', { help: 'Show the parsed CLI params.' })

  .command('base64', {
    usage: base64Usage,
    help: 'Output base64-encoded string of the input image.',
  }, async options => {
    base64CmdExecuting = true;

    await executeBase64Command(options);

    process.exit(0);
  })

  .parse(process.argv.slice(2));

if (params.get('debug')) {
  console.log('params:', params);
  process.exit(0);
}

const srcList = params.get('rest');
const verbose = params.get('verbose');
const noBase64 = params.get('no-base64');

let output = params.get('output');

if (verbose) {
  console.log('process.argv.slice(2):', process.argv.slice(2));
  console.log('params:', params);
}

const dictionary = i18n();

async function main() {
  const keyFromCli = params.get('key');
  const TINIFY_KEY = process.env.TINIFY_KEY;
  const key = keyFromCli || TINIFY_KEY;

  if (!key) {
    console.error(YELLOW, 'key required. Get your key at', `${GREEN}https://tinypng.com/developers`, EOS);

    console.log(YELLOW);

    console.log(` You can set key in the CLI params: $ ${GREEN}tinify-client IMG_URL_OR_LOCAL_IMG key=YOUR_API_KEY -o OPTIMIZED_IMG_PATH`);
    console.log(YELLOW);
    console.log(` Or append \`${GREEN}export TINIFY_KEY=YOUR_API_KEY\`${YELLOW} to your profile (~/.zshrc or ~/.bash_profile, etc.), then:`, '\n');

    console.log(' ```sh');
    console.log(`${GREEN} source ~/.zshrc`);
    console.log(' tinify-client IMG_URL_OR_LOCAL_IMG -o OPTIMIZED_IMG_PATH', YELLOW);
    console.log(' ```');

    console.log(EOS);

    return;
  }

  const src = params.get('src') || srcList[0];

  if (!src) {
    console.log(YELLOW);
    console.error('src required.\nexample: tinify-client IMG_URL_OR_LOCAL_IMG -o OPTIMIZED_IMG_PATH');
    console.log(EOS);

    return;
  }

  console.log();
  let milliseconds = 0;
  const spinner = ora(`${dictionary.compressing}... ${timeToReadable(milliseconds)} 🚀`).start();
  const GAP = 100;

  const timer = setInterval(() => {
    milliseconds += GAP;

    spinner.text = `${dictionary.compressing}... ${timeToReadable(milliseconds)} 🚀`;
  }, 1 * GAP);

  console.time(GREEN + ` ${dictionary.genTotalTimeCostsTips(src)}` + EOS);

  if (!output) {
    output = await resolveOutput(src);
  } else if (isDirectory(output)) {
    let filename = basename(src);

    if (isRemoteFile(src)) {
      const ext = await resolveExtFromRemote(src);

      if (ext) {
        filename = `${filename}.${ext}`;
      }
    }

    output = join(output, filename);
  }

  // return;

  tinify.key = key;

  const DELTA = 1;
  const MAX_COUNT = params.get('max-count');

  /**
   * @param {number} limit
   *
   * @example
   * range(3)
   * // => [0, 1, 2]
   */
  function range(limit) {
    return Array.from(Array(limit), (_, idx) => idx);
  }

  // const tmpFiles = [];
  const sizes = [];

  try {
    let tmpSrc = src;

    for (const _ of range(MAX_COUNT)) {
      // const tmpOutput = output.replace(/(-\d)*.png/, `-${idx+1}.png`);
      const result = await compress(tmpSrc, output);

      diff = result.diff;
      tmpSrc = output;

      sizes.push([ result.sizeBefore, result.sizeAfter ])

      if (diff <= DELTA) {
        if (verbose) {
          console.log(GREEN, `${diff} Bytes reduced in the last turn and it is less than the delta ${DELTA} Bytes. Compressing is ready to abort.`, EOS);
        }

        spinner.succeed(dictionary.compressed + ` ${timeToReadable(milliseconds)} ✨`);

        report(output, sizes);

        return;
      }

      // const isFinalTurn = idx === MAX_COUNT - 1;

      // if (!isFinalTurn) {
      //   tmpFiles.push(tmpSrc);
      // }
    }

    spinner.succeed(dictionary.compressed + ` ${timeToReadable(milliseconds)} ✨`);

    if (verbose) {
      console.log();
      console.log(
        YELLOW,
        `${diff} Bytes reduced in the last turn though it's no less than the delta ${DELTA} Bytes,`,
        `but the loop has reached it's limit ${MAX_COUNT}.`,
        'Compress Aborted.'
      );
    }

    report(output, sizes);

    return;
  } catch (error) {
    spinner.fail(dictionary.compressFailed);

    console.error(RED, 'compress failed:', error);

    return;
  } finally {
    clearInterval(timer);

    if (verbose) {
      console.log('sizes:', sizes);
      // console.log('tmpFiles:', tmpFiles);
      console.timeEnd(GREEN + ` ${dictionary.genTotalTimeCostsTips(src)}` + EOS);
      console.log();
    }
  }

  async function compress(src, dest) {
    verbose && console.time(GREEN + ' compress ' + src + ' costs' + EOS);

    const sizeBefore = await getImageSize(src);

    try {
      await (isRemoteFile(src) ? tinify.fromUrl(src) : tinify.fromFile(src)).toFile(dest)
    } catch (error) {
      console.error(RED, 'tinify failed:', error);
      console.log(EOS);

      throw error;
    } finally {
      verbose && console.timeEnd(GREEN + ' compress ' + src + ' costs' + EOS);
    }

    // console.log(GREEN, 'compressed successfully');
    // console.log('', src, 'has been optimized to', dest);
    // console.log(EOS);

    // console.time(' getImageSize costs')

    try {
      const [ sizeAfter] = await Promise.all(
        [ getImageSize(dest) ]
      );

      const diff = sizeBefore - sizeAfter;
      const percentage = `${getPercentageOff(sizeBefore, sizeAfter)}%`;

      verbose && console.log(
        GREEN,
        `Images compressed successfully: before ${sizeBefore} Bytes after ${sizeAfter} Bytes, ${diff} Bytes (${percentage}) off.`,
        EOS
      );

      // console.timeEnd(' getImageSize costs')

      return { diff, src: dest, sizeBefore, sizeAfter };
    } catch (error) {
      console.error(RED, 'getImageSize failed:', error, EOS)

      throw error;
    }
  }
}

// console.log('base64CmdExecuting:', base64CmdExecuting);

if (!base64CmdExecuting) {
  main();
}

/**
 * @param {string} endpoint
 * @returns {Promise<string>}
 */
async function resolveFilenameFromEndpoint(endpoint) {
  if (!isRemoteFile(endpoint)) {
    // a.png => a-compressed.png
    // a => a-compressed
    return endpoint.replace(/(\.\w+)?$/, (m, $1) => `-compressed${$1 || ''}`);
  }

  const filename = endpoint.split('/').pop().replace(/\?.*/, '') || endpoint;

  if (/\.\w+$/.test(filename)) {
    return filename;
  }

  const ext = await resolveExtFromRemote(endpoint);

  if (ext) {
    return `${filename}.${ext}`
  }

  return filename;
}

async function report(dest, sizes) {
  console.log();
  console.log(YELLOW, summarize(dest, sizes), EOS);
  console.log();

  if (noBase64) {
    return;
  }

  const base64 = await imageToBase64(dest);

  if (!base64) {
    return;
  }

  copyBase64(base64, { verbose });

  console.log(`${GREEN}The compressed image\'s base64 has been copied to your clipboard.`, EOS);
}

function summarize(dest, sizes) {
  const firstTurn = sizes[0];
  const lastTurn = last(sizes);

  return dictionary.summarize({
    dest,
    beforeSizeInByte: firstTurn[0],
    afterSizeInByte: lastTurn[1],
    nTurns: sizes.length,
    lastTurnDelta: lastTurn[0] - lastTurn[1],
  })
}

function timeToReadable(milliseconds) {
  const seconds = String(milliseconds / 1000);

  return seconds.includes('.') ?  `${seconds}s` : `${seconds}.0s`;
}

/**
 * @param {string} endpoint local image path or
 */
async function resolveOutput(endpoint) {
  const label = GREEN + `no output resolve filename from url ` + endpoint + ' costs' + EOS;

  verbose && console.time(label);

  let filename = '';

  try {
    filename = await resolveFilenameFromEndpoint(endpoint);
  } finally {
    verbose && console.timeEnd(label);
  }

  const output = filename;

  verbose && console.log('output after resolved:', output);

  return output;
}
