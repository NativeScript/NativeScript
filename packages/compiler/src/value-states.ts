import { dirname, join } from 'node:path';
import ts from 'typescript';
import { admitsUndefined, alwaysEnds, givenBy, heldDowncasts, implementedInterfaceDeclarations, isTemplateMethod, LooseSlots, nothingGiven, nullishSlots, nullSetFields, originOf, ownSlot, reassigned, scriptCalledFunction, slotOf, slotType, type NullishSlots, type TrustScope } from './lang.ts';
import { type Form, Forms, isGeneric, ONE_ELEMENT, representation } from './forms.ts';
import { isAsync, isStatic } from './throws.ts';
import { shadowForms } from './forms-shadow.ts';
import { containerKind, elementStoreOf, storeOf, type ElementStore, type Store } from './placement.ts';

const COMPILER = dirname(import.meta.dirname);
/** Sources the compiler ships to be compiled with an app: plugin bindings and ports of libraries. */
const SHIPPED = ['kit-android/Bindings', 'kit-apple/Bindings', 'runtime'].map((d) => join(COMPILER, d) + '/');

// The null/undefined/missing deciders both translators ask: which empty states a value or slot may hold where its native
// form keeps only one. The rules are shared; a backend supplies its mode, how it spells types and how it emits a keyed
// read, and names in `rules` the few rules that still differ between the two.

/** What the shared deciders read from a translator. Members are read lazily: a translator sets its mode after construction. */
export interface StateBackend {
  readonly name: 'swift' | 'kotlin';
  readonly checker: ts.TypeChecker;
  readonly sourceFiles: readonly ts.SourceFile[];
  readonly pluginFiles: ReadonlySet<string>;
  /** Where plugins' sources are: a file under one is a plugin's however it is compiled (its Angular components as the app's). */
  readonly pluginRoots: readonly string[];
  readonly trust: TrustScope;
  readonly lenient: boolean;
  readonly lenientApp: boolean;
  readonly library: unknown;
  /** The platform binding (Swift's SDK tables, Kotlin's class files): whether a declaration's binding holds nil. */
  readonly native: { holdsNil?(d: ts.Declaration): boolean } | null;
  /** The native names of a boolean and of no value. */
  readonly spelling: { readonly boolean: string; readonly void: string };
  readonly rules: StateRules;
  typeOf(n: ts.Node): string;
  type(t: ts.Type, at: ts.Node): string;
  returnTypeOf(d: ts.SignatureDeclaration): string;
  resolve(n: ts.Node): ts.Symbol | undefined;
  programBase(cls: ts.ClassLikeDeclaration): ts.ClassLikeDeclaration | undefined;
  error(n: ts.Node, what: string): Error;
  /** A native type whose empty value stands for a missing one. */
  optional(t: string): boolean;
  functionType(t: string): boolean;
  /** `f`'s answer, keeping nothing that spelling types on the way would emit (Swift's shapes). */
  unemitted<T>(f: () => T): T;
  /** A method whose native signature is its own: no base, interface or override shares it. */
  ownSignature(fn: ts.Node): fn is ts.MethodDeclaration;
  /** An object type a loose slot holds as an optional where it may be missing. */
  looseObjectType(t: string): boolean;
  /** A sync function's result as the backend holds it carries a null its body gives where it gives nothing. */
  resultHoldsNull(d: ts.FunctionDeclaration | ts.MethodDeclaration): boolean;
  /** A plugin parameter's native type that must take nil though its declared type has no empty value. */
  nullableParameter(t: string): boolean;
  /** `read` read untyped, from `code`, the read's own untyped translation; null where that is no such read. */
  nulledEntry(read: NulledRead, code: () => string): string | null;
  /** The keyed field a member read whose type holds null and undefined is noted under (`jsNulls`), or null. */
  optionalShapeField(e: ts.PropertyAccessExpression): string | null;
  /** A string, number or boolean read by name or call that the backend holds optional though its type says present. */
  heldOptional(x: ts.Expression): boolean;
  /** A variable the backend declares optional though its type says present, known before it is translated. */
  declaredOptional(x: ts.Identifier): boolean;
}

/** The rules the two backends still answer differently. Each names the backend that has it. */
export interface StateRules {
  /**
   * Kotlin: a non-strict app's sync call is a null result only for the app's own (not a plugin's) function, and only in a
   * non-strict app. Swift asks it of any call.
   */
  readonly appNullResults: boolean;
  /** Swift: an optional parameter takes undefined as it is, and a declaration file's slot never does. */
  readonly optionalParametersTakeUndefined: boolean;
  /** Swift: `looseDeclaration` is asked of reads and declarations both, and answers for the declaration they name. */
  readonly looseReads: boolean;
  /**
   * Kotlin: a parameter's checks throw for a null its type leaves out, so `mayBeNull` counts every way an empty value
   * reaches one, with these analyses of the backend's; and a string an unset regexp group may leave undefined is loose.
   */
  readonly checkedParameters?: { truthTested(name: ts.Identifier): boolean; unsetElement(d: ts.Node): boolean };
}

/** Whether a type admits null and undefined both, and nothing untyped. */
function bothEmpty(t: ts.Type): boolean {
  const parts = t.isUnion() ? t.types : [t];
  return parts.some((x) => x.flags & ts.TypeFlags.Null) && parts.some((x) => x.flags & ts.TypeFlags.Undefined) && !parts.some((x) => x.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown));
}

/** Whether a type admits null but not undefined. */
export function onlyNull(t: ts.Type): boolean {
  const parts = t.isUnion() ? t.types : [t];
  return parts.some((x) => x.flags & ts.TypeFlags.Null) && !parts.some((x) => x.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void | ts.TypeFlags.Any | ts.TypeFlags.Unknown));
}

/** `ValueStates.nulledRead`'s read: an array's element, a Map's value (`m.get(k)`), or a field by the key it is noted under. */
export type NulledRead =
  | { kind: 'element'; read: ts.ElementAccessExpression }
  | { kind: 'entry'; read: ts.CallExpression }
  | { kind: 'field'; read: ts.PropertyAccessExpression; name: string };

export class ValueStates {
  /** A non-strict app's variables given only a null result (`nullResult`) or a value: their empty value is null. The backends note them as they declare them. */
  readonly nullVars = new Set<ts.Symbol>();
  private nullishSlotSet?: NullishSlots;
  private nullishHeldSet = new Set<ts.Declaration>();
  private nullishElementSet = new Set<ts.Declaration>();
  private formSet?: Forms;
  private downcastSet?: ReturnType<typeof heldDowncasts>;
  private looseSlotSet: LooseSlots | null = null;
  private implementedInterfaceSet: Set<ts.Declaration> | null = null;
  private scriptCalledFunctions?: (sig: ts.Node) => boolean;
  private undefinedGiven = new Map<ts.ParameterDeclaration, boolean>();
  private lenientAsyncs = new Map<ts.Node, boolean>();
  private nullFieldSets = new Map<ts.ClassLikeDeclaration, Set<string>>();

  readonly backend: StateBackend;

  constructor(backend: StateBackend) {
    this.backend = backend;
    if (process.env.NS_FORMS_SHADOW) shadowForms(this);
  }

  private get checker(): ts.TypeChecker {
    return this.backend.checker;
  }

  private plugin(n: ts.Node): boolean {
    return this.backend.pluginFiles.has(n.getSourceFile().fileName);
  }

  /** The app's own code, strict or a non-strict app's, where §2.3b M6's held and checked foreign values apply. */
  appCode(n: ts.Node): boolean {
    const b = this.backend;
    return !b.library && !this.packaged(n) && (b.trust.strictFile(n.getSourceFile()) || b.lenientApp);
  }

  /**
   * Code of another package than the app: a plugin's, an installed package's, or a binding or library port the compiler
   * ships (its plugin bindings and `runtime/`), decided by where its source is.
   */
  packaged(n: ts.Node): boolean {
    const f = n.getSourceFile().fileName;
    // `__angular.release.ts` is the compiler's `runtime/angular.ts`, placed in the app's directory.
    return this.plugin(n) || /[\\/]node_modules[\\/]/.test(f) || /[\\/]__angular\.release\.ts$/.test(f) || SHIPPED.some((d) => f.startsWith(d)) || this.backend.pluginRoots.some((r) => f.startsWith(r.endsWith('/') ? r : r + '/'));
  }

  private primitive(t: string): boolean {
    return t === 'String' || t === 'Double' || t === this.backend.spelling.boolean;
  }

  /**
   * Strict app code's variables, parameters and results that may hold null and undefined both, held untyped; and
   * interface fields that may. Library and non-strict code have none: their checker types say nothing of null.
   */
  nullish(): NullishSlots {
    const b = this.backend;
    if (this.nullishSlotSet) return this.nullishSlotSet;
    const found: NullishSlots = b.lenient || b.library ? { held: new Set(), fields: new Set(), refused: [], functions: new Map() } : nullishSlots(b.checker, b.sourceFiles, (f) => b.pluginFiles.has(f.fileName), (d) => this.formNullish(d));
    // An element, callback parameter or loop variable today's analysis can't hold: one nil, read as undefined, where
    // nothing tells null from undefined in it; `JSNullish<T>` where something does.
    found.refused = found.refused.filter(([, , cover]) => {
      if (!cover) return true;
      const form = cover.kind === 'element' ? this.forms().formOfSlot(cover.slot).element : this.forms().formOfSlot(cover.slot);
      const shown = form && representation(form);
      if (shown === 'nullish') (cover.kind === 'element' ? this.nullishElementSet : this.nullishHeldSet).add(cover.slot);
      return !shown || !['present', 'undefined', 'null', 'nullish'].includes(shown);
    });
    // A function slot: `JSNullish` where null and undefined are told apart, else one nil read as undefined. One that may
    // hold another value too is refused where its own code compares it.
    for (const [d, what] of found.functions) {
      const shown = representation(this.forms().formOfSlot(d));
      if (shown === 'nullish') this.nullishHeldSet.add(d);
      else if (shown === 'foreign' && what) found.refused.push([d, what]);
    }
    // A variable, parameter or result held untyped for its null and undefined: `JSNullish<T>` where something tells them
    // apart, as every member of its group (a function type and its values, an override family) reads one form.
    for (const d of found.held) if (representation(this.forms().formOfSlot(d)) === 'nullish') { found.held.delete(d); this.nullishHeldSet.add(d); }
    // A foreign value whose type the program tests (§2.3b M6) is held untyped, by every member of its group or by none.
    if (!b.lenient && !b.library) {
      for (const group of this.forms().typeTestedForeign()) {
        if (group.every((d) => this.holdsForeign(d))) for (const d of group) if (!this.untypedDeclaration(d)) { found.held.add(d); this.nullishHeldSet.delete(d); }
      }
    }
    this.nullishSlotSet = found;
    if (this.nullishElementSet.size) {
      const text = (e: ts.Expression) => this.checker.typeToString(this.checker.getTypeAtLocation(e));
      // Script writes into what it holds untyped as it likes, which elements held as `JSNullish<T>` can't take.
      for (const e of this.forms().untypedPlacements()) {
        if (this.nullishElements(e)) found.refused.push([e, `an array, Map or Set whose elements may be null or undefined both (\`${text(e)}\`), given where its type isn't known (declare the slot it goes to with that type)`]);
      }
      // A Map's entries spread into a literal (`[...map.entries()]`): pairs, whose value no slot of its own holds.
      const scan = (n: ts.Node): void => {
        if (ts.isSpreadElement(n) && ts.isArrayLiteralExpression(n.parent)) {
          const x = ts.skipOuterExpressions(n.expression);
          const map = ts.isCallExpression(x) && ts.isPropertyAccessExpression(x.expression) && x.expression.name.text === 'entries' && !x.arguments.length ? x.expression.expression : x;
          if (this.checker.getNonNullableType(this.checker.getTypeAtLocation(map)).getSymbol()?.name === 'Map' && this.nullishElements(map)) {
            found.refused.push([n.parent, `an array, Map or Set element (or other type argument) that may be null or undefined both (a value of \`${text(map)}\` in \`${text(n.parent)}\`)`]);
          }
        }
        ts.forEachChild(n, scan);
      };
      for (const f of this.backend.sourceFiles) if (!f.isDeclarationFile) scan(f);
    }
    return found;
  }

  /**
   * An app slot whose type admits one empty state but whose form holds both, observed apart (§2.3b M1'), where the other
   * comes from the program's own missing value (`Form.absent`), as `widenedField` asks of fields: what a package's code
   * brings into a slot its type says can't hold it keeps the declared form.
   */
  private formNullish(d: ts.Declaration): boolean {
    if (!this.appCode(d)) return false;
    const form = this.forms().formOfSlot(d);
    return form.absent && representation(form) === 'nullish';
  }

