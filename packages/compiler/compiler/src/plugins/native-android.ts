import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { archiveClasses } from '../natives/classfiles.ts';
import type { PluginSource } from './source.ts';

/**
 * The Android code plugins ship in `platforms/android`, built as the
 * NativeScript CLI builds it: the plugin's manifest, `java/` and `res/` as an
 * Android library, `<short name>.aar` (the package's name after its scope,
 * `-` as `_`), which stands in for a shipped AAR of that name. Any other AAR
 * or jar it ships is linked as it is. A built AAR is cached by a hash of the
 * plugin's `platforms/android` and the toolchain.
 *
 * `include.gradle` is read, not applied: the app's build takes the
 * dependencies, repositories and minimum SDK it declares, and anything else
 * in it stops the build. Its `dependencies` and `repositories` blocks are
 * applied as they are to the plugin's own library build, with `-PtempBuild`
 * and `USER_PROJECT_ROOT` (the app) as the CLI sets them.
 */
export interface PluginNativeAndroid {
  /** The AARs and jars the app links (absolute). */
  archives: string[];
  /** The Maven dependencies the plugins declare, as the app declares them. */
  dependencies: { configuration: 'implementation' | 'compileOnly' | 'runtimeOnly'; coords: string }[];
  /** Maven repositories the plugins declare beyond Google's and Maven Central. */
  repositories: string[];
  /** The app's minimum SDK: the kit's, or the highest a plugin asks for. */
  minSdk: number;
  /** R8 rules keeping every class the plugins ship: the app's code reaches them by name. */
  keepRules: string[];
}

export interface AndroidPluginOptions {
  app: string;
  cache?: string;
  say?: (message: string) => void;
}

/** What the plugin libraries are built with: the generated app's (android.ts). */
const AGP = '8.12.1', KOTLIN = '2.2.20', COMPILE_SDK = 36, KIT_MIN_SDK = 24;
const RECIPE = `agp ${AGP}, kotlin ${KOTLIN}, compileSdk ${COMPILE_SDK}, jvm 17, 1`;
const DEFAULT_CACHE = join(homedir(), '.cache', 'ns-native', 'android-plugins');
const GRADLE_CACHE = join(homedir(), '.gradle', 'caches', 'modules-2', 'files-2.1');
const kit = resolve(dirname(new URL(import.meta.url).pathname), '../../../kit-android');

/** Read by the NativeScript runtime's metadata generator and the CLI's livesync, not by a build. */
const IGNORED = /^(native-api-usage\.json|sync|\.DS_Store|.*\.md)$/i;

interface Library {
  source: PluginSource;
  namespace: string;
  manifest: string;
  sourceSets: string[];
  include: IncludeGradle | null;
  aar: string;
}

