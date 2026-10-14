// The Kotlin side of the perf harness: the workloads translated as an app's modules are, compiled as a
// release build compiles them (JVM 17 bytecode, the runtime a module of its own) and run on the host JVM.
// HotSpot's C2 optimizes harder than ART's AOT compiler (escape analysis, profile-guided inlining), so
// --c1 stops HotSpot at its first tier, which is closer to ART. R8, which shrinks and inlines after
// kotlinc in a release, has no step here; only an emulator or device run proves a number.
// --deopts fails a run in which a number[] left number mode (JSArrayDeopts), printing the counts.
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

const DEOPT_CHECK = `    System.err.println("number[] deopts: storage \${JSArrayDeopts.storage}, method \${JSArrayDeopts.method}, mixed write \${JSArrayDeopts.mixedWrite}")
    if (JSArrayDeopts.total > 0) kotlin.system.exitProcess(3)
`;

export const backend: Backend = {
  name: 'kotlin',
  describe: (args) => `JVM ${args.includes('--c1') ? 'C1 (-XX:TieredStopAtLevel=1)' : 'C2'}`,
  build(src, out, args) {
    const runtime = buildKotlinRuntime(join(out, '..'));
    const sources = join(out, 'Sources');
    const modules = translateKotlin([join(src, 'bench.ts')], sources, PACKAGE);
    if (modules.some((m) => m.name === 'clock_android')) writeFileSync(join(sources, 'clock_android.kt'), kotlinHeader(PACKAGE) + CLOCK);
    // --deopts: number[] arrays that left number mode (JSArrayDeopts) fail the run, which the driver reports.
    const main = kotlinMain(modules, PACKAGE);
    writeFileSync(join(sources, '__Main.kt'), args.includes('--deopts') ? main.replace(/\n}\n$/, `\n${DEOPT_CHECK}}\n`) : main);
    const classes = join(out, 'classes');
    const errors = kotlinc(readdirSync(sources).map((f) => join(sources, f)), classes, [runtime]);
    if (errors) throw new Error(`kotlinc:\n${errors.slice(0, 15).join('\n')}`);
    return ['java', ...jvmFlags(args), '-cp', [classes, runtime, kotlinStdlib()].join(':'), `${PACKAGE}.entry.__MainKt`];
  },
};
