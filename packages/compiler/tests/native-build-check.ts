#!/usr/bin/env node
// Checks of tests/native-build.ts itself, on both backends, for what the diff cases cannot cover: Node
// resolves no extensionless import, so a platform file (`./clock` read as clock.ios.ts) is checked here.
//   node tests/native-build-check.ts
// Build products go to $NS_DIFF_BUILD/native-build-check (default: <tmp>/ns-native-diff), the runtimes to $NS_DIFF_BUILD.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildKotlinRuntime, buildSwiftRuntime, kotlinc, kotlinMain, kotlinStdlib, swiftc, swiftMain, translateKotlin, translateSwift } from './native-build.ts';

// The runtimes are the diff run's, built there once.
const runtimes = process.env.NS_DIFF_BUILD ?? join(tmpdir(), 'ns-native-diff');
const build = join(runtimes, 'native-build-check');
const src = join(build, 'src');
rmSync(build, { recursive: true, force: true });
mkdirSync(src, { recursive: true });
writeFileSync(join(src, 'app.ts'), "import { which } from './clock';\nconsole.log(which());\n");
writeFileSync(join(src, 'clock.ts'), "export function which(): string { return 'shared'; }\n");
writeFileSync(join(src, 'clock.ios.ts'), "export function which(): string { return 'ios'; }\n");
writeFileSync(join(src, 'clock.android.ts'), "export function which(): string { return 'android'; }\n");

let failed = 0;
const check = (what: string, run: () => string, expected: string) => {
  let got: string;
  try { got = run(); } catch (e) { got = `threw ${(e as Error).message.split('\n')[0]}`; }
  if (got === expected) console.log(`✓ ${what}`);
  else { failed++; console.log(`✗ ${what}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(got)}`); }
};

check('a platform file is the module an extensionless import reads (swift)', () => {
  buildSwiftRuntime(runtimes, '-Onone');
  const out = join(build, 'swift');
  const modules = translateSwift([join(src, 'app.ts')], out);
  writeFileSync(join(out, 'main.swift'), swiftMain(modules));
  const errors = swiftc(readdirSync(out).map((f) => join(out, f)), join(build, 'swift-main'), runtimes, '-Onone');
  if (errors) throw new Error(errors[0]);
  return spawnSync(join(build, 'swift-main'), { encoding: 'utf8' }).stdout.trim();
}, 'ios');

check('a platform file is the module an extensionless import reads (kotlin)', () => {
  const runtime = buildKotlinRuntime(runtimes);
  const out = join(build, 'kotlin');
  const modules = translateKotlin([join(src, 'app.ts')], out, 'check');
  writeFileSync(join(out, '__Main.kt'), kotlinMain(modules, 'check'));
  const classes = join(build, 'kotlin-classes');
  const errors = kotlinc(readdirSync(out).map((f) => join(out, f)), classes, [runtime]);
  if (errors) throw new Error(errors[0]);
  return spawnSync('java', ['-cp', [classes, runtime, kotlinStdlib()].join(':'), 'check.entry.__MainKt'], { encoding: 'utf8' }).stdout.trim();
}, 'android');

if (!process.argv.includes('--keep')) rmSync(build, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
