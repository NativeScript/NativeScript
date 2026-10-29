import ts from 'typescript';
import { patternSource, patternTargets } from './placement.ts';
import { alwaysEnds, definitelyAssignedFields, isTemplateMethod, LIB_FILE, literalKey, regexpMayLeaveGroupUnset, slotOf } from './lang.ts';

// One value form per slot (review/DESIGN-VALUE-MODEL.md §2): which of JavaScript's empty states a slot may hold, decided
// by one program-wide flow over every place a value is put, for both translators.

/** A slot's value form: its present type and the states beside it a native form must also hold. */
export interface Form {
  /** The present value's type, null and undefined removed. */
  type: ts.Type;
  undefined: boolean;
  null: boolean;
  /** An array element that may be a hole. */
  hole: boolean;
  /** May hold a value of another type than `type` (untyped, asserted, JSON). */
  foreign: boolean;
  /**
   * Its undefined may be a value the program leaves out: an argument not given, an optional parameter without a default,
   * a read past an array's or string's end, a hole. Undefined an outside caller gives (an entry point) is not missing.
   */
  missing: boolean;
  /**
   * Its null or undefined may be a value the program reads and finds missing: an element past an array's end, a
   * character past a string's, `find`/`pop`/`shift`/`at`, `Map.get`, a record's entry, a match's group, or an empty
   * value a function returns (`return null`, a bare `return`, its end). Empty states a library's or platform's value
   * brings, an optional parameter's and an argument not given are not.
   */
  absent: boolean;
  /**
   * Something its value reaches tells its null from its undefined (§2.3b M1'). A form holding both that isn't observed
   * holds one empty state, read as undefined.
   */
  observed: boolean;
  /**
   * Something its value reaches tests the value's type (§2.3b M6): `typeof`, `instanceof`, `Array.isArray`, `in`. A
   * foreign form that isn't keeps its declared representation, the foreign value checked where it enters.
   */
  typeObserved: boolean;
  /** An array's or Set's element, a Map's value, a Promise's result. */
  element?: Form;
}

/** How a backend holds a form (the design's five representations). */
export type Representation = 'present' | 'undefined' | 'null' | 'nullish' | 'foreign';

export function representation(f: Form): Representation {
  if (f.foreign) return 'foreign';
  if (f.undefined && f.null) return f.observed ? 'nullish' : 'undefined';
  return f.null ? 'null' : f.undefined ? 'undefined' : 'present';
}

const U = 1, N = 2, H = 4, F = 8;
const LOGICAL_ASSIGNMENT = new Set([ts.SyntaxKind.QuestionQuestionEqualsToken, ts.SyntaxKind.BarBarEqualsToken, ts.SyntaxKind.AmpersandAmpersandEqualsToken]);
/** `Form.missing`, carried beside U: whatever keeps or drops U keeps or drops it with it (`withMissing`). */
const M = 16;
/** `Form.absent`, carried beside U and N: kept by masks that keep either, dropped where both are. */
const A = 32;

type Part = 'element' | 'value' | 'result';

/** A place a value is held. Union-find: only a root's fields beyond `up` are meaningful. */
class Slot {
  up: Slot = this;
  states = 0;
  /** A declaration file's slot, or one merged with it: its form is its declared type, whatever reaches it. */
  fixed = false;
  /** Strict code's slot: its checker type, its elements' included, is a lower bound on what it holds. */
  typed = false;
  /** Typed by a type parameter: it holds what each instantiation gives, and shares no form with a concrete slot. */
  generic = false;
  /** A generic slot's states less those only an instantiation brings in: what it holds as a `T` (§2.3b M5). */
  local = 0;
  /** Something tells null from undefined in its value, or in a slot its value flows to (§2.3b M1'). */
  observed = false;
  /** Something tests the type of its value, or of a slot its value flows to (§2.3b M6). */
  typeObserved = false;
  children = new Map<Part, Slot>();
  readonly type: ts.Type | null;
  /** The declaration it is the slot of, if any. */
  readonly decl: ts.Declaration | null;
  constructor(type: ts.Type | null, decl: ts.Declaration | null = null) {
    this.type = type;
    this.decl = decl;
  }

  give(states: number): void {
    this.states |= states;
    this.local |= states;
  }
}

/** What an expression may give: states of its own, and the slots it reads, each with the states a read keeps. */
interface Flow { states: number; from: [Slot, number][] }

const PRESENT: Flow = { states: 0, from: [] };

const ELEMENT_CALLBACKS = new Set(['forEach', 'map', 'filter', 'find', 'findIndex', 'findLast', 'findLastIndex', 'some', 'every', 'flatMap']);
const SAME_ELEMENTS = new Set(['filter', 'slice', 'concat', 'reverse', 'sort', 'toSorted', 'toReversed', 'splice', 'flat', 'fill', 'copyWithin', 'values']);
export const ONE_ELEMENT = new Set(['find', 'findLast', 'pop', 'shift', 'at']);
/** Operators that convert their operands to a number or a string, which null and undefined convert to differently. */
const CONVERTING = new Set([ts.SyntaxKind.PlusToken, ts.SyntaxKind.MinusToken, ts.SyntaxKind.AsteriskToken, ts.SyntaxKind.AsteriskAsteriskToken, ts.SyntaxKind.SlashToken,
  ts.SyntaxKind.PercentToken, ts.SyntaxKind.LessThanToken, ts.SyntaxKind.GreaterThanToken, ts.SyntaxKind.LessThanEqualsToken, ts.SyntaxKind.GreaterThanEqualsToken,
  ts.SyntaxKind.AmpersandToken, ts.SyntaxKind.BarToken, ts.SyntaxKind.CaretToken, ts.SyntaxKind.LessThanLessThanToken, ts.SyntaxKind.GreaterThanGreaterThanToken,
  ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken, ts.SyntaxKind.PlusEqualsToken, ts.SyntaxKind.MinusEqualsToken, ts.SyntaxKind.AsteriskEqualsToken,
  ts.SyntaxKind.AsteriskAsteriskEqualsToken, ts.SyntaxKind.SlashEqualsToken, ts.SyntaxKind.PercentEqualsToken, ts.SyntaxKind.AmpersandEqualsToken, ts.SyntaxKind.BarEqualsToken,
  ts.SyntaxKind.CaretEqualsToken, ts.SyntaxKind.LessThanLessThanEqualsToken, ts.SyntaxKind.GreaterThanGreaterThanEqualsToken, ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken]);
/** Built-in methods whose arguments from this position on are stored where the flow follows them (an element, a value, a result). */
const STORES = new Map([['push', 0], ['unshift', 0], ['splice', 2], ['add', 0], ['set', 1], ['resolve', 0]]);
const STORE_OWNERS = new Set(['Array', 'Set', 'Map', 'WeakMap', 'WeakSet', 'PromiseConstructor']);
/** Angular's class and method decorators, and the hooks Angular calls on its classes. */
const ANGULAR_DECORATORS = new Set(['Component', 'Directive', 'Pipe', 'Injectable', 'NgModule']);
const METHOD_DECORATORS = new Set(['HostListener']);
const LIFECYCLE_HOOKS = new Set(['ngOnChanges', 'ngOnInit', 'ngDoCheck', 'ngAfterContentInit', 'ngAfterContentChecked', 'ngAfterViewInit', 'ngAfterViewChecked', 'ngOnDestroy']);

/** A declaration whose members a value's are. */
type Owner = ts.ClassLikeDeclaration | ts.InterfaceDeclaration | ts.TypeLiteralNode | ts.ObjectLiteralExpression;

export interface FormsOptions {
  /** A library (core) is called by programs this one doesn't contain: its exported and public surface is an entry point. */
  library?: boolean;
  /** Whether a declaration file's declaration is a platform's: a class extending one is called by the platform. */
  native?: (d: ts.Declaration) => boolean;
  /**
   * Whether a platform declaration's binding holds nil, which script sees as null: a property's value, a method's result,
   * a parameter's argument, a callback parameter's value. The backend's binding knows; the typings don't say.
   */
  nativeNil?: (d: ts.Declaration) => boolean;
  /** Whether a node is the program's own code, not a package's: only its reads and returns make a form `absent`. */
  ownCode?: (n: ts.Node) => boolean;
}

export class Forms {
  private readonly slots = new Map<ts.Node, Slot>();
  /** Every slot made, declarations' and parts'. */
  private readonly made: Slot[] = [];
  private readonly flows = new Map<ts.Node, Flow>();
  private readonly edges: [Slot, Slot, number][] = [];
  private readonly aliases: [Slot, Slot][] = [];
  /** The edges `share` added between a concrete slot and a type parameter's, by source. */
  private readonly crossed = new Map<Slot, Set<Slot>>();
  /** Values something tells null from undefined in, and slots whose readers do (§2.3b M1'), before the fixpoint. */
  private readonly observedValues = new Set<ts.Expression>();
  private readonly observedSlots: Slot[] = [];
  /**
   * Slots a copy connects (a spread's, `Array.from`'s or `new Set(values)`'s elements; an element and the callback
   * parameter given it): states flow from the first to the second, observation both ways, as no element is converted.
   */
  private readonly copies: [Slot, Slot][] = [];
  /** Values whose type something tests (§2.3b M6), before the fixpoint. */
  private readonly typeObservedValues = new Set<ts.Expression>();
  /** Values given to JSON.stringify (true: classes' fields too) or console (interfaces' and literals' fields). */
  private readonly printed: [ts.Expression, boolean][] = [];
  /** The slots each value is placed in. */
  private readonly placed = new Map<ts.Expression, Slot[]>();
  /** Arguments the program's calls give defaulted parameters, and the defaulted parameters a spread argument reaches. */
  private readonly defaultArguments: [ts.ParameterDeclaration, ts.Expression][] = [];
  private readonly spreadDefaults = new Set<ts.ParameterDeclaration>();
  /** Values placed where script holds them untyped: a slot of no type, a field or element no type reads, an unknown callee's argument. */
  private readonly placedUntyped = new Set<ts.Expression>();
  /**
   * Members script calls by a key the program doesn't spell (`obj[key](…)`): the receiver's declaration (null: an untyped
   * receiver the program can't trace), the names the key's type allows (null: any), and whether they are statics.
   */
  private readonly calledByName: { owner: Owner | null; names: ReadonlySet<string> | null; statics: boolean }[] = [];
  private readonly classes: ts.ClassLikeDeclaration[] = [];
  private built = false;
  /** Wall-clock milliseconds the program-wide build took. */
  buildMs = 0;

  private readonly files: readonly ts.SourceFile[];
  private readonly checker: ts.TypeChecker;
  /** Whether a file is checked with strictNullChecks: its checker types are a lower bound on what its slots hold. */
  private readonly strictFile: (f: ts.SourceFile) => boolean;
  private readonly library: boolean;
  private readonly native: (d: ts.Declaration) => boolean;
  private readonly nativeNil: (d: ts.Declaration) => boolean;
  private readonly ownCode: (n: ts.Node) => boolean;

  constructor(files: readonly ts.SourceFile[], checker: ts.TypeChecker, strictFile: (f: ts.SourceFile) => boolean, options: FormsOptions = {}) {
    this.files = files;
    this.checker = checker;
    this.strictFile = strictFile;
    this.library = options.library ?? false;
    this.native = options.native ?? (() => false);
    this.ownCode = options.ownCode ?? (() => true);
    const nil = options.nativeNil ?? (() => false), known = new Map<ts.Declaration, boolean>();
    this.nativeNil = (d) => {
      let found = known.get(d);
      if (found === undefined) known.set(d, found = this.native(d) && nil(d));
      return found;
    };
  }

  /** An array's or Set's element type, or a Map's value type: the part `Form.element` is the form of. */
  elementOf(t: ts.Type): ts.Type | null {
    const part = this.partOf(t);
    return part && part !== 'result' && !this.checker.isTupleType(this.checker.getNonNullableType(t)) ? elementType(this.checker, t, part) : null;
  }

  formOf(e: ts.Expression): Form {
    this.build();
    const x = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
    const observed = this.observedValues.has(x) || !!this.placed.get(x)?.some((s) => this.find(s).observed);
    const form = this.formFrom(this.flow(e), this.checker.getTypeAtLocation(e), observed);
    if (this.typeObservedValues.has(x) || this.placed.get(x)?.some((s) => this.find(s).typeObserved)) form.typeObserved = true;
    return form;
  }

  /** Whether a slot an array value is placed in has its elements' type tested (§2.3b M6). */
  elementsTypeObserved(e: ts.Expression): boolean {
    this.build();
    const x = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
    return !!this.placed.get(x)?.some((s) => {
      const c = this.find(s).children.get('element');
      return !!c && this.find(c).typeObserved;
    });
  }

  formOfSlot(d: ts.Declaration): Form {
    this.build();
    const s = this.slotFor(d);
    return this.formFrom({ states: 0, from: [[s, ~0]] }, this.find(s).type ?? this.checker.getTypeAtLocation(d));
  }

  /** Values the program places where script holds them untyped (`placedUntyped`). */
  untypedPlacements(): ReadonlySet<ts.Expression> {
    this.build();
    return this.placedUntyped;
  }

  /**
   * The program's own declarations' slots and their parts (elements, values, results) whose forms hold null and
   * undefined both and are not foreign, and how many of those are observed: the ones that render as `JSNullish<T>`.
   */
  bothStates(): { slots: number; both: number; nullish: number } {
    this.build();
    let slots = 0, both = 0, nullish = 0;
    const count = (f: Form, depth: number) => {
      slots++;
      if (f.undefined && f.null && !f.foreign) { both++; if (f.observed) nullish++; }
      if (f.element && depth < 4) count(f.element, depth + 1);
    };
    for (const n of [...this.slots.keys()]) if (!ts.isExpression(n) && !declarationFile(n)) count(this.formOfSlot(n as ts.Declaration), 0);
    return { slots, both, nullish };
  }

