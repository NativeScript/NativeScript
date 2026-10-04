// The app's CSS as its NativeScript build ships it: the app's own PostCSS
// chain, run by its own bundler's loaders (css-worker.ts), parsed by rework-css
// into the AST core reads. Core keeps only rulesets, @media and @keyframes
// from that AST (style-scope's _populateRules); the kit gets those, as CSS text.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export type CssNode =
  | { type: 'rule'; selectors: string[]; declarations: CssDeclaration[] }
  | { type: 'media'; media: string; rules: CssNode[] }
  | { type: 'keyframes'; name: string; vendor?: string; keyframes: { type: string; values?: string[]; declarations?: CssDeclaration[] }[] }
  | { type: string; [key: string]: unknown };
type CssDeclaration = { type: string; property?: string; value?: string };
export type Stylesheet = { file: string; css: string; ast: { type: 'stylesheet'; stylesheet: { rules: CssNode[] } } };

/** The NativeScript CLI's library, which the bundlers read nativescript.config.ts through. */
function cliLibrary(app: string): string {
  const local = join(app, 'node_modules', 'nativescript', 'lib', 'nativescript-cli-lib.js');
  if (existsSync(local)) return local;
  for (const dir of (process.env.PATH ?? '').split(delimiter)) {
    const ns = join(dir, 'ns');
    if (!existsSync(ns)) continue;
    const lib = join(dirname(realpathSync(ns)), '..', 'lib', 'nativescript-cli-lib.js');
    if (existsSync(lib)) return lib;
  }
  throw new Error('the NativeScript CLI (ns) is needed: its library reads nativescript.config.ts for the app\'s bundler');
}

/**
 * Each stylesheet the app's build applies, in the order core adds them:
 * app.css (or its platform or Sass variant), then `imported` (stylesheets
 * modules import, in evaluation order).
 */
export function appStylesheets(app: string, platform: 'ios' | 'android', imported: string[] = []): Stylesheet[] {
  const dir = mkdtempSync(join(tmpdir(), 'ns-native-css-'));
  const out = join(dir, 'sheets.json');
  const worker = join(dirname(fileURLToPath(import.meta.url)), 'css-worker.ts');
  try {
    execFileSync(process.execPath, [worker, out, cliLibrary(app), platform, ...imported.map((f) => resolve(f))], { cwd: resolve(app), stdio: ['ignore', 'ignore', 'inherit'] });
    return JSON.parse(readFileSync(out, 'utf8'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * The stylesheets the app's modules import (`import './theme.css'`), in the
 * order they evaluate from `entry`: a module's imports in source order, each
 * module's own before the module.
 */
export function importedStylesheets(entry: string, appDir: string): string[] {
  const sheets: string[] = [];
  const visited = new Set<string>();
  const resolveModule = (from: string, spec: string) => {
    const base = spec.startsWith('~/') || spec.startsWith('@/') ? join(appDir, spec.slice(2)) : spec.startsWith('.') ? join(dirname(from), spec) : null;
    if (!base) return null;
    return ['', '.ts', '.tsx', '.js', '.vue', '.svelte', '/index.ts', '/index.js'].map((ext) => base + ext).find((f) => existsSync(f) && statSync(f).isFile()) ?? null;
  };
  const walk = (file: string) => {
    visited.add(file);
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/^\s*import\s+(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/gm)) {
      const target = resolveModule(file, m[1]);
      if (!target) continue;
      if (/\.s?css$/.test(target)) { if (!sheets.includes(target)) sheets.push(target); }
      else if (!visited.has(target)) walk(target);
    }
  };
  walk(entry);
  return sheets;
}

/** The rulesets, @media and @keyframes core populates from the sheets' ASTs, as CSS text the kit parses. */
export function kitCss(sheets: Stylesheet[]): string {
  const lines: string[] = [];
  const declarations = (list: CssDeclaration[] = []) =>
    list.filter((d) => d.type === 'declaration').map((d) => `${d.property}: ${d.value};`).join(' ');
  const emit = (nodes: CssNode[], indent: string) => {
    for (const node of nodes) {
      if (node.type === 'rule') {
        const rule = node as Extract<CssNode, { type: 'rule' }>;
        lines.push(`${indent}${rule.selectors.join(', ')} { ${declarations(rule.declarations)} }`);
      } else if (node.type === 'media') {
        const media = node as Extract<CssNode, { type: 'media' }>;
        lines.push(`${indent}@media ${media.media} {`);
        emit(media.rules, indent + '  ');
        lines.push(`${indent}}`);
      } else if (node.type === 'keyframes') {
        const keyframes = node as Extract<CssNode, { type: 'keyframes' }>;
        const frames = keyframes.keyframes.filter((k) => k.type === 'keyframe').map((k) => `${k.values!.join(', ')} { ${declarations(k.declarations)} }`);
        lines.push(`${indent}@keyframes ${keyframes.name} { ${frames.join(' ')} }`);
      } else if (node.type === 'import') {
        throw new Error(`@import ${(node as { import?: string }).import}: the build leaves it for core to load at run time`);
      }
    }
  };
  for (const sheet of sheets) emit(sheet.ast.stylesheet.rules, '');
  return lines.join('\n') + '\n';
}
