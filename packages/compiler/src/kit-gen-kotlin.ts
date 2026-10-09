// kit-android generated from @nativescript/core's own TypeScript, as kit-gen.ts
// generates the iOS kit: the modules listed are translated from their Android
// files as one program, lenient and in library mode, into Kotlin beside
// kit-android's runtime. Imports of core modules not listed resolve to core's
// published declarations. Native calls are checked against android.jar and
// core's widgets AAR (`org.nativescript.widgets`), as an app's are.
import ts from 'typescript';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { foldPlatform } from './platform.ts';
import { Translator, splitTopLevel } from './kotlin.ts';
import { AndroidNativeAPI, androidClassPath } from './native-calls-android.ts';
import { collectProperties } from './properties.ts';
import { evaluationOrder } from './modules.ts';

export interface KotlinKitOptions {
  /** `packages/core` of the NativeScript repository. */
  core: string;
  /** Core as published (`node_modules/@nativescript/core`): the declarations of the modules not compiled. */
  declarations: string;
  /** `@nativescript/types-android` (its `index.d.ts` and `lib/`), where none is installed beside the declarations. */
  typesAndroid?: string;
  /** Core's widgets AAR (`platforms/android/widgets-release.aar`); defaults to the one beside the declarations. */
  widgets?: string;
  /** Core's files to compile, relative to `core`: a file, or a folder ending in `/` for everything in it. */
  modules: string[];
  /** As kit-gen.ts's, to Kotlin: core file → function → the kit's Kotlin replacing it. */
  counterparts?: Record<string, Record<string, string>>;
  /** Folders of modules a compiled app has no use for: what core reads from them is untyped. */
  moot?: string[];
  /** Functions that return their last argument, and as decorators leave what they decorate as it is. */
  identities?: string[];
  /** npm packages compiled with core from their TypeScript sources: package → its files, the first its entry. */
  packages?: Record<string, string[]>;
  read?: (file: string) => string;
  /** Report every construct that does not translate instead of stopping at the first. */
  report?: boolean;
}

export interface KotlinKitFile {
  /** The Kotlin file's name in the generated folder. */
  name: string;
  code: string;
  /** The core files it was generated from, relative to `core`, with their hashes. */
  sources: Record<string, string>;
}

export interface KotlinKitResult {
  files: KotlinKitFile[];
  /** With `report`: each construct that did not translate, as `file:line:col: what`. */
  errors: string[];
  /** The modules attempted and those translated with nothing left out. */
  attempted: number;
  translated: number;
}

export const KIT_PACKAGE = 'org.nativescript.kit';
const SUPPRESS = '@file:Suppress("unused", "UNUSED_VARIABLE", "RedundantExplicitType", "NAME_SHADOWING", "UNCHECKED_CAST", "UNREACHABLE_CODE", "UNUSED_PARAMETER", "REDUNDANT_CALL_OF_CONVERSION_METHOD")';
const header = () => `// Generated from @nativescript/core by tools/native-kit: edit core, not this file.\n${SUPPRESS}\npackage ${KIT_PACKAGE}\n\n`;

