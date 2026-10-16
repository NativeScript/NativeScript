// What NativeScriptKit offers translated code, as kit generation writes it beside the kit (`Core/kit-index.json`):
// each public type, the type it extends, its public members with their Swift signatures, and the names it applies
// by name. The generated code's part is recorded by the translator as it emits each declaration; the hand-written
// runtime's is read from its Swift by swift-declarations.ts when the kit is generated. App builds read only the file.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { readSwift, type SwiftFile, type SwiftMember, type SwiftParam } from './swift-declarations.ts';

/**
 * The manifest's format. A change that a reader of an older format would misread (a field renamed, its meaning
 * changed) takes the next number; the translator refuses a version it does not know.
 */
export const KIT_MANIFEST_VERSION = 1;
export const KIT_MANIFEST_FILE = 'kit-index.json';

export type ManifestParam = SwiftParam;

export interface ManifestMember {
  kind: 'var' | 'func' | 'init' | 'subscript' | 'case';
  static?: boolean;
  type: string;
  params?: ManifestParam[];
  throws?: boolean;
  available?: string;
  /** A generic function's parameters as written (`<T>`). */
  generics?: string;
  /** A constant (`let`): a property no forwarder may set. */
  readonly?: boolean;
  /** A top-level function or variable core's index exports (`getRootLayout`), forwarding to the module compiling it. */
  exported?: boolean;
}

export interface ManifestType {
  kind: 'class' | 'struct' | 'enum' | 'protocol' | 'extension' | 'actor';
  /** `core`: generated from @nativescript/core; `runtime`: the kit's hand-written Swift. */
  origin: 'core' | 'runtime';
  /** The class it extends. */
  base?: string;
  /** Another type this name stands for (`typealias`). */
  alias?: string;
  available?: string;
  members: Record<string, ManifestMember[]>;
  /** Names the type applies or reads by name (`subscript(jsKey:)`'s keys, `setProperty`'s cases). */
  names?: string[];
}

export interface KitManifest {
  version: number;
  types: Record<string, ManifestType>;
  /** Public top-level functions and variables (`getRootLayout`, `widthProperty`). */
  globals: Record<string, (ManifestMember & { origin: 'core' | 'runtime' })[]>;
}

/**
 * The types swift-format writes in their short form, as the generated files spell them after formatting:
 * `Optional<T>` as `T?`, `Array<T>` as `[T]`, `Dictionary<K, V>` as `[K: V]`.
 */
export function shorthandType(type: string): string {
  let t = type.trim();
  for (let prev = ''; prev !== t; ) {
    prev = t;
    t = t.replace(/(?<![\w.])(Optional|Array|Dictionary)<([^<>]*(?:<[^<>]*(?:<[^<>]*>[^<>]*)*>[^<>]*)*)>/g, (all, kind: string, inner: string) => {
      if (kind === 'Optional') return /->|&|^(any|some) /.test(inner.trim()) ? `(${inner.trim()})?` : `${inner.trim()}?`;
      if (kind === 'Array') return `[${inner.trim()}]`;
      const parts = splitTop(inner);
      return parts.length === 2 ? `[${parts[0]}: ${parts[1]}]` : all;
    });
  }
  return t;
}

/** A parameter list as the translator writes it (`_ value: Any?, animated: Bool = true`), parameter by parameter. */
export function parsedParams(list: string): ManifestParam[] {
  return splitTop(list).filter(Boolean).map((p) => {
    const colon = topIndex(p, ':');
    const words = (colon < 0 ? p : p.slice(0, colon)).trim().split(/\s+/).filter((w) => !w.startsWith('@'));
    const rest = colon < 0 ? '' : p.slice(colon + 1);
    const eq = topIndex(rest, '=');
    const label = words[0] ?? '_';
    return { label, name: words[1] ?? label, type: shorthandType(eq < 0 ? rest : rest.slice(0, eq)), ...(eq >= 0 ? { default: rest.slice(eq + 1).trim() } : {}) };
  });
}