  /**
   * The program's declarations whose form is foreign and whose type something tests (§2.3b M6), by the group that
   * shares one form: every member of a group is held as one.
   */
  typeTestedForeign(): ts.Declaration[][] {
    this.build();
    const groups = new Map<Slot, ts.Declaration[]>();
    for (const s of this.made) {
      const r = this.find(s);
      if (!s.decl || r.generic || !(r.states & F) || !r.typeObserved) continue;
      const list = groups.get(r);
      if (list) list.push(s.decl);
      else groups.set(r, [s.decl]);
    }
    return [...groups.values()];
  }

  /** The declarations sharing one form with `d` (overrides, the interface member a class implements, a literal's field), `d` among them. */
  groupOf(d: ts.Declaration): readonly ts.Declaration[] {
    this.build();
    if (!this.groups) {
      this.groups = new Map();
      for (const s of this.made) {
        if (!s.decl) continue;
        const r = this.find(s), list = this.groups.get(r);
        if (list) list.push(s.decl);
        else this.groups.set(r, [s.decl]);
      }
    }
    return this.groups.get(this.find(this.slotFor(d))) ?? [d];
  }
  private groups: Map<Slot, ts.Declaration[]> | null = null;

  /**
   * A defaulted parameter, or one of its group, that a call of the program's gives a value that may be undefined or
   * spreads arguments over: JavaScript applies the default for an undefined argument as for an omitted one.
   */
  defaultGivenUndefined(p: ts.ParameterDeclaration): boolean {
    this.build();
    const group = new Set(this.groupOf(p));
    return [...group].some((q) => ts.isParameter(q) && this.spreadDefaults.has(q)) || this.defaultArguments.some(([q, a]) => group.has(q) && this.formOf(a).undefined);
  }

  /** A declaration whose group holds a fixed point's slot (a platform's or library's declaration): its form is that one's. */
  fixedSlot(d: ts.Declaration): boolean {
    this.build();
    return this.find(this.slotFor(d)).fixed;
  }

  /** What a declaration's own type admits (its checker type, its type as written, `?`, a default), before any flow. */
  declaredForm(d: ts.Declaration): Form {
    const s = this.declaredStates(d) | ((d as { initializer?: ts.Node }).initializer && ts.isParameter(d) ? U : 0);
    const type = this.declaredType(d) ?? this.checker.getTypeAtLocation(d);
    return { type: this.checker.getNonNullableType(type), undefined: !!(s & U), null: !!(s & N), hole: false, foreign: !!(s & F), missing: false, absent: false, observed: false, typeObserved: false };
  }

  /** A read as a `T` (of a generic slot, at a type parameter's type) holds what the slot holds less what instantiations bring. */
  private formFrom(flow: Flow, type: ts.Type, observed = false, depth = 0): Form {
    let states = flow.states, typeObserved = false;
    const parts = new Map<Part, Slot[]>();
    const asT = isGeneric(type);
    for (const [s, keep] of flow.from) {
      const r = this.find(s);
      states |= (r.generic && asT ? r.local : r.states) & keep;
      if (r.observed && keep & N) observed = true;
      if (r.typeObserved && keep & F) typeObserved = true;
      for (const [p, c] of r.children) { const list = parts.get(p); if (list) list.push(c); else parts.set(p, [c]); }
    }
    if (type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) states |= F;
    const form: Form = { type: this.checker.getNonNullableType(type), undefined: !!(states & U), null: !!(states & N), hole: !!(states & H), foreign: !!(states & F), missing: !!(states & U && states & M), absent: !!(states & A && states & (U | N)), observed, typeObserved };
    const part = this.partOf(type);
    const inner = part && parts.get(part);
    if (inner && depth < 4) {
      const t = elementType(this.checker, type, part!);
      if (t) form.element = this.formFrom({ states: 0, from: inner.map((c): [Slot, number] => [c, ~0]) }, t, false, depth + 1);
    }
    return form;
  }

  private partOf(t: ts.Type): Part | null {
    const x = this.checker.getNonNullableType(t);
    if (this.checker.isArrayType(x) || this.checker.isTupleType(x)) return 'element';
    const name = x.getSymbol()?.name;
    return name === 'Set' || name === 'ReadonlySet' ? 'element' : name === 'Map' || name === 'ReadonlyMap' ? 'value' : name === 'Promise' ? 'result' : null;
  }

  // ---- union-find

  private find(s: Slot): Slot {
    while (s.up !== s) s = s.up = s.up.up;
    return s;
  }

  private union(a: Slot, b: Slot): void {
    const x = this.find(a), y = this.find(b);
    if (x === y) return;
    y.up = x;
    if (x.fixed && y.fixed) x.give(y.states);
    else if (y.fixed) { x.fixed = true; x.states = x.local = y.states; }
    else if (!x.fixed) { x.states |= y.states; x.local |= y.local; }
    x.observed ||= y.observed;
    x.typeObserved ||= y.typeObserved;
    for (const [p, c] of y.children) {
      const mine = x.children.get(p);
      if (mine) this.share(mine, c);
      else x.children.set(p, c);
    }
  }

  /**
   * Slots that must agree: one form, unless one is typed by a type parameter and the other isn't (§2.3b M5). Their
   * states then flow by edges, masked where they cross (`crossing`): `from` to `to`, and back unless `oneWay`.
   * Returns whether they were merged.
   */
  private share(from: Slot, to: Slot, oneWay = false): boolean {
    const x = this.find(from), y = this.find(to);
    if (x === y) return false;
    if (x.generic === y.generic) { this.union(x, y); return true; }
    this.cross(x, y);
    if (!oneWay) this.cross(y, x);
    return false;
  }

  private cross(from: Slot, to: Slot): void {
    const seen = this.crossed.get(from) ?? new Set<Slot>();
    this.crossed.set(from, seen);
    if (seen.has(to)) return;
    seen.add(to);
    this.edges.push([from, to, ~0]);
  }

  /**
   * What an instantiation lets cross between a type parameter's slot and a concrete one: foreign never enters the type
   * parameter's; in strict code, only the empty states the concrete slot's type admits.
   */
  private crossing(concrete: Slot, intoGeneric: boolean): number {
    const admitted = withAbsent(concrete.typed && concrete.type ? typeStates(concrete.type) : U | N);
    return ~((U | M | N | A) & ~admitted) & (intoGeneric ? ~F : ~0);
  }

  private child(s: Slot, part: Part): Slot {
    const r = this.find(s);
    let c = r.children.get(part);
    if (!c) {
      const t = r.type ? elementType(this.checker, r.type, part) : null;
      c = new Slot(t ?? null);
      c.generic = isGeneric(t);
      this.made.push(c);
      if (r.fixed) { c.fixed = true; c.give(typeStates(t ?? undefined)); }
      else if (r.typed) { c.typed = true; c.give(typeStates(t ?? undefined)); }
      r.children.set(part, c);
    }
    return this.find(c);
  }

  /** The slot a declaration is, or an expression's own (an array literal's, a call's result built here). */
  private slotFor(n: ts.Node): Slot {
    let s = this.slots.get(n);
    if (s) return s;
    const declared = ts.isExpression(n) ? null : this.declaredType(n as ts.Declaration);
    s = new Slot(declared ?? (ts.isExpression(n) ? this.checker.getTypeAtLocation(n) : null), ts.isExpression(n) ? null : n as ts.Declaration);
    s.generic = isGeneric(s.type);
    this.made.push(s);
    this.slots.set(n, s);
    s.typed = this.strict(n);
    if (!ts.isExpression(n)) {
      const file = sourceOf(n);
      if (!file) return s;
      if (file.isDeclarationFile) {
        s.states = this.declaredStates(n as ts.Declaration);
        // A library's own declarations are its surface, which its callers write; others are fixed at what they say, and
        // a platform's at what its binding holds.
        if (!this.ownDeclaration(n as ts.Declaration)) { s.fixed = true; if (this.nativeNil(n as ts.Declaration)) s.states |= N; }
        else if (writtenByCallers(n) && !this.strict(n)) s.states |= this.openStates(n as ts.Declaration);
      }
      else if (this.strictFile(file)) s.states = this.declaredStates(n as ts.Declaration);
      s.local = s.states;
    }
    return s;
  }

  private declaredType(d: ts.Declaration): ts.Type | null {
    if (ts.isFunctionLike(d)) return this.checker.getSignatureFromDeclaration(d as ts.SignatureDeclaration)?.getReturnType() ?? null;
    const name = (d as ts.NamedDeclaration).name;
    const sym = name && this.checker.getSymbolAtLocation(name);
    return sym ? this.checker.getTypeOfSymbolAtLocation(sym, d) : name ? this.checker.getTypeAtLocation(name) : null;
  }

  /** What a declaration's own type says it holds: the checker's type (strict code), its type node (any code), `?`. */
  private declaredStates(d: ts.Declaration): number {
    const node = (d as { type?: ts.TypeNode }).type;
    let s = typeNodeStates(node);
    if (!ts.isFunctionLike(d) || !isAsync(d as ts.SignatureDeclaration)) s |= typeStates(this.declaredType(d) ?? undefined);
    if ((d as { questionToken?: ts.Node }).questionToken && !ts.isMethodDeclaration(d)) s |= U;
    return s;
  }

  /** The slot a function's returns go to: its result, or its Promise's for an async function. */
  private resultOf(fn: ts.SignatureDeclaration): Slot | null {
    if ((fn as ts.FunctionLikeDeclaration).asteriskToken) return null;
    const s = this.slotFor(fn);
    return isAsync(fn) ? this.child(s, 'result') : s;
  }

  // ---- placements

  private place(value: ts.Expression, target: Slot): void {
    const f = this.flow(value);
    const t = this.find(target);
    if (!t.fixed && !t.generic) t.give(f.states);
    else if (!t.fixed) {
      const states = f.states & this.instantiated(value), at = this.checker.getContextualType(value);
      t.states |= states;
      // The generic code's own value (placed at a `T`), not one an instantiation gives.
      if (!at || isGeneric(at)) t.local |= states;
    }
    const x = ts.skipOuterExpressions(value, ts.OuterExpressionKinds.Parentheses);
    const into = this.placed.get(x);
    if (into) into.push(target);
    else this.placed.set(x, [target]);
    if (!t.fixed && t.type && untyped(t.type)) this.placedUntyped.add(x);
    const d = target.decl;
    if (d && declarationFile(d) && !ts.isParameter(d) && !ts.isFunctionLike(d) && this.unseenReader(d)) this.observe(value);
    for (const [s, keep] of f.from) { this.edges.push([s, target, keep]); this.aliases.push([s, target]); }
  }

  /** What the instantiation a value is placed at admits, into a slot typed by a type parameter. */
  private instantiated(value: ts.Expression): number {
    const at = this.checker.getContextualType(value);
    if (!at || !this.strict(value) || isGeneric(at)) return ~F;
    return ~F & ~((U | M | N | A) & ~withAbsent(typeStates(at)));
  }

  private seed(target: Slot, states: number): void {
    const t = this.find(target);
    if (t.generic) states &= ~F;
    if (!t.fixed) t.give(states);
  }

  /** Every function value `fn` takes `sig`'s parameters and result: they share one form. */
  private unionSignature(fn: ts.SignatureDeclaration, sig: ts.SignatureDeclaration): void {
    if (fn === sig) return;
    // Callers of `sig` give `fn`'s arguments; `fn`'s result is `sig`'s.
    const theirs = valueParameters(sig);
    valueParameters(fn).forEach((p, k) => {
      const q = theirs[k];
      if (!q || !q.dotDotDotToken !== !p.dotDotDotToken) return;
      this.share(this.slotFor(q), this.slotFor(p), true);
      // Parameters of function type share their signatures too: a function given for one is called through the other.
      if (p.type && q.type && ts.isFunctionTypeNode(p.type) && ts.isFunctionTypeNode(q.type)) this.unionSignature(p.type, q.type);
    });
    if (!(fn as ts.FunctionLikeDeclaration).asteriskToken && !(sig as ts.FunctionLikeDeclaration).asteriskToken && !ts.isConstructorDeclaration(fn)) this.share(this.slotFor(fn), this.slotFor(sig), true);
  }

  private functionDeclarationOf(e: ts.Expression): ts.SignatureDeclaration | null {
    const x = ts.skipOuterExpressions(e);
    if (ts.isArrowFunction(x) || ts.isFunctionExpression(x)) return x;
    // `f.bind(thisArg)` is `f` with its parameters as they were.
    if (ts.isCallExpression(x) && ts.isPropertyAccessExpression(x.expression) && x.expression.name.text === 'bind' && x.arguments.length <= 1) return this.functionDeclarationOf(x.expression.expression);
    if (!ts.isIdentifier(x) && !ts.isPropertyAccessExpression(x)) return null;
    const d = this.declarationOf(ts.isPropertyAccessExpression(x) ? x.name : x);
    if (d && (ts.isFunctionDeclaration(d) || ts.isMethodDeclaration(d)) && d.body) return d;
    if (d && (ts.isVariableDeclaration(d) || ts.isPropertyDeclaration(d)) && d.initializer && !d.type) return this.functionDeclarationOf(d.initializer);
    return null;
  }

  /** The program's own function type a variable, parameter or field holding a function is declared with. */
  private functionTypeOf(e: ts.Expression): ts.SignatureDeclaration | null {
    if (!ts.isIdentifier(e) && !ts.isPropertyAccessExpression(e)) return null;
    const d = this.declarationOf(ts.isPropertyAccessExpression(e) ? e.name : e);
    if (!d || !(ts.isParameter(d) || ts.isVariableDeclaration(d) || ts.isPropertyDeclaration(d) || ts.isPropertySignature(d)) || !d.type || declarationFile(d)) return null;
    const sigs = this.checker.getNonNullableType(this.checker.getTypeAtLocation(e)).getCallSignatures();
    const sig = sigs.length === 1 ? sigs[0].getDeclaration() : undefined;
    return sig && !ts.isJSDocSignature(sig) && (ts.isFunctionTypeNode(sig) || ts.isCallSignatureDeclaration(sig)) && !declarationFile(sig) ? sig : null;
  }

