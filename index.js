const tinify = require("tinify");

const params = new Map(process.argv.slice(2).map(entry => {
  const splits = entry.split('=');

  return [splits[0].trim(), splits[1].trim()]
}));


// console.log('params:', params);


function main() {
  const key = params.get('key');

  if (!key) {
    console.log();
    console.error('key required.\nexample: node index key=YOUR_API_KEY src=IMAGE_CDN output=OPTIMIZED_PIC_PATH');
    console.log();

    return;
  }

  const src = params.get('src');

  if (!src) {
    console.log();
    console.error('src required.\nexample: node index src=YOUR_API_KEY src=IMAGE_CDN output=OPTIMIZED_PIC_PATH');
    console.log();

    return;
  }

  if (!/^https?:\/\/.+/.test(src)) {
    console.log();
    console.error('src must be a cdn address, starts with http or https.\nexample: node index src=YOUR_API_KEY src=https://tinypng.com/images/panda-chewing-2x.png src=IMAGE_CDN output=OPTIMIZED_PIC_PATH');
    console.log();

    return;
  }

  const output = params.get('output') || 'optimized.png';

  tinify.key = key;

  console.log();

  tinify.fromUrl(src).toFile(output)
    .then(result => {
      console.log('tinify successfully:', result);
      console.log(src, 'has been optimized to', output);
    })
    .catch(error => {
      console.error('tinify failed:', error);
    })
    .finally(() => {
      console.log();
    });
}

main();
