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
>
> *Compress using [tinify](https://www.npmjs.com/package/tinify) which is used by [TinyPNG](https://tinypng.com/) and [TinyJPG](https://tinyjpg.com/). Read more at [http://tinify.com](http://tinify.com/).*

```sh
npx tinify-client IMG_URL_OR_LOCAL_IMG_PATH
```

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
- Compress all the images in a folder.
- Output the input image's base64.

## Usage

1. compress and output the compressed image's base64

```sh
npx tinify-client IMG_URL_OR_LOCAL_IMG_PATH
```

2. compress all the images in a folder

```sh
npx tinify-client LOCAL_IMG_FOLDER
```

3. image to base64 only (No need to configure key)

```sh
npx tinify-client base64 IMG_URL_OR_LOCAL_IMG_PATH
```

### Configure the key

1. Get your key at https://tinypng.com/developers.
2. Then set the key in the CLI params when compressing: `$ tinify-client key=YOUR_API_KEY`。

3. It's recommended to set in your profile. Don't forget to execute the lines below to make your settings active.

   ```sh
   echo TINIFY_KEY=YOUR_API_KEY >> ~/.zshrc
   source ~/.zshrc
   ```

### start compressing

```sh
tinify-client IMG_URL_OR_LOCAL_IMG_PATH
```

![tinify-client-demo-en-US](https://raw.githubusercontent.com/legend80s/tinify-client/master/assets/demo-en-US-compressed.png)

## Documentation

More parameters:

- output -o: The compressed img file path.
- max-count: Set the max compressing turns. Default 15.
- version: Show the version.
- verbose: Show more information about each compressing turn.
- no-base64: Not output the base64 of the compressed image. base64 encoded by default.

---

## 中文版文档

> 用 [tinypng.com](https://tinypng.com/) 使用的压缩技术将图片压缩到**极致**。
>
> 解决需要手动将一张图片拖放到 tinypng 十几次才能达到极致压缩的难题

### 用法

```sh
# 压缩本地图片地址或 CDN 地址
npx tinify-client IMG_URL_OR_LOCAL_IMG_PATH

# 图片转 base64
npx tinify-client base64 IMG_URL_OR_LOCAL_IMG_PATH
```

如果没有开始压缩，请设置 Key

#### 1. 设置 Key

Key 可从 https://tinypng.com/developers 免费获取，获取过程很简单不要有心理负担。

两种设置 Key 的方式，推荐使用 profile 设置，每次压缩无需指定 Key 更方便。

方法 1：命令行参数

```sh
tinify-client key=YOUR_API_KEY
```

方法 2：推荐通过 profile 文件设置 key

将 `export TINIFY_KEY=YOUR_API_KEY` 添加到 profile 文件（~/.zshrc 或 ~/.bash_profile, etc.）最后一行，别忘了执行

```sh
echo TINIFY_KEY=YOUR_API_KEY >> ~/.zshrc
source ~/.zshrc
```

#### 2. 开始压缩

```sh
npx tinify-client IMG_URL_OR_LOCAL_IMG_PATH
```

![tinify-client-demo-zh-CN](https://raw.githubusercontent.com/legend80s/tinify-client/master/assets/demo-zh-CN-compressed.png)

### 文档

参数介绍：

- key: tinypng 需要的 key
- src: 支持 cdn 地址或本地图片
- output -o: 最终压缩图片的地址
- max-count: 最大压缩次数，默认 15 次
- version: 显示该工具的版本号
- verbose: 显示每一次压缩的日志
- no-base64: 不显示压缩图片的 base64。默认显示

## Development

```sh
LANG=zh-CN node src/cli https://tinypng.com/images/panda-happy.png max-count=1
```

*CLI Powered by [cli-aid](https://www.npmjs.com/package/cli-aid).*
