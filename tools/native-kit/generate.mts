/**
 * Generates NativeScriptKit's Swift from core's TypeScript with the
 * NativeScript compiler, one Swift file per core file, plus a manifest of the
 * sources each was generated from.
 *
 *   node tools/native-kit/generate.mts [--out <kit>/Sources/NativeScriptKit/Core] [--check] [--report]
 *     [--compiler <the compiler package>] [--declarations <published @nativescript/core>] [--types-ios <@nativescript/types-ios>]
 *
 * --check exits non-zero when the files in --out differ from what core generates (CI).
 * --report lists every construct the compiler does not translate yet, and writes nothing.
 * --partial writes what translates, leaving out each construct --report would list (listed on stderr).
 * The compiler is $NS_NATIVE_COMPILER or packages/compiler, and --out its kit-apple's Core; the
 * declarations are core as built (dist/packages/core) unless given.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ios } from './modules.mts';

const root = resolve(import.meta.dirname, '../..');
const core = join(root, 'packages/core');
const args = process.argv.slice(2);
const option = (name: string, fallback?: string) => {
	const i = args.indexOf(name);
	return i >= 0 ? args[i + 1] : fallback;
};
const compiler = resolve(option('--compiler', process.env.NS_NATIVE_COMPILER ?? join(root, 'packages/compiler')));
const out = option('--out', join(compiler, 'kit-apple/Sources/NativeScriptKit/Core'));
const check = args.includes('--check');
const report = args.includes('--report');
const partial = args.includes('--partial');
const declarations = resolve(option('--declarations', join(root, 'dist/packages/core')));
// This repository's iOS typings, unless the declarations come with their own (published core in an app's node_modules).
const typesIos = option('--types-ios', option('--declarations') ? undefined : join(root, 'packages/types-ios/src'));
if (!existsSync(join(compiler, 'src/kit-gen.ts'))) throw new Error(`${compiler}: not the NativeScript compiler (--compiler or NS_NATIVE_COMPILER)`);
if (!existsSync(join(declarations, 'index.d.ts'))) throw new Error(`${declarations}: no core declarations (build core, or --declarations)`);

const { generateKit } = await import(join(compiler, 'src/kit-gen.ts'));
const result = generateKit({ core, declarations, typesIos, modules: ios.compile, counterparts: ios.counterparts, moot: ios.moot, identities: ios.identities, packages: ios.packages, report: report || partial });
if (partial && result.errors.length) console.error(result.errors.join('\n'));
if (report) {
	console.log(result.errors.join('\n') || 'every listed module translates');
	process.exit(0);
}

const version = JSON.parse(readFileSync(join(core, 'package.json'), 'utf8')).version;
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
// `graph`: each file's initializer and the files it imports, from which an app's build keeps only the modules it reaches.
const manifest = { core: version, commit, modules: ios.compile, files: Object.fromEntries(result.files.map((f) => [f.name, f.sources])), graph: result.graph };
const files = new Map<string, string>(result.files.map((f) => [f.name, f.code]));
files.set('manifest.json', JSON.stringify(manifest, null, '\t') + '\n');

if (check) {
	// The commit a kit was generated at differs from the one checking it: compare what the sources make.
	const stale = [...files].filter(([name, code]) => name !== 'manifest.json' && (!existsSync(join(out!, name)) || readFileSync(join(out!, name), 'utf8') !== code)).map(([name]) => name);
	const extra = existsSync(out!) ? readdirSync(out!).filter((f) => !files.has(f)) : [];
	if (stale.length || extra.length) {
		console.error(`the kit is not what core generates: ${[...stale, ...extra].join(', ')}`);
		process.exit(1);
	}
	process.exit(0);
}
mkdirSync(out!, { recursive: true });
for (const f of readdirSync(out!)) if (!files.has(f)) rmSync(join(out!, f));
for (const [name, code] of files) writeFileSync(join(out!, name), code);
console.log(`${files.size} files in ${out}`);
