#!/usr/bin/env node

import ora from 'ora';
import { dirname } from 'path';
import { execSync } from 'child_process';

// @ts-ignore
import { CLI } from 'cli-aid';

// If converted to import
// build error will emit 'Cannot find module '../package.json'. Consider using '--resolveJsonModule' to import module with '.json' extension'
// after resolveJsonModule and rooDir set to src in tsconfig.json
// new error emitted
// > 'rootDir' is expected to contain all source files.
// import pkg from '../package.json';
//
// so I kept the require way 😓 though pkg will be typed if import in the `import` way
// Not good solution found in https://github.com/microsoft/TypeScript/issues/9858
const pkg = require('../package.json');

import { BASE64_USAGE } from './constants';
import { EOS, GREEN, YELLOW, RED } from './constants/colors';

import { imageToBase64, isRemoteFile } from './utils/image';
import { last, timeToReadable } from './utils/lite-lodash';
import { isDirectory } from './utils/lite-fs';
import { executeBase64Command } from './commands/executeBase64Command';
import { copyBase64 } from './utils/copyBase64';
import { decorated } from './utils/decorated-console';

import { i18n } from './i18n';
import { compressBatchWrapper } from './lib/compressBatchWrapper';
import { compress, DELTA, ICompressResult, summarize } from './lib/compress';
import tinify from 'tinify';

// console.log('process.argv.slice(2):', process.argv.slice(2));
// process.exit(0)

let base64CmdExecuting = false;

export interface IParsedArgv {
  debug: boolean;
  batch: boolean;
  key: string;
  src: string;
  'max-count': number;
  output: string;
  verbose: boolean;
  version: string;
  'no-base64': boolean;
  'in-place': boolean;
  'open-dir-after-compressed': boolean;
  'dry-run': boolean;

  _: string[];
}

const params = new CLI()
  .package(pkg)
  .usage('npx tinify-client IMG_URL_OR_LOCAL_IMG_PATH [OPTIONS]')
  .option('key', { help: 'The Tinify key. Accessible at https://tinypng.com/developers.' })
  .option('src', { help: 'Image url or local image path to compress.' })
  .option('output', 'o', { help: 'The compressed image file path.' })
  .option('max-count', 'm', { default: 15, help: 'The max compressing turns. Default 15.' })
  .option('in-place', 'i', { default: false, help: 'Overwrite the original image. Default false' })
  .option('verbose', { default: false, help: 'Show more information about each compressing turn.' })
  .option('no-base64', { default: false, help: 'Not output the base64 of the compressed image. base64 encoded by default.' })
  .option('dry-run', { default: false, help: 'Does everything compress would do except actually compressing. Reports the details of what would have been compressed' })
  .option('open-dir-after-compressed', { default: true, help: 'Should open the compressed image\'s directory after compressed.' })

  .option('debug', 'd', { help: 'Show the parsed CLI params.' })

  .command('base64', {
    usage: BASE64_USAGE,
    help: 'Output base64-encoded string of the input image.',
  }, async (options: IParsedArgv) => {
    base64CmdExecuting = true;

    await executeBase64Command(options);

    process.exit(0);
  })

  .parse(process.argv.slice(2)) as IParsedArgv;

if (params.debug) {
  console.log('params:', params);
  process.exit(0);
}

const srcList = params._;
const verbose = params.verbose;
const noBase64 = params['no-base64'];
const inPlace = params['in-place'];
const maxCount = params['max-count'];
const dryRun = params['dry-run'];

const batch = process.env.BATCH === 'true';

verbose && console.log('batch:', batch);

let output = params.output;

if (verbose) {
  console.log('process.argv.slice(2):', process.argv.slice(2));
  console.log('params:', params);
}

const dictionary = i18n();

async function main() {
  const keyFromCli = params.key;
  const TINIFY_KEY = process.env.TINIFY_KEY;
  const key = keyFromCli || TINIFY_KEY;

  if (key || base64CmdExecuting) {
    // no need to check the key
  } else {
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

  const src = params.src || srcList[0];

  if (!src) {
    console.log(YELLOW);
    console.error('image src required. Example: tinify-client IMG_URL_OR_LOCAL_IMG');
    console.log(EOS);

    return;
  }

  tinify.key = key as string;

  if (isDirectory(src)) {
    return await compressBatchWrapper(src, { ...params, tinify });
  } else {
    const isImage = (endpoint: string) => /(?:png|jpg)$/.test(endpoint) || isRemoteFile(endpoint);
    const images = srcList.filter(isImage);

    if (images.length > 1) {
      return await compressBatchWrapper(images, { ...params, tinify });
    }
  }

  let timer: NodeJS.Timeout;
  let milliseconds = 0;
  let spinner: ora.Ora;

  if (!batch) {
    console.log();

    spinner = ora(`${dictionary.compressing}... ${timeToReadable(milliseconds)} 🚀`).start();
    const GAP = 100;

    timer = setInterval(() => {
      milliseconds += GAP;

      spinner.text = `${dictionary.compressing}... ${timeToReadable(milliseconds)} 🚀`;
    }, 1 * GAP);
  }

  verbose && console.time(GREEN + ` ${dictionary.genTotalTimeCostsTips(src)}` + EOS);

  let result: ICompressResult;

  try {
    result = await compress(src, {
      tinify,
      output,
      verbose,
      inPlace,
      maxCount,
      dryRun,
    });
  } catch (error) {
    // @ts-ignore
    spinner?.fail(dictionary.compressFailed);

    console.error(RED, 'compress failed:', error);

    return;
  } finally {
    if (batch) {
      return;
    }

    // @ts-ignore
    timer && clearInterval(timer);

    if (verbose) {
      console.timeEnd(GREEN + ` ${dictionary.genTotalTimeCostsTips(src)}` + EOS);
      console.log();
    }
  }

  // @ts-ignore
  spinner?.succeed(dictionary.compressed + ` ${timeToReadable(milliseconds)} ✨`);

  const { sizes, hasCompressedToExtreme, dest } = result;

  const [sizeBefore, sizeAfter] = last(sizes);
  const lastDiff = sizeBefore - sizeAfter;

  if (verbose && !hasCompressedToExtreme) {
    console.log();
    console.log(
      YELLOW,
      `${lastDiff} Bytes reduced in the last turn though it's no less than the delta ${DELTA} Bytes,`,
      `but the loop has reached it's limit ${maxCount}.`,
      'Compress Aborted.'
    );
  }

  report(result);

  if (params['open-dir-after-compressed']) { open(dirname(dest)); }
}

function open(path: string) {
  try {
    execSync(`open ${path}`)
  } catch (error) {
    console.log(error);
  }
}

// console.log('base64CmdExecuting:', base64CmdExecuting);

if (!base64CmdExecuting) {
  main();
}

async function report({ dest, sizes, costs }: ICompressResult) {
  console.log();
  console.table([ summarize({ dest, sizes, costs }) ]);
  console.log();

  if (noBase64) {
    return;
  }

  const base64 = await imageToBase64(dest);

  if (!base64) {
    return;
  }

  // console.log('sizes:', sizes);

  copyBase64(base64, { verbose: verbose || last(sizes)[1] < 1024 });

  decorated.success('The compressed image\'s base64 has been copied to your clipboard.');
}

