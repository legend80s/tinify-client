# tinify-client

<p>
  <a href="https://www.npmjs.com/package/tinify-client">
    <img src="https://img.shields.io/npm/v/tinify-client.svg" alt="npm version" />
  </a>
  <a href="https://github.com/legend80s/tinify-client">
    <img src="https://img.shields.io/npm/dm/tinify-client.svg" alt="npm downloads monthly" />
  </a>
</p>

<p align="center"><img src="https://tinypng.com/images/panda-happy.png" width="30%" /></p>

> Compress your images not only intelligently but also to the EXTREME!

Compress using [tinify](https://www.npmjs.com/package/tinify) which is used by [TinyPNG](https://tinypng.com/) and [TinyJPG](https://tinyjpg.com/). Read more at [http://tinify.com](http://tinify.com/).

- [Features](#features)
- [Usage](#usage)
  - [1. Configure the key](#1-configure-the-key)
  - [2. Compress](#2-compress)
- [Documentation](#documentation)
- [中文版文档](#中文版文档)
  - [用法](#用法)
    - [1. 设置 Key](#1-设置-key)
    - [2. 开始压缩](#2-开始压缩)
  - [文档](#文档)
- [Development](#development)

## Features

- Compress not only intelligently but also to the EXTREME!
- Output the base64 string of the compressed image.

## Usage

### 1. Configure the key

1. Get your key at https://tinypng.com/developers.
2. then set the key in the CLI params when compressing: `$ tinify-client key=YOUR_API_KEY`。

3. Or append `export TINIFY_KEY=YOUR_API_KEY` to your profile (~/.zshrc or ~/.bash_profile, etc.). Don't forget to execute this line below to make your settings active.

   ```sh
   echo TINIFY_KEY=YOUR_API_KEY >> ~/.zshrc
   source ~/.zshrc
   ```

### 2. Compress

```sh
npx tinify-client src=IMG_URL_OR_LOCAL_IMG
```

or

```sh
npm install tinify-client@latest --global
```

```sh
tinify-client src=IMG_URL_OR_LOCAL_IMG output=COMPRESSED_IMG_FILE_PATH
```

![tinify-client-demo-en-US](https://raw.githubusercontent.com/legend80s/tinify-client/master/assets/demo-en-US-compressed.png)

## Documentation

More parameters:

- output: the final compressed img file location.
- max-count: Set the max compressing times other than the default 15.
- version: Show the version.
- verbose: Show more information about each compressing turn.
- no-base64: Not output the base64 of the compressed image. base64 encoded by default;

---

## 中文版文档

> 用 https://tinypng.com/ 使用的压缩技术将图片压缩到**极致**。
>
> 解决需要手动将一张图片拖放到 tinypng 十几次才能达到极致压缩的难题

### 用法

#### 1. 设置 Key

Key 可从 https://tinypng.com/developers 免费获取，获取过程很简单不要有心理负担。

两种设置 Key 的方式，推荐使用 profile 设置，每次压缩无需指定 Key 更方便。

方法 1：命令行参数

```sh
tinify-client key=YOUR_API_KEY
```

方法 2：profile

将 `export TINIFY_KEY=YOUR_API_KEY` 添加到 profile 文件（~/.zshrc 或 ~/.bash_profile, etc.）最后一行，别忘了执行

```sh
echo TINIFY_KEY=YOUR_API_KEY >> ~/.zshrc
source ~/.zshrc
```

#### 2. 开始压缩

```sh
npx tinify-client src=IMG_URL_OR_LOCAL_IMG
```

或

```sh
npm install tinify-client@latest --global
tinify-client src=IMG_URL_OR_LOCAL_IMG
```

![tinify-client-demo-zh-CN](https://raw.githubusercontent.com/legend80s/tinify-client/master/assets/demo-zh-CN-compressed.png)

### 文档

参数介绍：

- key: tinypng 需要的 key。
- src: 支持 cdn 地址或本地图片。
- output: 最终压缩图片的地址。
- max-count: 最大压缩次数，默认 15 次。
- version: 显示该工具的版本号。
- verbose: 显示每一次压缩的日志。
- no-base64: 不显示压缩图片的 base64。默认显示

## Development

```sh
LANG=zh-CN node index.js src=https://tinypng.com/images/panda-happy.png max-count=1
```
