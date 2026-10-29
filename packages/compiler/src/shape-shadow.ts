import { appendFileSync } from 'node:fs';
import { relative } from 'node:path';
import ts from 'typescript';
import { type KeyState, type ShapeFacts, shapeHierarchy, shapePlanOfClass, shapePlanOfLiteral } from './shapes.ts';
import type { ValueStates } from './value-states.ts';

// Shadow mode (NS_SHAPE_SHADOW=<file>): each key decision a backend made (`classKeys`, `keyHierarchy`, an object
// literal's key notes in `object()`) against the key plan shapes.ts gives the same class or literal, one JSONL record
// per decision. It only observes: the plans, which ask the checker and the forms, are made once the process ends,
// after every translation has run.

/** What `object()` decided for a literal's keys, in its own variables. */
export interface LiteralKeys {
  /** The shape's fields, spelled. */
  fields: { name: string; type: string }[];
  /** Null keys are noted at all (no accessor or symbol field; Kotlin: a shape that tracks nulls). */
  tracks: boolean;
  /** Undefined keys and run-time notes too (`notesKeys`). */
  notes: boolean;
  nullKeys: string[];
  unsetKeys: string[];
  /** Untyped values noted as they run (`jsNullKeysOf`), as emitted. */
  untypedKeys: string[];
  /** The member values and notes as emitted, where `JSLiteralKeys` notes some as they run. */
  runtime: string[];
  /** The keys the literal writes, in the order it makes them. */
  written: string[];
}

interface Registered { translator: Record<string, unknown>; states: ValueStates; literals: [ts.ObjectLiteralExpression, LiteralKeys][] }

const registered = new Map<object, Registered>();
let exitHook = false;

/** Records `translator`'s class key decisions to `NS_SHAPE_SHADOW` when the process ends. */
export function shadowShapes(translator: object, states: ValueStates): void {
  registered.set(translator, { translator: translator as Record<string, unknown>, states, literals: [] });
  if (!exitHook) { exitHook = true; process.once('exit', flush); }
}

/** Records one literal's key decisions. */
export function shadowLiteral(translator: object, e: ts.ObjectLiteralExpression, decided: LiteralKeys): void {
  registered.get(translator)?.literals.push([e, { ...decided, fields: decided.fields.map((f) => ({ name: f.name, type: f.type })) }]);
}

function flush(): void {
  const out = process.env.NS_SHAPE_SHADOW!;
  const lines: string[] = [];
  for (const r of registered.values()) {
    const at = (n: ts.Node) => {
      const f = n.getSourceFile();
      const { line, character } = f.getLineAndCharacterOfPosition(n.getStart());
      return `${relative(process.cwd(), f.fileName)}:${line + 1}:${character + 1}`;
    };
    const backend = r.states.backend.name, mode = r.states.backend.library ? 'library' : r.states.backend.lenient ? 'lenient' : 'app';
    const safe = (site: string, n: ts.Node, f: () => object) => {
      try { lines.push(JSON.stringify({ backend, site, mode, at: at(n), ...f() })); }
      catch (err) { lines.push(JSON.stringify({ backend, site, mode, at: at(n), error: (err as Error).message.slice(0, 200) })); }
    };
    const facts = factsOf(r.translator);
    const classKeys = r.translator.classKeySets as Map<ts.ClassLikeDeclaration, BackendClassKeys> | undefined;
    for (const [cls, k] of classKeys ?? []) safe('class', cls, () => classRecord(cls, k, r.states, facts));
    const hierarchies = r.translator.keyHierarchies as Map<ts.ClassLikeDeclaration, BackendHierarchy> | undefined;
    for (const [root, h] of hierarchies ?? []) safe('hierarchy', root, () => hierarchyRecord(root, h, r.states, facts));
    for (const [e, k] of r.literals) safe('literal', e, () => literalRecord(e, k, r.states));
  }
  if (lines.length) appendFileSync(out, lines.join('\n') + '\n');
}

/** The backend's facts, read from its own members as `classKeys` reads them. */
function factsOf(t: Record<string, unknown>): ShapeFacts {
  const call = <R>(name: string, ...args: unknown[]) => (t[name] as (...a: unknown[]) => R).apply(t, args);
  return {
    defines: !t.assignFields,
    keyed: (cls) => call<boolean>('keyedClass', cls),
    kitHeld: (cls, m) => {
      const kitRoot = call<ts.ClassLikeDeclaration | undefined>('kitRootOf', cls);
      const core = t.core as { isKitView(c: ts.ClassLikeDeclaration): unknown } | null | undefined;
      const properties = t.properties as { isRegistered(c: ts.ClassLikeDeclaration, n: string): boolean } | null | undefined;
      return !!call('kitRedeclared', m) || (!!kitRoot && !!core?.isKitView(kitRoot) && !!properties?.isRegistered(cls, m.name.getText()));
    },
    expando: (root) => call<boolean>('appRootKeepsExpando', root),
  };
}

interface BackendClassKeys { on: boolean; order: string[]; always: Set<string>; sure: Set<string>; written: Set<string>; flagged: Set<string>; depth: number }
interface BackendHierarchy { ordered: boolean; gated: boolean; expando: boolean; noted: string }
type Diff = [what: string, plan: unknown, backend: unknown];

