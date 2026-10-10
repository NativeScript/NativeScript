#!/usr/bin/env node
// kit-android's Worker on the host JVM: WorkerTests.kt drives the runtime directly (lifecycle, errors,
// structured clone, one live worker per script), and each case under cases/ is a small app of a main
// module and worker scripts, translated as an Android build translates them, whose output must match
// the `//> ` lines at the top of its main.ts.
//   node tests/worker/run.ts [--keep]
// Build products go to $NS_WORKER_BUILD (default: <tmp>/ns-native-worker).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createProgram } from '../../src/program.ts';
import { Translator } from '../../src/kotlin.ts';
import { SourceLines } from '../../src/source-lines.ts';
import { addKotlinInterfaces, translateKotlinModules } from '../../src/kotlin-modules.ts';
import { kotlinToolchain } from '../kotlin-toolchain.ts';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const kitAndroid = join(root, 'kit-android/src/main/kotlin/org/nativescript/kit');
const build = process.env.NS_WORKER_BUILD ?? join(tmpdir(), 'ns-native-worker');
const modulesDir = process.env.NS_DIFF_MODULES ?? join(root, 'tests/node_modules');
const keep = process.argv.includes('--keep');
const runtimeSources = [...readdirSync(join(kitAndroid, 'runtime')).filter((f) => f.endsWith('.kt')).map((f) => join(kitAndroid, 'runtime', f)), join(kitAndroid, 'Signals.kt')];
mkdirSync(build, { recursive: true });

const toolchain = kotlinToolchain();
function kotlinc(sources: string[], out: string, classpath: string[]): void {
  rmSync(out, { recursive: true, force: true });
  const r = toolchain.compile([...sources, '-d', out, '-no-stdlib', '-nowarn', '-jvm-target', '17', '-cp', [toolchain.stdlib, ...classpath].join(':')]);
  if (r.status !== 0) throw new Error(`kotlinc:\n${(r.stderr + r.stdout).split('\n').filter((l) => /error:/.test(l)).slice(0, 15).join('\n') || r.stderr.slice(0, 2000)}`);
}

const runtime = join(build, 'kotlin-runtime');
const stamp = join(runtime, '.built');
if (!existsSync(stamp) || statSync(stamp).mtimeMs < Math.max(...runtimeSources.map((f) => statSync(f).mtimeMs))) {
  kotlinc(runtimeSources, runtime, []);
  writeFileSync(stamp, '');
}
const java = (classes: string, main: string) => spawnSync('java', ['-Xss16m', '-cp', [classes, runtime, toolchain.stdlib].join(':'), main], { encoding: 'utf8', timeout: 60000 });

let failed = 0;
const tests = join(build, 'tests');
kotlinc([join(here, 'Host.kt'), join(here, 'WorkerTests.kt')], tests, [runtime]);
const unit = java(tests, 'workertest.WorkerTestsKt');
process.stdout.write(unit.stdout);
if (unit.status !== 0) {
  failed++;
  if (unit.stderr) console.log('  stderr: ' + unit.stderr.split('\n').slice(0, 8).join('\n  '));
}

/** A case's app as Kotlin in `pkg`, with a main that registers its workers, runs its main module and then the loop until idle. */
function translate(dir: string, out: string, pkg: string): void {
  const roots = readdirSync(dir).filter((f) => f.endsWith('.ts')).map((f) => join(dir, f));
  const files = roots.filter((f) => !f.endsWith('.d.ts'));
  const workers = files.filter((f) => f.endsWith('.worker.ts'));
  const { checker, program, files: sources } = createProgram(roots, new Map(), 'android', modulesDir);
  const translator = new Translator(checker, new Map(), sources, {});
  translator.appModule = pkg;
  translator.workerScripts = new Map(workers.map((f) => [f, relative(dir, f)]));
  const lines = (translator.lines = new SourceLines(new Map()));
  const modules = translateKotlinModules(translator, program, files);
  addKotlinInterfaces(translator, modules);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const header = `@file:Suppress("UNCHECKED_CAST", "UNUSED_VARIABLE", "NAME_SHADOWING", "UNREACHABLE_CODE", "UNUSED_PARAMETER")\npackage ${pkg}\n\nimport org.nativescript.kit.*\n\n`;
  for (const m of modules) writeFileSync(join(out, m.name + '.kt'), header + lines.kotlin(m.code).code);
  writeFileSync(join(out, '__Objects.kt'), header + translator.shapesCode() + '\n');
  const isWorker = (file: string) => translator.workerScripts!.has(file);
  const registered = modules.filter((m) => isWorker(m.file)).map((m) => `    JSWorker.register(${JSON.stringify(translator.workerScripts!.get(m.file))}) { ${m.init ? `${m.init}()` : ''} }\n`).join('');
  const inits = modules.filter((m) => m.init && !isWorker(m.file)).map((m) => `    ${m.init}()\n`).join('');
  writeFileSync(join(out, '__Main.kt'), `package ${pkg}.entry\n\nimport org.nativescript.kit.*\nimport ${pkg}.*\n\nfun main() {\n    workertest.Host.install()\n${registered}${inits}    Microtasks.checkpoint()\n    if (!workertest.Host.pumpUntilIdle(10000)) println("timed out with " + workertest.Host.workerThreads().joinToString { it.name })\n    System.out.flush()\n}\n`);
}

const casesDir = join(here, 'cases');
for (const name of readdirSync(casesDir).sort()) {
  const dir = join(casesDir, name);
  const pkg = 'worker_' + name.replace(/\W/g, '_');
  const out = join(build, 'cases', name);
  try {
    translate(dir, join(out, 'src'), pkg);
    kotlinc([...readdirSync(join(out, 'src')).map((f) => join(out, 'src', f)), join(here, 'Host.kt')], join(out, 'classes'), [runtime]);
    const run = java(join(out, 'classes'), `${pkg}.entry.__MainKt`);
    const want = readFileSync(join(dir, 'main.ts'), 'utf8').split('\n').filter((l) => l.startsWith('//> ')).map((l) => l.slice(4)).join('\n') + '\n';
    if (run.stdout === want && run.status === 0) console.log(`✓ case ${name}`);
    else {
      failed++;
      console.log(`✗ case ${name} (exit ${run.status})\n  want: ${JSON.stringify(want)}\n  got:  ${JSON.stringify(run.stdout)}${run.stderr ? '\n  stderr: ' + run.stderr.split('\n').slice(0, 8).join('\n  ') : ''}`);
    }
  } catch (err) {
    failed++;
    console.log(`✗ case ${name}: ${(err as Error).message}`);
  }
  if (!keep) rmSync(out, { recursive: true, force: true });
}
console.log(failed ? `worker tests: ${failed} failed` : 'worker tests: all pass');
process.exit(failed ? 1 : 0);
