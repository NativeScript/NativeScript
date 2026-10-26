import ts from 'typescript';
import { heldDowncasts, implementedInterfaceDeclarations, LooseSlots, nothingGiven, nullishSlots, nullSetFields, originOf, ownSlot, scriptCalledFunction, slotOf, slotType, type NullishSlots, type TrustScope } from './lang.ts';
import { Forms, representation } from './forms.ts';
import { isAsync, isStatic } from './throws.ts';
import { shadowForms } from './forms-shadow.ts';

// The null/undefined/missing deciders both translators ask: which empty states a value or slot may hold where its native
// form keeps only one. The rules are shared; a backend supplies its mode, how it spells types and how it emits a keyed
// read, and names in `rules` the few rules that still differ between the two.

/** What the shared deciders read from a translator. Members are read lazily: a translator sets its mode after construction. */
export interface StateBackend {
  readonly name: 'swift' | 'kotlin';
  readonly checker: ts.TypeChecker;
  readonly sourceFiles: readonly ts.SourceFile[];
  readonly pluginFiles: ReadonlySet<string>;
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
  /** `nullableEntry`'s emission once the shared gate passes. */
  nulledEntry(e: ts.Expression, code: () => string): string | null;
  /** The value read untyped, as `nullDistinct` reads it. */
  untypedCode(e: ts.Expression): string;
  /** The keyed field a member read whose type holds null and undefined is noted under (`jsNulls`), or null. */
  optionalShapeField(e: ts.PropertyAccessExpression): string | null;
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
  readonly checkedParameters?: { nullGiven(p: ts.ParameterDeclaration): boolean; truthTested(name: ts.Identifier): boolean; unsetElement(d: ts.Node): boolean };
}

/** Whether a type admits null but not undefined. */
export function onlyNull(t: ts.Type): boolean {
  const parts = t.isUnion() ? t.types : [t];
  return parts.some((x) => x.flags & ts.TypeFlags.Null) && !parts.some((x) => x.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void | ts.TypeFlags.Any | ts.TypeFlags.Unknown));
}