  private declarationOf(name: ts.Node): ts.Declaration | undefined {
    let sym = ts.isShorthandPropertyAssignment(name.parent) && name.parent.name === name ? this.checker.getShorthandAssignmentValueSymbol(name.parent) : this.checker.getSymbolAtLocation(name);
    if (sym && sym.flags & ts.SymbolFlags.Alias) sym = this.checker.getAliasedSymbol(sym);
    return sym?.valueDeclaration ?? sym?.declarations?.[0];
  }

  /** Builds the placement graph and runs the fixpoint, once; `formOf` and `formOfSlot` do it when first asked. */
  build(): void {
    if (this.built) return;
    this.built = true;
    const start = performance.now();
    for (const f of this.files) if (!f.isDeclarationFile) this.visit(f);
    if (this.library) this.openLibrarySurface();
    this.openCalledByName();
    // Arrays, Maps and Promises are shared storage: wherever one flows, its elements are the same slot.
    for (let changed = true; changed;) {
      changed = false;
      for (const [a, b] of this.aliases) {
        const x = this.find(a), y = this.find(b);
        if (x === y || x.fixed || y.fixed || (y.type && y.type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown))) continue;
        for (const p of new Set([...x.children.keys(), ...y.children.keys()])) {
          const cx = this.child(x, p), cy = this.child(y, p);
          if (cx !== cy && this.share(cx, cy)) changed = true;
        }
      }
    }
    const out = new Map<Slot, [Slot, number][]>();
    for (const [from, to, keep] of this.edges) {
      const x = this.find(from), y = this.find(to);
      if (x === y || y.fixed) continue;
      const list = out.get(x);
      if (list) list.push([y, keep]);
      else out.set(x, [[y, keep]]);
    }
    this.propagate(out, [...out.keys()]);
    for (let opened = this.openForeignShapes(); opened.length; opened = this.openForeignShapes()) this.propagate(out, opened);
    this.propagateObserved();
    this.propagateTypeObserved();
    this.buildMs = performance.now() - start;
  }

  private propagate(out: Map<Slot, [Slot, number][]>, work: Slot[]): void {
    while (work.length) {
      const x = work.pop()!;
      for (const [y, keep] of out.get(x) ?? []) {
        const r = this.find(y);
        if (r.fixed) continue;
        let more = x.states & keep & ~r.states;
        if (x.generic !== r.generic) more &= this.crossing(x.generic ? r : x, r.generic);
        // What crosses into a `T` from a concrete slot is an instantiation's.
        const local = x.generic && r.generic ? x.local & keep & ~r.local : 0;
        if (more || local) { r.states |= more; r.local |= local; work.push(r); }
      }
    }
  }

  private readonly openedShapes = new Set<ts.Type>();
  private readonly openedSignatures = new Set<ts.Declaration>();

  /**
   * A foreign value held as an interface or object literal type has its keys, not the type's (§2.3b M4): each field of the
   * type may be missing, null or another type, and so may a foreign array's or Map's elements, and a foreign function's
   * (or a shape's method's) parameters and result. A class's instance is its class's or fails the cast. Returns the
   * slots this widened.
   */
  private openForeignShapes(): Slot[] {
    const widened: Slot[] = [];
    const open = (s: Slot) => {
      const r = this.find(s);
      if (r.fixed || r.generic) return;
      // The untyped code that shares the object reads its fields where the program can't see.
      r.observed = true;
      if ((r.states & (U | N | F)) === (U | N | F)) return;
      r.give(U | N | F);
      widened.push(r);
    };
    const openSignature = (sig: ts.Signature | ts.Declaration | undefined) => {
      const d = sig && 'getDeclaration' in sig ? sig.getDeclaration() : sig;
      if (!d || ts.isJSDocSignature(d) || !ts.isFunctionLike(d) || declarationFile(d) || this.openedSignatures.has(d)) return;
      this.openedSignatures.add(d);
      for (const p of d.parameters) if (!p.dotDotDotToken) open(this.slotFor(p));
      const result = ts.isConstructorDeclaration(d) || ts.isSetAccessorDeclaration(d) ? null : this.resultOf(d);
      if (result) open(result);
    };
    for (const s of [...this.made]) {
      const r = this.find(s);
      if (!(r.states & F) || r.generic || !r.type) continue;
      for (const c of r.children.values()) open(c);
      const whole = this.checker.getNonNullableType(r.type);
      for (const m of whole.isUnion() ? whole.types : [whole]) if (!m.isClass()) m.getCallSignatures().forEach(openSignature);
      for (const t of shapes(this.checker, r.type)) {
        if (this.openedShapes.has(t)) continue;
        this.openedShapes.add(t);
        for (const p of this.checker.getPropertiesOfType(t)) {
          const d = p.valueDeclaration;
          if (d && (ts.isPropertySignature(d) || ts.isPropertyDeclaration(d)) && !declarationFile(d)) open(this.slotFor(d));
          if (d && ts.isMethodSignature(d)) openSignature(d);
        }
      }
    }
    return widened;
  }

  // ---- observers (§2.3b M1'): where null and undefined are told apart

  /** A value something tells null from undefined in. */
  private observe(e: ts.Expression): void {
    const x = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
    this.observedValues.add(x);
    this.flow(x);
  }

  /** A value whose type something tests (§2.3b M6). */
  private observeType(e: ts.Expression): void {
    const x = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
    this.typeObservedValues.add(x);
    this.flow(x);
  }

  /** A value script holds untyped, which reads it as it likes and may write into what it holds. */
  private observeUntyped(e: ts.Expression): void {
    this.observe(e);
    this.placedUntyped.add(ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses));
  }

  /**
   * A read of a member the receiver's declared type doesn't have (`(v as any).extra`, a lenient `v['extra']`), which tests
   * what the value really is (§2.3b M6).
   */
  private observeUndeclaredMember(n: ts.PropertyAccessExpression | ts.ElementAccessExpression): void {
    if (ts.isPropertyAccessExpression(n) && ts.isPrivateIdentifier(n.name)) return;
    const untyped = ts.TypeFlags.Any | ts.TypeFlags.Unknown;
    let x = ts.skipOuterExpressions(n.expression, ts.OuterExpressionKinds.Parentheses);
    if ((ts.isAsExpression(x) || ts.isTypeAssertionExpression(x)) && this.checker.getTypeAtLocation(x).flags & untyped) x = ts.skipOuterExpressions(x.expression, ts.OuterExpressionKinds.Parentheses);
    const t = this.checker.getNonNullableType(this.checker.getTypeAtLocation(x));
    if (t.flags & (untyped | ts.TypeFlags.TypeParameter) || isGeneric(t)) return;
    const apparent = this.checker.getApparentType(t);
    const key = ts.isPropertyAccessExpression(n) ? n.name.text : ts.isStringLiteralLike(n.argumentExpression) || ts.isNumericLiteral(n.argumentExpression) ? n.argumentExpression.text : null;
    const indexed = (k: ts.Type) => this.checker.getIndexInfosOfType(apparent).some((i) => this.checker.isTypeAssignableTo(k, i.keyType));
    if (key === null) {
      const k = this.checker.getTypeAtLocation(n.argumentExpression);
      if (!(k.flags & ts.TypeFlags.StringLike) || indexed(k)) return;
      // A key of literal types (`scope[SLOT]` of a `const SLOT = '__slot__'`) names the members it may be.
      const names = k.isUnion() ? k.types : [k];
      if (names.every((l) => l.isStringLiteral() && this.checker.getPropertyOfType(apparent, l.value))) return;
    } else if (this.checker.getPropertyOfType(apparent, key) || indexed(/^\d+$/.test(key) ? this.checker.getNumberType() : this.checker.getStringType())) return;
    this.observeType(x);
  }

  /** Whether an expression may give null or undefined: whether comparing with it tells them apart. */
  private mayBeEmpty(e: ts.Expression): boolean {
    const f = this.flow(e);
    return !!(f.states & (U | N)) || f.from.length > 0;
  }

  /** The readers at `n` that tell null from undefined. */
  private placeObservers(n: ts.Node): void {
    const K = ts.SyntaxKind;
    if (ts.isBinaryExpression(n)) {
      const op = n.operatorToken.kind;
      if (op === K.EqualsEqualsEqualsToken || op === K.ExclamationEqualsEqualsToken) {
        if (this.mayBeEmpty(n.right)) this.observe(n.left);
        if (this.mayBeEmpty(n.left)) this.observe(n.right);
      } else if (CONVERTING.has(op)) { this.observe(n.left); this.observe(n.right); }
      else if (op === K.InKeyword) { this.observe(n.left); this.observeType(n.right); }
      else if (op === K.InstanceOfKeyword) this.observeType(n.left);
    } else if (ts.isCallExpression(n) && n.arguments.length && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === 'isArray'
      && ts.isIdentifier(n.expression.expression) && n.expression.expression.text === 'Array') this.observeType(n.arguments[0]); else if (ts.isPrefixUnaryExpression(n)) { if (n.operator !== K.ExclamationToken) this.observe(n.operand); }
    else if (ts.isPostfixUnaryExpression(n)) this.observe(n.operand);
    else if (ts.isTypeOfExpression(n)) { this.observe(n.expression); this.observeType(n.expression); }
    else if (ts.isTemplateSpan(n) || ts.isComputedPropertyName(n)) this.observe(n.expression);
    else if (ts.isElementAccessExpression(n)) { this.observe(n.argumentExpression); this.observeUndeclaredMember(n); }
    else if (ts.isPropertyAccessExpression(n)) this.observeUndeclaredMember(n);
    else if (ts.isSwitchStatement(n)) {
      for (const clause of n.caseBlock.clauses) {
        if (!ts.isCaseClause(clause)) continue;
        if (this.mayBeEmpty(clause.expression)) this.observe(n.expression);
        if (this.mayBeEmpty(n.expression)) this.observe(clause.expression);
      }
    } else if (ts.isParameter(n) && n.initializer && !isTemplateDefault(n)) this.observedSlots.push(this.slotFor(n));
  }

  /**
   * Whether a declaration file's reader may tell null from undefined in what it is given, or in a function's result it
   * reads. A platform binding gets one nil for both unless it takes any value; a built-in typed for objects only takes
   * both as no object; the stores the flow follows (`push`, `set`, …) hold the value where its readers are seen. The
   * library's own declarations are implemented elsewhere in it, and read by its callers: unseen.
   */
  private unseenReader(d: ts.Declaration): boolean {
    if (this.ownDeclaration(d)) return true;
    let node = (d as { type?: ts.TypeNode }).type;
    let type = this.declaredType(d);
    if (ts.isParameter(d) && d.dotDotDotToken) {
      node = node && ts.isArrayTypeNode(node) ? node.elementType : undefined;
      type = type && elementType(this.checker, type, 'element');
    }
    if (!node || typeNodeStates(node) & F) return true;
    if (this.native(d)) return false;
    if (ts.isParameter(d) && LIB_FILE.test(d.getSourceFile().fileName) && ts.isInterfaceDeclaration(d.parent.parent) && STORE_OWNERS.has(d.parent.parent.name.text)) {
      const name = (d.parent as ts.SignatureDeclaration).name, from = name && ts.isIdentifier(name) ? STORES.get(name.text) : undefined;
      if (from !== undefined && d.parent.parameters.indexOf(d) >= from) return false;
    }
    if (typeNodeStates(node) & N || !type) return true;
    const t = this.checker.getNonNullableType(type);
    return (t.isUnion() ? t.types : [t]).some((x) => !(x.flags & ts.TypeFlags.Object));
  }

  /** Arguments given to a declaration file's function, or to a callee of no known declaration. */
  private observeArguments(call: ts.CallExpression | ts.NewExpression, sig: ts.SignatureDeclaration | undefined, args: ts.NodeArray<ts.Expression>): void {
    if (!sig) { for (const a of args) this.observeUntyped(ts.isSpreadElement(a) ? a.expression : a); return; }
    const callee = ts.isPropertyAccessExpression(call.expression) && ts.isIdentifier(call.expression.expression) && LIB_FILE.test(sig.getSourceFile().fileName) ? call.expression.expression.text : '';
    const params = valueParameters(sig);
    args.forEach((a, k) => {
      const q = params[Math.min(k, params.length - 1)];
      if (!q || (k >= params.length && !q.dotDotDotToken)) return;
      const value = ts.isSpreadElement(a) ? a.expression : a;
      if (callee === 'JSON' || callee === 'console') this.printed.push([value, callee === 'JSON']);
      if (this.unseenReader(q)) this.observe(value);
    });
  }

  /** What printing a value reads: its fields and elements, a class instance's only for JSON (console prints its name). */
  private observePrinted(e: ts.Expression, classes: boolean, slots: Set<Slot>, types: Set<ts.Type>): void {
    const c = this.checker;
    const slot = (s: Slot, depth: number) => {
      const r = this.find(s);
      if (slots.has(r) || depth > 4) return;
      slots.add(r);
      r.observed = true;
      for (const x of r.children.values()) slot(x, depth + 1);
      if (r.type) type(r.type, depth);
    };
    const type = (t: ts.Type, depth: number) => {
      const x = c.getNonNullableType(t);
      for (const m of x.isUnion() ? x.types : [x]) {
        if (types.has(m) || !(m.flags & ts.TypeFlags.Object) || m.getCallSignatures().length || (!classes && m.isClass())) continue;
        types.add(m);
        if (c.isArrayType(m) || c.isTupleType(m)) { const el = elementType(c, m, 'element'); if (el) type(el, depth + 1); continue; }
        for (const p of c.getPropertiesOfType(m)) {
          const d = p.valueDeclaration;
          if (d && (ts.isPropertyDeclaration(d) || ts.isPropertySignature(d) || ts.isPropertyAssignment(d) || ts.isShorthandPropertyAssignment(d)) && !declarationFile(d)) slot(this.slotFor(d), depth + 1);
        }
      }
    };
    for (const [s, keep] of this.flow(e).from) if (keep & N) slot(s, 0);
    type(c.getTypeAtLocation(e), 0);
  }

  /**
   * Observation runs backwards along placements: a value whose null may reach an observed slot is observed. One pass
   * over the edges, reversed, from the observed roots.
   */
  private propagateObserved(): void {
    for (const s of this.observedSlots) this.find(s).observed = true;
    // A Set keeps a null member apart from an undefined one.
    for (const s of this.made) {
      const name = s.type && this.checker.getNonNullableType(s.type).getSymbol()?.name;
      const c = (name === 'Set' || name === 'ReadonlySet') && this.find(s).children.get('element');
      if (c) this.find(c).observed = true;
    }
    for (const e of this.observedValues) for (const [s, keep] of this.flow(e).from) if (keep & N) this.find(s).observed = true;
    const slots = new Set<Slot>(), types = new Set<ts.Type>();
    for (const [e, classes] of this.printed) this.observePrinted(e, classes, slots, types);
    const into = new Map<Slot, Slot[]>();
    for (const [from, to, keep] of this.edges) {
      if (!(keep & N)) continue;
      const x = this.find(from), y = this.find(to);
      if (x === y) continue;
      const list = into.get(y);
      if (list) list.push(x);
      else into.set(y, [x]);
    }
    for (const [from, to] of this.copies) {
      const x = this.find(from), y = this.find(to);
      if (x === y) continue;
      const list = into.get(x);
      if (list) list.push(y);
      else into.set(x, [y]);
    }
    for (let work = [...new Set(this.made.map((s) => this.find(s)).filter((r) => r.observed))]; work.length;) {
      const y = work.pop()!;
      for (const x of into.get(y) ?? []) if (!x.observed) { x.observed = true; work.push(x); }
    }
  }

  /** Type observation runs backwards along the placements foreign values take, as null observation does along null's. */
  private propagateTypeObserved(): void {
    for (const e of this.typeObservedValues) for (const [s, keep] of this.flow(e).from) if (keep & F) this.find(s).typeObserved = true;
    const into = new Map<Slot, Slot[]>();
    for (const [from, to, keep] of this.edges) {
      if (!(keep & F)) continue;
      const x = this.find(from), y = this.find(to);
      if (x === y) continue;
      const list = into.get(y);
      if (list) list.push(x);
      else into.set(y, [x]);
    }
    for (let work = [...new Set(this.made.map((s) => this.find(s)).filter((r) => r.typeObserved))]; work.length;) {
      const y = work.pop()!;
      for (const x of into.get(y) ?? []) if (!x.typeObserved) { x.typeObserved = true; work.push(x); }
    }
  }

  private visit(n: ts.Node): void {
    const c = this.checker;
    if (ts.isExpression(n) && !ts.isParenthesizedExpression(n)) this.placeExpression(n);
    this.placeObservers(n);
    if (ts.isParameter(n) && n.questionToken && !n.initializer) this.seed(this.slotFor(n), U | M);
    if (ts.isVariableDeclaration(n) && !n.initializer && ts.isIdentifier(n.name) && ts.isVariableDeclarationList(n.parent)) {
      const loop = n.parent.parent;
      if (ts.isForOfStatement(loop) && loop.initializer === n.parent) this.placeElements(loop.expression, this.slotFor(n), loop.awaitModifier ? 'result' : null);
      else if (!ts.isForInStatement(loop) && !(ts.getCombinedModifierFlags(n) & ts.ModifierFlags.Ambient)) this.seed(this.slotFor(n), U);
    }
    if (ts.isVariableDeclaration(n) && n.parent && ts.isCatchClause(n.parent)) this.seed(this.slotFor(n), F | U | N);
    if (ts.isBindingElement(n) && ts.isIdentifier(n.name)) this.placeBinding(n);
    if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && (ts.isArrayLiteralExpression(n.left) || ts.isObjectLiteralExpression(n.left))) this.placeAssignedParts(n.left, n.right, false);
    if (ts.isForOfStatement(n) && !ts.isVariableDeclarationList(n.initializer)) this.placeAssignedParts(n.initializer, n.expression, true);
    if (ts.isPropertyDeclaration(n) && !n.initializer && ts.isClassLike(n.parent) && !(ts.getCombinedModifierFlags(n) & (ts.ModifierFlags.Ambient | ts.ModifierFlags.Abstract))) {
      if (n.questionToken || hasStatic(n) || !definitelyAssigned(n.parent).has(n)) this.seed(this.slotFor(n), U);
    }
    if (ts.isPropertySignature(n) && n.questionToken) this.seed(this.slotFor(n), U);
    if (ts.isReturnStatement(n) && !n.expression) {
      const fn = ts.findAncestor(n.parent, ts.isFunctionLike);
      const r = fn && this.resultOf(fn as ts.SignatureDeclaration);
      if (r) this.seed(r, U | this.absent(n));
    }
    if ((ts.isFunctionDeclaration(n) || ts.isMethodDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n) || ts.isGetAccessorDeclaration(n)) && n.body && ts.isBlock(n.body) && !alwaysEnds(n.body)) {
      const r = this.resultOf(n);
      if (r) this.seed(r, U | this.absent(n));
    }
    if (ts.isClassLike(n)) this.unionClass(n);
    if (isTemplateMethod(n)) this.placeTemplateMethod(n as ts.MethodDeclaration);
    if (ts.isMethodDeclaration(n) && ts.isObjectLiteralExpression(n.parent) && n.body) {
      const ctx = c.getContextualType(n.parent), key = literalKey(n.name, c);
      const prop = ctx && !untyped(ctx) && key !== null ? c.getNonNullableType(ctx).getProperty(key) : undefined;
      this.placeFunction(n, ctx && untyped(ctx) ? ctx : prop && c.getTypeOfSymbolAtLocation(prop, n));
    }
    if ((ts.isFunctionDeclaration(n) || ts.isMethodDeclaration(n)) && n.name) {
      const decls = this.checker.getSymbolAtLocation(n.name)?.declarations?.filter((d): d is ts.SignatureDeclaration => ts.isFunctionLike(d)) ?? [];
      if (decls.length > 1 && decls[0] !== n) this.unionSignature(n, decls[0]);
    }
    if (ts.isArrowFunction(n) || ts.isFunctionExpression(n) || ts.isIdentifier(n) || ts.isPropertyAccessExpression(n)) this.unionFunctionValue(n as ts.Expression);
    if (ts.isCallExpression(n) || ts.isNewExpression(n)) this.placeCall(n);
    if (ts.isCallExpression(n)) this.placeCallByName(n);
    if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isElementAccessExpression(n.left)) {
      const recv = n.left.expression;
      const part: Part = c.isArrayType(c.getNonNullableType(c.getTypeAtLocation(recv))) ? 'element' : 'value';
      for (const [s] of this.flow(recv).from) this.place(n.right, this.child(s, part));
    }
    ts.forEachChild(n, (x) => this.visit(x));
  }

  /** A value placed where a slot takes it: `slotOf`'s slots, returns, literal fields and elements. */
  private placeExpression(e: ts.Expression): void {
    let x: ts.Node = e;
    while (ts.isParenthesizedExpression(x.parent)) x = x.parent;
    const p = x.parent;
    if (ts.isReturnStatement(p) || (ts.isArrowFunction(p) && p.body === x)) {
      const fn = ts.isArrowFunction(p) ? p : ts.findAncestor(p, ts.isFunctionLike);
      const r = fn && !ts.isConstructorDeclaration(fn) && !ts.isSetAccessorDeclaration(fn) ? this.resultOf(fn as ts.SignatureDeclaration) : null;
      if (r) this.place(e, r);
      if (r && (e.kind === ts.SyntaxKind.NullKeyword || ts.isVoidExpression(e) || (ts.isIdentifier(e) && e.text === 'undefined'))) this.seed(r, this.absent(e));
      return;
    }
    if (ts.isArrayLiteralExpression(p)) {
      this.place(e, this.child(this.slotFor(p), 'element'));
      if (this.untypedContext(p)) this.observeUntyped(e);
      return;
    }
    if (ts.isSpreadElement(p) && ts.isArrayLiteralExpression(p.parent)) {
      this.placeElements(e, this.child(this.slotFor(p.parent), 'element'), null, true);
      return;
    }
    if (ts.isOmittedExpression(e) && ts.isArrayLiteralExpression(p)) return;
    if ((ts.isPropertyAssignment(p) && p.initializer === x) || (ts.isShorthandPropertyAssignment(p) && p.name === x)) {
      const own = this.slotFor(p);
      this.place(e, own);
      if (this.untypedContext(p.parent)) this.observeUntyped(e);
      const key = literalKey(p.name, this.checker);
      const declared = key !== null ? this.checker.getContextualType(p.parent)?.getProperty(key) : undefined;
      const d = declared?.valueDeclaration ?? declared?.declarations?.[0];
      if (d && d !== p) this.share(own, this.slotFor(d));
      if (d && declarationFile(d) && this.unseenReader(d)) this.observe(e);
      return;
    }
    if (ts.isBinaryExpression(p) && p.right === x && LOGICAL_ASSIGNMENT.has(p.operatorToken.kind)) {
      const d = this.declarationOf(ts.isPropertyAccessExpression(p.left) ? p.left.name : p.left);
      if (d) this.place(e, this.slotFor(d));
      return;
    }
    if (ts.isBinaryExpression(p) && p.right === x && p.operatorToken.kind === ts.SyntaxKind.EqualsToken && (ts.isPropertyAccessExpression(p.left) || ts.isElementAccessExpression(p.left))
      && untyped(this.checker.getTypeAtLocation(p.left.expression))) this.observeUntyped(e);
    const d = slotOf(e, this.checker);
    if (!d || ts.isFunctionLike(d)) return;
    if ((ts.isParameter(d) || ts.isVariableDeclaration(d) || ts.isPropertyDeclaration(d)) && d.initializer === x) {
      if (ts.isIdentifier(d.name) && !isTemplateDefault(d)) this.place(e, this.slotFor(d));
      return;
    }
    this.place(e, this.slotFor(d));
  }

  /** Elements of `source` (an array, a Set, a Map's entries, a Promise's result for `for await`) placed in `target`. */
  /**
   * A template's own method (`$b…`, `$e…`): the template's glue, which this compiler writes, is its only caller. A
   * loop's item is an element of the list its default reads (`item = this.$b2()[0]`); an untyped `$event` is an
   * output's payload, anything; the rest (indexes, a view event's data, pipes, references) are always given.
   */
  private placeTemplateMethod(m: ts.MethodDeclaration): void {
    for (const p of m.parameters) {
      const init = p.initializer && ts.skipOuterExpressions(p.initializer);
      if (init && ts.isElementAccessExpression(init)) this.placeElements(init.expression, this.slotFor(p), null);
      else if (!init && (!p.type || typeNodeStates(p.type) & F)) this.seed(this.slotFor(p), U | N | F);
    }
  }

  /**
   * Members Angular may call: every method and setter of an Angular class but its private ones (lifecycle hooks aside)
   * and the template glue this compiler writes. Its runtime, forms (`writeValue(null)` of a value accessor registered by a provider), the router
   * and DI tokens call them where the program can't see. Other decorators (`@CSSType`, `@profile`) register or wrap a
   * class or method and call nothing; a platform calls a subclass of its class (`extendsNative`).
   */
  private frameworkCalled(cls: ts.ClassLikeDeclaration, m: ts.MethodDeclaration | ts.SetAccessorDeclaration): boolean {
    if (isTemplateMethod(m)) return false;
    if (ts.getDecorators(m)?.some((d) => this.angularDecorator(d, METHOD_DECORATORS))) return true;
    if (!ts.getDecorators(cls)?.some((d) => this.angularDecorator(d, ANGULAR_DECORATORS))) return false;
    return LIFECYCLE_HOOKS.has(m.name.getText()) || !(ts.isPrivateIdentifier(m.name) || ts.getCombinedModifierFlags(m) & ts.ModifierFlags.Private);
  }

  /** A call through a computed key (`this[name](x)`, `obj[k].call(o, x)`): see `calledByName`. */
  private placeCallByName(call: ts.CallExpression): void {
    let callee = ts.skipOuterExpressions(call.expression);
    if (ts.isPropertyAccessExpression(callee) && (callee.name.text === 'call' || callee.name.text === 'apply')) callee = ts.skipOuterExpressions(callee.expression);
    if (!ts.isElementAccessExpression(callee)) return;
    const key = ts.skipOuterExpressions(callee.argumentExpression);
    if (ts.isStringLiteralLike(key) || ts.isNumericLiteral(key)) return;
    const t = this.checker.getTypeAtLocation(key), parts = t.isUnion() ? t.types : [t];
    const names = parts.every((x) => x.isStringLiteral()) ? new Set(parts.map((x) => (x as ts.StringLiteralType).value)) : null;
    for (const { owner, statics } of this.ownersOf(callee.expression)) this.calledByName.push({ owner, names, statics });
  }

  /**
   * The declarations whose members a receiver's are: classes (`statics` where it is the class itself), interfaces, type
   * literals and object literals of the program. An untyped receiver is followed to its variable's initializer
   * (`const self: any = this`); one that can't be is null.
   */
  private ownersOf(e: ts.Expression, depth = 0): { owner: Owner | null; statics: boolean }[] {
    const c = this.checker, x = ts.skipOuterExpressions(e);
    let t = c.getNonNullableType(c.getTypeAtLocation(x));
    if (t.flags & ts.TypeFlags.TypeParameter) t = c.getBaseConstraintOfType(t) ?? t;
    if (untyped(t)) {
      const d = ts.isIdentifier(x) ? c.getSymbolAtLocation(x)?.valueDeclaration : undefined;
      return d && ts.isVariableDeclaration(d) && d.initializer && depth < 4 ? this.ownersOf(d.initializer, depth + 1) : [{ owner: null, statics: false }];
    }
    const owners: { owner: Owner; statics: boolean }[] = [];
    for (const part of t.isUnionOrIntersection() ? t.types : [t]) {
      for (const d of part.getSymbol()?.declarations ?? []) {
        if (declarationFile(d)) continue;
        if (ts.isClassLike(d)) owners.push({ owner: d, statics: part.getConstructSignatures().length > 0 });
        else if (ts.isInterfaceDeclaration(d) || ts.isTypeLiteralNode(d) || ts.isObjectLiteralExpression(d)) owners.push({ owner: d, statics: false });
      }
    }
    return owners;
  }

  /**
   * The parameters of members called by a computed key are entry points: the owner's members the key may name, and a
   * class's subclasses' (an override is what the call reaches); every non-strict class's where the receiver is untraced.
   */
  private openCalledByName(): void {
    const c = this.checker;
    const derives = (t: ts.Type, owner: Owner, depth = 0): boolean => depth < 32 && t.isClassOrInterface()
      && c.getBaseTypes(t).some((b) => !!b.getSymbol()?.declarations?.includes(owner as ts.Declaration) || derives(b, owner, depth + 1));
    for (const { owner, names, statics } of this.calledByName) {
      const owners: Owner[] = owner === null ? this.classes.filter((x) => !this.strict(x))
        : ts.isClassLike(owner) ? [owner, ...this.classes.filter((x) => x !== owner && derives(c.getTypeAtLocation(x.name ?? x), owner))] : [owner];
      for (const o of owners) {
        for (const m of ts.isObjectLiteralExpression(o) ? o.properties : o.members) {
          if (!m.name || hasStatic(m) !== statics) continue;
          const name = literalKey(m.name, c);
          if (name === null || (names && !names.has(name))) continue;
          const fn = ts.isPropertyAssignment(m) ? this.functionDeclarationOf(m.initializer) : ts.isMethodDeclaration(m) || ts.isMethodSignature(m) ? m : null;
          if (fn) this.openParameters(fn);
        }
      }
    }
  }

  private byName: Set<ts.ClassLikeDeclaration> | null = null;
  private byNameStatic = new Set<ts.ClassLikeDeclaration>();

  /**
   * The program's classes whose instances script reaches by name (§2.5, methods and accessors): a value of the class
   * placed in an untyped slot (one of the program's, or a library's `any` other than TypeScript's own lib), asserted to
   * `any`/`unknown`, the receiver of a member access by a key the program doesn't spell, or tested with `in`. A class's
   * whole hierarchy goes with it: a subclass's object is held as its base, and a base's members are the subclass's too.
   * A type parameter reached so reaches the classes of the arguments its function is called with.
   */
  byNameClasses(): ReadonlySet<ts.ClassLikeDeclaration> {
    if (this.byName) return this.byName;
    this.build();
    const c = this.checker, found = new Set<ts.ClassLikeDeclaration>(), statics = this.byNameStatic;
    const generic = new Set<ts.Symbol>(), calls: (ts.CallExpression | ts.NewExpression)[] = [];
    const classOf = (e: ts.Expression) => {
      let t = c.getNonNullableType(c.getTypeAtLocation(e));
      if (t.flags & ts.TypeFlags.TypeParameter) {
        const s = t.getSymbol();
        if (s) generic.add(s);
        t = c.getBaseConstraintOfType(t) ?? t;
      }
      for (const part of t.isUnionOrIntersection() ? t.types : [t]) {
        const into = part.getConstructSignatures().length ? statics : found;
        for (const d of part.getSymbol()?.declarations ?? []) if (ts.isClassLike(d) && !declarationFile(d)) into.add(d);
      }
    };
    for (const [x, slots] of this.placed) {
      if (slots.some((s) => { const r = this.find(s); return !!r.type && untyped(r.type) && !(r.decl && LIB_FILE.test(r.decl.getSourceFile().fileName)); })) classOf(x);
    }
    for (const x of this.placedUntyped) classOf(x);
    const visit = (n: ts.Node): void => {
      if ((ts.isAsExpression(n) || ts.isTypeAssertionExpression(n)) && untyped(c.getTypeAtLocation(n))) classOf(n.expression);
      if (ts.isElementAccessExpression(n)) {
        const key = ts.skipOuterExpressions(n.argumentExpression);
        if (!ts.isStringLiteralLike(key) && !ts.isNumericLiteral(key) && c.getTypeAtLocation(key).flags & ts.TypeFlags.StringLike) {
          for (const { owner, statics: s } of this.ownersOf(n.expression)) if (owner && ts.isClassLike(owner)) (s ? statics : found).add(owner);
          if (c.getTypeAtLocation(n.expression).flags & ts.TypeFlags.TypeParameter) classOf(n.expression);
        }
      }
      if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.InKeyword) classOf(n.right);
      if ((ts.isCallExpression(n) || ts.isNewExpression(n)) && n.arguments?.length) calls.push(n);
      ts.forEachChild(n, visit);
    };
    for (const f of this.files) if (!f.isDeclarationFile) visit(f);
    // `f<T>(x: T) { (x as any)[k]() }`: the arguments given for `x`, through other generic functions passing it on.
    for (let size = 0; generic.size > size; ) {
      size = generic.size;
      for (const call of calls) {
        const decl = c.getResolvedSignature(call)?.declaration;
        if (!decl || ts.isJSDocSignature(decl)) continue;
        decl.parameters.forEach((p, k) => {
          const arg = call.arguments![k];
          if (!arg || p.dotDotDotToken || !p.type || !ts.isTypeReferenceNode(p.type)) return;
          const s = c.getSymbolAtLocation(p.type.typeName);
          if (s && generic.has(s)) classOf(arg);
        });
      }
    }
    const own = (t: ts.Type) => t.getSymbol()?.declarations?.find((d): d is ts.ClassLikeDeclaration => ts.isClassLike(d) && !declarationFile(d));
    // Bases go with a class: a subclass's object is held as its base, and a subclass's statics include its bases'.
    for (const set of [found, statics]) {
      for (const cls of [...set]) {
        for (let t: ts.Type | undefined = c.getTypeAtLocation(cls.name ?? cls); t?.isClassOrInterface(); t = c.getBaseTypes(t)[0]) {
          const d = own(t);
          if (!d) break;
          set.add(d);
        }
      }
    }
    const derived = (cls: ts.ClassLikeDeclaration, depth = 0): boolean => {
      const t = c.getTypeAtLocation(cls.name ?? cls);
      return depth < 32 && t.isClassOrInterface() && c.getBaseTypes(t).some((b) => { const d = own(b); return !!d && (found.has(d) || derived(d, depth + 1)); });
    };
    for (const cls of this.classes) if (!found.has(cls) && derived(cls)) found.add(cls);
    return this.byName = found;
  }

  /** The program's classes whose statics script reaches by name: the class itself held untyped, or indexed by a key the program doesn't spell. */
  byNameStaticClasses(): ReadonlySet<ts.ClassLikeDeclaration> {
    this.byNameClasses();
    return this.byNameStatic;
  }

  private angularDecorator(d: ts.Decorator, names: ReadonlySet<string>): boolean {
    const e = ts.isCallExpression(d.expression) ? d.expression.expression : d.expression;
    let sym = this.checker.getSymbolAtLocation(e);
    if (sym && sym.flags & ts.SymbolFlags.Alias) sym = this.checker.getAliasedSymbol(sym);
    return !!sym && names.has(sym.name) && !!sym.declarations?.some((x) => /^\/__shims__\/_angular_core\.d\.ts$|[\\/]@angular[\\/]core[\\/]/.test(x.getSourceFile().fileName));
  }

  /** A literal placed where no type says what reads its fields or elements. */
  private untypedContext(literal: ts.Expression): boolean {
    const t = this.checker.getContextualType(literal);
    return !!t && untyped(t);
  }

  private placeElements(source: ts.Expression, target: Slot, part: Part | null, copy = false): void {
    const f = this.flow(source);
    const t = this.checker.getNonNullableType(this.checker.getTypeAtLocation(source));
    const p: Part = part ?? (t.getSymbol()?.name === 'Map' ? 'value' : 'element');
    for (const [s] of f.from) {
      const from = this.child(s, p);
      this.edges.push([from, target, ~0]);
      if (copy) this.copies.push([from, target]);
    }
    if (t.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) this.seed(target, F | U | N);
  }

  /** The variables a destructuring assignment's pattern (or a `for…of`'s target) writes from an untyped value: whatever it holds there. */
  private placeAssignedParts(pattern: ts.Expression, whole: ts.Expression, iterated: boolean): void {
    if (!(this.checker.getTypeAtLocation(whole).flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown))) return;
    for (const t of iterated ? patternTargets(pattern) : patternTargets(pattern).filter((t) => t !== pattern)) {
      const short = ts.isShorthandPropertyAssignment(t.parent) && t.parent.name === t ? t.parent : null;
      const d = ts.isIdentifier(t) ? (short ? this.checker.getShorthandAssignmentValueSymbol(short) : this.checker.getSymbolAtLocation(t))?.valueDeclaration : undefined;
      if (d && (ts.isVariableDeclaration(d) || ts.isParameter(d)) && !declarationFile(d)) this.seed(this.slotFor(d), F);
    }
  }

  private placeBinding(b: ts.BindingElement): void {
    const slot = this.slotFor(b);
    if (b.initializer) this.place(b.initializer, slot);
    const keep = b.initializer ? ~(U | M) : ~0;
    const pattern = b.parent;
    // What a pattern reads from an untyped value is whatever that value holds there, whatever the pattern's type says.
    const whole = patternSource(b);
    if (whole && !whole.iterated && this.checker.getTypeAtLocation(whole.whole).flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) this.seed(slot, F);
    if (ts.isObjectBindingPattern(pattern)) {
      if (b.dotDotDotToken) return;
      const key = b.propertyName ? literalKey(b.propertyName, this.checker) : (b.name as ts.Identifier).text;
      const prop = key !== null ? this.checker.getTypeAtLocation(pattern).getProperty(key) : undefined;
      const d = prop?.valueDeclaration ?? prop?.declarations?.[0];
      if (d) { this.edges.push([this.slotFor(d), slot, keep]); if (b.initializer) this.observedSlots.push(this.slotFor(d)); }
      else this.seed(slot, this.unknownStates(b.name as ts.Identifier) & keep);
      return;
    }
    if (b.dotDotDotToken) return;
    const holder = pattern.parent;
    const source = ts.isVariableDeclaration(holder) ? holder.initializer : undefined;
    if (!source) { this.seed(slot, this.unknownStates(b.name as ts.Identifier) & keep); return; }
    for (const [s] of this.flow(source).from) {
      this.edges.push([this.child(s, 'element'), slot, keep]);
      if (b.initializer) this.observedSlots.push(this.child(s, 'element'));
    }
    this.seed(slot, (U | M) & keep);
  }

  /** Arguments a call gives beyond `slotOf`'s: missing ones, rest elements, pushes, callbacks of arrays, Maps and Promises. */
  private placeCall(call: ts.CallExpression | ts.NewExpression): void {
    const c = this.checker;
    const args = call.arguments ?? ts.factory.createNodeArray<ts.Expression>();
    const sig = c.getResolvedSignature(call)?.getDeclaration();
    if (!sig || ts.isJSDocSignature(sig)) this.observeArguments(call, undefined, args);
    else if (declarationFile(sig)) this.observeArguments(call, sig, args);
    if (sig && !ts.isJSDocSignature(sig) && !declarationFile(sig)) {
      const spread = args.findIndex(ts.isSpreadElement);
      valueParameters(sig).forEach((p, k) => {
        if (!p.initializer || p.dotDotDotToken) return;
        if (spread >= 0 && k >= spread) this.spreadDefaults.add(p);
        else if (k < args.length) this.defaultArguments.push([p, args[k]]);
      });
    }
    if (sig && !ts.isJSDocSignature(sig) && !declarationFile(sig) && !args.some(ts.isSpreadElement)) {
      valueParameters(sig).forEach((p, k) => {
        if (p.dotDotDotToken) { for (const a of args.slice(k)) this.place(a, this.child(this.slotFor(p), 'element')); }
        else if (k >= args.length) this.seed(this.slotFor(p), U | M);
      });
    }
    if (ts.isNewExpression(call)) { this.placeConstructed(call, args); return; }
    if (!ts.isPropertyAccessExpression(call.expression)) return;
    const name = call.expression.name.text, recv = call.expression.expression;
    // These calls' results share or copy their source's elements when their flow is computed, which must be in the build.
    if (name === 'values' || name === 'keys' || name === 'from' || name === 'concat') this.flow(call);
    const invoked = this.invokedThrough(call);
    if (invoked && name === 'call') valueParameters(invoked).forEach((p, k) => {
      if (p.dotDotDotToken) { for (const a of args.slice(k + 1)) this.place(a, this.child(this.slotFor(p), 'element')); }
      else if (args[k + 1]) this.place(args[k + 1], this.slotFor(p));
      else this.seed(this.slotFor(p), U | M);
    });
    if (invoked && name === 'apply') {
      if (args[1]) for (const p of valueParameters(invoked)) this.placeElements(args[1], p.dotDotDotToken ? this.child(this.slotFor(p), 'element') : this.slotFor(p), null);
      const list = args[1] && ts.skipOuterExpressions(args[1]);
      const given = list && ts.isArrayLiteralExpression(list) && !list.elements.some(ts.isSpreadElement) ? list.elements.length : 0;
      valueParameters(invoked).forEach((p, k) => { if (!p.dotDotDotToken && k >= given) this.seed(this.slotFor(p), U | M); });
    }
    const t = c.getNonNullableType(c.getTypeAtLocation(recv));
    const kind = c.isArrayType(t) || c.isTupleType(t) ? 'Array' : t.getSymbol()?.name;
    const recvSlots = () => this.flow(recv).from.map(([s]) => s);
    const callback = (k: number) => (args[k] ? this.functionDeclarationOf(args[k]) : null);
    const giveParam = (fn: ts.SignatureDeclaration | null, k: number, from: Slot[], states = 0) => {
      const p = fn && valueParameters(fn)[k];
      if (!p) return;
      // The callback's parameter is typed by the elements it is given: one representation with them.
      for (const s of from) { this.edges.push([s, this.slotFor(p), ~0]); this.copies.push([s, this.slotFor(p)]); }
      if (states) this.seed(this.slotFor(p), states);
    };
    if (kind === 'Array') {
      if (name === 'push' || name === 'unshift') for (const s of recvSlots()) for (const a of args) this.place(a, this.child(s, 'element'));
      if (name === 'splice') for (const s of recvSlots()) for (const a of args.slice(2)) this.place(a, this.child(s, 'element'));
      if (name === 'concat') for (const a of args) {
        const into = this.child(this.slotFor(call), 'element'), at = c.getNonNullableType(c.getTypeAtLocation(a));
        if (c.isArrayType(at) || c.isTupleType(at)) this.placeElements(a, into, 'element', true);
        else this.place(a, into);
      }
      const elements = recvSlots().map((s) => this.child(s, 'element'));
      // Strict equality and SameValueZero tell a null element from an undefined one.
      if ((name === 'includes' || name === 'indexOf' || name === 'lastIndexOf') && args[0] && this.mayBeEmpty(args[0])) this.observedSlots.push(...elements);
      if (ELEMENT_CALLBACKS.has(name)) giveParam(callback(0), 0, elements);
      if (name === 'sort' || name === 'toSorted') { giveParam(callback(0), 0, elements); giveParam(callback(0), 1, elements); }
      if (name === 'reduce' || name === 'reduceRight') {
        giveParam(callback(0), 1, elements);
        const fn = callback(0), acc = fn && valueParameters(fn)[0];
        if (acc) { if (args[1]) this.place(args[1], this.slotFor(acc)); else giveParam(fn, 0, elements); const r = this.resultOf(fn!); if (r) this.edges.push([r, this.slotFor(acc), ~0]); }
      }
      return;
    }
    if (kind === 'Set' && name === 'add') for (const s of recvSlots()) this.place(args[0], this.child(s, 'element'));
    if (kind === 'Set' && name === 'forEach') giveParam(callback(0), 0, recvSlots().map((s) => this.child(s, 'element')));
    if (kind === 'Map' && name === 'set' && args[1]) for (const s of recvSlots()) this.place(args[1], this.child(s, 'value'));
    if (kind === 'Map' && name === 'forEach') giveParam(callback(0), 0, recvSlots().map((s) => this.child(s, 'value')));
    if (kind === 'Promise' && (name === 'then' || name === 'finally')) giveParam(callback(0), 0, name === 'then' ? recvSlots().map((s) => this.child(s, 'result')) : []);
    if (t.flags & ts.TypeFlags.StringLike && (name === 'replace' || name === 'replaceAll') && args[0] && regexpMayLeaveGroupUnset(args[0], c)) {
      const fn = callback(1);
      if (fn) valueParameters(fn).forEach((p, k) => { if (k > 0 && !p.dotDotDotToken) this.seed(this.slotFor(p), U); });
    }
  }

  /** What `new Array(…)`, `new Set(values)` and `new Map(entries)` start with. */
  private placeConstructed(e: ts.NewExpression, args: ts.NodeArray<ts.Expression>): void {
    const part = this.partOf(this.checker.getTypeAtLocation(e));
    if (!part || part === 'result' || !args.length) return;
    const own = this.child(this.slotFor(e), part);
    const name = this.checker.getNonNullableType(this.checker.getTypeAtLocation(e)).getSymbol()?.name;
    if (name === 'Map' || name === 'WeakMap') {
      const entries = ts.skipOuterExpressions(args[0]);
      if (ts.isArrayLiteralExpression(entries)) {
        for (const x of entries.elements) {
          const pair = ts.skipOuterExpressions(x);
          if (ts.isArrayLiteralExpression(pair) && pair.elements[1]) this.place(pair.elements[1], own);
          else if (!ts.isArrayLiteralExpression(pair)) this.seed(own, F | U | N);
        }
      } else for (const [s] of this.flow(args[0]).from) this.edges.push([this.child(this.child(s, 'element'), 'element'), own, ~0]);
    } else if (name === 'Set' || name === 'WeakSet') this.placeElements(args[0], own, 'element', true);
    else if (args.length === 1 && this.checker.getTypeAtLocation(args[0]).flags & ts.TypeFlags.NumberLike) this.seed(own, H | U | M);
    else for (const a of args) this.place(a, own);
  }

  /** The program's own function `f.call(thisArg, …)` or `f.apply(thisArg, args)` invokes. */
  private invokedThrough(call: ts.CallExpression): ts.SignatureDeclaration | null {
    if (!ts.isPropertyAccessExpression(call.expression) || !['call', 'apply'].includes(call.expression.name.text)) return null;
    const recv = call.expression.expression, c = this.checker;
    const d = this.functionDeclarationOf(recv) ?? c.getNonNullableType(c.getTypeAtLocation(recv)).getCallSignatures()[0]?.getDeclaration();
    return d && !ts.isJSDocSignature(d) && !declarationFile(d) ? d : null;
  }

  private unionFunctionValue(e: ts.Expression): void {
    if ((ts.isIdentifier(e) || ts.isPropertyAccessExpression(e)) && isCalleeOrName(e)) return;
    const fn = this.functionDeclarationOf(e) ?? this.functionTypeOf(e);
    if (!fn) return;
    this.placeFunction(fn, this.slotTypeOf(e));
  }

  /** The type of the slot a value is placed in; a field of an untyped literal is untyped, which the checker leaves out. */
  private slotTypeOf(e: ts.Expression): ts.Type | undefined {
    const c = this.checker;
    let x: ts.Node = e;
    while (ts.isParenthesizedExpression(x.parent)) x = x.parent;
    const field = (ts.isPropertyAssignment(x.parent) && x.parent.initializer === x) || (ts.isShorthandPropertyAssignment(x.parent) && x.parent.name === x) ? x.parent : null;
    const literal = field && c.getContextualType(field.parent);
    return literal && untyped(literal) ? literal : c.getContextualType(e);
  }

  /**
   * A function value placed where `slot` is declared. The program's own function type shares one form with it; an
   * untyped slot or a declaration file's function type is called where the program can't see (an entry point).
   */
  private placeFunction(fn: ts.SignatureDeclaration, slot: ts.Type | undefined): void {
    if (!slot) return;
    const result = () => { const r = this.resultOf(fn); if (r) this.observedSlots.push(r); };
    if (untyped(slot)) { this.openParameters(fn, { script: true }); result(); return; }
    const sig = this.checker.getNonNullableType(slot).getCallSignatures()[0]?.getDeclaration();
    if (!sig || ts.isJSDocSignature(sig) || sig === fn) return;
    if (!declarationFile(sig)) { this.unionSignature(fn, sig); return; }
    this.openParameters(fn, LIB_FILE.test(sig.getSourceFile().fileName) ? { lib: sig } : { platform: sig });
    if (this.unseenReader(sig)) result();
  }

  /**
   * The parameters of a function whose callers the program can't see (§2.3a): in strict code what their declared types
   * admit, which their slots hold already; in other code `openStates`. JavaScript's built-ins (`lib`) give what their
   * declarations say; a platform's binding may give nil; script (a function reached through an untyped slot) may give
   * fewer arguments, and anything for a primitive (§2.3b M2).
   */
  private openParameters(fn: ts.SignatureDeclaration, caller: { lib?: ts.SignatureDeclaration; platform?: ts.SignatureDeclaration; script?: boolean } = {}): void {
    const lib = caller.lib && valueParameters(caller.lib), platform = caller.platform && valueParameters(caller.platform);
    const rest = lib?.at(-1)?.dotDotDotToken ? lib.at(-1) : undefined;
    valueParameters(fn).forEach((p, k) => {
      let states: number;
      if (lib) {
        const q = k < lib.length && lib[k] !== rest ? lib[k] : rest;
        const given = q === rest && q?.type && ts.isArrayTypeNode(q.type) ? q.type.elementType : q?.type;
        // A built-in's `any` says nothing of the value's type; a parameter that declares its own type is believed.
        states = q ? typeNodeStates(given) & (p.type ? ~F : ~0) | (q.questionToken ? U : 0) : U;
        // A replacer's `...args: any[]` are groups (a string, or undefined where one is unset), the offset, the input and the
        // named groups: never null, which the `any` an untyped parameter takes from them says it may be.
        if (q === rest && stringReplacer(lib)) {
          states &= ~N;
          if (!p.type) { const r = this.find(this.slotFor(p)); r.states &= ~N; r.local &= ~N; }
        }
      } else states = this.strict(p) ? 0 : this.openStates(p);
      const q = platform?.[k];
      if (q && this.nativeNil(q)) states |= N;
      if (caller.script && !p.dotDotDotToken) states |= U | (this.primitive(p) ? F : 0);
      if (states) this.seed(p.dotDotDotToken ? this.child(this.slotFor(p), 'element') : this.slotFor(p), states);
    });
  }

  /**
   * What non-strict code's entry point takes (§2.3b M1): undefined and null over its declared type, and values of
   * another type only where it declares none (`any`, `unknown`, or no type).
   */
  private openStates(d: ts.Declaration): number {
    const t = this.declaredType(d);
    return U | N | (!t || untyped(t) ? F : 0);
  }

  /** A string, number or boolean slot, which script may give a value of another type it then converts. */
  private primitive(d: ts.Declaration): boolean {
    const t = this.declaredType(d);
    if (!t) return false;
    const parts = (t.isUnion() ? t.types : [t]).filter((x) => !(x.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null | ts.TypeFlags.Void)));
    const kinds = new Set(parts.map((x) => (x.flags & ts.TypeFlags.StringLike ? 's' : x.flags & ts.TypeFlags.NumberLike ? 'n' : x.flags & ts.TypeFlags.BooleanLike ? 'b' : 'o')));
    return kinds.size === 1 && !kinds.has('o');
  }

  /** A library's exported functions and public members, and the fields its callers may write: entry points (§2.3a). */
  private openLibrarySurface(): void {
    const c = this.checker;
    const seen = new Set<ts.Symbol>();
    const openMembers = (members: ts.NodeArray<ts.ClassElement | ts.TypeElement>) => {
      for (const m of members) {
        if (!isPublic(m)) continue;
        if (ts.isPropertyDeclaration(m) || ts.isPropertySignature(m)) {
          if (!isReadonly(m) && !(ts.getCombinedModifierFlags(m) & ts.ModifierFlags.Ambient) && !this.strict(m)) this.seed(this.slotFor(m), this.openStates(m));
          this.observedSlots.push(this.slotFor(m));
        } else if (ts.isFunctionLike(m)) { this.openParameters(m); this.readByCallers(m); }
      }
    };
    const open = (sym: ts.Symbol) => {
      if (sym.flags & ts.SymbolFlags.Alias) sym = c.getAliasedSymbol(sym);
      if (seen.has(sym)) return;
      seen.add(sym);
      for (const d of sym.declarations ?? []) {
        if (declarationFile(d)) continue;
        if (ts.isClassLike(d) || ts.isInterfaceDeclaration(d)) openMembers(d.members);
        else if (ts.isTypeAliasDeclaration(d) && ts.isTypeLiteralNode(d.type)) openMembers(d.type.members);
        else if (ts.isFunctionDeclaration(d)) { this.openParameters(d); this.readByCallers(d); }
        else if (ts.isVariableDeclaration(d)) {
          this.observedSlots.push(this.slotFor(d));
          const fn = d.initializer && this.functionDeclarationOf(d.initializer);
          if (fn) { this.openParameters(fn); this.readByCallers(fn); }
          else if (d.initializer && ts.isObjectLiteralExpression(ts.skipOuterExpressions(d.initializer))) {
            for (const p of (ts.skipOuterExpressions(d.initializer) as ts.ObjectLiteralExpression).properties) {
              const f = ts.isMethodDeclaration(p) ? p : ts.isPropertyAssignment(p) ? this.functionDeclarationOf(p.initializer) : null;
              if (f) { this.openParameters(f); this.readByCallers(f); }
            }
          }
        }
        if (ts.isModuleDeclaration(d)) for (const x of c.getExportsOfModule(sym)) open(x);
      }
    };
    for (const f of this.files) {
      const module = !f.isDeclarationFile && c.getSymbolAtLocation(f);
      if (module) for (const x of c.getExportsOfModule(module)) open(x);
    }
  }

  /** An entry point's result, which its callers read. */
  private readByCallers(fn: ts.SignatureDeclaration): void {
    if (ts.isConstructorDeclaration(fn) || ts.isSetAccessorDeclaration(fn)) return;
    const r = this.resultOf(fn);
    if (r) this.observedSlots.push(r);
  }

  /**
   * Override families, implemented interfaces' members and accessor pairs: one form each. A platform class's subclass
   * is called by the platform (an exposed method, a selector): its methods are entry points, except where they override
   * the platform's own, whose declared form they take.
   */
  private unionClass(cls: ts.ClassLikeDeclaration): void {
    const c = this.checker;
    const type = c.getTypeAtLocation(cls.name ?? cls);
    const bases = [...(type.isClassOrInterface() ? c.getBaseTypes(type) : []),
      ...(cls.heritageClauses ?? []).filter((h) => h.token === ts.SyntaxKind.ImplementsKeyword).flatMap((h) => h.types.map((x) => c.getTypeAtLocation(x)))];
    const native = type.isClassOrInterface() && this.extendsNative(type);
    this.classes.push(cls);
    for (const m of cls.members) if ((ts.isMethodDeclaration(m) || ts.isSetAccessorDeclaration(m)) && m.body && !hasStatic(m) && (native || this.frameworkCalled(cls, m))) this.openParameters(m);
    for (const m of cls.members) {
      if (hasStatic(m) || !m.name || !(ts.isIdentifier(m.name) || ts.isPrivateIdentifier(m.name) || ts.isStringLiteral(m.name))) continue;
      const name = m.name.text;
      for (const b of bases) {
        for (const d of b.getProperty(name)?.declarations ?? []) {
          // A declaration file's member is read by its platform or library: a field's value, a method's result.
          const read = declarationFile(d) && this.unseenReader(d);
          if (ts.isFunctionLike(m) && ts.isFunctionLike(d)) {
            this.unionSignature(m as ts.SignatureDeclaration, d as ts.SignatureDeclaration);
            const r = read && this.resultOf(m as ts.SignatureDeclaration);
            if (r) this.observedSlots.push(r);
          } else if (!ts.isFunctionLike(m) && !ts.isFunctionLike(d)) {
            this.share(this.slotFor(m), this.slotFor(d));
            if (read) this.observedSlots.push(this.slotFor(m));
          }
        }
      }
      if (ts.isGetAccessorDeclaration(m)) {
        const set = cls.members.find((x): x is ts.SetAccessorDeclaration => ts.isSetAccessorDeclaration(x) && x.name.getText() === m.name.getText() && hasStatic(x) === hasStatic(m));
        if (set?.parameters[0]) this.share(this.slotFor(m), this.slotFor(set.parameters[0]));
      }
    }
  }

  /** A declaration file of the library being compiled (core's own `index.d.ts` definitions), not a platform's or JavaScript's. */
  private ownDeclaration(d: ts.Declaration): boolean {
    const name = d.getSourceFile().fileName;
    return this.library && !LIB_FILE.test(name) && !/[\\/]node_modules[\\/]/.test(name) && !this.native(d);
  }

  private extendsNative(t: ts.InterfaceType, depth = 0): boolean {
    return depth < 32 && this.checker.getBaseTypes(t).some((b) => {
      const d = b.getSymbol()?.declarations?.[0];
      return (!!d && declarationFile(d) && this.native(d)) || (b.isClassOrInterface() && this.extendsNative(b, depth + 1));
    });
  }

  // ---- what an expression gives

  private flow(e: ts.Expression): Flow {
    let f = this.flows.get(e);
    if (!f) { this.flows.set(e, PRESENT); f = this.compute(e); this.flows.set(e, f); }
    return f;
  }

  private compute(e: ts.Expression): Flow {
    const c = this.checker, K = ts.SyntaxKind;
    if (ts.isParenthesizedExpression(e) || ts.isSatisfiesExpression(e) || ts.isPartiallyEmittedExpression(e)) return this.flow(e.expression);
    if (e.kind === K.NullKeyword) return { states: N, from: [] };
    if (ts.isVoidExpression(e)) return { states: U, from: [] };
    if (ts.isIdentifier(e)) {
      if (e.text === 'undefined') { const d = this.declarationOf(e); if (!d || declarationFile(d)) return { states: U, from: [] }; }
      const d = this.declarationOf(e);
      if (!d) return { states: this.unknownStates(e), from: [] };
      if (ts.isVariableDeclaration(d) || ts.isParameter(d) || ts.isBindingElement(d)) return this.read(this.slotFor(d), e, d);
      if (ts.isFunctionDeclaration(d) || ts.isClassLike(d) || ts.isEnumDeclaration(d) || ts.isModuleDeclaration(d) || ts.isImportClause(d) || ts.isNamespaceImport(d)) return PRESENT;
      return { states: this.unknownStates(e), from: [] };
    }
    if (ts.isPropertyAccessExpression(e) || (ts.isElementAccessExpression(e) && ts.isStringLiteralLike(e.argumentExpression))) return this.member(e);
    if (ts.isElementAccessExpression(e)) return this.element(e);
    if (ts.isCallExpression(e)) return this.call(e);
    if (ts.isAwaitExpression(e)) {
      const inner = this.flow(e.expression);
      if (!inner.from.length) return inner;
      return { states: inner.states, from: inner.from.map(([s]): [Slot, number] => [this.child(s, 'result'), ~0]) };
    }
    if (ts.isConditionalExpression(e)) return merge(this.flow(e.whenTrue), this.flow(e.whenFalse));
    if (ts.isBinaryExpression(e)) {
      const op = e.operatorToken.kind;
      if (op === K.QuestionQuestionToken || op === K.BarBarToken || op === K.QuestionQuestionEqualsToken || op === K.BarBarEqualsToken) return merge(mask(this.flow(e.left), ~(U | M | N | H | A)), this.flow(e.right));
      if (op === K.AmpersandAmpersandToken || op === K.AmpersandAmpersandEqualsToken) return merge(mask(this.flow(e.left), U | M | N | F | A), this.flow(e.right));
      if (op === K.EqualsToken || op === K.CommaToken) return this.flow(e.right);
      return PRESENT;
    }
    if (ts.isNonNullExpression(e)) return mask(this.flow(e.expression), ~(U | M | N | H | A));
    if (ts.isAsExpression(e) || ts.isTypeAssertionExpression(e)) {
      const inner = this.flow(e.expression);
      const from = c.getTypeAtLocation(e.expression), to = c.getTypeAtLocation(e);
      const upcast = !(from.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) && c.isTypeAssignableTo(from, to);
      return upcast || isConstAssertion(e) ? inner : merge(inner, { states: F, from: [] });
    }
    if (ts.isArrayLiteralExpression(e)) {
      if (e.elements.some(ts.isOmittedExpression)) this.seed(this.child(this.slotFor(e), 'element'), H);
      return { states: 0, from: [[this.slotFor(e), ~0]] };
    }
    if (ts.isNewExpression(e) && this.partOf(c.getTypeAtLocation(e))) return { states: 0, from: [[this.slotFor(e), ~0]] };
    if (ts.isNewExpression(e) || ts.isLiteralExpression(e) || ts.isTemplateExpression(e) || ts.isNoSubstitutionTemplateLiteral(e) || ts.isObjectLiteralExpression(e) || ts.isFunctionLike(e) || ts.isClassExpression(e)
      || ts.isPrefixUnaryExpression(e) || ts.isPostfixUnaryExpression(e) || ts.isTypeOfExpression(e) || ts.isDeleteExpression(e) || e.kind === K.ThisKeyword || e.kind === K.SuperKeyword || e.kind === K.TrueKeyword || e.kind === K.FalseKeyword) return PRESENT;
    return { states: this.unknownStates(e), from: [] };
  }

  private member(e: ts.PropertyAccessExpression | ts.ElementAccessExpression): Flow {
    const c = this.checker;
    const recv = e.expression;
    const optional = e.questionDotToken ? U : 0;
    if (c.getTypeAtLocation(recv).flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) return { states: F | U | N, from: [] };
    if (isGroupsRead(recv, c)) return { states: U | this.absent(e) | optional, from: [] };
    const name = ts.isPropertyAccessExpression(e) ? e.name : e.argumentExpression;
    const d = this.declarationOf(name);
    if (d && (ts.isPropertyDeclaration(d) || ts.isPropertySignature(d) || ts.isPropertyAssignment(d) || ts.isShorthandPropertyAssignment(d) || ts.isParameter(d) || ts.isGetAccessorDeclaration(d))) {
      if (declarationFile(d)) return { states: this.libraryStates(e, d) | optional, from: [] };
      const f = this.read(this.slotFor(d), e, d);
      return optional ? merge(f, { states: U, from: [] }) : f;
    }
    if (d && (ts.isMethodDeclaration(d) || ts.isMethodSignature(d) || ts.isEnumMember(d) || ts.isClassLike(d) || ts.isFunctionDeclaration(d))) return { states: optional, from: [] };
    if (d && ts.isSetAccessorDeclaration(d)) return { states: U | optional, from: [] };
    // An index signature's entry: a Record's value, missing for a key never set.
    const value = c.getIndexInfosOfType(c.getNonNullableType(c.getTypeAtLocation(recv))).length > 0;
    if (value) return { states: U | this.absent(e), from: this.flow(recv).from.map(([s]): [Slot, number] => [this.child(s, 'value'), ~0]) };
    return { states: this.unknownStates(e) | optional, from: [] };
  }

  private element(e: ts.ElementAccessExpression): Flow {
    const c = this.checker;
    const t = c.getNonNullableType(c.getTypeAtLocation(e.expression));
    const optional = e.questionDotToken ? U : 0;
    if (t.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) return { states: F | U | N, from: [] };
    if (t.flags & ts.TypeFlags.StringLike) return { states: U | M | this.absent(e) | optional, from: [] };
    if (isMatchArray(t)) return { states: U | this.absent(e) | optional, from: [] };
    const tuple = c.isTupleType(t) && ts.isNumericLiteral(e.argumentExpression);
    const part: Part = c.isArrayType(t) || c.isTupleType(t) ? 'element' : 'value';
    // Past an array's end is a value left out (M); a key never set is not.
    const empty = tuple ? 0 : part === 'element' ? U | M | this.absent(e) : U | this.absent(e);
    return { states: empty | optional, from: this.flow(e.expression).from.map(([s]): [Slot, number] => [this.child(s, part), ~0]) };
  }

  private call(e: ts.CallExpression): Flow {
    const c = this.checker;
    const optional = ts.isOptionalChain(e) && e.questionDotToken ? U : 0;
    if (e.expression.kind === ts.SyntaxKind.SuperKeyword || e.expression.kind === ts.SyntaxKind.ImportKeyword) return PRESENT;
    if (ts.isPropertyAccessExpression(e.expression)) {
      const name = e.expression.name.text, recv = e.expression.expression;
      const t = c.getNonNullableType(c.getTypeAtLocation(recv));
      const kind = c.isArrayType(t) || c.isTupleType(t) ? 'Array' : t.getSymbol()?.name;
      const own = () => this.slotFor(e);
      const recvParts = (p: Part) => this.flow(recv).from.map(([s]) => this.child(s, p));
      if (kind === 'Array' && ONE_ELEMENT.has(name)) return { states: U | M | this.absent(e) | optional, from: recvParts('element').map((s): [Slot, number] => [s, ~0]) };
      if (kind === 'Array' && SAME_ELEMENTS.has(name)) { for (const s of recvParts('element')) this.share(this.child(own(), 'element'), s); return { states: optional, from: [[own(), ~0]] }; }
      if (kind === 'Array' && (name === 'map' || name === 'flatMap')) {
        const fn = e.arguments[0] && this.functionDeclarationOf(e.arguments[0]);
        const r = fn && this.resultOf(fn);
        if (r && name === 'map') this.share(this.child(own(), 'element'), r);
        return { states: optional, from: [[own(), ~0]] };
      }
      if (kind === 'Array' && name === 'reduce') {
        const fn = e.arguments[0] && this.functionDeclarationOf(e.arguments[0]);
        const r = fn && this.resultOf(fn);
        return r ? { states: optional, from: [[r, ~0]] } : { states: this.unknownStates(e) | optional, from: [] };
      }
      if (((kind === 'Map' || kind === 'ReadonlyMap') && name === 'values') || ((kind === 'Set' || kind === 'ReadonlySet') && (name === 'values' || name === 'keys'))) {
        for (const s of recvParts(kind === 'Map' || kind === 'ReadonlyMap' ? 'value' : 'element')) this.share(s, this.child(own(), 'element'));
        return { states: optional, from: [[own(), ~0]] };
      }
      if (ts.isIdentifier(recv) && recv.text === 'Array' && name === 'from' && e.arguments.length === 1 && !ts.isSpreadElement(e.arguments[0]) && this.partOf(c.getTypeAtLocation(e))) {
        const source = c.getNonNullableType(c.getTypeAtLocation(e.arguments[0])).getSymbol()?.name;
        if (source !== 'Map' && source !== 'ReadonlyMap') { this.placeElements(e.arguments[0], this.child(own(), 'element'), 'element', true); return { states: optional, from: [[own(), ~0]] }; }
      }
      if ((kind === 'Map' || kind === 'ReadonlyMap') && name === 'get') return { states: U | this.absent(e) | optional, from: recvParts('value').map((s): [Slot, number] => [s, ~0]) };
      if (kind === 'Promise' && name === 'then') {
        const fn = e.arguments[0] && this.functionDeclarationOf(e.arguments[0]);
        const r = fn && this.resultOf(fn);
        if (r) this.share(this.child(own(), 'result'), r);
        return { states: optional, from: [[own(), ~0]] };
      }
      if (ts.isIdentifier(recv) && recv.text === 'Promise' && name === 'resolve' && e.arguments[0]) { this.place(e.arguments[0], this.child(own(), 'result')); return { states: 0, from: [[own(), ~0]] }; }
    }
    const invoked = this.invokedThrough(e);
    if (invoked) return { states: optional, from: [[this.slotFor(invoked), ~0]] };
    const d = c.getResolvedSignature(e)?.getDeclaration();
    if (!d || ts.isJSDocSignature(d)) return { states: this.unknownStates(e) | optional, from: [] };
    if (declarationFile(d)) return { states: this.libraryStates(e, d) | optional, from: [] };
    if ((d as ts.FunctionLikeDeclaration).asteriskToken || ts.isConstructorDeclaration(d)) return { states: optional, from: [] };
    return { states: optional, from: [[this.slotFor(d), ~0]] };
  }

  /** A read of `slot` at `e`: less what narrowing proves absent there, and a default's value for a missing one. */
  private read(slot: Slot, e: ts.Expression, d: ts.Declaration): Flow {
    const keep = ~this.narrowed(e, d);
    const init = (ts.isParameter(d) || ts.isBindingElement(d)) && !isTemplateDefault(d) && d.initializer;
    if (!init) return { states: 0, from: [[slot, keep]] };
    return merge({ states: 0, from: [[slot, keep & ~(U | M)]] }, mask(this.flow(init), keep));
  }

  /** The states a read at `e` is proved not to hold: by the checker's narrowing in strict code, by its guards in other code. */
  private narrowed(e: ts.Expression, d: ts.Declaration): number {
    if (isWriteTarget(e)) return 0;
    if (this.strict(e)) {
      const declared = typeStates(this.declaredType(d) ?? undefined), here = typeStates(this.checker.getTypeAtLocation(e));
      return dropsAbsent(withMissing(declared & ~here & (U | N)));
    }
    return dropsAbsent(withMissing(guarded(e)));
  }

  /**
   * A library's value: its declared type node, in strict code the checker's type there, and a platform binding's nil.
   * Read by a non-strict app, a kit's or plugin's typed object (not JavaScript's or a platform's) may be empty: its
   * typings, written without strictNullChecks, say nothing of null, and its binding holds nil for one.
   */
  private libraryStates(e: ts.Expression, d: ts.Declaration): number {
    let s = typeNodeStates((d as { type?: ts.TypeNode }).type) | (this.nativeNil(d) ? N : 0);
    if ((d as { questionToken?: ts.Node }).questionToken && !ts.isMethodDeclaration(d) && !ts.isMethodSignature(d)) s |= U;
    if (this.strict(e)) s |= typeStates(this.checker.getTypeAtLocation(e));
    else if (!this.library && !LIB_FILE.test(d.getSourceFile().fileName) && !this.native(d) && objectValue(this.checker.getTypeAtLocation(e))) s |= U | N;
    return s;
  }

  /** `A` where the program's own code reads or returns a missing value. */
  private absent(n: ts.Node): number {
    return this.ownCode(n) ? A : 0;
  }

  /** Whether a node's file is checked with strictNullChecks; a node a transform made has none. */
  private strict(n: ts.Node): boolean {
    const file = sourceOf(n);
    return !!file && this.strictFile(file);
  }

  private unknownStates(e: ts.Node): number {
    const t = this.checker.getTypeAtLocation(e);
    if (t.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) return F | U | N;
    return this.strict(e) ? typeStates(t) : 0;
  }
}


