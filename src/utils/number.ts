export function getPercentageOff(before: number, after: number): string {
  const diff = before - after;

  return (before !== 0 ? (diff / before * 100).toFixed(2) : '0') + '%';
}

export function toReadableSize(sizeInByte: number) {
  if (sizeInByte >= 1024 * 1024) {
    return (sizeInByte / 1024 / 1024).toFixed(2) + 'MB';
  }

  if (sizeInByte >= 1024) {
    return (sizeInByte / 1024).toFixed(2) + 'KB';
  }

  return sizeInByte + 'B';
}
