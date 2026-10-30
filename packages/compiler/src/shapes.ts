import ts from 'typescript';
import type { Form } from './forms.ts';
import { alwaysThrows, containsThis, hasStatic, jsKeyOrder, literalKey } from './lang.ts';
import type { ValueStates } from './value-states.ts';

// One key plan per object shape (review/DESIGN-VALUE-MODEL.md §2.5): which keys an object of a class or an object
// literal has, in the order JavaScript makes them, and in which state each is. Backends spell a plan; they decide none
// of it (review/S4-S5-PLAN.md §2).

/** One key of a shape. */
export interface KeyState {
  /** The JavaScript key. */
  name: string;
  /** What its value may hold. Null for a method, an accessor, or a spread key no slot of the program declares. */
  form: Form | null;
  /**
   * When it is a key: `always` from its class's level of the constructor on (or as the literal is made); `sure` once
   * the constructor's walk has written it, or a field core holds (`ShapeFacts.kitHeld`); `written` at its first write;
   * `maybe` a key only if a spread object has it.
   */
  presence: 'always' | 'sure' | 'written' | 'maybe';
  /** Some code deletes it (`delete o.f`), which may end the key whatever its presence. */
  deleted: boolean;
  /**
   * `noted`: its nil may be null, which the shape notes beside it (`jsNulls`). `nil`: its nil is null (strict code's
   * `T | null` field that starts with a value). `noted+nil`: both, where each renderer keeps its own order of the two.
   * `nullish` is S4-2's Q2 (b), unused.
   */
  nulls: Nulls;
  /** A descriptor `Object.defineProperty` may give it (S4-5). */
  defined?: 'accessor' | 'readonly' | 'hidden' | 'fixed' | 'any';
  accessor?: { get: boolean; set: boolean };
}

export type Nulls = 'none' | 'noted' | 'nil' | 'noted+nil' | 'nullish';

/** The shape notes the key's null beside it (`jsNulls`). */
export const notesNull = (n: Nulls | undefined): boolean => n === 'noted' || n === 'noted+nil';
/** The key's nil reads as null. */
export const nilIsNull = (n: Nulls | undefined): boolean => n === 'nil' || n === 'noted+nil';

export interface ShapePlan {
  kind: 'class' | 'literal' | 'interface';
  /**
   * A class's keys are rendered from the plan. An unkeyed class's plan holds its declared fields for their null state
   * only: its presence, order and flags mean nothing, and no key reader may see it.
   */
  keyed: boolean;
  /** In the order JavaScript makes them: the constructor's walk for a class; spreads' keys, then new ones, for a literal. */
  keys: KeyState[];
  /** A class's program bases. */
  depth: number;
  /** The plan of the class's program root, when it isn't the class. */
  root?: ShapePlan;
  /**
   * Its hierarchy's keys may be made out of the plans' order (a flagged key, or a subclass's keys beside the root's
   * expando): the root keeps the order once that happens.
   */
  ordered: boolean;
  /** A subclass level's keys wait for its base's constructor (`jsLevel`). */
  gated: boolean;
  /** What tells that a key made now must be noted: an order or expando keys (`keys`), or an order alone (`order`). */
  noted: 'keys' | 'order' | null;
  /** Keeps keys script adds (its program root's expando). */
  expando: boolean;
  /** A literal's spread object holds its keys in an order known only as it runs. */
  spread: boolean;
  /** The constructor's writes the walk predicts. */
  walked: Map<ts.Node, { field: string; first: boolean }>;
  /**
   * The keys an object tracks with a flag of its own (`__has_`): made at their first write, or deleted. Written fields
   * first, then deleted ones, each in declared order, which is the order the flags are declared in.
   */
  flagged: ReadonlySet<string>;
  /** Every declared field's null state by name, keys or not: a static or `declare` field is no key but may be noted. */
  fieldNulls: ReadonlyMap<string, Nulls>;
  /** The class declares its objects' `jsNulls`: it notes a field and no program base does (one `jsNulls` per object). */
  declaresNulls: boolean;
}

