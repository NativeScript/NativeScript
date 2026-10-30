import { type Entry, type NativeType, parseNativeType, plan, spelledRepresentation } from './conversion.ts';

// The composite step of a conversion (review/S4-S5-PLAN.md §2): a typed value given to an untyped slot (box), an
// untyped value read as a type (unbox), or one function type given where another is wanted (function). It recurses on
// the element of a container and on a function's parameters (contravariant) and result (covariant), and answers
// identity with one predicate for both backends. It decides; the backends spell.

export type TypeComposite = 'array' | 'record' | 'map' | 'set' | 'promise' | 'shape' | 'class' | 'function' | 'enum'
  | 'primitive' | 'value' | 'any' | 'void';

/** `element`: same container, other element types. `reshape`: one object type given as another of other spelling. */
export type TypeStepKind = 'identity' | 'box' | 'unbox' | 'function' | 'element' | 'reshape';

export interface TypeStep {
  kind: TypeStepKind;
  composite: TypeComposite;
  from: NativeType;
  to: NativeType;
  /** The value after the step is the value before it to `===`: one JavaScript object, however each backend holds it. */
  identity: boolean;
  /** The step itself may throw JavaScript's TypeError; a function's parameter and result steps throw when it is called. */
  throws: boolean;
  /** Elements, or a function's parameters then its result. */
  children: TypeStep[];
  /** A function's parameters where a null or undefined the given function's type lacks may arrive: carried, as JavaScript does (Q7). */
  carried: number[];
  /** A declared limit, refused at build time: a type parameter under a container or function type, which erasure loses (Q10). */
  refuse?: string;
}

/** What the spelling alone can't tell: a backend's facts about a named type. */
export interface TypeFacts {
  shape?(name: string): boolean;
  enumType?(name: string): boolean;
}

const CONTAINERS: ReadonlySet<string> = new Set(['array', 'record', 'map', 'set', 'promise']);
const PRIMITIVES: ReadonlySet<string> = new Set(['string', 'number', 'boolean', 'bigint', 'symbol']);

export function composite(t: NativeType, facts: TypeFacts = {}): TypeComposite {
  if (t.kind === 'nullish' && t.args[0]) return composite(t.args[0], facts);
  if (CONTAINERS.has(t.kind) || t.kind === 'function' || t.kind === 'any' || t.kind === 'value') return t.kind as TypeComposite;
  if (PRIMITIVES.has(t.kind)) return 'primitive';
  if (t.kind === 'void' || t.kind === 'never') return 'void';
  if (facts.enumType?.(t.name)) return 'enum';
  return facts.shape?.(t.name) ? 'shape' : 'class';
}

/** One JavaScript value on both sides of any step: functions, containers and objects are references in JavaScript. */
export function keepsIdentity(c: TypeComposite): boolean {
  return c !== 'primitive' && c !== 'void' && c !== 'value' && c !== 'enum';
}

/** A function type's parameters and result, from either backend's spelling (`(A, B) throws -> R`, `(A, B) -> R`). */
export function functionSignature(t: NativeType): { params: NativeType[]; result: NativeType } | null {
  if (t.kind !== 'function') return null;
  const s = t.name.replace(/^suspend /, '');
  let depth = 0, end = -1;
  for (let k = 0; k < s.length; k++) {
    if ('(<['.includes(s[k])) depth++;
    else if (')>]'.includes(s[k]) && !(s[k] === '>' && s[k - 1] === '-') && --depth === 0) { end = k; break; }
  }
  if (end < 0) return null;
  const result = /^\s*(?:async\s+)?(?:throws\s+)?->\s*(.*)$/s.exec(s.slice(end + 1))?.[1];
  if (result === undefined) return null;
  const params = topLevel(s.slice(1, end)).map((p) => parseNativeType(p.replace(/^(?:_ )?\w+: /, '').replace(/^@escaping |^inout |^vararg /, '')));
  return { params, result: parseNativeType(result) };
}

