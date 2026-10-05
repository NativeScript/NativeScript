import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * How NativeScript's JavaScript names for an iOS SDK module's Objective-C and
 * C APIs are spelled in Swift. A table per module is generated from the
 * module's Swift symbol graph (`swift-symbolgraph-extract`), whose symbols
 * carry their Clang USRs: the USR gives the Objective-C selector or C name,
 * from which the NativeScript metadata name follows, and the symbol gives
 * the Swift spelling and types.
 */

export type SwiftType = string;
export interface NativeMethod {
  kind: 'method' | 'init';
  swift: string;
  labels: (string | null)[];
  /** A `()` parameter (`init(toMemory: ())`, `init(contentsOf:error: ()) throws`) takes no JavaScript argument: pass `()`. */
  params: SwiftType[];
  returns: SwiftType;
  throws?: boolean;
  errorParam?: number;
  failable?: boolean;
  introduced?: string;
  selector: string;
  /** Isolated to the main actor by a Swift module (Objective-C's isolation is preconcurrency and needs nothing). */
  mainActor?: boolean;
}
export interface NativeProperty { kind: 'property'; swift: string; type: SwiftType; readonly: boolean; introduced?: string; mainActor?: boolean }
export interface NativeClass {
  swift: string;
  kind: 'class' | 'protocol';
  base?: string;
  protocols?: string[];
  module: string;
  instance: Record<string, NativeMethod | NativeProperty>;
  static: Record<string, NativeMethod | NativeProperty>;
  constructors: Record<string, NativeMethod>;
  inits: Record<string, NativeMethod>;
  /** Members another module adds to a class declared in `module` (an Objective-C category). */
  extension?: boolean;
  /**
   * Initializers the Swift overlay declares in place of Objective-C ones it hides
   * (`UIAction(title:image:identifier:discoverabilityTitle:attributes:state:handler:)`),
   * with which parameters have defaults; lookups match JavaScript keys against them.
   */
  swiftInits?: (NativeMethod & { defaults: boolean[] })[];
  /** Generic parameters Swift keeps (`NSHashTable<ObjectType>`); `swift` names the type without its arguments. */
  generics?: string[];
  introduced?: string;
}
export interface NativeEnum {
  /** '' when Swift imports the cases as global constants (a C enum without NS_ENUM): `cases[…].swift` is then the global's name. */
  swift: string;
  kind: 'enum' | 'options' | 'typedConstants';
  raw: string;
  cases: Record<string, { swift: string; value?: number | string }>;
}
export interface NativeFunction {
  /** Also 'staticProperty': `owner.swift` (`UIAccessibilityIsVoiceOverRunning()` → `UIAccessibility.isVoiceOverRunning`). */
  kind: 'init' | 'property' | 'method' | 'function' | 'staticMethod' | 'staticProperty';
  owner?: string; swift: string; self?: number; labels: (string | null)[]; params: SwiftType[]; returns: SwiftType; introduced?: string;
}
export interface NativeConstant { swift: string; type: SwiftType; enumType?: string }
export interface NativeStruct { swift: string; fields: Record<string, SwiftType> }
export interface NativeTable {
  module: string; sdk: string;
  classes: Record<string, NativeClass>;
  enums: Record<string, NativeEnum>;
  functions: Record<string, NativeFunction>;
  constants: Record<string, NativeConstant>;
  structs: Record<string, NativeStruct>;
  /** The module declaring each class or protocol this module refers to (as a base or adopted protocol) but does not declare. */
  types?: Record<string, string>;
  /** What the module's C typedefs stand for, by Swift name (`TimeInterval` → `Double`). */
  typealiases?: Record<string, SwiftType>;
}

const COMPILER = fileURLToPath(new URL('../..', import.meta.url));
const TARGET = 'arm64-apple-ios17.0-simulator';

let sdkInfo: { path: string; version: string } | undefined;
function sdk() {
  return sdkInfo ??= {
    path: execFileSync('xcrun', ['--sdk', 'iphonesimulator', '--show-sdk-path'], { encoding: 'utf8' }).trim(),
    version: execFileSync('xcrun', ['--sdk', 'iphonesimulator', '--show-sdk-version'], { encoding: 'utf8' }).trim(),
  };
}
const cacheDir = () => join(COMPILER, '.cache', `ios-${sdk().version}`);

const tables = new Map<string, NativeTable>();

export interface TableOptions {
  /** Arguments that make the module visible to the extractor (`-I`, `-F`); a function runs only when the table is generated. */
  extraArgs?: string[] | (() => string[]);
  /**
   * A module outside the SDK (a plugin's): its table is cached under this key,
   * a hash of its sources, apart from the SDK's, and failing to extract it is an error.
   */
  key?: string;
  /** Internal declarations are in the table too: the module is the app's own, compiled with the code that calls it. */
  internal?: boolean;
}