/** What a class's plan asks its backend: how it writes a class, which its own tables know. */
export interface ShapeFacts {
  /** Fields are defined as the class starts (`useDefineForClassFields`), not assigned. */
  readonly defines: boolean;
  /** The class is written with its members by name: no component, mixin target or service only the injector makes. */
  byName(cls: ts.ClassDeclaration): boolean;
  /** The class's base, outside the program, is a class of core's kit and no error. */
  kitBased(cls: ts.ClassDeclaration): boolean;
  /** A field core's property or the kit's class holds. */
  kitHeld(cls: ts.ClassLikeDeclaration, m: ts.PropertyDeclaration): boolean;
  /** The class keeps what script adds to its objects (`JSExpando`). */
  expando(cls: ts.ClassLikeDeclaration): boolean;
}

interface ClassKeysOf { keys: KeyState[]; depth: number; walked: ShapePlan['walked']; flagged: ShapePlan['flagged'] }

const plans = new WeakMap<ValueStates, Map<ts.ClassLikeDeclaration, ShapePlan | null>>();
const ownKeys = new WeakMap<ValueStates, Map<ts.ClassLikeDeclaration, ClassKeysOf | null>>();
const hierarchies = new WeakMap<ValueStates, Map<ts.ClassLikeDeclaration, Pick<ShapePlan, 'ordered' | 'gated' | 'noted' | 'expando'>>>();
const deletions = new WeakMap<ValueStates, Set<ts.Declaration>>();
const classLists = new WeakMap<ValueStates, ts.ClassLikeDeclaration[]>();
const literalPlans = new WeakMap<ValueStates, Map<ts.ObjectLiteralExpression, ShapePlan>>();

/**
 * An app class's plan, or null for library, lenient or plugin code and declarations. A class not written by name gets
 * an unkeyed plan (`keyed: false`): its keys are its declared fields, as the backend lists them.
 */
export function shapePlanOfClass(cls: ts.ClassLikeDeclaration, states: ValueStates, facts: ShapeFacts): ShapePlan | null {
  let cache = plans.get(states);
  if (!cache) plans.set(states, (cache = new Map()));
  if (cache.has(cls)) return cache.get(cls)!;
  const b = states.backend, file = cls.getSourceFile();
  if (b.lenient || b.library || file.isDeclarationFile || b.pluginFiles.has(file.fileName)) { cache.set(cls, null); return null; }
  const own = classKeysOf(cls, states, facts);
  const root = rootOf(cls, states);
  const nulls = { fieldNulls: classNulls(cls, states), declaresNulls: declaresNulls(cls, states) };
  const plan: ShapePlan = own
    ? { kind: 'class', keyed: true, ...own, ...shapeHierarchy(root, states, facts), spread: false, ...nulls, ...(root !== cls ? { root: shapePlanOfClass(root, states, facts) ?? undefined } : {}) }
    : { kind: 'class', keyed: false, keys: unkeyedFields(cls, states, nulls.fieldNulls), depth: 0, ordered: false, gated: false, noted: null, expando: false, spread: false, walked: new Map(), flagged: new Set(), ...nulls };
  cache.set(cls, plan);
  return plan;
}

/** An unkeyed class's declared fields: parameter properties, then instance fields, in declared order. */
function unkeyedFields(cls: ts.ClassLikeDeclaration, states: ValueStates, nulls: ReadonlyMap<string, Nulls>): KeyState[] {
  const ctor = cls.members.find(ts.isConstructorDeclaration);
  const decls = [...(ctor?.parameters.filter((p) => ts.isParameterPropertyDeclaration(p, ctor)) ?? []), ...cls.members.filter((m): m is ts.PropertyDeclaration => ts.isPropertyDeclaration(m) && !hasStatic(m))];
  const forms = states.forms();
  return decls.flatMap((d): KeyState[] => (ts.isIdentifier(d.name) ? [{ name: d.name.text, form: forms.formOfSlot(d), presence: 'always', deleted: false, nulls: nulls.get(d.name.text) ?? 'none' }] : []));
}

const nullTables = new WeakMap<ValueStates, Map<ts.ClassLikeDeclaration, ReadonlyMap<string, Nulls>>>();

/** A class's fields' null states: `ValueStates.nullFields` noted, `nullFieldsTyped` nil. */
function classNulls(cls: ts.ClassLikeDeclaration, states: ValueStates): ReadonlyMap<string, Nulls> {
  let cache = nullTables.get(states);
  if (!cache) nullTables.set(states, (cache = new Map()));
  const known = cache.get(cls);
  if (known) return known;
  const out = new Map<string, Nulls>();
  const noted = states.nullFields(cls), nil = states.nullFieldsTyped(cls);
  for (const n of noted) out.set(n, nil.has(n) ? 'noted+nil' : 'noted');
  for (const n of nil) if (!noted.has(n)) out.set(n, 'nil');
  cache.set(cls, out);
  return out;
}