/** A parameter list as Swift writes it, from the manifest's. */
export function paramsText(params: ManifestParam[]): string {
  return params.map((p) => `${p.label === p.name ? p.name : `${p.label} ${p.name}`}: ${p.type}${p.default !== undefined ? ` = ${p.default}` : ''}`).join(', ');
}

/** A record's list under `key`, made where missing: keys are member names, `constructor` and `toString` among them. */
function listOf<T>(o: Record<string, T[]>, key: string): T[] {
  return Object.hasOwn(o, key) ? o[key] : (o[key] = []);
}

function splitTop(text: string): string[] {
  const out: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ('([<{'.includes(ch)) depth++;
    else if (')]>}'.includes(ch) && text[i - 1] !== '-') depth--;
    else if (ch === ',' && depth === 0) { out.push(text.slice(start, i).trim()); start = i + 1; }
  }
  out.push(text.slice(start).trim());
  return out;
}

function topIndex(text: string, ch: string): number {
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if ('([<{'.includes(c)) depth++;
    else if (')]>}'.includes(c) && text[i - 1] !== '-') depth--;
    else if (c === ch && depth === 0 && !(ch === '=' && text[i + 1] === '=')) return i;
  }
  return -1;
}

/** One declaration the translator emitted, with the modifiers it wrote it with. */
export interface RecordedMember {
  kind: ManifestMember['kind'];
  type: string;
  /** The parameter list as written. */
  params?: string;
  /** `static `, `class `, `override `, `private `, `@available(iOS 17, *) `…, as written before the keyword. */
  mods?: string;
  throws?: boolean;
  available?: number | string;
  generics?: string;
  readonly?: boolean;
  exported?: boolean;
}

/**
 * The declarations kit generation emits, recorded by the translator as it writes each one: per output (a core
 * module, the shapes, the exports), so a module translated again replaces what its first attempt recorded.
 */
export class KitDeclarations {
  private outputs = new Map<string, { types: Map<string, ManifestType>; globals: Map<string, ManifestMember[]> }>();
  private current: { types: Map<string, ManifestType>; globals: Map<string, ManifestMember[]> } | null = null;

  /** Starts recording an output, forgetting what an earlier attempt at it recorded. */
  begin(output: string) {
    this.current = { types: new Map(), globals: new Map() };
    this.outputs.set(output, this.current);
  }

  /** Forgets an output (one left out of the kit). */
  drop(output: string) { this.outputs.delete(output); }

  type(name: string, kind: ManifestType['kind'], base?: string | null, available?: number | string) {
    if (!this.current) return;
    const t = this.current.types.get(name);
    if (t) {
      if (kind !== 'extension') t.kind = kind;
      if (base) t.base = base;
      if (available && kind !== 'extension') t.available = String(available);
      return;
    }
    this.current.types.set(name, { kind, origin: 'core', ...(base ? { base } : {}), ...(available ? { available: String(available) } : {}), members: {} });
  }

  member(owner: string, name: string, m: RecordedMember) {
    if (!this.current || /\b(private|fileprivate)\b/.test(m.mods ?? '')) return;
    if (!this.current.types.has(owner)) this.type(owner, 'extension');
    const t = this.current.types.get(owner)!;
    const list = listOf(t.members, name);
    const r = recorded(m);
    if (!list.some((x) => JSON.stringify(x) === JSON.stringify(r))) list.push(r);
  }

  names(owner: string, names: Iterable<string>) {
    if (!this.current) return;
    if (!this.current.types.has(owner)) this.type(owner, 'extension');
    const t = this.current.types.get(owner)!;
    t.names = [...new Set([...(t.names ?? []), ...names])];
  }

