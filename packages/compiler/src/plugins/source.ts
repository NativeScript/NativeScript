import ts from 'typescript';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, lstatSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
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
  /** An installed file bundling several sources (an ES module package's `fesm2022/x.mjs`) → the sources its map lists. */
  bundles: Map<string, BundleSources>;
  /** The installed files whose source has been checked, as the build reaches them. */
  checked: Set<string>;
  /** Declarations of the package's native API next to its source (`typings/ios.d.ts`). */
  typings: string[];
  /** How the source was checked: against the published files, not at all (an override), or not needed (npm installed it with the files built from it). */
  verified: 'published' | 'override' | 'shipped';
}

/** What a bundle's source map lists: each source as the checkout has it (null: not there) and as the bundle was built from it. */
export interface BundleSources {
  listed: string[];
  files: (string | null)[];
  contents: (string | null)[];
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
    if (!src) throw new Error(`${source.name}: ${relative(source.dir, js)} ${noSource(source, js)}`);
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
        if (!source.checked.has(js) && source.verified === 'published') {
          const bundle = source.bundles.get(js);
          if (bundle) verifyBundle(source.name, js, bundle, this.options.app, source.version);
          else verify(source.name, js, src, this.options.app, source.version);
        }
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

/** Why an installed file has no source to compile; for a bundle, which of its sources the checkout lacks. */
function noSource(source: PluginSource, js: string): string {
  const bundle = source.bundles.get(js);
  if (!bundle) return `has no TypeScript source in ${source.root}; point release.pluginSources['${source.name}'] at a checkout of its source, or replace the package with a TypeScript module of the app in release.pluginReplacements['${source.name}']`;
  const found = bundle.files.filter(Boolean).length;
  return `bundles ${bundle.listed.length} sources, ${found ? `${found} of them in ${source.root} but not its entry` : `none of them in ${source.root}`}; point release.pluginSources['${source.name}'] at a checkout of its source`;
}

/** `release.pluginSources` for `platform` from the project's nativescript.config.ts, paths resolved against the project. */
export function configuredOverrides(app: string, platform: 'ios' | 'android'): Record<string, string> {
  const sources = releaseOptions(app, platform).pluginSources;
  return Object.fromEntries(Object.entries(sources && typeof sources === 'object' ? sources : {}).map(([name, path]) => {
    if (typeof path !== 'string') throw new Error(`nativescript.config: release.pluginSources entries are 'package': 'path'`);
    return [name, resolve(app, path)];
  }));
}

/**
 * The compiler's own TypeScript modules (`runtime/`). Installed, they sit under the app's node_modules, below its
 * tsconfig.json: they compile as written wherever the package is.
 */
export const COMPILER_RUNTIME = resolve(dirname(fileURLToPath(import.meta.url)), '../../runtime') + sep;

const writtenStrictness = new Map<string, boolean>();

/** Whether a source's own tsconfig (its `extends` followed) checks null: code written without it is translated as core is. */
export function writtenStrict(file: string, strictness = writtenStrictness): boolean {
  if (file.startsWith(COMPILER_RUNTIME)) return true;
  for (let dir = dirname(file); dirname(dir) !== dir; dir = dirname(dir)) {
    const config = join(dir, 'tsconfig.json');
    if (!existsSync(config)) continue;
    if (!strictness.has(config)) {
      const o = ts.getParsedCommandLineOfConfigFile(config, {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} })?.options ?? {};
      strictness.set(config, !!(o.strictNullChecks ?? o.strict));
    }
    return strictness.get(config)!;
  }
  return true;
}

// ---------------------------------------------------------------- acquisition

