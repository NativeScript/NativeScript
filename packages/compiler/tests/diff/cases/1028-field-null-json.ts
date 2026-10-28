// A field that holds null at one time and a missing value at another (a record's entry never set, an element past the
// end) holds each as it is, though its type says only null: JSON keeps the null and leaves the undefined out, and
// `=== null` / `=== undefined`, string conversion, `??` and console tell them apart. A class's field, an interface's
// field given by a literal, a field written later and a conditional giving null or the missing value alike.
const COLORS: Record<string, string> = { cpc: 'red' };
const NAMES = ['a', 'b'];

class Meeting {
  color: string | null = 'blue';
  name: string = NAMES[0];
  tint: string | null = NAMES.length > 5 ? null : COLORS['none'];
  clear(): void {
    this.color = null;
  }
  pick(k: string): void {
    this.color = COLORS[k];
  }
  choose(k: string, i: number): void {
    this.color = k === 'none' ? null : COLORS[k];
    this.name = NAMES[i];
    this.tint = i < 0 ? null : NAMES[i];
  }
}

const m = new Meeting();
console.log(JSON.stringify(m), m.tint === undefined);
m.clear();
console.log(JSON.stringify(m), m.color === null, m.color === undefined, String(m.color));
m.pick('tsc');
console.log(JSON.stringify(m), m.color === null, m.color === undefined, `${m.color}`);
m.pick('cpc');
console.log(JSON.stringify(m), m.color === null, m.color === undefined);
m.choose('none', -1);
console.log(JSON.stringify(m), m.color === null, m.tint === null, m.name === undefined);
m.choose('tsc', 5);
console.log(JSON.stringify(m), m.color === undefined, m.tint === undefined, m.color ?? 'none', Object.keys(m).join());
console.log(m);

interface Look {
  color: string | null;
  name: string;
}
function look(k: string, i: number): Look {
  return { color: i < 0 ? null : COLORS[k], name: NAMES[i] };
}
const a = look('cpc', -1), b = look('tsc', 9), c = look('cpc', 1);
console.log(JSON.stringify(a), JSON.stringify(b), JSON.stringify(c));
console.log(a.color === null, a.color === undefined, b.color === null, b.color === undefined, String(a.color), String(b.color));
a.color = COLORS['zz'];
b.color = null;
console.log(JSON.stringify(a), JSON.stringify(b), a.color === undefined, b.color === null);
