import { getPercentageOff, toReadableSize } from '../utils/number';
import en, { ISummarizeOptions } from './en-US';
// const { GREEN, EOS, YELLOW } = require('../constants/colors');
// import { underline } from '../utils/colorize';

export default {
  compress: '压缩',
  compressing: '压缩中',
  compressed: '压缩结束',
  compressFailed: '压缩失败',

  summarize: ({ dest, beforeSizeInByte, afterSizeInByte, nTurns, lastTurnDelta, costs }: ISummarizeOptions) => {
    // console.table 对中文支持不好，头部会溢出，故统一英文输出
    return en.summarize({ dest, beforeSizeInByte, afterSizeInByte, nTurns, lastTurnDelta, costs })

    // const totalBytesOff = beforeSizeInByte - afterSizeInByte;
    // const totalPercentageOff = getPercentageOff(beforeSizeInByte, afterSizeInByte);

    // return {
    //   位置: dest,
    //   压缩前: toReadableSize(beforeSizeInByte),
    //   压缩后: toReadableSize(afterSizeInByte),
    //   节省: `${toReadableSize(totalBytesOff)}, ${totalPercentageOff}`,
    //   最后一轮压缩之差: toReadableSize(lastTurnDelta),
    //   压缩次数: nTurns,
    //   耗时: `${cost}ms`,
    // };

      // `压缩后的图片位于 ${GREEN}${underline(dest)}${EOS}，${YELLOW}压缩前 ${GREEN}${toReadableSize(beforeSizeInByte)}${YELLOW}，压缩后 ${GREEN}${toReadableSize(afterSizeInByte)}${YELLOW}`,

      // `经过 ${nTurns} 轮压缩，共压缩 ${GREEN}${toReadableSize(totalBytesOff)}${YELLOW}，压缩率 ${GREEN}${totalPercentageOff}${YELLOW}`,

      // `最后一轮压缩相差 ${GREEN}${toReadableSize(lastTurnDelta)}${EOS}`,
  },

  genTotalTimeCostsTips(src: string) {
    return `${this.compress} ${src} 共耗时`;
  },
}