function declaresNulls(cls: ts.ClassLikeDeclaration, states: ValueStates): boolean {
  const b = states.backend;
  if (!states.nullFields(cls).size) return false;
  for (let base = b.programBase(cls); base; base = b.programBase(base)) if (states.nullFields(base).size) return false;
  return true;
}

/**
 * A read or write of a field its class's plan notes the null of. It reads the table the plan takes its null states
 * from, without making the plan: a read site may come before the backend tables a key plan asks (`ShapeFacts`) are full.
 */
export function notedField(states: ValueStates, e: ts.Expression): e is ts.PropertyAccessExpression {
  if (!ts.isPropertyAccessExpression(e) || e.questionDotToken || e.expression.kind === ts.SyntaxKind.SuperKeyword) return false;
  const d = states.backend.checker.getSymbolAtLocation(e.name)?.valueDeclaration;
  const cls = d && (ts.isPropertyDeclaration(d) ? d.parent : ts.isParameter(d) && ts.isParameterPropertyDeclaration(d, d.parent) ? d.parent.parent : null);
  return !!cls && ts.isClassLike(cls) && notesNull(classNulls(cls, states).get(e.name.text));
}

/** The names of a plan's fields whose null state passes `test`. */
export function nullNames(plan: ShapePlan | null, test: (n: Nulls) => boolean): Set<string> {
  return new Set(plan ? [...plan.fieldNulls].filter(([, n]) => test(n)).map(([name]) => name) : []);
}

/** A key of a plan, by name. */
export function keyOf(plan: ShapePlan, name: string): KeyState | undefined {
  return plan.keys.find((k) => k.name === name);
}

/** The classes and hierarchy roots whose plans have been asked for (the shadow's records). */
export function plannedClasses(states: ValueStates): { classes: ts.ClassLikeDeclaration[]; roots: ts.ClassLikeDeclaration[] } {
  return { classes: [...ownKeys.get(states)?.keys() ?? []], roots: [...hierarchies.get(states)?.keys() ?? []] };
}

/** A class the class path writes with its members by name, its hierarchy rooted in none but core's: no error, component, service, mixin or native subclass. */
export function keyedClass(cls: ts.ClassLikeDeclaration, states: ValueStates, facts: ShapeFacts): boolean {
  const b = states.backend;
  for (let c: ts.ClassLikeDeclaration | undefined = cls; c; c = b.programBase(c)) {
    if (!ts.isClassDeclaration(c) || !c.name || !facts.byName(c)) return false;
    if (extendsAny(c) && !b.programBase(c) && !facts.kitBased(c)) return false;
  }
  return true;
}

/** Whether the program class at the root of the class's program hierarchy keeps what script adds to its objects. */
export function rootKeepsExpando(cls: ts.ClassLikeDeclaration, states: ValueStates, facts: ShapeFacts): boolean {
  if (states.backend.library) return false;
  const root = rootOf(cls, states);
  return !extendsAny(root) && facts.expando(root);
}

const extendsAny = (c: ts.ClassLikeDeclaration) => !!c.heritageClauses?.some((h) => h.token === ts.SyntaxKind.ExtendsKeyword);