/** The Android files of a module list: a platform's file over the shared one, no tests, no other platform. */
export function coreFilesAndroid(core: string, modules: string[]): string[] {
  const out = new Set<string>();
  const take = (rel: string) => {
    if (!rel.endsWith('.ts') || rel.endsWith('.d.ts') || /\.(ios|visionos|spec|test)\.ts$|-for-ios\.ts$|(^|\/)__tests__\//.test(rel)) return;
    if (!rel.endsWith('.android.ts') && existsSync(join(core, rel.replace(/\.ts$/, '.android.ts')))) return;
    out.add(rel);
  };
  for (const m of modules) {
    if (!m.endsWith('/')) { take(m); continue; }
    for (const f of readdirSync(join(core, m), { recursive: true }) as string[]) if (statSync(join(core, m, f)).isFile()) take(m + f);
  }
  return [...out].sort();
}

/** A core file's Kotlin file name: `ui/core/view/index.android.ts` → `ui_core_view_index`. */
export function kotlinModuleName(rel: string): string {
  return rel.replace(/\.(android\.)?ts$/, '').replace(/[^A-Za-z0-9]+/g, '_');
}

/** The object holding a module's functions and variables, named as the Swift kit's module enum: `Core_ui_core_view_index`, `Package_css_what_src_parse`. */
export function moduleObjectName(rel: string): string {
  return rel.startsWith('npm/') ? 'Package_' + rel.slice(4).replace(/\.ts$/, '').replace(/[^A-Za-z0-9]+/g, '_') : 'Core_' + kotlinModuleName(rel);
}

export function generateKotlinKit(o: KotlinKitOptions): KotlinKitResult {
  const core = resolve(o.core);
  const rels = coreFilesAndroid(core, o.modules);
  const compiled = new Set(rels.map((r) => join(core, r)));
  const read = o.read ?? ((f: string) => readFileSync(f, 'utf8'));
  const modules = resolve(o.declarations, '../..');
  const packageDir = (pkg: string) => {
    for (let dir = resolve(o.declarations); ; dir = dirname(dir)) {
      if (existsSync(join(dir, 'node_modules', pkg))) return join(dir, 'node_modules', pkg);
      if (dirname(dir) === dir) return join(modules, pkg);
    }
  };
  const typesAndroid = o.typesAndroid ?? packageDir('@nativescript/types-android');
  if (!existsSync(join(typesAndroid, 'index.d.ts'))) throw new Error(`no @nativescript/types-android at ${typesAndroid}: install it beside the declarations, or pass typesAndroid`);
  const widgets = o.widgets ?? join(o.declarations, 'platforms/android/widgets-release.aar');
  if (!existsSync(widgets)) throw new Error(`no widgets AAR at ${widgets}: build core, or pass widgets`);
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
    return ts.createSourceFile(name, foldPlatform(withCoreDefines(sources.get(name)!), name, 'android'), version, true);
  };
  const declarationOf = (abs: string): string | undefined => {
    const rel = relative(core, abs).replace(/\.(android\.)?ts$/, '');
    for (const c of [`${rel}.d.ts`, `${rel}/index.d.ts`]) if (existsSync(join(o.declarations, c))) return join(o.declarations, c);
  };
  const resolutions = new Map<string, string>();
  host.resolveModuleNameLiterals = (literals, containing) => literals.map((lit) => {
    const m = lit.text;
    let file: string | undefined;
    if (m.startsWith('.') && containing.startsWith(core + '/')) {
      const base = resolve(dirname(containing), m.replace(/\.js$/, ''));
      const source = [`${base}.android.ts`, `${base}.ts`, `${base}/index.android.ts`, `${base}/index.ts`].find((c) => existsSync(c));
      const self = (m === '.' || m === './index') && source === containing;
      file = source && isMoot(source) ? MOOT + relative(core, source).replace(/\.ts$/, '.d.ts') : source && compiled.has(source) && !self ? source : declarationOf(source ?? base);
    }
    if (m.startsWith('.') && packageFiles.has(containing)) file = [resolve(dirname(containing), m.replace(/\.js$/, '.ts')), resolve(dirname(containing), m) + '.ts'].find((c) => packageFiles.has(c));
    if (!file && packageEntries.has(m) && (containing.startsWith(core + '/') || packageFiles.has(containing))) file = packageEntries.get(m);
    if (!file && containing.startsWith(core + '/') && /^[@a-z]/i.test(m) && !m.startsWith('@nativescript/')) file = `${MOOT}npm/${m}.d.ts`;
    if (file) {
      resolutions.set(`${containing}\0${m}`, file);
      return { resolvedModule: { resolvedFileName: file, extension: file.endsWith('.d.ts') ? ts.Extension.Dts : ts.Extension.Ts } };
    }
    const r = ts.resolveModuleName(m, containing.startsWith(core + '/') ? join(modules, '..', 'index.ts') : containing, options, host);
    if (r.resolvedModule) resolutions.set(`${containing}\0${m}`, r.resolvedModule.resolvedFileName);
    return r;
  });
  const roots = [...compiled, join(core, 'index.ts'), join(typesAndroid, 'index.d.ts'), join(o.declarations, 'global-types.d.ts')];
  const program = ts.createProgram(roots, options, host);
  const checker = program.getTypeChecker();
  const files = program.getSourceFiles().filter((f) => compiled.has(f.fileName));

  const counterparts = new Map<string, Record<string, string>>(Object.entries(o.counterparts ?? {}).map(([f, m]) => [f.startsWith('npm:') ? `${MOOT}npm/${f.slice(4)}.d.ts` : f.startsWith('moot:') ? MOOT + f.slice(5).replace(/\.ts$/, '.d.ts') : f.startsWith('~/') ? f : join(core, f), m]));
  const translator = new Translator(checker, new Map(), files, {
    pluginFiles: files.map((f) => f.fileName), properties: collectProperties(checker, files), lenient: true,
    library: {
      identities: new Set(o.identities ?? []),
      counterpart: (file, name) => counterparts.get(file)?.[name] ?? null,
      moduleName: (file) => (compiled.has(file) ? moduleObjectName(relOf(file)) : null),
    },
  });
  translator.appModule = KIT_PACKAGE;
  const native = new AndroidNativeAPI(translator, androidClassPath(widgets));
  // The repository's typings are no installed package: their declarations are the SDK's all the same.
  for (const f of program.getSourceFiles()) if (f.isDeclarationFile && f.fileName.startsWith(resolve(typesAndroid) + '/')) native.pluginTypings.add(f.fileName);
  translator.native = native;

  const errors: string[] = [];
  const order = evaluationOrder(program, [...compiled], (c, s) => resolutions.get(`${c}\0${s}`), [join(core, 'index.ts')]);
  const out: KotlinKitFile[] = [];
  const paths = new Map<KotlinKitFile, string>();
  const inits: string[] = [];
  const hash = (text: string) => createHash('sha1').update(text).digest('hex').slice(0, 12);
  let translated = 0;
  const results = new Map<string, { code: string; init: string[] }>();
  for (const file of order) {
    const sf = program.getSourceFile(file)!;
    const rel = relOf(file);
    const name = kotlinModuleName(rel);
    let result: { code: string; init: string[] } | null = null;
    let dropped = 0;
    for (let attempt = 0; attempt < 1000 && !result; attempt++) {
      try { result = translator.module(sf); } catch (e) {
        if (!o.report) throw e;
        errors.push(located(e, sf, core));
        dropped++;
        if (!dropAt(e, sf)) break;
      }
    }
    if (!result) continue;
    if (!dropped) translated++;
    results.set(file, result);
  }
  // Again, now that every declaration the first pass found nullable (a field core leaves unset) is known where code
  // translated before it reads it.
  for (const file of order) {
    if (!results.has(file)) continue;
    const sf = program.getSourceFile(file)!;
    const rel = relOf(file);
    const name = kotlinModuleName(rel);
    let result = results.get(file)!;
    try { result = translator.module(sf); } catch (e) { errors.push(located(e, sf, core)); }
    if (result.init.length) inits.push(`${moduleObjectName(rel)}.__init`);
    const kitFile = { name: `${name}.kt`, code: result.code, sources: { [rel]: hash(sources.get(file) ?? '') } };
    paths.set(kitFile, file);
    out.push(kitFile);
  }
  // A declaration file of core's (`ui/dialogs/index.d.ts`) stands for the compiled file beside it.
  const sourceOf = (dts: string): string | null => {
    if (!dts.startsWith(resolve(o.declarations) + '/')) return null;
    const rel = relative(o.declarations, dts).replace(/\.d\.ts$/, '');
    return [`${rel}.android.ts`, `${rel}.ts`].map((c) => join(core, c)).find((c) => compiled.has(c)) ?? null;
  };
  const exported = indexExports(program, checker, join(core, 'index.ts'), compiled, (f) => moduleObjectName(relOf(f)), sourceOf, out);
  for (const f of out) f.code = withImports((translator.interfacesOf(paths.get(f)!) + f.code).trim());
  if (exported) out.push({ name: '__Exports.kt', code: withImports(exported.trim()), sources: {} });
  const shapes = translator.shapesCode().trim();
  if (shapes) out.push({ name: '__Objects.kt', code: withImports(shapes), sources: {} });
  // Core's modules run their top level once, in the order core's index evaluates them.
  out.push({ name: '__Modules.kt', sources: {}, code: `${header()}object CoreModules {\n    private var initialized = false\n\n    fun initialize() {\n        if (initialized) return\n        initialized = true\n${inits.map((i) => `        ${i}()\n`).join('')}    }\n}\n` });
  if (errors.length && !o.report) throw new Error(errors.join('\n'));
  return { files: out, errors: [...new Set(errors)], attempted: order.length, translated };
}

