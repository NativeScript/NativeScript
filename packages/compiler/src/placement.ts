import ts from 'typescript';
import { parseNativeType, type Entry, type NativeType } from './conversion.ts';
import type { Form } from './forms.ts';
import type { ValueStates } from './value-states.ts';

// A value placed in a slot (review/S3-PLAN.md §2): the front both translators share, deciding which cell of the state
// step a placement is from the value-states, before the backend's own type step. Each backend spells the cells.

/** One backend's spelling of the state step's cells `place` decides, named by their `Step` (conversion.ts). */
export interface StateCells {
  /** B → F: a `JSNullish<T>` read untyped. */
  jsAny(name: string): string;
  /** B → B of another present type: the value read as its optional `code`, made a `JSNullish<into>` again. */
  type(target: string, into: string, code: string): string;
  /** U → B (or N → B, `isNull`): the optional `code` as a `JSNullish<into>`. */
  nullishOf(target: string, into: string, code: string, isNull: boolean): string;
  /** F → B: an untyped value, converted as `into` is read untyped; `entry` where it is an element or entry read untyped. */
  nullishOfAny(target: string, into: string, code: string, entry: boolean): string;
  /** A literal `null` (`isNull`) or `undefined` into `JSNullish`. */
  empty(isNull: boolean): string;
  /** N → F: a value whose nil is null, read untyped. */
  nulled(code: string): string;
  /**
   * F → P/U with a checked entry (§2.3b M6), or null where the slot's type has no checked convert: the form an argument's
   * or a store's `slot` decided, else `foreignPlacement`'s.
   */
  checked(e: ts.Expression, target: string, slot?: ParamSlot | StoreSlot): string | null;
  /** F → P/U with a checked entry for a value only the backend's code has (`placeCode`), or null where the slot's type has none. */
  checkedCode(code: string, slot: StoreSlot): string | null;
  /** An empty marker's value as it is made (`emptyMarkers`), registered so that checked converts read it as an empty value. */
  marker(code: string): string;
}

/** What `place` reads of a translator. */
export interface PlacementBackend {
  readonly checker: ts.TypeChecker;
  readonly sourceFiles: readonly ts.SourceFile[];
  readonly library: unknown;
  readonly lenient: boolean;
  readonly states: ValueStates;
  readonly cells: StateCells;
  typeOf(n: ts.Node): string;
  expr(e: ts.Expression): string;
  resolve(n: ts.Node): ts.Symbol | undefined;
  error(n: ts.Node, what: string): Error;
  optionalType(t: string): string;
  /** The placement past the shared front: the type step, and the cells not decided here yet. */
  coerce(e: ts.Expression, target: string): string;
  coerceTyped(e: ts.Expression, target: string): string;
  convert(code: string, from: string, to: string): string;
  fromAnyCode(code: string, type: string): string;
  /** A `string[]` an unset regexp group may have filled, or a match whose groups may include one. */
  unsetGroups(n: ts.Node): boolean;
  unsetMatch(e: ts.Expression): boolean;
  /** `nullishRead`'s value as its `JSNullish<T>`, and that slot's type. */
  nullishCode(e: ts.Expression): string;
  nullishSlotType(d: ts.Declaration): string;
  /** The backend's own placements that come before the shared front (Swift's held values). */
  before?(e: ts.Expression, target: string): string | null;
  /** Its own `JSNullish` reads before the shared ones (Kotlin's boxed element reads and adapted functions). */
  nullishBefore?(e: ts.Expression, target: string, held: ts.Declaration | null | undefined): string | null;
  /** Its own refusals and shortcuts once the value is neither `JSNullish` nor checked (Swift's generic-class checks, matches, `void`). */
  after?(e: ts.Expression, target: string): string | null;
  /** Its own shortcuts after the shared ones, before the type step. */
  shortcut?(e: ts.Expression, target: string): string | null;
  /** A conditional placed in a `JSNullish` slot, each branch placed on its own. */
  branches(e: ts.ConditionalExpression, target: string): string;
  /** Its own reads of a value a `return` gives back, before the shared front (Swift's undefined reads of a call's result). */
  result?(e: ts.Expression, slot: ResultSlot): string | null;
  /** Its own cells of an argument, before the shared front (Swift's optional read given as it is, Kotlin's constant defaults). */
  argument?(e: ts.Expression, slot: ParamSlot): string | null;
}

