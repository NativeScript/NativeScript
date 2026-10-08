#!/usr/bin/env node
// The kits' color-mix() against core's: random color-mix() expressions
// evaluated by the @csstools/css-color-parser core depends on (serializeRGB,
// then read back as core's Color reads rgba()), by kit/ColorMix.swift and by
// kit-android's ColorMix.kt on the host JVM.
//   node tests/color-mix/run.ts [count] [--swift | --kotlin]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { kotlinToolchain } from '../kotlin-toolchain.ts';

const here = dirname(fileURLToPath(import.meta.url));
const kit = resolve(here, '../../kit/Sources/NativeScriptKit');
const kitAndroid = resolve(here, '../../kit-android/src/main/kotlin/org/nativescript/kit');
const targets = process.argv.includes('--swift') ? ['swift'] : process.argv.includes('--kotlin') ? ['kotlin'] : ['swift', 'kotlin'];
const fromCore = createRequire(resolve(here, '../../recipes-vue/node_modules/@nativescript/core/package.json'));
const load = (name: string) => import(pathToFileURL(fromCore.resolve(name)).href);
const { color, serializeRGB } = await load('@csstools/css-color-parser');
const { parseComponentValue } = await load('@csstools/css-parser-algorithms');
const { tokenize } = await load('@csstools/css-tokenizer');

/** color-utils `argbFromColorMix`, with `argbFromRgbOrRgba` reading the serialization. */
function coreArgb(value: string): string {
  const data = color(parseComponentValue(tokenize({ css: value })));
  if (!data) return 'nil';
  const parts = serializeRGB(data).toString().replace(/rgba?\(/, '').replace(')', '').split(',');
  const [r, g, b] = parts.map((p: string) => parseFloat(p));
  const a = parts[3] ? Math.round(parseFloat(parts[3]) * 255) : 255;
  return String(((a & 0xff) * 0x01000000 + (r & 0xff) * 0x10000 + (g & 0xff) * 0x100 + (b & 0xff)) >>> 0);
}

let seed = 7;
const random = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const pick = <T>(list: T[]) => list[Math.floor(random() * list.length)];
const int = (n: number) => Math.floor(random() * n);
const colors: (() => string)[] = [
  () => `rgb(${int(256)}, ${int(256)}, ${int(256)})`,
  () => `rgba(${int(256)}, ${int(256)}, ${int(256)}, ${int(101) / 100})`,
  () => `rgb(${int(256)} ${int(256)} ${int(256)} / ${int(101)}%)`,
  () => '#' + int(16777216).toString(16).padStart(6, '0'),
  () => '#' + int(4096).toString(16).padStart(3, '0'),
  () => pick(['red', 'white', 'black', 'transparent', 'rebeccapurple', 'gray', 'skyblue', 'gold']),
  () => `hsl(${int(360)}, ${int(101)}%, ${int(101)}%)`,
  () => `oklch(${random().toFixed(3)} ${(random() * 0.37).toFixed(3)} ${(random() * 360).toFixed(2)})`,
  () => `oklab(${random().toFixed(3)} ${(random() * 0.8 - 0.4).toFixed(3)} ${(random() * 0.8 - 0.4).toFixed(3)})`,
  () => `lab(${(random() * 100).toFixed(2)} ${(random() * 250 - 125).toFixed(2)} ${(random() * 250 - 125).toFixed(2)})`,
];
const spaces = ['oklab', 'srgb', 'srgb-linear', 'oklch', 'lab', 'lch', 'hsl', 'hwb', 'xyz', 'xyz-d50', 'oklch longer hue', 'hsl increasing hue'];
const cases = ['color-mix(in oklab, rgb(255, 255, 255) 80%, transparent)', 'color-mix(in srgb, red 35%, blue)'];
for (let i = 0, count = Number(process.argv.slice(2).find((a) => !a.startsWith('--')) ?? 3000); i < count; i++) {
  const parts = Array.from({ length: random() < 0.9 ? 2 : 3 }, () => pick(colors)() + (random() < 0.4 ? '' : ` ${int(101)}%`));
  cases.push(`color-mix(in ${pick(spaces)}, ${parts.join(', ')})`);
}

const build = mkdtempSync(join(tmpdir(), 'ns-color-mix-'));
/** Each case's result from a kit's ColorMix, one line per case. */
function swiftResults(): string[] {
  const runtime = readdirSync(join(kit, 'Runtime')).filter((f) => f.endsWith('.swift')).map((f) => join(kit, 'Runtime', f));
  execFileSync('xcrun', ['swiftc', '-O', '-parse-as-library', '-o', join(build, 'mix'), join(here, 'main.swift'), join(kit, 'ColorMix.swift'), join(kit, 'JS.swift'), join(kit, 'Signals.swift'), ...runtime], { stdio: 'inherit' });
  return execFileSync(join(build, 'mix'), { input: cases.join('\n') + '\n' }).toString().trim().split('\n');
}

function kotlinResults(): string[] {
  const toolchain = kotlinToolchain();
  const runtime = readdirSync(join(kitAndroid, 'runtime')).filter((f) => f.endsWith('.kt')).map((f) => join(kitAndroid, 'runtime', f));
  const classes = join(build, 'kotlin');
  const r = toolchain.compile([join(here, 'main.kt'), join(kitAndroid, 'ColorMix.kt'), join(kitAndroid, 'Signals.kt'), ...runtime, '-d', classes, '-no-stdlib', '-nowarn', '-jvm-target', '17', '-cp', toolchain.stdlib]);
  if (r.status !== 0) throw new Error(`ColorMix.kt does not compile:\n${r.stderr}${r.stdout}`);
  return execFileSync('java', ['-cp', [classes, toolchain.stdlib].join(':'), 'MainKt'], { input: cases.join('\n') + '\n' }).toString().trim().split('\n');
}

try {
  let failed = 0;
  for (const target of targets) {
    const kitResults = target === 'swift' ? swiftResults() : kotlinResults();
    const failures = cases.filter((c, i) => kitResults[i] !== coreArgb(c));
    for (const c of failures.slice(0, 20)) console.log(`${c}: core ${coreArgb(c)}, kit ${kitResults[cases.indexOf(c)]}`);
    console.log(`${target}: ${cases.length - failures.length} of ${cases.length} color-mix() values identical`);
    failed += failures.length;
  }
  process.exitCode = failed ? 1 : 0;
} finally {
  rmSync(build, { recursive: true, force: true });
}
