export { imageToBase64, getFileSize as getImageSize } from '@legend80s/image-to-base64';
import { getRequest } from './request';

export const isRemoteFile = (path: string) => /^https?:\/\//.test(path);

export const resolveExtFromRemote = (url: string): Promise<string> => {
  return new Promise(resolve => {
    const req = getRequest(url)
      .get(url, (resp) => {
        resp.on('readable', () => {
          const { headers } = resp;

          // console.log('resp.headers:', resp.headers['content-type']);

          let ext = '';

          if (headers['content-type']) {
            ext = headers['content-type'].split('/')?.pop() || 'png';
          }

          resolve(ext);

          req.abort();
        })
      })
      .on('error', (error) => {
        console.error('HEAD', url, 'failed', error);

        resolve('');
      })
      .on('timeout', (error: any) => {
        console.error('HEAD', url, 'timeout:', error);

        resolve('');

        req.abort()
      })
  })
}