/** `e` where the backend needs a value of `target`: the value a function gives back in its result `slot`, an argument in its parameter's, or a value stored in a variable or field. */
export function place(b: PlacementBackend, e: ts.Expression, to: string | ResultSlot | ParamSlot | StoreSlot): string {
  if (typeof to !== 'string' && to.kind === 'return') return b.result?.(e, to) ?? place(b, e, to.target);
  if (typeof to !== 'string' && to.kind === 'argument') return b.argument?.(e, to) ?? placed(b, e, to.target, to);
  const slot = typeof to === 'string' ? undefined : to;
  const target = slot ? slot.target : to as string;
  const code = placed(b, e, target, slot);
  return b.library && ts.isVariableDeclaration(e.parent) && e.parent.initializer === e && emptyMarkers(b).has(e.parent) ? b.cells.marker(code) : code;
}

function placed(b: PlacementBackend, e: ts.Expression, target: string, slot?: ParamSlot | StoreSlot): string {
  const early = b.before?.(e, target);
  if (early != null) return early;
  const nullish = nullishPlacement(b, e, target);
  if (nullish !== null) return nullish;
  const checked = b.cells.checked(e, target, slot);
  if (checked) return checked;
  const own = b.after?.(e, target);
  if (own != null) return own;
  const to = parseNativeType(target);
  if (to.name === 'JSArray<String>' && ((b.typeOf(e) === 'JSArray<String?>' && b.unsetGroups(e)) || b.unsetMatch(e))) {
    throw b.error(e, 'strings a pattern\'s unset group may leave undefined, given where `string[]` is declared (declare it `(string | undefined)[]`)');
  }
  const shortcut = b.shortcut?.(e, target);
  if (shortcut != null) return shortcut;
  // An enum's object held as a record (`const names: Record<string, string | number> = Color`): an untyped object.
  if (target.startsWith('JSRecord<') && isEnumObject(b, e)) return b.fromAnyCode(b.expr(e), target);
  const code = b.coerceTyped(e, target);
  if (target !== 'Any?') return code;
  const entry = b.states.nullableEntry(e, () => code);
  if (entry) return entry;
  return b.states.nilIsNull(e) && code !== 'jsNull' ? b.cells.nulled(code) : code;
}

/**
 * A value placed in or read from a `JSNullish<T>` slot (`ValueStates.nullishHeld`), which keeps null apart from
 * undefined: the B row and column of the state step. Null if neither side is one.
 */
export function nullishPlacement(b: PlacementBackend, e: ts.Expression, target: string): string | null {
  const held = b.states.nullishRead(e);
  const bare = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
  const name = held && b.nullishCode(bare);
  const own = b.nullishBefore?.(e, target, held);
  if (own != null) return own;
  const into = /^JSNullish<(.*)>$/.exec(target)?.[1];
  if (!into) return name && target === 'Any?' ? b.cells.jsAny(name) : null;
  const slot = held && b.nullishSlotType(held);
  if (name) return slot === target ? name : b.cells.type(target, into, b.convert(`${name}.optional`, b.optionalType(slot!.slice('JSNullish<'.length, -1)), b.optionalType(into)));
  if (bare.kind === ts.SyntaxKind.NullKeyword) return b.cells.empty(true);
  if ((ts.isIdentifier(bare) && bare.text === 'undefined') || ts.isVoidExpression(bare)) return b.cells.empty(false);
  if (ts.isConditionalExpression(bare)) return b.branches(bare, target);
  if (b.typeOf(e) === 'Any?') return b.cells.nullishOfAny(target, into, b.expr(e), false);
  const entry = b.states.nullishElementRead(e) ? b.coerce(e, 'Any?') : b.states.nullableEntry(e, () => b.coerceTyped(e, 'Any?'));
  if (entry) return b.cells.nullishOfAny(target, into, entry, true);
  const code = b.coerce(e, b.optionalType(into));
  return b.cells.nullishOf(target, into, code, b.states.nilIsNull(e));
}

const MARKERS = new WeakMap<ts.TypeChecker, Set<ts.VariableDeclaration>>();
const EQUALITY = new Set([ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken]);