  /** The program's value forms (review/DESIGN-VALUE-MODEL.md §2), built when first asked. */
  forms(): Forms {
    const b = this.backend;
    return this.formSet ??= new Forms(b.sourceFiles, b.checker, (f) => b.trust.strictFile(f), { library: !!b.library, native: (d) => b.trust.nativeDeclaration(d), nativeNil: (d) => !!b.native?.holdsNil?.(d), ownCode: (n) => !this.packaged(n) });
  }

  /**
   * A parameter, variable or function result that may hold null and undefined both, which the program tells apart: held
   * as `JSNullish<T>`, read as `T?` except where null and undefined are told apart or kept.
   */
  nullishHeld(d: ts.Node): d is ts.ParameterDeclaration | ts.VariableDeclaration | ts.SignatureDeclaration {
    return this.nullish() && this.nullishHeldSet.has(d as ts.Declaration);
  }

  /**
   * An array, Set or Map (a declaration, its name, or an expression giving one) whose elements or values may be null or
   * undefined both, which the program tells apart: its elements are held as `JSNullish<T>`.
   */
  nullishElements(n: ts.Node): boolean {
    if (!this.nullish() || !this.nullishElementSet.size) return false;
    const d = ts.isIdentifier(n) && n.parent && (ts.isVariableDeclaration(n.parent) || ts.isParameter(n.parent) || ts.isPropertyDeclaration(n.parent) || ts.isPropertySignature(n.parent)) && n.parent.name === n ? n.parent : n;
    if (!ts.isExpression(d) && !ts.isVariableDeclaration(d) && !ts.isParameter(d) && !ts.isPropertyDeclaration(d) && !ts.isPropertySignature(d) && !(ts.isFunctionLike(d) && !isAsync(d))) return false;
    const type = ts.isFunctionLike(d) ? this.checker.getSignatureFromDeclaration(d as ts.SignatureDeclaration)?.getReturnType() : this.checker.getTypeAtLocation(ts.isExpression(d) ? d : (d as ts.NamedDeclaration).name ?? d);
    const element = type && this.forms().elementOf(type);
    // A literal or a new Set is spelled as the slot it goes to, which a conditional or a call between hides from its own form.
    const to = (ts.isArrayLiteralExpression(d) || ts.isNewExpression(d)) && this.placement(d);
    if (to && this.nullishElements(to)) return true;
    if (!element || !bothEmpty(element)) return false;
    const form = ts.isExpression(d) ? this.forms().formOf(d) : this.forms().formOfSlot(d);
    return !!form.element && representation(form.element) === 'nullish';
  }

  /** The slot an expression's value goes to, through parentheses, conditionals and defaults: a declaration, or a new Set's expression. */
  private placement(e: ts.Expression): ts.Node | null {
    let x: ts.Node = e;
    for (let p = x.parent; ; x = p, p = p.parent) {
      if (ts.isParenthesizedExpression(p) || ts.isAsExpression(p) || ts.isSatisfiesExpression(p) || (ts.isConditionalExpression(p) && p.condition !== x)) continue;
      if (ts.isBinaryExpression(p) && p.right === x && [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.AmpersandAmpersandToken].includes(p.operatorToken.kind)) continue;
      break;
    }
    const p = x.parent;
    if ((ts.isVariableDeclaration(p) || ts.isPropertyDeclaration(p)) && p.initializer === x) return p;
    if (ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.EqualsToken && p.right === x) return p.left;
    if (ts.isReturnStatement(p)) return ts.findAncestor(p, ts.isFunctionLike) ?? null;
    if (ts.isArrowFunction(p) && p.body === x) return p;
    if ((ts.isCallExpression(p) || ts.isNewExpression(p)) && p.expression !== x) {
      const k = p.arguments!.indexOf(x as ts.Expression);
      if (ts.isNewExpression(p) && k === 0 && ts.isIdentifier(p.expression) && p.expression.text === 'Set') return p;
      if (ts.isCallExpression(p) && ts.isPropertyAccessExpression(p.expression) && p.expression.name.text === 'concat' && this.literalElementType(x as ts.ArrayLiteralExpression)) return p;
      const sig = this.checker.getResolvedSignature(p)?.getDeclaration();
      const param = sig && !ts.isJSDocSignature(sig) ? sig.parameters[k] : undefined;
      return param && !param.dotDotDotToken && !param.getSourceFile().isDeclarationFile ? param : null;
    }
    return null;
  }

  /**
   * A function's result type: a function value without its own annotation gives what the function type it is placed
   * in declares (`give() { return null; }` for `give(): number | null | undefined`).
   */
  resultType(fn: ts.SignatureDeclaration): ts.Type {
    const own = this.checker.getSignatureFromDeclaration(fn)!.getReturnType();
    if (fn.type || !(ts.isArrowFunction(fn) || ts.isFunctionExpression(fn) || (ts.isMethodDeclaration(fn) && ts.isObjectLiteralExpression(fn.parent)))) return own;
    const contextual = ts.isMethodDeclaration(fn)
      ? (() => { const o = this.checker.getContextualType(fn.parent as ts.ObjectLiteralExpression); const m = o && ts.isIdentifier(fn.name) ? o.getProperty(fn.name.text) : undefined; return m ? this.checker.getTypeOfSymbolAtLocation(m, fn) : undefined; })()
      : this.checker.getContextualType(fn as ts.Expression);
    return contextual?.getNonNullableType().getCallSignatures()[0]?.getReturnType() ?? own;
  }

  /** A value placed in a `JSNullish<T>` slot: a variable, parameter or result `nullishHeld` holds, or an element `nullishElements` holds. */
  nullishPlaced(e: ts.Expression): boolean {
    if (this.backend.library || this.backend.lenient || !e.parent) return false;
    const slot = slotOf(e, this.checker);
    if (slot && this.nullishHeld(slot)) return true;
    let x: ts.Node = e;
    while (ts.isParenthesizedExpression(x.parent)) x = x.parent;
    const p = x.parent;
    if (ts.isArrayLiteralExpression(p)) return this.nullishElements(p);
    if (ts.isBinaryExpression(p) && p.right === x && p.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isElementAccessExpression(p.left)) return this.nullishElements(p.left.expression);
    return ts.isCallExpression(p) && ts.isPropertyAccessExpression(p.expression) && p.arguments.includes(x as ts.Expression) && this.nullishElements(p.expression.expression);
  }

  /** A read of a `nullishHeld` slot (a name, or a call giving such a result): the slot's declaration. */
  nullishRead(e: ts.Expression): ts.ParameterDeclaration | ts.VariableDeclaration | ts.SignatureDeclaration | null {
    const bare = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
    if (this.backend.library || this.backend.lenient) return null;
    if (ts.isCallExpression(bare)) {
      const d = this.checker.getResolvedSignature(bare)?.getDeclaration();
      return d && !ts.isJSDocSignature(d) && this.nullishHeld(d) ? d : null;
    }
    if (!ts.isIdentifier(bare)) return null;
    const d = this.checker.getSymbolAtLocation(bare)?.valueDeclaration;
    return d && (ts.isParameter(d) || ts.isVariableDeclaration(d)) && this.nullishHeld(d) ? d : null;
  }

  heldCasts(): ReturnType<typeof heldDowncasts> {
    const b = this.backend;
    return this.downcastSet ??= heldDowncasts(b.checker, b.sourceFiles, (f) => b.pluginFiles.has(f.fileName), this.nullish().held);
  }

  /** A class a held downcast's value may be an object of: its members are read and its methods called by name. */
  downcastClass(cls: ts.ClassLikeDeclaration): boolean {
    return !this.backend.library && !this.backend.lenient && this.heldCasts().classes.has(cls);
  }

  /** An app class script reaches by name (`Forms.byNameClasses`): its methods and accessors are readable, callable and settable by name. */
  byNameClass(cls: ts.ClassLikeDeclaration): boolean {
    return !this.backend.library && !this.packaged(cls) && this.forms().byNameClasses().has(cls);
  }

  /** An app class whose statics script reaches by name (`Forms.byNameStaticClasses`). */
  byNameStatics(cls: ts.ClassLikeDeclaration): boolean {
    return !this.backend.library && !this.packaged(cls) && this.forms().byNameStaticClasses().has(cls);
  }

  /** A variable, parameter, or call result whose slot may hold null and undefined both: held untyped (`nullishSlots`). */
  heldNullish(n: ts.Node): boolean {
    // A conditional or a default giving a held value (`key in saved ? saved[key] : fallback`).
    if (ts.isParenthesizedExpression(n)) return this.heldNullish(n.expression);
    if (ts.isConditionalExpression(n)) return this.heldNullish(n.whenTrue) || this.heldNullish(n.whenFalse);
    if (ts.isBinaryExpression(n) && (n.operatorToken.kind === ts.SyntaxKind.BarBarToken || n.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)) return this.heldNullish(n.right);
    // A member of a held value, read by name: whatever the object it is has (`field.hint` of a SearchBar is undefined).
    if (ts.isPropertyAccessExpression(n) && !(ts.isCallExpression(n.parent) && n.parent.expression === n)) return this.heldMember(n.name) || this.heldNullish(n.expression);
    if (ts.isElementAccessExpression(n) && !(ts.isCallExpression(n.parent) && n.parent.expression === n)) return this.heldNullish(n.expression);
    // A held variable's assertion (`const field = view as TextField`), or one read for a member in place: the value as it is, unchecked as script leaves it.
    if (ts.isAsExpression(n) || ts.isTypeAssertionExpression(n)) {
      const holder = ts.findAncestor(n.parent, (p) => !ts.isParenthesizedExpression(p));
      return (!!holder && ts.isVariableDeclaration(holder) && this.nullish().held.has(holder)) || (!this.backend.library && !this.backend.lenient && this.heldCasts().receivers.has(n));
    }
    if (ts.isCallExpression(n) || ts.isNewExpression(n)) {
      const d = this.checker.getResolvedSignature(n)?.getDeclaration();
      return !!d && !ts.isJSDocSignature(d) && this.nullish().held.has(d);
    }
    if (ts.isPropertySignature(n) || ts.isPropertyDeclaration(n)) return this.nullish().held.has(n);
    if (!ts.isIdentifier(n) || ts.isShorthandPropertyAssignment(n.parent)) return false;
    const d = this.checker.getSymbolAtLocation(n)?.valueDeclaration;
    if (d && (ts.isPropertyDeclaration(d) || ts.isPropertySignature(d) || ts.isPropertyAssignment(d)) && d.name === n) return this.nullish().held.has(d);
    return !!d && (ts.isVariableDeclaration(d) || ts.isParameter(d) || ts.isBindingElement(d)) && this.nullish().held.has(d);
  }

  /**
   * A read of a slot held untyped for its foreign value (§2.3b M7) that a test of its own type guards: inside the then
   * branch of `typeof r === 'string'` (or number, boolean), or of `r instanceof C`. The form it is read as, a checked
   * convert's that cannot throw there; null elsewhere, where it is read untyped. `in`, `Array.isArray` and `typeof …
   * 'object'` tell no class or element type, so their reads stay untyped.
   */
  narrowedRead(e: ts.Node): Form | null {
    const b = this.backend;
    if (b.library || b.lenient || !(ts.isIdentifier(e) || ts.isPropertyAccessExpression(e)) || !this.heldSource(e) || isWriteTarget(e)) return null;
    for (let n: ts.Node = e, p = e.parent; p; n = p, p = p.parent) {
      if (ts.isFunctionLike(p) || ts.isClassLike(p) || ts.isSourceFile(p)) return null;
      const cond = ts.isIfStatement(p) && p.thenStatement === n ? p.expression : ts.isConditionalExpression(p) && p.whenTrue === n ? p.condition : ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken && p.right === n ? p.left : null;
      const type = cond && this.testedType(cond, e);
      if (type) return { type, undefined: false, null: false, hole: false, foreign: true, missing: false, observed: false, typeObserved: false };
    }
    return null;
  }

  /** A held variable, parameter or binding read by name, or a held member read (`heldMember`). */
  private heldSource(e: ts.Identifier | ts.PropertyAccessExpression): boolean {
    if (ts.isPropertyAccessExpression(e)) return this.heldMember(e.name);
    const d = this.checker.getSymbolAtLocation(e)?.valueDeclaration;
    return !!d && (ts.isVariableDeclaration(d) || ts.isParameter(d) || ts.isBindingElement(d)) && this.nullish().held.has(d) && !this.untypedDeclaration(d);
  }

