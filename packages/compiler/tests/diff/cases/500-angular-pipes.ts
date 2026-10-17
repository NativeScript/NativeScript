// The @angular/common pipes a compiled Angular template uses: dates, numbers and percents in en-US, case, JSON,
// slices and key-value lists, and the errors Angular's pipes throw for what they cannot format.
import { DatePipe, DecimalPipe, JsonPipe, KeyValuePipe, LowerCasePipe, PercentPipe, SlicePipe, TitleCasePipe, UpperCasePipe, formatDate } from './helpers/angular.ts';

// A typed `string | null` result is nil natively, which prints as undefined: the case prints either as <none>.
const shown = (v: unknown) => (v == null ? '<none>' : v);
const date = new DatePipe();
const at = Date.UTC(2026, 9, 7, 14, 5, 9, 42);
for (const format of ['mediumDate', 'short', 'medium', 'long', 'full', 'shortTime', 'fullDate', 'EEE, MMM d', 'h:mm a', 'MMM d, y', 'MMM dd, yyyy', 'LLLL', 'MMM', 'dd', 'yyyy', 'yy', 'y G', 'GGGG', 'EEEEE EEEEEE', 'cccc ccc c', 'HH:mm:ss.SSS', 'hh a aaaaa', 'w ww W', "'at' h 'o''clock' ''", 'Z ZZZZ ZZZZZ O OOOO z zzzz', 'YYYY-ww']) {
  console.log(format, '→', date.transform(at, format, 'UTC'));
}
console.log(date.transform(at, 'h:mm a Z', '+0430'), '|', date.transform(at, 'HH:mm ZZZZZ', '-08:00'), '|', date.transform(at, 'HH:mm', 'PDT'));
console.log(date.transform(new Date(2024, 1, 29, 0, 30), 'EEEE, MMMM d, y h:mm a'));
console.log(date.transform('2026-03-04', 'MMM d, y'), '|', date.transform('2026-3', 'MMM d'), '|', date.transform('2026', 'y-MM-dd'));
console.log(date.transform('2026-10-07T14:05:09.5Z', 'HH:mm:ss.SSS', 'UTC'), '|', date.transform('20261007T140509+0200', 'HH:mm', 'UTC'), '|', date.transform('1700000000000', 'y', 'UTC'));
console.log(date.transform(new Date(Date.UTC(-44, 2, 15)), 'y yy G', 'UTC'), '|', date.transform(new Date(Date.UTC(5, 0, 1)), 'yyyy yy', 'UTC'));
console.log(shown(date.transform(null)), shown(date.transform(undefined)), shown(date.transform('')), shown(date.transform(NaN)));
for (const day of [new Date(2026, 0, 1), new Date(2026, 11, 31), new Date(2027, 0, 3), new Date(2020, 11, 31)]) console.log(formatDate(day, 'YYYY-ww W EEE', 'en-US'));
const tryThis = (what: string, f: () => unknown) => {
  try { console.log(what, f()); } catch (e) { console.log(what, 'throws', (e as Error).message); }
};
tryThis('not a date', () => date.transform('not a date'));
tryThis('flexible period', () => date.transform(at, 'B', 'UTC'));
tryThis('other locale', () => date.transform(at, 'short', 'UTC', 'fr'));

const number = new DecimalPipe();
for (const [value, digits] of [[1234.5, undefined], [1234.5, '1.2-2'], [0.5, '1.0-0'], [1.5, '1.0-0'], [2.5, '1.0-0'], [-0.4, '1.0-0'], [-1234567.891, undefined], [0.000123, '1.2-5'], [5, '3.1-1'], [1e21, undefined], [123456789012345678901234, undefined], [0.1 + 0.2, '1.0-20'], [999.9999, '1.0-2'], [Infinity, undefined], [-Infinity, undefined], ['42.10', '1.1-1'], [7, '.3'], [0, '1.2-2']] as [number | string, string | undefined][]) {
  console.log('number', value, digits, '→', number.transform(value, digits));
}
console.log(shown(number.transform(null)), shown(number.transform('')), shown(number.transform(NaN)));
tryThis('number of text', () => number.transform('ten'));
tryThis('bad digits', () => number.transform(1, 'x'));
tryThis('min over max', () => number.transform(1, '1.3-1'));
const percent = new PercentPipe();
for (const value of [0.256, 1, 0, -0.5, 12.3456, 0.0001]) console.log('percent', value, percent.transform(value), percent.transform(value, '1.1-2'));

console.log(new UpperCasePipe().transform('MiXed ünïcode'), new LowerCasePipe().transform('MiXed ÜNÏCODE'), shown(new UpperCasePipe().transform(null)));
console.log(new TitleCasePipe().transform('the quick-brown fox  jumps\tOVER éclairs 3rd'));
tryThis('upper of a number', () => new UpperCasePipe().transform(3 as any));
console.log(new JsonPipe().transform({ a: [1, 'two', null], b: { c: true } }));
console.log(new JsonPipe().transform(undefined), new JsonPipe().transform('text'));
const slice = new SlicePipe();
console.log(slice.transform('abcdef', 1, 3), slice.transform([1, 2, 3, 4], -2), shown(slice.transform(null, 0)));
tryThis('slice of a number', () => slice.transform(5, 0));

const kv = new KeyValuePipe();
const settings: Record<string, number> = { b: 2, a: 1, c: 3 };
const first = kv.transform(settings);
console.log(JSON.stringify(first));
console.log('same while unchanged', kv.transform({ b: 2, a: 1, c: 3 }) === first);
settings['a'] = 10;
const second = kv.transform(settings);
console.log('new when a value changes', second !== first, JSON.stringify(second));
console.log('map, by number', JSON.stringify(new KeyValuePipe().transform(new Map<any, string>([[3, 'c'], [1, 'a'], [2, 'b']]))));
console.log('mixed keys', JSON.stringify(new KeyValuePipe().transform(new Map<any, string>([['b', 'x'], [true, 'y'], [2, 'z'], [null, 'n']]))));
console.log('descending', JSON.stringify(new KeyValuePipe().transform({ x: 1, y: 2 }, (p, q) => (p.key < q.key ? 1 : -1))));
console.log('none', shown(kv.transform(null)), shown(kv.transform(5)));