export class ValueStates {
  /** A non-strict app's variables given only a null result (`nullResult`) or a value: their empty value is null. The backends note them as they declare them. */
  readonly nullVars = new Set<ts.Symbol>();
  private nullishSlotSet?: NullishSlots;
  private nullishHeldSet = new Set<ts.Declaration>();
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
    const found: NullishSlots = b.lenient || b.library ? { held: new Set(), fields: new Set(), refused: [], functions: new Map() } : nullishSlots(b.checker, b.sourceFiles, (f) => b.pluginFiles.has(f.fileName));
    // An element or callback parameter today's analysis can't hold, which nothing tells null from undefined in: one nil,
    // read as undefined.
    found.refused = found.refused.filter(([, , cover]) => {
      if (!cover) return true;
      const form = cover.kind === 'element' ? this.forms().formOfSlot(cover.slot).element : this.forms().formOfSlot(cover.slot);
      return !form || !['present', 'undefined', 'null'].includes(representation(form));
    });
    // A function slot: `JSNullish` where null and undefined are told apart, else one nil read as undefined. One that may
    // hold another value too is refused where its own code compares it.
    for (const [d, what] of found.functions) {
      const shown = representation(this.forms().formOfSlot(d));
      if (shown === 'nullish') this.nullishHeldSet.add(d);
      else if (shown === 'foreign' && what) found.refused.push([d, what]);
    }
    return this.nullishSlotSet = found;
  }

  /** The program's value forms (review/DESIGN-VALUE-MODEL.md §2), built when first asked. */
  forms(): Forms {
    const b = this.backend;
    return this.formSet ??= new Forms(b.sourceFiles, b.checker, (f) => b.trust.strictFile(f), { library: !!b.library, native: (d) => b.trust.nativeDeclaration(d), nativeNil: (d) => !!b.native?.holdsNil?.(d) });
  }

  /**
   * A parameter or variable holding a function that may be null or undefined both, which the program tells apart: held
   * as `JSNullish<F>`, read as `F?` except where null and undefined are told apart or kept.
   */
  nullishHeld(d: ts.Node): d is ts.ParameterDeclaration | ts.VariableDeclaration {
    return this.nullish() && this.nullishHeldSet.has(d as ts.Declaration);
  }

  /** A read of a `nullishHeld` slot whose value may still be null or undefined: the slot's declaration. */
  nullishRead(e: ts.Expression): ts.ParameterDeclaration | ts.VariableDeclaration | null {
    const bare = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
    if (!ts.isIdentifier(bare) || this.backend.library || this.backend.lenient) return null;
    const d = this.checker.getSymbolAtLocation(bare)?.valueDeclaration;
    return d && this.nullishHeld(d) ? d : null;
  }

  heldCasts(): ReturnType<typeof heldDowncasts> {
    const b = this.backend;
    return this.downcastSet ??= heldDowncasts(b.checker, b.sourceFiles, (f) => b.pluginFiles.has(f.fileName), this.nullish().held);
  }

  /** A class a held downcast's value may be an object of: its members are read and its methods called by name. */
  downcastClass(cls: ts.ClassLikeDeclaration): boolean {
    return !this.backend.library && !this.backend.lenient && this.heldCasts().classes.has(cls);
  }

  /** A variable, parameter, or call result whose slot may hold null and undefined both: held untyped (`nullishSlots`). */
  heldNullish(n: ts.Node): boolean {
    // A conditional or a default giving a held value (`key in saved ? saved[key] : fallback`).
    if (ts.isParenthesizedExpression(n)) return this.heldNullish(n.expression);
    if (ts.isConditionalExpression(n)) return this.heldNullish(n.whenTrue) || this.heldNullish(n.whenFalse);
    if (ts.isBinaryExpression(n) && (n.operatorToken.kind === ts.SyntaxKind.BarBarToken || n.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)) return this.heldNullish(n.right);
    // A member of a held value, read by name: whatever the object it is has (`field.hint` of a SearchBar is undefined).
    if (ts.isPropertyAccessExpression(n) && !(ts.isCallExpression(n.parent) && n.parent.expression === n)) return this.heldNullish(n.expression);
    // A held variable's assertion (`const field = view as TextField`), or one read for a member in place: the value as it is, unchecked as script leaves it.
    if (ts.isAsExpression(n) || ts.isTypeAssertionExpression(n)) {
      const holder = ts.findAncestor(n.parent, (p) => !ts.isParenthesizedExpression(p));
      return (!!holder && ts.isVariableDeclaration(holder) && this.nullish().held.has(holder)) || (!this.backend.library && !this.backend.lenient && this.heldCasts().receivers.has(n));
    }
    if (ts.isCallExpression(n) || ts.isNewExpression(n)) {
      const d = this.checker.getResolvedSignature(n)?.getDeclaration();
      return !!d && !ts.isJSDocSignature(d) && this.nullish().held.has(d);
    }
    if (!ts.isIdentifier(n) || ts.isShorthandPropertyAssignment(n.parent)) return false;
    const d = this.checker.getSymbolAtLocation(n)?.valueDeclaration;
    return !!d && (ts.isVariableDeclaration(d) || ts.isParameter(d)) && this.nullish().held.has(d);
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
    if (ts.isPropertyAccessExpression(bare)) {
      const d = this.checker.getSymbolAtLocation(bare.name)?.valueDeclaration;
      if (d && ((ts.isPropertyDeclaration(d) && !d.initializer) || this.nullish().fields.has(d))) return false;
    }
    return true;
  }

  /** Strict code's value typed `T | undefined`, held as an optional: its empty value is undefined, never null. */
  nilIsUndefined(e: ts.Expression): boolean {
    const b = this.backend;
    if (b.lenient || b.library || b.lenientApp || this.plugin(e)) return false;
    const t = this.checker.getTypeAtLocation(e);
    const parts = t.isUnion() ? t.types : [t];
    return parts.some((x) => x.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void)) && !parts.some((x) => x.flags & (ts.TypeFlags.Null | ts.TypeFlags.Any | ts.TypeFlags.Unknown));
  }

  /**
   * An array element or map value of strict code's `T | null` values, or a field noted null, read untyped: missing is
   * undefined, an empty value held null. `code` builds the value's untyped translation; call it only when needed, since
   * building it changes how later reads compile.
   */
  nullableEntry(e: ts.Expression, code: () => string): string | null {
    if (this.backend.lenient || this.backend.library || this.plugin(e)) return null;
    return this.backend.nulledEntry(e, code);
  }

  /** A typed value whose untyped read tells null from undefined, where its optional alone does not. */
  nullDistinct(e: ts.Expression): boolean {
    return this.nilIsNull(e) || !!this.nullishRead(e) || !!this.nullableEntry(e, () => this.backend.untypedCode(e));
  }

  /** A member that may hold null or undefined both, by its type or as `nullishSlots` finds; written, one that may hold null. */
  nullishMember(e: ts.PropertyAccessExpression, write = false): boolean {
    if (e.questionDotToken || e.expression.kind === ts.SyntaxKind.SuperKeyword) return false;
    const d = this.checker.getSymbolAtLocation(e.name)?.valueDeclaration;
    if (d && ts.isPropertySignature(d) && this.nullish().fields.has(d)) return true;
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
    return !!d && ts.isPropertyDeclaration(d) && ts.isClassLike(d.parent) && this.nullFields(d.parent).has(e.name.text);
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

  /** A call of a non-strict app's own function whose result is optional and whose body gives only null where it gives nothing, awaited when async. */
  nullResult(e: ts.Expression): boolean {
    const b = this.backend, app = b.rules.appNullResults;
    if (app && (!b.lenientApp || b.library)) return false;
    const awaited = ts.isAwaitExpression(e);
    const call = awaited ? ts.skipOuterExpressions(e.expression) : e;
    if (!ts.isCallExpression(call)) return false;
    const d = this.checker.getResolvedSignature(call)?.getDeclaration();
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
    return this.looseSlotSet ??= new LooseSlots(b.sourceFiles, b.checker, (e) => b.unemitted(() => this.untrustedValue(e)), (d) => b.unemitted(() => this.holdsLoose(d)));
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
    if (b.library || !b.trust.strictFile(d.getSourceFile()) || !ownSlot(d, this.checker, this.implementedInterfaceSet ??= implementedInterfaceDeclarations(b.sourceFiles, this.checker))) return false;
    try {
      const st = slotType(d, this.checker);
      if (!st) return false;
      const t = b.type(st, d);
      return this.primitive(t) || b.looseObjectType(t);
    } catch { return false; }
  }

  /** A slot that holds undefined as it is: one an untrusted value is placed in. */
  takesUndefined(x: ts.Expression): boolean {
    if (this.backend.library) return false;
    const slot = slotOf(x, this.checker);
    if (!this.backend.rules.optionalParametersTakeUndefined) return !!slot && this.looseSlots.has(slot);
    return !!slot && !slot.getSourceFile().isDeclarationFile && (this.looseSlots.has(slot) || (ts.isParameter(slot) && !!slot.questionToken));
  }

  /** Strict code's declaration holding a string, number or boolean an untrusted value is placed in (see `looseSlots`). */
  looseDeclaration(n: ts.Node | undefined): boolean {
    const b = this.backend;
    if (b.library || !n) return false;
    let d: ts.Node | undefined = n;
    if (b.rules.looseReads) {
      const named = ts.isPropertyAccessExpression(n) ? n.name : ts.isPropertyDeclaration(n) || ts.isVariableDeclaration(n) || ts.isParameter(n) || ts.isPropertySignature(n) || ts.isBindingElement(n) ? n.name : n;
      if (!ts.isIdentifier(named) && !ts.isPrivateIdentifier(named)) return false;
      d = this.checker.getSymbolAtLocation(named)?.valueDeclaration;
      if (!d) return false;
    }
    return this.looseSlots.has(d as ts.Declaration) || (ts.isParameter(d) && this.scriptCalledParameter(d)) || !!b.rules.checkedParameters?.unsetElement(d);
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
   * A parameter whose native type takes an empty value its declared type leaves out. A plugin's code is checked without
   * strictNullChecks: callers pass null and undefined for an object parameter (core's `valueChanged(target, oldValue,
   * newValue)` starts from undefined; ui-drawer applies a closing drawer's data with no side).
   */
  mayBeNull(p: ts.ParameterDeclaration): boolean {
    const b = this.backend, checked = b.rules.checkedParameters;
    if (p.dotDotDotToken || !ts.isIdentifier(p.name)) return false;
    if (!checked) return (this.plugin(p) || b.lenientApp) && b.nullableParameter(b.typeOf(p.name));
    if (this.looseDeclaration(p)) return true;
    if (b.lenientApp && !b.library && checked.nullGiven(p)) return true;
    const t = b.typeOf(p.name);
    if (this.primitive(t) && this.undefinedParameter(p)) return true;
    // An app checked without strictNullChecks: a string parameter its function tests (`if (state)`) is one callers may leave out.
    if (b.lenientApp && !b.library && !p.getSourceFile().isDeclarationFile && t === 'String' && ts.isFunctionDeclaration(p.parent) && checked.truthTested(p.name)) return true;
    return this.plugin(p) && b.nullableParameter(t);
  }
}