const names = (s: Iterable<string>) => [...s].sort().join(',');

function classRecord(cls: ts.ClassLikeDeclaration, k: BackendClassKeys, states: ValueStates, facts: ShapeFacts): object {
  const plan = shapePlanOfClass(cls, states, facts);
  const diffs: Diff[] = [];
  const name = cls.name?.text ?? '(anonymous)';
  if (!!plan !== k.on) diffs.push(['on', !!plan, k.on]);
  if (plan && k.on) {
    const of = (p: (s: KeyState) => boolean) => plan.keys.filter(p).map((s) => s.name);
    const compare = (what: string, mine: string[], theirs: Iterable<string>) => { if (names(mine) !== names(theirs)) diffs.push([what, names(mine), names(theirs)]); };
    if (plan.keys.map((s) => s.name).join() !== k.order.join()) diffs.push(['order', plan.keys.map((s) => s.name).join(), k.order.join()]);
    compare('always', of((s) => s.presence === 'always'), k.always);
    compare('written', of((s) => s.presence === 'written'), k.written);
    compare('flagged', of((s) => s.presence === 'written' || s.deleted), k.flagged);
    if (plan.depth !== k.depth) diffs.push(['depth', plan.depth, k.depth]);
  }
  return { name, on: k.on, flagged: names(k.flagged), keys: plan?.keys.map((s) => `${s.name}:${s.presence}${s.deleted ? ':deleted' : ''}${s.nulls === 'noted' ? ':null' : ''}`).join(',') ?? null, diffs };
}

function hierarchyRecord(root: ts.ClassLikeDeclaration, h: BackendHierarchy, states: ValueStates, facts: ShapeFacts): object {
  const mine = shapeHierarchy(root, states, facts);
  const diffs: Diff[] = [];
  if (mine.ordered !== h.ordered) diffs.push(['ordered', mine.ordered, h.ordered]);
  if (mine.gated !== h.gated) diffs.push(['gated', mine.gated, h.gated]);
  if (mine.expando !== h.expando) diffs.push(['expando', mine.expando, h.expando]);
  if (mine.ordered && h.ordered && mine.noted !== (h.noted === 'jsKeysNoted' ? 'keys' : 'order')) diffs.push(['noted', mine.noted, h.noted]);
  return { name: root.name?.text ?? '(anonymous)', ordered: h.ordered, gated: h.gated, expando: h.expando, diffs };
}

/** How the backend holds a field, read from its spelling. */
function held(type: string | undefined): 'none' | 'any' | 'function' | 'optional' | 'present' {
  if (type === undefined) return 'none';
  if (type === 'Any?') return 'any';
  if (/->|^\(.*\)\??$/.test(type)) return 'function';
  return /[?!]$/.test(type) ? 'optional' : 'present';
}

function literalRecord(e: ts.ObjectLiteralExpression, k: LiteralKeys, states: ValueStates): object {
  const plan = shapePlanOfLiteral(e, states);
  const diffs: Diff[] = [];
  const field = new Map(k.fields.map((f) => [f.name, f.type]));
  const quoted = (s: string) => /^"((?:[^"\\]|\\.)*)"/.exec(s)?.[1] ?? /^\("((?:[^"\\]|\\.)*)"/.exec(s)?.[1] ?? s;
  const untyped = new Set(k.untypedKeys.map(quoted));
  const runtime = new Set<string>();
  for (const code of k.runtime) for (const m of code.matchAll(/__keys\d*\.(?:typed|untyped|nulled)\("((?:[^"\\]|\\.)*)"/g)) runtime.add(m[1]);
  const nullNoted = (n: string) => k.nullKeys.includes(n) || untyped.has(n) || runtime.has(n);
  const unsetNoted = (n: string) => k.unsetKeys.includes(n) || runtime.has(n);
  for (const s of plan.keys) {
    const h = held(field.get(s.name));
    if (h === 'none' || h === 'any' || h === 'function' || !s.form) continue;
    // A foreign value only may be empty: into a field held present, its conversion (S3) decides, not the key.
    const may = (state: boolean) => (state ? '' : s.form!.foreign ? ' (foreign)' : null);
    const check = (what: 'null' | 'unset', on: boolean, state: boolean, noted: boolean) => {
      if (!on) return;
      const why = may(state);
      if (why !== null && !noted && !(h === 'present' && why)) diffs.push([`${what} ${h === 'present' ? 'unheld' : 'unnoted'}${why}`, s.name, h]);
      else if (why === null && noted) diffs.push([`${what} noted, form never ${what === 'null' ? 'null' : 'undefined'}`, s.name, h]);
    };
    check('null', k.tracks, s.form.null, nullNoted(s.name));
    check('unset', k.notes, s.form.undefined, unsetNoted(s.name));
  }
  const order = plan.keys.map((s) => s.name).filter((n) => field.has(n));
  if (order.join() !== k.written.join()) diffs.push(['order', order.join(), k.written.join()]);
  return { tracks: k.tracks, notes: k.notes, keys: plan.keys.length, diffs };
}