export function nativeTable(module: string, options: TableOptions = {}): NativeTable {
  let table = tables.get(module);
  if (table) return table;
  const file = options.key ? join(moduleCache(), `${module}-${options.key}.json`) : join(cacheDir(), `${module}.json`);
  if (existsSync(file)) table = JSON.parse(readFileSync(file, 'utf8')) as NativeTable;
  else {
    const extraArgs = typeof options.extraArgs === 'function' ? options.extraArgs() : options.extraArgs ?? [];
    table = generate(module, extraArgs, !!options.key, options.internal);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(table));
  }
  tables.set(module, table);
  // Memberwise idioms need only the table's structs: a table cached before one was added gets it here.
  for (const [js, spec] of Object.entries(IDIOMS[module] ?? {})) if (spec && !table.functions[js] && MEMBERWISE.test(spec)) memberwiseIdiom(table, js, spec);
  for (const c of Object.values(table.classes)) {
    if (!c.extension) continue;
    for (const m of [...Object.values(c.instance), ...Object.values(c.static), ...Object.values(c.inits)]) categoryModules.set(m, module);
  }
  return table;
}

const categoryModules = new WeakMap<object, string>();

/** The module adding a member to a class another module declares (`UIView.setPassThroughParent` is TNSWidgets'), which code calling it imports. */
export const categoryModule = (m: NativeMethod | NativeProperty): string | null => categoryModules.get(m) ?? null;

/** The iOS simulator SDK and target the tables are generated for, for building a module to extract. */
export const iosTarget = () => ({ target: TARGET, sdk: sdk().path });

/** Where the tables of modules outside the SDK are cached. */
export const moduleCache = () => join(cacheDir(), 'plugins');

/** A module outside the SDK whose table could not be extracted: its lookups find nothing, rather than an SDK module of its name being extracted. */
export function setEmptyTable(module: string, key: string) {
  const table = emptyTable(module);
  mkdirSync(moduleCache(), { recursive: true });
  writeFileSync(join(moduleCache(), `${module}-${key}.json`), JSON.stringify(table));
  tables.set(module, table);
}

const declarationModules = new Map<string, string>();

/** Declarations in `dtsFile` (a plugin's typings) are `module`'s. */
export function registerDeclarationModule(dtsFile: string, module: string) {
  declarationModules.set(resolve(dtsFile), module);
}

export function moduleOfDeclaration(fileName: string): string | null {
  return declarationModules.get(resolve(fileName)) ?? /^objc!(.+)\.d\.ts$/.exec(basename(fileName))?.[1] ?? null;
}

// ---------------------------------------------------------------- generation

interface Fragment { kind: string; spelling: string; preciseIdentifier?: string }
interface Sym {
  usr: string;
  kind: string;
  path: string[];
  decl: Fragment[];
  params?: { decl: Fragment[] }[];
  returns?: Fragment[];
  introduced?: string;
  mainActor?: boolean;
}
interface Rel { kind: string; source: string; target: string; targetFallback?: string }

