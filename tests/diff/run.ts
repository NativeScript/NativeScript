#!/usr/bin/env node
// Differential tests: each case under cases/ runs under Node and, translated
// to Swift, as a macOS command-line program linking the kit's JavaScript
// runtime (Foundation only); their output and exit status must match.
//   node tests/diff/run.ts [case-name…] [--keep]
// Build products go to $NS_DIFF_BUILD (default: <tmp>/ns-native-diff).
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createProgram } from '../../compiler/src/program.ts';
import { Translator } from '../../compiler/src/swift.ts';
import { addInterfaces, translateModules } from '../../compiler/src/modules.ts';
import ts from '../../compiler/node_modules/typescript/lib/typescript.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const kit = join(root, 'kit/Sources/NativeScriptKit');
const build = process.env.NS_DIFF_BUILD ?? join(tmpdir(), 'ns-native-diff');
// Any NativeScript app's node_modules: the cases are typed by core and the ES library like an app.
const modulesDir = process.env.NS_DIFF_MODULES ?? join(root, 'recipes-vue/node_modules');
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const keep = process.argv.includes('--keep');

const runtimeSources = [...readdirSync(join(kit, 'Runtime')).filter((f) => f.endsWith('.swift')).map((f) => join(kit, 'Runtime', f)), join(kit, 'JS.swift'), join(kit, 'Signals.swift')];
mkdirSync(build, { recursive: true });

/** The runtime as a static library, rebuilt when a source is newer. */
function buildRuntime() {
  const lib = join(build, 'libNativeScriptKit.a');
  const newest = Math.max(...runtimeSources.map((f) => statSync(f).mtimeMs));
  if (existsSync(lib) && statSync(lib).mtimeMs > newest) return;
  execFileSync('xcrun', ['swiftc', '-parse-as-library', '-emit-library', '-static', '-module-name', 'NativeScriptKit', '-emit-module', '-emit-module-path', join(build, 'NativeScriptKit.swiftmodule'),
    '-Onone', '-o', lib, ...runtimeSources], { stdio: 'inherit', cwd: build });
}

function translate(file: string, out: string): void {
  const { checker, program, files } = createProgram([file], new Map(), 'ios', modulesDir);
  const translator = new Translator(checker, new Map(), files);
  const modules = translateModules(translator, program, [file, ...importsOf(program, file)]);
  addInterfaces(translator, modules);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const header = 'import Foundation\nimport NativeScriptKit\n\n';
  for (const m of modules) writeFileSync(join(out, m.name + '.swift'), header + m.code);
  writeFileSync(join(out, '__Objects.swift'), header + translator.shapesCode() + '\n');
  const inits = modules.filter((m) => m.init).map((m) => `${m.init}()\n`).join('');
  writeFileSync(join(out, 'main.swift'), `${header}${inits}JSEventLoop.runUntilIdle()\n`);
}

/** The app modules a case imports (relative imports, transitively). */
function importsOf(program: import('typescript').Program, file: string): string[] {
  const out = new Set<string>();
  const visit = (f: string) => {
    const sf = program.getSourceFile(f);
    if (!sf) return;
    for (const st of sf.statements) {
      const spec = (st as any).moduleSpecifier?.text as string | undefined;
      if (!spec?.startsWith('.')) continue;
      const target = resolve(dirname(f), spec.replace(/\.ts$/, '') + '.ts');
      if (!out.has(target)) { out.add(target); visit(target); }
    }
  };
  visit(file);
  return [...out];
}

/** The case as JavaScript for Node, the way an app's bundler compiles TypeScript (Node strips types but cannot transform parameter properties or enums). */
function toJavaScript(dir: string, out: string) {
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'package.json'), '{ "type": "module" }');
  for (const f of readdirSync(dir, { recursive: true }) as string[]) {
    if (!f.endsWith('.ts')) continue;
    const { outputText } = ts.transpileModule(readFileSync(join(dir, f), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, rewriteRelativeImportExtensions: true } });
    mkdirSync(dirname(join(out, f)), { recursive: true });
    writeFileSync(join(out, f.replace(/\.ts$/, '.js')), outputText);
  }
}

const cases = readdirSync(join(here, 'cases')).filter((f) => f.endsWith('.ts') && (!args.length || args.some((a) => f.startsWith(a)))).sort();
buildRuntime();
const js = join(build, 'js');
rmSync(js, { recursive: true, force: true });
toJavaScript(join(here, 'cases'), js);
let failed = 0;
for (const c of cases) {
  const name = basename(c, '.ts');
  const file = join(here, 'cases', c);
  const expected = spawnSync('node', [join(js, name + '.js')], { encoding: 'utf8' });
  const dir = join(build, name);
  let actual: { stdout: string; stderr: string; status: number | null };
  try {
    translate(file, join(dir, 'Sources'));
    const swiftFiles = readdirSync(join(dir, 'Sources')).map((f) => join(dir, 'Sources', f));
    const compiled = spawnSync('xcrun', ['swiftc', '-Onone', '-I', build, '-L', build, '-lNativeScriptKit', '-o', join(dir, name), ...swiftFiles], { encoding: 'utf8' });
    if (compiled.status !== 0) throw new Error(`swiftc:\n${compiled.stderr.split('\n').filter((l) => /error:/.test(l)).slice(0, 15).join('\n')}`);
    actual = spawnSync(join(dir, name), { encoding: 'utf8', timeout: 20000 });
  } catch (err) {
    failed++;
    console.log(`✗ ${name}: ${(err as Error).message}`);
    continue;
  }
  const same = actual.stdout === expected.stdout && (actual.status === 0) === (expected.status === 0);
  if (same) console.log(`✓ ${name}`);
  else {
    failed++;
    console.log(`✗ ${name}: output differs (exit ${expected.status} in Node, ${actual.status} native)`);
    const e = expected.stdout.split('\n'), a = actual.stdout.split('\n');
    for (let k = 0, shown = 0; k < Math.max(e.length, a.length) && shown < 8; k++) {
      if (e[k] !== a[k]) { console.log(`    line ${k + 1}\n      node:   ${JSON.stringify(e[k])}\n      native: ${JSON.stringify(a[k])}`); shown++; }
    }
    if (actual.stderr) console.log('    native stderr: ' + actual.stderr.split('\n').slice(0, 4).join('\n    '));
  }
  if (!keep) rmSync(dir, { recursive: true, force: true });
}
console.log(`${cases.length - failed} of ${cases.length} cases match Node`);
process.exit(failed ? 1 : 0);
