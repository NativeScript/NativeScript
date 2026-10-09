import ts from 'typescript';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';
import { packageOf, packageRootOf, readPackage, runtimeFile, runtimeRelativeJs } from './plugins/resolve.ts';

/**
 * The JavaScript modules a native release compiles from published npm
 * packages, as a bundler sees them: each file parsed, each `import`, `export
 * … from` and literal `require()` resolved, the ES modules' exports mapped to
 * the bindings that define them. Only the modules the app reaches are
 * compiled: a named import through a package's side-effect-free re-export
 * barrel (`date-fns`, `lodash-es`) reaches the one module defining the name.
 */
export interface JsModule {
  file: string;
  /** Swift name of the module's record; its ES bindings are `<name>_<binding>`. */
  name: string;
  kind: 'esm' | 'cjs' | 'json';
  sf: ts.SourceFile;
  /** `"use strict"` at the top of the file, or an ES module. */
  strict: boolean;
  /** Each specifier the module imports or requires → what it loads. */
  deps: Map<string, JsDep>;
  /** For an ES module: export name → what defines it. */
  exports: Map<string, JsExport> | null;
  /** `export * from` targets, in order. */
  stars: JsModule[];
  /** A module of only re-exports in a package with no side effects: importing a name through it reaches only the module defining it. */
  barrel: boolean;
}

export type JsDep = { module: JsModule } | { empty: true } | { error: string };

export type JsExport =
  | { kind: 'local'; module: JsModule; local: string }
  | { kind: 'cjs'; module: JsModule; key: string }
  | { kind: 'cjs-default'; module: JsModule }
  | { kind: 'namespace'; module: JsModule }
  | { kind: 'unresolved'; module: JsModule; name: string };

/** Node.js's own modules: a package that needs one where the browser field does not replace it gets an error where it loads it. */
const NODE_BUILTINS = new Set(['assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console', 'constants', 'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'fs/promises', 'http', 'http2', 'https', 'inspector', 'module', 'net', 'os', 'path', 'perf_hooks', 'process', 'punycode', 'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'sys', 'timers', 'tls', 'tty', 'url', 'util', 'v8', 'vm', 'worker_threads', 'zlib']);

export class JsGraph {
  private byFile = new Map<string, JsModule>();
  private needed = new Set<JsModule>();
  private wholeNeeded = new Set<JsModule>();
  private namesNeeded = new Map<JsModule, Set<string>>();
  readonly platform: 'ios' | 'android';
  readonly modulesDir: string;
  /** Warnings for the build to print (a dynamic `require`). */
  readonly warnings: string[] = [];

  constructor(platform: 'ios' | 'android', modulesDir: string) {
    this.platform = platform;
    this.modulesDir = modulesDir;
  }

  /** The module a file is, parsed once. */
  module(file: string): JsModule {
    const key = resolve(file);
    let m = this.byFile.get(key);
    if (m) return m;
    const text = readFileSync(key, 'utf8');
    const json = extname(key) === '.json';
    const sf = ts.createSourceFile(key, json ? `module.exports = ${text}` : text, ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS);
    const esm = !json && extname(key) !== '.cjs' && (extname(key) === '.mjs' || sf.statements.some((s) => ts.isImportDeclaration(s) || ts.isExportDeclaration(s) || ts.isExportAssignment(s) || hasExportModifier(s)) || usesImportMeta(sf));
    m = {
      file: key, name: `js${this.byFile.size}`, kind: json ? 'json' : esm ? 'esm' : 'cjs', sf, strict: esm || hasUseStrict(sf.statements),
      deps: new Map(), exports: null, stars: [], barrel: false,
    };
    this.byFile.set(key, m);
    for (const spec of specifiersOf(sf)) m.deps.set(spec.text, this.resolveSpecifier(spec.text, key, spec.kind));
    if (esm) this.mapExports(m);
    return m;
  }

  all(): JsModule[] { return [...this.byFile.values()]; }

