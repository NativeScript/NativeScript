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
import { evaluationOrder } from './modules.ts';
import { kitIndexOptions } from './kit-index.ts';
import { loadCoreNativeTables } from './natives/core-ios.ts';
import { nativeTable } from './natives/symbols.ts';

export interface KitOptions {
  /** `packages/core` of the NativeScript repository. */
  core: string;
  /** Core as published (`node_modules/@nativescript/core`): the declarations of the modules not compiled. */
  declarations: string;
  /** Core's files to compile, relative to `core`: a file, or a folder ending in `/` for everything in it. */
  modules: string[];
  /** Functions the kit implements instead (an npm dependency core calls): file → function → the Swift that replaces it. */
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
}

export interface KitFile {
  /** The Swift file's name in the kit's `Core/` folder. */
  name: string;
  code: string;
  /** The core files it was generated from, relative to `core`, with their hashes. */
  sources: Record<string, string>;
}

export interface KitResult {
  files: KitFile[];
  /** With `report`: each construct that did not translate, at its file and line. */
  errors: string[];
}

const KIT = resolve(import.meta.dirname, '../../kit/Sources/NativeScriptKit');
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
  return barrels.get(rel) ?? 'Core_' + rel.replace(/\.(ios\.)?ts$/, '').replace(/[^A-Za-z0-9]+/g, '_');
}

export function generateKit(o: KitOptions): KitResult {
  const core = resolve(o.core);
  const rels = coreFiles(core, o.modules);
  const compiled = new Set(rels.map((r) => join(core, r)));
  const barrels = barrelNames(core);
  const read = o.read ?? ((f: string) => readFileSync(f, 'utf8'));
  const modules = resolve(o.declarations, '../..');

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
      const base = resolve(dirname(containing), m);
      const source = [`${base}.ios.ts`, `${base}.ts`, `${base}/index.ios.ts`, `${base}/index.ts`].find((c) => existsSync(c));
      // `from '.'` in a module's implementation names its declarations, as core's own build reads it.
      const self = (m === '.' || m === './index') && source === containing;
      file = source && isMoot(source) ? MOOT + relative(core, source).replace(/\.ts$/, '.d.ts') : source && compiled.has(source) && !self ? source : declarationOf(source ?? base);
    }
    if (file) {
      resolutions.set(`${containing}\0${m}`, file);
      return { resolvedModule: { resolvedFileName: file, extension: file.endsWith('.d.ts') ? ts.Extension.Dts : ts.Extension.Ts } };
    }
    const r = ts.resolveModuleName(m, containing.startsWith(core + '/') ? join(modules, '..', 'index.ts') : containing, options, host);
    if (r.resolvedModule) resolutions.set(`${containing}\0${m}`, r.resolvedModule.resolvedFileName);
    return r;
  });
  const roots = [...compiled, join(modules, '@nativescript/types-ios/index.d.ts'), join(o.declarations, 'global-types.d.ts'),
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
  const counterparts = new Map<string, Record<string, string>>(Object.entries(o.counterparts ?? {}).map(([f, m]) => [join(core, f), m]));
  let translator: Translator;
  try {
    translator = new Translator(checker, new Map(), files, {
      pluginFiles: files.map((f) => f.fileName), properties: collectProperties(checker, files), lenient: true,
      library: {
        moduleName: (file) => (compiled.has(file) ? enumName(relative(core, file), barrels) : null),
        isMoot: (file) => file.startsWith(MOOT),
        identities: new Set(o.identities ?? []),
        counterpart: (file, name) => counterparts.get(file)?.[name] ?? null,
        internalTypes: kitInternal,
        sourceOf: (dts) => {
          const declarations = resolve(o.declarations);
          if (!dts.startsWith(declarations + '/')) return null;
          const base = join(core, relative(declarations, dts).replace(/\.d\.ts$/, ''));
          return [`${base}.ios.ts`, `${base}.ts`].find((c) => compiled.has(c)) ?? null;
        },
      },
    });
  } finally { kitIndexOptions.exclude = null; }
  translator.appModule = 'NativeScriptKit';
  translator.native.internalTypes = kitInternal;
  const errors: string[] = [];
  if (o.report) translator.errors = [];

  const order = evaluationOrder(program, [...compiled], (c, s) => resolutions.get(`${c}\0${s}`));
  const out: KitFile[] = [];
  const imports = new Map<KitFile, string[]>();
  const inits: string[] = [];
  const hash = (text: string) => createHash('sha1').update(text).digest('hex').slice(0, 12);
  for (const file of order) {
    const sf = program.getSourceFile(file)!;
    const rel = relative(core, file);
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
    if (result.init.length) inits.push(init);
    const kitFile = { name: rel.replace(/\.ts$/, '').replace(/\//g, '.') + '.swift', code, sources: { [rel]: hash(sources.get(file) ?? '') } };
    out.push(kitFile);
    imports.set(kitFile, [...translator.native.used]);
  }
  for (const name of new Set(translator.kitClashes)) errors.push(`${name}: generated from core and hand-ported in the kit; remove the hand port`);
  if (translator.errors?.length) errors.push(...translator.errors.map((e) => e.replaceAll(core + '/', '')));
  // The SDK frameworks beyond Foundation and UIKit the generated code names (Photos, QuartzCore), in every file; core's own modules where used.
  const sdk = translator.native.sdkModules().filter((m) => !['Foundation', 'UIKit'].includes(m) && !coreNative.has(m));
  for (const f of out) {
    const code = (translator.interfacesOf(join(core, Object.keys(f.sources)[0])) + f.code).trim();
    f.code = header(new Set([...sdk, ...importsOf(code, imports.get(f))])) + publicize(code) + '\n';
  }
  const shapes = translator.shapesCode().trim();
  if (shapes) out.push({ name: '__Objects.swift', code: header(new Set([...sdk, ...importsOf(shapes)])) + publicize(shapes) + '\n', sources: {} });
  // Core's modules run their top level once, in the order JavaScript evaluates them, before the app's.
  out.push({ name: '__Modules.swift', sources: {}, code: `${header()}public enum CoreModules {\n    private static var initialized = false\n\n    public static func initialize() {\n        if initialized { return }\n        initialized = true\n${inits.map((i) => `        ${i}()\n`).join('')}    }\n}\n` });
  if (errors.length && !o.report) throw new Error(errors.join('\n'));
  return { files: out, errors: [...new Set(errors)] };
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