function generate(module: string, extraArgs: string[], plugin = false, internal = false): NativeTable {
  const dir = mkdtempSync(join(tmpdir(), `symbols-${module}-`));
  const symbols = new Map<string, Sym>();
  const rels: Rel[] = [];
  // A Swift module's `@objc` declarations (`c:@M@Module@objc(cs)…`; in extensions `c:@CM@Module@…`, `c:@CM@Module@@…`) under the USRs Objective-C's would have.
  const objcUSR = plugin ? (usr: string) => usr.replace(/^c:@C?M@\w+@@?/, 'c:') : (usr: string) => usr;
  try {
    try {
      execFileSync('xcrun', ['swift-symbolgraph-extract', '-module-name', module, '-target', TARGET, '-sdk', sdk().path, '-output-dir', dir,
        // `private` keeps the `__`-prefixed spellings of NS_REFINED_FOR_SWIFT APIs; non-public symbols are dropped below.
        '-minimum-access-level', 'private', '-skip-synthesized-members', '-skip-inherited-docs', ...extraArgs], { stdio: plugin ? ['ignore', 'ignore', 'pipe'] : 'ignore', maxBuffer: 1 << 28 });
    } catch (e: any) {
      if (!plugin) return emptyTable(module);
      const errors = String(e.stderr ?? '').split('\n').filter((l) => /^\S.*\berror:/.test(l));
      throw new Error(`swift-symbolgraph-extract could not read module ${module}:\n${errors.join('\n') || String(e.stderr ?? e.message).trim()}`);
    }
    for (const f of readdirSync(dir)) {
      if (f !== `${module}.symbols.json` && !f.startsWith(`${module}@`)) continue;
      const graph = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      rmSync(join(dir, f));
      for (const s of graph.symbols) {
        s.identifier.precise = objcUSR(s.identifier.precise);
        const sym = compact(s, internal);
        if (sym && plugin && sym.decl.some((f, i) => f.spelling === 'MainActor' && sym.decl[i - 1]?.spelling === '@')) sym.mainActor = true;
        if (!sym) continue;
        const prev = symbols.get(sym.usr);
        // An Objective-C method with a completion handler is imported twice under one USR; the `async` variant drops the handler.
        if (!prev || isAsync(prev)) symbols.set(sym.usr, sym);
      }
      for (const r of graph.relationships as Rel[]) rels.push({ ...r, source: objcUSR(r.source), target: objcUSR(r.target) });
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  return build(module, symbols, rels);
}

function emptyTable(module: string): NativeTable {
  return { module, sdk: sdk().version, classes: {}, enums: {}, functions: {}, constants: {}, structs: {} };
}

function compact(s: any, internal = false): Sym | null {
  let usr: string = s.identifier.precise;
  // Fields of a struct Swift knows by its typedef (`_NSRange` as `NSRange`) appear only as the typedef's synthesized members.
  const typedefField = /@FI@(\w+)::SYNTHESIZED::(c:@T@\w+)$/.exec(usr);
  if (typedefField) usr = `${typedefField[2]}@FI@${typedefField[1]}`;
  else if (usr.includes('::SYNTHESIZED::')) return null;
  if (s.accessLevel !== 'public' && s.accessLevel !== 'open' && !(internal && s.accessLevel === 'internal')) return null;
  const avail: any[] = s.availability ?? [];
  const applies = (a: any) => !a.domain || a.domain === 'iOS' || a.domain === 'Swift' || a.domain === '*';
  if (avail.some((a) => applies(a) && (a.isUnconditionallyUnavailable || a.obsoleted))) return null;
  const ios = avail.find((a) => a.domain === 'iOS')?.introduced;
  return {
    usr,
    kind: s.kind.identifier,
    path: s.pathComponents,
    decl: s.declarationFragments ?? [],
    params: s.functionSignature?.parameters?.map((p: any) => ({ decl: p.declarationFragments })),
    returns: s.functionSignature?.returns,
    introduced: ios ? `${ios.major}.${ios.minor ?? 0}` : undefined,
  };
}

const isAsync = (s: Sym) => s.decl.some((f) => f.kind === 'keyword' && f.spelling === 'async');
const hasKeyword = (s: Sym, k: string) => s.decl.some((f) => f.kind === 'keyword' && f.spelling === k);

/** A printable Swift type from declaration fragments. */
function typeText(fragments: Fragment[]): SwiftType {
  return fragments.map((f) => f.spelling).join('').replace(/@escaping /g, '').replace(/\s+/g, ' ').trim()
    .replace(/\[(\w[\w.]*) : /g, '[$1: ');
}

function paramType(fragments: Fragment[]): SwiftType {
  const text = typeText(fragments);
  return text.slice(text.indexOf(': ') + 2);
}

/** The type of a property or variable declaration. */
function valueType(s: Sym): SwiftType {
  const at = s.decl.findIndex((f) => f.kind === 'identifier');
  const text = typeText(s.decl.slice(at + 1));
  return text.replace(/^: /, '').replace(/ \{.*\}$/, '').replace(/ = .*$/, '');
}

function returnType(s: Sym): SwiftType {
  const text = s.returns ? typeText(s.returns) : '';
  return text === '' || text === '()' ? 'Void' : text;
}

/** `present(_:animated:completion:)` → base name and argument labels. */
function swiftName(s: Sym) {
  const last = s.path[s.path.length - 1];
  const m = /^(.*?)\((.*)\)$/.exec(last);
  if (!m) return { base: last, labels: [] as (string | null)[] };
  return { base: m[1], labels: m[2].split(':').slice(0, -1).map((l) => (l === '_' ? null : l)) };
}

const owner = (s: Sym) => s.path.slice(0, -1).join('.');
const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** NativeScript's name for a selector: the parts joined, each after the first capitalized. */
export function jsSelectorName(selector: string): string {
  return selector.split(':').filter(Boolean).map((p, i) => (i ? upperFirst(p) : p)).join('');
}

/** NativeScript's object-constructor keys for an `init…` selector; the `NSError **` part is not one. */
function constructorKeys(selector: string, errorPart?: number): string {
  const parts = selector.includes(':') ? selector.split(':').slice(0, -1).filter(Boolean) : [];
  const keys = parts.filter((_, i) => i !== errorPart).map((p, i) => {
    if (i) return p;
    const rest = p.replace(/^init/, '').replace(/^With(?=[A-Z_])/, '');
    return /^[A-Z][A-Z]/.test(rest) ? rest : rest.charAt(0).toLowerCase() + rest.slice(1);
  });
  return keys.join(',');
}

const errorPartOf = (selector: string) => {
  const parts = selector.split(':').filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) if (/error$/i.test(parts[i])) return i;
  return parts.length - 1;
};

function method(s: Sym, selector: string, ownerSwift: string): NativeMethod {
  const { base, labels } = swiftName(s);
  const isInit = s.kind === 'swift.init';
  const params = (s.params ?? []).map((p) => paramType(p.decl));
  const m: NativeMethod = { kind: isInit ? 'init' : 'method', swift: base, labels, params, returns: 'Void', selector };
  if (isInit) {
    const text = typeText(s.decl);
    const optional = /\binit\?/.test(text) ? '?' : /\binit!/.test(text) ? '!' : '';
    m.returns = ownerSwift + optional;
    if (optional) m.failable = true;
  } else m.returns = returnType(s);
  if (hasKeyword(s, 'throws')) {
    m.throws = true;
    m.errorParam = errorPartOf(selector);
  }
  if (s.introduced) m.introduced = s.introduced;
  if (s.mainActor) m.mainActor = true;
  return m;
}

/** Which parameters of a declaration have default values. */
function defaultedParams(s: Sym): boolean[] {
  const out: boolean[] = [];
  for (const f of s.decl) {
    if (f.kind === 'externalParam') out.push(false);
    else if (f.kind === 'text' && out.length && / = /.test(f.spelling)) out[out.length - 1] = true;
  }
  return out;
}

function property(s: Sym): NativeProperty {
  const readonly = hasKeyword(s, 'let') || !hasKeyword(s, 'set') && s.decl.some((f) => f.spelling.includes('{'));
  const p: NativeProperty = { kind: 'property', swift: s.path[s.path.length - 1], type: valueType(s), readonly };
  if (s.introduced) p.introduced = s.introduced;
  if (s.mainActor) p.mainActor = true;
  return p;
}

const OBJC = /^c:objc\((cs|pl)\)([A-Za-z0-9_]+)(?:\((im|cm|py|cpy)\)(.+))?$/;

function build(module: string, symbols: Map<string, Sym>, rels: Rel[]): NativeTable {
  const table = emptyTable(module);
  const types: Record<string, string> = {};
  const memberOf = new Map<string, Rel>();
  const members = new Map<string, string[]>();
  for (const r of rels) {
    if (r.kind !== 'memberOf') continue;
    memberOf.set(r.source, r);
    let list = members.get(r.target);
    if (!list) members.set(r.target, list = []);
    list.push(r.source);
  }
  const classNames = new Set<string>();
  for (const usr of symbols.keys()) {
    const m = OBJC.exec(usr);
    if (m && m[1] === 'cs' && !m[3]) classNames.add(m[2]);
  }
  // A protocol named like a class is `<Name>Protocol` in JavaScript (`NSObjectProtocol`).
  const jsTypeName = (kind: string, name: string) => (kind === 'pl' && (classNames.has(name) || name === 'NSObject') ? name + 'Protocol' : name);
  const fallbackModule = (r?: Rel) => r?.targetFallback?.split('.')[0];
  const fallbackSwift = (r?: Rel) => r?.targetFallback?.split('.').slice(1).join('.');

  const classOf = (usr: string, rel?: Rel): NativeClass | null => {
    const m = OBJC.exec(usr);
    if (!m) return null;
    const js = jsTypeName(m[1], m[2]);
    let c = table.classes[js];
    if (!c) {
      const own = symbols.get(usr);
      table.classes[js] = c = {
        swift: own ? own.path.join('.') : fallbackSwift(rel) ?? m[2],
        kind: m[1] === 'cs' ? 'class' : 'protocol',
        module: own ? module : fallbackModule(rel) ?? module,
        instance: {}, static: {}, constructors: {}, inits: {},
      };
      if (!own) c.extension = true;
      if (own?.introduced) c.introduced = own.introduced;
      const generics = own?.decl.filter((f) => f.kind === 'genericParameter').map((f) => f.spelling);
      if (generics?.length) c.generics = generics;
    }
    return c;
  };

  for (const r of rels) {
    if (r.kind !== 'inheritsFrom' && r.kind !== 'conformsTo' || !symbols.has(r.source)) continue;
    const c = OBJC.exec(r.source)?.[3] ? null : classOf(r.source);
    const t = OBJC.exec(r.target);
    if (!c || c.extension || !t || t[3]) continue;
    const name = jsTypeName(t[1], t[2]);
    if (!symbols.has(r.target) && r.targetFallback) types[name] = fallbackModule(r)!;
    if (r.kind === 'inheritsFrom') c.base = name;
    else if (t[1] === 'pl') (c.protocols ??= []).includes(name) || c.protocols.push(name);
  }

  const enumOf = (usr: string, rel?: Rel): NativeEnum | null => {
    const m = /^c:@(?:E|EA|T)@(\w+)$/.exec(usr);
    if (!m) return null;
    const own = symbols.get(usr);
    let e = table.enums[m[1]];
    if (!e) {
      const raw = (members.get(usr) ?? []).map((u) => symbols.get(u)).find((s) => s?.kind === 'swift.init' && s.path[s.path.length - 1] === 'init(rawValue:)');
      table.enums[m[1]] = e = {
        swift: own ? own.path.join('.') : fallbackSwift(rel) ?? m[1],
        kind: usr.startsWith('c:@T@') ? 'typedConstants' : own?.kind === 'swift.enum' ? 'enum' : 'options',
        raw: raw?.params?.length ? paramType(raw.params[0].decl) : '',
        cases: {},
      };
    }
    return e;
  };

  const fieldsOf = (struct: string) => {
    const fields: Record<string, SwiftType> = {};
    for (const [u, f] of symbols) {
      const field = u.startsWith(struct + '@FI@') && /@FI@(\w+)$/.exec(u);
      if (field) fields[field[1]] = valueType(f);
    }
    return fields;
  };

  const enumCases = new Map<string, { usr: string; cName: string; swift: string }[]>();
  for (const [usr, s] of symbols) {
    const objc = OBJC.exec(usr);
    if (objc) {
      if (!objc[3]) { classOf(usr); continue; }
      const rel = memberOf.get(usr);
      const c = classOf(rel?.target ?? `c:objc(${objc[1]})${objc[2]}`, rel);
      if (!c) continue;
      const [, , , part, name] = objc;
      const isStatic = part === 'cm' || part === 'cpy';
      if (s.kind === 'swift.property' || s.kind === 'swift.type.property') {
        const target = isStatic ? c.static : c.instance;
        const js = part === 'py' || part === 'cpy' ? name : jsSelectorName(name);
        target[js] ??= property(s);
      } else if (s.kind === 'swift.method' || s.kind === 'swift.type.method' || s.kind === 'swift.init') {
        const m = method(s, name, c.swift);
        const js = jsSelectorName(name);
        if (m.kind === 'init' && !isStatic) {
          c.inits[js] ??= m;
          c.constructors[constructorKeys(name, m.throws ? m.errorParam : undefined)] ??= m;
        } else (isStatic ? c.static : c.instance)[js] ??= m;
      }
      continue;
    }
    let m: RegExpExecArray | null;
    if (usr.startsWith('s:') && s.kind === 'swift.init') {
      const rel = memberOf.get(usr);
      const c = rel && OBJC.test(rel.target) ? classOf(rel.target, rel) : null;
      if (c) (c.swiftInits ??= []).push({ ...method(s, '', c.swift), errorParam: undefined, defaults: defaultedParams(s) });
    } else if ((m = /^c:@(?:E|EA)@(\w+)@(\w+)$/.exec(usr))) {
      const rel = memberOf.get(usr);
      const e = enumOf(rel?.target ?? `c:@E@${m[1]}`, rel);
      if (!e) continue;
      let list = enumCases.get(m[1]);
      if (!list) enumCases.set(m[1], list = []);
      list.push({ usr, cName: m[2], swift: s.path.join('.') });
    } else if ((m = /^c:@(?:Ea@\w+@|macro@)?(\w+)$/.exec(usr)) && /property|var/.test(s.kind)) {
      const rel = memberOf.get(usr);
      const typed = rel && /^c:@T@(\w+)$/.exec(rel.target);
      const constant: NativeConstant = { swift: s.path.join('.'), type: valueType(s) };
      if (typed) {
        const e = enumOf(rel.target, rel)!;
        e.cases[m[1]] = { swift: s.path[s.path.length - 1] };
        constant.enumType = typed[1];
      }
      table.constants[m[1]] ??= constant;
    } else if ((m = /^c:@F@(\w+)$/.exec(usr))) {
      const f = cFunction(s);
      if (f) table.functions[m[1]] ??= f;
    } else if ((m = /^c:@SA?@(\w+)$/.exec(usr)) && s.kind === 'swift.struct') {
      table.structs[m[1]] = { swift: s.path.join('.'), fields: fieldsOf(usr) };
    } else if ((m = /^c:@T@(\w+)$/.exec(usr)) && s.kind === 'swift.typealias') {
      const aliased = s.decl.slice(s.decl.findIndex((f) => f.spelling.includes('=')) + 1);
      const target = aliased.length === 1 && /^c:@SA?@\w+$/.test(aliased[0].preciseIdentifier ?? '') ? aliased[0].preciseIdentifier : undefined;
      const fields = fieldsOf(target ?? usr);
      if (target || Object.keys(fields).length) table.structs[m[1]] ??= { swift: s.path.join('.'), fields };
      const text = typeText(s.decl);
      (table.typealiases ??= {})[s.path.join('.')] = text.slice(text.indexOf('=') + 1).trim();
    } else if (s.kind === 'swift.var' && usr.startsWith('s:So') && s.path.length === 1) {
      // An anonymous enum's constant, imported as a global variable.
      table.constants[s.path[0]] ??= { swift: s.path[0], type: valueType(s) };
    } else if (/^c:@(?:E|EA|T)@\w+$/.test(usr) && (s.kind === 'swift.enum' || s.kind === 'swift.struct')) {
      if (!usr.startsWith('c:@T@')) enumOf(usr);
    }
  }

  for (const [js, list] of enumCases) {
    const e = table.enums[js];
    const prefix = enumPrefix(list.map((c) => c.cName), js);
    const global = list.every((c) => !c.swift.includes('.'));
    if (global) e.swift = '';
    for (const c of list) e.cases[c.cName.slice(prefix.length)] = { swift: global ? c.swift : c.swift.slice(c.swift.lastIndexOf('.') + 1) };
  }
  for (const [js, e] of Object.entries(table.enums)) if (e.kind === 'typedConstants' && !Object.keys(e.cases).length) delete table.enums[js];

  // A subclass of a UIKit class is isolated as its superclass is, which Swift imports as preconcurrency: calls need nothing.
  for (const c of Object.values(table.classes)) {
    let base = c.base;
    while (base && table.classes[base] && !table.classes[base].extension) base = table.classes[base].base;
    if (c.kind === 'protocol' || !c.extension && (!base || base === 'NSObject')) continue;
    for (const m of [...Object.values(c.instance), ...Object.values(c.static), ...Object.values(c.inits)]) delete m.mainActor;
  }
  if (module === 'ObjectiveC') addNSObjectFactories(table);
  // CoreFoundation declares CGFloat itself, so its own symbol graph spells the C typedef as `Double`; every floating field of its CG structs is a CGFloat.
  if (module === 'CoreFoundation') {
    for (const [js, st] of Object.entries(table.structs)) {
      if (!js.startsWith('CG')) continue;
      for (const f in st.fields) if (st.fields[f] === 'Double') st.fields[f] = 'CGFloat';
    }
  }
  if (IDIOMS[module]) addIdioms(table, symbols, IDIOMS[module]);
  if (Object.keys(types).length) table.types = types;
  return table;
}

/**
 * The prefix NativeScript drops from an enum's members: the characters the
 * members and the enum's name share, cut back to where a word starts in every
 * member, and one word more if a member would then start with a digit.
 */
function enumPrefix(names: string[], enumName: string): string {
  let p = commonPrefix([...names, enumName]);
  const backOff = () => {
    let i = p.length - 1;
    while (i > 0 && !/[A-Z]/.test(p[i])) i--;
    p = p.slice(0, Math.max(i, 0));
  };
  while (p && names.some((n) => n.length === p.length || /[a-z]/.test(n[p.length]))) backOff();
  if (p && names.some((n) => /\d/.test(n[p.length]))) backOff();
  while (p && names.every((n) => n[p.length] === '_' && n.length > p.length + 1)) p += '_';
  return p;
}

function commonPrefix(names: string[]): string {
  let p = names[0] ?? '';
  for (const n of names) while (!n.startsWith(p)) p = p.slice(0, -1);
  return p;
}

function cFunction(s: Sym): NativeFunction | null {
  const { base, labels } = swiftName(s);
  const params = (s.params ?? []).map((p) => paramType(p.decl));
  const f: NativeFunction = { kind: 'function', swift: base, labels, params, returns: returnType(s) };
  switch (s.kind) {
    case 'swift.func': break;
    case 'swift.init': {
      const optional = /\binit\?/.test(typeText(s.decl)) ? '?' : '';
      Object.assign(f, { kind: 'init', owner: owner(s), swift: 'init', returns: owner(s) + optional });
      break;
    }
    case 'swift.method': Object.assign(f, { kind: 'method', owner: owner(s), self: 0 }); break;
    case 'swift.type.method': Object.assign(f, { kind: 'staticMethod', owner: owner(s) }); break;
    case 'swift.property': Object.assign(f, { kind: 'property', owner: owner(s), self: 0, returns: valueType(s) }); break;
    case 'swift.type.property': Object.assign(f, { kind: 'staticProperty', owner: owner(s), returns: valueType(s) }); break;
    default: return null;
  }
  if (s.introduced) f.introduced = s.introduced;
  return f;
}

/** `NSObject.new()` is unavailable in Swift; it means `NSObject()`. */
function addNSObjectFactories(table: NativeTable) {
  const c = table.classes.NSObject;
  if (!c) return;
  const init: NativeMethod = { kind: 'init', swift: 'init', labels: [], params: [], returns: c.swift, selector: 'new' };
  c.static.new = init;
  c.constructors[''] ??= { ...init, selector: 'init' };
}

/**
 * C functions and constants with an idiomatic Swift spelling the importer does
 * not record against the C name (most still compile as C). Each JavaScript name maps to:
 * - an overlay symbol path, `#Type` choosing the overload by its first parameter's type;
 * - `Struct(field:field:)`, a struct's memberwise initializer, with `Module:` if another module declares the struct;
 * - null: unavailable in Swift, with no member to call instead.
 */
const IDIOMS: Record<string, Record<string, string | null>> = {
  CoreGraphics: {
    CGRectMake: 'CGRect.init(x:y:width:height:)#CGFloat', CGPointMake: 'CoreFoundation:CGPoint(x:y:)',
    CGSizeMake: 'CoreFoundation:CGSize(width:height:)', CGVectorMake: 'CoreFoundation:CGVector(dx:dy:)',
    CGRectGetWidth: 'CGRect.width', CGRectGetHeight: 'CGRect.height', CGRectGetMinX: 'CGRect.minX', CGRectGetMidX: 'CGRect.midX',
    CGRectGetMaxX: 'CGRect.maxX', CGRectGetMinY: 'CGRect.minY', CGRectGetMidY: 'CGRect.midY', CGRectGetMaxY: 'CGRect.maxY',
    CGRectIsEmpty: 'CGRect.isEmpty', CGRectIsNull: 'CGRect.isNull', CGRectIsInfinite: 'CGRect.isInfinite',
    CGRectStandardize: 'CGRect.standardized', CGRectIntegral: 'CGRect.integral',
    CGRectInset: 'CGRect.insetBy(dx:dy:)', CGRectOffset: 'CGRect.offsetBy(dx:dy:)', CGRectUnion: 'CGRect.union(_:)',
    CGRectIntersection: 'CGRect.intersection(_:)', CGRectContainsPoint: 'CGRect.contains(_:)#CGPoint',
    CGRectContainsRect: 'CGRect.contains(_:)#CGRect', CGRectIntersectsRect: 'CGRect.intersects(_:)', CGRectEqualToRect: 'CGRect.equalTo(_:)',
    CGRectApplyAffineTransform: 'CGRect.applying(_:)', CGPointEqualToPoint: 'CGPoint.equalTo(_:)', CGSizeEqualToSize: 'CGSize.equalTo(_:)',
    CGPointApplyAffineTransform: 'CGPoint.applying(_:)', CGSizeApplyAffineTransform: 'CGSize.applying(_:)',
    CGAffineTransformMake: 'CGAffineTransform.init(a:b:c:d:tx:ty:)#CGFloat', CGAffineTransformMakeRotation: 'CGAffineTransform.init(rotationAngle:)',
    CGAffineTransformMakeScale: 'CGAffineTransform.init(scaleX:y:)', CGAffineTransformMakeTranslation: 'CGAffineTransform.init(translationX:y:)',
    CGAffineTransformRotate: 'CGAffineTransform.rotated(by:)', CGAffineTransformScale: 'CGAffineTransform.scaledBy(x:y:)',
    CGAffineTransformTranslate: 'CGAffineTransform.translatedBy(x:y:)', CGAffineTransformInvert: 'CGAffineTransform.inverted()',
    CGAffineTransformConcat: 'CGAffineTransform.concatenating(_:)', CGAffineTransformIsIdentity: 'CGAffineTransform.isIdentity',
    CGAffineTransformEqualToTransform: null,
    CGRectZero: 'CGRect.zero', CGRectNull: 'CGRect.null', CGRectInfinite: 'CGRect.infinite', CGPointZero: 'CGPoint.zero',
    CGSizeZero: 'CGSize.zero', CGAffineTransformIdentity: 'CGAffineTransform.identity',
  },
  Foundation: {
    NSMakeRange: 'NSRange(location:length:)',
  },
  QuartzCore: {
    CAFrameRateRangeMake: 'CAFrameRateRange(minimum:maximum:preferred:)',
  },
};

const MEMBERWISE = /^(?:(\w+):)?(\w+)\((.*)\)$/;

function memberwiseIdiom(table: NativeTable, js: string, spec: string, introduced?: string) {
  const [, home, struct, labelList] = MEMBERWISE.exec(spec)!;
  const fields = (home ? nativeTable(home) : table).structs[struct]?.fields;
  const labels = labelList.split(':').slice(0, -1);
  if (!fields || labels.some((l) => !fields[l])) return;
  table.functions[js] = { kind: 'init', owner: struct, swift: 'init', labels, params: labels.map((l) => fields[l]), returns: struct, introduced };
}

function addIdioms(table: NativeTable, symbols: Map<string, Sym>, idioms: Record<string, string | null>) {
  const byPath = new Map<string, Sym[]>();
  for (const s of symbols.values()) {
    if (!s.usr.startsWith('s:')) continue;
    const key = s.path.join('.');
    let list = byPath.get(key);
    if (!list) byPath.set(key, list = []);
    list.push(s);
  }
  for (const [js, spec] of Object.entries(idioms)) {
    const introduced = table.functions[js]?.introduced;
    if (spec === null) {
      delete table.functions[js];
      continue;
    }
    if (MEMBERWISE.test(spec)) {
      memberwiseIdiom(table, js, spec, introduced);
      continue;
    }
    const [path, firstType] = spec.split('#');
    const s = byPath.get(path)?.find((s) => !firstType || (s.params?.[0] && paramType(s.params[0].decl) === firstType));
    if (!s) continue;
    if (s.kind === 'swift.type.property') {
      table.constants[js] = { swift: path, type: valueType(s) };
      continue;
    }
    const f = cFunction(s);
    if (f) table.functions[js] = { ...f, introduced };
  }
}

// ---------------------------------------------------------------- lookup

let cached: string[] | undefined;

/** Every table generated so far, the given module's first. */
function allTables(first: string): NativeTable[] {
  if (!cached) {
    const dir = cacheDir();
    cached = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)) : [];
  }
  const names = new Set([first, ...tables.keys(), ...cached]);
  return [...names].map((m) => nativeTable(m));
}

