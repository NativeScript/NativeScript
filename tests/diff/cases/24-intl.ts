// Locale formatting as Node's ICU does it for en-US: numbers (grouping,
// fraction digits, percent, currency, compact, signs, rounding) and dates
// (styles, component options, 12- and 24-hour clocks, time zones).
const nums = [0, -0, 1, 12, 1234.5, 1234567.891, -98765.4321, 0.000123, 1e21, NaN, Infinity, -Infinity];
console.log(nums.map((n) => n.toLocaleString()).join(' | '));
console.log(nums.map((n) => n.toLocaleString('en-US')).join(' | '));
console.log((1.005).toLocaleString('en-US', { maximumFractionDigits: 2 }), (1.255).toLocaleString(undefined, { maximumFractionDigits: 2 }), (2.5).toLocaleString('en-US', { maximumFractionDigits: 0 }), (-2.5).toLocaleString('en-US', { maximumFractionDigits: 0 }));
console.log((42).toLocaleString('en-US', { minimumFractionDigits: 2 }), (3.14159).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 3 }), (7).toLocaleString('en-US', { minimumIntegerDigits: 3 }));
console.log((1234567.5).toLocaleString('en-US', { useGrouping: false }), (1234.5678).toLocaleString('en-US', { maximumSignificantDigits: 3 }), (0.00123456).toLocaleString('en-US', { minimumSignificantDigits: 2, maximumSignificantDigits: 4 }));

const formats: [string, Intl.NumberFormatOptions][] = [
  ['percent', { style: 'percent' }],
  ['percent 1', { style: 'percent', minimumFractionDigits: 1 }],
  ['usd', { style: 'currency', currency: 'USD' }],
  ['eur', { style: 'currency', currency: 'EUR' }],
  ['jpy', { style: 'currency', currency: 'JPY' }],
  ['gbp code', { style: 'currency', currency: 'GBP', currencyDisplay: 'code' }],
  ['usd name', { style: 'currency', currency: 'USD', currencyDisplay: 'name' }],
  ['usd accounting', { style: 'currency', currency: 'USD', currencySign: 'accounting' }],
  ['compact', { notation: 'compact' }],
  ['compact long', { notation: 'compact', compactDisplay: 'long' }],
  ['scientific', { notation: 'scientific' }],
  ['engineering', { notation: 'engineering' }],
  ['always', { signDisplay: 'always' }],
  ['exceptZero', { signDisplay: 'exceptZero' }],
  ['never', { signDisplay: 'never' }],
];
const samples = [0, 0.5, -1, 999.995, 1234.5, -45678.9, 1500000, 2.5e9];
for (const [label, options] of formats) {
  const f = new Intl.NumberFormat('en-US', options);
  console.log(label.padEnd(15), samples.map((n) => f.format(n)).join(' | '));
}
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
console.log(usd.resolvedOptions().minimumFractionDigits, usd.resolvedOptions().maximumFractionDigits, usd.resolvedOptions().locale, new Intl.NumberFormat().format(9876543.21));

const d = new Date(Date.UTC(2026, 9, 4, 15, 7, 9, 45));
const utc = { timeZone: 'UTC' } as const;
console.log(d.toLocaleString('en-US', utc), '|', d.toLocaleDateString('en-US', utc), '|', d.toLocaleTimeString('en-US', utc));
for (const style of ['full', 'long', 'medium', 'short'] as const) {
  console.log(style, '|', d.toLocaleDateString('en-US', { ...utc, dateStyle: style }), '|', d.toLocaleTimeString('en-US', { ...utc, timeStyle: style }), '|', d.toLocaleString('en-US', { ...utc, dateStyle: style, timeStyle: 'short' }));
}
const components: Intl.DateTimeFormatOptions[] = [
  { year: 'numeric', month: 'long', day: 'numeric' },
  { month: 'short', day: 'numeric' },
  { weekday: 'long' },
  { weekday: 'short', month: 'short', day: 'numeric' },
  { month: 'long' },
  { month: 'long', year: 'numeric' },
  { year: 'numeric', month: '2-digit', day: '2-digit' },
  { year: '2-digit', month: 'numeric', day: 'numeric' },
  { hour: '2-digit', minute: '2-digit' },
  { hour: 'numeric', minute: '2-digit', hour12: false },
  { hour: 'numeric', hour12: true },
  { hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' },
  { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' },
  { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' },
  { minute: '2-digit', second: '2-digit' },
  { year: 'numeric' },
  { day: 'numeric' },
  { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' },
  { dateStyle: 'medium', timeStyle: 'long' },
];
for (const options of components) console.log(JSON.stringify(options), '→', new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(d));
const midnight = new Date(Date.UTC(2026, 0, 1, 0, 0, 0));
const noon = new Date(Date.UTC(2026, 0, 1, 12, 30, 0));
console.log(midnight.toLocaleTimeString('en-US', utc), noon.toLocaleTimeString('en-US', utc), midnight.toLocaleTimeString('en-US', { ...utc, hour12: false }), noon.toLocaleTimeString('en-US', { ...utc, hourCycle: 'h11' }));
console.log(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' }).format(d), '|', new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', hour: 'numeric', minute: '2-digit' }).format(d));
const local = new Date(2026, 2, 8, 9, 5, 3);
console.log(local.toLocaleString(), '|', local.toLocaleDateString(), '|', local.toLocaleTimeString(), '|', local.toLocaleString('en-US', { weekday: 'short', hour: 'numeric' }));
console.log(new Date(NaN).toLocaleString(), new Intl.DateTimeFormat('en-US', utc).format(d), new Intl.DateTimeFormat('en-US', utc).resolvedOptions().timeZone);