  /** The type a condition's own test establishes for `r` where it holds, through `&&` and parentheses. */
  private testedType(cond: ts.Expression, r: ts.Expression): ts.Type | null {
    const c = ts.skipOuterExpressions(cond, ts.OuterExpressionKinds.Parentheses);
    if (!ts.isBinaryExpression(c)) return null;
    const op = c.operatorToken.kind;
    if (op === ts.SyntaxKind.AmpersandAmpersandToken) return this.testedType(c.right, r) ?? this.testedType(c.left, r);
    if (op === ts.SyntaxKind.InstanceOfKeyword) {
      if (!sameReference(c.left, r, this.checker)) return null;
      const cls = this.checker.getSymbolAtLocation(c.right)?.valueDeclaration;
      return cls && ts.isClassDeclaration(cls) && !cls.getSourceFile().isDeclarationFile && !this.packaged(cls) ? this.checker.getTypeAtLocation(cls.name ?? cls) : null;
    }
    if (op !== ts.SyntaxKind.EqualsEqualsEqualsToken && op !== ts.SyntaxKind.EqualsEqualsToken) return null;
    const [test, lit] = ts.isTypeOfExpression(ts.skipOuterExpressions(c.left)) ? [ts.skipOuterExpressions(c.left), c.right] : [ts.skipOuterExpressions(c.right), c.left];
    if (!ts.isTypeOfExpression(test) || !ts.isStringLiteralLike(lit) || !sameReference(test.expression, r, this.checker)) return null;
    return lit.text === 'string' ? this.checker.getStringType() : lit.text === 'number' ? this.checker.getNumberType() : lit.text === 'boolean' ? this.checker.getBooleanType() : null;
  }

  /** A member name read of a field, getter or parameter property held untyped for its foreign value (§2.3b M7). */
  heldMember(name: ts.MemberName): boolean {
    const b = this.backend;
    if (b.library || b.lenient) return false;
    const d = this.checker.getSymbolAtLocation(name)?.valueDeclaration;
    return !!d && (ts.isPropertyDeclaration(d) || ts.isPropertySignature(d) || ts.isGetAccessorDeclaration(d) || ts.isPropertyAssignment(d) || ts.isShorthandPropertyAssignment(d) || (ts.isParameter(d) && ts.isParameterPropertyDeclaration(d, d.parent))) && this.nullish().held.has(d);
  }

  /**
   * Strict code's value typed `T | null` (or narrowed to null), held as an optional: its empty value is null, as its type
   * has no undefined. A field without an initializer is undefined until assigned, whatever its type says.
   */
  nilIsNull(e: ts.Expression): boolean {
    const b = this.backend;
    if (b.lenient || b.library || this.plugin(e)) return false;
    const bare = ts.skipOuterExpressions(e);
    if (b.lenientApp && (this.nullResult(bare) || (ts.isIdentifier(bare) && this.nullVars.has(b.resolve(bare)!)))) return true;
    if (bare.kind === ts.SyntaxKind.NullKeyword || !onlyNull(this.checker.getTypeAtLocation(e)) || this.heldNullish(bare)) return false;
    if (this.nullBranches(bare)) return false;
    if (ts.isPropertyAccessExpression(bare)) {
      const d = this.checker.getSymbolAtLocation(bare.name)?.valueDeclaration;
      if (d && ((ts.isPropertyDeclaration(d) && !d.initializer) || this.nullish().fields.has(d) || (this.widenedField(d) && this.forms().formOfSlot(d).undefined))) return false;
    }
    return true;
  }

