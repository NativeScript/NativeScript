import ts from 'typescript';
import { parseNativeType } from './conversion.ts';
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
  /** F → P/U with a checked entry (§2.3b M6, `foreignPlacement`), or null where the slot's type has no checked convert. */
  checked(e: ts.Expression, target: string): string | null;
}

/** What `place` reads of a translator. */
export interface PlacementBackend {
  readonly checker: ts.TypeChecker;
  readonly library: unknown;
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
}

/** `e` where the backend needs a value of `target`. */
export function place(b: PlacementBackend, e: ts.Expression, target: string): string {
  const early = b.before?.(e, target);
  if (early != null) return early;
  const nullish = nullishPlacement(b, e, target);
  if (nullish !== null) return nullish;
  const checked = b.cells.checked(e, target);
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