export function pluginNativeAndroid(sources: PluginSource[], options: AndroidPluginOptions): PluginNativeAndroid {
  const cache = options.cache ?? DEFAULT_CACHE;
  const errors: string[] = [];
  const archives: string[] = [];
  const includes: IncludeGradle[] = [];
  const libraries: Library[] = [];
  for (const source of [...sources].sort((a, b) => a.name.localeCompare(b.name))) {
    const dir = join(source.dir, 'platforms', 'android');
    if (!existsSync(dir)) continue;
    const fail = (file: string, why: string) => errors.push(`${source.name}@${source.version}: ${relative(source.dir, file)}: ${why}`);
    const short = source.name.split('/').pop()!.replace(/-/g, '_');
    const replaced = join(dir, `${short}.aar`);
    let manifest: string | null = null, includeFile: string | null = null;
    const sourceSets: string[] = [], shipped: string[] = [];
    const walk = (d: string) => {
      for (const f of readdirSync(d).sort()) {
        const p = join(d, f);
        const top = d === dir;
        if (statSync(p).isDirectory()) {
          if (f === 'java' || f === 'res') sourceSets.push(p);
          else if (f === 'assets' || f === 'jniLibs' || f === 'cpp') fail(p, `${f}/ is not supported yet`);
          else walk(p);
        } else if (IGNORED.test(f)) continue;
        else if (top && f === 'AndroidManifest.xml') manifest = p;
        else if (top && f === 'include.gradle') includeFile = p;
        else if (/\.(aar|jar)$/.test(f)) shipped.push(p);
        else if (/^(buildscript|rootbuildscript|include-settings|before-plugins)\.gradle$/.test(f)) fail(p, 'is not supported yet');
        else if (f.endsWith('.so')) fail(p, 'native libraries are not supported yet');
        else fail(p, 'not a file the build knows what to do with');
      }
    };
    walk(dir);
    let include: IncludeGradle | null = null;
    if (includeFile) {
      try {
        include = parseIncludeGradle(readFileSync(includeFile, 'utf8'));
        includes.push(include);
      } catch (e) {
        fail(includeFile, (e as Error).message);
      }
    }
    // The CLI builds a library only from a manifest or sources; without either, a shipped AAR of its name is the plugin's.
    if (!manifest && !sourceSets.length) {
      archives.push(...shipped);
      continue;
    }
    archives.push(...shipped.filter((a) => a !== replaced));
    const manifestText = manifest ? readFileSync(manifest, 'utf8') : '<manifest xmlns:android="http://schemas.android.com/apk/res/android"/>\n';
    const namespace = /<manifest\b[^>]*?\spackage\s*=\s*"([^"]+)"/.exec(manifestText)?.[1] ?? `org.nativescript.${short}`;
    const key = libraryHash(dir, replaced);
    const aar = join(cache, `${source.name.replace(/^@/, '').replace(/\//g, '+')}@${source.version}-${key}`, `${short}.aar`);
    libraries.push({ source, namespace, manifest: manifestText.replace(/(<manifest\b[^>]*?)\s+package\s*=\s*"[^"]*"/, '$1'), sourceSets, include, aar });
  }
  if (errors.length) throw new Error(`plugins' Android code that cannot be built yet:\n  ${errors.join('\n  ')}`);

  const dependencies = includes.flatMap((i) => i.dependencies);
  // A cached AAR is rebuilt when a dependency it declares is not in Gradle's cache: the translation reads its classes from there.
  const stale = libraries.filter((l) => !existsSync(l.aar) || l.include?.dependencies.some((d) => !inGradleCache(d.coords)));
  if (stale.length) buildLibraries(stale, options);
  archives.push(...libraries.map((l) => l.aar));

  return {
    archives,
    dependencies: [...new Map(dependencies.map((d) => [`${d.configuration} ${d.coords}`, d])).values()],
    repositories: [...new Set(includes.flatMap((i) => i.repositories))],
    minSdk: Math.max(KIT_MIN_SDK, ...includes.map((i) => i.minSdk ?? 0)),
    keepRules: topPackages(archives.flatMap(archiveClasses)).map(keepRule),
  };
}

function keepRule(p: string): string {
  return p.endsWith('/') ? `-keep class ${p.slice(0, -1).replace(/\//g, '.')}.** { *; }` : `-keep class ${p} { *; }`;
}

/** The outermost packages holding the classes (`com/a/` for `com/a/X` and `com/a/b/Y`), and classes of the default package. */
function topPackages(classes: string[]): string[] {
  const packages = [...new Set(classes.map((c) => (c.includes('/') ? c.slice(0, c.lastIndexOf('/') + 1) : c)))].sort();
  return packages.filter((p) => !packages.some((q) => q !== p && q.endsWith('/') && p.startsWith(q)));
}

function libraryHash(dir: string, replaced: string): string {
  const h = createHash('sha256').update(RECIPE).update('\0');
  const files = readdirSync(dir, { recursive: true, withFileTypes: true }).filter((e) => e.isFile()).map((e) => join(e.parentPath, e.name)).filter((f) => f !== replaced).sort();
  for (const f of files) h.update(relative(dir, f)).update('\0').update(readFileSync(f)).update('\0');
  return h.digest('hex').slice(0, 16);
}

