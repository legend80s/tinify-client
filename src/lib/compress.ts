import { basename, join } from 'path';
import tinify from "tinify";

import { isRemoteFile, resolveExtFromRemote } from '@legend80s/image-to-base64';

import { GREEN, EOS, RED } from '../constants/colors';
import { getImageSize } from '../utils/image';
import { isDirectory } from '../utils/lite-fs';
// import { timeToReadable } from '../utils/lite-lodash';
import { getPercentageOff } from '../utils/number';
import { last } from '../utils/lite-lodash';
import { i18n } from '../i18n';

const dictionary = i18n();

interface IOptions {
  output: string;
  verbose: boolean;
  inPlace: boolean;
  maxCount: number;

  tinify: ITinify,
}

export type ITinify = typeof tinify;

export const DELTA = 1;

export type ISizeTuple = [sizeBefore: number, sizeAfter: number];

export interface ICompressResult {
  sizes: ISizeTuple[];
  dest: string;
  hasCompressedToExtreme: boolean;
  costs: number,
}

export async function compress(src: string, {
  tinify,
  output,
  verbose,
  inPlace,
  maxCount,
}: IOptions): Promise<ICompressResult> {
  const startAt = Date.now();

  if (!output) {
    output = await resolveOutput(src, { verbose, inPlace });
  } else if (isDirectory(output)) {
    let filename = basename(src);

    if (isRemoteFile(src)) {
      const ext = await resolveExtFromRemote(src);

      if (ext) {
        filename = `${filename}.${ext}`;
      }
    }

    output = join(output, filename);

    // console.log('isDirectory output:', output);
  }

  // return;

  // const tmpFiles = [];
  const sizes: ISizeTuple[] = [];

  let tmpSrc = src;

  for (let i = 0; i < maxCount; ++i) {
    // const tmpOutput = output.replace(/(-\d)*.png/, `-${idx+1}.png`);
    const { sizeBefore, sizeAfter } = await minify(tmpSrc, { dest: output, verbose, tinify });

    const diff = sizeBefore - sizeAfter;
    tmpSrc = output;

    sizes.push([ sizeBefore, sizeAfter ])

    if (diff <= DELTA) {
      if (verbose) {
        console.log(GREEN, `${diff} Bytes reduced in the last turn and it is less than the delta ${DELTA} Bytes. Compressing is ready to abort.`, EOS);
      }

      return { sizes, dest: output, hasCompressedToExtreme: true, costs: Date.now() - startAt };
    }
  }

  return { sizes, dest: output, hasCompressedToExtreme: false, costs: Date.now() - startAt };
}

interface IMinifyOptions {
  dest: string;
  verbose: boolean;
  tinify: ITinify;
}

async function minify(src: string, { dest, verbose = false, tinify }: IMinifyOptions) {
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
    const sizeAfter = await getImageSize(dest) ;
    const diff = sizeBefore - sizeAfter;
    const percentage = `${getPercentageOff(sizeBefore, sizeAfter)}%`;

    verbose && console.log(
      GREEN,
      `Images compressed successfully: before ${sizeBefore} Bytes after ${sizeAfter} Bytes, ${diff} Bytes (${percentage}) off.`,
      EOS
    );

    // console.timeEnd(' getImageSize costs')

    return { sizeBefore, sizeAfter };
  } catch (error) {
    console.error(RED, 'getImageSize failed:', error, EOS)

    throw error;
  }
}

/**
 * @param {string} endpoint local image path or
 */
async function resolveOutput(endpoint: string, { verbose = false, inPlace = false } = {}) {
  const label = GREEN + `no output resolve filename from url ` + endpoint + ' costs' + EOS;

  verbose && console.time(label);

  let filename = '';

  try {
    filename = await resolveFilenameFromEndpoint(endpoint, { inPlace });
  } finally {
    verbose && console.timeEnd(label);
  }

  const output = filename;

  verbose && console.log('output after resolved:', output);

  return output;
}

/**
 * @param {string} endpoint
 * @returns {Promise<string>}
 */
async function resolveFilenameFromEndpoint(endpoint: string, { inPlace = false } = {}): Promise<string> {
  if (!isRemoteFile(endpoint)) {
    return inPlace ?
      endpoint :
      // a => a-compressed
      // a.png => a-compressed.png
      endpoint.replace(/(\.\w+)?$/, (_m, $1) => `-compressed${$1 || ''}`);
  }

  const filename = endpoint.split('/').pop()?.replace(/\?.*/, '') || endpoint;

  if (/\.\w+$/.test(filename)) {
    return filename;
  }

  const ext = await resolveExtFromRemote(endpoint);

  if (ext) {
    return `${filename}.${ext}`
  }

  return filename;
}

export function summarize({ dest, sizes, costs }: Pick<ICompressResult, 'dest' | 'sizes' | 'costs'>) {
  const firstTurn = sizes[0];
  const lastTurn = last(sizes);

  return dictionary.summarize({
    dest,
    beforeSizeInByte: firstTurn[0],
    afterSizeInByte: lastTurn[1],
    nTurns: sizes.length,
    lastTurnDelta: lastTurn[0] - lastTurn[1],
    costs,
  })
}
