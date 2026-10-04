// Regular expressions and dates (in the machine's time zone, as both runs share it).
const text = 'Order #123 shipped 2024-03-05, order #45 pending, ORDER #6 lost';
const ids = /#(\d+)/g;
console.log(text.match(ids)?.join('|'), /order/i.test(text), text.search(/#\d/), ids.source, ids.flags);
const first = /#(\d+) (\w+)/.exec(text);
if (first) console.log(first[0], first[1], first[2], first.index);
console.log(text.replace(/#(\d+)/g, '[$1]'), text.replace(/order/gi, (m) => m.toUpperCase() + '!'));
console.log('a1b22c333'.split(/\d+/), 'a, b,c ,d'.split(/\s*,\s*/), 'one  two'.split(/(\s+)/));
const date = /(?<y>\d{4})-(?<m>\d{2})-(?<d>\d{2})/.exec(text);
console.log(date?.groups?.y, date?.groups?.m, date?.groups?.d);
for (const m of text.matchAll(/#(\d+)/g)) console.log('id', m[1], 'at', m.index);
const re = /o/g;
console.log(re.test('foo'), re.lastIndex, re.test('foo'), re.lastIndex, re.test('foo'), re.lastIndex);
console.log('x-y_z'.replace(/[-_]/g, ' '), 'aaa'.replace(/a/, 'b'), 'tel: 555-1234'.replace(/\D/g, ''));
let bad = 'none';
try {
  new RegExp('(unclosed');
} catch (e) {
  bad = (e as Error).name;
}
console.log(bad);

const d = new Date(2024, 0, 31, 13, 45, 30, 250);
console.log(d.getFullYear(), d.getMonth(), d.getDate(), d.getDay(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
d.setMonth(1);
console.log(d.getMonth(), d.getDate());
d.setDate(d.getDate() + 40);
console.log(d.toDateString(), d.getTime() === d.valueOf());
const utc = new Date(Date.UTC(2020, 1, 29, 12, 0, 0));
console.log(utc.toISOString(), utc.getUTCDate(), utc.toUTCString(), JSON.stringify({ when: utc }));
console.log(new Date('2021-06-15T08:30:00.000Z').getTime(), Date.parse('2021-06-15'), new Date(0).toISOString());
const span = new Date(2024, 2, 1).getTime() - new Date(2024, 1, 1).getTime();
console.log(span / 86400000, new Date(NaN).getTime(), String(new Date(NaN)));
console.log(new Date(2024, 0, 1) < new Date(2024, 0, 2), typeof Date.now());