/** The module declaring a class or protocol, as seen from `module`. */
function homeOf(module: string, js: string): string | null {
  const t = nativeTable(module);
  const c = t.classes[js];
  if (c) return c.module;
  if (t.types?.[js]) return t.types[js];
  for (const other of allTables(module)) if (other.classes[js] && !other.classes[js].extension) return other.module;
  return null;
}

/** A class's entries by JavaScript name, breadth first: itself (with its categories from other modules), then its superclasses and protocols. */
function* hierarchy(module: string, jsClass: string): Generator<[string, NativeClass]> {
  const seen = new Set<string>();
  const queue: [string, string][] = [[module, jsClass]];
  while (queue.length) {
    const [from, js] = queue.shift()!;
    if (seen.has(js)) continue;
    seen.add(js);
    const home = homeOf(from, js);
    if (!home) continue;
    const main = nativeTable(home).classes[js];
    if (main) yield [js, main];
    for (const t of allTables(home)) {
      const c = t.classes[js];
      if (c && c !== main && c.extension) yield [js, c];
    }
    if (main?.base) queue.push([home, main.base]);
    for (const p of main?.protocols ?? []) queue.push([home, p]);
  }
}

/** An initializer found on a superclass creates the receiving class. */
function rehome<T extends NativeMethod | NativeProperty>(m: T, found: NativeClass, receiver: NativeClass | null): T {
  if (m.kind !== 'init' || !receiver || found.swift === receiver.swift) return m;
  return sameModule({ ...m, returns: receiver.swift + (/[?!]$/.exec(m.returns)?.[0] ?? '') }, m);
}

