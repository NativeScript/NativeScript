// Properties an app sets that @nativescript/core declares and the kit does
// not apply: in templates, and in the app's CSS. A template sets every
// attribute by name (`view.set(name, value)`) and CSS reaches a view the same
// way, so a name the kit neither handles in a setProperty nor reads back is
// stored and does nothing on screen. (Imperative code is checked as it is
// translated: core.ts.)
//
// Core's properties are what its declarations mark `@nsProperty` (on the
// view's class or a base) and the CSS properties its modules register; a
// kit-implemented plugin's are its class's writable fields. Properties for
// another platform (`android…` on iOS) apply nowhere on this one.
import ts from 'typescript';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import type { ComponentIR, TNode } from './ir.ts';
import type { CssNode, Stylesheet } from './css.ts';
import { kitExtends, type KitType } from './kit-index.ts';
import { KIT_PLUGINS } from './core.ts';
import { LIST_BINDINGS, TEMPLATE_HOSTS } from './codegen.ts';

export interface Unapplied {
  file: string;
  line: number | null;
  /** The view class, or for CSS the rule's selector. */
  view: string;
  property: string;
  css?: boolean;
  /** CSS: the style properties core and the kit set from the declaration, where they differ. */
  names?: { core: string; kit: string };
}

export interface Kit {
  index: Map<string, KitType>;
  /** The kit's sources, where its CSS name mapping (`propertyName(css:)`) is. */
  sources: string;
  name: string;
  platform: 'ios' | 'android';
}

export function describe(u: Unapplied, kit: string): string {
  const at = `${u.file}${u.line ? `:${u.line}` : ''}`;
  if (u.names) return `${at}: ${u.view} { ${u.property} }: core sets ${u.names.core} from it, ${kit} sets ${u.names.kit}`;
  return `${at}: ${u.css ? `${u.view} { ${u.property} }` : `${u.view}.${u.property}`}: core declares it, ${kit} does not apply it`;
}

export class PropertyGuard {
  private classes = new Map<string, ts.Symbol>();
  private declared = new Map<ts.Symbol, Set<string>>();
  private style = new Set<string>();
  /** Names some kit view applies: what a style property needs, since it reaches every view. */
  private anyView = new Set<string>();
  private kit: Kit;
  private checker: ts.TypeChecker;
  private coreDir: string | null = null;

  /** Classes and CSS names of the modules compiled from core into the kit (`Core/`): core's own, which apply what core declares. */
  private compiled = { classes: new Set<string>(), css: new Set<string>() };

  constructor(checker: ts.TypeChecker, program: ts.Program, kit: Kit) {
    this.kit = kit;
    this.checker = checker;
    const generated = join(kit.sources, 'Core');
    if (existsSync(generated)) {
      for (const f of readdirSync(generated)) {
        if (!f.endsWith('.swift')) continue;
        const text = readFileSync(join(generated, f), 'utf8');
        for (const m of text.matchAll(/^(?:open|public)(?: final)? class (\w+)/gm)) this.compiled.classes.add(m[1]);
        for (const m of text.matchAll(/\("cssName", "([\w-]+)"\)|\["cssName"\] = "([\w-]+)"/g)) this.compiled.css.add(m[1] ?? m[2]);
      }
    }
    const entries = program.getSourceFiles()
      .map((sf) => ({ sf, pkg: /[\\/]node_modules[\\/]((?:@[^\\/]+[\\/])?[^\\/]+)[\\/]index\.d\.ts$/.exec(sf.fileName)?.[1].replace(/\\/g, '/') }))
      .filter((e) => e.pkg === '@nativescript/core' || KIT_PLUGINS.includes(e.pkg!))
      // Core's classes first: a plugin's export of the same name is core's.
      .sort((a, b) => Number(b.pkg === '@nativescript/core') - Number(a.pkg === '@nativescript/core'));
    for (const { sf, pkg } of entries) {
      if (pkg === '@nativescript/core') this.coreDir = dirname(sf.fileName);
      const module = checker.getSymbolAtLocation(sf);
      if (!module) continue;
      for (let s of checker.getExportsOfModule(module)) {
        if (s.flags & ts.SymbolFlags.Alias) s = checker.getAliasedSymbol(s);
        if (s.flags & ts.SymbolFlags.Class && !this.classes.has(s.name)) this.classes.set(s.name, s);
      }
    }
    const style = this.classes.get('Style');
    if (style) for (const p of checker.getPropertiesOfType(checker.getDeclaredTypeOfSymbol(style))) if (isField(p)) this.style.add(p.name);
    for (const t of kit.index.values()) if (kitExtends(kit.index, t.name, 'View')) for (const n of t.props) this.anyView.add(n);
  }

