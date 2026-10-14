// The Swift side of the perf harness: the workloads translated as an app's modules are, and built as
// a compiled release builds them (src/cli.ts project.yml): the kit as a separate module, whole-module,
// // -Osize with full LTO and no exclusivity checks at run time. --O builds both at -O instead, a candidate
// for the release default.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type ts from 'typescript';
import { createProgram } from '../../src/program.ts';
import { Translator } from '../../src/swift.ts';
import { SourceLines } from '../../src/source-lines.ts';
import { addInterfaces, translateModules } from '../../src/modules.ts';
import type { Backend } from './backend.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const kit = join(root, 'kit-apple/Sources/NativeScriptKit');
const modulesDir = process.env.NS_DIFF_MODULES ?? join(root, 'tests/node_modules');
const runtimeSources = [...readdirSync(join(kit, 'Runtime')).filter((f) => f.endsWith('.swift')).map((f) => join(kit, 'Runtime', f)), join(kit, 'JS.swift'), join(kit, 'Signals.swift')];

// SWIFT_ENFORCE_EXCLUSIVE_ACCESS: compile-time, as the release has it: no access checks at run time.
const flags = (args: string[]) => [args.includes('--O') ? '-O' : '-Osize', '-wmo', '-enforce-exclusivity=unchecked', ...(args.includes('--no-lto') ? [] : ['-lto=llvm-full'])];

/** The runtime as a static library and module in `dir`, rebuilt when a source is newer or the flags differ. */
function buildRuntime(dir: string, args: string[]) {
  mkdirSync(dir, { recursive: true });
  const lib = join(dir, 'libNativeScriptKit.a');
  const stamp = join(dir, 'flags');
  const newest = Math.max(...runtimeSources.map((f) => statSync(f).mtimeMs));
  if (existsSync(lib) && statSync(lib).mtimeMs > newest && existsSync(stamp) && readFileSync(stamp, 'utf8') === flags(args).join(' ')) return;
  rmSync(stamp, { force: true });
  execFileSync('xcrun', ['swiftc', '-parse-as-library', '-emit-library', '-static', '-module-name', 'NativeScriptKit', '-emit-module', '-emit-module-path', join(dir, 'NativeScriptKit.swiftmodule'),
    ...flags(args), '-o', lib, ...runtimeSources], { stdio: 'inherit', cwd: dir });
  writeFileSync(stamp, flags(args).join(' '));
}

/** `entry` and the modules it imports as Swift files in `out`, as tests/diff/run.ts translates a case; the entry point's statements. */
function translate(entry: string, out: string): string {
  const { checker, program, files } = createProgram([entry], new Map(), 'ios', modulesDir);
  const imported = importsOf(program, entry);
  const all = [...files, ...imported.map((f) => program.getSourceFile(f)!).filter((sf) => sf && !files.includes(sf))];
  const translator = new Translator(checker, new Map(), all, {});
  translator.appModule = 'Main';
  const lines = translator.lines = new SourceLines(new Map());
  const modules = translateModules(translator, program, [entry, ...imported]);
  addInterfaces(translator, modules);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  for (const m of modules) writeFileSync(join(out, m.name + '.swift'), HEADER + lines.swift(m.code));
  writeFileSync(join(out, '__Objects.swift'), HEADER + translator.shapesCode() + '\n');
  return modules.filter((m) => m.init).map((m) => `${m.init}()\n`).join('');
}

// QuartzCore for the clock (clock.ios.ts calls CACurrentMediaTime).
const HEADER = 'import Foundation\nimport QuartzCore\nimport NativeScriptKit\n\n';

/** The app modules `file` imports, transitively, as the program resolved them. */
function importsOf(program: ts.Program, file: string): string[] {
  const out = new Set<string>();
  const visit = (f: string) => {
    const sf = program.getSourceFile(f);
    if (!sf) return;
    for (const st of sf.statements) {
      const spec = (st as any).moduleSpecifier?.text as string | undefined;
      if (!spec?.startsWith('.')) continue;
      const base = resolve(dirname(f), spec.replace(/\.ts$/, ''));
      // The platform's own file first, as the program resolved it.
      const target = [`${base}.ios.ts`, `${base}.ts`].find((t) => program.getSourceFile(t));
      if (target && !out.has(target)) { out.add(target); visit(target); }
    }
  };
  visit(file);
  return [...out];
}

export const backend: Backend = {
  name: 'swift',
  describe: (args) => flags(args).join(' '),
  build(src, out, args) {
    const runtime = join(out, '..', 'swift-runtime' + flags(args).join('').replace(/[^\w]+/g, '-'));
    buildRuntime(runtime, args);
    const sources = join(out, 'Sources');
    const inits = translate(join(src, 'bench.ts'), sources);
    writeFileSync(join(sources, 'main.swift'), `${HEADER}${inits}JSEventLoop.runUntilIdle()\n`);
    const exe = join(out, 'workloads');
    const swiftFiles = readdirSync(sources).map((f) => join(sources, f));
    const r = spawnSync('xcrun', ['swiftc', ...flags(args), '-module-name', 'Main', '-I', runtime, '-L', runtime, '-lNativeScriptKit', '-o', exe, ...swiftFiles], { encoding: 'utf8', maxBuffer: 256 << 20 });
    if (r.status !== 0) throw new Error(`swiftc:\n${r.stderr.split('\n').filter((l) => /error:/.test(l)).slice(0, 15).join('\n') || r.stderr.slice(0, 2000)}`);
    return [exe];
  },
};
