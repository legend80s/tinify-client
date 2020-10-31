const { GREEN, EOS, YELLOW, RED } = require('../constants/colors');

const timeMarkers = [];

const decorated = {
  time: (label) => {
    timeMarkers.push({ label, start: Date.now() });
  },

  timeEnd: (label) => {
    const index = timeMarkers.findIndex(marker => marker.label === label);

    if (index === -1) {
      console.error('no label matched:', label);

      return;
    }

    const marker = timeMarkers[index];
    const time = Date.now() - marker.start;
    const badge = time < 2048 ? '🚀' : '🐌'

    console.info(`${badge}`, label, time, 'ms', EOS);

    timeMarkers.splice(index, 1);
  },

  success: (...args) => {
    return console.info(`${GREEN}✔ `, ...args, EOS);
  },

  info: (...args) => {
    return console.info(`👀`, ...args, EOS);
  },

  warn: (...args) => {
    return console.warn(`${YELLOW}⚠️ `, ...args, EOS);
  },

  error: (...args) => {
    return console.error(`${RED}✖ `, ...args, EOS);
  },
};


exports.decorated = decorated;