  /** Strict code's value typed `T | undefined`, or a call of a widened result holding no null, held as an optional: its empty value is undefined, never null. */
  nilIsUndefined(e: ts.Expression): boolean {
    const b = this.backend;
    if (b.lenient || b.library || this.plugin(e)) return false;
    const bare = ts.skipOuterExpressions(e);
    const d = ts.isCallExpression(bare) ? this.checker.getResolvedSignature(bare)?.getDeclaration() : undefined;
    if (d && !ts.isJSDocSignature(d) && this.widenedResult(d) && !this.forms().formOfSlot(d).null) return true;
    if (b.lenientApp) return false;
    const t = this.checker.getTypeAtLocation(e);
    const parts = t.isUnion() ? t.types : [t];
    return parts.some((x) => x.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void)) && !parts.some((x) => x.flags & (ts.TypeFlags.Null | ts.TypeFlags.Any | ts.TypeFlags.Unknown));
  }

  /**
   * `nulledRead`'s value read untyped. `code` builds the value's untyped translation; call it only when needed, since
   * building it changes how later reads compile.
   */
  nullableEntry(e: ts.Expression, code: () => string): string | null {
    const read = this.nulledRead(e);
    return read && this.backend.nulledEntry(read, code);
  }

  /**
   * An array element or Map value of strict code's `T | null` values, or a field noted null, whose untyped read tells
   * null from undefined, where its optional alone does not: missing is undefined, an empty value held null.
   */
  nulledRead(e: ts.Expression): NulledRead | null {
    const b = this.backend;
    if (b.lenient || b.library || this.plugin(e)) return null;
    const bare = ts.skipOuterExpressions(e);
    const held = (t: ts.Type, k: number): ts.Type | undefined => this.checker.getTypeArguments(t as ts.TypeReference)?.[k];
    if (ts.isElementAccessExpression(bare)) {
      const t = this.checker.getTypeAtLocation(bare.expression), el = !bare.questionDotToken && this.checker.isArrayType(t) ? held(t, 0) : undefined;
      return el && onlyNull(el) ? { kind: 'element', read: bare } : null;
    }
    if (ts.isCallExpression(bare)) {
      const callee = bare.expression;
      if (!ts.isPropertyAccessExpression(callee) || callee.questionDotToken || callee.name.text !== 'get' || bare.arguments.length !== 1) return null;
      const t = this.checker.getTypeAtLocation(callee.expression), value = t.getSymbol()?.name === 'Map' ? held(t, 1) : undefined;
      return value && onlyNull(value) ? { kind: 'entry', read: bare } : null;
    }
    if (!ts.isPropertyAccessExpression(bare) || isWriteTarget(bare)) return null;
    // An optional field that may hold null or undefined: the literal's shape notes which (`jsNulls`), read by key.
    const name = this.nullField(bare) ? bare.name.text : this.nullishShapeField(bare);
    return name ? { kind: 'field', read: bare, name } : null;
  }

  /**
   * A conditional whose one branch gives null and whose other may give an undefined its type doesn't say
   * (`i < 0 ? null : NAMES[i]`): its one nil can't tell them apart, so each branch is converted, or noted, on its own.
   */
  nullBranches(e: ts.Expression): { cond: ts.ConditionalExpression; nulls: ts.Expression[] } | null {
    const b = this.backend;
    if (b.lenient || b.library || this.plugin(e)) return null;
    const bare = ts.skipOuterExpressions(e);
    if (!ts.isConditionalExpression(bare)) return null;
    const branches = [bare.whenTrue, bare.whenFalse];
    const nulls = branches.filter((x) => ts.skipOuterExpressions(x).kind === ts.SyntaxKind.NullKeyword || this.nilIsNull(x));
    return nulls.length && branches.some((x) => !nulls.includes(x) && !admitsUndefined(this.checker.getTypeAtLocation(x)) && this.forms().formOf(x).undefined) ? { cond: bare, nulls } : null;
  }

  /** A typed value whose untyped read tells null from undefined, where its optional alone does not. */
  nullDistinct(e: ts.Expression): boolean {
    return this.nilIsNull(e) || !!this.nullishRead(e) || this.nullishElementRead(e) || !!this.nulledRead(e);
  }

  /**
   * A read of one element or value of an array, Set or Map whose elements are held as `JSNullish<T>` (`nullishElements`):
   * an index, `at`/`find`/`pop`/…, a Map's `get`.
   */
  nullishElementRead(e: ts.Expression): boolean {
    const bare = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
    if (ts.isElementAccessExpression(bare)) return this.nullishElements(bare.expression);
    if (!ts.isCallExpression(bare) || !ts.isPropertyAccessExpression(bare.expression)) return false;
    const recv = bare.expression.expression, name = bare.expression.name.text;
    const t = this.checker.getNonNullableType(this.checker.getTypeAtLocation(recv));
    const one = this.checker.isArrayType(t) ? ONE_ELEMENT.has(name) : ['Map', 'ReadonlyMap'].includes(t.getSymbol()?.name ?? '') && name === 'get';
    return one && this.nullishElements(recv);
  }

  /**
   * The element type an array literal is spelled with where its contextual type isn't an array: a `new Set(…)`'s, or the
   * receiver's for `concat`, whatever the literal's own elements are (`[null]`).
   */
  literalElementType(e: ts.ArrayLiteralExpression): ts.Type | null {
    let x: ts.Node = e;
    while (ts.isParenthesizedExpression(x.parent)) x = x.parent;
    const p = x.parent;
    if (ts.isNewExpression(p) && p.arguments?.[0] === x && ts.isIdentifier(p.expression) && p.expression.text === 'Set') {
      const t = this.checker.getTypeAtLocation(p);
      return t.getSymbol()?.name === 'Set' ? this.forms().elementOf(t) : null;
    }
    if (ts.isCallExpression(p) && p.arguments.includes(x as ts.Expression) && ts.isPropertyAccessExpression(p.expression) && p.expression.name.text === 'concat') {
      const t = this.checker.getNonNullableType(this.checker.getTypeAtLocation(p.expression.expression));
      return this.checker.isArrayType(t) ? this.forms().elementOf(t) : null;
    }
    return null;
  }


  /** A member that may hold null or undefined both, by its type or as `nullishSlots` finds; written, one that may hold null. */
  nullishMember(e: ts.PropertyAccessExpression, write = false): boolean {
    if (e.questionDotToken || e.expression.kind === ts.SyntaxKind.SuperKeyword) return false;
    const d = this.checker.getSymbolAtLocation(e.name)?.valueDeclaration;
    if (d && ts.isPropertySignature(d) && (this.nullish().fields.has(d) || (this.widenedField(d) && this.forms().formOfSlot(d).null))) return true;
    const parts = ((t) => (t.isUnion() ? t.types : [t]))(this.checker.getTypeAtLocation(e));
    return parts.some((x) => x.flags & ts.TypeFlags.Null) && (write || parts.some((x) => x.flags & ts.TypeFlags.Undefined)) && !!d && (ts.isPropertySignature(d) || ts.isPropertyAssignment(d) || ts.isShorthandPropertyAssignment(d));
  }

  /** An object type's field that may hold null or undefined, which its shape notes (`jsNulls`) and is read and written by key: its name. */
  nullishShapeField(e: ts.PropertyAccessExpression, write = false): string | null {
    return this.nullishMember(e, write) ? this.backend.optionalShapeField(e) : null;
  }

  /**
   * A non-strict app's fields its code sets to null (`colors: string[] = null`, `this.indices = h.length ? h : null`): the
   * native empty value is undefined, so the class notes which hold null (`jsNulls`), and they are written by name, which notes it.
   */
  nullFields(cls: ts.ClassLikeDeclaration): Set<string> {
    let set = this.nullFieldSets.get(cls);
    if (set) return set;
    this.nullFieldSets.set(cls, set = new Set());
    const b = this.backend;
    // A field set to a null its type leaves out is non-strict code, whatever the app's configuration says.
    if (b.lenient || b.library || cls.getSourceFile().isDeclarationFile || this.plugin(cls)) return set;
    for (const m of nullSetFields(cls)) if (b.typeOf(m.name) !== 'Any?') set.add(m.name.getText());
    for (const m of cls.members) if (ts.isPropertyDeclaration(m) && this.nullish().fields.has(m) && b.typeOf(m.name) !== 'Any?') set.add(m.name.getText());
    const ctor = cls.members.find(ts.isConstructorDeclaration);
    const properties = ctor?.parameters.filter((p) => ts.isParameterPropertyDeclaration(p, ctor)) ?? [];
    for (const m of [...cls.members, ...properties]) if ((ts.isPropertyDeclaration(m) || ts.isParameter(m)) && (this.widenedField(m) || this.nullishHeld(m)) && this.forms().formOfSlot(m).null && b.typeOf(m.name) !== 'Any?') set.add(m.name.getText());
    return set;
  }

  /** One `jsNulls` per object: a class whose program base keeps one declares none of its own. */
  baseKeepsNulls(cls: ts.ClassLikeDeclaration): boolean {
    for (let base = this.backend.programBase(cls); base; base = this.backend.programBase(base)) if (this.nullFields(base).size) return true;
    return false;
  }

  /** Strict code's fields typed `T | null` that start with a value (an initializer, a constructor parameter's): an empty value in them is null. */
  nullFieldsTyped(cls: ts.ClassLikeDeclaration): Set<string> {
    const set = new Set<string>();
    const b = this.backend;
    if (b.lenient || b.library || cls.getSourceFile().isDeclarationFile || this.plugin(cls)) return set;
    const ctor = cls.members.find(ts.isConstructorDeclaration);
    const given = [...cls.members.filter((m): m is ts.PropertyDeclaration => ts.isPropertyDeclaration(m) && !!m.initializer && !isStatic(m)), ...(ctor?.parameters.filter((p) => ts.isParameterPropertyDeclaration(p, ctor)) ?? [])];
    for (const m of given) if (ts.isIdentifier(m.name) && onlyNull(this.checker.getTypeAtLocation(m.name))) set.add(m.name.text);
    return set;
  }

  /** A read or write of a field `nullFields` notes. */
  nullField(e: ts.Expression): e is ts.PropertyAccessExpression {
    if (!ts.isPropertyAccessExpression(e) || e.questionDotToken || e.expression.kind === ts.SyntaxKind.SuperKeyword) return false;
    const d = this.checker.getSymbolAtLocation(e.name)?.valueDeclaration;
    const cls = d && (ts.isPropertyDeclaration(d) ? d.parent : ts.isParameter(d) && ts.isParameterPropertyDeclaration(d, d.parent) ? d.parent.parent : null);
    return !!cls && ts.isClassLike(cls) && this.nullFields(cls).has(e.name.text);
  }

  /**
   * A non-strict app's async function (or method of its own signature) whose body may give null or undefined where its
   * promise's type says a value: the promise is of the optional. Its promise is only awaited or dropped; a body giving
   * both null and undefined is refused, as the optional can't tell them apart.
   */
  lenientAsync(fn: ts.Node): fn is ts.FunctionDeclaration | ts.MethodDeclaration {
    const b = this.backend;
    if (b.lenient || b.library || !b.lenientApp || fn.getSourceFile().isDeclarationFile || this.plugin(fn)) return false;
    if (!(ts.isFunctionDeclaration(fn) || b.ownSignature(fn)) || !isAsync(fn) || fn.asteriskToken || !fn.body) return false;
    let found = this.lenientAsyncs.get(fn);
    if (found !== undefined) return found;
    const v = /^JSPromise<(.*)>$/.exec(b.type(this.checker.getSignatureFromDeclaration(fn)!.getReturnType(), fn))?.[1];
    const given = nothingGiven(fn, this.checker);
    found = !!v && v !== b.spelling.void && v !== 'Any?' && !b.optional(v) && !b.functionType(v) && (given.null || given.missing || given.unknown);
    this.lenientAsyncs.set(fn, found);
    if (found && given.null && (given.missing || given.unknown)) throw b.error(fn, 'a non-strict async function giving null and undefined both (`return null` and a bare `return`)');
    return found;
  }

  /** A call of a `lenientAsync` function. */
  lenientAsyncCall(e: ts.Expression): boolean {
    if (!this.backend.lenientApp) return false;
    e = ts.skipOuterExpressions(e);
    if (!ts.isCallExpression(e)) return false;
    const d = this.checker.getResolvedSignature(e)?.getDeclaration();
    return !!d && !ts.isJSDocSignature(d) && this.lenientAsync(d);
  }

  /** A promise an async function returns that is its own promise's type: adopted as it is. */
  returnedAsIs(e: ts.CallExpression): boolean {
    if (!ts.isReturnStatement(ts.walkUpParenthesizedExpressions(e.parent))) return false;
    const outer = ts.findAncestor(e.parent, ts.isFunctionLike);
    const d = this.checker.getResolvedSignature(e)?.getDeclaration();
    return !!outer && !!d && !ts.isJSDocSignature(d) && isAsync(outer) && this.backend.returnTypeOf(outer as ts.SignatureDeclaration) === this.backend.returnTypeOf(d);
  }

  /** A call of a non-strict app's own function whose result is optional and whose body gives only null where it gives nothing, awaited when async, or of a `nullOnlyResult`. */
  nullResult(e: ts.Expression): boolean {
    const b = this.backend, app = b.rules.appNullResults;
    if (app && (!b.lenientApp || b.library)) return false;
    const awaited = ts.isAwaitExpression(e);
    const call = awaited ? ts.skipOuterExpressions(e.expression) : e;
    if (!ts.isCallExpression(call)) return false;
    const d = this.checker.getResolvedSignature(call)?.getDeclaration();
    if (!awaited && d && !ts.isJSDocSignature(d) && this.nullOnlyResult(d)) return true;
    if (!d || ts.isJSDocSignature(d) || !(ts.isFunctionDeclaration(d) || ts.isMethodDeclaration(d)) || !d.body || (app && (d.getSourceFile().isDeclarationFile || this.plugin(d))) || awaited !== isAsync(d)) return false;
    if (awaited ? !this.lenientAsync(d) : !b.resultHoldsNull(d)) return false;
    const given = nothingGiven(d, this.checker);
    return given.null && !given.missing && !given.unknown;
  }

  /**
   * Strict code's strings, numbers and booleans an untrusted value is placed in: optional, as they may hold undefined,
   * and read as JavaScript reads undefined where a value is needed.
   */
  get looseSlots(): LooseSlots {
    const b = this.backend;
    return this.looseSlotSet ??= new LooseSlots(b.sourceFiles, b.checker, (e) => b.unemitted(() => this.untrustedValue(e)), (d) => b.unemitted(() => this.holdsLoose(d)), () => this.widenedFields());
  }

  /** A value that may be undefined, null or another kind than the native type for it says. */
  private untrustedValue(e: ts.Expression): boolean {
    try {
      const origin = originOf(e, this.backend.trust);
      // An untyped read by key or an assertion counts only where what it reads is untyped: a typed array's element is the type's.
      if (origin === 'dynamic' || origin === 'asserted') {
        const x = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
        return this.backend.typeOf(ts.isElementAccessExpression(x) ? x : (x as ts.AsExpression | ts.TypeAssertion | ts.NonNullExpression).expression) === 'Any?';
      }
      return origin === 'any' || origin === 'loose';
    } catch { return false; }
  }

  /** A declaration of strict code (not the kit's) holding a string, number, boolean or object, in a form the backend may choose alone. */
  private holdsLoose(d: ts.Declaration): boolean {
    const b = this.backend;
    const strict = b.trust.strictFile(d.getSourceFile());
    // A non-strict app's fields keep their representation: every reader, a template's binding among them, would see it change.
    const lenientSlot = b.lenientApp && this.appCode(d) && !ts.isPropertySignature(d) && !ts.isPropertyDeclaration(d) && !ts.isPropertyAssignment(d);
    if (b.library || !(strict || lenientSlot) || !ownSlot(d, this.checker, this.implementedInterfaceSet ??= implementedInterfaceDeclarations(b.sourceFiles, this.checker))) return false;
    try {
      const st = slotType(d, this.checker);
      if (!st) return false;
      const t = b.type(st, d);
      // A non-strict app's object slot keeps its checked conversion (§2.3b M6): held optional, a wrong-typed value would read as missing.
      return this.primitive(t) || (strict && b.looseObjectType(t));
    } catch { return false; }
  }

  /** A slot that holds undefined as it is: one an untrusted value is placed in. */
  takesUndefined(x: ts.Expression): boolean {
    if (this.backend.library) return false;
    const slot = slotOf(x, this.checker);
    if (!this.backend.rules.optionalParametersTakeUndefined) return !!slot && this.looseSlots.has(slot);
    return !!slot && !slot.getSourceFile().isDeclarationFile && (this.looseSlots.has(slot) || (ts.isParameter(slot) && !!slot.questionToken));
  }

  /**
   * The receiver of a member read, call or index whose value is a string, number or boolean the program may leave
   * missing at this read though its type says present: JavaScript's TypeError there (`reading 'k'`). Answered from the
   * read's kind and the value's form: an array's element or a string's character, a record's entry, `Map.get`,
   * `pop`/`shift`/`find`/`findLast`/`at`, `x!`, a non-strict optional parameter or member, and a name or call the backend
   * holds optional. An over-answer costs a check that passes.
   */
  missingAtRead(target: ts.Expression): 'undefined' | 'null' | null {
    const b = this.backend, c = this.checker;
    if (b.library || b.lenient || !this.appCode(target)) return null;
    let outer: ts.Node = target;
    while (ts.isParenthesizedExpression(outer.parent)) outer = outer.parent;
    const p = outer.parent;
    if (!p || !(ts.isPropertyAccessExpression(p) || ts.isElementAccessExpression(p)) || p.expression !== outer || p.questionDotToken || assigned(p)) return null;
    const x = ts.skipOuterExpressions(target, ts.OuterExpressionKinds.Parentheses);
    // A held slot's read is untyped, or narrowed by a test of its type to a present value (`narrowedRead`).
    if ((ts.isIdentifier(x) || ts.isPropertyAccessExpression(x)) && this.heldSource(x)) return null;
    if (this.narrowedMissing(x)) return 'undefined';
    if (ts.isBinaryExpression(x) && x.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken && this.missingObject(x)) return 'undefined';
    const untyped = ts.TypeFlags.Any | ts.TypeFlags.Unknown;
    const primitive = (t: ts.Type) => !(t.flags & untyped) && !!(c.getNonNullableType(t).flags & (ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike | ts.TypeFlags.BooleanLike));
    const empty = (t: ts.Type) => ((t.isUnion() ? t.types : [t]).some((u) => u.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void)) ? 'undefined' : (t.isUnion() ? t.types : [t]).some((u) => u.flags & ts.TypeFlags.Null) ? 'null' : null);
    const strict = b.trust.strictFile(x.getSourceFile());
    if (ts.isNonNullExpression(x)) {
      const t = c.getTypeAtLocation(x.expression);
      if (!primitive(t)) return null;
      if (strict) return empty(t);
      const f = this.forms().formOf(x.expression);
      return f.undefined ? 'undefined' : f.null ? 'null' : null;
    }
    const t = c.getTypeAtLocation(x);
    const recvType = (e: ts.Expression) => c.getNonNullableType(c.getTypeAtLocation(e));
    const record = (e: ts.Expression) => { const r = recvType(e); return !c.isArrayType(r) && !c.isTupleType(r) && !(r.flags & ts.TypeFlags.StringLike) && c.getIndexInfosOfType(r).length > 0; };
    // An object-valued record's entry: undefined for a key never set, whatever its value type.
    const objectEntry = ts.isElementAccessExpression(x) && !x.questionDotToken && !(t.flags & (untyped | ts.TypeFlags.TypeParameter)) && !primitive(t) && !empty(t) && record(x.expression);
    if (objectEntry) return this.forms().formOf(x).undefined ? 'undefined' : null;
    if (!primitive(t) && !empty(t) && !(t.flags & (untyped | ts.TypeFlags.TypeParameter)) && !(x.flags & ts.NodeFlags.OptionalChain) && !t.getCallSignatures().length) {
      const given = this.widenedObject(x);
      if (given) return given;
    }
    if (!primitive(t) || empty(t) || x.flags & ts.NodeFlags.OptionalChain) return null;
    const form = this.forms().formOf(x);
    if (!form.undefined) return null;
    if (ts.isElementAccessExpression(x)) {
      const r = recvType(x.expression);
      return (c.isArrayType(r) && !c.isTupleType(r)) || !!(r.flags & ts.TypeFlags.StringLike) || record(x.expression) ? 'undefined' : null;
    }
    if (ts.isPropertyAccessExpression(x)) {
      const d = c.getSymbolAtLocation(x.name)?.valueDeclaration;
      if (!d || ts.isIndexSignatureDeclaration(d) || ts.isMappedTypeNode(d)) return record(x.expression) ? 'undefined' : null;
      if ((ts.isPropertySignature(d) || ts.isPropertyDeclaration(d)) && this.looseSlots.has(d)) return 'undefined';
      return !strict && (ts.isPropertySignature(d) || ts.isPropertyDeclaration(d)) && !!d.questionToken ? 'undefined' : null;
    }
    if (ts.isCallExpression(x) && ts.isPropertyAccessExpression(x.expression) && !x.questionDotToken) {
      const r = recvType(x.expression.expression), name = x.expression.name.text;
      if ((c.isArrayType(r) && ['find', 'findLast', 'pop', 'shift', 'at'].includes(name)) || (['Map', 'ReadonlyMap'].includes(r.getSymbol()?.name ?? '') && name === 'get')) return 'undefined';
    }
    if (ts.isIdentifier(x) && !strict) {
      const d = c.getSymbolAtLocation(x)?.valueDeclaration;
      if (d && ts.isParameter(d) && d.questionToken && !d.initializer) return 'undefined';
    }
    return (ts.isIdentifier(x) || ts.isCallExpression(x)) && b.unemitted(() => b.heldOptional(x)) ? 'undefined' : null;
  }

  /**
   * A variable or parameter read the checker narrows to present though it may hold the program's own missing value
   * there: an assignment narrows to the assigned value's type, which a read past an array's end or a record's entry
   * types present. A name no assignment narrows (a parameter never assigned, a variable never reassigned whose
   * initializer's type keeps the empty state) is narrowed by a guard only, and isn't answered.
   */
  narrowedMissing(e: ts.Expression): boolean {
    const b = this.backend, c = this.checker;
    if (b.library || b.lenient || !ts.isIdentifier(e) || isWriteTarget(e) || !this.appCode(e) || !b.trust.strictFile(e.getSourceFile())) return false;
    const sym = c.getSymbolAtLocation(e), d = sym?.valueDeclaration;
    if (!sym || !d || !(ts.isVariableDeclaration(d) || ts.isParameter(d)) || d.getSourceFile().isDeclarationFile) return false;
    const empty = (t: ts.Type) => (t.isUnion() ? t.types : [t]).some((u) => u.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null | ts.TypeFlags.Void));
    if (!empty(c.getTypeOfSymbol(sym)) || empty(c.getTypeAtLocation(e))) return false;
    if (ts.isParameter(d) ? !assignedParameter(d, c) : !reassigned(d, c) && (!d.initializer || empty(c.getTypeAtLocation(d.initializer)))) return false;
    const form = this.forms().formOfSlot(d);
    return form.undefined && form.absent;
  }

  /**
   * A read JavaScript takes as it is, missing or not: a test of its truth, `typeof`, `!`, an operand of an equality or
   * identity comparison, `instanceof`'s left, `??`'s left, `?.`'s receiver, and a `??`, `&&` or `||` right operand or a
   * `?:` branch whose whole is read so. A missing object here is neither unwrapped nor required present.
   */
  observedAsIs(e: ts.Expression): boolean {
    let n: ts.Node = e;
    while (ts.isParenthesizedExpression(n.parent)) n = n.parent;
    const p = n.parent, K = ts.SyntaxKind;
    if (!p) return false;
    if ((ts.isIfStatement(p) || ts.isWhileStatement(p) || ts.isDoStatement(p)) && p.expression === n) return true;
    if (ts.isForStatement(p) && p.condition === n) return true;
    if (ts.isConditionalExpression(p)) return p.condition === n || this.observedAsIs(p);
    if (ts.isTypeOfExpression(p) || (ts.isPrefixUnaryExpression(p) && p.operator === K.ExclamationToken)) return true;
    if ((ts.isPropertyAccessExpression(p) || ts.isElementAccessExpression(p) || ts.isCallExpression(p)) && p.expression === n) return !!p.questionDotToken;
    if (!ts.isBinaryExpression(p)) return false;
    const op = p.operatorToken.kind;
    if ([K.EqualsEqualsEqualsToken, K.ExclamationEqualsEqualsToken, K.EqualsEqualsToken, K.ExclamationEqualsToken].includes(op)) return true;
    if (op === K.InstanceOfKeyword) return p.left === n;
    if ([K.QuestionQuestionToken, K.AmpersandAmpersandToken, K.BarBarToken].includes(op)) return p.left === n || this.observedAsIs(p);
    return false;
  }

  /**
   * A read of an object strict app code types present that may be the program's own missing value there (its form
   * undefined and absent: a read past an array's end, a record's entry never set, a slot such a value reaches). `typeof`
   * reads such an object as it is; where the backend holds it present it never is missing.
   */
  missingObject(e: ts.Expression): boolean {
    const b = this.backend, c = this.checker;
    if (b.library || b.lenient || b.lenientApp || !this.appCode(e) || !b.trust.strictFile(e.getSourceFile())) return false;
    const t = c.getTypeAtLocation(e);
    const parts = t.isUnion() ? t.types : [t];
    const notObject = ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.TypeParameter | ts.TypeFlags.Undefined | ts.TypeFlags.Null | ts.TypeFlags.Void
      | ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike | ts.TypeFlags.BooleanLike | ts.TypeFlags.BigIntLike | ts.TypeFlags.ESSymbolLike | ts.TypeFlags.EnumLike;
    if (parts.some((u) => u.flags & notObject || u.getCallSignatures().length)) return false;
    const form = this.forms().formOf(e);
    return form.undefined && form.absent;
  }

  /**
   * An object a `widenedResult` gives: its call, or a variable such calls are given to that the backend holds optional.
   * Its empty state: null where every such result holds null only.
   */
  private widenedObject(x: ts.Expression): 'undefined' | 'null' | null {
    const results = (e: ts.Expression): ts.SignatureDeclaration[] => {
      if (!ts.isCallExpression(e)) return [];
      const d = this.checker.getResolvedSignature(e)?.getDeclaration();
      return d && !ts.isJSDocSignature(d) && this.widenedResult(d) ? [d] : [];
    };
    let fns = results(x);
    if (ts.isIdentifier(x)) {
      const d = this.checker.getSymbolAtLocation(x)?.valueDeclaration;
      if (!d || !ts.isVariableDeclaration(d)) return null;
      let found = this.widenedGiven.get(d);
      if (!found) {
        const all: ts.SignatureDeclaration[] = [];
        givenBy(d, this.checker, (v) => { all.push(...results(v)); return false; });
        this.widenedGiven.set(d, found = all);
      }
      fns = found.length && this.backend.unemitted(() => this.backend.declaredOptional(x)) ? found : [];
    }
    return !fns.length ? null : fns.every((f) => this.nullOnlyResult(f)) ? 'null' : 'undefined';
  }
  private readonly widenedGiven = new Map<ts.VariableDeclaration, ts.SignatureDeclaration[]>();

  /** Strict code's declaration holding a string, number or boolean an untrusted value is placed in (see `looseSlots`). */
  looseDeclaration(n: ts.Node | undefined): boolean {
    const b = this.backend;
    if (b.library || !n) return false;
    let d: ts.Node | undefined = n;
    if (b.rules.looseReads) {
      const named = ts.isPropertyAccessExpression(n) ? n.name : ts.isPropertyDeclaration(n) || ts.isVariableDeclaration(n) || ts.isParameter(n) || ts.isPropertySignature(n) || ts.isBindingElement(n) ? n.name : n;
      if (!ts.isIdentifier(named) && !ts.isPrivateIdentifier(named)) return false;
      d = (this.checker.getSymbolAtLocation(named) ?? b.resolve(named))?.valueDeclaration;
      if (!d) return false;
    }
    return this.looseSlots.has(d as ts.Declaration) || (ts.isParameter(d) && this.scriptCalledParameter(d)) || !!b.rules.checkedParameters?.unsetElement(d) || (!b.rules.looseReads && this.widenedFieldRead(n));
  }

  /** A read (or the declaration) of a `widenedField`, where reads aren't resolved to their slot for `looseSlots`. */
  private widenedFieldRead(n: ts.Node): boolean {
    const named = ts.isPropertyAccessExpression(n) ? n.name : ts.isPropertyDeclaration(n) || ts.isPropertySignature(n) || ts.isParameter(n) ? n.name : n;
    if (!ts.isIdentifier(named)) return false;
    const d = (this.checker.getSymbolAtLocation(named) ?? this.backend.resolve(named))?.valueDeclaration;
    return !!d && fieldLike(d) && this.widenedField(d);
  }

  /** See `scriptCalledFunction` (lang.ts). */
  scriptCalled(sig: ts.Node): boolean {
    if (this.backend.library) return false;
    return (this.scriptCalledFunctions ??= scriptCalledFunction(this.backend.trust))(sig);
  }

  /** A string, number or boolean parameter of a function script calls (`scriptCalled`) or `givenUndefined`: it takes undefined as well. */
  scriptCalledParameter(p: ts.ParameterDeclaration): boolean {
    const b = this.backend;
    if (p.dotDotDotToken || !ts.isIdentifier(p.name) || !(this.scriptCalled(p.parent) || this.givenUndefined(p))) return false;
    return b.unemitted(() => this.primitive(b.type(this.checker.getTypeAtLocation(p.name), p)));
  }

  /** A parameter of a function script calls, or one the program gives undefined: it takes undefined as well. */
  undefinedParameter(p: ts.ParameterDeclaration): boolean {
    return this.givenUndefined(p) || this.scriptCalledParameter(p);
  }

  /**
   * An app's parameter the program may give undefined though its declared type has none: its form's undefined is a
   * value left out (`Form.missing`: fewer arguments, a read past an array's end, a hole, an optional parameter). In a
   * non-strict app also a parameter of a function type (`f: (i: number, last: boolean) => string`) that a call through
   * its name gives undefined (`f(i, end ? true : undefined)`), or a literal's parameter given for one.
   */
  givenUndefined(p: ts.ParameterDeclaration): boolean {
    const b = this.backend;
    // A library's and a plugin's parameters are entry points: their forms change the kit's surface, decided with it.
    if (b.lenient || b.library || p.getSourceFile().isDeclarationFile || this.plugin(p)) return false;
    let found = this.undefinedGiven.get(p);
    if (found !== undefined) return found;
    this.undefinedGiven.set(p, found = !p.dotDotDotToken && this.forms().formOfSlot(p).missing && !this.forms().declaredForm(p).undefined);
    if (found || !b.lenientApp) return found;
    const fn = p.parent, k = fn.parameters.indexOf(p);
    if (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) {
      const slot = this.checker.getContextualType(fn)?.getNonNullableType().getCallSignatures()[0]?.getDeclaration();
      const q = slot && !ts.isJSDocSignature(slot) && ts.isFunctionTypeNode(slot) ? slot.parameters[k] : undefined;
      found = !!q && this.givenUndefined(q);
    } else if (ts.isFunctionTypeNode(fn) && (ts.isParameter(fn.parent) || ts.isVariableDeclaration(fn.parent)) && fn.parent.type === fn && ts.isIdentifier(fn.parent.name)) {
      const d = fn.parent, sym = this.checker.getSymbolAtLocation(d.name as ts.Identifier);
      const undef = (e: ts.Expression): boolean => {
        e = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
        return (ts.isIdentifier(e) && e.text === 'undefined') || ts.isVoidExpression(e) || (ts.isConditionalExpression(e) && (undef(e.whenTrue) || undef(e.whenFalse)));
      };
      const visit = (x: ts.Node): boolean => (ts.isCallExpression(x) && ts.isIdentifier(x.expression) && this.checker.getSymbolAtLocation(x.expression) === sym && !!x.arguments[k] && undef(x.arguments[k])) || !!ts.forEachChild(x, visit);
      const scope = ts.isParameter(d) ? d.parent : ts.findAncestor(d.parent, (x) => ts.isFunctionLike(x) || ts.isSourceFile(x));
      found = !!sym && !!scope && visit(scope);
    }
    this.undefinedGiven.set(p, found);
    return found;
  }

  /**
   * An app's defaulted parameter the program may give undefined (`Forms.defaultGivenUndefined`): its default is applied
   * in the body, where undefined takes it too, not by the native signature, which only an omitted argument reaches.
   */
  defaultTakesUndefined(p: ts.ParameterDeclaration): boolean {
    const b = this.backend;
    if (b.lenient || b.library || !p.initializer || p.getSourceFile().isDeclarationFile || this.plugin(p)) return false;
    let found = this.defaultsGiven.get(p);
    if (found === undefined) this.defaultsGiven.set(p, found = !this.forms().fixedSlot(p) && this.forms().defaultGivenUndefined(p));
    return found;
  }
  private readonly defaultsGiven = new Map<ts.ParameterDeclaration, boolean>();

  /**
   * A parameter whose native type takes an empty value its declared type leaves out. An app's parameter takes what its
   * group's form holds (`formDecides`), whether or not its code is checked with strictNullChecks. A plugin's is an
   * entry point, its code checked without them: callers pass null and undefined for an object parameter (core's
   * `valueChanged(target, oldValue, newValue)` starts from undefined; ui-drawer applies a closing drawer's data with
   * no side).
   */
  mayBeNull(p: ts.ParameterDeclaration): boolean {
    const b = this.backend, checked = b.rules.checkedParameters;
    if (p.dotDotDotToken || !ts.isIdentifier(p.name)) return false;
    const t = b.typeOf(p.name);
    if (this.formDecides(p)) {
      // Swift reads a non-strict app's optional parameter unwrapped where its body tests it, as nothing narrows it there.
      const optional = !checked && b.lenientApp && !!p.questionToken && b.nullableParameter(t);
      return optional || this.widened(p) || (!!checked && (this.looseDeclaration(p) || (this.primitive(t) && this.undefinedParameter(p))));
    }
    if (!checked) return (this.plugin(p) || b.lenientApp) && b.nullableParameter(t);
    if (this.looseDeclaration(p)) return true;
    if (this.primitive(t) && this.undefinedParameter(p)) return true;
    // A plugin's string parameter its function tests (`if (state)`), in a non-strict app: one callers may leave out.
    if (b.lenientApp && !b.library && !p.getSourceFile().isDeclarationFile && t === 'String' && ts.isFunctionDeclaration(p.parent) && checked.truthTested(p.name)) return true;
    return this.plugin(p) && b.nullableParameter(t);
  }

  /**
   * Whether an app's parameter is held as its group's form says (`widened`) rather than by its declared type: not where
   * that form is decided elsewhere (`ownForm`).
   */
  formDecides(p: ts.ParameterDeclaration): boolean {
    if (p.dotDotDotToken || !ts.isIdentifier(p.name) || !this.appParameter(p)) return false;
    let found = this.decidedParams.get(p);
    if (found === undefined) this.decidedParams.set(p, found = this.ownForm(p));
    return found;
  }
  private readonly decidedParams = new Map<ts.ParameterDeclaration, boolean>();

  /**
   * An app's parameter that holds what its form holds beyond its declared type: its callers' values, or what any caller
   * may give where the program can't see them all (§2.3a). The form is its group's (the function type it is given for,
   * the member it implements or overrides), so every place that spells a member of the group asks this. Swift holds a
   * string, number or boolean given undefined by its own rules (`looseSlots`, `scriptCalledParameter`).
   */
  widened(p: ts.ParameterDeclaration): boolean {
    const b = this.backend;
    if (!this.formDecides(p)) return false;
    let found = this.widenedParams.get(p);
    if (found === undefined) this.widenedParams.set(p, found = (!!b.rules.checkedParameters || b.nullableParameter(b.typeOf(p.name))) && this.givenEmpty(p));
    return found;
  }
  private readonly widenedParams = new Map<ts.ParameterDeclaration, boolean>();

  /**
   * An app function's result whose form holds null or undefined its declared type leaves out: a value its returns may
   * leave missing (an element past the end, `find`, `Map.get`, a record's entry, a widened call's result, an untyped
   * value) or, in non-strict code, `return null`/`return undefined`. The form is its group's (overrides, the interface
   * member or function type it is given for), so every place that spells a member of the group asks this. Not for a
   * result typed by a type parameter (§2.3b M5), an async function's or generator's, or one whose group holds a fixed
   * point (a kit's or platform's callback type), nor one the Angular transform writes for a template (`$b…`, `$e…`),
   * whose only reader is the template glue. A result whose type already holds null or undefined keeps the empty state
   * it is held with (§2.3b M1').
   */
  widenedResult(fn: ts.SignatureDeclaration): boolean {
    const b = this.backend;
    if (b.library || b.lenient || ts.isJSDocSignature(fn as ts.Node) || fn.getSourceFile().isDeclarationFile || this.packaged(fn) || !this.appCode(fn)) return false;
    if (ts.isConstructorDeclaration(fn) || ts.isAccessor(fn) || isAsync(fn) || (fn as ts.FunctionLikeDeclaration).asteriskToken || isTemplateMethod(fn)) return false;
    let found = this.widenedResults.get(fn);
    if (found !== undefined) return found;
    found = false;
    // A literal given for a library's callback whose result is a type parameter (`map`'s `U`), §2.3b M5.
    const context = ts.isArrowFunction(fn) || ts.isFunctionExpression(fn) ? this.checker.getContextualType(fn)?.getNonNullableType().getCallSignatures()[0]?.getDeclaration() : undefined;
    const contextResult = context && !ts.isJSDocSignature(context) && context.getSourceFile().isDeclarationFile ? this.checker.getSignatureFromDeclaration(context)?.getReturnType() : undefined;
    if (contextResult && mentionsTypeParameter(this.checker, contextResult)) { this.widenedResults.set(fn, false); return false; }
    const t = this.checker.getSignatureFromDeclaration(fn)?.getReturnType();
    const none = ts.TypeFlags.Void | ts.TypeFlags.Undefined | ts.TypeFlags.Null | ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.Never;
    // A boolean's undefined reads as false wherever a boolean is tested, which a library's callback (`filter`) does.
    if (t && !(t.flags & (none | ts.TypeFlags.BooleanLike)) && !(t.isUnion() && t.types.some((u) => u.flags & none)) && !mentionsTypeParameter(this.checker, t)) {
      const forms = this.forms();
      if (!forms.fixedSlot(fn)) {
        const declared = forms.declaredForm(fn), form = forms.formOfSlot(fn);
        found = !declared.foreign && !form.foreign && ((form.null && !declared.null) || (form.undefined && !declared.undefined));
        // A function declaration is its group's only member with a body; what its returns give after their guards decides.
        if (found && ts.isFunctionDeclaration(fn) && fn.body) found = this.returnsGiveEmpty(fn, declared);
      }
    }
    this.widenedResults.set(fn, found);
    return found;
  }

  /**
   * Whether a function's own returns may give null or undefined `declared` leaves out. A name a guard has tested truthy
   * where it is returned (`if (!x) throw …; return x`, `if (x) return x`) gives its value, which the form, blind to
   * narrowing, counts empty.
   */
  private returnsGiveEmpty(fn: ts.FunctionDeclaration, declared: Form): boolean {
    let empty = false;
    if (!alwaysEnds(fn.body!)) empty = !declared.undefined;
    const gives = (e: ts.Expression): boolean => {
      e = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
      if (ts.isConditionalExpression(e)) return gives(e.whenTrue) || gives(e.whenFalse);
      if (ts.isCallExpression(e) && this.checker.getResolvedSignature(e)?.getDeclaration() === fn) return false;
      if (truthyAt(e, e, this.checker)) return false;
      const f = this.forms().formOf(e);
      return (f.null && !declared.null) || (f.undefined && !declared.undefined) || f.foreign;
    };
    const visit = (n: ts.Node): void => {
      if (empty || (n !== fn.body && ts.isFunctionLike(n))) return;
      if (ts.isReturnStatement(n)) {
        if (!n.expression) { empty ||= !declared.undefined; return; }
        empty ||= gives(n.expression);
        return;
      }
      ts.forEachChild(n, visit);
    };
    visit(fn.body!);
    return empty;
  }

  /**
   * An app's field (a class's, an interface's or type literal's, a parameter property) whose group's form holds null or
   * undefined its declared type leaves out: a widened call's result, an element past the end, a field never assigned.
   * Every member of the group answers alike, so overrides, the interface member a class implements and the literals given
   * for it are spelled as one.
   */
  widenedField(d: ts.Declaration): boolean {
    const b = this.backend;
    if (b.library || b.lenient || !fieldLike(d)) return false;
    let found = this.widenedFieldSet.get(d);
    if (found !== undefined) return found;
    const forms = this.forms(), group = forms.groupOf(d);
    found = !forms.fixedSlot(d) && group.every((m) => m === d || !fieldLike(m) || (!m.getSourceFile().isDeclarationFile && this.appCode(m)));
    if (found) {
      const declared = forms.declaredForm(d), form = forms.formOfSlot(d);
      const t = this.checker.getTypeAtLocation(d);
      found = form.absent && !declared.foreign && !form.foreign && !(t.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) && !mentionsTypeParameter(this.checker, t) && ((form.null && !declared.null) || (form.undefined && !declared.undefined));
    }
    for (const m of group) if (fieldLike(m)) this.widenedFieldSet.set(m, found);
    this.widenedFieldSet.set(d, found);
    return found;
  }
  private readonly widenedFieldSet = new Map<ts.Declaration, boolean>();

  /**
   * The app field a value is placed in: a literal's property, an assignment, an initializer, a parameter property's
   * argument. A value its form doesn't hold missing that turns out missing there (a callback's result Form doesn't
   * follow, §2.3b M5) is JavaScript's TypeError naming the field, never a value made up for it.
   */
  placedField(e: ts.Expression): { decl: ts.Declaration; name: string } | null {
    const b = this.backend;
    if (b.library || b.lenient || !e.parent || !this.appCode(e)) return null;
    let x: ts.Node = e;
    while (ts.isParenthesizedExpression(x.parent)) x = x.parent;
    // A literal's own property where nothing types the literal (`map`'s callback result, an untyped variable's): the
    // field of the shape it makes.
    const d = slotOf(e, this.checker) ?? (ts.isPropertyAssignment(x.parent) && x.parent.initializer === x ? x.parent : null);
    if (!d || d.getSourceFile().isDeclarationFile || this.packaged(d)) return null;
    if (fieldLike(d) || (ts.isPropertyAssignment(d) && ts.isIdentifier(d.name))) return { decl: d, name: (d as ts.NamedDeclaration).name!.getText() };
    // A template's binding method gives the template glue the type it declares: named by the member it reads.
    const read = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
    if (isTemplateMethod(d)) return { decl: d, name: ts.isPropertyAccessExpression(read) ? read.name.text : 'value' };
    return null;
  }

  /** Every app field `widenedField` answers. */
  widenedFields(): readonly ts.Declaration[] {
    const b = this.backend, out: ts.Declaration[] = [];
    if (b.library || b.lenient) return out;
    const visit = (n: ts.Node): void => {
      if (fieldLike(n as ts.Declaration) && this.widenedField(n as ts.Declaration)) out.push(n as ts.Declaration);
      ts.forEachChild(n, visit);
    };
    for (const f of b.sourceFiles) if (!f.isDeclarationFile && this.appCode(f)) visit(f);
    return out;
  }

  /** A widened result (`widenedResult`) whose only empty state is null: its nil is null. */
  nullOnlyResult(fn: ts.SignatureDeclaration): boolean {
    if (!this.widenedResult(fn)) return false;
    const form = this.forms().formOfSlot(fn);
    return form.null && !form.undefined;
  }
  private readonly widenedResults = new Map<ts.SignatureDeclaration, boolean>();

  /** A function literal typed by nothing of its own (`() => null`, non-strict) given for a widened function type: that type. */
  widenedContext(fn: ts.SignatureDeclaration): ts.SignatureDeclaration | null {
    if (!(ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) || fn.type) return null;
    const own = this.checker.getSignatureFromDeclaration(fn)?.getReturnType();
    if (!own || !(own.flags & (ts.TypeFlags.Any | ts.TypeFlags.Null | ts.TypeFlags.Undefined))) return null;
    const ctx = this.checker.getContextualType(fn)?.getNonNullableType().getCallSignatures()[0]?.getDeclaration();
    return ctx && !ts.isJSDocSignature(ctx) && this.widenedResult(ctx) ? ctx : null;
  }
  /**
   * An untyped value asserted to a concrete type (`x as T`, `JSON.parse(s) as T`) in the app's own code: the form the
   * value enters as, for the backend's checked convert. Null where the assertion is no such entry, or where the type of
   * what it enters is tested, which §2.3b M6 holds untyped rather than checked.
   */
  foreignEntry(e: ts.AsExpression | ts.TypeAssertion): Form | null {
    const b = this.backend, untyped = ts.TypeFlags.Any | ts.TypeFlags.Unknown;
    if (b.library || this.packaged(e) || !(this.checker.getTypeAtLocation(e.expression).flags & untyped)) return null;
    const t = this.checker.getTypeAtLocation(e);
    if (t.flags & untyped || isGeneric(t)) return null;
    const form = this.forms().formOf(e);
    return form.foreign && !form.typeObserved ? this.withElements(form, this.forms().elementsTypeObserved(e)) : null;
  }

  /**
   * A foreign array of strings, numbers or booleans: its elements are foreign too, checked as they enter, unless their
   * type is tested (`observed`, or its own element form says so).
   */
  private withElements(form: Form, observed: boolean): Form {
    const t = form.type, el = this.checker.isArrayType(t) ? this.forms().elementOf(t) : null;
    const primitive = ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike | ts.TypeFlags.BooleanLike;
    if (!el || !(this.checker.getNonNullableType(el).flags & primitive)) return form;
    if (observed || form.element?.typeObserved) return { ...form, element: { ...(form.element ?? form), type: el, typeObserved: true } };
    return { ...form, element: { ...(form.element ?? form), type: this.checker.getNonNullableType(el), foreign: true, typeObserved: false, element: undefined } };
  }

  /**
   * An untyped value placed in a slot of the app's own code that holds its declared type (§2.3b M6): a variable's
   * initializer or assignment, an argument (group 2), a function's result (group 3), a field, or an element of an array,
   * Set or Map (group 4). The form the
   * value enters as, for the backend's checked convert. Null where the slot is held untyped or the value or slot is no
   * such one: a slot whose type is tested but whose group can't be held (§2.3b M7) converts checked too.
   */
  foreignPlacement(a: ts.Expression): Form | null {
    return this.foreignForm(a, () => this.placementForm(a));
  }

  /** `foreignPlacement` of `a` given as the `k`th argument of `call`, decided from the call and its parameter. */
  foreignArgument(call: ts.CallExpression | ts.NewExpression, k: number, a: ts.Expression): Form | null {
    return this.foreignForm(a, () => this.argumentForm(call, k));
  }

  /** `foreignPlacement` of `a` stored by `at` (a declaration, an object literal's field, an assignment's target), decided from the store. */
  foreignStore(at: Store, a: ts.Expression): Form | null {
    return this.foreignForm(a, () => this.storeForm(at));
  }

  private foreignForm(a: ts.Expression, slotForm: () => Form | null): Form | null {
    const b = this.backend;
    if (b.library || b.lenient || !this.appCode(a) || !this.untypedValue(a)) return null;
    const form = slotForm();
    if (!form || !form.foreign || form.type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown) || isGeneric(form.type)) return null;
    return this.withElements(form, false);
  }

  /** The form of the slot of the app's own code `a` is placed in by its parent, if it is one M6 checks. */
  private placementForm(a: ts.Expression): Form | null {
    let x: ts.Node = a;
    while (ts.isParenthesizedExpression(x.parent)) x = x.parent;
    const p = x.parent;
    const slot = (d: ts.Declaration | undefined) => this.declaredSlot(d);
    const element = elementStoreOf(this.checker, a);
    if (element) return this.storeForm(element);
    if ((ts.isCallExpression(p) || ts.isNewExpression(p)) && p.expression !== x) return this.argumentForm(p, p.arguments!.indexOf(x as ts.Expression));
    if (ts.isReturnStatement(p) || (ts.isArrowFunction(p) && p.body === x)) {
      const fn = ts.isArrowFunction(p) ? p : ts.getContainingFunction(p);
      if (!fn || fn.asteriskToken || ts.isConstructorDeclaration(fn) || ts.isSetAccessorDeclaration(fn)) return null;
      const form = slot(fn), result = this.checker.getSignatureFromDeclaration(fn)?.getReturnType();
      if (!form || !result) return null;
      if (!isAsync(fn)) return { ...form, type: this.checker.getNonNullableType(result) };
      const awaited = this.checker.getAwaitedType(result);
      return form.element && awaited && !ts.isArrowFunction(fn) && !ts.isFunctionExpression(fn) ? { ...form.element, type: this.checker.getNonNullableType(awaited) } : null;
    }
    const store = storeOf(a);
    return store ? this.storeForm(store) : null;
  }

  /** The form of the slot of the app's own code `at` stores a value in, if it is one M6 checks. */
  private storeForm(at: Store): Form | null {
    const slot = (d: ts.Declaration | undefined) => this.declaredSlot(d);
    if (ts.isCallExpression(at) || ts.isArrayLiteralExpression(at)) return this.elementForm(at);
    if (ts.isVariableDeclaration(at)) return ts.isIdentifier(at.name) ? slot(at) : null;
    if (ts.isPropertyDeclaration(at)) return this.fieldSlot(at, slot);
    if (ts.isPropertyAssignment(at)) {
      const literal = ts.isObjectLiteralExpression(at.parent) && this.checker.getContextualType(at.parent);
      const name = ts.isIdentifier(at.name) || ts.isStringLiteral(at.name) ? at.name.text : null;
      return literal && name ? this.fieldSlot(this.checker.getNonNullableType(literal).getProperty(name)?.valueDeclaration, slot) : null;
    }
    if (ts.isParameter(at)) return null;
    const left = ts.skipOuterExpressions(at, ts.OuterExpressionKinds.Parentheses);
    if (ts.isIdentifier(left)) {
      const d = this.checker.getSymbolAtLocation(left)?.valueDeclaration;
      return d && (ts.isVariableDeclaration(d) || (ts.isParameter(d) && !ts.isParameterPropertyDeclaration(d, d.parent))) ? slot(d) : null;
    }
    if (ts.isPropertyAccessExpression(left)) return this.fieldSlot(this.checker.getSymbolAtLocation(left.name)?.valueDeclaration, slot);
    if (ts.isElementAccessExpression(left) && this.collection(left.expression) === 'Array' && this.checker.getTypeAtLocation(left.argumentExpression).flags & ts.TypeFlags.NumberLike) return this.forms().formOf(left.expression).element ?? null;
    return null;
  }

  /**
   * The form of a slot of the app's own code. A group's form is typed by one of its members; the slot holds its own
   * declared type. One sharing a declaration file's form (§2.3b M7: not held) takes an untyped value as that
   * declaration's type, checked.
   */
  private declaredSlot(d: ts.Declaration | undefined): Form | null {
    if (!d || d.getSourceFile().isDeclarationFile || !this.appCode(d) || this.nullish().held.has(d)) return null;
    const form = this.forms().formOfSlot(d);
    return { ...form, foreign: form.foreign || this.forms().fixedSlot(d), type: this.checker.getNonNullableType(this.checker.getTypeAtLocation((d as ts.NamedDeclaration).name ?? d)) };
  }

  /** The form of the `k`th argument's slot of `call`, if it is one M6 checks: the app's parameter. */
  private argumentForm(call: ts.CallExpression | ts.NewExpression, k: number): Form | null {
    const sig = this.checker.getResolvedSignature(call)?.getDeclaration();
    if (!sig || ts.isJSDocSignature(sig) || sig.getSourceFile().isDeclarationFile) return null;
    const param = sig.parameters[k];
    return param && !param.dotDotDotToken && ts.isIdentifier(param.name) && !ts.isParameterPropertyDeclaration(param, param.parent) ? this.declaredSlot(param) : null;
  }

  /**
   * A variable a destructuring pattern binds from an untyped value (`const { a }: { a: string } = raw`), named by a
   * pattern whose type says what it holds: the form its value enters as, as `foreignPlacement` gives a placement's.
   */
  foreignBinding(el: ts.BindingElement): Form | null {
    const b = this.backend, pattern = el.parent, holder = pattern.parent;
    if (b.library || b.lenient || el.dotDotDotToken || !ts.isIdentifier(el.name) || !this.appCode(el) || this.nullish().held.has(el)) return null;
    if (!ts.isVariableDeclaration(holder) || !holder.initializer || !holder.type || !this.untypedValue(holder.initializer)) return null;
    const form = this.forms().formOfSlot(el), type = this.checker.getNonNullableType(this.checker.getTypeAtLocation(el.name));
    if (!form.foreign || type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown) || isGeneric(type)) return null;
    return this.withElements({ ...form, type }, false);
  }

  private fieldSlot(d: ts.Declaration | undefined, slot: (d: ts.Declaration | undefined) => Form | null): Form | null {
    return d && (ts.isPropertyDeclaration(d) || ts.isPropertySignature(d)) && ts.isIdentifier(d.name) ? slot(d) : null;
  }

  /** The element form a value stored by `at` (`elementStoreOf`) enters: its receiver's, where `push`, `unshift`, `add` or `set` stores it. */
  private elementForm(at: ElementStore): Form | null {
    if (!ts.isCallExpression(at) || !ts.isPropertyAccessExpression(at.expression) || !['push', 'unshift', 'add', 'set'].includes(at.expression.name.text)) return null;
    return this.collection(at.expression.expression) ? this.forms().formOf(at.expression.expression).element ?? null : null;
  }

  /** Whether a receiver of the app's own code (a variable, parameter or field) is an array, Set or Map. */
  private collection(e: ts.Expression): 'Array' | 'Set' | 'Map' | null {
    const x = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
    if (!ts.isNewExpression(x) && !ts.isArrayLiteralExpression(x)) {
      const name = ts.isIdentifier(x) ? x : ts.isPropertyAccessExpression(x) ? x.name : null;
      const d = name && this.checker.getSymbolAtLocation(name)?.valueDeclaration;
      if (!d || d.getSourceFile().isDeclarationFile || !this.appCode(d)) return null;
    }
    return containerKind(this.checker, e);
  }

  /** A value of no type the program knows: typed `any` or `unknown`, or read from a slot held untyped for its foreign value. */
  private untypedValue(e: ts.Expression): boolean {
    const x = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
    if (x.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(x) && x.text === 'undefined')) return false;
    if (this.checker.getTypeAtLocation(x).flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) return true;
    if (this.narrowedRead(x)) return false;
    if (ts.isPropertyAccessExpression(x)) return this.heldMember(x.name);
    const d = ts.isIdentifier(x) ? this.checker.getSymbolAtLocation(x)?.valueDeclaration : ts.isCallExpression(x) ? this.checker.getResolvedSignature(x)?.getDeclaration() : undefined;
    return !!d && !ts.isJSDocSignature(d) && this.nullish().held.has(d) && this.forms().formOfSlot(d).foreign;
  }

  /** A declaration typed `any` or `unknown`: held untyped already. */
  private untypedDeclaration(d: ts.Declaration): boolean {
    const t = ts.isFunctionLike(d) ? this.checker.getSignatureFromDeclaration(d as ts.SignatureDeclaration)?.getReturnType() : this.checker.getTypeAtLocation((d as ts.NamedDeclaration).name ?? d);
    return !!t && !!(t.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown));
  }

  /**
   * A slot of the app's own code that can be held untyped for a foreign value (§2.3b M6, M7): a variable, a parameter
   * or a sync function's result, of a string, number or boolean; a field, a getter's result, a parameter property or an
   * object literal's field of an undecorated class or type of the program; or a variable of an object type. Its native
   * form no declaration outside its group shares.
   */
  private holdsForeign(d: ts.Declaration): boolean {
    if (d.getSourceFile().isDeclarationFile || !this.appCode(d)) return false;
    if (this.untypedDeclaration(d)) return true;
    let type: ts.Type | undefined, objects = false;
    if (ts.isVariableDeclaration(d)) {
      if (!ts.isIdentifier(d.name) || !ts.isVariableStatement(d.parent.parent)) return false;
      type = this.checker.getTypeAtLocation(d.name);
      objects = true;
    } else if (ts.isBindingElement(d)) {
      const holder = d.parent.parent;
      if (!ts.isIdentifier(d.name) || d.dotDotDotToken || !ts.isVariableDeclaration(holder) || !ts.isVariableStatement(holder.parent.parent)) return false;
      type = this.checker.getTypeAtLocation(d.name);
    } else if (ts.isParameter(d)) {
      const fn = d.parent;
      if (!ts.isIdentifier(d.name) || d.dotDotDotToken) return false;
      if (ts.isParameterPropertyDeclaration(d, fn) || ts.isSetAccessorDeclaration(fn)) {
        if (!this.ownClass(fn.parent) || (ts.isSetAccessorDeclaration(fn) && ts.getDecorators(fn)?.length)) return false;
        objects = true;
      } else if (!this.ownFunction(fn)) return false;
      type = this.checker.getTypeAtLocation(d.name);
    } else if (ts.isPropertyDeclaration(d) || ts.isGetAccessorDeclaration(d)) {
      if (!ts.isIdentifier(d.name) || isStatic(d) || !this.ownClass(d.parent) || ts.getDecorators(d)?.length) return false;
      type = ts.isGetAccessorDeclaration(d) ? this.checker.getSignatureFromDeclaration(d)?.getReturnType() : this.checker.getTypeAtLocation(d.name);
      objects = true;
    } else if (ts.isPropertySignature(d)) {
      if (!ts.isIdentifier(d.name) || !(ts.isInterfaceDeclaration(d.parent) || ts.isTypeLiteralNode(d.parent))) return false;
      type = this.checker.getTypeAtLocation(d.name);
      objects = true;
    } else if (ts.isPropertyAssignment(d) || ts.isShorthandPropertyAssignment(d)) {
      if (!ts.isIdentifier(d.name) || !ts.isObjectLiteralExpression(d.parent)) return false;
      type = this.checker.getTypeAtLocation(d.name);
      objects = true;
    } else if (ts.isFunctionLike(d)) {
      if (!this.ownFunction(d) || isAsync(d as ts.SignatureDeclaration) || (d as ts.FunctionLikeDeclaration).asteriskToken || ts.isConstructorDeclaration(d)) return false;
      type = this.checker.getSignatureFromDeclaration(d as ts.SignatureDeclaration)?.getReturnType();
    }
    if (!type || isGeneric(type)) return false;
    const parts = (type.isUnion() ? type.types : [type]).filter((x) => !(x.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined | ts.TypeFlags.Void)));
    // A function type is called as its native closure is; an object of a type parameter's or mapped type has no one form.
    const object = (x: ts.Type) => objects && !!(x.flags & ts.TypeFlags.Object) && !x.getCallSignatures().length && !((x as ts.ObjectType).objectFlags & ts.ObjectFlags.Mapped);
    const kind = (x: ts.Type) => (x.flags & ts.TypeFlags.StringLike ? 's' : x.flags & ts.TypeFlags.NumberLike ? 'n' : x.flags & ts.TypeFlags.BooleanLike ? 'b' : object(x) ? 'o' : null);
    return parts.length > 0 && parts.every((x) => kind(x) && kind(x) === kind(parts[0]));
  }

  /** A class of the program's own whose members only the program reads: undecorated, extending no declaration file's class. */
  private ownClass(cls: ts.Node): boolean {
    if (!ts.isClassLike(cls) || ts.getDecorators(cls)?.length) return false;
    for (let t = this.checker.getTypeAtLocation(cls.name ?? cls), depth = 0; depth < 32; depth++) {
      const base = t.isClassOrInterface() ? this.checker.getBaseTypes(t)[0] : undefined;
      const d = base?.getSymbol()?.declarations?.[0];
      if (!base || !d) return true;
      if (d.getSourceFile().isDeclarationFile || this.packaged(d)) return false;
      t = base;
    }
    return false;
  }

  /** A function whose parameters and result no declaration outside the program's own groups shares. */
  private ownFunction(fn: ts.Node): boolean {
    if (ts.isFunctionDeclaration(fn) || ts.isArrowFunction(fn) || ts.isFunctionExpression(fn) || ts.isFunctionTypeNode(fn) || ts.isCallSignatureDeclaration(fn)) return !(ts.canHaveDecorators(fn) && ts.getDecorators(fn)?.length);
    if (ts.isMethodDeclaration(fn)) return ts.isClassLike(fn.parent) && this.backend.ownSignature(fn) && !ts.getDecorators(fn)?.length && !ts.getDecorators(fn.parent)?.length;
    return false;
  }

  /**
   * A parameter of the app's own code: a library's and a plugin's are entry points, decided with the kit's surface. Lenient
   * files are plugin files, so the answer doesn't depend on the file being emitted.
   */
  private appParameter(p: ts.ParameterDeclaration): boolean {
    return !this.backend.library && !p.getSourceFile().isDeclarationFile && !this.plugin(p);
  }

  /**
   * A parameter whose group's form is its own to decide. One typed by a type parameter holds what each instantiation
   * admits (§2.3b M5), which its native type parameter does as well; one sharing a fixed point's form (a callback
   * parameter of a kit or platform function type) is spelled as that declaration is, and a parameter property as its
   * field is. A foreign form is held untyped by other rules.
   */
  private ownForm(p: ts.ParameterDeclaration): boolean {
    if (ts.isParameterPropertyDeclaration(p, p.parent)) return false;
    return !this.forms().declaredForm(p).foreign && !isGeneric(this.checker.getTypeAtLocation(p.name)) && !this.forms().fixedSlot(p);
  }

  /** A parameter whose form holds null or undefined where its declared type admits neither. */
  private givenEmpty(p: ts.ParameterDeclaration): boolean {
    const declared = this.forms().declaredForm(p), form = this.forms().formOfSlot(p);
    return (form.null && !declared.null) || (form.undefined && !declared.undefined);
  }
}

