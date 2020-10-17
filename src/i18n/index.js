const enUS = require('./en-US');
const zhCN = require('./zh-CN');

/**
 * @returns { 'en-US' | 'zh-CN' }
 */
function getLanguage() {
  const envLang = process.env.LANG;
  const lang = Intl.DateTimeFormat().resolvedOptions().locale;

  return envLang || lang;
}

exports.i18n = function i18n(language = '') {
  const lang = language || getLanguage();
  let dictionary;

  switch (lang) {
    case 'zh-CN':
      dictionary = zhCN;
      break;

    default:
      dictionary = enUS;
      break;
  }

  return dictionary;
}
