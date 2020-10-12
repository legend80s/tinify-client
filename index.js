#!/usr/bin/env node

const tinify = require("tinify");
const ora = require('ora');

const { getImageSize, isRemoteFile, imageToBase64 } = require('./utils/image');
const { resolveExtFromRemote } = require('./utils/image');
const { version } = require('./package.json');
const { EOS, GREEN, YELLOW, RED } = require('./constants/colors');
const { i18n } = require('./i18n');
const { getPercentageOff } = require('./utils/number');

// console.log('process.argv:', process.argv);

function isCmdArg(arg) {
  return arg.startsWith('-') || arg.includes('=');
}

function not(fn) {
  return (...args) => {
    return !fn(...args);
  };
}

/**
 * @type {Map<'key' | 'src' | 'max-count' | 'output' | 'verbose' | 'version', string>}
 */
const params = new Map(process.argv.slice(2)
  // collect the args prefixed with '-' or '--' or '=' as cmd
  .filter(isCmdArg)
  .map(entry => {
    const splits = entry.match(/([\w\-]+)=?(.*)/);

    return [splits[1].replace(/^-+/, '').trim(), splits[2].trim()]
  })
);

const srcList = process.argv
  .slice(2)
  // collect the none-cmd args as src
  .filter(not(isCmdArg))

const verbose = params.get('verbose') === 'true' || params.get('verbose') === '';

const versionArgNames = ['version', 'v']
const showVersion = versionArgNames.some(name =>
  params.get(name) === 'true' || params.get(name) === ''
);

if (verbose) {
  console.log('process.argv.slice(2):', process.argv.slice(2));
  console.log('params:', params);
}
showVersion && console.log(' tinify client', version, '\n');

const dictionary = i18n();

async function main() {
  const keyFromCli = params.get('key');
  const TINIFY_KEY = process.env.TINIFY_KEY;
  const key = keyFromCli || TINIFY_KEY;

  if (!key) {
    console.error(YELLOW, 'key required. Get your key at', `${GREEN}https://tinypng.com/developers`, EOS);

    console.log(YELLOW);

    console.log(` You can set key in the CLI params: $ ${GREEN}tinify-client key=YOUR_API_KEY src=IMG_URL_OR_LOCAL_IMG output=OPTIMIZED_IMG_PATH`);
    console.log(YELLOW);
    console.log(` Or append \`${GREEN}export TINIFY_KEY=YOUR_API_KEY\`${YELLOW} to your profile (~/.zshrc or ~/.bash_profile, etc.), then:`, '\n');

    console.log(' ```sh');
    console.log(`${GREEN} source ~/.zshrc`);
    console.log(' tinify-client src=IMG_URL_OR_LOCAL_IMG output=OPTIMIZED_IMG_PATH', YELLOW);
    console.log(' ```');

    console.log(EOS);

    return;
  }

  const src = params.get('src') || srcList[0];

  if (!src) {
    console.log(YELLOW);
    console.error('src required.\nexample: tinify-client src=IMG_URL_OR_LOCAL_IMG output=OPTIMIZED_IMG_PATH');
    console.log(EOS);

    return;
  }

  // if (!/^https?:\/\/.+/.test(src)) {
  //   console.log();
  //   console.error('src must be a cdn address, starts with http or https.\nexample: tinify-client src=https://tinypng.com/images/panda-chewing-2x.png src=IMG_URL_OR_LOCAL_IMG output=OPTIMIZED_IMG_PATH');
  //   console.log();

  //   return;
  // }

  let output = params.get('output');

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
    verbose && console.time(GREEN + ' resolveFilenameFromEndpoint ' + src + ' costs' + EOS);

    try {
      output = await resolveFilenameFromEndpoint(src);
    } finally {
      verbose && console.timeEnd(GREEN + ' resolveFilenameFromEndpoint ' + src + ' costs' + EOS);
    }
  }

  // console.log('output:', output);

  // return;

  tinify.key = key;

  const DELTA = 1;
  const MAX_COUNT = Number(params.get('max-count')) || 15;

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

main();

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

  console.log(await imageToBase64(dest));
}

function summarize(dest, sizes) {
  const firstTurn = sizes[0];
  const lastTurn = sizes[sizes.length - 1];

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
