import type { Form, Representation } from './forms.ts';

// One conversion between slots (review/S3-PLAN.md §2): which of the 5×5 representation cells a placement is, decided
// from the two slots' forms and how the value enters, for both translators. It decides; the backends spell.

/** Where a value is placed or read. */
export type SlotKind = 'argument' | 'return' | 'field' | 'literalField' | 'variable' | 'binding' | 'element' | 'entry'
  | 'spread' | 'await' | 'callbackParameter' | 'callbackResult' | 'receiver' | 'condition' | 'operand' | 'untyped';

/** How a foreign value comes in: checked (M6), narrowed by a type test (M7), lenient (non-strict code), library (core). */
export type Entry = 'typed' | 'checked' | 'narrowed' | 'lenient' | 'library';

export type NativeKind = 'string' | 'number' | 'boolean' | 'bigint' | 'symbol' | 'void' | 'never' | 'any' | 'nullish'
  | 'array' | 'record' | 'map' | 'set' | 'promise' | 'function' | 'object'
  /** A value type a conversion builds from any value, never refusing one: a date, an error, a native struct or enum. */
  | 'value';

/** A backend's spelling of a slot's type, parsed once. */
export interface NativeType {
  kind: NativeKind;
  /** The spelling without its optional mark (`JSArray<String>`, `Card`). */
  name: string;
  /** Type arguments: an array's element, a record's or map's value, a promise's result, a `JSNullish`'s present type. */
  args: NativeType[];
  /** `T?`: nil is one empty state. */
  optional: boolean;
  /** Swift's `T!`: optional, read as present. */
  implicit: boolean;
}

export interface Slot {
  /** The slot's states, where the program decides them; a slot known only by its spelling has none. */
  form?: Form;
  rep: Representation;
  type: NativeType;
  kind: SlotKind;
  /** For TypeError text: the member read, the parameter, the field. */
  name?: string;
}

/** A value as emitted, with what later steps need to know of it so that none reads the code. */
export interface Value {
  code: string;
  throws: boolean;
  /** Evaluating it twice is the same as once: a name, `this`, a literal, a translator temp. */
  pure: boolean;
  mark?: Mark;
}

/** The outermost operation of a value's code. */
export type Mark =
  | { op: 'cast'; to: NativeType; optional: boolean; implicit: boolean; of: Value }
  | { op: 'unwrap' | 'asserted' | 'converted'; of: Value }
  | { op: 'empty'; null: boolean }
  /** Swift's `try` before the code of `of`. */
  | { op: 'try'; of: Value };

/** What one cell does to the value. */
export type Step =
  | 'identity' | 'implicit' | 'type'
  | 'box' | 'nulled' | 'jsAny'
  | 'nullishOf' | 'nullishOfNull' | 'nullishOfAny' | 'optional' | 'unwrapNullish'
  | 'undefinedAs' | 'nullAs' | 'zero' | 'libraryDefault' | 'typeError' | 'readTypeError' | 'truthiness'
  | 'oneEmpty'
  | 'checked' | 'narrowed' | 'lenient' | 'converted'
  | 'refuse';

export interface Plan {
  from: Representation;
  to: Representation;
  entry: Entry;
  step: Step;
  /** The conversion may throw JavaScript's TypeError (Swift marks it `try`). */
  throws: boolean;
  /** The conversion reads the value more than once: an impure value is bound first. */
  binds: boolean;
  refuse?: string;
  /** Present types differ: a type step (arrays, records, promises, shapes, classes, functions) composes inside. */
  typeStep: boolean;
}

const PRIMITIVE: ReadonlySet<NativeKind> = new Set(['string', 'number', 'boolean']);
/** Kinds a checked conversion of a foreign value builds, never refuses. */
const CONVERTED: ReadonlySet<NativeKind> = new Set(['string', 'number', 'boolean', 'array', 'record', 'promise', 'function', 'void', 'any', 'value']);

/** The cell for a value of slot `from` placed in slot `to`. Pure: the throws analysis asks it too. */
export function plan(from: Slot, to: Slot, entry: Entry): Plan {
  const f = from.rep, t = to.rep;
  const typeStep = f !== 'foreign' && t !== 'foreign' && presentName(from.type) !== presentName(to.type);
  const cell = (step: Step, throws = false, binds = false): Plan => ({ from: f, to: t, entry, step, throws, binds, typeStep });
  if (f === 'foreign') return fromForeign(to, entry, cell);
  if (f === t) return cell(typeStep ? 'type' : 'identity');
  if (t === 'foreign') return cell(f === 'null' ? 'nulled' : f === 'nullish' ? 'jsAny' : 'box');
  if (t === 'nullish') return cell(f === 'null' ? 'nullishOfNull' : 'nullishOf');
  if (f === 'present') return cell('implicit');
  if (t === 'present') {
    if (f === 'nullish') return { ...emptyToPresent('undefined', to, entry, cell), step: 'unwrapNullish', binds: true };
    return emptyToPresent(f, to, entry, cell);
  }
  // Between the one-empty-state forms and the two-state one, a state is lost: refused where something tells them apart.
  const observed = !!(from.form?.observed || to.form?.observed);
  const lost = f === 'nullish' ? (t === 'null' ? 'undefined' : 'null') : f;
  if (observed) return { ...cell('refuse'), refuse: `${lost === 'null' ? 'null' : 'undefined'} placed where only ${t === 'null' ? 'null' : 'undefined'} is held, which the program tells apart` };
  return cell(f === 'nullish' ? 'optional' : 'oneEmpty');
}

