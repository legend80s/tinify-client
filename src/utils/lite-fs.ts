import { isRemoteFile } from '@legend80s/image-to-base64';
import { extname } from 'path';

export function isDirectory(filepath: string) {
  return !isRemoteFile(filepath) && extname(filepath) === '';
}