function sameModule<T extends object>(copy: T, of: object): T {
  const module = categoryModules.get(of);
  if (module) categoryModules.set(copy, module);
  return copy;
}

type SwiftInit = NonNullable<NativeClass['swiftInits']>[number];

/** An overlay initializer called with the parameters `take` accepts, in order; every other parameter must have a default. */
function callSwiftInit(init: SwiftInit, take: (label: string | null) => boolean, complete: () => boolean): NativeMethod | null {
  const used: number[] = [];
  for (let i = 0; i < init.labels.length; i++) {
    if (take(init.labels[i])) used.push(i);
    else if (!init.defaults[i]) return null;
  }
  if (!complete()) return null;
  const { defaults, ...m } = init;
  return { ...m, labels: used.map((i) => init.labels[i]), params: used.map((i) => init.params[i]) };
}

function findInit(module: string, jsClass: string, own: (c: NativeClass) => NativeMethod | undefined, overlay: (init: SwiftInit) => NativeMethod | null): NativeMethod | null {
  const receiver = lookupClass(module, jsClass);
  for (const [, c] of hierarchy(module, jsClass)) {
    const m = own(c);
    if (m) return rehome(m, c, receiver);
  }
  for (const [, c] of hierarchy(module, jsClass)) {
    for (const init of c.swiftInits ?? []) {
      const m = overlay(init);
      if (m) return rehome(m, c, receiver);
    }
  }
  return null;
}

