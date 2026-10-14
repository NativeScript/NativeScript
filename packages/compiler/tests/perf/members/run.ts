#!/usr/bin/env node
// Host micro-benchmarks of view property access through core's property system, translated as the kit generated
// from core is (lenient, library mode) and built optimized: Swift at -Osize, whole-module, as a release links the
// kit; Kotlin on the host JVM. Node (`--jitless` for iOS, with its JIT for Android) is the reference.
//   views.ts    members as script names them (`label.text = …`);
//   dynamic.ts  members by name (style-scope, Binding, Builder: `view[name] = …`).
//   node tests/perf/members/run.ts [views | dynamic] [--swift | --kotlin] [--repeat N] [--keep]
// Prints one line per workload and target: the median of each run's median round, in ms. Build products go to
// $NS_PERF_BUILD (default: <tmp>/ns-native-perf-members).
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { buildKotlinRuntime, buildSwiftRuntime, kotlinc, kotlinMain, kotlinStdlib, swiftc, swiftMain, translateKotlin, translateSwift } from '../../native-build.ts';

const here = dirname(fileURLToPath(import.meta.url));
const build = process.env.NS_PERF_BUILD ?? join(tmpdir(), 'ns-native-perf-members');
const argv = process.argv.slice(2);
const repeat = argv.includes('--repeat') ? Number(argv[argv.indexOf('--repeat') + 1]) : 3;
const targets = argv.includes('--swift') ? ['swift'] : argv.includes('--kotlin') ? ['kotlin'] : ['swift', 'kotlin'];
const named = argv.filter((a, k) => !a.startsWith('--') && argv[k - 1] !== '--repeat');
const workloads = named.length ? named : ['views', 'dynamic'];
mkdirSync(build, { recursive: true });

interface Result { median: number; min: number; check: number }
const median = (xs: number[]) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];

function measure(name: string, command: string[]): void {
  const runs: Result[] = [];
  for (let k = 0; k < repeat; k++) {
    const r = spawnSync(command[0], command.slice(1), { encoding: 'utf8', timeout: 600000 });
    if (r.status !== 0) throw new Error(`${name}: exit ${r.status}\n${r.stderr.slice(0, 2000)}`);
    runs.push(JSON.parse(r.stdout.trim().split('\n').at(-1)!));
  }
  const checks = new Set(runs.map((r) => r.check));
  console.log(`${name.padEnd(28)} ${String(median(runs.map((r) => r.median))).padStart(6)} ms   (runs: ${runs.map((r) => r.median).join(', ')}; check ${[...checks].join('/')})`);
}

for (const workload of workloads) {
  const source = join(here, `${workload}.ts`);
  const js = join(build, `${workload}.mjs`);
  writeFileSync(js, ts.transpileModule(readFileSync(source, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, useDefineForClassFields: false } }).outputText);

  if (targets.includes('swift')) {
    const runtime = join(build, 'swift-runtime');
    buildSwiftRuntime(runtime, '-Osize', ['-wmo']);
    const dir = join(build, 'swift', workload);
    const modules = translateSwift([source], join(dir, 'Sources'), { lenient: true });
    writeFileSync(join(dir, 'Sources', 'main.swift'), swiftMain(modules));
    const errors = swiftc(readdirSync(join(dir, 'Sources')).map((f) => join(dir, 'Sources', f)), join(dir, workload), runtime, '-Osize', ['-wmo']);
    if (errors) throw new Error(`swiftc:\n${errors.slice(0, 15).join('\n')}`);
    measure(`${workload} swift -Osize`, [join(dir, workload)]);
    measure(`${workload} node --jitless`, ['node', '--jitless', js]);
  }

  if (targets.includes('kotlin')) {
    const pkg = `perf_${workload}`;
    const dir = join(build, 'kotlin', workload);
    const modules = translateKotlin([source], join(dir, 'src'), pkg, { lenient: true });
    writeFileSync(join(dir, 'src', '__Main.kt'), kotlinMain(modules, pkg));
    const runtime = buildKotlinRuntime(build);
    const classes = join(dir, 'classes');
    const errors = kotlinc(readdirSync(join(dir, 'src')).map((f) => join(dir, 'src', f)), classes, [runtime]);
    if (errors) throw new Error(`kotlinc:\n${errors.slice(0, 15).join('\n')}`);
    measure(`${workload} kotlin (JVM)`, ['java', '-Xss16m', '-cp', [classes, runtime, kotlinStdlib()].join(':'), `${pkg}.entry.__MainKt`]);
    measure(`${workload} node`, ['node', js]);
  }
}
if (!argv.includes('--keep')) for (const d of ['swift', 'kotlin']) rmSync(join(build, d), { recursive: true, force: true });