/**
 * A name read at `at` that a guard has made truthy: `at` is inside the true branch of `if (x)` / `x && …` / `x ? … :`, or
 * follows `if (!x) <ends>` in a block on the way out. Only for a name nothing assigns after its declaration.
 */
function truthyAt(e: ts.Expression, at: ts.Node, checker: ts.TypeChecker): boolean {
  e = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
  if (!ts.isIdentifier(e)) return false;
  const sym = checker.getSymbolAtLocation(e), d = sym?.valueDeclaration;
  if (!sym || !d || (!ts.isVariableDeclaration(d) && !ts.isParameter(d)) || (ts.isVariableDeclaration(d) ? reassigned(d, checker) : assignedParameter(d, checker))) return false;
  const names = (x: ts.Expression) => ts.isIdentifier(x = ts.skipOuterExpressions(x, ts.OuterExpressionKinds.Parentheses)) && checker.getSymbolAtLocation(x) === sym;
  const negated = (x: ts.Expression) => (x = ts.skipOuterExpressions(x, ts.OuterExpressionKinds.Parentheses), ts.isPrefixUnaryExpression(x) && x.operator === ts.SyntaxKind.ExclamationToken && names(x.operand));
  for (let n: ts.Node = at; n.parent && !ts.isFunctionLike(n); n = n.parent) {
    const p = n.parent;
    if (ts.isIfStatement(p) && p.thenStatement === n && names(p.expression)) return true;
    if (ts.isIfStatement(p) && p.elseStatement === n && negated(p.expression)) return true;
    if (ts.isConditionalExpression(p) && p.whenTrue === n && names(p.condition)) return true;
    if (ts.isBlock(p) || ts.isSourceFile(p)) {
      for (const st of (p as ts.Block).statements) {
        if (st === n) break;
        if (ts.isIfStatement(st) && negated(st.expression) && alwaysEnds(st.thenStatement)) return true;
        // A member read of it that always runs first (`if (x.parent) …`, `x.load();`) has thrown had it been empty.
        const first = ts.isIfStatement(st) ? st.expression : ts.isExpressionStatement(st) ? st.expression : undefined;
        if (first && dereferences(first, names)) return true;
      }
    }
  }
  return false;
}