/**
 * The functions and constants core's index exports (`getRootLayout`, `widthProperty`), as an app
 * imports them from `@nativescript/core`: top-level declarations forwarding to the module object each
 * is compiled into, with its own Kotlin signature. A default argument other than a literal may name
 * what only the module's object sees: the forwarding function has an overload without it instead.
 */
function indexExports(program: ts.Program, checker: ts.TypeChecker, index: string, compiled: Set<string>, moduleOf: (file: string) => string, sourceOf: (dts: string) => string | null, out: KotlinKitFile[]): string {
  const sf = program.getSourceFile(index);
  const sym = sf && checker.getSymbolAtLocation(sf);
  if (!sym) return '';
  const types = new Set<string>();
  for (const f of out) for (const m of f.code.matchAll(/^(?:(?:open|abstract|data|enum|sealed|final)\s+)*(?:class|interface|object|typealias)\s+(\w+)/gm)) types.add(m[1]);
  const codeOf = (module: string) => out.find((f) => f.code.includes(`object ${module} {\n`))?.code;
  const implementation = (target: ts.Symbol): ts.Symbol => {
    const dts = target.declarations?.[0]?.getSourceFile().fileName;
    const file = dts?.endsWith('.d.ts') ? sourceOf(dts) : null;
    const impl = file ? program.getSourceFile(file) : undefined;
    const module = impl && checker.getSymbolAtLocation(impl);
    const found = module && checker.getExportsOfModule(module).find((x) => x.name === target.name);
    return found ? (found.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(found) : found) : target;
  };
  const lines: string[] = [];
  const seen = new Set<string>();
  for (const e of checker.getExportsOfModule(sym)) {
    const aliased = e.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(e) : e;
    const target = implementation(aliased);
    if (seen.has(e.name) || types.has(e.name) || e.name === 'default') continue;
    const decl = target.declarations?.find((d) => (ts.isFunctionDeclaration(d) && !!d.body) || ts.isVariableDeclaration(d));
    if (!decl || !compiled.has(decl.getSourceFile().fileName) || !ts.isSourceFile(ts.isVariableDeclaration(decl) ? decl.parent.parent.parent : decl.parent)) continue;
    const own = (decl as ts.FunctionDeclaration | ts.VariableDeclaration).name?.getText() ?? target.name;
    const module = moduleOf(decl.getSourceFile().fileName);
    const code = codeOf(module);
    if (!code) continue;
    if (ts.isVariableDeclaration(decl)) {
      const m = new RegExp(`\\n    (?:@\\S+ )*(lateinit )?(var|val) ${own}: (.+?)(?: = .*)?\\n`).exec(code);
      if (!m) continue;
      lines.push(m[2] === 'var' ? `var ${e.name}: ${m[3]}\n    get() = ${module}.${own}\n    set(value) { ${module}.${own} = value }` : `val ${e.name}: ${m[3]} get() = ${module}.${own}`);
      seen.add(e.name);
      continue;
    }
    const m = new RegExp(`\\n    fun (<[^>]*> )?${own}\\((.*)\\)(?:: (.+?))? \\{\\n`).exec(code);
    if (!m) continue;
    const [, generics = '', list, ret] = m;
    const params = splitTopLevel(list).filter(Boolean).map((p) => {
      const [, vararg, name, type, value] = /^(vararg )?(\S+): (.+?)(?: = (.+))?$/.exec(p)!;
      return { vararg: !!vararg, name, type, value };
    });
    const literal = (v?: string) => !v || /^(null|true|false|-?[\d.]+|Double\.NaN|"[^"\\$]*")$/.test(v);
    let keep = params.length;
    for (;;) {
      const used = params.slice(0, keep);
      const decls = used.map((p) => `${p.vararg ? 'vararg ' : ''}${p.name}: ${p.type}${p.value && literal(p.value) ? ` = ${p.value}` : ''}`);
      const args = used.map((p) => (p.vararg ? `*${p.name}` : p.name));
      lines.push(`fun ${generics}${e.name}(${decls.join(', ')})${ret ? `: ${ret}` : ''} = ${module}.${own}(${args.join(', ')})`);
      if (!keep || !params[keep - 1].value || literal(params[keep - 1].value)) break;
      keep--;
    }
    seen.add(e.name);
  }
  return lines.length ? `// What @nativescript/core's index exports as functions and constants, as an app imports them.\n\n${lines.join('\n\n')}\n` : '';
}