/** A node's source file: none for a node a transform made. */
function sourceOf(n: ts.Node): ts.SourceFile | undefined {
  return n.getSourceFile() as ts.SourceFile | undefined;
}

/** A type parameter, alone or with null and undefined. */
/** A signature's parameters as callers give them: a declared `this` is the receiver, not an argument. */
function valueParameters(sig: ts.SignatureDeclaration): readonly ts.ParameterDeclaration[] {
  const first = sig.parameters[0];
  return first && ts.isIdentifier(first.name) && first.name.text === 'this' ? sig.parameters.slice(1) : sig.parameters;
}

export function isGeneric(t: ts.Type | null | undefined): boolean {
  if (!t) return false;
  const parts = (t.isUnion() ? t.types : [t]).filter((x) => !(x.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null | ts.TypeFlags.Void)));
  return parts.length > 0 && parts.every((x) => !!(x.flags & ts.TypeFlags.TypeParameter) && !(x as { isThisType?: boolean }).isThisType);
}

/** The interfaces and object literal types a value of type `t` is held as: types whose keys are what a value has. */
function shapes(checker: ts.TypeChecker, t: ts.Type): ts.Type[] {
  const x = checker.getNonNullableType(t);
  return (x.isUnion() ? x.types : [x]).filter((m) => {
    if (!(m.flags & ts.TypeFlags.Object) || m.isClass() || m.getCallSignatures().length) return false;
    const sym = m.aliasSymbol ?? m.getSymbol();
    return !!sym && !!(sym.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeLiteral)) && !(sym.flags & ts.SymbolFlags.Class);
  });
}

