// Many values through many en-US number and date formats, against ICU's
// rounding (half away from zero on the shortest decimal), grouping and zone names.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const values: number[] = [];
for (let i = 0; i < 60; i++) {
  const mag = Math.floor(rand() * 16) - 6;
  const v = (rand() - 0.3) * Math.pow(10, mag);
  values.push(i % 7 === 0 ? Math.round(v) : i % 5 === 0 ? Number(v.toFixed(3)) : v);
}
values.push(0.5, 1.5, 2.5, -0.5, 0.05, 0.005, 1e-7, 123456789012, 999999.9999, 99.95, 9.995, 0.95);
const formats: Intl.NumberFormatOptions[] = [
  {}, { maximumFractionDigits: 0 }, { maximumFractionDigits: 1 }, { minimumFractionDigits: 3 }, { maximumSignificantDigits: 2 }, { minimumSignificantDigits: 5 },
  { style: 'percent' }, { style: 'percent', maximumFractionDigits: 2 }, { style: 'currency', currency: 'USD' }, { style: 'currency', currency: 'JPY' },
  { notation: 'compact' }, { notation: 'compact', maximumFractionDigits: 2 }, { notation: 'compact', compactDisplay: 'long' }, { notation: 'scientific' }, { notation: 'engineering', maximumFractionDigits: 1 },
  { useGrouping: false, minimumIntegerDigits: 4 }, { signDisplay: 'exceptZero', maximumFractionDigits: 1 }, { signDisplay: 'never' },
];
for (const options of formats) {
  const f = new Intl.NumberFormat('en-US', options);
  console.log(JSON.stringify(options));
  console.log(values.map((v) => f.format(v)).join(' '));
}
const times: number[] = [];
for (let i = 0; i < 12; i++) times.push(Math.floor(rand() * 4e12) - 1e12);
const dateFormats: Intl.DateTimeFormatOptions[] = [
  {}, { dateStyle: 'full' }, { dateStyle: 'short', timeStyle: 'short' }, { timeStyle: 'medium', hour12: false }, { year: 'numeric', month: 'short' },
  { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }, { weekday: 'narrow', month: 'narrow', day: 'numeric' },
  { hour: 'numeric', minute: '2-digit', hourCycle: 'h11' }, { hour: 'numeric', hourCycle: 'h24' }, { era: 'short', year: 'numeric', month: 'long', day: 'numeric' },
];
for (const options of dateFormats) {
  const f = new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' });
  console.log(JSON.stringify(options), times.map((t) => f.format(t)).join(' | '));
}
for (const t of times) console.log(new Date(t).toLocaleString(), '|', new Date(t).toLocaleDateString('en-US', { dateStyle: 'medium' }), '|', new Date(t).toLocaleTimeString('en-US', { timeStyle: 'long' }));
