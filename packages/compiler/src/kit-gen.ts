// The kit generated from @nativescript/core's own TypeScript: the modules
// listed are translated as one program, in library mode, into public Swift
// beside the hand-written runtime. Imports of core modules not listed resolve
// to core's published declarations and reach the kit as app code does.
import ts from 'typescript';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { foldPlatform } from './platform.ts';
import { Translator } from './swift.ts';
import { collectProperties } from './properties.ts';
import { evaluatedImports, evaluationOrder } from './modules.ts';
import { kitIndexOptions } from './kit-index.ts';
import { loadCoreNativeTables } from './natives/core-ios.ts';
import { nativeTable } from './natives/symbols.ts';
import { KIT_APPLE_SOURCES } from './paths.ts';

export interface KitOptions {
  /** `packages/core` of the NativeScript repository. */
  core: string;
  /** Core as published (`node_modules/@nativescript/core`): the declarations of the modules not compiled. */
  declarations: string;
  /** `@nativescript/types-ios` (its `index.d.ts` and `lib/ios`), where none is installed beside the declarations (core's own repository). */
  typesIos?: string;
  /** Core's files to compile, relative to `core`: a file, or a folder ending in `/` for everything in it. */
  modules: string[];
  /**
   * Functions the kit implements instead: core file → function → the Swift that replaces it (a class's
   * method or accessor as `Class.member`, the Swift called with the object and the arguments); or, for
   * an npm package core imports, `npm:<package>` → imported name (`*` for the namespace) → a value of the kit's;
   * or, for a moot module, `moot:<file>` → imported name → a value of the kit's; or, for a file of the
   * app's (`~/package.json`), its specifier → imported name → the value the kit holds for the app.
   */
  counterparts?: Record<string, Record<string, string>>;
  /**
   * Folders of modules a compiled app has no use for (the XML builder, the inspector, runtime
   * module resolution): what core reads from them is untyped, and using it throws.
   */
  moot?: string[];
  /** Functions that return their last argument, and as decorators leave what they decorate as it is: `profile`. */
  identities?: string[];
  /** A source's text; a patch of core is applied here. Defaults to the file on disk. */
  read?: (file: string) => string;
  /** Report every construct that does not translate instead of stopping at the first of each file. */
  report?: boolean;
  /** Kit files (relative to its sources) the modules replace: left out of what the generated code may name. */
  replaces?: RegExp;
  /**
   * npm packages core imports that are compiled with it, from the TypeScript sources they publish:
   * package → its files, relative to the package's folder beside the declarations; importing the package gives the first.
   */
  packages?: Record<string, string[]>;
}

export interface KitFile {
  /** The Swift file's name in the kit's `Core/` folder. */
  name: string;
  code: string;
  /** The core files it was generated from, relative to `core`, with their hashes. */
  sources: Record<string, string>;
}

/**
 * What an app's closed world is computed from: each generated file's initializer (its module's
 * top level), in the order core's index evaluates them, and the files whose modules evaluating
 * it evaluates first. An app runs the initializers of the modules it reaches, and nothing else
 * keeps the others in its binary.
 */
export interface KitGraph {
  [file: string]: { init?: string; imports: string[] };
}

export interface KitResult {
  files: KitFile[];
  /** With `report`: each construct that did not translate, at its file and line. */
  errors: string[];
  graph: KitGraph;
}

const KIT = KIT_APPLE_SOURCES;
const header = (imports: Iterable<string> = []) => `// Generated from @nativescript/core by tools/native-kit: edit core, not this file.\nimport Foundation\nimport UIKit\n${[...imports].sort().map((m) => `import ${m}\n`).join('')}\n`;

/** The iOS files of a module list: a platform's file over the shared one, no tests, no other platform. */
export function coreFiles(core: string, modules: string[]): string[] {
  const out = new Set<string>();
  const take = (rel: string) => {
    if (!rel.endsWith('.ts') || rel.endsWith('.d.ts') || /\.(android|spec|test)\.ts$|-for-android\.ts$|(^|\/)__tests__\//.test(rel)) return;
    if (!rel.endsWith('.ios.ts') && existsSync(join(core, rel.replace(/\.ts$/, '.ios.ts')))) return;
    out.add(rel);
  };
  for (const m of modules) {
    if (!m.endsWith('/')) { take(m); continue; }
    for (const f of readdirSync(join(core, m), { recursive: true }) as string[]) if (statSync(join(core, m, f)).isFile()) take(m + f);
  }
  return [...out].sort();
}

/** `export * as Utils from './utils'` in core's index: the module's public name. */
function barrelNames(core: string): Map<string, string> {
  const names = new Map<string, string>();
  const index = join(core, 'index.ts');
  if (!existsSync(index)) return names;
  for (const m of readFileSync(index, 'utf8').matchAll(/^export \* as (\w+) from '\.\/([^']+)';/gm)) {
    for (const c of [`${m[2]}.ios.ts`, `${m[2]}.ts`, `${m[2]}/index.ios.ts`, `${m[2]}/index.ts`]) if (existsSync(join(core, c))) { names.set(c, m[1]); break; }
  }
  return names;
}