/** U or N into a present slot: JavaScript's conversion of the empty value, or its TypeError. */
function emptyToPresent(state: 'undefined' | 'null', to: Slot, entry: Entry, cell: (s: Step, throws?: boolean) => Plan): Plan {
  if (to.kind === 'condition') return cell('truthiness');
  if (to.kind === 'receiver') return cell('readTypeError', true);
  if (!PRIMITIVE.has(to.type.kind)) return to.type.kind === 'any' || to.type.kind === 'void' ? cell('box') : cell('typeError', true);
  if (entry === 'library') return cell('libraryDefault');
  if (entry === 'lenient') return cell('zero');
  return cell(state === 'null' ? 'nullAs' : 'undefinedAs');
}

/** The F row: a foreign value into a typed slot, by how it enters. */
function fromForeign(to: Slot, entry: Entry, cell: (s: Step, throws?: boolean, binds?: boolean) => Plan): Plan {
  if (to.rep === 'foreign') return cell('identity');
  if (to.rep === 'nullish') return cell('nullishOfAny', true);
  switch (entry) {
    case 'library': return cell('converted');
    case 'narrowed': return cell('narrowed', true);
    // Lenient code reads a missing primitive as its zero, but an object where one must be present is still a TypeError.
    case 'lenient': return cell('lenient', to.rep === 'present' && !PRIMITIVE.has(to.type.kind) && to.type.kind !== 'any');
    default: return cell('checked', to.rep === 'present' && !CONVERTED.has(to.type.kind));
  }
}

function presentName(t: NativeType): string {
  return t.kind === 'nullish' && t.args[0] ? presentName(t.args[0]) : t.name;
}

const KINDS: Record<string, NativeKind> = {
  String: 'string', Double: 'number', Int: 'number', Float: 'number', CGFloat: 'number', Long: 'number', Bool: 'boolean',
  Boolean: 'boolean', JSBigInt: 'bigint', JSSymbol: 'symbol', Void: 'void', Unit: 'void', Never: 'never', Nothing: 'never',
  Any: 'any', JSNullish: 'nullish', JSArray: 'array', JSRecord: 'record', JSMap: 'map', JSSet: 'set', JSPromise: 'promise',
  Promise: 'promise', Deferred: 'promise', JSDate: 'value', JSError: 'value',
};

/** A Swift or Kotlin type as the translators spell it. */
export function parseNativeType(spelling: string): NativeType {
  let s = spelling.trim(), optional = false, implicit = false;
  for (;;) {
    if (s.endsWith('?')) { optional = true; s = s.slice(0, -1); } else if (s.endsWith('!')) { implicit = true; s = s.slice(0, -1); } else break;
    if (s.startsWith('(') && closing(s, 0) === s.length - 1 && !isFunction(s)) s = s.slice(1, -1);
  }
  s = s.replace(/^@escaping /, '');
  if (isFunction(s)) return { kind: 'function', name: s, args: [], optional, implicit };
  if (s.startsWith('[') && s.endsWith(']')) return { kind: s.includes(':') ? 'record' : 'array', name: s, args: [], optional, implicit };
  const generic = /^([\w.]+)<(.*)>$/s.exec(s);
  const head = generic ? generic[1] : s;
  const kind = KINDS[head.replace(/^(?:kotlin\.|Swift\.|NativeScriptKit\.)/, '')] ?? (/^FunctionCell_/.test(head) ? 'function' : 'object');
  return { kind, name: s, args: generic ? splitTop(generic[2]).map(parseNativeType) : [], optional: optional || kind === 'any', implicit };
}

/** A slot's representation from its spelling alone: an optional's nil is `nilIs`. */
export function spelledRepresentation(t: NativeType, nilIs: 'undefined' | 'null' = 'undefined'): Representation {
  if (t.kind === 'any') return 'foreign';
  if (t.kind === 'nullish') return 'nullish';
  return t.optional || t.implicit ? nilIs : 'present';
}

function isFunction(s: string): boolean {
  if (!s.startsWith('(')) return /^suspend \(/.test(s);
  const end = closing(s, 0);
  return end > 0 && /^\s*(?:async\s+)?(?:throws\s+)?->/.test(s.slice(end + 1));
}

function closing(s: string, open: number): number {
  let depth = 0;
  for (let k = open; k < s.length; k++) {
    if ('(<['.includes(s[k])) depth++;
    else if (')>]'.includes(s[k]) && !(s[k] === '>' && s[k - 1] === '-')) { if (--depth === 0) return k; }
  }
  return -1;
}

function splitTop(s: string): string[] {
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
