// ns-compiled-verify: a compiled release and its JavaScript release run the same way on one simulator, and compared:
// a screenshot of each step pixel by pixel, and whether either stopped running.
//   ns-compiled-verify --js <JavaScript .app> --compiled <compiled .app> [--steps verify.json] [--out <dir>] [--device <udid>] [--tolerance <pixels>]
//
// Steps (verify.json), as points on the device's screen:
//   { "screens": [{ "name": "home", "steps": [["shot", "start"], ["tap", 200, 400], ["wait", 1], ["type", "Ada"], ["shot", "typed"]] }] }
// Each screen launches the app afresh. Without steps: one screen, a shot once it settles.
import { type ChildProcess, execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';
import { xcodegen } from './xcodegen.ts';

type Step = [string, ...(string | number)[]];
interface Screen { name: string; steps: Step[] }
interface Shot { screen: string; shot: string; differ: number; bbox: [number, number, number, number] | null }

const simctl = (...args: string[]) => execFileSync('xcrun', ['simctl', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const sleep = (s: number) => new Promise((done) => setTimeout(done, s * 1000));

/** The newest iOS simulator runtime and an iPhone it runs, as a device made for this run. */
function makeDevice(): string {
  const runtimes = JSON.parse(simctl('list', 'runtimes', '-j')).runtimes.filter((r: any) => r.platform === 'iOS' && r.isAvailable);
  const runtime = runtimes.sort((a: any, b: any) => a.version.localeCompare(b.version, undefined, { numeric: true })).pop();
  const phone = runtime?.supportedDeviceTypes.filter((d: any) => d.productFamily === 'iPhone').pop();
  if (!runtime || !phone) throw new Error('no iOS simulator runtime with an iPhone is installed');
  return simctl('create', 'ns-compiled-verify', phone.identifier, runtime.identifier).trim();
}

/** XCUITest serving taps and typing on the simulator, built once per version of its sources into the cache. */
class UIDriver {
  private dir = '';
  private n = 0;
  private child: ChildProcess | null = null;
  private udid: string;
  constructor(udid: string) {
    this.udid = udid;
  }

  private xctestrun(): string {
    const project = fileURLToPath(new URL('../verify/ui-driver', import.meta.url));
    const sources = ['project.yml', 'Host/App.swift', 'Tests/Driver.swift'].map((f) => readFileSync(join(project, f)));
    const cache = join(process.env.XDG_CACHE_HOME ?? join(homedir(), 'Library', 'Caches'), 'nativescript', 'ui-driver', createHash('sha256').update(Buffer.concat(sources)).digest('hex').slice(0, 12));
    const products = join(cache, 'build', 'Build', 'Products');
    const built = () => (existsSync(products) ? readdirSync(products).find((f) => f.endsWith('.xctestrun')) : undefined);
    if (!built()) {
      mkdirSync(cache, { recursive: true });
      execFileSync(xcodegen(), ['generate', '--quiet', '--spec', join(project, 'project.yml'), '--project', cache], { stdio: 'inherit' });
      execFileSync('xcodebuild', ['build-for-testing', '-project', join(cache, 'UIDriver.xcodeproj'), '-scheme', 'UIDriverTests', '-destination', 'generic/platform=iOS Simulator', '-derivedDataPath', join(cache, 'build'), '-quiet'], { stdio: 'inherit' });
    }
    return join(products, built()!);
  }

  async start(): Promise<void> {
    this.dir = join(process.env.TMPDIR ?? '/tmp', `ns-ui-driver-${this.udid}`);
    rmSync(this.dir, { recursive: true, force: true });
    mkdirSync(this.dir, { recursive: true });
    const child = this.child = spawn('xcodebuild', ['test-without-building', '-xctestrun', this.xctestrun(), '-destination', `id=${this.udid}`, '-only-testing:UIDriverTests/Driver/testServe'],
      { env: { ...process.env, TEST_RUNNER_DRIVER_DIR: this.dir }, stdio: 'ignore', detached: true });
    child.unref();
    for (let waited = 0; !existsSync(join(this.dir, 'ready')); waited += 0.3) {
      if (child.exitCode !== null || waited > 180) throw new Error(`the UI driver did not start on ${this.udid}`);
      await sleep(0.3);
    }
  }

  async send(command: Record<string, unknown>, timeout = 30): Promise<void> {
    const id = `${process.pid}-${String(++this.n).padStart(6, '0')}`;
    const tmp = join(this.dir, `.cmd-${id}`);
    writeFileSync(tmp, JSON.stringify(command));
    renameSync(tmp, join(this.dir, `cmd-${id}.json`));
    const done = join(this.dir, `done-${id}`);
    for (let waited = 0; !existsSync(done); waited += 0.02) {
      if (waited > timeout) throw new Error(`the UI driver did not answer ${JSON.stringify(command)}`);
      await sleep(0.02);
    }
    const result = readFileSync(done, 'utf8');
    rmSync(done);
    if (result !== 'ok') throw new Error(`${JSON.stringify(command)}: ${result}`);
  }

  /** A command, retried once on a new driver when it goes unanswered: XCUITest can wait on an app's idle state indefinitely. */
  async run(command: Record<string, unknown>): Promise<void> {
    try {
      await this.send(command);
    } catch (e) {
      if (!String(e).includes('did not answer')) throw e;
      this.kill();
      await this.start();
      await this.send(command);
    }
  }

  async stop(): Promise<void> {
    const answered = this.dir && existsSync(join(this.dir, 'ready')) && (await this.send({ op: 'stop' }, 10).then(() => true, () => false));
    if (!answered) this.kill();
  }

  /** Ends a driver that no longer answers: its xcodebuild and the runner it left on the device, which would otherwise hold the device. */
  private kill(): void {
    if (this.child?.pid && this.child.exitCode === null) try { process.kill(-this.child.pid, 'SIGKILL'); } catch {}
    this.child = null;
    try { simctl('terminate', this.udid, 'org.nativescript.uidriver.UIDriverTests.xctrunner'); } catch {}
  }
}

/** A PNG's pixels as RGBA, for the 8-bit RGB and RGBA images the simulator writes. */
export function decodePng(file: string): { width: number; height: number; rgba: Uint8Array } {
  const data = readFileSync(file);
  let at = 8, width = 0, height = 0, type = 0;
  const idat: Buffer[] = [];
  while (at < data.length) {
    const length = data.readUInt32BE(at), kind = data.toString('latin1', at + 4, at + 8), body = data.subarray(at + 8, at + 8 + length);
    if (kind === 'IHDR') {
      width = body.readUInt32BE(0); height = body.readUInt32BE(4); type = body[9];
      if (body[8] !== 8 || (type !== 2 && type !== 6) || body[12] !== 0) throw new Error(`${file}: only 8-bit RGB or RGBA PNGs without interlacing are read`);
    } else if (kind === 'IDAT') idat.push(body);
    else if (kind === 'IEND') break;
    at += 12 + length;
  }
  const bpp = type === 6 ? 4 : 3, stride = width * bpp, raw = inflateSync(Buffer.concat(idat)), out = new Uint8Array(width * height * 4);
  let prev = new Uint8Array(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), row = new Uint8Array(stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? row[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const predicted = filter === 1 ? a : filter === 2 ? b : filter === 3 ? (a + b) >> 1 : filter === 4 ? (pa <= pb && pa <= pc ? a : pb <= pc ? b : c) : 0;
      row[x] = (line[x] + predicted) & 0xff;
    }
    for (let x = 0; x < width; x++) {
      out.set([row[x * bpp], row[x * bpp + 1], row[x * bpp + 2], bpp === 4 ? row[x * bpp + 3] : 255], (y * width + x) * 4);
    }
    prev = row;
  }
  return { width, height, rgba: out };
}

/** How many pixels two screenshots differ in, and the box around them. */
export function comparePng(a: string, b: string): { differ: number; bbox: [number, number, number, number] | null } {
  const x = decodePng(a), y = decodePng(b);
  if (x.width !== y.width || x.height !== y.height) return { differ: x.width * x.height, bbox: [0, 0, x.width, x.height] };
  let differ = 0, x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  for (let i = 0; i < x.width * x.height; i++) {
    const k = i * 4;
    if (x.rgba[k] === y.rgba[k] && x.rgba[k + 1] === y.rgba[k + 1] && x.rgba[k + 2] === y.rgba[k + 2]) continue;
    differ++;
    const px = i % x.width, py = Math.floor(i / x.width);
    x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py);
  }
  return { differ, bbox: differ ? [x0, y0, x1 + 1, y1 + 1] : null };
}

/** Whether the app is still running on the device. */
function running(udid: string, bundle: string): boolean {
  return simctl('spawn', udid, 'launchctl', 'list').includes(`UIKitApplication:${bundle}`);
}

/** A screenshot once the screen stops changing (an animation finished), or after a few tries. */
async function settledShot(udid: string, file: string): Promise<void> {
  let previous: Buffer | null = null;
  for (let tries = 0; tries < 6; tries++) {
    simctl('io', udid, 'screenshot', file);
    const now = readFileSync(file);
    if (previous && now.equals(previous)) return;
    previous = now;
    await sleep(0.4);
  }
}

const bundleId = (app: string) => execFileSync('plutil', ['-extract', 'CFBundleIdentifier', 'raw', join(app, 'Info.plist')], { encoding: 'utf8' }).trim();

async function run(udid: string, driver: UIDriver, app: string, label: string, screens: Screen[], out: string, other: string): Promise<string[]> {
  const bundle = bundleId(app);
  // A build installed over another of the same id keeps the other's files.
  try { simctl('uninstall', udid, bundle); } catch {}
  simctl('install', udid, app);
  const crashes: string[] = [];
  for (const screen of screens) {
    // An app launched over another in front shows a back link to it in the status bar.
    for (const b of [bundle, other]) try { simctl('terminate', udid, b); } catch {}
    try {
      simctl('launch', udid, bundle);
    } catch {
      // Another tool can shut the device down (CoreDevice shuts every simulator down at times): boot it and retry
      // once; a driver it ended is restarted at its next unanswered command.
      try { simctl('boot', udid); } catch {}
      simctl('bootstatus', udid, '-b');
      simctl('launch', udid, bundle);
    }
    await sleep(2);
    for (const [op, ...args] of screen.steps) {
      if (op === 'shot') await settledShot(udid, join(out, `${label}-${screen.name}-${args[0]}.png`));
      else if (op === 'wait') await sleep(Number(args[0]));
      else if (op === 'tap') await driver.run({ op: 'tap', x: args[0], y: args[1], duration: args[2] ?? 0 });
      else if (op === 'taps') await driver.run({ op: 'taps', x: args[0], y: args[1], count: args[2] ?? 2 });
      else if (op === 'swipe') await driver.run({ op: 'swipe', x: args[0], y: args[1], toX: args[2], toY: args[3] });
      else if (op === 'drag') await driver.run({ op: 'drag', x: args[0], y: args[1], toX: args[2], toY: args[3], duration: args[4] ?? 0.5 });
      else if (op === 'type') await driver.run({ op: 'type', app: bundle, text: String(args[0]) });
      else if (op === 'openurl') simctl('openurl', udid, String(args[0]));
      else throw new Error(`${screen.name}: unknown step ${op}`);
    }
    if (!running(udid, bundle)) crashes.push(`${label} stopped running during ${screen.name}`);
  }
  try { simctl('terminate', udid, bundle); } catch {}
  return crashes;
}

export async function verify(o: { js: string; compiled: string; steps?: string; out: string; device?: string; tolerance: number }): Promise<boolean> {
  for (const app of [o.js, o.compiled]) if (!existsSync(join(app, 'Info.plist'))) throw new Error(`${app} is not a built .app`);
  const screens: Screen[] = o.steps ? JSON.parse(readFileSync(o.steps, 'utf8')).screens : [{ name: 'launch', steps: [['wait', 2], ['shot', 'screen']] }];
  mkdirSync(o.out, { recursive: true });
  const made = !o.device;
  const udid = o.device ?? makeDevice();
  const driver = new UIDriver(udid);
  try {
    try { simctl('boot', udid); } catch {}
    simctl('bootstatus', udid, '-b');
    // The clock and the signal would differ between two runs.
    simctl('status_bar', udid, 'override', '--time', '9:41', '--batteryState', 'charged', '--batteryLevel', '100', '--cellularBars', '4', '--wifiBars', '3');
    if (screens.some((s) => s.steps.some(([op]) => ['tap', 'taps', 'swipe', 'drag', 'type'].includes(op)))) await driver.start();
    const crashes = [...await run(udid, driver, o.js, 'js', screens, o.out, bundleId(o.compiled)), ...await run(udid, driver, o.compiled, 'compiled', screens, o.out, bundleId(o.js))];
    const shots: Shot[] = [];
    for (const screen of screens) {
      for (const [op, name] of screen.steps) {
        if (op !== 'shot') continue;
        const { differ, bbox } = comparePng(join(o.out, `js-${screen.name}-${name}.png`), join(o.out, `compiled-${screen.name}-${name}.png`));
        shots.push({ screen: screen.name, shot: String(name), differ, bbox });
        console.log(`${screen.name} ${name}: ${differ} pixels differ${bbox ? `, bbox (${bbox.join(', ')})` : ''}`);
      }
    }
    for (const c of crashes) console.log(c);
    writeFileSync(join(o.out, 'report.json'), JSON.stringify({ shots, crashes }, null, 2));
    const ok = !crashes.length && shots.every((s) => s.differ <= o.tolerance);
    console.log(ok ? `the compiled release matches its JavaScript release (${shots.length} shots)` : `differences: see the screenshots in ${o.out}`);
    return ok;
  } finally {
    await driver.stop();
    try { simctl('status_bar', udid, 'clear'); } catch {}
    if (made) { try { simctl('shutdown', udid); } catch {} try { simctl('delete', udid); } catch {} }
  }
}

// Run as a command (through bin/ns-compiled-verify.js or directly), not when imported.
const entry = process.argv[1] ? resolve(process.argv[1]) : '';
if (entry === fileURLToPath(import.meta.url) || entry.endsWith('ns-compiled-verify.js')) {
  const args = process.argv.slice(2);
  const opt = (name: string) => { const k = args.indexOf(name); return k >= 0 ? args[k + 1] : undefined; };
  const js = opt('--js'), compiled = opt('--compiled');
  if (!js || !compiled) {
    console.error('ns-compiled-verify --js <JavaScript .app> --compiled <compiled .app> [--steps verify.json] [--out <dir>] [--device <udid>] [--tolerance <pixels>]');
    process.exit(2);
  }
  const ok = await verify({ js: resolve(js), compiled: resolve(compiled), steps: opt('--steps'), out: resolve(opt('--out') ?? 'verify-output'), device: opt('--device'), tolerance: Number(opt('--tolerance') ?? 0) });
  process.exit(ok ? 0 : 1);
}
