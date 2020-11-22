import fs from "fs";
import { promisify } from "util";
import { exec as rawExec } from "child_process";

import { chalk } from '../utils/colorize';
import { configFile, USAGE_SET_KEY } from '../constants';
import { IParsedArgv } from '../cli';

const { promises } = fs;
const exec = promisify(rawExec);
const access = promises.access;

let verbose = false;

export const setKey = async (options: IParsedArgv) => {
  verbose = options.verbose;

  const key = options._[1];

  if (!key) {
    console.error(chalk.red(`\`key\` not provided.`), chalk.yellow(`Example: $ ${USAGE_SET_KEY}`));
    console.log();

    return false;
  }

  const existing = await exists(configFile);

  if (!existing) {
    const content = `// https://github.com/legend80s/tinify-client\n\nmodule.exports = { key: '${key}' }\n`;

    try {
      await promises.writeFile(configFile, content);
    } catch (error) {
      console.error(chalk.red(error));

      return false;
    }

    console.log();
    console.info(
      chalk.yellow(configFile + ' not found 🤔. A new one created with content ✍️:'),
    );
    console.log();
    console.log(chalk.green(chalk.italic(content)));

    console.log('✨ Key set successfully.');
    console.log();

    return true;
  }

  const config = require(configFile);
  config.key = key;

  const content = `// https://github.com/legend80s/tinify-client\n\nmodule.exports = ${JSON.stringify(config, null, 2)}\n`;
  console.info(`✍️  Writing to existing config file ${configFile}:`);

  try {
    await promises.writeFile(configFile, content);
  } catch (error) {
    console.error(chalk.red(error));

    return false;
  }

  console.log();
  console.info(chalk.green(chalk.italic(content)));
  console.log('✨ Key updated successfully.');
  console.log();

  return true;
}

async function exists(files: string[] | string): Promise<string> {
  // console.log('files:', files);

  for (const file of Array.isArray(files) ? files : [ files ]) {
    try {
      await access(file, fs.constants.W_OK);

      // console.log('file:', file);

      return file;
    } catch (error) {
      // do nothing
      verbose && console.log(`file: ${file} not exist`);
    }
  }

  return '';
}