function classKeysOf(cls: ts.ClassLikeDeclaration, states: ValueStates, facts: ShapeFacts): ClassKeysOf | null {
  let cache = ownKeys.get(states);
  if (!cache) ownKeys.set(states, (cache = new Map()));
  if (cache.has(cls)) return cache.get(cls)!;
  cache.set(cls, null);
  const b = states.backend, file = cls.getSourceFile();
  if (b.lenient || b.library || file.isDeclarationFile || b.pluginFiles.has(file.fileName) || !keyedClass(cls, states, facts)) return null;
  const plan = classKeyPlan(cls, facts.defines);
  const ctor = cls.members.find(ts.isConstructorDeclaration);
  const decls = new Map<string, ts.PropertyDeclaration | ts.ParameterDeclaration>();
  for (const p of ctor?.parameters ?? []) if (ts.isParameterPropertyDeclaration(p, ctor!) && ts.isIdentifier(p.name)) decls.set(p.name.text, p);
  for (const m of cls.members) if (ts.isPropertyDeclaration(m) && ts.isIdentifier(m.name) && !hasStatic(m) && !decls.has(m.name.text)) decls.set(m.name.text, m);
  const nulls = classNulls(cls, states);
  const deleted = deletedFields(states);
  const forms = states.forms();
  // `kitHeld` spells field types on the way: it is asked only of the fields that may be flagged.
  const held = new Map(plan.written.map((m) => [m, facts.kitHeld(cls, m)]));
  const kitHeld = (d: ts.PropertyDeclaration) => held.get(d) ?? facts.kitHeld(cls, d);
  const keys = plan.order.map((name): KeyState => {
    const d = decls.get(name)!;
    const form = forms.formOfSlot(d);
    // A field core holds is listed where the walk would have it written, never flagged.
    const presence = plan.always.has(name) ? 'always' : plan.sure.has(name) || held.get(d as ts.PropertyDeclaration) ? 'sure' : 'written';
    const deletes = ts.isPropertyDeclaration(d) && deleted.has(d) && form.undefined && !kitHeld(d);
    return { name, form, presence, deleted: deletes, nulls: nulls.get(name) ?? 'none' };
  });
  const flags = (n: string) => keys.some((k) => k.name === n && (k.presence === 'written' || k.deleted));
  const flagged = new Set([...plan.written.map((m) => m.name.getText()), ...cls.members.flatMap((m) => (ts.isPropertyDeclaration(m) && ts.isIdentifier(m.name) ? [m.name.text] : []))].filter(flags));
  let depth = 0;
  for (let x = b.programBase(cls); x; x = b.programBase(x)) depth++;
  const own = { keys, depth, walked: plan.walked, flagged };
  cache.set(cls, own);
  return own;
}

/** The key state a class hierarchy shares, kept by its program root: from the plans of its classes that have one. */
export function shapeHierarchy(root: ts.ClassLikeDeclaration, states: ValueStates, facts: ShapeFacts): Pick<ShapePlan, 'ordered' | 'gated' | 'noted' | 'expando'> {
  let cache = hierarchies.get(states);
  if (!cache) hierarchies.set(states, (cache = new Map()));
  const known = cache.get(root);
  if (known) return known;
  const members = [root, ...classesOf(states).filter((c) => c !== root && rootOf(c, states) === root)].flatMap((c) => classKeysOf(c, states, facts) ?? []);
  const expando = !!classKeysOf(root, states, facts) && rootKeepsExpando(root, states, facts);
  const ordered = members.some((m) => m.flagged.size > 0 || (expando && m.depth > 0 && m.keys.length > 0));
  const gated = ordered && members.some((m) => m.depth > 0 && m.keys.some((k) => k.presence !== 'written'));
  const h = { ordered, gated, expando: ordered && expando, noted: ordered ? (expando ? 'keys' as const : 'order' as const) : null };
  cache.set(root, h);
  return h;
}

function rootOf(cls: ts.ClassLikeDeclaration, states: ValueStates): ts.ClassLikeDeclaration {
  let r = cls;
  for (let b = states.backend.programBase(r); b; b = states.backend.programBase(b)) r = b;
  return r;
}

function classesOf(states: ValueStates): ts.ClassLikeDeclaration[] {
  let list = classLists.get(states);
  if (list) return list;
  classLists.set(states, (list = []));
  const visit = (n: ts.Node) => { if (ts.isClassLike(n)) list!.push(n); ts.forEachChild(n, visit); };
  for (const f of states.backend.sourceFiles) if (!f.isDeclarationFile) visit(f);
  return list;
}

/** The fields some code deletes (`delete o.field`). */
export function deletedFields(states: ValueStates): Set<ts.Declaration> {
  let out = deletions.get(states);
  if (out) return out;
  deletions.set(states, (out = new Set()));
  const checker = states.backend.checker;
  const visit = (n: ts.Node): void => {
    if (ts.isDeleteExpression(n) && ts.isPropertyAccessExpression(n.expression)) {
      const d = checker.getSymbolAtLocation(n.expression.name)?.valueDeclaration;
      if (d) out!.add(d);
    }
    ts.forEachChild(n, visit);
  };
  for (const f of states.backend.sourceFiles) if (!f.isDeclarationFile) visit(f);
  return out;
}

