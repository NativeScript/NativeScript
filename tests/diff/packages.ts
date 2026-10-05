#!/usr/bin/env node
// Differential test of the npm packages the kit compiles with core (kit-gen's `packages`):
// each package's TypeScript sources translated as the kit generates them, run on the host
// with the kit's JavaScript runtime, against the package itself under Node.
//   node tests/diff/packages.ts
// Build products go to $NS_DIFF_BUILD (default: <tmp>/ns-native-diff).
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { generateKit } from '../../compiler/src/kit-gen.ts';
import { swiftString } from '../../compiler/src/swift.ts';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const kit = join(root, 'kit/Sources/NativeScriptKit');
const modulesDir = process.env.NS_DIFF_MODULES ?? join(root, 'recipes-vue/node_modules');
const build = join(process.env.NS_DIFF_BUILD ?? join(tmpdir(), 'ns-native-diff'), 'packages');

/** A package, the call each input goes through (Swift and JavaScript), and the inputs. */
interface PackageCase { name: string; files: string[]; entry: string; swift: (input: string) => string; js: string; inputs: string[] }

const SELECTORS = [
  // What apps' and core's own stylesheets and tests use.
  'Page', '.list', '#cs-id', '*', '.fs-css Span', '.cs-card .cs-deep', '.cs-list > Label', '.cs-list Label + Label', '.cs-first ~ Label', '.cs-list.cs-alt > Label',
  'Label[text="exact"]', 'Label[text^="starts"]', 'Label[text$="end"]', 'Label[text*="mid"]', 'Label[text~="word"]', 'Label[lang|="en"]', 'button[testAttr]',
  'Label:where(.cs-w)', '.cs-page Label.cs-is:is(.cs-w, .nope)', '.cs-n:not(.cs-special)', 'Switch:checked + Label', 'Button:disabled', '.cs-u > *', '.spaced > * + *', '.spaced > * ~ *',
  ':is(.a + .b)', '.list :is(.a ~ .b).c', '.ns-root.ns-ios.ns-phone.ns-portrait.ns-ltr .cv-root', '.ns-dark .tw-card', 'label:disabled', 'a, b , c',
  // The grammar's corners.
  '  .padded  ', 'a\tb\nc', 'a >b', 'a~ b', 'a < b', 'a || b', '[ title ]', '[title = "x" i]', '[title=x s]', "[data-x='a b']", '[a!="b"]', '[ns|attr]', '[*|attr]', '[|attr]',
  'ns|tag', '*|*', 'ns|*', '|tag', '::before', ':after', '::slotted(span)', ':first-letter', ':nth-child(2n + 1)', ':contains("a b")', ":icontains('x')", ':not(:has(> a), b)',
  ':host(.dark)', ':host-context(body.x)', ':matches(a, b)', ':Hover', '.a\\:b', '#\\31 23', '.\\0041 b', '.\\1F600 x', '.ünï', '.a/* note */.b', '/* lead */ a',
  'a\\ b', '[x="a\\"b"]', ':is(a /* c */ , b)',
  // Errors.
  '', ',a', 'a,', 'a > > b', 'a +', '[a=', '[a="b]', '[a]b]', ':not("x")', ':is(a', 'a)', '/* open', '.', '#', '[=b]', '::', 'a $= b',
];

const CASES: PackageCase[] = [{
  name: 'css-what',
  files: ['src/index.ts', 'src/parse.ts', 'src/types.ts', 'src/stringify.ts'],
  entry: 'dist/esm/index.js',
  swift: (s) => `Package_css_what_src_parse.parse(${swiftString(s)})`,
  js: 'parse',
  inputs: SELECTORS,
}];

const runtimeSources = [...readdirSync(join(kit, 'Runtime')).filter((f) => f.endsWith('.swift')).map((f) => join(kit, 'Runtime', f)), join(kit, 'JS.swift'), join(kit, 'Signals.swift')];
let failed = 0;
for (const c of CASES) {
  const dir = join(build, c.name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, 'Sources'), { recursive: true });
  const declarations = join(modulesDir, '@nativescript/core');
  const { files } = generateKit({ core: declarations, declarations, modules: [], packages: { [c.name]: c.files } });
  // The generated code compiled for the host: it uses no UIKit.
  for (const f of files) writeFileSync(join(dir, 'Sources', f.name), f.code.replace(/^import UIKit\n/m, ''));
  const lines = c.inputs.map((s) => `        do { print((try jsJSONStringifyChecked(try ${c.swift(s)})) ?? "undefined") } catch { print("Error: " + jsToString(try! jsGet(jsCaught(error), "message"))) }`);
  writeFileSync(join(dir, 'Sources', 'main.swift'), `import Foundation\n\n@main struct Main {\n    static func main() {\n        CoreModules.initialize()\n${lines.join('\n')}\n    }\n}\n`);
  const sources = readdirSync(join(dir, 'Sources')).map((f) => join(dir, 'Sources', f));
  const exe = join(dir, c.name);
  const compiled = spawnSync('xcrun', ['swiftc', '-Onone', '-parse-as-library', '-module-name', 'NativeScriptKit', '-o', exe, ...runtimeSources, ...sources], { encoding: 'utf8' });
  if (compiled.status !== 0) {
    failed++;
    console.log(`✗ ${c.name}: swiftc:\n${compiled.stderr.split('\n').filter((l) => /error:/.test(l)).slice(0, 15).join('\n')}`);
    continue;
  }
  const native = spawnSync(exe, { encoding: 'utf8' });
  const script = `import { ${c.js} } from ${JSON.stringify(pathToFileURL(join(modulesDir, c.name, c.entry)).href)};\nfor (const s of ${JSON.stringify(c.inputs)}) { try { console.log(JSON.stringify(${c.js}(s))); } catch (e) { console.log('Error: ' + e.message); } }\n`;
  const node = spawnSync('node', ['--input-type=module', '-e', script], { encoding: 'utf8' });
  const want = node.stdout.split('\n'), got = native.stdout.split('\n');
  const diffs = c.inputs.flatMap((s, k) => (want[k] === got[k] ? [] : [`    ${JSON.stringify(s)}\n      node:   ${want[k]}\n      native: ${got[k]}`]));
  if (diffs.length || native.status !== 0) {
    failed++;
    console.log(`✗ ${c.name}: ${diffs.length} of ${c.inputs.length} inputs differ${native.status !== 0 ? ` (exit ${native.status}: ${native.stderr.slice(0, 300)})` : ''}\n${diffs.slice(0, 10).join('\n')}`);
  } else console.log(`✓ ${c.name} (${c.inputs.length} inputs)`);
  if (!process.argv.includes('--keep')) rmSync(dir, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