/** An expression whose evaluation starts by reading a member of a name `names` accepts (`x.a`, `x.a.b()`, `x.m()`), no `?.` on the way. */
function dereferences(e: ts.Expression, names: (x: ts.Expression) => boolean): boolean {
  let x: ts.Expression = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
  for (;;) {
    if (ts.isPrefixUnaryExpression(x) && x.operator === ts.SyntaxKind.ExclamationToken) x = ts.skipOuterExpressions(x.operand, ts.OuterExpressionKinds.Parentheses);
    else if (ts.isCallExpression(x) && !x.questionDotToken) x = x.expression;
    else if ((ts.isPropertyAccessExpression(x) || ts.isElementAccessExpression(x)) && !x.questionDotToken) {
      if (names(x.expression)) return true;
      x = x.expression;
    } else return false;
  }
}

function assignedParameter(p: ts.ParameterDeclaration, checker: ts.TypeChecker): boolean {
  const sym = ts.isIdentifier(p.name) ? checker.getSymbolAtLocation(p.name) : undefined;
  if (!sym) return true;
  const visit = (n: ts.Node): boolean => (ts.isBinaryExpression(n) && n.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && n.operatorToken.kind <= ts.SyntaxKind.LastAssignment
    && ts.isIdentifier(ts.skipOuterExpressions(n.left)) && checker.getSymbolAtLocation(ts.skipOuterExpressions(n.left)) === sym) || !!ts.forEachChild(n, visit);
  return visit(p.parent);
}

