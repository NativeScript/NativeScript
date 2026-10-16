import { mergedManifest, paramsText, readKitManifest, runtimeFiles, runtimeSurface, type KitManifest, type ManifestMember } from './kit-manifest.ts';

/** A public member of a kit type, as the kit declares it. */
export interface KitMember {
  kind: 'var' | 'func' | 'init' | 'subscript' | 'case';
  static: boolean;
  /** The declared Swift type of a property, or the result of a function. */
  type: string;
  /** A function's parameter list as Swift writes it (labels and types). */
  params?: string;
  /** A function or initializer declared `throws`, or a property whose getter is. */
  throws?: boolean;
  /** The iOS version the member needs. */
  available?: string;
  /** A top-level function or variable core's index exports, which the kit forwards to its module. */
  exported?: boolean;
}

export interface KitType {
  name: string;
  base: string | null;
  members: Map<string, KitMember[]>;
  /** NativeScript property names the type applies by name: the `case` labels of its setProperty, shorthands, and names it reads back (`applied["src"]`). */
  props: Set<string>;
  /** The class of the native view a kit view creates (Android: `createNativeView(): NativeView = VerticalScrollView(…)`), fully qualified. */
  native?: string;
  /** Declared by the kit, not only extended by it (`extension UIView`). */
  declared?: boolean;
  /** Kotlin: the object or class declaring it, for a nested one (`Trace` of `Trace.categories`). */
  outer?: string;
}

/** While the kit is generated from core: the hand-written files the generated code replaces, left out of what it may name. */
export const kitIndexOptions: { exclude: RegExp | null } = { exclude: null };

/** The top-level functions and variables of the kit, as the pseudo-type of this name. */
export const KIT_GLOBALS = '';

/**
 * What NativeScriptKit offers translated code: each public type, the type it extends, and its public members. The
 * translator checks @nativescript/core members against it, so an app using something the kit lacks stops with the
 * file and line instead of failing in the Swift compiler. Read from the kit's manifest; while the kit is generated
 * (or before it ever was), from the hand-written runtime's Swift alone.
 */
export function kitIndex(kitSources: string): Map<string, KitType> {
  const manifest = (!kitIndexOptions.exclude && readKitManifest(kitSources)) || mergedManifest({ types: {}, globals: {} }, runtimeSurface(kitSources, runtimeFiles(kitSources, kitIndexOptions.exclude)));
  return manifestIndex(manifest);
}

const indexes = new WeakMap<KitManifest, Map<string, KitType>>();

export function manifestIndex(manifest: KitManifest): Map<string, KitType> {
  const cached = indexes.get(manifest);
  if (cached) return cached;
  const types = new Map<string, KitType>();
  const member = (m: ManifestMember): KitMember => ({ kind: m.kind, static: !!m.static, type: m.type, ...(m.params ? { params: paramsText(m.params) } : {}), ...(m.throws ? { throws: true } : {}), ...(m.available ? { available: m.available } : {}), ...(m.exported ? { exported: true } : {}) });
  for (const [name, t] of Object.entries(manifest.types)) {
    if (t.alias) continue;
    types.set(name, { name, base: t.base ?? null, members: new Map(Object.entries(t.members).map(([k, v]) => [k, v.map(member)])), props: new Set(t.names ?? []), ...(t.kind !== 'extension' ? { declared: true } : {}) });
  }
  for (const [name, t] of Object.entries(manifest.types)) if (t.alias && types.has(t.alias)) types.set(name, types.get(t.alias)!);
  types.set(KIT_GLOBALS, { name: KIT_GLOBALS, base: null, members: new Map(Object.entries(manifest.globals).map(([k, v]) => [k, v.map(member)])), props: new Set() });
  indexes.set(manifest, types);
  return types;
}

/** Property names a kit class reads from its own stored values (`applied["src"]`, `get("dateStyle")`) or tests for (`name == "orientation"`): a value set by name reaches them. */
export function readNames(line: string): string[] {
  return [...line.matchAll(/(?<![\w.?])(?:self\.|this\.)?(?:(?:applied|locals)\["(\w+)"\]|get\("(\w+)"\))|\bname\s*==\s*"(\w+)"/g)].map((m) => m[1] ?? m[2] ?? m[3]);
}

/** A member of `type` or of a type it extends. */
export function kitMember(index: Map<string, KitType>, type: string, name: string): KitMember | null {
  for (let t = index.get(type); t; t = t.base ? index.get(t.base) : undefined) {
    const found = t.members.get(name);
    if (found) return found[0];
  }
  return null;
}

/** Whether `type` is `base` or extends it. */
export function kitExtends(index: Map<string, KitType>, type: string, base: string): boolean {
  for (let t = index.get(type); t; t = t.base ? index.get(t.base) : undefined) if (t.name === base) return true;
  return false;
}