/**
 * Core's empty markers: module constants made only to be told apart by identity (`unsetValue = new Object()`,
 * `resetSymbol = Symbol(…)`) and compared with one somewhere. Core writes one where a value is reset, typed slots
 * included (`view[name] = unsetValue`), so a checked convert reads one as an empty value, not as a value of another type.
 */
export function emptyMarkers(b: Pick<PlacementBackend, 'checker' | 'sourceFiles'>): Set<ts.VariableDeclaration> {
  let found = MARKERS.get(b.checker);
  if (found) return found;
  const marks = found = new Set();
  MARKERS.set(b.checker, marks);
  const made = (d: ts.Declaration | undefined): d is ts.VariableDeclaration => {
    if (!d || !ts.isVariableDeclaration(d) || !d.initializer || !(d.parent.flags & ts.NodeFlags.Const) || !ts.isSourceFile(d.parent.parent.parent)) return false;
    const init = ts.skipOuterExpressions(d.initializer);
    const callee = ts.isNewExpression(init) || ts.isCallExpression(init) ? init.expression : undefined;
    if (!callee || !ts.isIdentifier(callee)) return false;
    return ts.isNewExpression(init) ? callee.text === 'Object' && !init.arguments?.length : callee.text === 'Symbol';
  };
  const visit = (n: ts.Node): void => {
    if (ts.isBinaryExpression(n) && EQUALITY.has(n.operatorToken.kind)) {
      for (const side of [n.left, n.right]) {
        const x = ts.skipOuterExpressions(side);
        let sym = ts.isIdentifier(x) ? b.checker.getSymbolAtLocation(x) : undefined;
        if (sym && sym.flags & ts.SymbolFlags.Alias) sym = b.checker.getAliasedSymbol(sym);
        const d = sym?.valueDeclaration;
        if (made(d)) marks.add(d);
      }
    }
    ts.forEachChild(n, visit);
  };
  for (const f of b.sourceFiles) if (!f.isDeclarationFile) visit(f);
  return marks;
}

/** App code: an app enum named as a value (`Color`, `Shapes.Kind`), which is the object JavaScript makes of it. */
export function isEnumObject(b: Pick<PlacementBackend, 'library' | 'resolve' | 'checker'>, e: ts.Expression): boolean {
  if (b.library) return false;
  const bare = ts.skipOuterExpressions(e);
  if (!ts.isIdentifier(bare) && !ts.isPropertyAccessExpression(bare)) return false;
  const sym = b.resolve(ts.isPropertyAccessExpression(bare) ? bare.name : bare);
  const decl = sym && sym.flags & ts.SymbolFlags.Alias ? b.checker.getAliasedSymbol(sym).valueDeclaration : sym?.valueDeclaration;
  return !!decl && ts.isEnumDeclaration(decl) && !decl.getSourceFile().isDeclarationFile && !hasConst(decl);
}

function hasConst(d: ts.EnumDeclaration): boolean {
  return !!ts.getModifiers(d)?.some((m) => m.kind === ts.SyntaxKind.ConstKeyword);
}

/** A function's result as the slot its `return`s and its expression body are placed in. */
export interface ResultSlot {
  kind: 'return';
  /** The backend's spelling: in an async function or a generator, the value its continuation takes. */
  target: string;
  type: NativeType;
  /** Async and generator bodies give the value to their continuation instead of returning it. */
  lowered: boolean;
  /** The function the slot is the result of. */
  fn?: ts.SignatureDeclaration;
  /** False where what gives the value cannot throw (a synthesized getter or initializer): a conversion's TypeError is reported there, the value empty. */
  throws?: false;
}

/** The result slot of a function giving back `target`. */
export function resultSlot(target: string, fn?: ts.SignatureDeclaration, lowered = false): ResultSlot {
  return { kind: 'return', target, type: parseNativeType(target ?? ''), lowered, fn };
}

