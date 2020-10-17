const { getPercentageOff, toReadableSize } = require('../utils/number');
const { GREEN, EOS, YELLOW } = require('../constants/colors');
const { underline } = require('../utils/colorize');

module.exports = {
  compress: 'Compress',
  compressing: 'Compressing',
  compressed: 'Compressed',
  compressFailed: 'Compressed failed',

  summarize: ({ dest, beforeSizeInByte, afterSizeInByte, nTurns, lastTurnDelta } = {}) => {
    const totalBytesOff = beforeSizeInByte - afterSizeInByte;
    const totalPercentageOff = getPercentageOff(beforeSizeInByte, afterSizeInByte);

    return [
      `The final compressed image is ${GREEN}${underline(dest)}${EOS}, ${YELLOW}before ${GREEN}${toReadableSize(beforeSizeInByte)}${YELLOW}, after ${GREEN}${toReadableSize(afterSizeInByte)}${YELLOW}.`,

      `${GREEN}${toReadableSize(totalBytesOff)}${YELLOW} (${GREEN}${totalPercentageOff}${YELLOW}) totally off in ${nTurns} turn(s). Delta in the last turn is ${GREEN}${toReadableSize(lastTurnDelta)}${YELLOW}.${EOS}`,
    ].join('\n ');
  },

  genTotalTimeCostsTips({ src = '' } = {}) {
    return `${this.compress} ${src} total costs`;
  },
}