/** A value of an object type: not a string, number, boolean, bigint, symbol or enum, which a binding holds as a value. */
function objectValue(t: ts.Type): boolean {
  const parts = (t.isUnion() ? t.types : [t]).filter((x) => !(x.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null | ts.TypeFlags.Void)));
  return parts.length > 0 && parts.every((x) => !!(x.flags & (ts.TypeFlags.Object | ts.TypeFlags.NonPrimitive | ts.TypeFlags.TypeParameter)) && !x.getCallSignatures().length);
}

/** The replacer function type `String.prototype.replace` and `replaceAll` take. */
function stringReplacer(sig: ts.SignatureDeclaration): boolean {
  const p = sig.parent, m = p?.parent;
  return !!m && ts.isParameter(p) && ts.isMethodSignature(m) && ts.isIdentifier(m.name) && ['replace', 'replaceAll'].includes(m.name.text) && ts.isInterfaceDeclaration(m.parent) && m.parent.name.text === 'String';
}

function untyped(t: ts.Type): boolean {
  return !!(t.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown));
}

/** A parameter of a declared function or member, or a writable field: what a library's callers give. */
function writtenByCallers(n: ts.Node): boolean {
  if (ts.isParameter(n)) return !ts.isFunctionTypeNode(n.parent) && !ts.isConstructorTypeNode(n.parent);
  return (ts.isPropertySignature(n) || ts.isPropertyDeclaration(n)) && isPublic(n) && !isReadonly(n);
}