export function lookupClass(module: string, jsClass: string): NativeClass | null {
  const home = homeOf(module, jsClass);
  return home ? nativeTable(home).classes[jsClass] ?? null : null;
}

export function lookupMember(module: string, jsClass: string, jsMember: string, isStatic: boolean): NativeMethod | NativeProperty | null {
  const receiver = lookupClass(module, jsClass);
  for (const [, c] of hierarchy(module, jsClass)) {
    const m = (isStatic ? c.static : c.instance)[jsMember];
    if (m) return rehome(m, c, receiver);
  }
  if (!isStatic) return jsMember.startsWith('init') ? lookupInit(module, jsClass, jsMember) : null;
  // Swift drops a factory named after its class (`+[NSArray arrayWithArray:]`, `+[UIBezierPath bezierPath]`)
  // when an initializer has the same Swift name (`init(array:)`, `init()`).
  const factory = /^([A-Za-z][A-Za-z0-9]*?)(With[A-Z]\w*)?$/.exec(jsMember);
  if (!factory) return null;
  for (const [js] of hierarchy(module, jsClass)) {
    if (!js.endsWith(upperFirst(factory[1]))) continue;
    const init = lookupInit(module, jsClass, 'init' + (factory[2] ?? ''));
    return init && sameModule({ ...init, selector: init.selector || jsMember }, init);
  }
  return null;
}

