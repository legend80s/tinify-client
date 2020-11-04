export const last = <T extends unknown>(arr: T[]): T => {
  return arr[arr.length - 1];
}

export const isString = (obj: any): boolean => {
  return typeof obj === 'string';
}

export const timeToReadable = (ms: number): string => {
  const seconds = String(ms / 1000);

  return seconds.includes('.') ?  `${seconds}s` : `${seconds}.0s`;
}