  /** Every element attribute of the components' templates the kit would not apply. */
  templates(components: ComponentIR[], props: Map<string, string[]>, sourceOf: (c: ComponentIR) => string | null): Unapplied[] {
    const out: Unapplied[] = [];
    const byName = new Map(components.map((c) => [c.name, c]));
    const rootTag = (name: string, seen = new Set<string>()): string | null => {
      const c = byName.get(name);
      if (!c || seen.has(name) || c.template.length !== 1) return null;
      const root = c.template[0];
      seen.add(name);
      return root.kind === 'element' ? root.tag : root.kind === 'component' ? rootTag(root.name, seen) : null;
    };
    for (const c of components) {
      const file = sourceOf(c);
      const texts = file ? templateFiles(file) : [];
      const check = (tag: string, name: string) => {
        if (this.applies(tag, name)) return;
        const at = locate(texts, tag, name);
        out.push({ file: at?.file ?? file ?? c.file, line: at?.line ?? null, view: tag, property: name });
      };
      const walk = (nodes: TNode[]) => {
        for (const n of nodes) {
          if (n.kind === 'element') {
            // An item-template host binds its items and selector itself.
            for (const a of n.attrs) if (!(TEMPLATE_HOSTS.has(n.tag) && LIST_BINDINGS.has(a.name))) check(n.tag, a.name);
            walk(n.children);
          } else if (n.kind === 'component') {
            // Attributes that are not the component's props fall through to its root view.
            const tag = rootTag(n.name);
            if (tag) for (const a of n.props) if (!props.get(n.name)?.includes(a.name)) check(tag, a.name);
          } else if (n.kind === 'if') for (const b of n.branches) walk(b.body);
          else walk(n.body);
        }
      };
      walk(c.template);
    }
    return dedupe(out);
  }

  /** Every declaration in the app's stylesheets of a CSS property core registers that the kit would not apply. */
  stylesheets(sheets: Stylesheet[]): Unapplied[] {
    const core = this.coreCss();
    const kitName = this.kitCssName();
    const out: Unapplied[] = [];
    for (const sheet of sheets) {
      const source = existsSync(sheet.file) ? readFileSync(sheet.file, 'utf8').split('\n') : [];
      const visit = (nodes: CssNode[]) => {
        for (const node of nodes) {
          if (node.type === 'media') visit((node as Extract<CssNode, { type: 'media' }>).rules);
          if (node.type !== 'rule') continue;
          const rule = node as Extract<CssNode, { type: 'rule' }>;
          for (const d of rule.declarations) {
            if (d.type !== 'declaration' || !d.property) continue;
            const css = d.property.toLowerCase();
            const name = core.get(css);
            if (!name || name.startsWith('_') || this.otherPlatform(name) || this.compiled.css.has(css)) continue;
            const read = kitName(css);
            if (read === name && this.anyView.has(name)) continue;
            out.push({ file: sheet.file, line: cssLine(source, rule.selectors[0], css), view: rule.selectors.join(', '), property: css, css: true, ...(read !== name ? { names: { core: name, kit: read } } : {}) });
          }
        }
      };
      visit(sheet.ast.stylesheet.rules);
    }
    return dedupe(out, (u) => `${u.file}:${u.line ?? u.view}:${u.property}`);
  }