  /** What `specifier`, imported (or required) from `from`, loads. */
  private resolveSpecifier(specifier: string, from: string, kind: 'import' | 'require'): JsDep {
    const where = relative(process.cwd(), from);
    if (specifier.startsWith('.') || specifier.startsWith('/')) {
      const file = runtimeRelativeJs(specifier, from, this.platform) ?? jsonFile(resolve(dirname(from), specifier));
      if (!file) return { error: `${where}: ${specifier} resolves to no file` };
      const mapped = browserMapped(from, file);
      return mapped === false ? { empty: true } : { module: this.module(mapped) };
    }
    const bare = specifier.replace(/^node:/, '');
    const replaced = browserReplacement(from, specifier);
    if (replaced === false) return { empty: true };
    if (typeof replaced === 'string') return this.resolveSpecifier(replaced, from, kind);
    if (NODE_BUILTINS.has(bare) || NODE_BUILTINS.has(bare.split('/')[0]) || specifier.startsWith('node:')) {
      return { error: `${where} loads the Node.js module '${specifier}', which a native release does not have` };
    }
    try {
      const found = runtimeFile(specifier, this.modulesDir, this.platform, kind, from);
      if (!found) return { error: `${where} loads '${specifier}', which is not installed` };
      return { module: this.module(found.file) };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }

  private mapExports(m: JsModule) {
    const out = new Map<string, JsExport>();
    const imports = new Map<string, { dep: JsDep; name: string }>();
    let onlyReexports = true;
    for (const st of m.sf.statements) {
      if (ts.isImportDeclaration(st)) {
        const dep = m.deps.get((st.moduleSpecifier as ts.StringLiteral).text)!;
        const clause = st.importClause;
        if (clause?.name) imports.set(clause.name.text, { dep, name: 'default' });
        if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) imports.set(clause.namedBindings.name.text, { dep, name: '*' });
        if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) for (const el of clause.namedBindings.elements) imports.set(el.name.text, { dep, name: (el.propertyName ?? el.name).text });
        continue;
      }
      if (ts.isExportDeclaration(st)) {
        if (st.moduleSpecifier) {
          const dep = m.deps.get((st.moduleSpecifier as ts.StringLiteral).text)!;
          if (!st.exportClause) { if ('module' in dep) m.stars.push(dep.module); continue; }
          if (ts.isNamespaceExport(st.exportClause)) { if ('module' in dep) out.set(st.exportClause.name.text, { kind: 'namespace', module: dep.module }); continue; }
          for (const el of st.exportClause.elements) out.set(el.name.text, this.importTarget(dep, (el.propertyName ?? el.name).text, m));
          continue;
        }
        if (st.exportClause && ts.isNamedExports(st.exportClause)) {
          for (const el of st.exportClause.elements) {
            const local = (el.propertyName ?? el.name).text;
            const imported = imports.get(local);
            if (!imported) onlyReexports = false;
            out.set(el.name.text, imported ? this.importTarget(imported.dep, imported.name, m) : { kind: 'local', module: m, local });
          }
        }
        continue;
      }
      onlyReexports = false;
      if (ts.isExportAssignment(st)) { out.set('default', { kind: 'local', module: m, local: '*default*' }); continue; }
      if (!hasExportModifier(st)) continue;
      const isDefault = (ts.getModifiers(st as ts.HasModifiers) ?? []).some((x) => x.kind === ts.SyntaxKind.DefaultKeyword);
      if (ts.isVariableStatement(st)) {
        for (const d of st.declarationList.declarations) for (const n of boundNames(d.name)) out.set(n, { kind: 'local', module: m, local: n });
      } else if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st))) {
        const local = st.name?.text ?? '*default*';
        out.set(isDefault ? 'default' : local, { kind: 'local', module: m, local });
      }
    }
    m.exports = out;
    m.barrel = onlyReexports && sideEffectFree(m.file);
  }

  private importTarget(dep: JsDep, name: string, from: JsModule): JsExport {
    if (!('module' in dep)) return { kind: 'unresolved', module: from, name };
    const target = dep.module;
    if (name === '*') return { kind: 'namespace', module: target };
    if (target.kind !== 'esm') return name === 'default' ? { kind: 'cjs-default', module: target } : { kind: 'cjs', module: target, key: name };
    return this.resolveExport(target, name) ?? { kind: 'unresolved', module: target, name };
  }

  /** The binding an ES module's export `name` is, through re-exports and `export *`. */
  resolveExport(m: JsModule, name: string, seen = new Set<JsModule>()): JsExport | null {
    if (m.kind !== 'esm') return name === 'default' ? { kind: 'cjs-default', module: m } : { kind: 'cjs', module: m, key: name };
    if (seen.has(m)) return null;
    seen.add(m);
    const direct = m.exports!.get(name);
    if (direct) {
      if (direct.kind === 'unresolved' && direct.module !== m && direct.module.kind === 'esm') return this.resolveExport(direct.module, direct.name, seen);
      return direct;
    }
    if (name === 'default') return null;
    for (const star of m.stars) {
      const found = this.resolveExport(star, name, seen);
      if (found) return found;
    }
    return null;
  }

  /** Every export name of an ES module, `export *` included (not `default` of those). */
  exportNames(m: JsModule, seen = new Set<JsModule>()): string[] {
    if (m.kind !== 'esm' || seen.has(m)) return [];
    seen.add(m);
    const names = new Set(m.exports!.keys());
    for (const star of m.stars) for (const n of this.exportNames(star, seen)) if (n !== 'default') names.add(n);
    return [...names];
  }

  // ---- Reachability

  /** The app (or a compiled module) reads export `name` of `m` (`'*'`: all of them, as a namespace does). */
  need(m: JsModule, name: string) {
    if (m.kind === 'esm' && m.barrel && name !== '*') {
      const target = this.resolveExport(m, name);
      if (target && target.kind !== 'unresolved') return this.needTarget(target);
    }
    this.needWhole(m);
  }

  private needTarget(t: JsExport) {
    if (t.kind === 'namespace') return this.need(t.module, '*');
    this.needWhole(t.module);
  }

  private needWhole(m: JsModule) {
    if (this.needed.has(m)) return;
    this.needed.add(m);
    if (m.kind === 'esm') {
      for (const st of m.sf.statements) {
        if (ts.isImportDeclaration(st)) {
          const dep = m.deps.get((st.moduleSpecifier as ts.StringLiteral).text)!;
          if (!('module' in dep)) continue;
          const clause = st.importClause;
          const names: string[] = [];
          if (!clause) { this.needWhole(dep.module); continue; }
          if (clause.name) names.push('default');
          if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) names.push('*');
          if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) for (const el of clause.namedBindings.elements) names.push((el.propertyName ?? el.name).text);
          for (const n of names) this.need(dep.module, n);
        } else if (ts.isExportDeclaration(st) && st.moduleSpecifier) {
          const dep = m.deps.get((st.moduleSpecifier as ts.StringLiteral).text)!;
          if (!('module' in dep)) continue;
          if (!st.exportClause || ts.isNamespaceExport(st.exportClause)) this.need(dep.module, '*');
          else for (const el of st.exportClause.elements) this.need(dep.module, (el.propertyName ?? el.name).text);
        }
      }
    }
    // A require or dynamic import loads the whole module.
    for (const spec of specifiersOf(m.sf)) {
      if (spec.kind !== 'require' && !spec.dynamic) continue;
      const dep = m.deps.get(spec.text);
      if (dep && 'module' in dep) this.need(dep.module, '*');
    }
  }

  /** The modules to compile, in the order they were reached. */
  compiled(): JsModule[] { return [...this.needed]; }

  isNeeded(m: JsModule): boolean { return this.needed.has(m); }
}

