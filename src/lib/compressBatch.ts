import tinify from 'tinify';
import { IParsedArgv } from '../cli';
import { compress, ITinify } from './compress';

type ICompressBatchOptions = IParsedArgv & {
  tinify: ITinify;
};

export const compressBatch = async (images: string[], params: ICompressBatchOptions) => {
  const { verbose, "max-count": maxCount, "in-place": inPlace, output, "dry-run": dryRun } = params;

  const results = await Promise.all(images.map(img =>
    compress(img, {
      tinify,

      output,
      verbose,
      maxCount,
      inPlace,
      dryRun,
    })
  ));

  return results;
}
