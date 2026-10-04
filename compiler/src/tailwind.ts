// The CSS pass @nativescript/tailwind adds to an app's build: when the app
// depends on it, @nativescript/webpack autoloads its PostCSS plugin, which
// drops every declaration outside its list of supported properties (among
// them `vertical-alignment`, `horizontal-alignment` and `tint-color`).
// The native build must style the app with the CSS its NativeScript build ships.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** True when the app's NativeScript build runs the @nativescript/tailwind PostCSS plugin. */
export function usesNativeScriptTailwind(app: string): boolean {
  const pkg = JSON.parse(readFileSync(join(app, 'package.json'), 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (!deps['@nativescript/tailwind']) return false;
  const config = ['nativescript.config.ts', 'nativescript.config.js'].map((f) => join(app, f)).find(existsSync);
  return !(config && /tailwind\s*:\s*\{[^}]*autoload\s*:\s*false/.test(readFileSync(config, 'utf8')));
}

/** `removeUnsupported` from @nativescript/tailwind 2.1, for the plain CSS the compiler reads. */
export function nativescriptTailwind(css: string): string {
  const out: string[] = [];
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf('{', i);
    if (open < 0) break;
    const prelude = text.slice(i, open).trim();
    const close = matchingBrace(text, open);
    const body = text.slice(open + 1, close);
    i = close + 1;
    if (prelude.startsWith('@media')) continue;
    if (prelude.startsWith('@')) {
      out.push(`${prelude} {${body}}`);
      continue;
    }
    if (UNSUPPORTED_PSEUDO.some((p) => prelude.includes(p))) continue;
    const declarations = body
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => {
        const colon = d.indexOf(':');
        return { prop: d.slice(0, colon).trim().toLowerCase(), value: d.slice(colon + 1).trim() };
      })
      .map(({ prop, value }) => {
        if (prop === 'visibility' && value === 'hidden') value = 'collapse';
        if (prop === 'vertical-align' && value === 'middle') value = 'center';
        if (value.includes('rem') || value.includes('em')) value = value.replace(/\d?\.?\d+\s*r?em/g, (m) => String(parseFloat(m) * 16));
        return { prop, value };
      })
      .filter(({ prop, value }) => prop.startsWith('--') ? !DROPPED_VARIABLES.some((v) => prop.startsWith(`--${v}`)) : isSupported(prop, value));
    if (declarations.length) out.push(`${prelude} { ${declarations.map((d) => `${d.prop}: ${d.value};`).join(' ')} }`);
  }
  return out.join('\n') + '\n';
}

function matchingBrace(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) return i;
  }
  return text.length;
}

function isSupported(prop: string, value: string): boolean {
  const rule = SUPPORTED[prop];
  if (!rule) return false;
  if (UNSUPPORTED_VALUES.some((unit) => value.endsWith(unit))) return false;
  return rule === true || rule.includes(value);
}

const UNSUPPORTED_PSEUDO = [':focus-within', ':hover'];
const UNSUPPORTED_VALUES = ['max-content', 'min-content', 'vh', 'vw'];
const DROPPED_VARIABLES = ['tw-ring', 'tw-shadow', 'tw-ordinal', 'tw-slashed-zero', 'tw-numeric'];

const SUPPORTED: Record<string, true | string[]> = {
  'align-content': true, 'align-items': true, 'align-self': true, 'android-selected-tab-highlight-color': true,
  'android-elevation': true, 'android-dynamic-elevation-offset': true, animation: true, 'animation-delay': true,
  'animation-direction': true, 'animation-duration': true, 'animation-fill-mode': true, 'animation-iteration-count': true,
  'animation-name': true, 'animation-timing-function': true, background: true, 'background-color': true,
  'background-image': true, 'background-position': true, 'background-repeat': ['repeat', 'repeat-x', 'repeat-y', 'no-repeat'],
  'background-size': true, 'border-bottom-color': true, 'border-bottom-left-radius': true, 'border-bottom-right-radius': true,
  'border-bottom-width': true, 'border-color': true, 'border-left-color': true, 'border-left-width': true, 'border-radius': true,
  'border-right-color': true, 'border-right-width': true, 'border-top-color': true, 'border-top-left-radius': true,
  'border-top-right-radius': true, 'border-top-width': true, 'border-width': true, 'box-shadow': true, 'clip-path': true,
  color: true, flex: true, 'flex-grow': true, 'flex-direction': true, 'flex-shrink': true, 'flex-wrap': true, font: true,
  'font-family': true, 'font-size': true, 'font-style': ['italic', 'normal'], 'font-weight': true, height: true,
  'highlight-color': true, 'horizontal-align': ['left', 'center', 'right', 'stretch'], 'justify-content': true,
  'justify-items': true, 'justify-self': true, 'letter-spacing': true, 'line-height': true, margin: true, 'margin-bottom': true,
  'margin-left': true, 'margin-right': true, 'margin-top': true, 'min-height': true, 'min-width': true,
  'off-background-color': true, opacity: true, order: true, padding: true, 'padding-bottom': true, 'padding-left': true,
  'padding-right': true, 'padding-top': true, 'place-content': true, 'placeholder-color': true, 'place-items': true,
  'place-self': true, 'selected-tab-text-color': true, 'tab-background-color': true, 'tab-text-color': true,
  'tab-text-font-size': true, 'text-align': ['left', 'center', 'right'], 'text-decoration': ['none', 'line-through', 'underline'],
  'text-shadow': true, 'text-transform': ['none', 'capitalize', 'uppercase', 'lowercase'], transform: true,
  'vertical-align': ['top', 'center', 'bottom', 'stretch'], visibility: ['visible', 'collapse'], width: true, 'z-index': true,
};