function inGradleCache(coords: string): boolean {
  const [group, artifact, version] = coords.split(':');
  return !version || /[+\[\]()]/.test(version) || existsSync(join(GRADLE_CACHE, group, artifact, version));
}

/** One Gradle build of every library not in the cache, a subproject each, with the kit's wrapper. */
function buildLibraries(libraries: Library[], options: AndroidPluginOptions) {
  const cache = options.cache ?? DEFAULT_CACHE;
  mkdirSync(cache, { recursive: true });
  const root = mkdtempSync(join(cache, '.build-'));
  try {
    const q = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
    writeFileSync(join(root, 'settings.gradle'), `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
    plugins {
        id 'com.android.library' version '${AGP}'
        id 'org.jetbrains.kotlin.android' version '${KOTLIN}'
        id 'org.jetbrains.kotlin.plugin.parcelize' version '${KOTLIN}'
    }
}
rootProject.name = 'ns-native-plugins'
${libraries.map((_, i) => `include ':p${i}'\n`).join('')}`);
    writeFileSync(join(root, 'gradle.properties'), 'org.gradle.jvmargs=-Xmx4g -Dfile.encoding=UTF-8\nandroid.useAndroidX=true\n');
    libraries.forEach((l, i) => {
      const project = join(root, `p${i}`);
      const main = join(project, 'src', 'main');
      mkdirSync(main, { recursive: true });
      writeFileSync(join(main, 'AndroidManifest.xml'), l.manifest);
      for (const set of l.sourceSets) cpSync(set, join(main, set.split(/[/\\]/).pop()!), { recursive: true });
      writeFileSync(join(project, 'build.gradle'), `${l.include?.imports.join('\n') ?? ''}
plugins {
    id 'com.android.library'
    id 'org.jetbrains.kotlin.android'
    id 'org.jetbrains.kotlin.plugin.parcelize'
}

ext.USER_PROJECT_ROOT = ${q(resolve(options.app))}

android {
    namespace ${q(l.namespace)}
    compileSdk ${COMPILE_SDK}
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

kotlin {
    compilerOptions { jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17 }
}

repositories {
    google()
    mavenCentral()
}

${l.include?.libraryBlocks.join('\n\n') ?? ''}
`);
    });
    options.say?.(`building the Android code of ${libraries.map((l) => `${l.source.name}@${l.source.version}`).join(', ')}`);
    try {
      execFileSync(join(kit, 'gradlew'), ['-p', root, 'assembleRelease', '-PtempBuild=true', '--quiet'], { stdio: 'inherit' });
    } catch {
      throw new Error(`the Android code of ${libraries.map((l, i) => `${l.source.name} (:p${i})`).join(', ')} did not build (Gradle's output is above)`);
    }
    libraries.forEach((l, i) => {
      const built = join(root, `p${i}`, 'build', 'outputs', 'aar', `p${i}-release.aar`);
      if (!existsSync(built)) throw new Error(`${l.source.name}: its Android library built no AAR at ${built}`);
      mkdirSync(dirname(l.aar), { recursive: true });
      cpSync(built, l.aar + '.tmp');
      renameSync(l.aar + '.tmp', l.aar);
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------- include.gradle

export interface IncludeGradle {
  dependencies: PluginNativeAndroid['dependencies'];
  /** Repository URLs beyond Google's and Maven Central. */
  repositories: string[];
  minSdk: number | null;
  /** Its `import` lines and its `dependencies` and `repositories` blocks as written, for the plugin's own build. */
  imports: string[];
  libraryBlocks: string[];
}

interface Token { kind: 'id' | 'str' | 'num' | 'punct' | 'nl' | 'end'; text: string; line: number; start: number; end: number; interpolated?: boolean }

const CONFIGURATIONS: Record<string, PluginNativeAndroid['dependencies'][number]['configuration']> = { implementation: 'implementation', api: 'implementation', compileOnly: 'compileOnly', runtimeOnly: 'runtimeOnly' };
const KNOWN_REPOSITORIES = new Set(['google', 'mavenCentral']);

/**
 * The parts of an include.gradle the app's build takes: `dependencies` of
 * `implementation`/`api`/`compileOnly`/`runtimeOnly` coordinates, `repositories`
 * (`google()`, `mavenCentral()`, `maven { url … }`) and
 * `android { defaultConfig { minSdkVersion N } }`. A branch on
 * `project.hasProperty("tempBuild")` is the plugin's own build's, and skipped.
 * Anything else throws, naming its line.
 */
export function parseIncludeGradle(text: string): IncludeGradle {
  const tokens = lex(text);
  const lines = text.split('\n');
  let i = 0;
  const out: IncludeGradle = { dependencies: [], repositories: [], minSdk: null, imports: [], libraryBlocks: [] };
  const peek = (k = 0) => tokens[Math.min(i + k, tokens.length - 1)];
  const is = (t: Token, kind: Token['kind'], text?: string) => t.kind === kind && (text === undefined || t.text === text);
  const unsupported = (t: Token): never => {
    throw new Error(`line ${t.line}: \`${lines[t.line - 1].trim()}\` would change the app's build; only dependencies, repositories and minSdkVersion are read from include.gradle so far`);
  };
  const expect = (kind: Token['kind'], text?: string) => {
    const t = peek();
    if (!is(t, kind, text)) unsupported(t);
    i++;
    return t;
  };
  const skipBreaks = () => { while (is(peek(), 'nl') || is(peek(), 'punct', ';')) i++; };
  const endOfStatement = () => {
    const t = peek();
    if (!(is(t, 'nl') || is(t, 'punct', ';') || is(t, 'punct', '}') || is(t, 'end'))) unsupported(t);
  };
  /** Past the block opening at the current `{`; returns its closing brace. */
  const skipBlock = (): Token => {
    expect('punct', '{');
    for (let depth = 1; ; i++) {
      const t = peek();
      if (is(t, 'end')) unsupported(t);
      if (is(t, 'punct', '{')) depth++;
      if (is(t, 'punct', '}') && --depth === 0) { i++; return t; }
    }
  };
  const blockOf = (name: string) => is(peek(), 'id', name) && nextSignificant(tokens, i + 1)?.text === '{';
  const tempBuildBranch = () => {
    const want = ['if', '(', 'project', '.', 'hasProperty', '(', null, ')', ')'];
    if (!want.every((w, k) => (w === null ? is(peek(k), 'str') && peek(k).text === 'tempBuild' : peek(k).text === w))) return false;
    i += want.length;
    skipBreaks();
    skipBlock();
    let k = i;
    while (is(tokens[k], 'nl')) k++;
    if (is(tokens[k], 'id', 'else')) unsupported(tokens[k]);
    return true;
  };
  /** Statements up to the closing brace of a block whose `{` is next, each handled by `statement`. */
  const statements = (statement: (t: Token) => void): Token => {
    skipBreaks();
    expect('punct', '{');
    for (;;) {
      skipBreaks();
      const t = peek();
      if (is(t, 'punct', '}')) { i++; return t; }
      if (is(t, 'end')) unsupported(t);
      if (!tempBuildBranch()) { statement(t); endOfStatement(); }
    }
  };
  const literal = (t: Token) => {
    if (t.kind !== 'str' || t.interpolated) unsupported(t);
    return t.text;
  };
  const stringArgument = () => {
    if (is(peek(), 'punct', '(')) { i++; const s = literal(expect('str')); expect('punct', ')'); return s; }
    return literal(expect('str'));
  };

  for (;;) {
    skipBreaks();
    const t = peek();
    if (is(t, 'end')) break;
    if (is(t, 'id', 'import')) {
      while (!is(peek(), 'nl') && !is(peek(), 'end')) i++;
      out.imports.push(text.slice(t.start, tokens[i - 1].end));
    } else if (blockOf('dependencies')) {
      i++;
      const close = statements((s) => {
        const configuration = CONFIGURATIONS[s.text];
        if (!is(s, 'id') || !configuration) unsupported(s);
        i++;
        const coords = stringArgument();
        if (!/^[\w.-]+:[\w.-]+:[^:\s]+$/.test(coords)) unsupported(s);
        out.dependencies.push({ configuration, coords });
      });
      out.libraryBlocks.push(text.slice(t.start, close.end));
    } else if (blockOf('repositories')) {
      i++;
      const close = statements((s) => {
        if (is(s, 'id') && KNOWN_REPOSITORIES.has(s.text)) { i++; expect('punct', '('); expect('punct', ')'); return; }
        if (!is(s, 'id', 'maven')) unsupported(s);
        i++;
        let url: string | null = null;
        statements((m) => {
          if (!is(m, 'id', 'url') || url) unsupported(m);
          i++;
          if (is(peek(), 'punct', '=')) i++;
          if (is(peek(), 'id', 'uri')) i++;
          url = stringArgument();
        });
        if (!url) unsupported(s);
        out.repositories.push(url!);
      });
      out.libraryBlocks.push(text.slice(t.start, close.end));
    } else if (blockOf('android')) {
      i++;
      statements((s) => {
        if (!is(s, 'id', 'defaultConfig')) unsupported(s);
        i++;
        statements((d) => {
          if (!is(d, 'id', 'minSdkVersion') && !is(d, 'id', 'minSdk')) unsupported(d);
          i++;
          if (is(peek(), 'punct', '=')) i++;
          const paren = is(peek(), 'punct', '(');
          if (paren) i++;
          out.minSdk = Math.max(out.minSdk ?? 0, Number(expect('num').text));
          if (paren) expect('punct', ')');
        });
      });
    } else if (!tempBuildBranch()) unsupported(t);
  }
  return out;
}

function nextSignificant(tokens: Token[], from: number): Token | undefined {
  while (tokens[from]?.kind === 'nl') from++;
  return tokens[from];
}

/** Groovy's tokens as far as include.gradle needs them: comments dropped, strings unquoted. */
function lex(text: string): Token[] {
  const tokens: Token[] = [];
  let line = 1;
  for (let i = 0; i < text.length; ) {
    const c = text[i];
    const start = i;
    if (c === '\n') { tokens.push({ kind: 'nl', text: c, line, start, end: ++i }); line++; continue; }
    if (/\s/.test(c)) { i++; continue; }
    if (text.startsWith('//', i)) { while (i < text.length && text[i] !== '\n') i++; continue; }
    if (text.startsWith('/*', i)) {
      const end = text.indexOf('*/', i + 2);
      i = end < 0 ? text.length : end + 2;
      line += (text.slice(start, i).match(/\n/g) ?? []).length;
      continue;
    }
    if (c === '"' || c === "'") {
      const first = line;
      const quote = text.startsWith(c.repeat(3), i) ? c.repeat(3) : c;
      i += quote.length;
      let value = '';
      while (i < text.length && !text.startsWith(quote, i)) {
        if (text[i] === '\\') { value += text[i + 1] ?? ''; i += 2; continue; }
        if (text[i] === '\n') line++;
        value += text[i++];
      }
      i += quote.length;
      tokens.push({ kind: 'str', text: value, line: first, start, end: i, interpolated: c === '"' && value.includes('$') });
      continue;
    }
    const word = /^[A-Za-z_$][\w$]*/.exec(text.slice(i, i + 200));
    if (word) { i += word[0].length; tokens.push({ kind: 'id', text: word[0], line, start, end: i }); continue; }
    const num = /^\d+/.exec(text.slice(i, i + 50));
    if (num) { i += num[0].length; tokens.push({ kind: 'num', text: num[0], line, start, end: i }); continue; }
    tokens.push({ kind: 'punct', text: c, line, start, end: ++i });
  }
  tokens.push({ kind: 'end', text: '', line, start: text.length, end: text.length });
  return tokens;
}
