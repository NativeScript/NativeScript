#!/usr/bin/env node
// The kit manifest against the Swift compiler: the public API of the built NativeScriptKit module, as its symbol graph
// gives it, and the manifest the translator reads must name the same types and members.
//   node tests/kit-manifest-check.ts <built products dir holding NativeScriptKit.swiftmodule> [kit sources]
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DEPLOYMENT } from '../src/native-calls.ts';
import { readKitManifest, type ManifestParam } from '../src/kit-manifest.ts';

const products = process.argv[2];
const kit = process.argv[3] ?? join(import.meta.dirname, '..', 'kit-apple', 'Sources', 'NativeScriptKit');
if (!products || !existsSync(join(products, 'NativeScriptKit.swiftmodule'))) {
  console.error(`usage: kit-manifest-check.ts <products dir with NativeScriptKit.swiftmodule> [kit sources]`);
  process.exit(2);
}
const manifest = readKitManifest(kit);
if (!manifest) {
  console.error(`${kit}/Core has no kit manifest: generate the kit (nx run compiler:kit)`);
  process.exit(1);
}

const out = mkdtempSync(join(tmpdir(), 'kit-symbols-'));
interface SymbolGraph { symbols: { kind: { identifier: string }; identifier: { precise: string }; pathComponents: string[]; accessLevel: string; names: { title: string } }[] }
const graphs: SymbolGraph[] = [];
try {
  const sdk = execFileSync('xcrun', ['--sdk', 'iphonesimulator', '--show-sdk-path'], { encoding: 'utf8' }).trim();
  const arch = readdirSync(join(products, 'NativeScriptKit.swiftmodule')).some((f) => f.startsWith('arm64-')) ? 'arm64' : 'x86_64';
  execFileSync('xcrun', ['swift-symbolgraph-extract', '-module-name', 'NativeScriptKit', '-target', `${arch}-apple-ios${DEPLOYMENT}-simulator`, '-sdk', sdk,
    '-I', products, '-F', products, '-minimum-access-level', 'public', '-skip-synthesized-members', '-output-dir', out], { stdio: ['ignore', 'ignore', 'inherit'] });
  for (const f of readdirSync(out)) if (f.endsWith('.symbols.json')) graphs.push(JSON.parse(readFileSync(join(out, f), 'utf8')));
} finally {
  rmSync(out, { recursive: true, force: true });
}

const TYPE_KINDS = new Set(['swift.class', 'swift.struct', 'swift.enum', 'swift.protocol', 'swift.actor']);
const MEMBER_KINDS = new Set(['swift.property', 'swift.type.property', 'swift.method', 'swift.type.method', 'swift.init', 'swift.subscript', 'swift.type.subscript', 'swift.enum.case', 'swift.func.op']);
const GLOBAL_KINDS = new Set(['swift.func', 'swift.var', 'swift.func.op']);
/** A member's name as the manifest keys it: `map(_:)` as `map`. */
const nameOf = (component: string) => (component.startsWith('init(') || component === 'init' ? 'init' : component.startsWith('subscript(') ? 'subscript' : component.replace(/\(.*$/, ''));

const compiled = { types: new Set<string>(), members: new Set<string>(), globals: new Set<string>() };
for (const g of graphs) {
  for (const s of g.symbols) {
    const kind = s.kind.identifier;
    // A member a protocol's extension adds to every conforming type is the protocol's.
    if (s.identifier.precise.includes('::SYNTHESIZED::')) continue;
    const path = s.pathComponents;
    if (TYPE_KINDS.has(kind)) compiled.types.add(path.join('.'));
    else if (path.length === 1 && GLOBAL_KINDS.has(kind)) compiled.globals.add(nameOf(path[0]));
    else if (MEMBER_KINDS.has(kind)) {
      compiled.members.add(`${path.slice(0, -1).join('.')}.${nameOf(path.at(-1)!)}`);
      // An extension's type (`String`, `UIView`) is in the manifest as the type it extends.
      compiled.types.add(path.slice(0, -1).join('.'));
    }
  }
}

// Swift leaves out of a symbol graph what its naming marks as private: a name, or a function's parameter name, starting with `_`.
const underscored = (n: string) => n.startsWith('_') && n !== '_';
const hidden = (path: string, params: ManifestParam[][] = []) => path.split('.').some(underscored) || (params.length > 0 && params.every((ps) => ps.some((p) => underscored(p.name) || underscored(p.label))));
const listed = { types: new Set<string>(), members: new Set<string>(), globals: new Set(Object.entries(manifest.globals).filter(([n, list]) => !hidden(n, list.map((m) => m.params ?? []))).map(([n]) => n)) };
for (const [name, t] of Object.entries(manifest.types)) {
  if (t.alias || hidden(name)) continue;
  listed.types.add(name);
  for (const [m, list] of Object.entries(t.members)) if (!hidden(m, list.map((x) => x.params ?? []))) listed.members.add(`${name}.${m}`);
}

const problems: string[] = [];
const compare = (what: string, a: Set<string>, b: Set<string>, missing: string) => {
  const only = [...a].filter((x) => !b.has(x)).sort();
  if (only.length) problems.push(`${only.length} ${what} ${missing}:\n  ${only.slice(0, 40).join('\n  ')}${only.length > 40 ? '\n  …' : ''}`);
};
compare('public types of the module', compiled.types, listed.types, 'the manifest lacks');
compare('public members of the module', compiled.members, listed.members, 'the manifest lacks');
compare('public top-level functions and variables of the module', compiled.globals, listed.globals, 'the manifest lacks');
// An extension of a type with no public member is no symbol of the module's: only declared types are checked this way.
compare('manifest types', new Set([...listed.types].filter((n) => manifest.types[n].kind !== 'extension')), compiled.types, 'the module does not declare');
compare('manifest members', listed.members, compiled.members, 'the module does not declare');
compare('manifest globals', listed.globals, compiled.globals, 'the module does not declare');
if (problems.length) {
  console.error(`the kit manifest and the module's symbol graph differ:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`kit manifest: ${listed.types.size} types, ${listed.members.size} members and ${listed.globals.size} globals, as the module's symbol graph has them`);