/**
 * Report lines grouped by what did not translate: the construct's description, without the
 * source text it quotes, most frequent first.
 */
export function groupByCause(errors: string[]): { cause: string; count: number; examples: string[] }[] {
  const groups = new Map<string, string[]>();
  for (const e of errors) {
    const m = /^[^:]+:\d+:\d+: (.*?) is not supported in a release build yet/.exec(e) ?? /^[^:]+:\d+: (.*)$/.exec(e);
    const cause = (m?.[1] ?? e).replace(/`[^`]*`/g, '`…`').replace(/'[^']*'/g, "'…'").replace(/"[^"]*"/g, '"…"')
      .replace(/\b(?:[a-z]+\.)+[A-Z]\w*(?:\.[A-Z]\w*)*/g, '<class>').replace(/<class>\.\w+/g, '<class>.<member>')
      .replace(/\(ambiguous between .*$/, '(ambiguous between Java overloads)').replace(/\(no Java overload takes .*$/, '(no Java overload takes these arguments)')
      .replace(/^(the class decorator \w+)\(.*$/, '$1').slice(0, 160);
    (groups.get(cause) ?? groups.set(cause, []).get(cause)!).push(e);
  }
  return [...groups].map(([cause, list]) => ({ cause, count: list.length, examples: list.slice(0, 3) })).sort((a, b) => b.count - a.count);
}

/** A Java package root the SDK's classes are named from. */
const JAVA_NAME = /(?<![\w.$`])(?:android|androidx|java|javax|dalvik|org\.(?:nativescript\.widgets|json|w3c|xml)|com\.google)(?:\.[a-z_]\w*)*\.[A-Z]\w*/g;