  /** Whether setting `name` on a `tag` view does what core's does: true for anything core does not declare on it. */
  applies(tag: string, name: string): boolean {
    const cls = this.classes.get(tag);
    if (this.compiled.classes.has(tag)) return true;
    // A core view neither compiled into the kit nor implemented by it: nothing it is given applies.
    if (cls && this.compiled.classes.size && !this.kit.index.has(tag) && this.isView(cls)) return false;
    if (!cls || !this.kit.index.has(tag) || name.includes(':') || this.otherPlatform(name)) return true;
    if (!this.properties(cls).has(name)) return true;
    for (let t = this.kit.index.get(tag); t; t = t.base ? this.kit.index.get(t.base.replace(/\(.*$/, '')) : undefined) if (t.props.has(name)) return true;
    return this.style.has(name) && this.anyView.has(name);
  }

  private isView(cls: ts.Symbol): boolean {
    const type = this.checker.getDeclaredTypeOfSymbol(cls);
    return !!type.getProperty('nativeViewProtected') || !!type.getProperty('createNativeView');
  }

  /** Core's `@nsProperty` members of a class and its bases; a kit plugin's own writable fields. */
  private properties(cls: ts.Symbol): Set<string> {
    let found = this.declared.get(cls);
    if (found) return found;
    found = new Set();
    for (const p of this.checker.getPropertiesOfType(this.checker.getDeclaredTypeOfSymbol(cls))) {
      const decls = p.declarations ?? [];
      if (decls.some((d) => fromPackage(d, '@nativescript/core') && ts.getJSDocTags(d).some((t) => t.tagName.text === 'nsProperty'))) found.add(p.name);
      else if (isField(p) && !['ios', 'android'].includes(p.name) && decls.some((d) => KIT_PLUGINS.some((pkg) => fromPackage(d, pkg)))) found.add(p.name);
    }
    this.declared.set(cls, found);
    return found;
  }

  private otherPlatform(name: string): boolean {
    return /^vision[A-Z]/.test(name) || (this.kit.platform === 'ios' ? /^android[A-Z]/ : /^ios[A-Z]/).test(name);
  }

  /** CSS names core registers (`new CssProperty({ name, cssName })`), to the style property each sets. */
  private coreCss(): Map<string, string> {
    const names = new Map<string, string>();
    if (!this.coreDir) return names;
    const other = this.kit.platform === 'ios' ? '.android.js' : '.ios.js';
    const files = (readdirSync(this.coreDir, { recursive: true }) as string[]).filter((f) => f.endsWith('.js') && !f.endsWith(other) && !f.includes('node_modules'));
    for (const f of files) {
      const text = readFileSync(join(this.coreDir, f), 'utf8');
      if (!text.includes('cssName')) continue;
      for (const m of text.matchAll(/new\s+(?:\w*(?:CssProperty|ShorthandProperty|CssAnimationProperty)|\([\w\s?:]*\))\s*\(\s*\{([^}]*)/g)) {
        const name = /\bname:\s*['"](\w+)['"]/.exec(m[1])?.[1];
        const css = /\bcssName:\s*['"]([\w-]+)['"]/.exec(m[1])?.[1];
        if (name && css && !names.has(css)) names.set(css, name);
      }
    }
    return names;
  }

  /** The kit's `propertyName(css:)`: its named cases, else the name in camel case. */
  private kitCssName(): (css: string) => string {
    const cases = new Map<string, string>();
    for (const f of readdirSync(this.kit.sources, { recursive: true }) as string[]) {
      if (!/\.(swift|kt)$/.test(f)) continue;
      const text = readFileSync(join(this.kit.sources, f), 'utf8');
      const at = text.search(/\n(?:func|fun) propertyName\(css/);
      if (at < 0) continue;
      const body = text.slice(at, text.indexOf('\n}\n', at));
      for (const m of body.matchAll(/"([\w-]+)"\s*(?::\s*return|->)\s*"(\w+)"/g)) cases.set(m[1], m[2]);
    }
    return (css) => cases.get(css) ?? css.replace(/-(\w)/g, (_, c: string) => c.toUpperCase());
  }
}

function isField(p: ts.Symbol): boolean {
  if (!(p.flags & (ts.SymbolFlags.Property | ts.SymbolFlags.Accessor)) || p.name.startsWith('_')) return false;
  const d = p.declarations?.[0];
  if (!d) return false;
  if (ts.isGetAccessor(d)) return !!(p.flags & ts.SymbolFlags.SetAccessor);
  return !(ts.getCombinedModifierFlags(d) & (ts.ModifierFlags.Readonly | ts.ModifierFlags.Static | ts.ModifierFlags.Private | ts.ModifierFlags.Protected));
}

function fromPackage(d: ts.Declaration, pkg: string): boolean {
  return d.getSourceFile().fileName.replace(/\\/g, '/').includes(`/node_modules/${pkg}/`);
}

function dedupe(list: Unapplied[], key = (u: Unapplied) => `${u.file}:${u.line}:${u.view}.${u.property}`): Unapplied[] {
  const seen = new Set<string>();
  return list.filter((u) => !seen.has(key(u)) && !!seen.add(key(u)));
}

/** The line of `property` in the rule `selector` begins, else its first declaration anywhere (a rule the build generated). */
function cssLine(source: string[], selector: string, property: string): number | null {
  const declares = new RegExp(`(^|[\\s;{])${property.replace(/-/g, '\\-')}\\s*:`, 'i');
  const start = source.findIndex((l) => l.includes(selector));
  for (let i = Math.max(start, 0); start >= 0 && i < source.length; i++) {
    if (declares.test(i === start ? source[i].slice(source[i].indexOf(selector) + selector.length) : source[i])) return i + 1;
    if (source[i].includes('}')) break;
  }
  const any = source.findIndex((l) => declares.test(l));
  return any >= 0 ? any + 1 : null;
}

/** A component's source and the template it names (`templateUrl`), as text by file. */
function templateFiles(file: string): { file: string; lines: string[] }[] {
  if (!existsSync(file)) return [];
  const text = readFileSync(file, 'utf8');
  const out = [{ file, lines: text.split('\n') }];
  const url = /templateUrl:\s*['"]([^'"]+)['"]/.exec(text)?.[1];
  const html = url && resolve(dirname(file), url);
  if (html && existsSync(html)) out.unshift({ file: html, lines: readFileSync(html, 'utf8').split('\n') });
  return out;
}

const squash = (tag: string) => tag.replace(/-/g, '').toLowerCase();

/**
 * Where an attribute is written: in an opening tag of the view (`<TextField
 * returnKeyType=…`, `[text]=`, `:text=`, `text={…}`), else as a key of an
 * object literal (Angular's `*tabItem="{ title: … }"`), else anywhere as an attribute.
 */
function locate(texts: { file: string; lines: string[] }[], tag: string, name: string): { file: string; line: number } | null {
  const attr = new RegExp(`(?:^|[\\s\\[(:@])(?:bind:|v-bind:|attr\\.)?${name}\\]?\\s*=`);
  for (const { file, lines } of texts) {
    const text = lines.join('\n');
    for (const open of openingTags(text)) {
      if (squash(open.name) !== squash(tag)) continue;
      const m = attr.exec(text.slice(open.start, open.end));
      if (m) return { file, line: lineOf(text, open.start + m.index + m[0].indexOf(name)) };
    }
  }
  for (const pattern of [new RegExp(`[{,]\\s*${name}\\s*:`), attr]) {
    for (const { file, lines } of texts) {
      const i = lines.findIndex((l) => pattern.test(l));
      if (i >= 0) return { file, line: i + 1 };
    }
  }
  return null;
}

const lineOf = (text: string, offset: number) => text.slice(0, offset).split('\n').length;

/** Each opening tag's name and extent, quotes and braces skipped (`onTap={() => go()}`). */
function* openingTags(text: string): Generator<{ name: string; start: number; end: number }> {
  const re = /<([A-Za-z][\w.:-]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    let depth = 0, quote = '', i = m.index + m[0].length;
    for (; i < text.length; i++) {
      const ch = text[i];
      if (quote) { if (ch === quote) quote = ''; continue; }
      if (ch === '"' || ch === "'" || ch === '`') quote = ch;
      else if (ch === '{') depth++;
      else if (ch === '}') depth--;
      else if (ch === '>' && depth <= 0) break;
    }
    yield { name: m[1], start: m.index, end: i };
  }
}
