# tinify-client

<p align="center"><img src="https://tinypng.com/images/panda-happy.png" width="30%" /></p>

> Compress your images not only intelligently but also to the EXTREME!

Using [tinify](https://www.npmjs.com/package/tinify) which is used by [TinyPNG](https://tinypng.com/) and [TinyJPG](https://tinyjpg.com/). Read more at [http://tinify.com](http://tinify.com/).

## Usage

```sh
npx tinify-client key=YOUR_API_KEY src=IMG_URL_OR_LOCAL_IMG output=COMPRESSED_IMG_FILE_PATH
```
or
```sh
npm install tinify-client --global
```

```sh
tinify-client key=YOUR_API_KEY src=IMG_URL_OR_LOCAL_IMG output=COMPRESSED_IMG_FILE_PATH
```

## Documentation

More parameters:

- output: the final compressed img file location.

- max-count: Set the max compressing times other than the default 15.
- version: Show the version.
- verbose: Show more information about each compressing turn.

---

**中文版文档**

> 用 https://tinypng.com/ 使用的压缩技术将图片压缩到**极致**。
>
> 解决需要手动将一张图片拖放到 tinypng 十几次才能达到极致压缩的难题

## 用法

```sh
npx tinify-client key=YOUR_API_KEY src=IMG_URL_OR_LOCAL_IMG output=COMPRESSED_IMG_FILE_PATH
```
或
```sh
npm install tinify-client --global
```

```sh
tinify-client key=YOUR_API_KEY src=IMG_URL_OR_LOCAL_IMG output=COMPRESSED_IMG_FILE_PATH
```

## 文档

参数介绍：

- key: tinypng 需要的 key，可从 https://tinypng.com/developers 免费获取，获取过程很简单不要有心理负担。
- src: 支持 cdn 地址或本地图片。
- output: 最终压缩图片的地址。
- max-count: 最大压缩次数，默认 15 次。
- version: 显示该工具的版本号。
- verbose: 显示每一次压缩的日志。

## Develop

```sh
node index.js key=YOUR_API_KEY src=https://tinypng.com/images/panda-happy.png
```