/**
 * A file's code with the Java classes it names imported under aliases (`android_view_View`): core's classes
 * have members named `android`, which a qualified name inside them would resolve to, and Kotlin has no root qualifier.
 */
function withImports(code: string): string {
  const aliases = new Map<string, string>();
  const alias = (name: string) => {
    const a = name.replace(/\./g, '_');
    aliases.set(name, a);
    return a;
  };
  let out = '';
  // Code outside string literals and comments; a string template's `${…}` is code.
  // A template's braces open inside it count, so its own `}` is the one that closes it.
  const stack: { kind: 'code' | 'string' | 'template'; depth: number }[] = [{ kind: 'code', depth: 0 }];
  for (let i = 0; i < code.length; ) {
    const top = stack.at(-1)!;
    if (top.kind === 'string') {
      const c = code[i];
      if (c === '\\') { out += code.slice(i, i + 2); i += 2; continue; }
      if (c === '"') { stack.pop(); out += c; i++; continue; }
      if (c === '$' && code[i + 1] === '{') { stack.push({ kind: 'template', depth: 0 }); out += '${'; i += 2; continue; }
      out += c; i++; continue;
    }
    let j = i;
    while (j < code.length && !'"\'/{}'.includes(code[j])) j++;
    out += code.slice(i, j).replace(JAVA_NAME, alias);
    if (j >= code.length) break;
    const c = code[j];
    if (c === '"') { stack.push({ kind: 'string', depth: 0 }); out += c; i = j + 1; continue; }
    if (c === "'") { const end = code.indexOf("'", j + (code[j + 1] === '\\' ? 3 : 2)); out += code.slice(j, end + 1); i = end + 1; continue; }
    if (c === '/' && code[j + 1] === '/') { const end = code.indexOf('\n', j); out += code.slice(j, end < 0 ? code.length : end); i = end < 0 ? code.length : end; continue; }
    if (c === '{') { top.depth++; out += c; i = j + 1; continue; }
    if (c === '}') { if (top.kind === 'template' && top.depth === 0) stack.pop(); else top.depth--; out += c; i = j + 1; continue; }
    out += c; i = j + 1;
  }
  const imports = [...aliases].sort().map(([name, a]) => `import ${name} as ${a}\n`).join('');
  return header() + (imports ? imports + '\n' : '') + out + '\n';
}

function located(e: unknown, sf: ts.SourceFile, core: string): string {
  const message = e instanceof Error ? e.message : String(e);
  return (/^\//.test(message) ? message : `${sf.fileName}:0: ${message.split('\n')[0]}`).replaceAll(core + '/', '');
}

/**
 * Drops, in memory, the innermost member, decorator, heritage clause or top-level statement at an
 * error's position, so translating the file again reports what follows it. Whether anything was dropped.
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

/** What the bundler defines for core, as a release build's (kit-gen.ts). */
const CORE_DEFINES: Record<string, string> = { __UI_USE_EXTERNAL_RENDERER__: 'false', __UI_USE_XML_PARSER__: 'true', __CSS_PARSER__: "'nativescript'" };

function withCoreDefines(text: string): string {
  for (const [key, value] of Object.entries(CORE_DEFINES)) text = text.replace(new RegExp(`(?<![\\w$.])${key}(?![\\w$])`, 'g'), (m) => `(${value})`.padEnd(m.length, ' '));
  return text;
}
