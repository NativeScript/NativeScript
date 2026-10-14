// The Kotlin side of the perf harness: the workloads translated as an app's modules are, compiled as a
// release build compiles them (JVM 17 bytecode, the runtime a module of its own) and run on the host JVM.
// HotSpot's C2 optimizes harder than ART's AOT compiler (escape analysis, profile-guided inlining), so
// --c1 stops HotSpot at its first tier, which is closer to ART. R8, which shrinks and inlines after
// kotlinc in a release, has no step here; only an emulator or device run proves a number.
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import type ts from 'typescript';
import { createProgram } from '../../src/program.ts';
import { Translator } from '../../src/kotlin.ts';
import { SourceLines } from '../../src/source-lines.ts';
import { addKotlinInterfaces, translateKotlinModules, type KotlinModule } from '../../src/kotlin-modules.ts';
import { buildKotlinRuntime, kotlinc, kotlinHeader, kotlinMain, kotlinStdlib, modulesDir } from '../native-build.ts';
import type { Backend } from './backend.ts';

const PACKAGE = 'perf';

/** The JVM's switches: a fixed heap so GC sizing does not drift between runs, and --c1 for ART-like code quality. */
const jvmFlags = (args: string[]) => ['-Xss16m', '-Xms1g', '-Xmx1g', ...(args.includes('--c1') ? ['-XX:TieredStopAtLevel=1'] : [])];

/**
 * clock.android.ts as an app build translates it. The host has no binding metadata for `java.lang`, so the
 * translator would read `java.lang.System` dynamically.
 */
const CLOCK = 'fun now(): Double = System.nanoTime() / 1e6\n';

/**
 * `entry` and the modules it imports as Kotlin in `out`. Every module goes to the translator, as an app build gives
 * them: a class is open only where it sees the subclasses.
 */
function translate(entry: string, out: string): KotlinModule[] {
  const { checker, program, files } = createProgram([entry], new Map(), 'android', modulesDir);
  const imported = importsOf(program, entry);
  const all = [...files, ...imported.map((f) => program.getSourceFile(f)!).filter((sf) => sf && !files.includes(sf))];
  const translator = new Translator(checker, new Map(), all, {});
  translator.appModule = PACKAGE;
  const lines = translator.lines = new SourceLines(new Map());
  const modules = translateKotlinModules(translator, program, [entry, ...imported]);
  addKotlinInterfaces(translator, modules);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const header = kotlinHeader(PACKAGE);
  for (const m of modules) writeFileSync(join(out, m.name + '.kt'), header + (m.name === 'clock_android' ? CLOCK : lines.kotlin(m.code).code));
  writeFileSync(join(out, '__Objects.kt'), header + translator.shapesCode() + '\n');
  return modules;
}

/** The app modules `file` imports, transitively, as the program resolved them: the platform's own file first. */
function importsOf(program: ts.Program, file: string): string[] {
  const out = new Set<string>();
  const visit = (f: string) => {
    const sf = program.getSourceFile(f);
    if (!sf) return;
    for (const st of sf.statements) {
      const spec = (st as any).moduleSpecifier?.text as string | undefined;
      if (!spec?.startsWith('.')) continue;
      const base = resolve(dirname(f), spec.replace(/\.ts$/, ''));
      const target = [`${base}.android.ts`, `${base}.ts`].find((t) => program.getSourceFile(t));
      if (target && !out.has(target)) { out.add(target); visit(target); }
    }
  };
  visit(file);
  return [...out];
}

export const backend: Backend = {
  name: 'kotlin',
  describe: (args) => `JVM ${args.includes('--c1') ? 'C1 (-XX:TieredStopAtLevel=1)' : 'C2'}`,
  build(src, out, args) {
    const runtime = buildKotlinRuntime(join(out, '..'));
    const sources = join(out, 'Sources');
    const modules = translate(join(src, 'bench.ts'), sources);
    writeFileSync(join(sources, '__Main.kt'), kotlinMain(modules, PACKAGE));
    const classes = join(out, 'classes');
    const errors = kotlinc(readdirSync(sources).map((f) => join(sources, f)), classes, [runtime]);
    if (errors) throw new Error(`kotlinc:\n${errors.slice(0, 15).join('\n')}`);
    return ['java', ...jvmFlags(args), '-cp', [classes, runtime, kotlinStdlib()].join(':'), `${PACKAGE}.entry.__MainKt`];
  },
};
