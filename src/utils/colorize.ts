import { EOS, GREEN, RED, UNDERLINED, YELLOW, ITALIC } from '../constants/colors';

/**
 * Make text underlined.
 * @param {string} text
 * @returns {string}
 */
export function underline(text: string): string {
  return `${UNDERLINED}${text}${EOS}`;
}

function italic(text: string): string {
  return `${ITALIC}${text}${EOS}`;
}

export const green = (text: string): string => {
  return `${GREEN}${text}${EOS}`;
}

export const yellow = (text: string): string => {
  return `${YELLOW}${text}${EOS}`;
}

const red = (text: string): string => {
  return `${RED}${text}${EOS}`;
}

export const chalk = {
  green,
  yellow,
  red,

  underline,
  italic,
}
