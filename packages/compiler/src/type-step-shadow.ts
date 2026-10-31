import { appendFileSync } from 'node:fs';
import { relative } from 'node:path';
import ts from 'typescript';
import { type Entry, type NativeType, parseNativeType } from './conversion.ts';
import { type TypeFacts, type TypeStep, typeStep } from './type-step.ts';
import type { ValueStates } from './value-states.ts';

// Shadow mode (NS_TYPESTEP_SHADOW=<file>): each call of a backend's box, unbox and function-adaption writers is answered
// as before, and one JSONL record says which step `typeStep()` gives it and what the code written does, read from the
// code by a temporary classifier. It only observes: answers, call order and arguments reach the translator unchanged,
// and whatever asks the translator waits until the translation has run.

type Read = (args: unknown[], value: string) => { from?: string; to?: string; node?: ts.Node; input?: string } | null;

const codeOf = (x: unknown): string => (x && typeof x === 'object' && 'code' in x ? String((x as { code: string }).code) : String(x));
const partsText = (x: unknown): string => (x && typeof x === 'object' && 'text' in x ? String((x as { text: string }).text) : String(x));
const nodeOf = (x: unknown): ts.Node | undefined => (x && typeof x === 'object' && 'kind' in x && 'pos' in x ? x as ts.Node : undefined);
const COMPOSITE_TARGET = /^(?:JSArray|JSRecord|JSMap|JSSet|JSPromise|Promise|Deferred)<|^\(.*\)\s*(?:throws\s+)?->|^FunctionCell_|^\[/;

/** The translators' methods that emit a statement, expression or declaration, whose node bounds the scope. */
const SCOPES = /^(?:stmt|expr|classDecl(?:Code)?|func(?:Code)?|functionBody)$/;

/** The writers recorded per backend, and how each one's arguments name the two types. */
const WRITERS: Record<'swift' | 'kotlin', Record<string, Read>> = {
  swift: {
    convert: (a) => ({ input: codeOf(a[0]), from: String(a[1]), to: String(a[2]) }),
    boxFunction: (a) => ({ input: String(a[0]), from: String(a[1]), to: 'Any?' }),
    unboxFunction: (a) => ({ input: String(a[0]), from: 'Any?', to: partsText(a[1]) }),
    adapter: (a) => ({ input: String(a[0]), from: String(a[1]), to: partsText(a[2]) }),
    coerced: (a) => (a[1] === 'Any?' ? { node: nodeOf(a[0]), to: 'Any?' } : null),
    fromAny: (a) => (COMPOSITE_TARGET.test(String(a[1])) ? { input: nodeOf(a[0]) ? undefined : codeOf(a[0]), node: nodeOf(a[0]), from: 'Any?', to: String(a[1]) } : null),
    closureReturn: (a, v) => ({ node: nodeOf(a[0]), to: v }),
  },
  kotlin: {
    convert: (a) => ({ input: String(a[0]), from: String(a[1]), to: String(a[2]) }),
    coerceTyped: (a) => (a[1] === 'Any?' ? { node: nodeOf(a[0]), to: 'Any?' } : null),
    functionRefAdapter: (a) => ({ node: nodeOf(a[0]), to: String(a[1]) }),
    nullishFunction: (a) => ({ node: nodeOf(a[0]), to: 'Any?' }),
    restCallable: (a) => ({ node: nodeOf(a[0]), to: 'Any?' }),
    untypedArrow: (a) => ({ node: nodeOf(a[0]), to: 'Any?' }),
    untypedCallable: (a) => ({ node: nodeOf(a[0]), to: 'Any?' }),
    untypedFunction: (a) => ({ node: nodeOf(a[0]), to: 'Any?' }),
    fromAny: (a) => (COMPOSITE_TARGET.test(String(a[1])) ? { input: nodeOf(a[0]) ? undefined : codeOf(a[0]), node: nodeOf(a[0]), from: 'Any?', to: String(a[1]) } : null),
  },
};

interface CallSite { getFunctionName(): string | null; getMethodName(): string | null; getFileName(): string | undefined; getTypeName(): string | null }

/** The compiler functions calling the writer, innermost first, up to the first that is not a writer. */
function callers(wrapper: (...args: never[]) => unknown, fn: string, writers: Record<string, Read>): { site: string; nested: boolean } {
  const prepare = Error.prepareStackTrace, limit = Error.stackTraceLimit;
  Error.prepareStackTrace = (_, frames) => frames;
  Error.stackTraceLimit = 24;
  const holder = {} as { stack: CallSite[] };
  Error.captureStackTrace(holder, wrapper);
  const frames = holder.stack;
  Error.prepareStackTrace = prepare;
  Error.stackTraceLimit = limit;
  for (const f of frames) {
    const name = f.getMethodName() ?? f.getFunctionName()?.replace(/^.*\./, '');
    // An arrow property of the same name forwarding to the writer (Kotlin's `coerceTyped: (e, t) => this.coerceTyped(e, t)`) is no caller.
    if (!name || !f.getFileName()?.includes('/src/') || f.getFileName()!.endsWith('/type-step-shadow.ts') || name === 'shadowed' || (name === fn && f.getTypeName() === 'Object')) continue;
    return { site: name, nested: name in writers };
  }
  return { site: '?', nested: false };
}

const unflushed = new Set<() => void>();
let exitHook = false;

/** Records each box, unbox and function-adaption site of a translator to `NS_TYPESTEP_SHADOW`. */
export function shadowTypeSteps(translator: object, states: ValueStates): void {
  const out = process.env.NS_TYPESTEP_SHADOW!;
  if (!exitHook) { exitHook = true; process.once('exit', () => { for (const f of [...unflushed]) f(); }); }
  const methods = translator as Record<string, (...args: unknown[]) => unknown>;
  const t = translator as { typeOf(e: ts.Node): string; library?: boolean; lenient?: boolean; isObjectShape?(n: string): boolean; untypedEnum?(c: string, t: string): string | null };
  const backend = states.backend.name;
  const writers = WRITERS[backend];
  const facts: TypeFacts = {
    shape: (n) => { try { return !!t.isObjectShape?.call(translator, n); } catch { return false; } },
    enumType: (n) => { try { return !!t.untypedEnum?.call(translator, '', n); } catch { return false; } },
  };
  // The nodes being translated, innermost last: the type parameters bound where a writer is called.
  const within: ts.Node[] = [];
  const proto = Object.getPrototypeOf(translator) as Record<string, unknown>;
  for (const fn of Object.getOwnPropertyNames(proto)) {
    const original = Object.getOwnPropertyDescriptor(proto, fn)?.value;
    if (!SCOPES.test(fn) || fn in writers || typeof original !== 'function') continue;
    methods[fn] = function (this: unknown, ...given: unknown[]): unknown {
      const n = given.find((x) => nodeOf(x)?.parent) as ts.Node | undefined;
      if (!n) return original.apply(this, given);
      within.push(n);
      try { return original.apply(this, given); } finally { within.pop(); }
    };
  }
  const seen = new Set<string>();
  const pending: (() => string | null)[] = [];
  const flush = () => {
    unflushed.delete(flush);
    const lines = pending.splice(0).map((line) => line()).filter((l) => l !== null);
    if (lines.length) appendFileSync(out, lines.join('\n') + '\n');
  };
  const defer = (line: () => string | null) => {
    if (!pending.length) { setImmediate(flush); unflushed.add(flush); }
    pending.push(line);
  };
  for (const [fn, read] of Object.entries(writers)) {
    const original = methods[fn];
    if (typeof original !== 'function') continue;
    const shadowed = function (this: unknown, ...given: unknown[]): unknown {
      const value = original.apply(translator, given);
      if (typeof value !== 'string') return value;
      const r = read(given, value);
      if (!r) return value;
      const { site, nested } = callers(shadowed, fn, writers);
      const n = r.node, file = n?.getSourceFile?.();
      const at = file && n!.pos >= 0 ? `${relative(process.cwd(), file.fileName)}:${file.getLineAndCharacterOfPosition(n!.getStart()).line + 1}` : null;
      const key = `${fn}|${site}|${at}|${r.from}|${r.to}|${value}`;
      if (seen.has(key)) return value;
      seen.add(key);
      const mode = t.library ? 'library' : t.lenient ? 'lenient' : 'strict';
      const bound = boundTypeParameters(n ?? within.at(-1));
      defer(() => {
        try {
          const from = r.from ?? (n && fn === 'closureReturn' ? null : n ? t.typeOf.call(translator, n) : null);
          return record({ backend, fn, site, nested, at, mode, from, to: r.to ?? null, input: r.input, code: value, facts: { ...facts, bound: (x) => bound.has(x) }, literal: !!n && functionLiteral(n) });
        } catch (err) {
          return JSON.stringify({ backend, fn, site, at, error: (err as Error).message.slice(0, 200) });
        }
      });
      return value;
    };
    methods[fn] = shadowed;
  }
}

/** The type parameters of the declarations enclosing `n`, its own included. */
function boundTypeParameters(n: ts.Node | undefined): Set<string> {
  const names = new Set<string>();
  for (let p = n; p; p = p.parent) {
    for (const tp of (p as { typeParameters?: ts.NodeArray<ts.TypeParameterDeclaration> }).typeParameters ?? []) names.add(tp.name.text);
  }
  return names;
}

interface Observed { backend: string; fn: string; site: string; nested: boolean; at: string | null; mode: string; from: string | null; to: string | null; input?: string; code: string; facts: TypeFacts; literal: boolean }

function record(o: Observed): string | null {
  const base = { backend: o.backend, fn: o.fn, site: o.site, nested: o.nested, at: o.at, mode: o.mode, from: o.from, to: o.to, code: clip(o.code) };
  // A closure's result spelling: a survey of the sites S5-3 moves, with no step of its own to compare.
  if (o.fn === 'closureReturn' || !o.from || !o.to) return JSON.stringify({ ...base, family: 'function', step: null, written: written(o.code, o.input), differ: [] });
  const entry: Entry = o.mode === 'library' ? 'library' : o.mode === 'lenient' ? 'lenient' : 'checked';
  const from = parseNativeType(o.from), to = parseNativeType(o.to);
  const s = typeStep(from, to, entry, o.facts);
  const w = written(o.code, o.input);
  return JSON.stringify({ ...base, family: family(s), step: describe(s), composite: s.composite, written: w, differ: disagreements(s, w, from, to, o) });
}

/** The family a step belongs to in the work list. */
function family(s: TypeStep): string {
  if (s.kind === 'box' || s.kind === 'unbox' || s.kind === 'identity') return s.kind;
  if (s.kind === 'function') return 'function';
  // An element step boxes or unboxes its elements.
  const inner = s.children.find((c) => c.kind !== 'identity');
  return inner ? family(inner) : 'identity';
}

function describe(s: TypeStep): string {
  const kids = s.children.filter((c) => c.kind !== 'identity');
  return `${s.kind}:${s.composite}${kids.length ? `(${kids.map(describe).join(',')})` : ''}${s.carried.length ? `[carried ${s.carried.join(',')}]` : ''}${s.refuse ? '!refuse' : ''}`;
}

/** What the written code does, from its outermost operations. Temporary (S5-0): the step's spellings replace it. */
function written(code: string, input: string | undefined): string {
  if (input !== undefined && code === input) return 'unchanged';
  const c = code.replace(/^\(*try[?!]? /, '');
  if (/FunctionCell_\w+\.\w+|jsBoxedFunction|jsIdentified|JSFunctionAlias|jsAdapt|JSAdapted|\bjsFunction\(\d+, [^)]/.test(c)) return 'cell';
  if (/\bjsFunction\w*\(/.test(c)) return 'function-object';
  if (/\(jsFlat\(__f\) as\? /.test(c)) return 'closure-unless-same';
  if (/\{ \(__\w+|\{ \(\)|\{ __\w+(?:, __\w+)* ->|\{ \w+: [\w<>?]+ ->/.test(c)) return 'closure';
  if (/\.storage\.map|\.map \{|\bjsArrayFrom\w*\(|\.mapValues/.test(c)) return 'copy';
  if (/\bjsUndefined\(|\bjsBox\(| as Any\?$/.test(c)) return 'box';
  if (/\bjsUnchecked\w*<|\bjsCast\w*[(<]|\bjsChecked\w*[(<]| as[!?] /.test(c)) return 'cast';
  if (/\bjsFlat\(|\bjsArrayOrNil\(|\bjsForeign\w*\(|\bfromAny\w*\(/.test(c)) return 'read';
  return input === undefined ? 'other' : 'rewritten';
}

/** Where the written code does other than the step: the work list's entries. */
function disagreements(s: TypeStep, w: string, from: NativeType, to: NativeType, o: Observed): string[] {
  const out: string[] = [];
  if (s.refuse) out.push('erasure not refused (Q10)');
  // A function literal written in place is its first value: there is no identity to lose.
  if (s.keepsIdentity && (s.composite === 'function' || s.kind === 'function') && !o.literal && ['closure', 'function-object', 'closure-unless-same'].includes(w)) out.push('function identity lost');
  if (s.keepsIdentity && s.kind === 'element' && w === 'copy') out.push('container copied');
  if (s.keepsIdentity && (s.kind === 'box' || s.kind === 'unbox') && s.composite !== 'function' && w === 'copy') out.push('container copied');
  // A boxed function's parameters are read from script's arguments: null where one is held present is carried (Q7).
  if (s.kind === 'box' && s.composite === 'function') {
    const rejects = s.children.slice(0, -1).filter((p) => p.kind === 'unbox' && rejectsEmpty(p.to)).length;
    if (rejects) out.push('null into a boxed function rejected (Q7)');
  }
  if (s.kind === 'function' && s.carried.length) out.push('null into an adapted parameter rejected (Q7)');
  if (s.kind === 'function' && w === 'unchanged') out.push('function given unadapted');
  if (s.kind === 'reshape' && o.input !== undefined && w === 'unchanged' && from.kind !== to.kind) out.push('reshape unconverted');
  return out;
}

/** A parameter type whose held value can't be null or undefined, which reads an empty argument as a TypeError. */
function rejectsEmpty(t: NativeType): boolean {
  return !t.optional && !t.implicit && !/^JSRest</.test(t.name) && t.kind !== 'any' && t.kind !== 'nullish' && t.kind !== 'void' && !['string', 'number', 'boolean'].includes(t.kind);
}

/** An arrow or function expression, or a conditional whose every branch is one. */
function functionLiteral(n: ts.Node): boolean {
  const b = ts.isExpression(n) ? ts.skipOuterExpressions(n) : n;
  return ts.isArrowFunction(b) || ts.isFunctionExpression(b) || (ts.isConditionalExpression(b) && functionLiteral(b.whenTrue) && functionLiteral(b.whenFalse));
}

const clip = (s: string) => (s.length > 160 ? s.slice(0, 160) + '…' : s);
