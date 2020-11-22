import { getPercentageOff, toReadableSize } from '../utils/number';
// const { GREEN, EOS, YELLOW } = require('../constants/colors');
// const { underline, green } = require('../utils/colorize');

export interface ISummarizeOptions {
  dest: string;
  beforeSizeInByte: number;
  afterSizeInByte: number;
  nTurns: number;
  lastTurnDelta: number;
  costs: number;
}

export default {
  compress: 'Compress',
  compressing: 'Compressing',
  compressed: 'Compressed',
  compressFailed: 'Compressed failed',

  summarize: ({ dest, beforeSizeInByte, afterSizeInByte, nTurns, lastTurnDelta, costs }: ISummarizeOptions) => {
    const totalBytesOff = beforeSizeInByte - afterSizeInByte;
    const totalPercentageOff = getPercentageOff(beforeSizeInByte, afterSizeInByte);

    return {
      Where: dest,
      Before: toReadableSize(beforeSizeInByte),
      After: toReadableSize(afterSizeInByte),
      Reduced: `${toReadableSize(totalBytesOff)} ${totalPercentageOff}`,
      'Last Δ': toReadableSize(lastTurnDelta),
      Turns: nTurns,
      'Costs (ms)': costs,
    }

    // return  [
    //   `${GREEN}${underline(dest)} ${toReadableSize(beforeSizeInByte)}${YELLOW} → ${GREEN}${toReadableSize(afterSizeInByte)} ${EOS}${toReadableSize(totalBytesOff)}, ${green(totalPercentageOff)} off in ${nTurns} turn(s).`
    //     + (lastTurnDelta > 0 ? ` Last turn delta ${toReadableSize(lastTurnDelta)}.` : ''),

    //   `costs:`,
    //   `${cost}ms.`,
    // ].join(' ');

    // return  `${src} → ${underline(dest)} ${GREEN}${toReadableSize(beforeSizeInByte)}${YELLOW} → ${GREEN}${toReadableSize(afterSizeInByte)} ${EOS}${toReadableSize(totalBytesOff)}, ${totalPercentageOff} off in ${nTurns} turn(s).` + (lastTurnDelta > 0 ? ` Last turn delta ${toReadableSize(lastTurnDelta)}.` : '');
  },

  genTotalTimeCostsTips({ src = '' } = {}) {
    return `${this.compress} ${src} total costs`;
  },
}
