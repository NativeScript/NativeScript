import { parseNativeType, type Mark, type Value } from './conversion.ts';

// What the Swift translator's producers recorded of the code they emitted (its outermost operation, and whether reading
// it twice is reading it once), kept by the code: a string carries no fields, and readers get code from `expr`, the
// conversions and built strings alike (kotlin.ts keeps its own table). Producers that emit one string share its entry, so
// an entry must describe the text's outermost operation, never where the text came from.

const made = new Map<string, Value>();
const pureCodes = new Set<string>();

/** Code, recorded with its outermost operation. */
export function marked(code: string, mark: Mark): string {
  made.set(code, { code, throws: false, pure: pureCodes.has(code), mark });
  return code;
}

export function valueOf(code: string): Value {
  return made.get(code) ?? { code, throws: false, pure: pureCodes.has(code) };
}

export function markOf(code: string): Mark | undefined {
  return made.get(code)?.mark;
}

/** Code that gives the same value however often it is read: a name, a path of names, a translator temporary. */
export function pureCode(code: string): string {
  pureCodes.add(code);
  const v = made.get(code);
  if (v) v.pure = true;
  return code;
}

export function isPure(code: string): boolean {
  return pureCodes.has(code);
}

/** `try code`. */
export function tried(code: string): Value {
  const v: Value = { code: `try ${code}`, throws: true, pure: false, mark: { op: 'try', of: valueOf(code) } };
  made.set(v.code, v);
  return v;
}

/** `target = value`, a statement. */
export function assignedCode(target: string, value: string, targetThrows = false): string {
  return marked(`${target} = ${value}`, { op: 'assign', target, value: valueOf(value), targetThrows });
}

/** A statement that is its own block (`if c { … }`, `do { … }`), placing inside it the `try`s it needs. */
export function blockCode(code: string): string {
  return marked(code, { op: 'block' });
}

/** `try code`, as code. */
export function tryCode(code: string): string {
  return tried(code).code;
}

/** `(code as? T)`, `(code as! T)`, `(code as T?)`, or lenient code's `jsImplicit(code as? T)`. */
export function castCode(code: string, type: string, how: 'as?' | 'as!' | 'as', implicit = false): string {
  const text = how === 'as' ? `${code} as ${type}?` : `${code} ${how} ${type}`;
  return marked(implicit ? `jsImplicit(${text})` : `(${text})`, { op: 'cast', to: parseNativeType(type), optional: how !== 'as!', implicit, of: valueOf(code), spelled: type, up: how === 'as' });
}

/** `jsImplicit(code)`, or a function cell's `implicit` (`cell`), or another of its statics that may give nil (`via`). */
export function implicitOf(code: string, cell?: string, via = 'implicit'): string {
  return marked(cell ? `${cell}.${via}(${code})` : `jsImplicit(${code})`, { op: 'implicit', of: valueOf(code), ...(cell ? { cell } : {}), ...(via !== 'implicit' ? { via } : {}) });
}

/** `code!`. */
export function unwrappedCode(code: string): string {
  return marked(`${code}!`, { op: 'unwrap', of: valueOf(code) });
}

/** `code!` where `yes`, else code. */
export function unwrappedIf(code: string, yes: boolean): string {
  return yes ? unwrappedCode(code) : code;
}

/** The kit's helper of one value (`jsObjectRequired(code)`), its rest of arguments as written (`rest`: `, "key"`). */
export function helper(name: 'jsForeign' | 'jsArrayOrNil' | 'jsObjectRequired' | 'jsUnwrap', code: string, rest = ''): string {
  return marked(`${name}(${code}${rest})`, { op: 'helper', name, of: valueOf(code), rest });
}

/** A member read (`dot`: `.` or `?.`). */
export function memberOf(receiver: string, dot: string, name: string): string {
  return marked(`${receiver}${dot}${name}`, { op: 'member', of: valueOf(receiver), name, ...(dot === '?.' ? { optional: true } : {}) });
}

/** `(code ?? nil)`: an optional read where undefined goes, its nil the missing value. */
export function orNil(code: string): string {
  return marked(`(${code} ?? nil)`, { op: 'undefinedAs', to: parseNativeType('Any?'), of: valueOf(code) });
}

/** An array's element read, nil past its end (`xs.element(i)`; `via`: what comes between, `?.values`). */
export function elementOf(receiver: string, index: string | number, via = ''): string {
  return marked(`${receiver}${via}.element(${index})`, { op: 'entry', of: valueOf(receiver), key: valueOf(String(index)), element: true });
}

export function isUnwrap(code: string): boolean {
  return markOf(code)?.op === 'unwrap';
}

/** The value `code!` unwraps, where code is one. */
export function unwrapInner(code: string): string | null {
  const m = markOf(code);
  return m?.op === 'unwrap' ? m.of.code : null;
}

marked(pureCode('nil'), { op: 'empty', null: false });
marked(pureCode('jsNull'), { op: 'empty', null: true });