/** A member a library's callers can reach: neither private nor protected. */
function isPublic(m: ts.Node): boolean {
  const name = (m as ts.NamedDeclaration).name;
  return !(name && ts.isPrivateIdentifier(name)) && !(ts.getCombinedModifierFlags(m as ts.Declaration) & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected));
}

function isReadonly(m: ts.Node): boolean {
  return !!(ts.getCombinedModifierFlags(m as ts.Declaration) & ts.ModifierFlags.Readonly);
}

function declarationFile(n: ts.Node): boolean {
  return !!sourceOf(n)?.isDeclarationFile;
}

function merge(a: Flow, b: Flow): Flow {
  return { states: a.states | b.states, from: [...a.from, ...b.from] };
}

/** States with M wherever they have U: a mask or an admitted set that names undefined names a missing one too. */
function withMissing(s: number): number {
  return s & U ? s | M : s;
}

/** An admitted set with A wherever it admits U or N: an absent value is one of those. */
function withAbsent(s: number): number {
  return withMissing(s) | (s & (U | N) ? A : 0);
}

/** A set of states to drop with A where it drops both U and N: nothing empty is left to be absent. */
function dropsAbsent(s: number): number {
  return (s & (U | N)) === (U | N) ? s | A : s;
}

function mask(f: Flow, keep: number): Flow {
  return { states: f.states & keep, from: f.from.map(([s, k]): [Slot, number] => [s, k & keep]) };
}

