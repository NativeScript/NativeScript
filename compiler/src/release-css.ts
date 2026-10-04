import { readFileSync } from 'node:fs';

/**
 * The app's CSS as its NativeScript release build applies it: the stylesheet
 * the bundler compiled into `bundle.mjs` (a css2json syntax tree), written
 * back as CSS. The one place the native build takes CSS from a bundle.
 */
export function cssFromReleaseBundle(bundle: string): string {
  const js = readFileSync(bundle, 'utf8');
  const at = js.indexOf('{type:`stylesheet`');
  if (at < 0) throw new Error(`${bundle}: no compiled stylesheet in this bundle`);
  const tree = new Function(`return ${js.slice(at, literalEnd(js, at))}`)() as Sheet;
  return tree.stylesheet.rules.map(ruleText).filter(Boolean).join('\n') + '\n';
}

interface Declaration { type: string; property?: string; value?: string }
interface Rule { type: string; selectors?: string[]; declarations?: Declaration[]; rules?: Rule[]; media?: string; name?: string; keyframes?: Rule[]; values?: string[] }
interface Sheet { stylesheet: { rules: Rule[] } }

function ruleText(r: Rule): string {
  const body = (ds: Declaration[] = []) => ds.filter((d) => d.type === 'declaration').map((d) => `  ${d.property}: ${d.value};`).join('\n');
  switch (r.type) {
    case 'rule': return `${r.selectors!.join(', ')} {\n${body(r.declarations)}\n}`;
    case 'media': return `@media ${r.media} {\n${(r.rules ?? []).map(ruleText).join('\n')}\n}`;
    case 'keyframes': return `@keyframes ${r.name} {\n${(r.keyframes ?? []).map((k) => `${k.values!.join(', ')} {\n${body(k.declarations)}\n}`).join('\n')}\n}`;
    case 'comment': return '';
    default: throw new Error(`a compiled stylesheet's ${r.type} rule`);
  }
}

/** The end of the object literal starting at `start`: braces balanced outside template strings. */
function literalEnd(js: string, start: number): number {
  let depth = 0;
  for (let i = start; i < js.length; i++) {
    const ch = js[i];
    if (ch === '`') {
      for (i++; i < js.length && js[i] !== '`'; i++) if (js[i] === '\\') i++;
    } else if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return i + 1;
  }
  throw new Error('an unterminated stylesheet literal');
}
