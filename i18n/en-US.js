const { getPercentageOff } = require('../utils/number');
const { GREEN, EOS, YELLOW } = require('../constants/colors');

module.exports = {
  compress: 'Compress',
  compressing: 'Compressing',
  compressed: 'Compressed',
  compressFailed: 'Compressed failed',

  summarize: ({ dest, beforeSizeInByte, afterSizeInByte, nTurns, lastTurnDelta } = {}) => {
    const totalBytesOff = beforeSizeInByte - afterSizeInByte;
    const totalPercentageOff = getPercentageOff(beforeSizeInByte, afterSizeInByte);

    return `The final compressed image is ${GREEN}${dest}${EOS}, ${YELLOW}before ${GREEN}${beforeSizeInByte} ${YELLOW}Bytes, after ${GREEN}${afterSizeInByte} ${YELLOW}Bytes, ${GREEN}${totalBytesOff} ${YELLOW}Bytes (${GREEN}${totalPercentageOff}${YELLOW}) totally off in ${nTurns} turn(s). Delta in the last turn is ${lastTurnDelta}.`
  },

  genTotalTimeCostsTips({ src = '' } = {}) {
    return `${this.compress} ${src} total costs`;
  },
}
