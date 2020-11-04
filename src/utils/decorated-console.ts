import { GREEN, EOS, YELLOW, RED } from '../constants/colors';

const timeMarkers: Array<{ label: string; start: number; }> = [];

export const decorated = {
  time: (label: string) => {
    timeMarkers.push({ label, start: Date.now() });
  },

  timeEnd: (label: string) => {
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

  success: (...args: any[]) => {
    return console.info(`${GREEN}✔ `, ...args, EOS);
  },

  info: (...args: any[]) => {
    return console.info(`👀`, ...args, EOS);
  },

  warn: (...args: any[]) => {
    return console.warn(`${YELLOW}⚠️ `, ...args, EOS);
  },

  error: (...args: any[]) => {
    return console.error(`${RED}✖ `, ...args, EOS);
  },
};
