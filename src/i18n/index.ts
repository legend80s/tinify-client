import enUS from './en-US';
import zhCN from './zh-CN';

function getLanguage() {
  const envLang = process.env.LANG;
  const lang = Intl.DateTimeFormat().resolvedOptions().locale;

  return envLang || lang;
}

export function i18n(language = '') {
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
