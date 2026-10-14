// test262's small value helpers: tcoHelper.js, dateConstants.js, assertRelativeDateMs.js, decimalToHexString.js.
import { Test262Error } from './sta.ts';

export const $MAX_ITERATIONS = 100000;

export const date_1899_end = -2208988800001;
export const date_1900_start = -2208988800000;
export const date_1969_end = -1;
export const date_1970_start = 0;
export const date_1999_end = 946684799999;
export const date_2000_start = 946684800000;
export const date_2099_end = 4102444799999;
export const date_2100_start = 4102444800000;
export const start_of_time = -8.64e15;
export const end_of_time = 8.64e15;

export function assertRelativeDateMs(date: Date, expectedMs: number): void {
  const actualMs = date.valueOf();
  const localOffset = date.getTimezoneOffset() * 60000;
  if (actualMs - localOffset !== expectedMs) throw new Test262Error('Expected ' + date + ' to be ' + expectedMs + ' milliseconds from the Unix epoch');
}

export function decimalToHexString(n: number): string {
  const hex = '0123456789ABCDEF';
  n >>>= 0;
  let s = '';
  while (n) {
    s = hex[n & 0xf] + s;
    n >>>= 4;
  }
  while (s.length < 4) s = '0' + s;
  return s;
}

export function decimalToPercentHexString(n: number): string {
  const hex = '0123456789ABCDEF';
  return '%' + hex[(n >> 4) & 0xf] + hex[n & 0xf];
}