/** The step for a value spelled `from` given where `to` is spelled; `entry` as `plan()` takes it. */
export function typeStep(from: NativeType, to: NativeType, entry: Entry = 'checked', facts: TypeFacts = {}): TypeStep {
  const step = (kind: TypeStepKind, c: TypeComposite, children: TypeStep[] = [], carried: number[] = []): TypeStep => {
    const throws = kind === 'unbox' ? plan({ rep: 'foreign', type: from, kind: 'untyped' }, { rep: spelledRepresentation(to), type: to, kind: 'untyped' }, entry).throws : false;
    const s: TypeStep = { kind, composite: c, from, to, identity: keepsIdentity(c) && !(kind === 'unbox' && c === 'array'), throws, children, carried };
    const erased = kind !== 'identity' && (children.some((x) => x.refuse) || ((c === 'function' || CONTAINERS.has(c)) && [from, to].some(nestedTypeParameter)));
    if (erased) s.refuse = 'a type parameter under a container or function type, which the native type erases';
    return s;
  };
  const f = present(from), t = present(to);
  if (f.name === t.name) return step('identity', composite(t, facts));
  if (t.kind === 'any') return step('box', composite(f, facts), inner(f, t, 'box'));
  if (f.kind === 'any') return step('unbox', composite(t, facts), inner(f, t, 'unbox'));
  if (f.kind === 'function' && t.kind === 'function') {
    const fs = functionSignature(f), gs = functionSignature(t);
    if (!fs || !gs) return step('function', 'function');
    const params = gs.params.map((p, k) => (fs.params[k] ? typeStep(p, fs.params[k], entry, facts) : typeStep(p, p, entry, facts)));
    const carried = gs.params.flatMap((p, k) => (fs.params[k] && (p.optional || p.kind === 'nullish' || p.kind === 'any') && !fs.params[k].optional && fs.params[k].kind !== 'nullish' && fs.params[k].kind !== 'any' ? [k] : []));
    return step('function', 'function', [...params, typeStep(fs.result, gs.result, entry, facts)], carried);
  }
  if (f.kind === t.kind && CONTAINERS.has(t.kind) && f.args.length === t.args.length && f.args.length) {
    return step('element', t.kind as TypeComposite, f.args.map((a, k) => typeStep(a, t.args[k], entry, facts)));
  }
  return step('reshape', composite(t, facts));
}

/** The step of a value spelled `from` held untyped. */
export function boxStep(from: string, entry: Entry = 'checked', facts: TypeFacts = {}): TypeStep {
  return typeStep(parseNativeType(from), parseNativeType('Any?'), entry, facts);
}

/** The step of an untyped value read as `to`. An array read so is a copy of its converted elements (Q9), not one
 * array shared by the typed and untyped sides, where script could write any value into the typed one. */
export function unboxStep(to: string, entry: Entry = 'checked', facts: TypeFacts = {}): TypeStep {
  return typeStep(parseNativeType('Any?'), parseNativeType(to), entry, facts);
}

/** A box's or unbox's inner steps: each element to or from any value; a function's parameters the other way round. */
function inner(f: NativeType, t: NativeType, kind: 'box' | 'unbox'): TypeStep[] {
  const typed = kind === 'box' ? f : t, any = parseNativeType('Any?');
  const sig = functionSignature(typed);
  if (sig) {
    const params = sig.params.map((p) => (kind === 'box' ? typeStep(any, p) : typeStep(p, any)));
    return [...params, kind === 'box' ? typeStep(sig.result, any) : typeStep(any, sig.result)];
  }
  if (!CONTAINERS.has(typed.kind)) return [];
  return typed.args.map((a) => (kind === 'box' ? typeStep(a, any) : typeStep(any, a)));
}

function present(t: NativeType): NativeType {
  return t.kind === 'nullish' && t.args[0] ? present(t.args[0]) : t;
}

function nestedTypeParameter(t: NativeType): boolean {
  const sig = functionSignature(t);
  const parts = sig ? [...sig.params, sig.result] : t.args;
  return parts.some((p) => /^[A-Z]\d?$/.test(p.name) || nestedTypeParameter(p));
}

function topLevel(s: string): string[] {
  const out: string[] = [];
  let depth = 0, from = 0;
  for (let k = 0; k < s.length; k++) {
    if ('(<['.includes(s[k])) depth++;
    else if (')>]'.includes(s[k]) && !(s[k] === '>' && s[k - 1] === '-')) depth--;
    else if (s[k] === ',' && !depth) { out.push(s.slice(from, k)); from = k + 1; }
  }
  out.push(s.slice(from));
  return out.map((x) => x.trim()).filter(Boolean);
}
