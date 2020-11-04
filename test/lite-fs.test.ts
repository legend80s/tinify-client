import { isDirectory } from '../src/utils/lite-fs';

describe('lite-fs', () => {
  it('isDirectory false', () => {
    const input = './alipay-logo.png';
    const actual = isDirectory(input);
    const expected = false;

    expect(actual).toEqual(expected);
  });

  it('isDirectory true', () => {
    const input = './';
    const actual = isDirectory(input);
    const expected = true;

    expect(actual).toEqual(expected);
  });

  it('isDirectory true', () => {
    const input = './alipay-logo';
    const actual = isDirectory(input);
    const expected = true;

    expect(actual).toEqual(expected);
  });
});
