// The Kotlin side of the perf harness: the workloads translated as an app's modules are, compiled as a
// release build compiles them (JVM 17 bytecode, the runtime a module of its own) and run on the host JVM.
// HotSpot's C2 optimizes harder than ART's AOT compiler (escape analysis, profile-guided inlining), so
// --c1 stops HotSpot at its first tier, which is closer to ART. R8, which shrinks and inlines after
// kotlinc in a release, has no step here; only an emulator or device run proves a number.
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildKotlinRuntime, kotlinc, kotlinHeader, kotlinMain, kotlinStdlib, translateKotlin } from '../native-build.ts';
import type { Backend } from './backend.ts';

const PACKAGE = 'perf';

/** The JVM's switches: a fixed heap so GC sizing does not drift between runs, and --c1 for ART-like code quality. */
const jvmFlags = (args: string[]) => ['-Xss16m', '-Xms1g', '-Xmx1g', ...(args.includes('--c1') ? ['-XX:TieredStopAtLevel=1'] : [])];

/**
 * clock.android.ts as an app build translates it. The host has no binding metadata for `java.lang`, so the
 * translator would read `java.lang.System` dynamically.
 */
const CLOCK = 'fun now(): Double = System.nanoTime() / 1e6\n';

export const backend: Backend = {
  name: 'kotlin',
  describe: (args) => `JVM ${args.includes('--c1') ? 'C1 (-XX:TieredStopAtLevel=1)' : 'C2'}`,
  build(src, out, args) {
    const runtime = buildKotlinRuntime(join(out, '..'));
    const sources = join(out, 'Sources');
    const modules = translateKotlin([join(src, 'bench.ts')], sources, PACKAGE);
    if (modules.some((m) => m.name === 'clock_android')) writeFileSync(join(sources, 'clock_android.kt'), kotlinHeader(PACKAGE) + CLOCK);
    writeFileSync(join(sources, '__Main.kt'), kotlinMain(modules, PACKAGE));
    const classes = join(out, 'classes');
    const errors = kotlinc(readdirSync(sources).map((f) => join(sources, f)), classes, [runtime]);
    if (errors) throw new Error(`kotlinc:\n${errors.slice(0, 15).join('\n')}`);
    return ['java', ...jvmFlags(args), '-cp', [classes, runtime, kotlinStdlib()].join(':'), `${PACKAGE}.entry.__MainKt`];
  },
};