/** A parameter as the slot a call's argument is placed in, as the backend has the parameter at that call. */
export interface ParamSlot {
  kind: 'argument';
  /** The backend's spelling of the parameter's type at the call. */
  target: string;
  type: NativeType;
  /** The parameter; none past the declared ones. */
  decl?: ts.Declaration;
  /** Held `JSNullish<T>` (`ValueStates.nullishHeld`): the value placed in it, no other cell. */
  nullish?: boolean;
  /** Takes a missing value as it is: an argument the backend holds optional is given as that optional; `declared` is the parameter's type before it was made optional. */
  asIs?: { declared: string };
  /** Kotlin: the parameter's default is a constant its declaration has, which a possibly missing argument falls back to. */
  constantDefault?: boolean;
  /** Kotlin: a package's parameter called from outside the package, its type as the package declares it. */
  packaged?: boolean;
  /** How the argument comes in; `checked` where it is: the form its untyped value enters as (`ValueStates.foreignArgument`). */
  entry: Entry;
  checked?: Form;
  /** An element of a rest parameter's array, an argument past the declared parameters or to an untyped callee: no declared parameter's cell. */
  rest?: boolean;
  /**
   * A parameter the call leaves out, given as `empty` (a function value takes every parameter: the slot's empty value) or
   * as `undefined` reads in the slot's type (a required parameter of an app function).
   */
  missing?: 'empty' | 'undefined';
  /** A native API's parameter (`.d.ts`): the backend's conversion to the native type `target` names, no other cell. */
  native?: NativeParam;
}

/** What a native parameter's conversion reads besides its type: Kotlin's `target` is the Java descriptor, with the nullness and generic signature the class file gives. */
export interface NativeParam {
  nullable?: boolean;
  nonNull?: boolean;
  signature?: string;
  typeVar?: (name: string) => string;
}

type SlotFacts = Pick<ParamSlot, 'nullish' | 'asIs' | 'constantDefault' | 'packaged' | 'rest' | 'missing' | 'native'>;

/** The slot of a parameter the backend has as `target` at the call `at`, taking its `k`th argument `a` (none where the call leaves it out or a spread gives it). */
export function argumentSlot(b: Pick<PlacementBackend, 'library' | 'lenient' | 'states'>, target: string, decl: ts.Declaration | undefined, at: { call: ts.CallExpression | ts.NewExpression; k: number; a?: ts.Expression }, facts: SlotFacts = {}): ParamSlot {
  return { kind: 'argument', target, type: parseNativeType(target), decl, ...argumentEntry(b, at.call, at.k, at.a), ...facts };
}

/** How the `k`th argument `a` of `call` comes in, as its slot has it (`argumentSlot`). */
export function argumentEntry(b: Pick<PlacementBackend, 'library' | 'lenient' | 'states'>, call: ts.CallExpression | ts.NewExpression, k: number, a?: ts.Expression): Pick<ParamSlot, 'entry' | 'checked'> {
  let checked: Form | null = null;
  // A value the forms throw on enters unchecked.
  try { checked = a ? b.states.foreignArgument(call, k, a) : null; } catch { checked = null; }
  return checked ? { entry: 'checked', checked } : { entry: b.library ? 'library' : b.lenient ? 'lenient' : 'typed' };
}

/** The call `a` is an argument of, past parentheses, and its position there; null where `a` is no call's argument. */
export function argumentOf(a: ts.Expression): { call: ts.CallExpression | ts.NewExpression; k: number } | null {
  let x: ts.Node = a;
  while (ts.isParenthesizedExpression(x.parent)) x = x.parent;
  const p = x.parent;
  return (ts.isCallExpression(p) || ts.isNewExpression(p)) && p.expression !== x ? { call: p, k: p.arguments!.indexOf(x as ts.Expression) } : null;
}

/**
 * Where a value is stored: a variable's declaration, a class's or a shape's field, an object literal's field (`{ a }`
 * too), a parameter (its default), an assignment's target (a variable, a member, an element), or a signal's write
 * (`s.set(v)`).
 */
export type Store = ts.VariableDeclaration | ts.PropertyDeclaration | ts.PropertySignature | ts.PropertyAssignment | ts.ShorthandPropertyAssignment | ts.ParameterDeclaration | ts.Expression;