function hasExportModifier(s: ts.Statement): boolean {
  return ts.canHaveModifiers(s) && (ts.getModifiers(s) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
}

function usesImportMeta(sf: ts.SourceFile): boolean {
  let found = false;
  const visit = (n: ts.Node) => {
    if (found) return;
    if (ts.isMetaProperty(n) && n.keywordToken === ts.SyntaxKind.ImportKeyword) { found = true; return; }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return found;
}

export function hasUseStrict(statements: readonly ts.Statement[]): boolean {
  for (const st of statements) {
    if (!ts.isExpressionStatement(st) || !ts.isStringLiteral(st.expression)) return false;
    if (st.expression.text === 'use strict') return true;
  }
  return false;
}

export function boundNames(name: ts.BindingName): string[] {
  if (ts.isIdentifier(name)) return [name.text];
  const out: string[] = [];
  for (const el of name.elements) if (!ts.isOmittedExpression(el)) out.push(...boundNames(el.name));
  return out;
}

/** The module specifiers a file loads statically: imports, re-exports, literal `require()` and `import()` calls. */
export function specifiersOf(sf: ts.SourceFile): { text: string; kind: 'import' | 'require'; dynamic?: boolean }[] {
  const out: { text: string; kind: 'import' | 'require'; dynamic?: boolean }[] = [];
  const visit = (n: ts.Node) => {
    if ((ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) && n.moduleSpecifier && ts.isStringLiteral(n.moduleSpecifier)) out.push({ text: n.moduleSpecifier.text, kind: 'import' });
    else if (ts.isCallExpression(n) && n.arguments.length >= 1 && ts.isStringLiteralLike(n.arguments[0])) {
      if (ts.isIdentifier(n.expression) && n.expression.text === 'require') out.push({ text: n.arguments[0].text, kind: 'require' });
      else if (n.expression.kind === ts.SyntaxKind.ImportKeyword) out.push({ text: n.arguments[0].text, kind: 'import', dynamic: true });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

function jsonFile(base: string): string | null {
  for (const f of [base, base + '.json']) if (f.endsWith('.json') && existsSync(f)) return f;
  return null;
}

/** Whether the package a file belongs to declares that its modules have no side effects (`"sideEffects": false`, or a list leaving it out). */
function sideEffectFree(file: string): boolean {
  const dir = packageRootOf(file);
  if (!dir) return false;
  const se = readPackage(dir).sideEffects;
  if (se === false) return true;
  if (!Array.isArray(se)) return false;
  const rel = './' + relative(dir, file);
  return !se.some((p: string) => {
    const pattern = p.startsWith('./') || p.startsWith('/') ? p : `**/${p}`;
    return globMatch(pattern.replace(/^\.\//, './'), rel);
  });
}

function globMatch(pattern: string, path: string): boolean {
  const re = new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*\//g, '(?:.*/)?').replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*') + '$');
  return re.test(path) || re.test(path.replace(/^\.\//, ''));
}

/** A file the browser field of its package replaces (`"./lib/node.js": "./lib/browser.js"`, or `false`). */
function browserMapped(from: string, file: string): string | false {
  const dir = packageRootOf(file);
  if (!dir) return file;
  const map = readPackage(dir).browser;
  if (!map || typeof map !== 'object') return file;
  for (const [k, v] of Object.entries(map)) {
    if (!k.startsWith('.')) continue;
    const source = resolve(dir, k);
    if (source === file || source + '.js' === file) {
      if (v === false) return false;
      if (typeof v === 'string') return resolve(dir, v);
    }
  }
  return file;
}

/** A bare specifier the browser field of the importing file's package replaces (`"fs": false`). */
function browserReplacement(from: string, specifier: string): string | false | null {
  const dir = packageRootOf(from);
  if (!dir) return null;
  const map = readPackage(dir).browser;
  if (!map || typeof map !== 'object' || !(specifier in map)) return null;
  const v = map[specifier];
  if (v === false) return false;
  if (typeof v === 'string') return v.startsWith('.') ? resolve(dir, v) : v;
  return null;
}

/** The package a published JavaScript file belongs to. */
export function jsPackageName(file: string): string | null {
  const dir = packageRootOf(file);
  return dir ? readPackage(dir).name ?? packageOf(relative(dirname(dir), dir)) : null;
}
