const { getPercentageOff, toReadableSize } = require('../utils/number');
const { GREEN, EOS, YELLOW } = require('../constants/colors');
const { underline } = require('../utils/colorize');

module.exports = {
  compress: '压缩',
  compressing: '压缩中',
  compressed: '压缩结束',
  compressFailed: '压缩失败',

  summarize: ({ dest, beforeSizeInByte, afterSizeInByte, nTurns, lastTurnDelta } = {}) => {
    const totalBytesOff = beforeSizeInByte - afterSizeInByte;
    const totalPercentageOff = getPercentageOff(beforeSizeInByte, afterSizeInByte);

    return [
      `压缩后的图片位于 ${GREEN}${underline(dest)}${EOS}，${YELLOW}压缩前 ${GREEN}${toReadableSize(beforeSizeInByte)}${YELLOW}，压缩后 ${GREEN}${toReadableSize(afterSizeInByte)}${YELLOW}`,

      `经过 ${nTurns} 轮压缩，共压缩 ${GREEN}${toReadableSize(totalBytesOff)}${YELLOW}，压缩率 ${GREEN}${totalPercentageOff}${YELLOW}`,

      `最后一轮压缩相差 ${GREEN}${toReadableSize(lastTurnDelta)}${EOS}`,
    ].join('\n ');
  },

  genTotalTimeCostsTips(src) {
    return `${this.compress} ${src} 共耗时`;
  },
}