/**
 * An object literal's key plan: its keys in the order JavaScript makes them (a spread's keys, then new ones; an
 * overwritten key keeps its place and takes the later value), each in the state its value's form gives.
 */
export function shapePlanOfLiteral(e: ts.ObjectLiteralExpression, states: ValueStates): ShapePlan {
  let byLiteral = literalPlans.get(states);
  if (!byLiteral) literalPlans.set(states, (byLiteral = new Map()));
  let plan = byLiteral.get(e);
  if (!plan) byLiteral.set(e, (plan = literalPlan(e, states)));
  return plan;
}

function literalPlan(e: ts.ObjectLiteralExpression, states: ValueStates): ShapePlan {
  const checker = states.backend.checker, forms = states.forms();
  const keys = new Map<string, KeyState>();
  const nulls = (form: Form | null): Nulls => (form && (form.null || form.foreign) ? 'noted' : 'none');
  const put = (k: KeyState) => {
    const before = keys.get(k.name);
    // A spread object may lack an optional key, which leaves the earlier value.
    keys.set(k.name, before && k.presence === 'maybe' ? { ...k, presence: before.presence } : k);
  };
  let spread = false;
  for (const p of e.properties) {
    if (ts.isSpreadAssignment(p)) {
      spread = true;
      for (const s of checker.getTypeAtLocation(p.expression).getProperties()) {
        const form = s.valueDeclaration ? forms.formOfSlot(s.valueDeclaration) : null;
        put({ name: s.name, form, presence: s.flags & ts.SymbolFlags.Optional ? 'maybe' : 'always', deleted: false, nulls: nulls(form) });
      }
      continue;
    }
    if (!p.name) continue;
    const name = literalKey(p.name, checker) ?? p.name.getText();
    const form = ts.isPropertyAssignment(p) ? forms.formOf(p.initializer) : ts.isShorthandPropertyAssignment(p) ? forms.formOf(p.name) : null;
    const accessor = ts.isGetAccessorDeclaration(p) || ts.isSetAccessorDeclaration(p)
      ? { get: ts.isGetAccessorDeclaration(p) || !!keys.get(name)?.accessor?.get, set: ts.isSetAccessorDeclaration(p) || !!keys.get(name)?.accessor?.set } : undefined;
    put({ name, form, presence: 'always', deleted: false, nulls: nulls(form), ...(accessor ? { accessor } : {}) });
  }
  const order = jsKeyOrder([...keys.keys()]);
  return { kind: 'literal', keyed: true, keys: order.map((n) => keys.get(n)!), depth: 0, ordered: false, gated: false, noted: null, expando: false, spread, walked: new Map(), flagged: new Set(), fieldNulls: new Map(), declaresNulls: false };
}

/**
 * A class's own instance keys and the order its constructor makes them (Node's, for one level of a hierarchy: a subclass's
 * keys follow everything its base's constructor made).
 * - `always`: keys once the class's level of the constructor starts: parameter properties and initialized fields, or every
 *   declared field where the app's configuration defines class fields (`useDefineForClassFields`).
 * - `sure`: fields without an initializer the constructor assigns on every path before anything else can run (`walked`).
 * - `written`: the others, each a key at its first write, undefined too.
 * - `order`: `always` (parameter properties first), then the fields in the order the walk first writes them, then the rest
 *   as declared. A key made out of this order (a `written` field's first write anywhere but `walked`) is noted as it runs.
 * - `walked`: the constructor's `this.f = v` writes up to the first statement that could run other code with `this` (a base
 *   class's constructor may have let `this` out, so there any call ends the walk too); `first`: the path's first write of `f`.
 */
export interface ClassKeyPlan { order: string[]; always: Set<string>; sure: Set<string>; written: ts.PropertyDeclaration[]; walked: Map<ts.Node, { field: string; first: boolean }> }