/** A variable, a field, an object literal's field or an array's element as the slot a value is stored in. */
export interface StoreSlot {
  kind: 'variable' | 'field' | 'literalField' | 'element';
  /** The backend's spelling of the slot's type where the value is stored. */
  target: string;
  type: NativeType;
  /** The declaration or the assignment's target the value is stored by. */
  at: Store;
  /** How the value comes in; `checked` where it is: the form its untyped value enters as (`ValueStates.foreignStore`). */
  entry: Entry;
  checked?: Form;
}

/**
 * The slot `a` is stored in by `at`, the backend having it as `target`. `checks` false: a value the store does not give
 * as it is (a compound assignment's operand, a signal's `set`), which enters unchecked.
 */
export function storeSlot(b: Pick<PlacementBackend, 'library' | 'lenient' | 'states'>, target: string, at: Store, a: ts.Expression, checks = true): StoreSlot {
  return { kind: storeKind(at), target, type: parseNativeType(target), at, ...storeEntry(b, at, a, checks) };
}

/**
 * The slot of a field (`at`, its declaration) a value only the backend's code has is stored in, untyped (a dynamic
 * setter's `newValue`), the backend having it as `target`; no `at` where the backend's field has no one declaration.
 */
export function codeStoreSlot(b: Pick<PlacementBackend, 'library' | 'lenient' | 'states'>, target: string, at?: ts.PropertyDeclaration | ts.PropertySignature | ts.PropertyAssignment): StoreSlot | null {
  if (!at) return null;
  const checked = b.states.foreignCodeStore(at);
  return { kind: storeKind(at), target, type: parseNativeType(target), at, ...(checked ? { entry: 'checked', checked } : { entry: b.library ? 'library' : b.lenient ? 'lenient' : 'typed' }) };
}

/** An untyped value only the backend's code has (`code`), stored in `slot`: its checked cell where the slot's entry is checked, else null for the backend's own conversion. */
export function placeCode(b: PlacementBackend, code: string, slot: StoreSlot | null): string | null {
  return slot?.entry === 'checked' ? b.cells.checkedCode(code, slot) : null;
}

/** How `a`, stored by `at`, comes in, as its slot has it (`storeSlot`). */
export function storeEntry(b: Pick<PlacementBackend, 'library' | 'lenient' | 'states'>, at: Store, a: ts.Expression, checks = true): Pick<StoreSlot, 'entry' | 'checked'> {
  let checked: Form | null = null;
  // A value the forms throw on enters unchecked.
  try { checked = checks ? b.states.foreignStore(at, a) : null; } catch { checked = null; }
  return checked ? { entry: 'checked', checked } : { entry: b.library ? 'library' : b.lenient ? 'lenient' : 'typed' };
}

function storeKind(at: Store): StoreSlot['kind'] {
  if (ts.isVariableDeclaration(at) || ts.isParameter(at)) return 'variable';
  if (ts.isPropertyDeclaration(at) || ts.isPropertySignature(at) || ts.isCallExpression(at)) return 'field';
  if (ts.isPropertyAssignment(at) || ts.isShorthandPropertyAssignment(at)) return 'literalField';
  const target = ts.skipOuterExpressions(at, ts.OuterExpressionKinds.Parentheses);
  return ts.isIdentifier(target) ? 'variable' : ts.isElementAccessExpression(target) ? 'element' : 'field';
}

const STORING = new Set([ts.SyntaxKind.EqualsToken, ts.SyntaxKind.QuestionQuestionEqualsToken, ts.SyntaxKind.BarBarEqualsToken, ts.SyntaxKind.AmpersandAmpersandEqualsToken]);

/**
 * The store `a` is the value of, past parentheses and the branches of a conditional: a variable's or a field's
 * initializer, an object literal's field (`{ a }` too), the right side of an assignment (`=`, `??=`, `||=`, `&&=`).
 * Null where `a` is none.
 */
export function storeOf(a: ts.Expression): Store | null {
  let x: ts.Node = a;
  while (ts.isParenthesizedExpression(x.parent) || (ts.isConditionalExpression(x.parent) && x.parent.condition !== x)) x = x.parent;
  const p = x.parent;
  if ((ts.isVariableDeclaration(p) || ts.isPropertyDeclaration(p) || ts.isPropertyAssignment(p)) && p.initializer === x) return p;
  if (ts.isShorthandPropertyAssignment(p) && p.name === x) return p;
  return ts.isBinaryExpression(p) && STORING.has(p.operatorToken.kind) && p.right === x ? p.left : null;
}

