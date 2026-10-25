// A pattern typed by RegExp's protocol methods that an assertion from untyped gives, alone or as a `? :` branch: its
// value may be anything, which JavaScript matches as a RegExp or by its string.
type Replacer = { [Symbol.replace](string: string, replaceValue: string): string };
type Splitter = { [Symbol.split](string: string, limit?: number): string[] };
type Matcher = { [Symbol.match](string: string): RegExpMatchArray | null };
type Searcher = { [Symbol.search](string: string): number };
const s = 'a-b-c undefined';
const never = s.length > 99;
const values: any[] = [/-/g, '-', undefined, null, 42];
for (const v of values) {
  console.log(String(v), s.replace(v as any as Replacer, '+'), s.replace(never ? /x/ : (v as any as Replacer), '[$&]'));
  console.log(s.split(v as any as Splitter), s.match(v as any as Matcher)?.[0], s.search(never ? /x/ : (v as any as Searcher)));
}
