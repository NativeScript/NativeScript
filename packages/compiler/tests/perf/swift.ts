// The Swift side of the perf harness: the workloads translated as an app's modules are, and built as
// a compiled release builds them (src/cli.ts project.yml): the kit as a separate module, whole-module,
// -Osize with full LTO and no exclusivity checks at run time. --O builds both at -O instead, a candidate
// for the release default; --no-lto leaves LTO out.
import { cpSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildSwiftRuntime, swiftc, swiftMain, translateSwift, type Optimize } from '../native-build.ts';
import type { Backend } from './backend.ts';

const optimize = (args: string[]): Optimize => (args.includes('--O') ? '-O' : '-Osize');
// SWIFT_ENFORCE_EXCLUSIVE_ACCESS: compile-time, as the release has it.
const extraFlags = (args: string[]) => ['-wmo', '-enforce-exclusivity=unchecked', ...(args.includes('--no-lto') ? [] : ['-lto=llvm-full'])];

export const backend: Backend = {
  name: 'swift',
  describe: (args) => [optimize(args), ...extraFlags(args)].join(' '),
  build(src, out, args) {
    // The iOS files in place of the shared ones, as the app's bundler resolves `./clock` to clock.ios.ts.
    const staged = join(out, 'src');
    rmSync(staged, { recursive: true, force: true });
    cpSync(src, staged, { recursive: true });
    for (const f of readdirSync(staged).filter((f) => f.endsWith('.ios.ts'))) cpSync(join(staged, f), join(staged, f.replace(/\.ios\.ts$/, '.ts')));
    for (const f of readdirSync(staged).filter((f) => /\.(ios|android)\.ts$/.test(f))) rmSync(join(staged, f));
    const runtime = join(out, '..', 'swift-runtime');
    buildSwiftRuntime(runtime, optimize(args), extraFlags(args));
    const sources = join(out, 'Sources');
    const modules = translateSwift([join(staged, 'bench.ts')], sources);
    writeFileSync(join(sources, 'main.swift'), swiftMain(modules));
    // QuartzCore for the clock (clock.ios.ts calls CACurrentMediaTime).
    const files = readdirSync(sources).map((f) => join(sources, f));
    for (const f of files) writeFileSync(f, 'import QuartzCore\n' + readFileSync(f, 'utf8'));
    const exe = join(out, 'workloads');
    const errors = swiftc(files, exe, runtime, optimize(args), extraFlags(args));
    if (errors) throw new Error(`swiftc:\n${errors.slice(0, 15).join('\n')}`);
    return [exe];
  },
};
