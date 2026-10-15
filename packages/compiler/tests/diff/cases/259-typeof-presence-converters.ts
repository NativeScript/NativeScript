// typeof of a typed optional is a presence test, negated and combined too; untyped values read as optional types.
class Flags {
  enabled?: boolean;
  count?: number;
  label?: string;
  onDone?: () => void;
}
function describe(f: Flags): string {
  const parts: string[] = [];
  parts.push(typeof f.enabled === 'boolean' ? 'enabled:' + f.enabled : 'enabled:unset');
  parts.push(typeof f.count !== 'undefined' ? 'count:' + f.count : 'count:unset');
  parts.push(!(typeof f.label === 'string') ? 'label:unset' : 'label:' + f.label);
  parts.push(typeof f.onDone === 'function' ? 'done:set' : 'done:unset');
  parts.push(typeof f.enabled === 'undefined' && typeof f.count === 'number' ? 'only-count' : 'mixed');
  return parts.join(' ');
}
const a = new Flags();
console.log(describe(a));
a.enabled = false;
a.count = 0;
a.label = '';
a.onDone = () => {};
console.log(describe(a));

const raw: any = JSON.parse('{"text":"hi","n":3,"list":[1,2],"map":{"a":"x"},"none":null}');
const text: string | undefined = raw.text;
const n: number | undefined = raw.n;
const list: number[] | undefined = raw.list;
const map: Record<string, string> | undefined = raw.map;
const none: string[] | undefined = raw.none;
const missing: Date | undefined = raw.missing;
console.log(text, n, list?.join('+'), map?.a, none === null || none === undefined, missing === undefined);