  global(name: string, m: RecordedMember) {
    if (!this.current) return;
    const list = this.current.globals.get(name) ?? [];
    const r = recorded(m);
    if (!list.some((x) => JSON.stringify(x) === JSON.stringify(r))) list.push(r);
    this.current.globals.set(name, list);
  }

  /** The member already recorded (a module's function's signature, which the index's forwarders repeat). */
  find(owner: string, name: string): ManifestMember | undefined {
    for (const o of this.outputs.values()) {
      const t = o.types.get(owner);
      const found = t && Object.hasOwn(t.members, name) ? t.members[name][0] : undefined;
      if (found) return found;
    }
    return undefined;
  }

  /** The kind a type was recorded with, in any output. */
  kindOf(name: string): ManifestType['kind'] | undefined {
    let kind: ManifestType['kind'] | undefined;
    for (const o of this.outputs.values()) {
      const k = o.types.get(name)?.kind;
      if (k && (!kind || kind === 'extension')) kind = k;
    }
    return kind;
  }

  /** Every type recorded, by name. */
  typeNames(): Set<string> {
    return new Set([...this.outputs.values()].flatMap((o) => [...o.types.keys()]));
  }

  /** What every output recorded, merged per type. */
  manifest(): Pick<KitManifest, 'types' | 'globals'> {
    const types: Record<string, ManifestType> = {};
    const globals: KitManifest['globals'] = {};
    for (const o of this.outputs.values()) {
      for (const [name, t] of o.types) {
        const into = Object.hasOwn(types, name) ? types[name] : undefined;
        if (!into) { types[name] = { ...t, members: Object.fromEntries(Object.entries(t.members).map(([k, v]) => [k, [...v]])) }; continue; }
        if (t.kind !== 'extension') into.kind = t.kind;
        if (t.base) into.base = t.base;
        if (t.available && t.kind !== 'extension') into.available = t.available;
        for (const [k, v] of Object.entries(t.members)) listOf(into.members, k).push(...v);
        if (t.names) into.names = [...new Set([...(into.names ?? []), ...t.names])];
      }
      for (const [name, list] of o.globals) listOf(globals, name).push(...list.map((m) => ({ ...m, origin: 'core' as const })));
    }
    return { types, globals };
  }
}