function acquire(dir: string, options: SourceOptions): PluginSource {
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  const name: string = pkg.name;
  const version: string = pkg.version;
  const say = options.say ?? (() => {});
  const override = options.overrides?.[name] ? resolve(options.app, options.overrides[name]) : undefined;
  let root: string;
  let repo: string | null = null;
  let rev: string | null = null;
  const shipped = !override && shipsSource(dir, pkg);
  if (override) {
    if (!existsSync(override)) throw new Error(`${name}: the source configured in release.pluginSources (${override}) does not exist`);
    root = override;
  } else if (shipped) {
    root = dir;
  } else {
    repo = repositoryOf(pkg);
    if (!repo) throw new Error(`${name}@${version}: package.json names no repository; point release.pluginSources['${name}'] at a checkout of its source`);
    const checkout = join(options.cache ?? DEFAULT_CACHE, `${name.replace(/\//g, '+')}@${version}`);
    const fetched = fetch(checkout, repo, pkg, dir, say);
    repo = fetched.repo;
    rev = fetched.rev;
    root = join(checkout, 'repo');
  }

  const repoFiles = listFiles(root);
  const packageDir = sourcePackageDir(root, repoFiles, name);
  const bundles = new Map<string, BundleSources>();
  let files = mapFiles(dir, root, repoFiles, packageDir, bundles);

  // Source-level patches apply to a copy of the package's directory (or repo root when sources live in `src/<pkg>` outside `packages/<pkg>`).
  const patch = join(options.app, 'native-release', 'patches', `${name.replace(/\//g, '+')}+${version}.patch`);
  if (existsSync(patch)) {
    const text = readFileSync(patch, 'utf8');
    const firstTarget = /^---\s+a\/([^\s\n]+)/m.exec(text)?.[1];
    const patchBase = (firstTarget && packageDir && existsSync(join(packageDir, firstTarget)) ? packageDir
      : firstTarget && existsSync(join(root, firstTarget)) ? root
      : packageDir) ?? null;
    if (!patchBase) throw new Error(`${name}: ${relative(options.app, patch)} needs the package's directory in its source, which was not found`);
    const relBase = relative(root, patchBase);
    // The copy keeps the repository's layout below the patch's base; its name changes with that layout.
    const copy = join(override ? join(options.cache ?? DEFAULT_CACHE, 'overrides', name.replace(/\//g, '+')) : dirname(root), `patched-${createHash('sha1').update(`repo-layout\0${relBase}\0`).update(text).digest('hex').slice(0, 12)}`);
    const targetDir = relBase ? join(copy, relBase) : copy;
    if (!existsSync(join(copy, '.applied'))) {
      rmSync(copy, { recursive: true, force: true });
      mkdirSync(targetDir, { recursive: true });
      cpSync(patchBase, targetDir, { recursive: true, filter: (f) => !f.includes(`${sep}node_modules`) && !f.includes(`${sep}.git`) });
      if (relBase) {
        for (const f of readdirSync(root, { withFileTypes: true })) {
          if (f.isFile() && (/^tsconfig.*\.json$/.test(f.name) || f.name.endsWith('.d.ts'))) cpSync(join(root, f.name), join(copy, f.name));
        }
      }
      try {
        execFileSync('patch', ['-p1', '--forward', '--batch', '-s', '-d', targetDir, '-i', patch], { stdio: 'pipe' });
      } catch (e) {
        throw new Error(`${name}: ${relative(options.app, patch)} does not apply to the source at ${rev ?? override}:\n${(e as { stdout?: Buffer }).stdout?.toString() ?? e}`);
      }
      writeFileSync(join(copy, '.applied'), patch);
    }
    files = new Map([...files].map(([js, src]) => [js, src?.startsWith(root + sep) ? join(copy, relative(root, src)) : src]));
    for (const b of bundles.values()) {
      if (b.entry?.startsWith(root + sep)) b.entry = join(copy, relative(root, b.entry));
      b.files = b.files.map((f) => (f?.startsWith(root + sep) ? join(copy, relative(root, f)) : f));
    }
    root = copy;
    say(`${name}: ${relative(options.app, patch)} applied to its source`);
  }

  const typings = typingsNear([...files.values()].filter((f): f is string => !!f), options.platform, root);
  say(`${name}@${version}: source from ${override ? `${override} (not verified: a configured source)` : shipped ? 'the package (it ships its TypeScript)' : `${repo} @ ${rev!.slice(0, 7)}`}`);
  return { name, version, dir, root, repo, rev, files, bundles, typings, checked: new Set(), verified: override ? 'override' : shipped ? 'shipped' : 'published' };
}

/** Whether the package's own TypeScript is installed with it (rxjs's `src/`): its main file's map names a source inside the package. */
function shipsSource(dir: string, pkg: any): boolean {
  const main = resolve(dir, typeof pkg.main === 'string' ? pkg.main : 'index.js');
  const map = (main.endsWith('.js') ? main : main + '.js') + '.map';
  if (!existsSync(map)) return false;
  try {
    const first = JSON.parse(readFileSync(map, 'utf8')).sources?.[0];
    if (typeof first !== 'string' || !/\.tsx?$/.test(first)) return false;
    const src = resolve(dirname(map), first);
    return src.startsWith(dir + sep) && existsSync(src);
  } catch {
    return false;
  }
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

/** Scope monorepos to search when a scoped package's `repository` field still points at an older standalone or sibling repo. */
function candidateRepos(pkg: any, primary: string): string[] {
  const out = [primary];
  const add = (r: string) => { if (!out.includes(r)) out.push(r); };
  if (typeof pkg.name === 'string') {
    if (pkg.name.startsWith('@nativescript/')) {
      add('https://github.com/NativeScript/plugins.git');
      add('https://github.com/NativeScript/firebase.git');
      add('https://github.com/NativeScript/ui-kit.git');
    } else if (pkg.name.startsWith('@triniwiz/')) {
      add('https://github.com/triniwiz/nativescript-plugins.git');
    } else if (pkg.name.startsWith('@nstudio/')) {
      add('https://github.com/nstudio/nativescript-plugins.git');
      add('https://github.com/nstudio/nativescript-ui-kit.git');
    }
  }
  return out;
}

function git(cwd: string, args: string[]): string {
  return execFileSync('git', ['-c', 'advice.detachedHead=false', '-c', 'filter.lfs.smudge=', '-c', 'filter.lfs.process=', '-c', 'filter.lfs.required=false', ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, GIT_LFS_SKIP_SMUDGE: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 256 << 20,
  }).trim();
}

function treeHasPackage(dir: string, ref: string, pkgName: string): string | null {
  const manifests = git(dir, ['ls-tree', '-r', '--name-only', ref]).split('\n').filter((f) => /(^|\/)package\.json$/.test(f) && !f.includes('node_modules/'));
  return manifests.find((f) => { try { return JSON.parse(git(dir, ['show', `${ref}:${f}`])).name === pkgName; } catch { return false; } }) ?? null;
}

/** Clones (blobless) into `checkout/repo` at the package's revision, once; returns the repository and revision. */
function fetch(checkout: string, primaryRepo: string, pkg: any, pkgDir: string, say: (m: string) => void): { repo: string; rev: string } {
  const meta = join(checkout, 'source.json');
  if (existsSync(meta)) {
    const parsed = JSON.parse(readFileSync(meta, 'utf8'));
    return { repo: parsed.repo ?? primaryRepo, rev: parsed.rev };
  }
  const dir = join(checkout, 'repo');
  const repos = candidateRepos(pkg, primaryRepo);
  const head = pkg['git' + 'Head'];
  const short = pkg.name.split('/').pop();
  const wantedTags = [`${pkg.version}-${short}`, `v${pkg.version}`, `${pkg.version}`, `${pkg.name}@${pkg.version}`, `${short}@${pkg.version}`, `${short}-v${pkg.version}`, `${short}-${pkg.version}`];
  const fallbacks: { repo: string; own: string; commits: string[] }[] = [];

  for (const repo of repos) {
    rmSync(checkout, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    say(`${pkg.name}@${pkg.version}: fetching ${repo}`);
    git(dir, ['init', '-q']);
    git(dir, ['remote', 'add', 'origin', repo]);
    let rev: string | null = null;
    let how = '';
    if (typeof head === 'string' && /^[0-9a-f]{40}$/.test(head)) {
      try {
        git(dir, ['fetch', '-q', '--filter=blob:none', '--depth', '1', 'origin', head]);
        if (treeHasPackage(dir, head, pkg.name)) {
          rev = head;
          how = 'package.json gitHead';
        }
      } catch { /* not a directly fetchable ref on this remote */ }
    }
    if (!rev) {
      try {
        const tags = git(dir, ['ls-remote', '--tags', 'origin']).split('\n').map((l) => l.split('\t')[1]?.replace(/^refs\/tags\//, '')).filter(Boolean);
        const tag = wantedTags.find((t) => tags.includes(t));
        if (tag) {
          git(dir, ['fetch', '-q', '--filter=blob:none', '--depth', '1', 'origin', `refs/tags/${tag}:refs/tags/${tag}`]);
          const tagRev = git(dir, ['rev-list', '-n', '1', tag]);
          if (treeHasPackage(dir, tagRev, pkg.name)) {
            rev = tagRev;
            how = `tag ${tag}`;
          }
        }
      } catch { /* remote unreachable or no tags */ }
    }
    if (!rev) {
      try {
        git(dir, ['fetch', '-q', '--filter=blob:none', 'origin']);
        if (typeof head === 'string' && /^[0-9a-f]{40}$/.test(head)) {
          try {
            git(dir, ['cat-file', '-e', `${head}^{commit}`]);
            if (treeHasPackage(dir, head, pkg.name)) {
              rev = head;
              how = 'package.json gitHead';
            }
          } catch { /* not in fetched branches */ }
        }
        const branch = git(dir, ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD']).replace(/^origin\//, '') || 'HEAD';
        const ref = `origin/${branch}`;
        const own = treeHasPackage(dir, ref, pkg.name);
        if (!rev && own) {
          for (const scope of [ref, '--all']) {
            const commits = git(dir, ['log', '--format=%H', `-S"version": "${pkg.version}"`, scope, '--', own]).split('\n').filter(Boolean);
            for (const c of commits.reverse()) {
              try {
                if (JSON.parse(git(dir, ['show', `${c}:${own}`])).version === pkg.version) { rev = c; how = `the commit that set version ${pkg.version} in ${own}`; break; }
              } catch { /* manifest did not parse at that commit */ }
            }
            if (rev) break;
          }
          if (!rev) {
            const pkgSubdir = dirname(own);
            const major = String(pkg.version).split('.')[0];
            const candidates = git(dir, ['log', '--format=%H', ref, '--', pkgSubdir === '.' ? own : pkgSubdir]).split('\n').filter(Boolean)
              .filter((c) => {
                try {
                  const v = String(JSON.parse(git(dir, ['show', `${c}:${own}`])).version ?? '');
                  return v.split('.')[0] === major && v.localeCompare(pkg.version, undefined, { numeric: true }) <= 0;
                } catch { return false; }
              });
            if (candidates.length) fallbacks.push({ repo, own, commits: candidates });
          }
        }
      } catch { /* ignore and try next candidate repo */ }
    }
    if (rev) {
      git(dir, ['checkout', '-q', rev]);
      writeFileSync(meta, JSON.stringify({ repo, rev, how }, null, 2));
      say(`${pkg.name}@${pkg.version}: ${repo} @ ${rev.slice(0, 7)} (${how})`);
      return { repo, rev };
    }
  }

  // A package published from a monorepo without pushing its version bump: the commit of the same major version whose
  // TypeScript matches the installed JavaScript.
  for (const fb of fallbacks) {
    rmSync(checkout, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    git(dir, ['init', '-q']);
    git(dir, ['remote', 'add', 'origin', fb.repo]);
    git(dir, ['fetch', '-q', '--filter=blob:none', 'origin']);
    const pkgSubdir = dirname(fb.own);
    const jsFiles = ['index.ios.js', 'index.android.js', 'common.js', 'index.js'].map((f) => join(pkgDir, f)).filter(existsSync);
    for (const c of fb.commits) {
      const ok = jsFiles.length > 0 && jsFiles.every((js) => {
        const tsRel = (pkgSubdir === '.' ? '' : pkgSubdir + '/') + basename(js).replace(/\.js$/, '.ts');
        try {
          const srcText = git(dir, ['show', `${c}:${tsRel}`]);
          const jsText = readFileSync(js, 'utf8');
          const lowered = /@NativeClass\b/.test(srcText) ? lowerNativeClasses(srcText, tsRel) : srcText;
          return unexplained(normalize(lowered, tsRel, jsText), normalize(jsText, js, jsText)).length === 0;
        } catch { return false; }
      });
      if (ok) {
        const how = `commit matching published files in ${pkgSubdir}`;
        git(dir, ['checkout', '-q', c]);
        writeFileSync(meta, JSON.stringify({ repo: fb.repo, rev: c, how }, null, 2));
        say(`${pkg.name}@${pkg.version}: ${fb.repo} @ ${c.slice(0, 7)} (${how})`);
        return { repo: fb.repo, rev: c };
      }
    }
  }

  throw new Error(`${pkg.name}@${pkg.version}: no revision of ${primaryRepo} matches the published package (no gitHead, no release tag, no commit setting the version); point release.pluginSources['${pkg.name}'] at a checkout of its source`);
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

/**
 * Each runtime JavaScript file of the installed package → the TypeScript file it was compiled from. A file whose source
 * map lists several sources is a bundle of them, compiled from its entry.
 */
function mapFiles(dir: string, root: string, repoFiles: string[], packageDir: string | null, bundles: Map<string, BundleSources>): Map<string, string | null> {
  const sources = repoFiles.filter((f) => /\.tsx?$/.test(f) && !f.endsWith('.d.ts'));
  const out = new Map<string, string | null>();
  const installed = listFiles(dir).filter((f) => /\.m?js$/.test(f) && !f.includes(`${sep}platforms${sep}`) && !/\.(config|webpack)\.js$/.test(f));
  for (const js of installed) {
    const jsInSubdir = dirname(relative(dir, js)) !== '.';
    const bySuffix = (suffix: string) => {
      if (jsInSubdir && !suffix.includes(sep)) return null;
      const hits = sources.filter((f) => f === join(root, suffix) || f.endsWith(sep + suffix));
      if (hits.length <= 1) return hits[0] ?? null;
      const inPkg = packageDir ? hits.filter((f) => f.startsWith(packageDir + sep)) : hits;
      if (inPkg.length === 1) return inPkg[0];
      if (packageDir && inPkg.includes(join(packageDir, suffix))) return join(packageDir, suffix);
      return (inPkg.length ? inPkg : hits).sort((a, b) => a.length - b.length)[0];
    };
    let src: string | null = null;
    const map = js + '.map';
    if (existsSync(map)) {
      const parsed = JSON.parse(readFileSync(map, 'utf8'));
      const listed: string[] = parsed.sources ?? [];
      // The longest tail of the listed path that names a file in the source.
      const inSource = (path: string) => {
        const parts = path.replace(/\\/g, '/').split('/').filter((p) => p && p !== '..' && p !== '.');
        for (let k = 0; k < parts.length; k++) { const f = bySuffix(parts.slice(k).join(sep)); if (f) return f; }
        return null;
      };
      if (listed.length === 1) src = inSource(listed[0]);
      else if (listed.length > 1) {
        const bundle = { listed, files: listed.map(inSource), contents: (parsed.sourcesContent ?? []).map((c: unknown) => (typeof c === 'string' ? c : null)) };
        bundles.set(js, bundle);
        src = bundleEntry(bundle, js, inSource);
      }
    }
    if (!src) {
      const rel = relative(dir, js).replace(/\.m?js$/, '');
      for (const ext of ['.ts', '.tsx']) src ??= bySuffix(rel + ext);
    }
    out.set(js, src);
  }
  return out;
}

/**
 * The source a bundle is compiled from: its entry, the source its map lists under the bundle's own name (else last). A
 * bundler's generated index (ng-packagr's `ngrx-store.ts`), which the checkout lacks, re-exports the entry.
 */
function bundleEntry(b: BundleSources, bundle: string, inSource: (path: string) => string | null): string | null {
  const own = b.listed.findIndex((l) => basename(l).replace(/\.tsx?$/, '') === basename(bundle).replace(/\.m?js$/, ''));
  let k = own >= 0 ? own : b.listed.length - 1;
  for (const seen = new Set<number>(); !seen.has(k); ) {
    seen.add(k);
    if (b.files[k]) return b.files[k];
    const reexported = /^(?:\s|\/\*[\s\S]*?\*\/|\/\/[^\n]*)*export\s*\*\s*from\s*['"](\.[^'"]+)['"];?\s*$/.exec(b.contents[k] ?? '')?.[1];
    if (!reexported) return null;
    const target = join(dirname(b.listed[k]), reexported);
    const listed = b.listed.findIndex((l) => [target + '.ts', target + '.tsx', join(target, 'index.ts')].includes(join(l)));
    if (listed < 0) return inSource(target + '.ts') ?? inSource(join(target, 'index.ts'));
    k = listed;
  }
  return null;
}

/**
 * Native API declarations a package's source keeps beside it or in a folder above it within its
 * source root (its `references.d.ts` and `typings/`; ui-material's are in `src/typings`), for the platform.
 */
function typingsNear(sources: string[], platform: 'ios' | 'android', root: string): string[] {
  const other = platform === 'ios' ? 'android' : 'ios';
  const dirs = new Set<string>();
  for (const f of sources) {
    for (let d = dirname(f); !dirs.has(d); d = dirname(d)) {
      dirs.add(d);
      if (d === root || !d.startsWith(root + sep)) break;
    }
  }
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

function patchHint(app: string | undefined, name: string, version: string | undefined): string {
  if (!app || !version) return '';
  const patchName = `${name.replace(/\//g, '+')}+${version}.patch`;
  const appPatch = join(app, 'patches', patchName);
  const srcPatch = join(app, 'native-release', 'patches', patchName);
  if (existsSync(appPatch) && !existsSync(srcPatch)) {
    return ` (the installed package is patched by patches/${patchName}; port its source changes to native-release/patches/${patchName})`;
  }
  return '';
}

/**
 * Each source file transpiled and compared with the published file it maps
 * to. Both are printed by the same transpiler; what may differ is what a
 * whole-program build emits differently from a single-file one: decorator
 * helpers, const enum members inlined as their values, imports elided as
 * type-only. Anything else stops the build.
 */
export function verify(name: string, js: string, src: string, app?: string, version?: string) {
  const source = readFileSync(src, 'utf8');
  const jsText = readFileSync(js, 'utf8');
  const lowered = /@NativeClass\b/.test(source) ? lowerNativeClasses(source, src) : source;
  const bad = unexplained(normalize(lowered, src, jsText), normalize(jsText, js, jsText));
  if (process.env.NS_NATIVE_DEBUG_VERIFY) console.log(JSON.stringify(bad));
  if (bad.length) throw new Error(`${name}: ${src} does not match the published ${js}${patchHint(app, name, version)}:\n${bad.slice(0, 12).map((l) => '    ' + l).join('\n')}${bad.length > 12 ? `\n    … ${bad.length - 12} more lines` : ''}`);
}

/**
 * A bundle checked against the sources its map embeds: each must be the checkout's file as it is. A source the checkout
 * lacks may be the bundler's own index, re-exporting only.
 */
export function verifyBundle(name: string, js: string, b: BundleSources, app?: string, version?: string) {
  if (b.contents.length !== b.listed.length) throw new Error(`${name}: ${js} has no sources in its source map to check its source against (sourcesContent)`);
  const bad = b.listed.filter((listed, k) => b.files[k] ? readFileSync(b.files[k]!, 'utf8') !== b.contents[k]
    : !/^(\s|\/\*[\s\S]*?\*\/|\/\/[^\n]*|export\s*(\*|\{[^}]*\})\s*from\s*['"][^'"]+['"];?)*$/.test(b.contents[k] ?? ''));
  if (bad.length) throw new Error(`${name}: ${js} was not built from its source at this revision${patchHint(app, name, version)}: ${bad.slice(0, 6).join(', ')}${bad.length > 6 ? ` and ${bad.length - 6} more` : ''} differ`);
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

function normalize(text: string, file: string, jsReference?: string): string[] {
  if (jsReference !== undefined && text !== jsReference && /\bconst\s+enum\b/.test(text)) {
    const tsf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const drops: { start: number; end: number }[] = [];
    for (const st of tsf.statements) {
      if (ts.isEnumDeclaration(st) && st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ConstKeyword) && !new RegExp(`\\b${st.name.text}\\b`).test(jsReference)) {
        drops.push({ start: st.getStart(tsf), end: st.end });
      }
    }
    for (const d of drops.sort((a, b) => b.start - a.start)) text = text.slice(0, d.start) + text.slice(d.end);
  }
  const isCjs = !!jsReference && /\bObject\.defineProperty\(exports,\s*["']__esModule["']/.test(jsReference);
  const isEs5 = !!jsReference && isCjs && /\.prototype\.|\bvar \w+ = (?:\s*\/\*\* @class \*\/\s*)?\(function \(/.test(jsReference);
  const options: ts.CompilerOptions = isCjs || isEs5
    ? { ...PRINT, module: isCjs ? ts.ModuleKind.CommonJS : PRINT.module, target: isEs5 ? ts.ScriptTarget.ES5 : PRINT.target }
    : PRINT;
  const out = ts.transpileModule(text, { compilerOptions: options, fileName: file.replace(/\.js$/, '.ts') }).outputText;
  const sf = ts.createSourceFile('x.js', out, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  // Decorator and CommonJS helpers: imported from tslib, or declared inline by the emitter.
  const kept = sf.statements.filter((st) => {
    if (ts.isImportDeclaration(st) && (st.moduleSpecifier as ts.StringLiteral).text === 'tslib') return false;
    if (ts.isVariableStatement(st) && st.declarationList.declarations.every((d) => /^__\w+$/.test(d.name.getText()))) return false;
    if (ts.isFunctionDeclaration(st) && st.name && /^__\w+$/.test(st.name.text)) return false;
    if (ts.isExpressionStatement(st)) {
      const t = st.getText(sf).trim();
      if (t === '"use strict";' || t === "'use strict';" || /^Object\.defineProperty\(exports,\s*["']__esModule["']/.test(t) || /^(?:exports\.\w+\s*=\s*)+void 0;$/.test(t)) return false;
    }
    return true;
  });
  const printer = ts.createPrinter({ removeComments: true });
  // Decorator metadata (`__metadata("design:paramtypes", [])`), which a build with emitDecoratorMetadata adds.
  const printed = kept.map((st) => printer.printNode(ts.EmitHint.Unspecified, st, sf)).join('\n')
    .replace(/,?\s*(?:\b(?:tslib_\d+|tslib)\.)?__metadata\("design:\w+",\s*(?:\[[^\]]*\]|[\w.$]+|void 0)\)/g, '');
  return printed.split('\n')
    .map((l) => l.trim().replace(/\b(tslib_\d+|tslib)\.(__\w+)/g, '$2'))
    .filter((l) => l && !l.startsWith('//# sourceMappingURL') && l !== 'export {};' && l !== '"use strict";' && l !== "'use strict';" && !/^var (?:_[a-z],\s*)*_[a-z];$/.test(l));
}

/** Lines of a diff between the source's output `a` and the published `b` that no benign difference explains. */
function unexplained(a: string[], b: string[]): string[] {
  const ops = diff(a, b);
  const bad: string[] = [];
  // Inlined enum members and emitter temp aliases (`_a`, `_b`): a line whose only difference is `E.Member` against a literal or `_a` vs `_b`.
  const shape = (l: string) => l
    .replace(/^export\s+(?=(?:function|const|let|var)\s+)/, '')
    .replace(/^__exportStar\(require\(([^)]+)\),\s*exports\);$/, '__export(require($1));')
    .replace(/^\}\)\((\w+)\s*\|\|\s*\(exports\.\1\s*=\s*\1\s*=\s*\{\}\)\);$/, '})($1 = exports.$1 || (exports.$1 = {}));')
    .replace(/\(([A-Za-z_$][\w$]*)\)\s*=>/g, '$1 =>')
    .replace(/^(?:const|let)\s+\{\s*(\w+)\s*\}\s*=\s*(\w+);$/, 'var $1 = $2.$1;')
    .replace(/(?:^|(?<=for\s*\(\s*))(?:const|let)\s+/, 'var ')
    .replace(/`[^`]*`|"[^"]*"\.concat\([^)]*\)/g, '"#"')
    .replace(/\s*\{\s*$/, '')
    .replace(/\((_[a-z])\s*=\s*([A-Za-z_$][\w$]*)\)\s*!==\s*null\s*&&\s*\1\s*!==\s*void 0\s*\?\s*\1\s*:/g, '$2 !== null && $2 !== void 0 ? $2 :')
    .replace(/\b_[a-z]\b/g, '_a')
    .replace(/\b[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)+\b|-?\b\d+(\.\d+)?\b|"[^"]*"|'[^']*'/g, '#');
  for (let i = 0; i < ops.length; ) {
    if (ops[i].op === '=') { i++; continue; }
    const del: string[] = [], add: string[] = [];
    while (i < ops.length && ops[i].op !== '=') { (ops[i].op === '-' ? del : add).push(ops[i].line); i++; }
    const filteredAdd = add.filter((l) => l !== '}' && !/^export \{[^}]*\};?$/.test(l));
    for (let k = 0; k < Math.max(del.length, filteredAdd.length); k++) {
      const x = del[k], y = filteredAdd[k];
      if (x !== undefined && y !== undefined && shape(x) === shape(y)) continue;
      // Imports and re-exports a whole-program build elides as type-only.
      if (x !== undefined && y === undefined && /^(import|export) \{?/.test(x) && !/^export (default |const |let |var |function |class |async )/.test(x)) continue;
      if (x !== undefined && y !== undefined && /^import\b/.test(x) && /^import\b/.test(y)) continue;
      const names = (l: string) => /^export \{([^}]*)\}/.exec(l)?.[1].split(',').map((n) => n.trim()).filter(Boolean);
      if (x !== undefined && y !== undefined && names(x) && names(y) && names(y)!.every((n) => names(x)!.includes(n))) continue;
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
