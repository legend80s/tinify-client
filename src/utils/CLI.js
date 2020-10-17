const { name, version } = require('../../package.json');
const { GREEN, EOS, BOLD } = require('../constants/colors')
const { last, isString } = require('./lite-lodash')

exports.CLI = class CLI {
  static toString = String
  static toBoolean = target => target === 'true' || target === ''
  static toNumber = Number

  static defaultTransformer = String

  /**
   * @type {Array<[...string[], { to: (obj: any) => any; defaultVal: any; help: string; }]>}
   */
  static defaultSchema = [
    ['help', 'h', 'docs', '文档', { to: CLI.toBoolean, defaultVal: false, help: 'Show this help information' }],
    ['version', 'v', { to: CLI.toBoolean, defaultVal: false, help: 'Show the version' }],
  ]

  /**
   * @param {string[]} argv
   * @param {[...string[], { to: (obj: any) => any; defaultVal: any; }]} schema
   */
  constructor(argv, schema) {
    this.argv = argv;

    /** @type {Array<[...string[], { to: (obj: any) => any; defaultVal: any; help: string; }]>} */
    this.schema = [...CLI.defaultSchema, ...(schema || [])];

    this.parsed = new Map();
  }

  /**
   * @param {[...string[], { to: (obj: any) => any; defaultVal: any; }]} schemaEntry
   */
  option(...schemaEntry) {
    this.schema.push([...schemaEntry])

    return this;
  }

  parse() {
    const parsed = this.argv
      // collect the args prefixed with '-' or '--' or '=' as cmd
      .filter(isCmdArg)
      .map(entry => {
        const splits = entry.match(/([^=]+)=?(.*)/);

        const key = splits[1].replace(/^-+/, '').trim();
        const val = splits[2].trim();

        return [key, val]
      });

    const argEntries = this.parseAgainstSchema(parsed);

    // collect the none-cmd args as rest
    argEntries.push(['rest', this.argv.filter(not(isCmdArg))])

    this.parsed = new Map(argEntries);

    this.after(parsed);

    return this.parsed;
  }

  /**
   * @private
   */
  after() {
    if (this.parsed.get('help')) {
      this.help();

      process.exit(0);
    }

    if (this.parsed.get('version')) {
      this.version();

      process.exit(0);
    }
  }

  /**
   * @private
   */
  help() {
    console.log(`\n${BOLD}USAGE${EOS}`);
    console.log(` $ npx tinify-client IMG_URL_OR_LOCAL_IMG_PATH`);
    console.log('');
    console.log(`\n${BOLD}OPTIONS`);

    for (const option of this.schema) {
      const [key, ...alias] = option.filter(isString);
      const { help } = last(option);

      console.log(
        ` -`,
        `${GREEN}${key}${alias.length ? ' [' + alias.join('|') + ']:' : ':'}${EOS}`,
        help,
      );
    }

    console.log('');
  }

  /**
   * @private
   */
  version() {
    console.log(`${name}/${version} ${process.platform}-${process.arch} node-${process.version}`)
  }

  /**
   * @private
   * @param {Array<[key: string, val: string]>} argEntries
   */
  parseAgainstSchema(argEntries) {
    return this.schema.reduce((acc, option) => {
      const [_, val] = argEntries.find(([key]) => option.includes(key)) || [];

      const { to = CLI.defaultTransformer, defaultVal } = last(option);
      const [normalizedKey] = option;

      acc.push([ normalizedKey, typeof val === 'undefined' ? defaultVal : to(val) ]);

      return acc;
    }, []);
  }
}

/**
 * @param {string} arg
 */
function isCmdArg(arg) {
  return arg.startsWith('-') || arg.includes('=');
}


function not(fn) {
  return (...args) => {
    return !fn(...args);
  };
}