/** Whether `a` is the value an assignment stores in `left` as it is (`storeOf`): a compound assignment's operand, or one of an assignment the translation made from another, is not. */
export function assignedTo(left: ts.Expression, a: ts.Expression): boolean {
  return storeOf(a) === left;
}

/** One cell of a `return`-kind slot. */
export type ReturnCell =
  /** No value (`return;`), or a missing value the slot reads as its empty: `code` is what is returned ('' for nothing). */
  | { step: 'empty'; code: string; e?: ts.Expression }
  /** A value where the slot holds nothing: evaluated, then nothing returned. */
  | { step: 'drop'; e: ts.Expression }
  /** A call that never returns: the statement's end itself. */
  | { step: 'never'; e: ts.Expression }
  /** A value giving nothing (a void call) where the slot holds one: evaluated, then `empty`. */
  | { step: 'voidCall'; e: ts.Expression; empty: string }
  /** The value placed in the slot; `code` where the backend's own step placed it already. */
  | { step: 'value'; e: ts.Expression; code?: string };

/** What `returnCell` reads of a translator. */
export interface ReturnBackend {
  typeOf(n: ts.Node): string;
  /**
   * What a missing value (`e`: a nullish literal; none: `return;`) returns in `slot` where the backend reads it as the
   * slot's empty (lenient code's zeros; '' for nothing), or null where it is placed as a value (in a slot holding
   * nothing: evaluated). With no `e`, always an answer.
   */
  emptyReturn(e: ts.Expression | undefined, slot: ResultSlot): string | null;
  /** The value `e`, giving nothing (a void call), leaves in `slot`, or null where it is placed as a value. */
  voidValue(e: ts.Expression, slot: ResultSlot, body: boolean): string | null;
  /** The backend's own cells before the shared ones. */
  returnBefore?(e: ts.Expression, slot: ResultSlot): ReturnCell | null;
}

/** `e` given back from a function whose result is `slot`: by a `return` statement, or as an arrow's expression `body`. */
export function returnCell(b: ReturnBackend, e: ts.Expression | undefined, slot: ResultSlot, body = false): ReturnCell {
  if (!e) return { step: 'empty', code: slot.lowered ? '' : b.emptyReturn(undefined, slot) ?? '' };
  if (slot.lowered) return { step: 'value', e };
  const own = b.returnBefore?.(e, slot);
  if (own) return own;
  const given = parseNativeType(b.typeOf(e));
  const plain = !given.optional && !given.implicit;
  const call = ts.isCallExpression(e);
  if (!body && call && plain && given.kind === 'never') return { step: 'never', e };
  const effect = voidOperand(e);
  if (slot.type.kind === 'void' && !slot.type.optional) {
    if (effect) return { step: 'drop', e: effect };
    const code = isNullishLiteral(e) ? b.emptyReturn(e, slot) : null;
    return code !== null ? { step: 'empty', code, e } : { step: 'drop', e };
  }
  if (plain && given.kind === 'void') {
    const empty = b.voidValue(e, slot, body);
    if (empty) return { step: 'voidCall', e, empty };
  }
  if (!body && isNullishLiteral(e)) {
    const code = b.emptyReturn(e, slot);
    if (code !== null) return effect ? { step: 'voidCall', e: effect, empty: code } : { step: 'empty', code, e };
  }
  return { step: 'value', e };
}

/** `null`, `undefined` or `void x`, parenthesized or not. */
export function isNullishLiteral(e: ts.Expression): boolean {
  while (ts.isParenthesizedExpression(e)) e = e.expression;
  return e.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(e) && e.text === 'undefined') || ts.isVoidExpression(e);
}

/** The operand of `void x` where evaluating it may do something (not a literal or a name), else null. */
function voidOperand(e: ts.Expression): ts.Expression | null {
  while (ts.isParenthesizedExpression(e)) e = e.expression;
  if (!ts.isVoidExpression(e)) return null;
  let x = e.expression;
  while (ts.isParenthesizedExpression(x)) x = x.expression;
  return ts.isLiteralExpression(x) || ts.isIdentifier(x) ? null : e.expression;
}