function typeStates(t: ts.Type | undefined): number {
  if (!t) return 0;
  let s = 0;
  for (const x of t.isUnion() ? t.types : [t]) {
    if (x.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) s |= F | U | N;
    else if (x.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void)) s |= U;
    else if (x.flags & ts.TypeFlags.Null) s |= N;
  }
  return s;
}

/** What a type as written says, which the checker drops in code checked without strictNullChecks. */
function typeNodeStates(n: ts.TypeNode | undefined): number {
  if (!n) return 0;
  if (ts.isParenthesizedTypeNode(n)) return typeNodeStates(n.type);
  if (ts.isUnionTypeNode(n)) return n.types.reduce((s, x) => s | typeNodeStates(x), 0);
  if (n.kind === ts.SyntaxKind.AnyKeyword || n.kind === ts.SyntaxKind.UnknownKeyword) return F | U | N;
  if (n.kind === ts.SyntaxKind.UndefinedKeyword || n.kind === ts.SyntaxKind.VoidKeyword) return U;
  if (ts.isLiteralTypeNode(n) && n.literal.kind === ts.SyntaxKind.NullKeyword) return N;
  return 0;
}

function elementType(checker: ts.TypeChecker, t: ts.Type, part: Part): ts.Type | null {
  const x = checker.getNonNullableType(t);
  if (part === 'result') return checker.getAwaitedType(x) ?? null;
  if (checker.isArrayType(x) || checker.isTupleType(x)) return checker.getIndexTypeOfType(x, ts.IndexKind.Number) ?? checker.getTypeArguments(x as ts.TypeReference)[0] ?? null;
  const args = (x as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference ? checker.getTypeArguments(x as ts.TypeReference) : [];
  const name = x.getSymbol()?.name;
  if (name === 'Set' || name === 'ReadonlySet') return args[0] ?? null;
  if (name === 'Map' || name === 'ReadonlyMap') return args[1] ?? null;
  return checker.getIndexInfosOfType(x)[0]?.type ?? null;
}

/** A template method's loop parameter, whose default only types it: the template's glue always gives it. */
function isTemplateDefault(d: ts.Declaration): boolean {
  return ts.isParameter(d) && !!d.initializer && isTemplateMethod(d.parent);
}

function isAsync(fn: ts.SignatureDeclaration): boolean {
  return !!ts.getModifiers(fn as ts.HasModifiers)?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword);
}