function recorded(m: RecordedMember): ManifestMember {
  const mods = m.mods ?? '';
  const available = m.available ?? /@available\(iOS ([\d.]+)/.exec(mods)?.[1];
  return {
    kind: m.kind,
    ...(/\b(static|class)\b/.test(mods) || m.kind === 'init' ? { static: true } : {}),
    // A stored property's type as the translator writes it can carry its initial value (`Any? = nil`).
    type: shorthandType(topIndex(m.type, '=') < 0 ? m.type : m.type.slice(0, topIndex(m.type, '='))),
    ...(m.params !== undefined ? { params: parsedParams(m.params) } : {}),
    ...(m.throws ? { throws: true } : {}),
    ...(available ? { available: String(available) } : {}),
    ...(m.generics ? { generics: m.generics } : {}),
    ...(m.readonly ? { readonly: true } : {}),
    ...(m.exported ? { exported: true } : {}),
  };
}

/** Protocols a class's inheritance list can start with: the list names its superclass first, if any. */
const NOT_A_BASE = /Protocol$|Convertible$|Equatable|Hashable|^Sendable$|^Error$|^Codable$/;

/**
 * The hand-written Swift of the kit (`files`: paths under `dir`), as the manifest has it: public types and
 * members, the base class of each class, aliases, and the names its code reads by name.
 */
export function runtimeSurface(dir: string, files: string[]): Pick<KitManifest, 'types' | 'globals'> {
  const read: SwiftFile[] = files.map((f) => readSwift(readFileSync(join(dir, f), 'utf8')));
  const protocols = new Set(read.flatMap((f) => f.types.filter((t) => t.kind === 'protocol').map((t) => t.name)));
  const types: Record<string, ManifestType> = {};
  const globals: KitManifest['globals'] = {};
  // Names a free function handles, for the types that call it (`applyTextInputTrait`).
  const functionNames = new Map<string, Set<string>>();
  for (const f of read) for (const g of f.globals) if (g.kind === 'func') functionNames.set(g.name, new Set([...(functionNames.get(g.name) ?? []), ...g.names]));
  const calls = new Map<string, Set<string>>();
  const aliases: [string, string][] = [];
  for (const f of read) {
    for (const t of f.types) {
      if (!t.public) continue;
      const first = t.inherits[0]?.replace(/<.*$/, '');
      const base = t.kind === 'class' && first && !NOT_A_BASE.test(first) && !protocols.has(first) ? first : undefined;
      const into = (Object.hasOwn(types, t.name) ? types[t.name] : (types[t.name] = { kind: t.kind, origin: 'runtime', members: {} }));
      if (t.kind !== 'extension') into.kind = t.kind;
      if (base) into.base = base;
      if (t.available && t.kind !== 'extension') into.available = t.available;
      for (const [name, m] of t.members) {
        const list = listOf(into.members, name), x = member(m);
        if (!list.some((y) => JSON.stringify(y) === JSON.stringify(x))) list.push(x);
      }
      if (t.names.size) into.names = [...new Set([...(into.names ?? []), ...t.names])];
      calls.set(t.name, new Set([...(calls.get(t.name) ?? []), ...t.calls]));
      for (const [alias, target] of t.aliases) aliases.push([`${t.name}.${alias}`, target.replace(/^NativeScriptKit\./, '')]);
    }
    for (const g of f.globals) if (g.public) listOf(globals, g.name).push({ ...member(g), origin: 'runtime' });
  }
  for (const [name, called] of calls) {
    const names = new Set(types[name].names ?? []);
    for (const fn of called) for (const n of functionNames.get(fn) ?? []) names.add(n);
    if (names.size) types[name].names = [...names];
  }
  // Shorthands (`borderRadius`, `margin`) any view takes, expanded by a top-level function.
  const shorthands = functionNames.get('expandShorthand');
  if (shorthands?.size && Object.hasOwn(types, 'View')) types.View.names = [...new Set([...(types.View.names ?? []), ...shorthands])];
  for (const [alias, target] of aliases) if (Object.hasOwn(types, target) && !Object.hasOwn(types, alias)) types[alias] = { kind: types[target].kind, origin: 'runtime', alias: target, members: {} };
  return { types, globals };
}

function member(m: SwiftMember): ManifestMember {
  return { kind: m.kind, ...(m.static ? { static: true } : {}), type: m.type, ...(m.params ? { params: m.params } : {}), ...(m.throws ? { throws: true } : {}), ...(m.available ? { available: m.available } : {}) };
}

/** The hand-written Swift files of a kit's sources (relative paths): every one outside `Core/`, less `exclude`. */
export function runtimeFiles(dir: string, exclude?: RegExp | null): string[] {
  return (readdirSync(dir, { recursive: true }) as string[]).filter((f) => f.endsWith('.swift') && !f.startsWith('Core/') && !exclude?.test(f)).sort();
}

/** Merges the runtime's surface into the generated code's: a type both declare keeps the generated declaration's kind and base. */
export function mergedManifest(core: Pick<KitManifest, 'types' | 'globals'>, runtime: Pick<KitManifest, 'types' | 'globals'>): KitManifest {
  const types: Record<string, ManifestType> = { ...runtime.types };
  for (const [name, t] of Object.entries(core.types)) {
    const r = Object.hasOwn(types, name) ? types[name] : undefined;
    if (!r) { types[name] = t; continue; }
    const members = { ...r.members };
    for (const [k, v] of Object.entries(t.members)) members[k] = [...(Object.hasOwn(members, k) ? members[k] : []), ...v];
    const names = [...new Set([...(r.names ?? []), ...(t.names ?? [])])];
    types[name] = { ...r, ...(t.kind !== 'extension' ? { kind: t.kind, origin: 'core' as const } : {}), ...(t.base ?? r.base ? { base: t.base ?? r.base } : {}), members, ...(names.length ? { names } : {}) };
  }
  const globals: KitManifest['globals'] = { ...runtime.globals };
  for (const [name, list] of Object.entries(core.globals)) globals[name] = [...(Object.hasOwn(globals, name) ? globals[name] : []), ...list];
  return sortedManifest({ version: KIT_MANIFEST_VERSION, types, globals });
}

/** The manifest with every key and name list sorted, so the file diffs line by line. */
function sortedManifest(m: KitManifest): KitManifest {
  const sortKeys = <T>(o: Record<string, T>): Record<string, T> => Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
  const types = sortKeys(Object.fromEntries(Object.entries(m.types).map(([k, t]) => [k, { ...t, members: sortKeys(t.members), ...(t.names ? { names: [...t.names].sort() } : {}) }])));
  return { version: m.version, types, globals: sortKeys(m.globals) };
}

export function manifestJSON(m: KitManifest): string {
  // Each member's overloads on one line keeps the file readable and a diff to the members that changed.
  const j = (v: unknown) => JSON.stringify(v);
  const block = (entries: string[], indent: string) => (entries.length ? `{\n${entries.join(',\n')}\n${indent}}` : '{}');
  const members = (o: Record<string, unknown[]>, indent: string) => block(Object.entries(o).map(([k, list]) => `${indent}\t${j(k)}: [${list.map(j).join(', ')}]`), indent);
  const types = Object.entries(m.types).map(([name, t]) => {
    const fields = Object.entries(t).map(([k, v]) => `\t\t\t${j(k)}: ${k === 'members' ? members(v as Record<string, unknown[]>, '\t\t\t') : j(v)}`);
    return `\t\t${j(name)}: ${block(fields, '\t\t')}`;
  });
  return `{\n\t"version": ${m.version},\n\t"types": ${block(types, '\t')},\n\t"globals": ${members(m.globals, '\t')}\n}`;
}

const loaded = new Map<string, { mtime: number; manifest: KitManifest }>();

/** The manifest kit generation wrote into `Core/` of the kit's sources; null where there is none. */
export function readKitManifest(kitSources: string): KitManifest | null {
  const file = join(kitSources, 'Core', KIT_MANIFEST_FILE);
  if (!existsSync(file)) return null;
  const mtime = statSync(file).mtimeMs;
  const cached = loaded.get(file);
  if (cached?.mtime === mtime) return cached.manifest;
  const manifest = JSON.parse(readFileSync(file, 'utf8')) as KitManifest;
  if (manifest.version !== KIT_MANIFEST_VERSION) {
    throw new Error(`${file}: kit index version ${manifest.version}, and this compiler reads version ${KIT_MANIFEST_VERSION}: generate the kit again with this compiler (nx run compiler:kit), or use the compiler it was generated with`);
  }
  loaded.set(file, { mtime, manifest });
  return manifest;
}

/**
 * Names the hand-written Swift (`files` under `dir`) takes at file scope: the types it declares without making them
 * public (`TNSLabel`), and its public functions.
 */
export function runtimeNames(dir: string, files: string[]): { internalTypes: Set<string>; functions: Set<string> } {
  const internalTypes = new Set<string>(), functions = new Set<string>();
  for (const f of files) {
    const read = readSwift(readFileSync(join(dir, f), 'utf8'));
    for (const t of read.types) if (t.topLevel && t.kind !== 'extension' && t.access === 'internal') internalTypes.add(t.name);
    for (const a of read.typealiases) if (a.access === 'internal') internalTypes.add(a.name);
    for (const g of read.globals) if (g.public && g.kind === 'func') functions.add(g.name);
  }
  return { internalTypes, functions };
}
