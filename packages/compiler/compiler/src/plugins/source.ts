import ts from 'typescript';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, lstatSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { releaseOptions } from '../app-resources.ts';

/**
 * A plugin's TypeScript source, as the release build compiles it instead of
 * the JavaScript npm installed: the repository and revision the published
 * package was built from, fetched into a cache and checked against the
 * published files, with each published file mapped to the source file it
 * was compiled from.
 *
 * The revision is the package's `gitHead`, else a release tag, else the
 * commit that set the published version in the package's package.json. A
 * project can point a package at a local checkout instead
 * (`nativescript.config.ts`: `release.pluginSources`), and can
 * carry source-level patches for it (`native-release/patches/<pkg>+<version>.patch`,
 * paths relative to the package's directory in its repository; not under
 * `patches/`, where patch-package would apply them to the installed package).
 */
export interface PluginSource {
  name: string;
  version: string;
  /** The installed package. */
  dir: string;
  /** Where the source lives: the cache checkout, a patched copy of its package directory, or the override. */
  root: string;
  repo: string | null;
  rev: string | null;
  /** Installed JavaScript file → the TypeScript file it was compiled from (null: none found). */
  files: Map<string, string | null>;
  /** The installed files whose source has been checked, as the build reaches them. */
  checked: Set<string>;
  /** Declarations of the package's native API next to its source (`typings/ios.d.ts`). */
  typings: string[];
  /** How the source was checked: against the published files, or not at all (an override). */
  verified: 'published' | 'override';
}

export interface SourceOptions {
  app: string;
  platform: 'ios' | 'android';
  cache?: string;
  overrides?: Record<string, string>;
  say?: (message: string) => void;
}

const DEFAULT_CACHE = join(homedir(), '.cache', 'ns-native', 'plugins');

export class PluginSources {
  private packages = new Map<string, PluginSource>();
  private byFile = new Map<string, string>();
  readonly options: SourceOptions;

  constructor(options: SourceOptions) {
    this.options = options;
  }

  /** Every package acquired so far. */
  all(): PluginSource[] {
    return [...this.packages.values()];
  }

  /** The package installed at `dir`, acquired on first use. */
  get(dir: string): PluginSource {
    const key = resolve(dir);
    let source = this.packages.get(key);
    if (!source) {
      source = acquire(key, this.options);
      this.packages.set(key, source);
      for (const js of source.files.keys()) this.byFile.set(js, key);
    }
    return source;
  }

  /** The source file an installed JavaScript file was compiled from; null for a file of no acquired package. */
  sourceOf(jsFile: string): string | null {
    const js = resolve(jsFile);
    const owner = this.byFile.get(js);
    if (!owner) return null;
    const source = this.packages.get(owner)!;
    const src = source.files.get(js);
    if (!src) throw new Error(`${source.name}: ${relative(source.dir, js)} has no TypeScript source in ${source.root}`);
    return src;
  }

  /**
   * Checks source files the build compiles against the published files they
   * were built from, once each: what is compiled is what npm installed.
   */
  verify(sources: Iterable<string>) {
    for (const src of sources) {
      for (const source of this.packages.values()) {
        const js = [...source.files].find(([, s]) => s === src)?.[0];
        if (!js) continue;
        if (!source.checked.has(js) && source.verified === 'published') verify(source.name, js, src);
        source.checked.add(js);
      }
    }
  }

  /** The package a source file belongs to. */
  packageOfSource(src: string): PluginSource | null {
    for (const source of this.packages.values()) if ([...source.files.values()].includes(src)) return source;
    return null;
  }
}

/** `release.pluginSources` for `platform` from the project's nativescript.config.ts, paths resolved against the project. */
export function configuredOverrides(app: string, platform: 'ios' | 'android'): Record<string, string> {
  const sources = releaseOptions(app, platform).pluginSources;
  return Object.fromEntries(Object.entries(sources && typeof sources === 'object' ? sources : {}).map(([name, path]) => {
    if (typeof path !== 'string') throw new Error(`nativescript.config: release.pluginSources entries are 'package': 'path'`);
    return [name, resolve(app, path)];
  }));
}

// ---------------------------------------------------------------- acquisition