function hasStatic(m: ts.Node): boolean {
  return ts.canHaveModifiers(m) && !!ts.getModifiers(m)?.some((x) => x.kind === ts.SyntaxKind.StaticKeyword);
}

function isConstAssertion(e: ts.AsExpression | ts.TypeAssertion): boolean {
  return ts.isTypeReferenceNode(e.type) && ts.isIdentifier(e.type.typeName) && e.type.typeName.text === 'const';
}

function isCalleeOrName(e: ts.Expression): boolean {
  let x: ts.Node = e;
  while (ts.isParenthesizedExpression(x.parent)) x = x.parent;
  const p = x.parent;
  return ((ts.isCallExpression(p) || ts.isNewExpression(p)) && p.expression === x) || (ts.isPropertyAccessExpression(p) && p.expression === x)
    || ((ts.isFunctionDeclaration(p) || ts.isMethodDeclaration(p) || ts.isVariableDeclaration(p)) && p.name === x);
}

function isWriteTarget(e: ts.Expression): boolean {
  let x: ts.Node = e;
  while (ts.isParenthesizedExpression(x.parent)) x = x.parent;
  const p = x.parent;
  return ts.isBinaryExpression(p) && p.left === x && p.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && p.operatorToken.kind <= ts.SyntaxKind.LastAssignment;
}

function isMatchArray(t: ts.Type): boolean {
  const name = t.getSymbol()?.name ?? t.aliasSymbol?.name;
  return name === 'RegExpMatchArray' || name === 'RegExpExecArray';
}

/** `match.groups` of a regexp's result: a group that took no part in the match reads undefined. */
function isGroupsRead(recv: ts.Expression, checker: ts.TypeChecker): boolean {
  const x = ts.skipOuterExpressions(recv);
  return ts.isPropertyAccessExpression(x) && x.name.text === 'groups' && isMatchArray(checker.getNonNullableType(checker.getTypeAtLocation(x.expression)));
}

const assigned = new WeakMap<ts.ClassLikeDeclaration, Set<ts.PropertyDeclaration>>();
function definitelyAssigned(cls: ts.ClassLikeDeclaration): Set<ts.PropertyDeclaration> {
  let s = assigned.get(cls);
  if (!s) assigned.set(cls, s = definitelyAssignedFields(cls));
  return s;
}

/**
 * Code checked without strictNullChecks, where the checker narrows nothing: the states a guard around a read rules out
 * (`if (x)`, `x && x.y`, `x != null ? … : …`, an earlier `if (!x) return`).
 */
function guarded(e: ts.Expression): number {
  if (!ts.isIdentifier(e) && !ts.isPropertyAccessExpression(e)) return 0;
  const text = e.getText();
  let out = 0;
  for (let x: ts.Node = e; x.parent && !ts.isFunctionLike(x) && !ts.isSourceFile(x); x = x.parent) {
    const p = x.parent;
    if (ts.isIfStatement(p)) out |= p.thenStatement === x ? proves(p.expression, text, true) : p.elseStatement === x ? proves(p.expression, text, false) : 0;
    else if (ts.isConditionalExpression(p)) out |= p.whenTrue === x ? proves(p.condition, text, true) : p.whenFalse === x ? proves(p.condition, text, false) : 0;
    else if (ts.isBinaryExpression(p) && p.right === x) out |= p.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ? proves(p.left, text, true) : p.operatorToken.kind === ts.SyntaxKind.BarBarToken ? proves(p.left, text, false) : 0;
    else if (ts.isBlock(p) || ts.isSourceFile(p) || ts.isCaseClause(p)) {
      for (const st of p.statements) {
        if (st === x) break;
        if (ts.isIfStatement(st) && !st.elseStatement && exits(st.thenStatement)) out |= proves(st.expression, text, false);
      }
    }
    if ((out & (U | N)) === (U | N)) break;
  }
  return out;
}

function exits(st: ts.Statement): boolean {
  if (ts.isBlock(st)) return st.statements.length > 0 && exits(st.statements[st.statements.length - 1]);
  return ts.isReturnStatement(st) || ts.isThrowStatement(st) || ts.isContinueStatement(st) || ts.isBreakStatement(st);
}

/** The states of `text` that `cond` being `truth` rules out. */
function proves(cond: ts.Expression, text: string, truth: boolean): number {
  const c = ts.skipOuterExpressions(cond);
  const K = ts.SyntaxKind;
  if (ts.isPrefixUnaryExpression(c) && c.operator === K.ExclamationToken) return proves(c.operand, text, !truth);
  if (ts.isBinaryExpression(c)) {
    const op = c.operatorToken.kind;
    if (op === K.AmpersandAmpersandToken) return truth ? proves(c.left, text, true) | proves(c.right, text, true) : 0;
    if (op === K.BarBarToken) return truth ? 0 : proves(c.left, text, false) | proves(c.right, text, false);
    const [mine, other] = ts.skipOuterExpressions(c.left).getText() === text ? [c.left, c.right] : ts.skipOuterExpressions(c.right).getText() === text ? [c.right, c.left] : [null, null];
    if (mine && other) {
      const o = ts.skipOuterExpressions(other);
      const isNull = o.kind === K.NullKeyword, isUndefined = ts.isIdentifier(o) && o.text === 'undefined';
      const negated = op === K.ExclamationEqualsToken || op === K.ExclamationEqualsEqualsToken;
      const loose = op === K.ExclamationEqualsToken || op === K.EqualsEqualsToken;
      if ((isNull || isUndefined) && (negated ? truth : !truth)) return loose ? U | N : isNull ? N : U;
      if (!isNull && !isUndefined && !negated && truth && (op === K.EqualsEqualsEqualsToken) && (ts.isLiteralExpression(o) || o.kind === K.TrueKeyword || o.kind === K.FalseKeyword)) return U | N;
    }
    if (op === K.InstanceOfKeyword && truth && ts.skipOuterExpressions(c.left).getText() === text) return U | N;
    if (ts.isTypeOfExpression(ts.skipOuterExpressions(c.left)) && ts.skipOuterExpressions((ts.skipOuterExpressions(c.left) as ts.TypeOfExpression).expression).getText() === text
      && ts.isStringLiteral(c.right) && c.right.text !== 'undefined' && c.right.text !== 'object' && (op === K.EqualsEqualsEqualsToken || op === K.EqualsEqualsToken) && truth) return U | N;
    return 0;
  }
  if (truth && (ts.isIdentifier(c) || ts.isPropertyAccessExpression(c)) && c.getText() === text) return U | N;
  // `x.y` true proves `x` present.
  if (truth && ts.isPropertyAccessExpression(c) && c.getText().startsWith(text + '.')) return U | N;
  return 0;
}

