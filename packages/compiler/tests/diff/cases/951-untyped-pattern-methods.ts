// String methods given a pattern held untyped or typed `string | RegExp`: a RegExp matches as one, any other value as
// its string (undefined searches "undefined" in replace, splits nothing, and is the empty pattern of match and search).
const s = 'abcabc';
const values: any[] = [/b/g, /c/, 'b', undefined, null, 42];
for (const p of values) {
  const pattern: any = p;
  let all: string;
  try {
    all = s.replaceAll(pattern, 'x');
  } catch (e) {
    all = (e as Error).name;
  }
  console.log(String(p), s.replace(pattern, 'x'), s.replace(pattern, '[$&]'), all, s.split(pattern), s.match(pattern)?.[0], s.search(pattern));
}
const either = (k: number): string | RegExp => (k ? /c/g : 'a');
console.log(s.replace(either(0), 'x'), s.replace(either(1), 'x'), s.replaceAll(either(1), '-'), s.split(either(1)), s.search(either(1)));
