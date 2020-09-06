const { getPercentageOff, toReadableSize } = require('../utils/number');
const { GREEN, EOS, YELLOW } = require('../constants/colors');

module.exports = {
  compress: '压缩',
  compressing: '压缩中',
  compressed: '压缩结束',
  compressFailed: '压缩失败',

  summarize: ({ dest, beforeSizeInByte, afterSizeInByte, nTurns, lastTurnDelta } = {}) => {
    const totalBytesOff = beforeSizeInByte - afterSizeInByte;
    const totalPercentageOff = getPercentageOff(beforeSizeInByte, afterSizeInByte);

    return `压缩后的图片位于 ${GREEN}${dest}${EOS}，${YELLOW}压缩前 ${GREEN}${toReadableSize(beforeSizeInByte)}${YELLOW}，压缩后 ${GREEN}${toReadableSize(afterSizeInByte)}${YELLOW}\n 经过 ${nTurns} 轮压缩，共压缩 ${GREEN}${toReadableSize(totalBytesOff)}${YELLOW}，压缩率 ${GREEN}${totalPercentageOff}${YELLOW}\n 最后一轮压缩相差 ${GREEN}${toReadableSize(lastTurnDelta)}${EOS}`
  },

  genTotalTimeCostsTips(src) {
    return `${this.compress} ${src} 共耗时`;
  },
}