export function classKeyPlan(cls: ts.ClassLikeDeclaration, defines: boolean): ClassKeyPlan {
  const always = new Set<string>(), written: ts.PropertyDeclaration[] = [], order: string[] = [];
  const sure = new Set<string>(), walked = new Map<ts.Node, { field: string; first: boolean }>();
  const ctor = cls.members.find((m): m is ts.ConstructorDeclaration => ts.isConstructorDeclaration(m) && !!m.body);
  for (const p of ctor?.parameters ?? []) if (ts.isParameterPropertyDeclaration(p, ctor!) && ts.isIdentifier(p.name)) { always.add(p.name.text); order.push(p.name.text); }
  const fields = new Map<string, ts.PropertyDeclaration>();
  for (const m of cls.members) {
    if (!ts.isPropertyDeclaration(m) || hasStatic(m) || !ts.isIdentifier(m.name)) continue;
    if (ts.getModifiers(m)?.some((x) => x.kind === ts.SyntaxKind.DeclareKeyword || x.kind === ts.SyntaxKind.AbstractKeyword)) continue;
    if (always.has(m.name.text)) continue;
    if (defines || m.initializer) { always.add(m.name.text); order.push(m.name.text); }
    else fields.set(m.name.text, m);
  }
  const based = !!cls.heritageClauses?.some((h) => h.token === ts.SyntaxKind.ExtendsKeyword);
  const stmts = ctor ? [...ctor.body!.statements] : [];
  const superAt = stmts.findIndex((s) => ts.isExpressionStatement(s) && ts.isCallExpression(s.expression) && s.expression.expression.kind === ts.SyntaxKind.SuperKeyword);
  // A field holding a function that uses `this` (`onTap = () => this.x = 1`) lets it out when read; any other initializer
  // using it lets it out at once.
  const holdsThis = new Set<string>();
  let initializerEscapes = false;
  for (const m of cls.members) {
    if (!ts.isPropertyDeclaration(m) || hasStatic(m) || !m.initializer) continue;
    const init = ts.skipOuterExpressions(m.initializer);
    if ((ts.isArrowFunction(init) || ts.isFunctionExpression(init)) && ts.isIdentifier(m.name) && !(based && runsCode(init))) { if (containsThis(init) || ts.isFunctionExpression(init)) holdsThis.add(m.name.text); }
    else if (containsThis(m.initializer) || (based && runsCode(m.initializer))) initializerEscapes = true;
  }
  if (fields.size && ctor && (!based || superAt >= 0) && !initializerEscapes) {
    const plain = new Set<string>();
    for (const m of cls.members) if (ts.isPropertyDeclaration(m) && !hasStatic(m) && ts.isIdentifier(m.name)) plain.add(m.name.text);
    for (const p of ctor.parameters) if (ts.isIdentifier(p.name) && ts.getModifiers(p)?.length) plain.add(p.name.text);
    const isThis = (n: ts.Node) => n.kind === ts.SyntaxKind.ThisKeyword;
    // Whether `n` may make a key: `this` used other than to read a field or write one that is a key already, or (below a
    // base) any call.
    const escapes = (n: ts.Node): boolean => {
      let escaped = false;
      const visit = (x: ts.Node) => {
        if (escaped) return;
        if (ts.isFunctionLike(x) || ts.isClassLike(x)) { if (containsThis(x)) escaped = true; return; }
        if (based && runsCode(x, false)) { escaped = true; return; }
        if (ts.isPropertyAccessExpression(x) && isThis(x.expression)) {
          const p = ts.walkUpParenthesizedExpressions(x.parent);
          const written = (ts.isBinaryExpression(p) && p.left === ts.skipOuterExpressions(x) && p.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && p.operatorToken.kind <= ts.SyntaxKind.LastAssignment)
            || ts.isPrefixUnaryExpression(p) || ts.isPostfixUnaryExpression(p) || ts.isDeleteExpression(p);
          if (!ts.isIdentifier(x.name) || !plain.has(x.name.text) || holdsThis.has(x.name.text) || (ts.isCallExpression(p) && p.expression === x) || (written && fields.has(x.name.text))) escaped = true;
          return;
        }
        if (isThis(x) || x.kind === ts.SyntaxKind.SuperKeyword) { escaped = true; return; }
        ts.forEachChild(x, visit);
      };
      visit(n);
      return escaped;
    };
    type State = { assigned: Set<string>; firsts: string[]; done: boolean };
    const all = () => new Set(fields.keys());
    // Each path's first writes must run in `order`: a branch that writes them otherwise ends the walk before its `if`.
    const inOrder = (firsts: string[]) => firsts.every((f, k) => k === 0 || order.indexOf(firsts[k - 1]) < order.indexOf(f));
    const walk = (list: readonly ts.Statement[], s: State): State => {
      for (const st of list) {
        if (s.done) return s;
        if (ts.isExpressionStatement(st) && ts.isBinaryExpression(st.expression) && st.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
          const left = ts.skipOuterExpressions(st.expression.left);
          const f = ts.isPropertyAccessExpression(left) && isThis(left.expression) && ts.isIdentifier(left.name) && fields.has(left.name.text) ? left.name.text : null;
          if (f !== null) {
            if (escapes(st.expression.right)) return { ...s, done: true };
            const first = !s.assigned.has(f) && !s.firsts.includes(f);
            walked.set(st.expression, { field: f, first });
            if (!order.includes(f)) order.push(f);
            s = { assigned: new Set([...s.assigned, f]), firsts: first ? [...s.firsts, f] : s.firsts, done: false };
            continue;
          }
        }
        if (ts.isIfStatement(st)) {
          if (escapes(st.expression)) return { ...s, done: true };
          const before = { order: order.length, walked: new Map(walked) };
          const branch = (b: ts.Statement | undefined) => (b ? walk(ts.isBlock(b) ? b.statements : [b], { assigned: new Set(s.assigned), firsts: [...s.firsts], done: false }) : { assigned: new Set(s.assigned), firsts: [...s.firsts], done: false });
          const a = branch(st.thenStatement), b = branch(st.elseStatement);
          if (!inOrder(a.firsts) || !inOrder(b.firsts)) {
            order.length = before.order;
            walked.clear();
            for (const [n, w] of before.walked) walked.set(n, w);
            return { ...s, done: true };
          }
          const ends = (x: State, br: ts.Statement | undefined) => !!br && !x.done && alwaysThrows(br);
          const left = ends(a, st.thenStatement) ? all() : a.assigned, right = ends(b, st.elseStatement) ? all() : b.assigned;
          s = { assigned: new Set([...left].filter((f) => right.has(f))), firsts: [...a.firsts, ...b.firsts.filter((f) => !a.firsts.includes(f))].sort((x, y) => order.indexOf(x) - order.indexOf(y)), done: a.done || b.done };
          continue;
        }
        if (ts.isBlock(st)) { s = walk(st.statements, s); continue; }
        if (ts.isThrowStatement(st)) return { ...s, assigned: all(), done: true };
        // Any other statement that can't make a key or leave the constructor (a loop filling an array field) changes nothing.
        if (!escapes(st) && !mayLeave(st)) continue;
        return { ...s, done: true };
      }
      return s;
    };
    const end = walk(stmts.slice(superAt + 1), { assigned: new Set(), firsts: [], done: false });
    for (const f of end.assigned) if (fields.has(f)) sure.add(f);
  }
  for (const [name, m] of fields) {
    if (!order.includes(name)) order.push(name);
    if (!sure.has(name)) written.push(m);
  }
  return { order, always, sure, written, walked };
}