export function lookupConstructor(module: string, jsClass: string, keys: string[]): NativeMethod | null {
  const key = keys.join(',');
  const sorted = [...keys].sort().join(',');
  return findInit(module, jsClass,
    (c) => c.constructors[key] ?? Object.entries(c.constructors).find(([k]) => k.split(',').sort().join(',') === sorted)?.[1],
    (init) => {
      let next = 0;
      return callSwiftInit(init, (label) => label === keys[next] && ++next > 0, () => next === keys.length);
    });
}

export function lookupInit(module: string, jsClass: string, jsInitName: string): NativeMethod | null {
  return findInit(module, jsClass, (c) => c.inits[jsInitName], (init) => {
    let rest = jsInitName.replace(/^init(With)?/, '');
    const take = (label: string | null) => {
      const word = upperFirst(label ?? '');
      if (!label || !rest.startsWith(word) || /^[a-z0-9]/.test(rest.slice(word.length))) return false;
      rest = rest.slice(word.length);
      return true;
    };
    return callSwiftInit(init, take, () => rest === '');
  });
}

export function lookupEnum(module: string, jsEnum: string): NativeEnum | null {
  const found = allTables(module).map((t) => t.enums[jsEnum]).filter(Boolean);
  if (!found.length) return null;
  if (found.length === 1 || found[0].kind !== 'typedConstants') return found[0];
  // Typed constants of one type are spread over the modules that declare them.
  const home = found.find((e) => e.raw) ?? found[0];
  return { ...home, cases: Object.assign({}, ...found.map((e) => e.cases)) };
}

