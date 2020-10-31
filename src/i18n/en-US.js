const { getPercentageOff, toReadableSize } = require('../utils/number');
const { GREEN, EOS, YELLOW } = require('../constants/colors');
const { underline, green } = require('../utils/colorize');

module.exports = {
  compress: 'Compress',
  compressing: 'Compressing',
  compressed: 'Compressed',
  compressFailed: 'Compressed failed',

  summarize: ({ src, dest, beforeSizeInByte, afterSizeInByte, nTurns, lastTurnDelta, cost }) => {
    const totalBytesOff = beforeSizeInByte - afterSizeInByte;
    const totalPercentageOff = getPercentageOff(beforeSizeInByte, afterSizeInByte);

    return  [
      `${GREEN}${underline(dest)} ${toReadableSize(beforeSizeInByte)}${YELLOW} → ${GREEN}${toReadableSize(afterSizeInByte)} ${EOS}${toReadableSize(totalBytesOff)}, ${green(totalPercentageOff)} off in ${nTurns} turn(s).`
        + (lastTurnDelta > 0 ? ` Last turn delta ${toReadableSize(lastTurnDelta)}.` : ''),

      `costs:`,
      `${cost}ms.`,
    ].join(' ');

    // return  `${src} → ${underline(dest)} ${GREEN}${toReadableSize(beforeSizeInByte)}${YELLOW} → ${GREEN}${toReadableSize(afterSizeInByte)} ${EOS}${toReadableSize(totalBytesOff)}, ${totalPercentageOff} off in ${nTurns} turn(s).` + (lastTurnDelta > 0 ? ` Last turn delta ${toReadableSize(lastTurnDelta)}.` : '');
  },

  genTotalTimeCostsTips({ src = '' } = {}) {
    return `${this.compress} ${src} total costs`;
  },
}
