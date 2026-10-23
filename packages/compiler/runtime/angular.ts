// The Angular runtime a compiled template uses, written once for both backends: @angular/common's pipes, which the
// template compiler creates one of per pipe in a template, as Angular's does, and calls as Angular calls them (a pure
// pipe only when an argument changed), NgClass and NgStyle, and @angular/core's QueryList. The pipes' output is
// Angular's for the `en-US` locale, the only one a compiled release has: the formatting follows @angular/common's
// formatDate and formatNumber, with en-US's locale data.
import { ChangeDetectorRef, ElementRef, inject } from '@angular/core';

/** Angular's NG02100 error, as `invalidPipeArgumentError` words it. */
function invalidPipeArgument(pipe: string, value: unknown): Error {
  return new Error(`NG02100: InvalidPipeArgument: '${value}' for pipe '${pipe}'`);
}

function checkLocale(locale: string | undefined): void {
  // A compiled release has en-US's locale data only.
  if (locale && !/^en(?:[-_]US)?$/i.test(locale)) throw new Error(`NG0701: Missing locale data for the locale "${locale}".`);
}

const MONTHS = [
  ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
];
const DAYS = [
  ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
];
const ERAS = [['B', 'A'], ['BC', 'AD'], ['Before Christ', 'Anno Domini']];
/** en-US's day periods: the format style has narrow and abbreviated names, the standalone style one name for all widths. */
const DAY_PERIODS = [['a', 'p'], ['AM', 'PM']];
const STANDALONE_DAY_PERIODS = ['AM', 'PM'];

/** en-US's named formats: CLDR puts a narrow no-break space (U+202F) before the day period. */
const NAMED_FORMATS: Record<string, string> = {
  shortDate: 'M/d/yy', mediumDate: 'MMM d, y', longDate: 'MMMM d, y', fullDate: 'EEEE, MMMM d, y',
  shortTime: 'h:mm\u202Fa', mediumTime: 'h:mm:ss\u202Fa', longTime: 'h:mm:ss\u202Fa z', fullTime: 'h:mm:ss\u202Fa zzzz',
  short: 'M/d/yy, h:mm\u202Fa', medium: 'MMM d, y, h:mm:ss\u202Fa', long: 'MMMM d, y, h:mm:ss\u202Fa z', full: 'EEEE, MMMM d, y, h:mm:ss\u202Fa zzzz',
};