function lookupIn<K extends 'functions' | 'constants' | 'structs'>(module: string, kind: K, js: string): NativeTable[K][string] | null {
  for (const t of allTables(module)) if (t[kind][js]) return t[kind][js];
  return null;
}

export const lookupFunction = (module: string, jsName: string): NativeFunction | null => lookupIn(module, 'functions', jsName);
export const lookupConstant = (module: string, jsName: string): NativeConstant | null => lookupIn(module, 'constants', jsName);
export const lookupStruct = (module: string, jsName: string): NativeStruct | null => lookupIn(module, 'structs', jsName);

/** The type a Swift typedef name stands for (`TimeInterval` → `Double`), through chains of typedefs. */
export function lookupTypealias(module: string, swiftName: string): SwiftType | null {
  let found: SwiftType | null = null;
  for (let name = swiftName, depth = 0; depth < 8; depth++) {
    const next = allTables(module).map((t) => t.typealiases?.[name]).find(Boolean);
    if (!next) break;
    found = name = next;
  }
  return found;
}

// ---------------------------------------------------------------- CLI

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command, ...rest] = process.argv.slice(2);
  // Not awaited: verify.ts imports this module, which must finish evaluating first.
  import('./verify.ts').then(({ verify, check }) => {
    if (command === 'verify') for (const m of rest) verify(m);
    else if (command === 'check') check();
    else console.error('usage: symbols.ts verify <Module>… | check');
  });
}
