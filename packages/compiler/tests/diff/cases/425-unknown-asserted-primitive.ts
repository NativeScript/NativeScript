// A value of type unknown asserted to a string, number or boolean (nstreamdown's `(token.metadata?.['isIncomplete'] as boolean) || false`):
// the assertion lets undefined through, so `||`, `??`, a test or a variable sees it missing.
import { parse, Renderer, Token } from './helpers/tokens.ts';

const r = new Renderer();
for (const t of parse('```ts\n# Title\n!pic.png\nplain')) {
  console.log(t.type, r.getIsIncomplete(t), JSON.stringify(r.getLanguage(t)), JSON.stringify(r.getUrl(t)), r.getNumber(t), r.children(t).length, r.getHeadingLevel(t));
}
function linkOf(token: Token): string {
  const url = token.metadata?.['url'] as string;
  if (url) return 'link ' + url;
  return url === undefined ? 'no link' : 'empty link';
}
const untyped: any = { flag: true, count: 3 };
console.log(linkOf(parse('!a.png')[0]), linkOf(parse('plain')[0]), (untyped.flag as boolean) && 'on', (untyped.missing as boolean) && 'on', (untyped.count as number) ?? -1, (untyped.none as number) ?? -1);