/**
 * A read JavaScript converts where it stands (an operand of arithmetic, `+` or a comparison, a template's part, `String(x)`,
 * `Number(x)`): undefined becomes NaN or "undefined" there. Anywhere else the value is placed as it is.
 */
export function convertedRead(e: ts.Expression): boolean {
  let x: ts.Node = e;
  while (ts.isParenthesizedExpression(x.parent)) x = x.parent;
  const p = x.parent, K = ts.SyntaxKind;
  if (ts.isTemplateSpan(p)) return true;
  if (ts.isPrefixUnaryExpression(p)) return [K.PlusToken, K.MinusToken, K.TildeToken].includes(p.operator);
  if (ts.isBinaryExpression(p)) {
    const op = p.operatorToken.kind;
    if ([K.PlusEqualsToken, K.MinusEqualsToken, K.AsteriskEqualsToken, K.SlashEqualsToken].includes(op)) return p.right === x;
    return [K.PlusToken, K.MinusToken, K.AsteriskToken, K.SlashToken, K.PercentToken, K.AsteriskAsteriskToken, K.LessThanToken, K.GreaterThanToken, K.LessThanEqualsToken, K.GreaterThanEqualsToken].includes(op);
  }
  return ts.isCallExpression(p) && p.arguments[0] === x && ts.isIdentifier(p.expression) && ['String', 'Number'].includes(p.expression.text);
}

