// A string that may be undefined, joined: undefined and null convert as JavaScript writes them.
let s = undefined as string | undefined;
s += 'y';
console.log(s);
let t = undefined as string | undefined;
t = t + 'y';
console.log(t, 'x' + (undefined as string | undefined), `<${undefined as string | undefined}>`);
let n = null as string | null;
n += '!';
console.log(n, `${null as string | null}`, (null as string | null) + '?');
function label(name?: string) {
  let out = name;
  out += ':';
  return `${out}[${name}]`;
}
console.log(label(), label('a'));
