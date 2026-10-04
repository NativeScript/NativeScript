// Idioms of a real app's services: dictionary reads with fallbacks, local
// helpers with default parameters, Partial objects narrowed by a check.

interface Wall { year: number; month: number }
interface Event { start: Wall; tzid: string; title: string }

function parseRule(value: string) {
  const parts: Record<string, string> = {};
  for (const kv of value.split(';')) {
    const [k, v] = kv.split('=');
    parts[k] = v;
  }
  return { freq: parts['FREQ'] ?? 'WEEKLY', interval: +(parts['INTERVAL'] ?? 1), wkst: parts.WKST ?? 'MO' };
}
console.log(JSON.stringify(parseRule('FREQ=DAILY')));
console.log(JSON.stringify(parseRule('INTERVAL=3;WKST=SU')));

function key(w: Wall): string {
  const p = (n: number, len = 2) => String(n).padStart(len, '0');
  return `${w.year}${p(w.month + 1)}${p(w.month, 4)}`;
}
console.log(key({ year: 2026, month: 3 }));

let cur: Partial<Event> & { seen: number } | null = null;
for (const line of ['BEGIN', 'START', 'END', 'BEGIN', 'END']) {
  if (line === 'BEGIN') cur = { seen: 0, tzid: 'UTC' };
  if (line === 'START' && cur) cur.start = { year: 2026, month: 9 };
  if (line === 'END') {
    if (cur?.start) console.log('event', key(cur.start), cur.tzid);
    else console.log('no start');
  }
}

class Doc { title = 'Doc' }
class Viewer {
  doc!: Doc;
  heading(): string { return this.doc?.title || ''; }
}
const v = new Viewer();
console.log(JSON.stringify(v.heading()));
v.doc = new Doc();
console.log(v.heading());

async function stream(text: string) {
  const chunks = text.match(/\S+\s*/g) ?? [];
  let acc = '';
  for (const chunk of chunks) {
    acc += chunk;
    await Promise.resolve();
  }
  return acc;
}
stream('one two  three').then((s) => console.log(JSON.stringify(s)));