function acquire(dir: string, options: SourceOptions): PluginSource {
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  const name: string = pkg.name;
  const version: string = pkg.version;
  const say = options.say ?? (() => {});
  const override = options.overrides?.[name];
  let root: string;
  let repo: string | null = null;
  let rev: string | null = null;
  if (override) {
    if (!existsSync(override)) throw new Error(`${name}: the source configured in release.pluginSources (${override}) does not exist`);
    root = override;
  } else {
    repo = repositoryOf(pkg);
    if (!repo) throw new Error(`${name}@${version}: package.json names no repository; point release.pluginSources['${name}'] at a checkout of its source`);
    const checkout = join(options.cache ?? DEFAULT_CACHE, `${name.replace(/\//g, '+')}@${version}`);
    rev = fetch(checkout, repo, pkg, say);
    root = join(checkout, 'repo');
  }

  const repoFiles = listFiles(root);
  const packageDir = sourcePackageDir(root, repoFiles, name);
  let files = mapFiles(dir, root, repoFiles, packageDir);

  // Source-level patches apply to a copy of the package's directory.
  const patch = join(options.app, 'native-release', 'patches', `${name.replace(/\//g, '+')}+${version}.patch`);
  if (existsSync(patch)) {
    if (!packageDir) throw new Error(`${name}: ${relative(options.app, patch)} needs the package's directory in its source, which was not found`);
    const text = readFileSync(patch, 'utf8');
    const copy = join(override ? join(options.cache ?? DEFAULT_CACHE, 'overrides', name.replace(/\//g, '+')) : dirname(root), `patched-${createHash('sha1').update(text).digest('hex').slice(0, 12)}`);
    if (!existsSync(join(copy, '.applied'))) {
      rmSync(copy, { recursive: true, force: true });
      mkdirSync(copy, { recursive: true });
      cpSync(packageDir, copy, { recursive: true, filter: (f) => !f.includes(`${sep}node_modules`) });
      try {
        execFileSync('patch', ['-p1', '--forward', '--batch', '-s', '-d', copy, '-i', patch], { stdio: 'pipe' });
      } catch (e) {
        throw new Error(`${name}: ${relative(options.app, patch)} does not apply to the source at ${rev ?? override}:\n${(e as { stdout?: Buffer }).stdout?.toString() ?? e}`);
      }
      writeFileSync(join(copy, '.applied'), patch);
    }
    files = new Map([...files].map(([js, src]) => [js, src?.startsWith(packageDir + sep) ? join(copy, relative(packageDir, src)) : src]));
    say(`${name}: ${relative(options.app, patch)} applied to its source`);
  }

  const typings = typingsNear([...files.values()].filter((f): f is string => !!f), options.platform);
  say(`${name}@${version}: source from ${override ? `${override} (not verified: a configured source)` : `${repo} @ ${rev!.slice(0, 7)}`}`);
  return { name, version, dir, root, repo, rev, files, typings, checked: new Set(), verified: override ? 'override' : 'published' };
}

/** The repository URL a package.json names: `repository`, else its issue tracker's or homepage's repository. */
export function repositoryOf(pkg: any): string | null {
  const raw = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url;
  const candidates = [raw, pkg.bugs?.url?.replace(/\/issues\/?$/, ''), pkg.homepage].filter((x): x is string => typeof x === 'string');
  for (let url of candidates) {
    url = url.replace(/^git\+/, '').replace(/^git:\/\//, 'https://').replace(/^github:/, 'https://github.com/').replace(/#.*$/, '');
    if (/^[\w-]+\/[\w.-]+$/.test(url)) url = `https://github.com/${url}`;
    const gh = /^(?:https?:\/\/|ssh:\/\/git@|git@)github\.com[/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/.exec(url);
    if (gh) return `https://github.com/${gh[1]}/${gh[2]}.git`;
    if (/^https?:\/\/.+\.git$/.test(url) || url.startsWith('file://')) return url;
  }
  return null;
}

function git(cwd: string, args: string[]): string {
  return execFileSync('git', ['-c', 'advice.detachedHead=false', ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 256 << 20 }).trim();
}

/** Clones (blobless) into `checkout/repo` at the package's revision, once; returns the revision. */
function fetch(checkout: string, repo: string, pkg: any, say: (m: string) => void): string {
  const meta = join(checkout, 'source.json');
  if (existsSync(meta)) return JSON.parse(readFileSync(meta, 'utf8')).rev;
  const dir = join(checkout, 'repo');
  rmSync(checkout, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  say(`${pkg.name}@${pkg.version}: fetching ${repo}`);
  git(dir, ['init', '-q']);
  git(dir, ['remote', 'add', 'origin', repo]);
  const head = pkg['git' + 'Head'];
  let rev: string | null = null;
  let how = '';
  if (typeof head === 'string' && /^[0-9a-f]{40}$/.test(head)) {
    try {
      git(dir, ['fetch', '-q', '--filter=blob:none', '--depth', '1', 'origin', head]);
      rev = head;
      how = 'package.json gitHead';
    } catch { /* not on the remote: fall back to tags */ }
  }
  if (!rev) {
    const short = pkg.name.split('/').pop();
    const wanted = [`${pkg.version}-${short}`, `v${pkg.version}`, `${pkg.version}`, `${pkg.name}@${pkg.version}`, `${short}@${pkg.version}`, `${short}-v${pkg.version}`, `${short}-${pkg.version}`];
    const tags = git(dir, ['ls-remote', '--tags', 'origin']).split('\n').map((l) => l.split('\t')[1]?.replace(/^refs\/tags\//, '')).filter(Boolean);
    const tag = wanted.find((t) => tags.includes(t));
    if (tag) {
      git(dir, ['fetch', '-q', '--filter=blob:none', '--depth', '1', 'origin', `refs/tags/${tag}:refs/tags/${tag}`]);
      rev = git(dir, ['rev-list', '-n', '1', tag]);
      how = `tag ${tag}`;
    }
  }
  if (!rev) {
    // The commit that set the published version in the package's own package.json.
    git(dir, ['fetch', '-q', '--filter=blob:none', 'origin']);
    const branch = git(dir, ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD']).replace(/^origin\//, '') || 'HEAD';
    const ref = `origin/${branch}`;
    const manifests = git(dir, ['ls-tree', '-r', '--name-only', ref]).split('\n').filter((f) => /(^|\/)package\.json$/.test(f) && !f.includes('node_modules/'));
    const own = manifests.find((f) => { try { return JSON.parse(git(dir, ['show', `${ref}:${f}`])).name === pkg.name; } catch { return false; } });
    if (own) {
      const commits = git(dir, ['log', '--format=%H', `-S"version": "${pkg.version}"`, ref, '--', own]).split('\n').filter(Boolean);
      // Oldest first: the bump, not a later commit that moved past the version.
      for (const c of commits.reverse()) {
        try {
          if (JSON.parse(git(dir, ['show', `${c}:${own}`])).version === pkg.version) { rev = c; how = `the commit that set version ${pkg.version} in ${own}`; break; }
        } catch { /* the manifest did not parse at that commit */ }
      }
    }
  }
  if (!rev) throw new Error(`${pkg.name}@${pkg.version}: no revision of ${repo} matches the published package (no gitHead, no release tag, no commit setting the version); point release.pluginSources['${pkg.name}'] at a checkout of its source`);
  git(dir, ['checkout', '-q', rev]);
  writeFileSync(meta, JSON.stringify({ repo, rev, how }, null, 2));
  say(`${pkg.name}@${pkg.version}: ${repo} @ ${rev.slice(0, 7)} (${how})`);
  return rev;
}

function listFiles(root: string): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      if (f === 'node_modules' || f === '.git' || f.startsWith('patched-')) continue;
      const p = join(d, f);
      const st = lstatSync(p);
      if (st.isDirectory()) walk(p);
      else if (st.isFile()) out.push(p);
    }
  };
  walk(root);
  return out;
}

/** The directory of the package.json in the source that names the package. */
function sourcePackageDir(root: string, files: string[], name: string): string | null {
  const manifests = files.filter((f) => basename(f) === 'package.json').sort((a, b) => a.length - b.length);
  for (const m of manifests) {
    try { if (JSON.parse(readFileSync(m, 'utf8')).name === name) return dirname(m); } catch { /* not JSON */ }
  }
  return null;
}

/** Each runtime JavaScript file of the installed package → the TypeScript file it was compiled from. */
function mapFiles(dir: string, root: string, repoFiles: string[], packageDir: string | null): Map<string, string | null> {
  const sources = repoFiles.filter((f) => /\.tsx?$/.test(f) && !f.endsWith('.d.ts'));
  const out = new Map<string, string | null>();
  const installed = listFiles(dir).filter((f) => f.endsWith('.js') && !f.includes(`${sep}platforms${sep}`) && !/\.(config|webpack)\.js$/.test(f));
  const bySuffix = (suffix: string) => {
    const hits = sources.filter((f) => f === join(root, suffix) || f.endsWith(sep + suffix));
    if (hits.length <= 1) return hits[0] ?? null;
    // Several files end the same way: the one in the package's own directory.
    return hits.find((f) => packageDir && f.startsWith(packageDir + sep)) ?? hits.sort((a, b) => a.length - b.length)[0];
  };
  for (const js of installed) {
    let src: string | null = null;
    const map = js + '.map';
    if (existsSync(map)) {
      const listed: string[] = JSON.parse(readFileSync(map, 'utf8')).sources ?? [];
      if (listed.length === 1) {
        const parts = listed[0].replace(/\\/g, '/').split('/').filter((p) => p && p !== '..' && p !== '.');
        // The longest tail of the listed path that names a file in the source.
        for (let k = 0; k < parts.length && !src; k++) src = bySuffix(parts.slice(k).join(sep));
      }
    }
    if (!src) {
      const rel = relative(dir, js).replace(/\.js$/, '');
      for (const ext of ['.ts', '.tsx']) src ??= bySuffix(rel + ext);
    }
    out.set(js, src);
  }
  return out;
}

/** Native API declarations a package's source keeps beside it (its `references.d.ts` and `typings/`), for the platform. */
function typingsNear(sources: string[], platform: 'ios' | 'android'): string[] {
  const other = platform === 'ios' ? 'android' : 'ios';
  const dirs = new Set(sources.map(dirname));
  const out = new Set<string>();
  for (const d of dirs) {
    if (existsSync(join(d, 'references.d.ts'))) out.add(join(d, 'references.d.ts'));
    const typings = join(d, 'typings');
    if (!existsSync(typings)) continue;
    for (const f of readdirSync(typings)) {
      if (f.endsWith('.d.ts') && !f.includes(other)) out.add(join(typings, f));
    }
  }
  return [...out];
}

// ---------------------------------------------------------------- verification

/**
 * Each source file transpiled and compared with the published file it maps
 * to. Both are printed by the same transpiler; what may differ is what a
 * whole-program build emits differently from a single-file one: decorator
 * helpers, const enum members inlined as their values, imports elided as
 * type-only. Anything else stops the build.
 */
function verify(name: string, js: string, src: string) {
  const source = readFileSync(src, 'utf8');
  const lowered = /@NativeClass\b/.test(source) ? lowerNativeClasses(source, src) : source;
  const bad = unexplained(normalize(lowered, src), normalize(readFileSync(js, 'utf8'), js));
  if (process.env.NS_NATIVE_DEBUG_VERIFY) console.log(JSON.stringify(bad));
  if (bad.length) throw new Error(`${name}: ${src} does not match the published ${js}:\n${bad.slice(0, 12).map((l) => '    ' + l).join('\n')}${bad.length > 12 ? `\n    … ${bad.length - 12} more lines` : ''}`);
}

// Both sides are lowered to one target, so the published file's own target does not show.
const PRINT: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.ESNext, removeComments: true, experimentalDecorators: true,
  useDefineForClassFields: false, importHelpers: false, noEmitHelpers: true, verbatimModuleSyntax: false, isolatedModules: false,
};

/**
 * Each `@NativeClass` class lowered on its own to ES5 without the decorator,
 * as NativeScript's build does when a plugin is published.
 */
function lowerNativeClasses(text: string, file: string): string {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const edits: { start: number; end: number; text: string }[] = [];
  const visit = (n: ts.Node) => {
    if (ts.isClassDeclaration(n) && (ts.getDecorators(n) ?? []).some((d) => /^NativeClass\b/.test(d.expression.getText()))) {
      let code = text.slice(n.getStart(sf), n.end);
      for (const d of ts.getDecorators(n)!) if (/^NativeClass\b/.test(d.expression.getText())) code = code.replace(d.getText(), '');
      const exported = /^\s*export\s+class\b/.test(code);
      let down = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES5, experimentalDecorators: true, noEmitHelpers: true, useDefineForClassFields: false } })
        .outputText.replace(/enumerable:\s*false/g, 'enumerable: true').replace(/export \{\};?\s*$/m, '');
      if (exported && n.name && !new RegExp(`export\\s*\\{\\s*${n.name.text}\\s*\\}`).test(down)) down += `\nexport { ${n.name.text} };\n`;
      edits.push({ start: n.getStart(sf), end: n.end, text: down });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  for (const e of edits.sort((a, b) => b.start - a.start)) text = text.slice(0, e.start) + e.text + text.slice(e.end);
  return text;
}

function normalize(text: string, file: string): string[] {
  const out = ts.transpileModule(text, { compilerOptions: PRINT, fileName: file.replace(/\.js$/, '.ts') }).outputText;
  const sf = ts.createSourceFile('x.js', out, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  // Decorator helpers: imported from tslib, or declared inline by the emitter.
  const kept = sf.statements.filter((st) => {
    if (ts.isImportDeclaration(st) && (st.moduleSpecifier as ts.StringLiteral).text === 'tslib') return false;
    if (ts.isVariableStatement(st) && st.declarationList.declarations.every((d) => /^__\w+$/.test(d.name.getText()))) return false;
    return true;
  });
  const printer = ts.createPrinter({ removeComments: true });
  // Decorator metadata (`__metadata("design:paramtypes", [])`), which a build with emitDecoratorMetadata adds.
  const printed = kept.map((st) => printer.printNode(ts.EmitHint.Unspecified, st, sf)).join('\n')
    .replace(/,?\s*(?:\b(?:tslib_\d+|tslib)\.)?__metadata\("design:\w+",\s*(?:\[[^\]]*\]|[\w.$]+|void 0)\)/g, '');
  return printed.split('\n')
    .map((l) => l.trim().replace(/\b(tslib_\d+|tslib)\.(__\w+)/g, '$2'))
    .filter((l) => l && !l.startsWith('//# sourceMappingURL') && l !== 'export {};');
}

/** Lines of a diff between the source's output `a` and the published `b` that no benign difference explains. */
function unexplained(a: string[], b: string[]): string[] {
  const ops = diff(a, b);
  const bad: string[] = [];
  // Inlined enum members: a line whose only difference is `E.Member` against a literal.
  const shape = (l: string) => l.replace(/\b[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)+\b|-?\b\d+(\.\d+)?\b|"[^"]*"|'[^']*'/g, '#');
  for (let i = 0; i < ops.length; ) {
    if (ops[i].op === '=') { i++; continue; }
    const del: string[] = [], add: string[] = [];
    while (i < ops.length && ops[i].op !== '=') { (ops[i].op === '-' ? del : add).push(ops[i].line); i++; }
    for (let k = 0; k < Math.max(del.length, add.length); k++) {
      const x = del[k], y = add[k];
      if (x !== undefined && y !== undefined && shape(x) === shape(y)) continue;
      // Imports and re-exports a whole-program build elides as type-only.
      if (x !== undefined && y === undefined && /^(import|export) \{?/.test(x) && !/^export (default |const |let |var |function |class |async )/.test(x)) continue;
      if (x !== undefined && y !== undefined && /^import\b/.test(x) && /^import\b/.test(y)) continue;
      const names = (l: string) => /^export \{([^}]*)\}/.exec(l)?.[1].split(',').map((n) => n.trim()).filter(Boolean);
      if (x !== undefined && y !== undefined && names(x) && names(y)!.every((n) => names(x)!.includes(n))) continue;
      if (x !== undefined) bad.push(`- ${x}`);
      if (y !== undefined) bad.push(`+ ${y}`);
    }
  }
  return bad;
}

function diff(a: string[], b: string[]): { op: '=' | '-' | '+'; line: string }[] {
  const n = a.length, m = b.length;
  const lcs = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
  const out: { op: '=' | '-' | '+'; line: string }[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push({ op: '=', line: a[i] }); i++; j++; }
    else if (lcs[i + 1][j] >= lcs[i][j + 1]) out.push({ op: '-', line: a[i++] });
    else out.push({ op: '+', line: b[j++] });
  }
  while (i < n) out.push({ op: '-', line: a[i++] });
  while (j < m) out.push({ op: '+', line: b[j++] });
  return out;
}
