import { EOS, GREEN, UNDERLINED } from '../constants/colors';

/**
 * Make text underlined.
 * @param {string} text
 * @returns {string}
 */
export function underline(text: string): string {
  return `${UNDERLINED}${text}${EOS}`;
}

export const green = (text: string): string => {
  return `${GREEN}${text}${EOS}`;
}