const ISO8601_DATE = /^(\d{4,})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
const DATE_FORMATS_SPLIT = /((?:[^BEGHLMOSWYZabcdhmswyz']+)|(?:'(?:[^']|'')*')|(?:G{1,5}|y{1,4}|Y{1,4}|M{1,5}|L{1,5}|w{1,2}|W{1}|d{1,2}|E{1,6}|c{1,6}|a{1,5}|b{1,5}|B{1,5}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|z{1,4}|Z{1,5}|O{1,4}))([\s\S]*)/;

function isDate(value: unknown): value is Date {
  if (!(value instanceof Date)) return false;
  const date: Date = value;
  return !isNaN(date.getTime());
}

function createDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setFullYear(year, month, day);
  date.setHours(0, 0, 0);
  return date;
}

function isoStringToDate(match: RegExpMatchArray): Date {
  const date = new Date(0);
  let tzHour = 0;
  let tzMin = 0;
  const utc = !!match[8];
  if (match[9]) {
    tzHour = Number(match[9] + match[10]);
    tzMin = Number(match[9] + match[11]);
  }
  if (utc) date.setUTCFullYear(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  else date.setFullYear(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const h = Number(match[4] || 0) - tzHour;
  const m = Number(match[5] || 0) - tzMin;
  const s = Number(match[6] || 0);
  const ms = Math.floor(parseFloat('0.' + (match[7] || 0)) * 1000);
  if (utc) date.setUTCHours(h, m, s, ms);
  else date.setHours(h, m, s, ms);
  return date;
}

/** A Date, a timestamp, `yyyy-MM-dd` (a local date), an ISO 8601 string or anything `new Date` reads. */
function toDate(value: Date | string | number): Date {
  if (isDate(value)) return value;
  if (typeof value === 'number' && !isNaN(value)) return new Date(value);
  if (typeof value === 'string') {
    const text = value.trim();
    if (/^(\d{4}(-\d{1,2}(-\d{1,2})?)?)$/.test(text)) {
      const parts = text.split('-').map((p) => +p);
      return createDate(parts[0], (parts.length > 1 ? parts[1] : 1) - 1, parts.length > 2 ? parts[2] : 1);
    }
    const parsed = parseFloat(text);
    if (!isNaN(Number(text) - parsed)) return new Date(parsed);
    const match = text.match(ISO8601_DATE);
    if (match) return isoStringToDate(match);
    const date = new Date(text);
    if (!isDate(date)) throw new Error(`NG02311: Unable to convert "${value}" into a date`);
    return date;
  }
  const date = new Date(value as any);
  if (!isDate(date)) throw new Error(`NG02311: Unable to convert "${value}" into a date`);
  return date;
}

function padNumber(num: number, digits: number, trim = false, negWrap = false): string {
  let neg = '';
  if (num < 0 || (negWrap && num <= 0)) {
    if (negWrap) num = -num + 1;
    else {
      num = -num;
      neg = '-';
    }
  }
  let text = String(num);
  while (text.length < digits) text = '0' + text;
  if (trim) text = text.slice(text.length - digits);
  return neg + text;
}

/** The minutes a timezone (`UTC`, `+0430`, `-08:00`, `GMT+2`, a US zone abbreviation) is behind UTC, as Date.parse reads it; else `fallback`. */
function timezoneToOffset(timezone: string, fallback: number): number {
  const zone = timezone.replace(/:/g, '').trim().toUpperCase();
  const named: Record<string, number> = { UTC: 0, UT: 0, GMT: 0, Z: 0, EST: 300, EDT: 240, CST: 360, CDT: 300, MST: 420, MDT: 360, PST: 480, PDT: 420 };
  if (zone in named) return named[zone];
  const m = /^(?:UTC|UT|GMT)?([+-])(\d{1,2}|\d{4})$/.exec(zone);
  if (!m) return fallback;
  const digits = m[2];
  const hours = digits.length === 4 ? Number(digits.slice(0, 2)) : Number(digits);
  const minutes = digits.length === 4 ? Number(digits.slice(2)) : 0;
  const offset = hours * 60 + minutes;
  return m[1] === '+' ? -offset : offset;
}

function inTimezone(date: Date, timezone: string): Date {
  const local = date.getTimezoneOffset();
  const shifted = new Date(date.getTime());
  shifted.setMinutes(shifted.getMinutes() - (timezoneToOffset(timezone, local) - local));
  return shifted;
}

function weekThursday(date: Date): Date {
  const day = date.getDay();
  return createDate(date.getFullYear(), date.getMonth(), date.getDate() + (day === 0 ? -3 : 4 - day));
}

function firstThursdayOfYear(year: number): Date {
  const first = createDate(year, 0, 1).getDay();
  return createDate(year, 0, 1 + (first <= 4 ? 4 : 11) - first);
}

function zoneText(width: number, offset: number): string {
  const zone = -1 * offset;
  const hours = zone > 0 ? Math.floor(zone / 60) : Math.ceil(zone / 60);
  const sign = zone >= 0 ? '+' : '';
  const minutes = padNumber(Math.abs(zone % 60), 2);
  if (width === 0) return sign + padNumber(hours, 2) + minutes;
  if (width === 1) return 'GMT' + sign + padNumber(hours, 1);
  if (width === 2) return 'GMT' + sign + padNumber(hours, 2) + ':' + minutes;
  return offset === 0 ? 'Z' : sign + padNumber(hours, 2) + ':' + minutes;
}

/** One field of a date pattern (`yyyy`, `MMM`, `h`), or null for literal text. */
function formatField(field: string, date: Date, offset: number): string | null {
  const letter = field[0];
  const n = field.length;
  switch (letter) {
    case 'G': return ERAS[n <= 3 ? 1 : n === 4 ? 2 : 0][date.getFullYear() <= 0 ? 0 : 1];
    case 'y': return n === 2 ? padNumber(date.getFullYear(), 2, true, true) : padNumber(date.getFullYear(), n === 1 ? 1 : n, false, true);
    case 'Y': {
      const year = weekThursday(date).getFullYear();
      return n === 2 ? padNumber(year, 2, true) : padNumber(year, n);
    }
    case 'M': case 'L':
      if (n <= 2) return padNumber(date.getMonth() + 1, n);
      return MONTHS[n === 3 ? 1 : n === 4 ? 2 : 0][date.getMonth()];
    case 'w': {
      const thursday = weekThursday(date);
      const week = 1 + Math.round((thursday.getTime() - firstThursdayOfYear(thursday.getFullYear()).getTime()) / 6.048e8);
      return padNumber(week, n);
    }
    case 'W': {
      const before = new Date(date.getFullYear(), date.getMonth(), 1).getDay() - 1;
      return padNumber(1 + Math.floor((date.getDate() + before) / 7), 1);
    }
    case 'd': return padNumber(date.getDate(), n);
    case 'c':
      if (n <= 2) return padNumber(date.getDay(), 1);
      return DAYS[n === 3 ? 1 : n === 4 ? 2 : n === 5 ? 0 : 3][date.getDay()];
    case 'E': return DAYS[n <= 3 ? 1 : n === 4 ? 2 : n === 5 ? 0 : 3][date.getDay()];
    case 'a': return n === 5 ? DAY_PERIODS[0][date.getHours() < 12 ? 0 : 1] : DAY_PERIODS[1][date.getHours() < 12 ? 0 : 1];
    case 'b': case 'B':
      // Angular's flexible day periods need the locale's extra data, which en-US's built-in data leaves out.
      throw new Error('NG02303: Missing extra locale data for the locale "en". Use "registerLocaleData" to load new data. See the "I18n guide" on angular.io to know more.');
    case 'h': {
      let hours = date.getHours();
      if (hours > 12) hours -= 12;
      if (hours === 0) hours = 12;
      return padNumber(hours, n);
    }
    case 'H': return padNumber(date.getHours(), n);
    case 'm': return padNumber(date.getMinutes(), n);
    case 's': return padNumber(date.getSeconds(), n);
    case 'S': return padNumber(date.getMilliseconds(), 3).substring(0, n);
    case 'Z': return zoneText(n <= 3 ? 0 : n === 4 ? 2 : 3, offset);
    case 'O': case 'z': return zoneText(n <= 3 ? 1 : 2, offset);
  }
  return null;
}

/** Angular's `formatDate` for en-US. */
export function formatDate(value: Date | string | number, format: string, locale?: string, timezone?: string): string {
  checkLocale(locale);
  let date = toDate(value);
  if (format.length > 256) throw new Error('NG02300: Date format is too long. Exceeded maximum length of 256 characters.');
  let rest = NAMED_FORMATS[format] ?? format;
  const parts: string[] = [];
  while (rest) {
    const match = DATE_FORMATS_SPLIT.exec(rest);
    if (!match) {
      parts.push(rest);
      break;
    }
    parts.push(match[1]);
    if (!match[2]) break;
    rest = match[2];
  }
  if (parts.some((p) => /^Y+$/.test(p)) && !parts.some((p) => /^w+$/.test(p))) {
    const message = `NG02300: Suspicious use of week-based year "Y" in date pattern "${parts.join('')}". Did you mean to use calendar year "y" instead?`;
    if (parts.length === 1) console.error(message);
    else throw new Error(message);
  }
  let offset = date.getTimezoneOffset();
  if (timezone) {
    offset = timezoneToOffset(timezone, offset);
    date = inTimezone(date, timezone);
  }
  let text = '';
  for (const part of parts) {
    const field = /^[BEGHLMOSWYZabcdhmswyz]+$/.test(part) ? formatField(part, date, offset) : null;
    text += field !== null ? field : part === "''" ? "'" : part.replace(/(^'|'$)/g, '').replace(/''/g, "'");
  }
  return text;
}

interface ParsedNumber {
  digits: number[];
  exponent: number;
  integerLen: number;
}

function parseNumber(num: number): ParsedNumber {
  let text = Math.abs(num) + '';
  let exponent = 0;
  let integerLen = text.indexOf('.');
  if (integerLen > -1) text = text.replace('.', '');
  const e = text.search(/e/i);
  if (e > 0) {
    if (integerLen < 0) integerLen = e;
    integerLen += +text.slice(e + 1);
    text = text.substring(0, e);
  } else if (integerLen < 0) {
    integerLen = text.length;
  }
  let i = 0;
  while (text.charAt(i) === '0') i++;
  let digits: number[] = [];
  let last = text.length;
  if (i === last) {
    digits = [0];
    integerLen = 1;
  } else {
    last--;
    while (text.charAt(last) === '0') last--;
    integerLen -= i;
    for (; i <= last; i++) digits.push(Number(text.charAt(i)));
  }
  if (integerLen > 22) {
    digits = digits.slice(0, 21);
    exponent = integerLen - 1;
    integerLen = 1;
  }
  return { digits, exponent, integerLen };
}

/** Rounds the digits to between `minFrac` and `maxFrac` fraction digits, half up, as Angular's `roundNumber` does. */
function roundNumber(parsed: ParsedNumber, minFrac: number, maxFrac: number): void {
  if (minFrac > maxFrac) throw new Error(`NG02307: The minimum number of digits after fraction (${minFrac}) is higher than the maximum (${maxFrac}).`);
  const digits = parsed.digits;
  let fractionLen = digits.length - parsed.integerLen;
  const fractionSize = Math.min(Math.max(minFrac, fractionLen), maxFrac);
  let roundAt = fractionSize + parsed.integerLen;
  const digit = roundAt < digits.length ? digits[roundAt] : NaN;
  if (roundAt > 0) {
    digits.length = Math.min(digits.length, Math.max(parsed.integerLen, roundAt));
    for (let j = roundAt; j < digits.length; j++) digits[j] = 0;
  } else {
    fractionLen = Math.max(0, fractionLen);
    parsed.integerLen = 1;
    roundAt = fractionSize + 1;
    digits.length = Math.max(1, roundAt);
    digits[0] = 0;
    for (let k = 1; k < roundAt; k++) digits[k] = 0;
  }
  if (digit >= 5) {
    if (roundAt - 1 < 0) {
      for (let k = 0; k > roundAt; k--) {
        digits.unshift(0);
        parsed.integerLen++;
      }
      digits.unshift(1);
      parsed.integerLen++;
    } else {
      digits[roundAt - 1]++;
    }
  }
  for (; fractionLen < Math.max(0, fractionSize); fractionLen++) digits.push(0);
  let dropTrailingZeros = fractionSize !== 0;
  const minLen = minFrac + parsed.integerLen;
  let carry = 0;
  for (let k = digits.length - 1; k >= 0; k--) {
    const d = digits[k] + carry;
    digits[k] = d < 10 ? d : d - 10;
    carry = d >= 10 ? 1 : 0;
    if (dropTrailingZeros) {
      if (digits[k] === 0 && k >= minLen) digits.pop();
      else dropTrailingZeros = false;
    }
  }
  if (carry) {
    digits.unshift(carry);
    parsed.integerLen++;
  }
}

function parseDigitsInfo(digitsInfo: string, defaults: { minInt: number; minFrac: number; maxFrac: number }): { minInt: number; minFrac: number; maxFrac: number } {
  const parts = /^(\d+)?\.((\d+)(-(\d+))?)?$/.exec(digitsInfo);
  if (!parts) throw new Error(`NG02306: ${digitsInfo} is not a valid digit info`);
  const out = { ...defaults };
  // A group that did not take part is undefined, and one of digits is never empty.
  if (parts[1]) out.minInt = parseInt(parts[1]);
  if (parts[3]) out.minFrac = parseInt(parts[3]);
  if (parts[5]) out.maxFrac = parseInt(parts[5]);
  else if (parts[3] && out.minFrac > out.maxFrac) out.maxFrac = out.minFrac;
  if (out.minInt > 100 || out.minFrac > 100 || out.maxFrac > 100) throw new Error(`NG02306: ${digitsInfo} is not a valid digit info. Exceeded maximum limits of 100 digits.`);
  return out;
}

/** en-US's `#,##0.###` (and `#,##0%` for percents): grouped by threes, `minInt.minFrac-maxFrac` digits. */
function formatDigits(value: number, digitsInfo: string | undefined, percent: boolean, defaults: { minInt: number; minFrac: number; maxFrac: number }): string {
  let text: string;
  let isZero = false;
  if (!isFinite(value)) {
    text = '∞';
  } else {
    const parsed = parseNumber(value);
    if (percent && parsed.digits[0] !== 0) {
      const fractionLen = parsed.digits.length - parsed.integerLen;
      if (parsed.exponent) parsed.exponent += 2;
      else {
        if (fractionLen === 0) parsed.digits.push(0, 0);
        else if (fractionLen === 1) parsed.digits.push(0);
        parsed.integerLen += 2;
      }
    }
    const { minInt, minFrac, maxFrac } = digitsInfo ? parseDigitsInfo(digitsInfo, defaults) : defaults;
    roundNumber(parsed, minFrac, maxFrac);
    let digits = parsed.digits;
    let integerLen = parsed.integerLen;
    isZero = digits.every((d) => !d);
    for (; integerLen < minInt; integerLen++) digits.unshift(0);
    for (; integerLen < 0; integerLen++) digits.unshift(0);
    let decimals: number[];
    if (integerLen > 0) {
      decimals = digits.slice(integerLen);
      digits = digits.slice(0, integerLen);
    } else {
      decimals = digits;
      digits = [0];
    }
    const groups: string[] = [];
    if (digits.length >= 3) groups.unshift(digits.splice(digits.length - 3).join(''));
    while (digits.length > 3) groups.unshift(digits.splice(digits.length - 3).join(''));
    if (digits.length) groups.unshift(digits.join(''));
    text = groups.join(',');
    if (decimals.length) text += '.' + decimals.join('');
    if (parsed.exponent) text += 'E+' + parsed.exponent;
  }
  if (percent) text += '%';
  return value < 0 && !isZero ? '-' + text : text;
}

/** Angular's `formatNumber` for en-US (`1.0-3` unless `digitsInfo` says otherwise). */
export function formatNumber(value: number, locale?: string, digitsInfo?: string): string {
  checkLocale(locale);
  return formatDigits(value, digitsInfo, false, { minInt: 1, minFrac: 0, maxFrac: 3 });
}

/** Angular's `formatPercent` for en-US. */
export function formatPercent(value: number, locale?: string, digitsInfo?: string): string {
  checkLocale(locale);
  return formatDigits(value, digitsInfo, true, { minInt: 1, minFrac: 0, maxFrac: 0 });
}

function isValue(value: unknown): boolean {
  return !(value == null || value === '' || value !== value);
}

function strToNumber(value: number | string): number {
  if (typeof value === 'string' && !isNaN(Number(value) - parseFloat(value))) return Number(value);
  if (typeof value !== 'number') throw new Error(`NG02309: ${value} is not a number`);
  return value;
}

export class DatePipe {
  transform(value: Date | string | number | null | undefined, format?: string, timezone?: string, locale?: string): string | null {
    if (value == null || value === '' || value !== value) return null;
    try {
      return formatDate(value, format ?? 'mediumDate', locale, timezone);
    } catch (error) {
      throw invalidPipeArgument('DatePipe', (error as Error).message);
    }
  }
}

export class DecimalPipe {
  transform(value: number | string | null | undefined, digitsInfo?: string, locale?: string): string | null {
    if (value == null || !isValue(value)) return null;
    try {
      return formatNumber(strToNumber(value), locale, digitsInfo);
    } catch (error) {
      throw invalidPipeArgument('DecimalPipe', (error as Error).message);
    }
  }
}

export class PercentPipe {
  transform(value: number | string | null | undefined, digitsInfo?: string, locale?: string): string | null {
    if (value == null || !isValue(value)) return null;
    try {
      return formatPercent(strToNumber(value), locale, digitsInfo);
    } catch (error) {
      throw invalidPipeArgument('PercentPipe', (error as Error).message);
    }
  }
}

export class UpperCasePipe {
  transform(value: any): string | null {
    if (value == null) return null;
    if (typeof value !== 'string') throw invalidPipeArgument('UpperCasePipe', value);
    return value.toUpperCase();
  }
}

export class LowerCasePipe {
  transform(value: any): string | null {
    if (value == null) return null;
    if (typeof value !== 'string') throw invalidPipeArgument('LowerCasePipe', value);
    return value.toLowerCase();
  }
}

export class TitleCasePipe {
  transform(value: any): string | null {
    if (value == null) return null;
    if (typeof value !== 'string') throw invalidPipeArgument('TitleCasePipe', value);
    // Angular's word pattern is every Unicode letter and digit; a word here starts at a letter or digit and runs to the next space.
    return value.replace(/[0-9A-Za-zªµºÀ-ÖØ-öø-ˁͰ-ϿЀ-ԯԱ-ևא-תؠ-يḀ-῿぀-ヿ一-鿿가-힣]\S*/g, (word) => word[0].toUpperCase() + word.slice(1).toLowerCase());
  }
}

export class JsonPipe {
  transform(value: any): string {
    return JSON.stringify(value, null, 2);
  }
}

export class SlicePipe {
  transform(value: any, start: number, end?: number): any {
    if (value == null) return null;
    if (typeof value !== 'string' && !Array.isArray(value)) throw invalidPipeArgument('SlicePipe', value);
    return value.slice(start, end);
  }
}

export interface KeyValue<K, V> {
  key: K;
  value: V;
}

function defaultComparator(a: KeyValue<any, any>, b: KeyValue<any, any>): number {
  const x = a.key;
  const y = b.key;
  if (x === y) return 0;
  if (x == null) return 1;
  if (y == null) return -1;
  if (typeof x == 'string' && typeof y == 'string') return x < y ? -1 : 1;
  if (typeof x == 'number' && typeof y == 'number') return x - y;
  if (typeof x == 'boolean' && typeof y == 'boolean') return x < y ? -1 : 1;
  const xs = String(x);
  const ys = String(y);
  return xs == ys ? 0 : xs < ys ? -1 : 1;
}

/**
 * Angular's `keyvalue`: an object's or Map's entries, sorted by key, as one array that stays the same array while
 * no key or value changes, as its KeyValueDiffer keeps it.
 */
export class KeyValuePipe {
  private keys: any[] = [];
  private values: any[] = [];
  private keyValues: KeyValue<any, any>[] = [];
  private compareFn: ((a: KeyValue<any, any>, b: KeyValue<any, any>) => number) | null = defaultComparator;
  private seen = false;

  transform(input: any, compareFn: ((a: KeyValue<any, any>, b: KeyValue<any, any>) => number) | null = defaultComparator): KeyValue<any, any>[] | null {
    if (!input || (!(input instanceof Map) && typeof input !== 'object')) return null;
    const keys: any[] = [];
    const values: any[] = [];
    // Iterated untyped: a Map of any key and value types.
    const entries: any = input;
    if (input instanceof Map) {
      for (const entry of entries) {
        keys.push(entry[0]);
        values.push(entry[1]);
      }
    } else {
      for (const k of Object.keys(input)) {
        keys.push(k);
        values.push(input[k]);
      }
    }
    let changed = !this.seen || keys.length !== this.keys.length;
    for (let i = 0; !changed && i < keys.length; i++) changed = !Object.is(keys[i], this.keys[i]) || !Object.is(values[i], this.values[i]);
    this.seen = true;
    if (changed) {
      this.keys = keys;
      this.values = values;
      this.keyValues = keys.map((k, i): KeyValue<any, any> => ({ key: k, value: values[i] }));
    }
    if (changed || compareFn !== this.compareFn) {
      if (compareFn) this.keyValues.sort(compareFn);
      this.compareFn = compareFn;
    }
    return this.keyValues;
  }
}

/** The classes @nativescript/angular's renderer keeps for a view: an ordered set on the view, shared with the forms runtime's ng-* classes. */
function viewClasses(view: any): Map<string, boolean> {
  if (!view.ngCssClasses) {
    const classes = new Map<string, boolean>();
    for (const name of String(view.className ?? '').split(/\s+/)) if (name) classes.set(name, true);
    view.ngCssClasses = classes;
  }
  return view.ngCssClasses;
}

/**
 * The className NgClass gives a component's root view, which has no renderer of its own here: its static classes, then
 * each class NgClass's value names (a string or array of names, a Set, or an object mapping names to conditions), then
 * each `[class.x]` whose value is not undefined. A later entry decides a class an earlier one named. `toggles`
 * alternates a `[class.x]` binding's class name and its value.
 */
export function ngClassNames(base: string, value: any, toggles: any[]): string {
  const names: string[] = [];
  const enabled: boolean[] = [];
  const decide = (written: string, on: boolean) => {
    for (const name of written.trim().split(/\s+/)) {
      if (!name) continue;
      const at = names.indexOf(name);
      if (at < 0) {
        names.push(name);
        enabled.push(on);
      } else enabled[at] = on;
    }
  };
  decide(base, true);
  if (typeof value === 'string') decide(value, true);
  else if (Array.isArray(value) || value instanceof Set) {
    const listed: any = value;
    for (const name of listed) {
      if (typeof name !== 'string') throw new Error(`NgClass can only toggle CSS classes expressed as strings, got ${name}`);
      decide(name, true);
    }
  } else if (value != null && typeof value === 'object') {
    for (const key of Object.keys(value)) decide(key, !!value[key]);
  }
  for (let k = 0; k + 1 < toggles.length; k += 2) if (toggles[k + 1] !== undefined) decide(String(toggles[k]), !!toggles[k + 1]);
  return names.filter((_, k) => enabled[k]).join(' ');
}

/**
 * @angular/common's NgClass on an element's view, beside its static classes and `[class.x]` bindings, changing the view's
 * classes one at a time as @nativescript/angular's renderer does (each add or remove sets className): one className
 * swapping several classes at once can leave a removed class's background behind. Each apply takes the static classes,
 * NgClass's value (a string or array of names, a Set, or an object mapping names to conditions) and the `[class.x]`
 * bindings (a class name and its value, alternating). NgClass removes only a class it named; a `[class.x]` changes its
 * class when its value changes, an undefined one deferring to the static classes.
 */
export class NgClass {
  private readonly view: any = inject(ElementRef).nativeElement;
  private started = false;
  private names: string[] = [];
  private enabled: boolean[] = [];
  private changed: boolean[] = [];
  private touched: boolean[] = [];
  private toggled: any[] = [];

  apply(input: any[]): void {
    const base = String(input[0]);
    const value: any = input[1];
    const toggles: any = input[2];
    const statics = base.trim().split(/\s+/).filter((c) => !!c);
    if (!this.started) {
      this.started = true;
      const classes = new Map<string, boolean>();
      for (const name of statics) classes.set(name, true);
      this.view.ngCssClasses = classes;
      this.view.className = Array.from(classes.keys()).join(' ');
    }
    for (const name of statics) this.update(name, true);
    if (typeof value === 'string') {
      for (const name of value.trim().split(/\s+/)) this.update(name, true);
    } else if (Array.isArray(value) || value instanceof Set) {
      const listed: any = value;
      for (const name of listed) {
        if (typeof name !== 'string') throw new Error(`NgClass can only toggle CSS classes expressed as strings, got ${name}`);
        this.update(name, true);
      }
    } else if (value != null && typeof value === 'object') {
      for (const key of Object.keys(value)) this.update(key, !!value[key]);
    }
    const names: string[] = [];
    const enabled: boolean[] = [];
    for (let k = 0; k < this.names.length; k++) {
      if (this.changed[k]) this.toggle(this.names[k], this.enabled[k]);
      else if (!this.touched[k]) {
        if (this.enabled[k]) this.toggle(this.names[k], false);
        continue;
      }
      names.push(this.names[k]);
      enabled.push(this.enabled[k]);
    }
    this.names = names;
    this.enabled = enabled;
    this.changed = names.map(() => false);
    this.touched = names.map(() => false);
    for (let k = 0, t = 0; k + 1 < toggles.length; k += 2, t++) {
      const name = String(toggles[k]);
      const on = toggles[k + 1] === undefined ? statics.indexOf(name) >= 0 : !!toggles[k + 1];
      if (this.toggled[t] === on) continue;
      this.toggled[t] = on;
      this.toggle(name, on);
    }
  }

  private update(name: string, on: boolean): void {
    const at = this.names.indexOf(name);
    if (at < 0) {
      this.names.push(name);
      this.enabled.push(on);
      this.changed.push(true);
      this.touched.push(true);
      return;
    }
    if (this.enabled[at] !== on) {
      this.enabled[at] = on;
      this.changed[at] = true;
    }
    this.touched[at] = true;
  }

  private toggle(written: string, on: boolean): void {
    for (const name of written.trim().split(/\s+/)) {
      if (!name) continue;
      const classes = viewClasses(this.view);
      if (on === classes.has(name)) continue;
      if (on) classes.set(name, true);
      else classes.delete(name);
      this.view.className = Array.from(classes.keys()).join(' ');
    }
  }
}

/** One style NgStyle sets: its key as written (`'width.px'`), the style it names, and the value with the unit appended. */
export interface NgStyleEntry {
  key: string;
  name: string;
  value: any;
}

/** NgStyle's value (an object or a Map of styles) as the styles it sets; a null or undefined style value removes the style. */
export function ngStyleEntries(value: any): NgStyleEntry[] {
  const entries: NgStyleEntry[] = [];
  const add = (key: string, given: any) => {
    const parts = key.split('.');
    entries.push({ key, name: parts[0], value: given == null ? null : parts.length > 1 ? `${given}${parts[1]}` : given });
  };
  // Iterated untyped, and read so before `instanceof` narrows it: a Map of any key and value types.
  const pairs: any = value;
  if (value instanceof Map) {
    for (const pair of pairs) add(String(pair[0]), pair[1]);
  } else if (typeof value === 'object') {
    for (const key of Object.keys(value)) add(key, value[key]);
  } else throw new Error(`NgStyle takes an object or a Map of styles, got ${value}`);
  return entries;
}

/**
 * @angular/common's NgStyle on an element's view, set as @nativescript/angular's renderer sets a style: `view.style[name]`,
 * a CSS variable (`--x`) through the style's unscoped variables. A key no longer given is removed, a style is set
 * again only when its value changed, and a null or undefined value leaves the styles as they are.
 */
export class NgStyle {
  private readonly view: any = inject(ElementRef).nativeElement;
  private readonly unset: any;
  private applied: NgStyleEntry[] = [];

  /** `unset` is core's unsetValue, which the component passes: this module also runs under Node, where core doesn't load. */
  constructor(unset: any) {
    this.unset = unset;
  }

  /** `input` holds NgStyle's value, a new array on each read so that a value changed in place is applied again. */
  apply(input: any[]): void {
    const value: any = input[0];
    if (value == null) return;
    const entries = ngStyleEntries(value);
    for (const old of this.applied) if (!entries.some((e) => e.key === old.key)) this.set(old.name, null);
    for (const entry of entries) {
      const at = this.applied.findIndex((e) => e.key === entry.key);
      if (at < 0 || !Object.is(this.applied[at].value, entry.value)) this.set(entry.name, entry.value);
    }
    this.applied = entries;
  }

  private set(name: string, value: any): void {
    const style = this.view.style;
    if (name.startsWith('--')) {
      if (value == null) style.unscopedCssVariables.delete(name);
      else style.setUnscopedCssVariable(name, value);
      this.view._onCssStateChange();
    } else style[name] = value == null ? this.unset : value;
  }
}

/** A QueryList's `changes`: what `subscribe` of an Observable gives, without rxjs, which this module does not depend on. */
export class QueryListChanges {
  private nextId = 0;
  private observers: { id: number; fn: (list: QueryList) => void }[] = [];
  subscribe(observerOrNext?: ((list: QueryList) => void) | { next?: (list: QueryList) => void; error?: (e: any) => void; complete?: () => void } | null): { unsubscribe(): void } {
    const id = ++this.nextId;
    const fn: (list: QueryList) => void = typeof observerOrNext === 'function'
      ? observerOrNext
      : observerOrNext && typeof observerOrNext === 'object' && typeof observerOrNext.next === 'function'
        ? (list: QueryList) => observerOrNext.next!(list)
        : () => {};
    this.observers.push({ id, fn });
    return { unsubscribe: () => { this.observers = this.observers.filter((o) => o.id !== id); } };
  }
  next(list: QueryList): void {
    for (const o of this.observers.slice()) o.fn(list);
  }
}

/**
 * @angular/core's QueryList as a compiled template fills it (`@ViewChildren`): the matches in the order their views
 * were made, and `changes`, after a change to them following the first results, once per task. Its items are read
 * untyped: the type its field declares is the app's claim.
 */
export class QueryList {
  private keys: unknown[] = [];
  private items: any[] = [];
  private settled = false;
  private scheduled = false;
  readonly changes = new QueryListChanges();

  get length(): number { return this.items.length; }
  get first(): any { return this.items[0]; }
  get last(): any { return this.items[this.items.length - 1]; }
  get dirty(): boolean { return this.scheduled; }

  toArray(): any[] { return this.items.slice(); }
  get(index: number): any { return this.items[index]; }
  forEach(fn: (item: any, index: number) => void): void { this.items.forEach((item, index) => fn(item, index)); }
  map(fn: (item: any, index: number) => any): any[] { return this.items.map((item, index) => fn(item, index)); }
  filter(fn: (item: any, index: number) => boolean): any[] { return this.items.filter((item, index) => fn(item, index)); }
  find(fn: (item: any, index: number) => boolean): any { return this.items.find((item, index) => fn(item, index)); }
  some(fn: (item: any, index: number) => boolean): boolean { return this.items.some((item, index) => fn(item, index)); }
  toString(): string { return this.items.toString(); }
  notifyOnChanges(): void { this.changes.next(this); }

  /** A match the template made: `key` is its view, which `$remove` names when the view goes. */
  $add(key: unknown, value: any): void {
    this.keys.push(key);
    this.items.push(value);
    this.update();
  }

  $remove(key: unknown): void {
    const at = this.keys.indexOf(key);
    if (at < 0) return;
    this.keys.splice(at, 1);
    this.items.splice(at, 1);
    this.update();
  }

  private update(): void {
    if (this.scheduled) return;
    this.scheduled = true;
    queueMicrotask(() => {
      this.scheduled = false;
      if (this.settled) this.changes.next(this);
      this.settled = true;
    });
  }
}

/** The view a directive is being made on (its ElementRef), for the forms runtime, which a compiled template gives it. */
export function hostView(): any {
  return inject(ElementRef).nativeElement;
}

/** The markForCheck of the view a directive is being made in, for the forms runtime, which a compiled template gives it. */
export function viewChecker(): () => void {
  const cd = inject(ChangeDetectorRef);
  return () => cd.markForCheck();
}
