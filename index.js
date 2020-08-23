const tinify = require("tinify");
const ora = require('ora');

const { getImageSize, isRemoteFile } = require('./getImageSize');
const { getRequest } = require('./request');
const { version } = require('./package.json');

// console.log('process.argv:', process.argv);

/**
 * @type {Map<'key' | 'src' | 'max-count' | 'output' | 'verbose' | 'version', string>}
 */
const params = new Map(process.argv.slice(2).map(entry => {
  const splits = entry.match(/([\w\-]+)=?(.*)/);

  return [splits[1].replace(/-+/, '').trim(), splits[2].trim()]
}));

const verbose = params.get('verbose') === 'true' || params.get('verbose') === '';
const showVersion = params.get('version') === 'true' || params.get('version') === '';

verbose && console.log('params:', params);
showVersion && console.log(' tinify client', version, '\n');

const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const RED = '\x1b[0;31m';
const EOS = '\x1b[0m';

async function main() {
  const key = params.get('key');

  if (!key) {
    console.error(YELLOW, 'key required.\n example: $ node index key=YOUR_API_KEY src=IMG_URL_OR_LOCAL_IMG output=OPTIMIZED_IMG_PATH');

    console.log();
    console.log(' Get your key at', GREEN, 'https://tinypng.com/developers', EOS);
    console.log();

    return;
  }

  const src = params.get('src');

  if (!src) {
    console.log(YELLOW);
    console.error('src required.\nexample: node index src=YOUR_API_KEY src=IMG_URL_OR_LOCAL_IMG output=OPTIMIZED_IMG_PATH');
    console.log(EOS);

    return;
  }

  // if (!/^https?:\/\/.+/.test(src)) {
  //   console.log();
  //   console.error('src must be a cdn address, starts with http or https.\nexample: node index src=YOUR_API_KEY src=https://tinypng.com/images/panda-chewing-2x.png src=IMG_URL_OR_LOCAL_IMG output=OPTIMIZED_IMG_PATH');
  //   console.log();

  //   return;
  // }

  let output = params.get('output');

  console.log();
  const spinner = ora('Compressing...').start();

  console.time(GREEN + ' Compress ' + src + ' total costs' + EOS);

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

        spinner.succeed('Compressed');

        console.log();
        console.log(YELLOW, summarize(output, sizes), EOS);
        console.log();

        return;
      }

      // const isFinalTurn = idx === MAX_COUNT - 1;

      // if (!isFinalTurn) {
      //   tmpFiles.push(tmpSrc);
      // }
    }

    spinner.succeed('Compressed');

    if (verbose) {
      console.log();
      console.log(
        YELLOW,
        `${diff} Bytes reduced in the last turn though it's no less than the delta ${DELTA} Bytes,`,
        `but the loop has reached it's limit ${MAX_COUNT}.`,
        'Compress Aborted.'
      );
    }

    console.log();
    console.log(YELLOW, summarize(output, sizes), EOS);
    console.log();

    return;
  } catch (error) {
    spinner.fail('Compressed failed');

    console.error(RED, 'compress failed:', error);

    return;
  } finally {
    verbose && console.log('sizes:', sizes);
    // console.log('tmpFiles:', tmpFiles);
    console.timeEnd(GREEN + ' Compress ' + src + ' total costs' + EOS);
    console.log();
  }

  function summarize(output, sizes) {
    const firstTurn = sizes[0];
    const lastTurn = sizes[sizes.length - 1];

    return [
      `The final compressed image is`,
      `${output},`,

      `before ${firstTurn[0]} Bytes,`,
      `after ${lastTurn[1]} Bytes,`,

      getTotalBytesOff(sizes),
      'Bytes',
      `(${getTotalPercentageOff(sizes)}%)`,
      'totally off in',
      sizes.length,
      'turn(s).',

      `Delta in the last turn is ${lastTurn[1] - lastTurn[0]}.`,
    ].join(' ')
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

  const filename = endpoint.split('/').pop().replace(/\?.*/, '');

  if (/\.\w+$/.test(filename)) {
    return filename;
  }

  return new Promise(resolve => {
    const req = getRequest(endpoint)
      .get(endpoint, (resp) => {
        resp.on('readable', () => {
          const { headers } = resp;

          // console.log('resp.headers:', resp.headers['content-type']);

          let ext = '';

          if (headers['content-type']) {
            ext = headers['content-type'].split('/').pop();
          }

          resolve(filename && ext ? `${filename}.${ext}` : endpoint);

          req.abort();
        })
      })
      .on('error', (error) => {
        console.error('HEAD', endpoint, 'failed', error);

        resolve(filename);
      })
      .on('timeout', (error) => {
        console.error('HEAD', endpoint, 'timeout:', error);

        resolve(filename);
        req.abort()
      })
  });
}

/**
 *
 * @param {[number, number][]} sizes
 */
function getTotalBytesOff(sizes) {
  const first = sizes[0];
  const last = sizes[sizes.length - 1];

  return first[0] - last[1];
}

/**
 *
 * @param {number} before
 * @param {number} after
 */
function getPercentageOff(before, after) {
  return ((before - after) / before).toFixed(2) * 100;
}

/**
 *
 * @param {[number, number][]} sizes
 */
function getTotalPercentageOff(sizes) {
  const before = sizes[0][0];
  const after = sizes[sizes.length - 1][1];

  return getPercentageOff(before, after);
}