/** Whether a statement may end its function early (`return`, `throw`), outside the functions it declares. */
function mayLeave(st: ts.Statement): boolean {
  let found = false;
  const visit = (x: ts.Node) => {
    if (found || ts.isFunctionLike(x) || ts.isClassLike(x)) return;
    if (ts.isReturnStatement(x) || ts.isThrowStatement(x)) { found = true; return; }
    ts.forEachChild(x, visit);
  };
  visit(st);
  return found;
}

/** Whether evaluating `n` may run code beyond reading values: a call, `new`, a tagged template, `await`, `yield` or iteration. */
function runsCode(n: ts.Node, deep = true): boolean {
  const at = (x: ts.Node) => ts.isCallExpression(x) || ts.isNewExpression(x) || ts.isTaggedTemplateExpression(x) || ts.isAwaitExpression(x) || ts.isYieldExpression(x)
    || ts.isForOfStatement(x) || ts.isSpreadElement(x) || ts.isArrayBindingPattern(x);
  if (!deep) return at(n);
  let found = false;
  const visit = (x: ts.Node) => {
    if (found || ts.isFunctionLike(x) || ts.isClassLike(x)) return;
    if (at(x)) { found = true; return; }
    ts.forEachChild(x, visit);
  };
  visit(n);
  return found;
}
