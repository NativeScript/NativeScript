// Results of building and running a test program, stored by a hash of everything that decides the program and what
// it prints, so that a harness skips the build and the run when nothing they depend on changed. The harness builds the
// key from the parts below and decides which results may be stored; a result that timed out or was killed never is.
//   $NS_DIFF_CACHE: the cache's folder (default ~/Library/Caches/ns-diff-cache, or $XDG_CACHE_HOME/ns-diff-cache off macOS).
import { createHash } from 'node:crypto';
import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, renameSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs';
import { arch, homedir, platform, release, version } from 'node:os';
import { join, relative } from 'node:path';
import { kotlinToolchain } from './kotlin-toolchain.ts';

export const cacheRoot = process.env.NS_DIFF_CACHE ?? (platform() === 'darwin' ? join(homedir(), 'Library/Caches/ns-diff-cache') : join(process.env.XDG_CACHE_HOME ?? join(homedir(), '.cache'), 'ns-diff-cache'));

/**
 * What a build and run gave: the program's output and exit, or `error` (the build's errors) when there was nothing to run.
 * An `unsettled` one timed out, was killed or could not start, and is never stored.
 */
export interface Outcome { stdout: string; stderr: string; status: number | null; signal?: string | null; error?: string; unsettled?: boolean }

export const failedBuild = (error: string): Outcome => ({ stdout: '', stderr: '', status: null, error });

export function outcomeOf(r: SpawnSyncReturns<string>): Outcome {
  const unsettled = !!r.error || (!!r.signal && ['SIGTERM', 'SIGKILL', 'SIGINT', 'SIGHUP'].includes(r.signal));
  return { stdout: r.stdout ?? '', stderr: r.stderr ?? '', status: r.status, signal: r.signal, ...(unsettled ? { unsettled } : {}) };
}

/** One hash of the parts in order; each is length-prefixed, so no two different lists give the same text. */
export function hash(...parts: (string | Buffer)[]): string {
  const h = createHash('sha256');
  for (const p of parts) h.update(`${Buffer.byteLength(p)}:`).update(p);
  return h.digest('hex');
}

/** The files' names and contents. */
export function hashFiles(files: string[]): string {
  return hash(...[...files].sort().flatMap((f) => [f, readFileSync(f)]));
}

/** Every file under `dir`, by its path relative to it. */
export function hashDir(dir: string): string {
  const files = (readdirSync(dir, { recursive: true }) as string[]).map((f) => join(dir, f)).filter((f) => statSync(f).isFile()).sort();
  return hash(...files.flatMap((f) => [relative(dir, f), readFileSync(f)]));
}

const probes = new Map<string, string>();
/** A command's output and status, run once per process; a command that cannot run says so (and so keys differently). */
export function probe(cmd: string, args: string[]): string {
  const id = [cmd, ...args].join('\0');
  if (!probes.has(id)) {
    const r = spawnSync(cmd, args, { encoding: 'utf8' });
    probes.set(id, r.error ? `${cmd}: ${r.error.message}` : `${r.status}\n${r.stdout}\n${r.stderr}`);
  }
  return probes.get(id)!;
}

/** The variables that change what the compilers, the runtimes or the programs do (time zone and locale included). */
const ENV = /^(TZ|LANG|LC_\w+|NS_KIT_\w+|NODE_OPTIONS|JAVA_HOME|JAVA_TOOL_OPTIONS|_JAVA_OPTIONS|JDK_JAVA_OPTIONS|DEVELOPER_DIR|SDKROOT|TOOLCHAINS)$/;

/** The host: OS, architecture, the environment above and the time zone a program without TZ gets. */
export function host(): string {
  const env = Object.keys(process.env).filter((k) => ENV.test(k)).sort().map((k) => `${k}=${process.env[k]}`);
  return [platform(), arch(), release(), version(), Intl.DateTimeFormat().resolvedOptions().timeZone, ...env].join('\n');
}

/** swiftc and the SDK `xcrun` selects. */
export const swiftToolchain = () =>
  [['--find', 'swiftc'], ['swiftc', '--version'], ['swiftc', '-print-target-info'], ['--show-sdk-path'], ['--show-sdk-version'], ['--show-sdk-build-version']].map((a) => probe('xcrun', a)).join('\n');

