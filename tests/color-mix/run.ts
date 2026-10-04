#!/usr/bin/env node
// The kit's color-mix() against core's: random color-mix() expressions
// evaluated by the @csstools/css-color-parser core depends on (serializeRGB,
// then read back as core's Color reads rgba()), and by kit/ColorMix.swift.
//   node tests/color-mix/run.ts [count]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const kit = resolve(here, '../../kit/Sources/NativeScriptKit');
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
for (let i = 0, count = Number(process.argv[2] ?? 3000); i < count; i++) {
  const parts = Array.from({ length: random() < 0.9 ? 2 : 3 }, () => pick(colors)() + (random() < 0.4 ? '' : ` ${int(101)}%`));
  cases.push(`color-mix(in ${pick(spaces)}, ${parts.join(', ')})`);
}

const build = mkdtempSync(join(tmpdir(), 'ns-color-mix-'));
try {
  const runtime = readdirSync(join(kit, 'Runtime')).filter((f) => f.endsWith('.swift')).map((f) => join(kit, 'Runtime', f));
  execFileSync('xcrun', ['swiftc', '-O', '-parse-as-library', '-o', join(build, 'mix'), join(here, 'main.swift'), join(kit, 'ColorMix.swift'), join(kit, 'JS.swift'), join(kit, 'Signals.swift'), ...runtime], { stdio: 'inherit' });
  const kitResults = execFileSync(join(build, 'mix'), { input: cases.join('\n') + '\n' }).toString().trim().split('\n');
  const failures = cases.filter((c, i) => kitResults[i] !== coreArgb(c));
  for (const c of failures.slice(0, 20)) console.log(`${c}: core ${coreArgb(c)}, kit ${kitResults[cases.indexOf(c)]}`);
  console.log(`${cases.length - failures.length} of ${cases.length} color-mix() values identical`);
  process.exitCode = failures.length ? 1 : 0;
} finally {
  rmSync(build, { recursive: true, force: true });
}