/** A module's enum: its public name when core's index exports it as one, else its path. */
function enumName(rel: string, barrels: Map<string, string>): string {
  if (rel.startsWith('npm/')) return 'Package_' + rel.slice(4).replace(/\.ts$/, '').replace(/[^A-Za-z0-9]+/g, '_');
  return barrels.get(rel) ?? 'Core_' + rel.replace(/\.(ios\.)?ts$/, '').replace(/[^A-Za-z0-9]+/g, '_');
}

export function generateKit(o: KitOptions): KitResult {
  const core = resolve(o.core);
  const rels = coreFiles(core, o.modules);
  const compiled = new Set(rels.map((r) => join(core, r)));
  const barrels = barrelNames(core);
  const read = o.read ?? ((f: string) => readFileSync(f, 'utf8'));
  const modules = resolve(o.declarations, '../..');
  // A package as Node finds it from the declarations: the nearest node_modules holding it.
  const packageDir = (pkg: string) => {
    for (let dir = resolve(o.declarations); ; dir = dirname(dir)) {
      if (existsSync(join(dir, 'node_modules', pkg))) return join(dir, 'node_modules', pkg);
      if (dirname(dir) === dir) return join(modules, pkg);
    }
  };
  // Without the iOS typings every native call would be untyped: no kit at all rather than that one.
  const typesIos = o.typesIos ?? packageDir('@nativescript/types-ios');
  if (!existsSync(join(typesIos, 'index.d.ts'))) throw new Error(`no @nativescript/types-ios at ${typesIos}: install it beside the declarations, or pass typesIos`);
  // A package's files by path, as `npm/<package>/<file>`; the file importing the package gives.
  const packageFiles = new Map<string, string>();
  const packageEntries = new Map<string, string>();
  for (const [pkg, list] of Object.entries(o.packages ?? {})) {
    list.forEach((f, k) => {
      const abs = join(packageDir(pkg), f);
      if (!existsSync(abs)) throw new Error(`${abs} is missing: install ${pkg} as core's package.json has it`);
      packageFiles.set(abs, `npm/${pkg}/${f}`);
      compiled.add(abs);
      if (k === 0) packageEntries.set(pkg, abs);
    });
  }
  const relOf = (abs: string) => packageFiles.get(abs) ?? relative(core, abs);

  const options: ts.CompilerOptions = {
    // Core's own compiler settings: ES2020 class fields (a redeclared field does not reset), legacy decorators, not strict.
    target: ts.ScriptTarget.ES2022, useDefineForClassFields: false, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: false, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'], types: [], skipLibCheck: true, experimentalDecorators: true, noEmit: true, allowImportingTsExtensions: true,
  };
  const host = ts.createCompilerHost(options);
  const readLib = host.getSourceFile.bind(host);
  const sources = new Map<string, string>();
  const MOOT = '/__moot__/';
  const isMoot = (abs: string) => (o.moot ?? []).some((d) => relative(core, abs).startsWith(d));
  host.getSourceFile = (name, version, onError) => {
    if (name.startsWith(MOOT)) return ts.createSourceFile(name, 'declare const moot: any;\nexport = moot;\n', version, true);
    if (!compiled.has(name)) return readLib(name, version, onError);
    if (!sources.has(name)) sources.set(name, read(name));
    if (packageFiles.has(name)) return ts.createSourceFile(name, sources.get(name)!, version, true);
    return ts.createSourceFile(name, foldPlatform(withCoreDefines(sources.get(name)!), name, 'ios'), version, true);
  };
  /** The published declarations of a core file: `utils/index.ios.ts` and `../utils` both as `utils/index.d.ts`. */
  const declarationOf = (abs: string): string | undefined => {
    const rel = relative(core, abs).replace(/\.(ios\.)?ts$/, '');
    for (const c of [`${rel}.d.ts`, `${rel}/index.d.ts`]) if (existsSync(join(o.declarations, c))) return join(o.declarations, c);
  };
  const resolutions = new Map<string, string>();
  host.resolveModuleNameLiterals = (literals, containing) => literals.map((lit) => {
    const m = lit.text;
    let file: string | undefined;
    if (m.startsWith('.') && containing.startsWith(core + '/')) {
      // `./easysax.js` names the TypeScript module beside it, as TypeScript resolves it.
      const base = resolve(dirname(containing), m.replace(/\.js$/, ''));
      const source = [`${base}.ios.ts`, `${base}.ts`, `${base}/index.ios.ts`, `${base}/index.ts`].find((c) => existsSync(c));
      // `from '.'` in a module's implementation names its declarations, as core's own build reads it.
      const self = (m === '.' || m === './index') && source === containing;
      file = source && isMoot(source) ? MOOT + relative(core, source).replace(/\.ts$/, '.d.ts') : source && compiled.has(source) && !self ? source : declarationOf(source ?? base);
    }
    // A package's own modules (`./types.js`), and the package compiled with core.
    if (m.startsWith('.') && packageFiles.has(containing)) file = [resolve(dirname(containing), m.replace(/\.js$/, '.ts')), resolve(dirname(containing), m) + '.ts'].find((c) => packageFiles.has(c));
    if (!file && packageEntries.has(m) && (containing.startsWith(core + '/') || packageFiles.has(containing))) file = packageEntries.get(m);
    // An npm package core depends on: untyped, its functions the kit's counterparts or moot.
    if (!file && containing.startsWith(core + '/') && /^[@a-z]/i.test(m) && !m.startsWith('@nativescript/')) file = `${MOOT}npm/${m}.d.ts`;
    if (file) {
      resolutions.set(`${containing}\0${m}`, file);
      return { resolvedModule: { resolvedFileName: file, extension: file.endsWith('.d.ts') ? ts.Extension.Dts : ts.Extension.Ts } };
    }
    const r = ts.resolveModuleName(m, containing.startsWith(core + '/') ? join(modules, '..', 'index.ts') : containing, options, host);
    if (r.resolvedModule) resolutions.set(`${containing}\0${m}`, r.resolvedModule.resolvedFileName);
    return r;
  });
  // The iOS typings core references beyond types-ios' common set (Symbols, CoreText…), as types-ios publishes them.
  const references = join(core, 'references.d.ts');
  const referenced = existsSync(references) ? [...readFileSync(references, 'utf8').matchAll(/types-ios\/src\/(lib\/ios\/[^"]+\.d\.ts)/g)].map((m) => join(typesIos, m[1])).filter(existsSync) : [];
  // Core's index (not compiled itself) gives the functions an app imports from `@nativescript/core`.
  const roots = [...compiled, join(core, 'index.ts'), join(typesIos, 'index.d.ts'), ...referenced, join(o.declarations, 'global-types.d.ts'),
    ...['objc!NativeScriptUtils.d.ts', 'objc!MaterialComponents.d.ts'].map((t) => join(o.declarations, 'platforms/ios/typings', t)).filter(existsSync)];
  const program = ts.createProgram(roots, options, host);
  // Core's own native code (TNSWidgets, NativeScriptUtils…), as installed with the declarations: what the kit links.
  const coreNative = new Set(loadCoreNativeTables(o.declarations));
  const coreTypes = new Map<string, string>();
  for (const m of coreNative) for (const c of Object.values(nativeTable(m).classes)) if (!c.extension) coreTypes.set(c.swift, m);
  /** The modules of core's native code a generated file imports: those of the types it names, and of the categories it calls (`used`). */
  const importsOf = (code: string, used: Iterable<string> = []) =>
    new Set([...[...used].filter((m) => coreNative.has(m)), ...[...code.matchAll(/\b[A-Za-z_]\w*/g)].flatMap((x) => coreTypes.get(x[0]) ?? [])]);
  const checker = program.getTypeChecker();
  const files = program.getSourceFiles().filter((f) => compiled.has(f.fileName));

  // The kit as it is without what is being generated: a hand-ported class of a compiled one's name is a clash, not a base.
  kitIndexOptions.exclude = o.replaces ? new RegExp(`^Core/|${o.replaces.source}`) : /^Core\//;
  const kitInternal = internalTypes(KIT, o.replaces);
  const counterparts = new Map<string, Record<string, string>>(Object.entries(o.counterparts ?? {}).map(([f, m]) => [f.startsWith('npm:') ? `${MOOT}npm/${f.slice(4)}.d.ts` : f.startsWith('moot:') ? MOOT + f.slice(5).replace(/\.ts$/, '.d.ts') : f.startsWith('~/') ? f : join(core, f), m]));
  // The compiled core file a declaration (`ui/layouts/root-layout/index.d.ts`) declares: published, or beside core's own source.
  const sourceOf = (dts: string): string | null => {
    const declarations = resolve(o.declarations);
    const root = dts.startsWith(declarations + '/') ? declarations : dts.startsWith(resolve(core) + '/') ? resolve(core) : null;
    if (!root) return null;
    const base = join(core, relative(root, dts).replace(/\.d\.ts$/, ''));
    return [`${base}.ios.ts`, `${base}.ts`].find((c) => compiled.has(c)) ?? null;
  };
  let translator: Translator;
  try {
    translator = new Translator(checker, new Map(), files, {
      pluginFiles: files.map((f) => f.fileName), properties: collectProperties(checker, files), lenient: true,
      library: {
        moduleName: (file) => (compiled.has(file) ? enumName(relOf(file), barrels) : null),
        isMoot: (file) => file.startsWith(MOOT),
        identities: new Set(o.identities ?? []),
        strict: (file) => packageFiles.has(file),
        counterpart: (file, name) => counterparts.get(file)?.[name] ?? null,
        internalTypes: kitInternal,
        sourceOf,
      },
    });
  } finally { kitIndexOptions.exclude = null; }
  translator.appModule = 'NativeScriptKit';
  translator.native.internalTypes = kitInternal;
  const errors: string[] = [];
  if (o.report) translator.errors = [];

  // An app imports core's index, which evaluates core's modules in the order it imports them.
  const order = evaluationOrder(program, [...compiled], (c, s) => resolutions.get(`${c}\0${s}`), [join(core, 'index.ts')]);
  const out: KitFile[] = [];
  const paths = new Map<KitFile, string>();
  const imports = new Map<KitFile, string[]>();
  const initOf = new Map<string, string | undefined>();
  const hash = (text: string) => createHash('sha1').update(text).digest('hex').slice(0, 12);
  for (const file of order) {
    const sf = program.getSourceFile(file)!;
    const rel = relOf(file);
    const init = `__init_${enumName(rel, barrels)}`;
    let result: { code: string; init: string[] } | null = null;
    for (let attempt = 0; attempt < 1000 && !result; attempt++) {
      translator.native.used.clear();
      try { result = translator.module(sf); } catch (e) {
        if (!o.report) throw e;
        errors.push(located(e, sf, core));
        // Report mode: the member or statement that did not translate is left out, and the rest of the file is translated again.
        if (!dropAt(e, sf)) break;
      }
    }
    if (!result) continue;
    const code = result.code + (result.init.length ? `\nfunc ${init}() {\n${result.init.some((l) => /\btry\b/.test(l)) ? `    jsReport {\n${result.init.map((l) => '    ' + l).join('\n')}\n    }` : result.init.join('\n')}\n}\n` : '');
    initOf.set(file, result.init.length ? init : undefined);
    const kitFile = { name: rel.replace(/\.ts$/, '').replace(/\//g, '.') + '.swift', code, sources: { [rel]: hash(sources.get(file) ?? '') } };
    paths.set(kitFile, file);
    out.push(kitFile);
    imports.set(kitFile, [...translator.native.used]);
  }
  for (const name of new Set(translator.kitClashes)) errors.push(`${name}: generated from core and hand-ported in the kit; remove the hand port`);
  if (translator.errors?.length) errors.push(...translator.errors.map((e) => e.replaceAll(core + '/', '')));
  // The SDK frameworks beyond Foundation and UIKit the generated code names (Photos, QuartzCore), in every file; core's own modules where used.
  const sdk = translator.native.sdkModules().filter((m) => !['Foundation', 'UIKit'].includes(m) && !coreNative.has(m));
  for (const f of out) {
    const code = (translator.interfacesOf(paths.get(f)!) + f.code).trim();
    f.code = header(new Set([...sdk, ...importsOf(code, imports.get(f))])) + publicize(code) + '\n';
  }
  // Each function core's index exports and each object shape is a file of its own: an app's build compiles
  // those the code it keeps names, as it does core's modules.
  const exported = indexFunctions(program, checker, join(core, 'index.ts'), compiled, (f) => enumName(relOf(f), barrels), sourceOf, out, KIT, o.replaces);
  const exports = new Map<string, string[]>();
  for (const fn of exported.split(/\n(?=public (?:func|var) )/)) {
    const name = /^public (?:func|var) (\w+)/.exec(fn)?.[1];
    if (name) exports.set(name, [...(exports.get(name) ?? []), fn.trim()]);
  }
  for (const [name, fns] of exports) out.push({ name: `__Export.${name}.swift`, code: header(new Set(sdk)) + fns.join('\n\n') + '\n', sources: {} });
  // The namespaces core's index exports (`export * as Utils from './utils'`), as an app reaches them: `Utils.layout.EXACTLY`.
  const codeOf = (file: string) => { const f = [...paths].find(([, p]) => p === file)?.[0]; return f ? f.code : undefined; };
  for (const [name, code] of indexNamespaces(program, checker, join(core, 'index.ts'), compiled, (f) => enumName(relOf(f), barrels), sourceOf, codeOf)) {
    out.push({ name: `__Namespace.${name}.swift`, code: header(new Set(sdk)) + code + '\n', sources: {} });
  }
  const shapes = publicize(translator.shapesCode().trim());
  for (const shape of shapes ? shapes.split(/\n(?=public final class )/) : []) {
    const name = /^public final class (\w+)/.exec(shape.trim())?.[1];
    if (!name) throw new Error(`an object shape that is no class: ${shape.slice(0, 80)}`);
    out.push({ name: `__Object.${hash(name)}.swift`, code: header(new Set([...sdk, ...importsOf(shape)])) + shape.trim() + '\n', sources: {} });
  }
  // Core's modules run their top level once, before the app's: those the app reaches, in the order JavaScript evaluates them,
  // which its build lists (the manifest's graph), so that nothing in the kit keeps the others in its binary.
  out.push({ name: '__Modules.swift', sources: {}, code: `${header()}public enum CoreModules {\n    private static var initialized = false\n\n    /// The initializers of the core modules the app reaches, in the order core's index evaluates them.\n    public static var initializers: [() -> Void] = []\n\n    public static func initialize() {\n        if initialized { return }\n        initialized = true\n        for run in initializers { run() }\n    }\n}\n` });
  if (errors.length && !o.report) throw new Error(errors.join('\n'));
  const nameOf = new Map([...paths].map(([f, path]) => [path, f.name]));
  const graph: KitGraph = {};
  for (const [path, name] of nameOf) {
    const imports = evaluatedImports(program, path, compiled, (c, sp) => resolutions.get(`${c}\0${sp}`)).flatMap((f) => nameOf.get(f) ?? []);
    graph[name] = { ...(initOf.get(path) ? { init: initOf.get(path) } : {}), imports: imports.sort() };
  }
  return { files: out, errors: [...new Set(errors)], graph };
}

/**
 * The functions and constants core's index exports (`getRootLayout`, `widthProperty`), as an
 * app imports them from `@nativescript/core`: top-level functions and globals forwarding to the
 * module enum each is compiled into, with its own Swift signature or type. Names the hand-written kit declares at the
 * top level already are left to it.
 */
function indexFunctions(program: ts.Program, checker: ts.TypeChecker, index: string, compiled: Set<string>, moduleOf: (file: string) => string, sourceOf: (dts: string) => string | null, out: KitFile[], kit: string, replaces?: RegExp): string {
  const sf = program.getSourceFile(index);
  const sym = sf && checker.getSymbolAtLocation(sf);
  if (!sym) return '';
  const taken = new Set<string>();
  for (const f of readdirSync(kit, { recursive: true }) as string[]) {
    if (!f.endsWith('.swift') || f.startsWith('Core/') || replaces?.test(f)) continue;
    for (const m of readFileSync(join(kit, f), 'utf8').matchAll(/^(?:@\w+\s+)*public\s+func\s+(\w+)/gm)) taken.add(m[1]);
  }
  const lines: string[] = [];
  const resolveAlias = (e: ts.Symbol) => (e.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(e) : e);
  // A function a declaration file declares (`root-layout/index.d.ts`) is implemented by the platform file beside it.
  const implementation = (target: ts.Symbol): ts.Symbol => {
    const dts = target.declarations?.[0]?.getSourceFile().fileName;
    if (!dts?.endsWith('.d.ts')) return target;
    const file = sourceOf(dts);
    const impl = file ? program.getSourceFile(file) : undefined;
    const module = impl && checker.getSymbolAtLocation(impl);
    const found = module && checker.getExportsOfModule(module).find((x) => x.name === target.name);
    return found ? resolveAlias(found) : target;
  };
  // A type of the kit's (`Application`) keeps its name: a constant of the same name is reached as the type is.
  const types = new Set<string>();
  for (const f of out) for (const m of f.code.matchAll(/^(?:(?:open|public|final)\s+)*(?:class|struct|enum|protocol|typealias)\s+(\w+)/gm)) types.add(m[1]);
  for (const e of checker.getExportsOfModule(sym)) {
    const target = implementation(resolveAlias(e));
    // A constant (`widthProperty`): a global reading the module's static.
    const variable = target.declarations?.find((d): d is ts.VariableDeclaration => ts.isVariableDeclaration(d));
    if (variable && compiled.has(variable.getSourceFile().fileName) && !taken.has(e.name) && !types.has(e.name) && e.name === target.name) {
      const module = moduleOf(variable.getSourceFile().fileName);
      const code = out.find((f) => f.code.includes(`enum ${module} {`))?.code;
      const m = code && new RegExp(`\\n\\s*public static (?:var|let) ${target.name}: ([^={\\n]+?)\\s*(?:=|\\{|\\n)`).exec(code);
      if (m) lines.push(`public var ${e.name}: ${m[1].trim()} { ${module}.${target.name} }`);
      continue;
    }
    const decl = target.declarations?.find((d): d is ts.FunctionDeclaration => ts.isFunctionDeclaration(d) && !!d.body);
    if (!decl || !compiled.has(decl.getSourceFile().fileName) || taken.has(e.name)) continue;
    const module = moduleOf(decl.getSourceFile().fileName);
    const code = out.find((f) => f.code.includes(`enum ${module} {`))?.code;
    // The function's Swift declaration: `public static func name<…>(…) throws -> R {`.
    const m = code && new RegExp(`\\n\\s*public static func ${target.name}(<[^>]*>)?\\((.*)\\)( throws)?( -> ([^{]+))? \\{\\n`).exec(code);
    if (!m) continue;
    const [, generics = '', params, throws = '', , ret] = m;
    const args = splitTop(params).filter(Boolean).map((p) => {
      const [label, name] = p.trim().split(':')[0].trim().split(/\s+/);
      const inner = name ?? label;
      return label === '_' ? inner : `${label}: ${inner}`;
    });
    lines.push(`public func ${e.name}${generics}(${params})${throws}${ret ? ` -> ${ret.trim()}` : ''} {\n    ${ret ? 'return ' : ''}${throws ? 'try ' : ''}${module}.${target.name}(${args.join(', ')})\n}`);
  }
  return lines.length ? `// What @nativescript/core's index exports as functions and constants, as an app imports them.\n\n${lines.join('\n\n')}\n` : '';
}

/**
 * The namespaces core's index exports, each as a Swift enum of the same name forwarding to the
 * generated code: a function to its module's, a variable to its module's (read and written), a
 * namespace (`layout`) as a nested enum of its own members. Types are the module's own already.
 */
function indexNamespaces(program: ts.Program, checker: ts.TypeChecker, index: string, compiled: Set<string>, moduleOf: (file: string) => string, sourceOf: (dts: string) => string | null, codeOf: (file: string) => string | undefined): Map<string, string> {
  const result = new Map<string, string>();
  const sf = program.getSourceFile(index);
  const sym = sf && checker.getSymbolAtLocation(sf);
  if (!sym) return result;
  const resolveAlias = (e: ts.Symbol) => (e.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(e) : e);
  // A module a declaration file stands for (`utils/index.d.ts`) is the platform file beside it.
  const implementationModule = (m: ts.Symbol): ts.Symbol => {
    const dts = m.declarations?.[0]?.getSourceFile().fileName;
    const file = dts?.endsWith('.d.ts') ? sourceOf(dts) : null;
    const impl = file ? program.getSourceFile(file) : undefined;
    return (impl && checker.getSymbolAtLocation(impl)) ?? m;
  };
  const members = (exports: ts.Symbol[], indent: string, own?: string): string[] => {
    const lines: string[] = [];
    const seen = new Set<string>();
    for (const e of exports) {
      if (seen.has(e.name) || e.name === 'default') continue;
      const target = resolveAlias(e);
      const decl = target.valueDeclaration ?? target.declarations?.[0];
      if (!decl) continue;
      const file = decl.getSourceFile().fileName;
      if (!compiled.has(file)) continue;
      const code = codeOf(file);
      if (!code) continue;
      if (ts.isModuleDeclaration(decl) && decl.body && ts.isModuleBlock(decl.body)) {
        // A namespace compiled to an enum of its name: its own exports, nested.
        if (!new RegExp(`\\npublic enum ${target.name} \\{`).test(code)) continue;
        // Qualified with the module: inside the nested enum of the same name, the bare name is the nested enum.
        const inner = members(checker.getExportsOfModule(target).map((x) => x), indent + '    ').map((l) => l.replace(new RegExp(`\\bOWNER\\b`, 'g'), `NativeScriptKit.${target.name}`));
        if (inner.length) { lines.push(`${indent}public enum ${e.name} {`, ...inner, `${indent}}`); seen.add(e.name); }
        continue;
      }
      const owner = ts.isModuleBlock(decl.parent) || (ts.isVariableDeclaration(decl) && ts.isModuleBlock(decl.parent.parent.parent)) ? 'OWNER' : `NativeScriptKit.${moduleOf(file)}`;
      // The barrel's own members are its enum's already.
      if (own && owner === `NativeScriptKit.${own}`) continue;
      if (ts.isFunctionDeclaration(decl) && decl.body) {
        const m = new RegExp(`\\n\\s*public static func ${target.name}(<[^>]*>)?\\((.*)\\)( throws)?( -> ([^{]+))? \\{\\n`).exec(code);
        if (!m) continue;
        const [, generics = '', params, throws = '', , ret] = m;
        const args = splitTop(params).filter(Boolean).map((p) => {
          const [label, n] = p.trim().split(':')[0].trim().split(/\s+/);
          return label === '_' ? (n ?? label) : `${label}: ${n ?? label}`;
        });
        lines.push(`${indent}public static func ${e.name}${generics}(${params})${throws}${ret ? ` -> ${ret.trim()}` : ''} { ${ret ? 'return ' : ''}${throws ? 'try ' : ''}${owner}.${target.name}(${args.join(', ')}) }`);
        seen.add(e.name);
        continue;
      }
      if (ts.isVariableDeclaration(decl)) {
        const m = new RegExp(`\\n\\s*public static (var|let) ${target.name}: ([^=\\n{]+?)(?: =|\\s*\\{|\\n)`).exec(code);
        if (!m) continue;
        const type = m[2].trim();
        lines.push(m[1] === 'var'
          ? `${indent}public static var ${e.name}: ${type} { get { ${owner}.${target.name} } set { ${owner}.${target.name} = newValue } }`
          : `${indent}public static var ${e.name}: ${type} { ${owner}.${target.name} }`);
        seen.add(e.name);
      }
    }
    return lines;
  };
  for (const e of checker.getExportsOfModule(sym)) {
    const target = resolveAlias(e);
    if (!(target.flags & ts.SymbolFlags.ValueModule) || !target.declarations?.some(ts.isSourceFile)) continue;
    const module = implementationModule(target);
    // A barrel compiled to an enum of the namespace's name (`utils/index` as `Utils`) gains what it re-exports.
    const barrel = module.declarations?.[0] && ts.isSourceFile(module.declarations[0]) ? moduleOf(module.declarations[0].fileName) : null;
    const extending = barrel === e.name;
    const body = members(checker.getExportsOfModule(module), '    ', extending ? e.name : undefined);
    if (body.length) result.set(e.name, `// What @nativescript/core's index exports as the namespace ${e.name}, as an app reaches it.\n${extending ? `extension ${e.name}` : `public enum ${e.name}`} {\n${body.join('\n')}\n}`);
  }
  return result;
}

/** A Swift parameter list split at its top-level commas. */
function splitTop(list: string): string[] {
  const parts: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < list.length; i++) {
    const ch = list[i];
    if ('([<{'.includes(ch)) depth++;
    else if (')]>}'.includes(ch) && !(ch === '>' && list[i - 1] === '-')) depth--;
    else if (ch === ',' && depth === 0) { parts.push(list.slice(start, i)); start = i + 1; }
  }
  parts.push(list.slice(start));
  return parts;
}

/** The top-level types the hand-written kit declares without making them public (`TNSLabel`), in the files the generated modules do not replace; `Core/` is what is generated. */
function internalTypes(dir: string, replaces?: RegExp): Set<string> {
  const names = new Set<string>();
  for (const f of readdirSync(dir, { recursive: true }) as string[]) {
    if (!f.endsWith('.swift') || f.startsWith('Core/') || replaces?.test(f)) continue;
    for (const m of readFileSync(join(dir, f), 'utf8').matchAll(/^(?:@\w+(?:\([^)]*\))?\s+)*(?:(?:final|internal|indirect)\s+)*(?:class|struct|enum|protocol|typealias|actor)\s+(\w+)/gm)) names.add(m[1]);
  }
  return names;
}

/** A translation error as `file:line: what`, relative to core. */
function located(e: unknown, sf: ts.SourceFile, core: string): string {
  const message = e instanceof Error ? e.message : String(e);
  return (/^\//.test(message) ? message : `${sf.fileName}:0: ${message}`).replaceAll(core + '/', '');
}

/**
 * Drops, in memory, the innermost member, decorator, heritage clause or
 * top-level statement at an error's position, so translating the file again
 * reports what follows it. Whether anything was dropped.
 */
function dropAt(e: unknown, sf: ts.SourceFile): boolean {
  const m = e instanceof Error ? /^(\/[^:]+):(\d+):(\d+): /.exec(e.message) : null;
  if (!m || m[1] !== sf.fileName) return false;
  const pos = sf.getPositionOfLineAndCharacter(+m[2] - 1, +m[3] - 1);
  let best: ts.Node | null = null;
  const visit = (n: ts.Node) => {
    if (pos < n.getStart(sf) || pos >= n.getEnd()) return;
    if (ts.isDecorator(n) || ts.isHeritageClause(n) || (ts.isClassLike(n.parent) && ts.isClassElement(n)) || ((n.parent === sf || ts.isModuleBlock(n.parent)) && ts.isStatement(n))) best = n;
    ts.forEachChild(n, visit);
  };
  ts.forEachChild(sf, visit);
  const n = best as ts.Node | null;
  if (!n) return false;
  const p = n.parent as unknown as Record<string, ts.NodeArray<ts.Node> | undefined>;
  for (const key of ['members', 'statements', 'modifiers', 'heritageClauses']) {
    const list = p[key];
    if (!list || !list.includes(n)) continue;
    const kept = Object.assign(list.filter((x) => x !== n), { pos: list.pos, end: list.end, hasTrailingComma: list.hasTrailingComma });
    Object.defineProperty(p, key, { value: kept, writable: true, configurable: true, enumerable: true });
    return true;
  }
  return false;
}

/**
 * Generated Swift as the kit's public API: types and their members public,
 * classes and their overridable members open (apps and plugins subclass
 * core's classes). Code inside functions and accessors is left as it is.
 */
export function publicize(code: string): string {
  type Scope = { kind: 'type' | 'code'; type?: string; open?: boolean };
  const stack: Scope[] = [];
  const decl = /^(\s*)((?:@[\w.]+(?:\([^)]*\))?\s+)*)((?:(?:final|override|static|class|convenience|required|lazy|indirect|weak|unowned|private|fileprivate|internal|public|open)\s+)*)(class|struct|enum|protocol|extension|func|var|let|init[?!]?|subscript|typealias)\b/;
  const out: string[] = [];
  for (const line of code.split('\n')) {
    const scope = stack.at(-1);
    const m = decl.exec(line);
    let opens: Scope = { kind: 'code' };
    let text = line;
    if (m && (!scope || (scope.kind === 'type' && scope.type !== 'protocol'))) {
      const [, indent, attrs, mods, keyword] = m;
      const isType = ['class', 'struct', 'enum', 'protocol', 'extension'].includes(keyword) && !/\b(static|class)\s+$/.test(mods);
      if (isType) opens = { kind: 'type', type: keyword, open: keyword === 'class' && !/\bfinal\b/.test(mods) };
      if (!/\b(private|fileprivate|internal|public|open)\b/.test(mods) && keyword !== 'extension') {
        let access = 'public';
        if (isType && keyword === 'class' && !/\bfinal\b/.test(mods)) access = 'open';
        else if (!isType && scope?.type === 'class' && scope.open && !/\b(static|final)\b/.test(mods) && /^(func|var|subscript)$/.test(keyword)) access = 'open';
        text = `${indent}${attrs}${access} ${mods}${line.slice(m[0].length - keyword.length)}`;
      }
    }
    out.push(text);
    for (const ch of stripLiterals(line)) {
      if (ch === '{') { stack.push(opens); opens = { kind: 'code' }; }
      else if (ch === '}') stack.pop();
    }
  }
  return out.join('\n');
}

/** A line's braces outside string literals and comments. */
function stripLiterals(line: string): string {
  if (line.startsWith('#sourceLocation')) return '';
  let out = '';
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '/' && line[i + 1] === '/') break;
    if (c === '"') {
      for (i++; i < line.length && line[i] !== '"'; i++) if (line[i] === '\\') i++;
      continue;
    }
    if (c === '{' || c === '}') out += c;
  }
  return out;
}

/**
 * What the bundler defines for core, as a release build's: no external
 * renderer, and CSS given as text at run time parsed by core's own parser
 * (css-tree is not compiled).
 */
const CORE_DEFINES: Record<string, string> = { __UI_USE_EXTERNAL_RENDERER__: 'false', __UI_USE_XML_PARSER__: 'true', __CSS_PARSER__: "'nativescript'" };

function withCoreDefines(text: string): string {
  for (const [key, value] of Object.entries(CORE_DEFINES)) text = text.replace(new RegExp(`(?<![\\w$.])${key}(?![\\w$])`, 'g'), (m) => `(${value})`.padEnd(m.length, ' '));
  return text;
}