/** A type naming a type parameter anywhere in it (`T`, `T[]`, `Map<string, T>`): what it holds is each instantiation's (§2.3b M5). */
function mentionsTypeParameter(checker: ts.TypeChecker, t: ts.Type, depth = 0): boolean {
  if (depth > 4) return false;
  if (t.flags & ts.TypeFlags.TypeParameter) return !(t as { isThisType?: boolean }).isThisType;
  if (t.isUnionOrIntersection()) return t.types.some((u) => mentionsTypeParameter(checker, u, depth + 1));
  return !!(t.flags & ts.TypeFlags.Object) && !!((t as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference) && checker.getTypeArguments(t as ts.TypeReference).some((a) => mentionsTypeParameter(checker, a, depth + 1));
}

/** A member read that is written: an assignment's target, an update's operand, a `delete`'s. */
function assigned(n: ts.Node): boolean {
  let x = n;
  while (ts.isParenthesizedExpression(x.parent)) x = x.parent;
  const p = x.parent;
  if (ts.isBinaryExpression(p)) return p.left === x && p.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && p.operatorToken.kind <= ts.SyntaxKind.LastAssignment;
  return ts.isPrefixUnaryExpression(p) || ts.isPostfixUnaryExpression(p) ? [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(p.operator) : ts.isDeleteExpression(p);
}

/** The same reference read twice: a name of one symbol, `this`, or a member of the same name of the same reference. */
function sameReference(a: ts.Expression, b: ts.Expression, checker: ts.TypeChecker): boolean {
  const x = ts.skipOuterExpressions(a, ts.OuterExpressionKinds.Parentheses), y = ts.skipOuterExpressions(b, ts.OuterExpressionKinds.Parentheses);
  if (x.kind === ts.SyntaxKind.ThisKeyword) return y.kind === ts.SyntaxKind.ThisKeyword;
  if (ts.isIdentifier(x)) return ts.isIdentifier(y) && x.text === y.text && checker.getSymbolAtLocation(x) === checker.getSymbolAtLocation(y);
  return ts.isPropertyAccessExpression(x) && ts.isPropertyAccessExpression(y) && !x.questionDotToken && x.name.text === y.name.text && sameReference(x.expression, y.expression, checker);
}

function isWriteTarget(e: ts.Node): boolean {
  let x = e;
  while (ts.isParenthesizedExpression(x.parent)) x = x.parent;
  const p = x.parent;
  if (ts.isBinaryExpression(p) && p.left === x && p.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && p.operatorToken.kind <= ts.SyntaxKind.LastAssignment) return true;
  return (ts.isPrefixUnaryExpression(p) || ts.isPostfixUnaryExpression(p)) && (p.operator === ts.SyntaxKind.PlusPlusToken || p.operator === ts.SyntaxKind.MinusMinusToken);
}

/** A field: a class's own (not static), an interface's or type literal's, or a parameter property. */
function fieldLike(d: ts.Declaration): boolean {
  if (ts.isPropertyDeclaration(d)) return ts.isIdentifier(d.name) && !isStatic(d) && ts.isClassLike(d.parent);
  if (ts.isPropertySignature(d)) return ts.isIdentifier(d.name) && (ts.isInterfaceDeclaration(d.parent) || ts.isTypeLiteralNode(d.parent));
  return ts.isParameter(d) && ts.isIdentifier(d.name) && ts.isParameterPropertyDeclaration(d, d.parent);
}
