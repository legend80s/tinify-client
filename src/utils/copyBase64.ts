import clipboardy from 'clipboardy';
import { decorated } from './decorated-console';

export const copyBase64 = (base64: string, { verbose }: { verbose: boolean; }) => {
  // console.log('verbose:', verbose);
  verbose && console.info(base64, '\n');

  decorated.info('base64 string length:', base64.length);

  clipboardy.writeSync(base64);
}