/** The `java` on PATH, which runs programs (and kotlinc, when it comes from Gradle's cache). Other properties, such as the compressed-oops mode, vary run to run. */
export const javaRuntime = () => probe('java', ['-XshowSettings:properties', '-version']).split('\n').filter((l) => /^\s*(java\.home|java\.runtime\.version|java\.vendor\.version|java\.vm\.name|os\.arch) =/.test(l)).join('\n');

/** kotlinc's version (and the JVM it runs on) and the standard library, as kotlin-toolchain.ts finds them. */
export function kotlinCompiler(): string {
  if (!probes.has('kotlinc')) {
    const t = kotlinToolchain();
    const r = t.compile(['-version']);
    probes.set('kotlinc', [r.status, ...(r.stderr + r.stdout).split('\n').filter((l) => /kotlinc/.test(l)), t.stdlib, hashFiles([t.stdlib])].join('\n'));
  }
  return probes.get('kotlinc')!;
}

/** The `node` on PATH, which runs the reference programs. */
export const nodeRuntime = () => probe('node', ['-p', 'process.version + " " + process.arch + " " + process.execPath']);

/**
 * Entries for one backend, one JSON file per key under `<cacheRoot>/<backend>`. `paths` (name → absolute path) are kept
 * as names in stored text, so an entry made in one build folder reads back with another's paths. With `read` false,
 * nothing is found and results are still stored.
 */
export class BuildCache {
  readonly backend: string;
  readonly dir: string;
  hits = 0;
  misses = 0;
  private readonly read: boolean;
  private readonly paths: [string, string][];

  constructor(backend: string, o: { read: boolean; paths?: Record<string, string> }) {
    this.backend = backend;
    this.read = o.read;
    this.dir = join(cacheRoot, backend);
    mkdirSync(this.dir, { recursive: true });
    const all = Object.entries(o.paths ?? {}).flatMap(([name, p]) => [[`<ns-cache:${name}>`, p], ...(existsSync(p) && realpathSync(p) !== p ? [[`<ns-cache:${name}>`, realpathSync(p)]] : [])] as [string, string][]);
    // Longest first: one path may lie inside another.
    this.paths = all.sort((a, b) => b[1].length - a[1].length);
    this.prune();
  }

  private file = (key: string) => join(this.dir, key + '.json');

  get(key: string): Outcome | null {
    if (this.read) {
      try {
        const text = readFileSync(this.file(key), 'utf8');
        const outcome: Outcome = JSON.parse(this.paths.reduce((t, [name, p]) => t.replaceAll(JSON.stringify(name).slice(1, -1), JSON.stringify(p).slice(1, -1)), text));
        const now = new Date();
        utimesSync(this.file(key), now, now);
        this.hits++;
        return outcome;
      } catch {}
    }
    this.misses++;
    return null;
  }

  put(key: string, outcome: Outcome): void {
    if (outcome.unsettled) return;
    const text = this.paths.reduce((t, [name, p]) => t.replaceAll(JSON.stringify(p).slice(1, -1), JSON.stringify(name).slice(1, -1)), JSON.stringify(outcome));
    // Written whole and renamed, so a concurrent run never reads a partial entry.
    const tmp = `${this.file(key)}.${process.pid}.tmp`;
    writeFileSync(tmp, text);
    renameSync(tmp, this.file(key));
  }

  /** Entries not read or written in 30 days go, checked once a day. */
  private prune() {
    const stamp = join(this.dir, '.pruned');
    const day = 24 * 3600 * 1000;
    if (existsSync(stamp) && Date.now() - statSync(stamp).mtimeMs < day) return;
    writeFileSync(stamp, '');
    for (const f of readdirSync(this.dir)) {
      if (!f.endsWith('.json') && !f.endsWith('.tmp')) continue;
      try { if (Date.now() - statSync(join(this.dir, f)).mtimeMs > (f.endsWith('.tmp') ? day : 30 * day)) rmSync(join(this.dir, f), { force: true }); } catch {}
    }
  }

  summary = () => `${this.backend} ${this.hits} hit, ${this.misses} missed`;
}
