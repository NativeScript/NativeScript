import { appendFileSync } from 'node:fs';
import { relative } from 'node:path';
import ts from 'typescript';
import { type Entry, type NativeType, parseNativeType, plan, type Plan, type Slot, type SlotKind, spelledRepresentation, type Step } from './conversion.ts';
import { type Form, representation, type Representation } from './forms.ts';
import { slotOf } from './lang.ts';
import type { ValueStates } from './value-states.ts';

// Shadow mode (NS_CONVERSION_SHADOW=<file>): every call of a backend's conversion entry points from outside the family is
// answered as before, and one JSONL record says which cell `plan()` gives that placement and which step the emitted code
// takes, read from the code by a temporary classifier. It only observes: answers, call order and arguments reach the
// translator unchanged, and everything that asks the checker or the forms waits until the translation has run.

/** The entry points recorded, per backend: a site is a call of one of them from outside `FAMILY`. */
const ENTRIES: Record<'swift' | 'kotlin', string[]> = {
  swift: ['coerce', 'convert', 'fromAny', 'fromAnyCode', 'presentFromAny'],
  kotlin: ['coerce', 'convert', 'fromAny', 'fromAnyCode', 'checkedCast'],
};

/** The conversion pipelines' own functions: a call from one of these is the conversion's inside, not a site. */
const FAMILY = new Set([
  'coerce', 'coerceTyped', 'coerced', 'convert', 'fromAny', 'fromAnyCode', 'presentFromAny', 'fromAnyChecked', 'fromAnyUnchecked',
  'fromAnyOrZero', 'forcedCast', 'checkedCast', 'checkedConvert', 'checkedPlacement', 'checkedBinding', 'nullishConversion',
  'nullishOfAny', 'undefinedAs', 'maybeUndefined', 'presentCode', 'keptOptional', 'arrayOf', 'arrayElementFromAny', 'shadowed',
]);

interface CallSite { getFunctionName(): string | null; getMethodName(): string | null; getFileName(): string | undefined }

/** The compiler function that called the entry point: the first named frame in the compiler's sources. */
function caller(wrapper: (...args: never[]) => unknown): string {
  const prepare = Error.prepareStackTrace, limit = Error.stackTraceLimit;
  Error.prepareStackTrace = (_, frames) => frames;
  Error.stackTraceLimit = 6;
  const holder = {} as { stack: CallSite[] };
  Error.captureStackTrace(holder, wrapper);
  const frames = holder.stack;
  Error.prepareStackTrace = prepare;
  Error.stackTraceLimit = limit;
  for (const f of frames) {
    const name = f.getMethodName() ?? f.getFunctionName()?.replace(/^.*\./, '');
    if (name && f.getFileName()?.includes('/src/')) return name;
  }
  return '?';
}

const unflushed = new Set<() => void>();
let exitHook = false;

/** Records each conversion site of a translator (whose deciders are `states`) to `NS_CONVERSION_SHADOW`. */
export function shadowConversions(translator: object, states: ValueStates): void {
  const out = process.env.NS_CONVERSION_SHADOW!;
  if (!exitHook) { exitHook = true; process.once('exit', () => { for (const f of [...unflushed]) f(); }); }
  const methods = translator as Record<string, (...args: unknown[]) => string>;
  const backend = states.backend.name;
  // Asked only once the translation has run, so a type it registers reaches no output.
  const typeOf = (e: ts.Expression) => (translator as { typeOf(e: ts.Node): string }).typeOf(e);
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
  for (const fn of ENTRIES[backend]) {
    const original = methods[fn];
    if (typeof original !== 'function') continue;
    const shadowed = function (this: unknown, ...args: unknown[]): string {
      const result = original.apply(translator, args);
      const site = caller(shadowed);
      if (FAMILY.has(site) || typeof result !== 'string') return result;
      const node = args[0] && typeof args[0] === 'object' && 'kind' in (args[0] as object) ? args[0] as ts.Expression : null;
      const key = node ? `${fn}|${node.pos}|${node.end}|${node.getSourceFile?.()?.fileName}|${args[1]}` : `${fn}|${site}|${args.slice(1, 3).join('|')}|${result}`;
      if (seen.has(key)) return result;
      seen.add(key);
      if (node) defer(() => nodeRecord(states, typeOf, fn, site, node, String(args[1]), result));
      else defer(() => codeRecord(states, fn, site, String(args[0]), fn === 'convert' ? String(args[1]) : 'Any?', String(fn === 'convert' ? args[2] : args[1]), result, fn === 'fromAnyCode' && args[3] === true));
      return result;
    };
    methods[fn] = shadowed;
  }
}

/** A placement the program knows: `plan()` from the value's and the slot's forms against the code `coerce` wrote. */
function nodeRecord(states: ValueStates, typeOf: (e: ts.Expression) => string, fn: string, site: string, e: ts.Expression, target: string, code: string): string | null {
  const translator = states.backend, checker = translator.checker;
  const file = e.getSourceFile?.();
  if (!file || e.pos < 0) return null;
  const { line, character } = file.getLineAndCharacterOfPosition(e.getStart());
  const at = `${relative(process.cwd(), file.fileName)}:${line + 1}:${character + 1}`;
  const mode = translator.library ? 'library' : translator.trust.strictFile(file) ? 'strict' : translator.lenientApp ? 'lenient-app' : 'lenient';
  try {
    const forms = states.forms();
    const entry: Entry = states.foreignPlacement(e) ? 'checked' : states.narrowedRead(e) ? 'narrowed' : mode === 'library' ? 'library' : mode === 'strict' ? 'typed' : 'lenient';
    const kind = slotKind(e);
    const fromType = checker.getTypeAtLocation(e);
    const untyped = !!(fromType.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown));
    // The value as the backend holds it, its nil read as the form says where the form has one empty state; a value
    // entering checked or narrowed is the foreign one it converts.
    const fromForm = heldForm(forms, e, checker), fromSpelled = parseNativeType(typeOf(e));
    const fromRep = entry === 'checked' || entry === 'narrowed' ? 'foreign' : spelledRepresentation(fromSpelled, representation(fromForm) === 'null' ? 'null' : 'undefined');
    const from: Slot = { form: fromForm, rep: fromRep, type: fromSpelled.kind === 'any' && !untyped ? kindOf(fromType, checker) : fromSpelled, kind };
    const toType = parseNativeType(target);
    const d = slotOf(e, checker);
    const toForm = d && !d.getSourceFile().isDeclarationFile ? forms.formOfSlot(d) : undefined;
    // The backend's own target, its nil read as the slot's form says where the form has one empty state.
    const spelled = spelledRepresentation(toType, toForm && representation(toForm) === 'null' ? 'null' : 'undefined');
    const to: Slot = { form: toForm, rep: spelled, type: toType, kind };
    const p = plan(from, to, entry);
    return record(states, { fn, site, kind, at, mode, target, code, p, formTo: toForm ? held(toForm) : null, formFrom: untyped ? null : held(fromForm) });
  } catch (err) {
    return JSON.stringify({ backend: translator.name, fn, site, at, error: (err as Error).message.slice(0, 200) });
  }
}

/** A conversion of code between spelled types: `plan()` from the spellings, the entry from the translator's mode. */
function codeRecord(states: ValueStates, fn: string, site: string, input: string, fromSpelling: string, target: string, code: string, checked: boolean): string {
  const translator = states.backend;
  const mode = translator.library ? 'library' : translator.lenient ? 'lenient' : 'strict';
  const fromType = parseNativeType(fromSpelling), toType = parseNativeType(target);
  const entry: Entry = mode === 'library' ? 'library' : mode === 'lenient' && !checked ? 'lenient' : 'checked';
  const kind: SlotKind = 'untyped';
  const p = plan({ rep: spelledRepresentation(fromType), type: fromType, kind }, { rep: spelledRepresentation(toType), type: toType, kind }, entry);
  return record(states, { fn, site, kind, at: null, mode, target, code, input, p, formTo: null });
}

interface Observed { fn: string; site: string; kind: SlotKind; at: string | null; mode: string; target: string; code: string; input?: string; p: Plan; formTo: Representation | null; formFrom?: Representation | null }

function record(states: ValueStates, o: Observed): string {
  const backend = states.backend.name;
  const step = classify(o.code, o.input, o.p.to);
  const agree = step === 'literal' || AGREES[o.p.step].includes(step);
  const throws = /^\(*try[?!]? /.test(o.code);
  return JSON.stringify({
    backend, fn: o.fn, site: o.site, kind: o.kind, at: o.at, mode: o.mode, cell: `${short(o.p.from)}→${short(o.p.to)}`, entry: o.p.entry,
    plan: o.p.step, step, agree, ...(backend === 'swift' && throws !== o.p.throws && o.p.step !== 'refuse' ? { throwsDiffer: { plan: o.p.throws, code: throws } } : {}),
    // Where the forms would hold either side otherwise (S2's question, not this table's).
    ...(o.formTo && o.formTo !== o.p.to ? { formTo: short(o.formTo) } : {}),
    ...(o.formFrom && o.formFrom !== o.p.from && o.p.from !== 'foreign' ? { formFrom: short(o.formFrom) } : {}),
    target: o.target, code: o.code.length > 160 ? o.code.slice(0, 160) + '…' : o.code,
  });
}

const short = (r: Representation) => ({ present: 'P', undefined: 'U', null: 'N', nullish: 'B', foreign: 'F' })[r];

/** The backend steps each table step is written as. */
const AGREES: Record<Step, string[]> = {
  identity: ['none'], implicit: ['none'], type: ['none'], oneEmpty: ['none'], truthiness: ['none'],
  box: ['box', 'none', 'function'], nulled: ['nulled'], jsAny: ['jsAny'],
  nullishOf: ['nullishOf'], nullishOfNull: ['nullishOfNull'], nullishOfAny: ['nullishOfAny'], optional: ['optional'], unwrapNullish: ['optional'],
  undefinedAs: ['undefinedAs'], nullAs: ['nullAs'], zero: ['zero'], libraryDefault: ['zero', 'undefinedAs'],
  typeError: ['typeError'], readTypeError: ['typeError'],
  // A function value's adaption is S5's (`boxFunction`, function cells), not this table's.
  checked: ['checked', 'function'], narrowed: ['checked', 'function'], lenient: ['lenient', 'function'], converted: ['converted', 'function'], refuse: [],
};

/**
 * The step the backend wrote, from its code's outermost operation. Temporary (S3-0): S3-1…S3-3 carry these as marks,
 * and this goes with the shadow.
 */
function classify(code: string, input: string | undefined, to: Representation): string {
  if (input !== undefined && code === input) return 'none';
  let c = code.replace(/^try[?!]? /, '');
  while (c.startsWith('(') && closes(c)) c = c.slice(1, -1).replace(/^try[?!]? /, '');
  if (/^(?:jsNull|nil|null|\.null|\.undefined|jsUndefined|"[^"]*"|-?[\d.]+|true|false)$/.test(c)) return 'literal';
  // A container read element by element: the step its elements take.
  const element = /^(?:jsArrayFrom|jsArrayOf|jsArrayOrNil|jsUnlessNullish|jsRecord\w*)\b.*\{ (?:\$0|it|__\w+)? ?(?:->|in)? ?(.*) \}\)?$/s.exec(c)?.[1];
  if (element) return classify(element, undefined, 'present');
  const rules: [RegExp, string][] = [
    [/^(?:JSNullish<.*>\(any:|JSNullish\.ofAny|nullishOfAny)/s, 'nullishOfAny'],
    [/^(?:JSNullish<.*>\(null:|JSNullish\.ofNull)/s, 'nullishOfNull'],
    [/^(?:JSNullish<.*>\(|JSNullish\.of\()/s, 'nullishOf'],
    [/\.jsAny$/, 'jsAny'],
    [/\.optional$/, 'optional'],
    [/^jsNulled(?:Entry)?\(/, 'nulled'],
    [/^(?:jsChecked\w*|jsCast(?:Present)?|jsCheckedCast|jsErrorOf)[(<]/, 'checked'],
    [/^jsUnchecked</, 'converted'],
    [/\bjsFlat\(|\(jsObject: /, 'lenient'],
    [/^(?:jsConverted\w*|jsNumberOrZero|jsStringOrEmpty|jsBooleanOrFalse)[(<]/, 'converted'],
    [/^(?:jsLenient\w*|jsImplicit|jsAsserted\w*|jsForeign\w*)[(<]/, 'lenient'],
    [/^FunctionCell_\w+\.|^jsFunction\d*</, 'function'],
    [/ (?:\?\?|\?:) (?:"undefined"|\.nan|Double\.NaN|false)$/, 'undefinedAs'],
    [/ (?:\?\?|\?:) "null"$/, 'nullAs'],
    [/ (?:\?\?|\?:) (?:""|0|0\.0)$/, 'zero'],
    [/^(?:jsUnwrap|jsObjectRequired|jsCannotRead|jsRequired)\(| \?: jsObjectRequired\(\)$/, 'typeError'],
    [/^\(?.* as! [\w.<>\[\]?, ]+\)?$/s, 'converted'],
    [/^\(?.* as\? [\w.<>\[\]?, ]+\)?$/s, 'lenient'],
    [/[\w)\]]!$|!!$/, 'force'],
  ];
  for (const [re, step] of rules) if (re.test(c) && (!re.source.startsWith('^(?:') || wrapsWhole(c))) return step;
  if (to === 'foreign' && (/ as Any\?$/.test(c) || /^jsBox\(/.test(c))) return 'box';
  return 'none';
}

/** Whether a call's arguments close at the code's end: `f(x)`, not `f(x).y` or `f(x) + 1`. */
function wrapsWhole(c: string): boolean {
  const open = c.indexOf('(');
  return open > 0 && closes(c.slice(open));
}

/** Whether the parenthesis `c` starts with closes at its end. */
function closes(c: string): boolean {
  let depth = 0, quoted = false;
  for (let k = 0; k < c.length; k++) {
    const ch = c[k];
    if (quoted) { if (ch === '\\') k++; else if (ch === '"') quoted = false; continue; }
    if (ch === '"') quoted = true;
    else if (ch === '(') depth++;
    else if (ch === ')' && --depth === 0) return k === c.length - 1;
  }
  return false;
}

/** A read of a variable, parameter or field is held as its slot is; any other value as it is. */
function heldForm(forms: ReturnType<ValueStates['forms']>, e: ts.Expression, checker: ts.TypeChecker): Form {
  const x = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
  const name = ts.isIdentifier(x) ? x : ts.isPropertyAccessExpression(x) ? x.name : null;
  const d = name && checker.getSymbolAtLocation(name)?.valueDeclaration;
  const slot = d && (ts.isVariableDeclaration(d) || ts.isParameter(d) || ts.isPropertyDeclaration(d) || ts.isPropertySignature(d)) && !d.getSourceFile().isDeclarationFile;
  return slot ? forms.formOfSlot(d) : forms.formOf(e);
}

/** A held form's representation: foreign only where its type is tested (§2.3b M6). */
function held(f: Form): Representation {
  return f.foreign && !f.typeObserved ? representation({ ...f, foreign: false }) : representation(f);
}

function kindOf(t: ts.Type, checker: ts.TypeChecker): NativeType {
  const present = checker.getNonNullableType(t), F = ts.TypeFlags;
  const kind = present.flags & F.StringLike ? 'string' : present.flags & F.NumberLike ? 'number' : present.flags & F.BooleanLike ? 'boolean'
    : present.flags & (F.Any | F.Unknown) ? 'any' : present.getCallSignatures().length ? 'function' : checker.isArrayType(present) ? 'array' : 'object';
  return { kind, name: checker.typeToString(present), args: [], optional: present !== t, implicit: false };
}

/** Where the value is placed, by its parent. */
function slotKind(n: ts.Expression): SlotKind {
  let x: ts.Node = n;
  while (ts.isParenthesizedExpression(x.parent) || ts.isAsExpression(x.parent) || ts.isNonNullExpression(x.parent)) x = x.parent;
  const p = x.parent;
  if ((ts.isCallExpression(p) || ts.isNewExpression(p)) && p.arguments?.includes(x as ts.Expression)) return 'argument';
  if ((ts.isCallExpression(p) && p.expression === x) || ((ts.isPropertyAccessExpression(p) || ts.isElementAccessExpression(p)) && p.expression === x)) return 'receiver';
  if (ts.isReturnStatement(p) || (ts.isArrowFunction(p) && p.body === x)) return 'return';
  if (ts.isVariableDeclaration(p) && p.initializer === x) return ts.isIdentifier(p.name) ? 'variable' : 'binding';
  if (ts.isBindingElement(p) || ts.isParameter(p)) return 'binding';
  if (ts.isPropertyDeclaration(p) && p.initializer === x) return 'field';
  if (ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p)) return 'literalField';
  if (ts.isBinaryExpression(p) && p.right === x && p.operatorToken.kind === ts.SyntaxKind.EqualsToken) return ts.isIdentifier(p.left) ? 'variable' : ts.isElementAccessExpression(p.left) ? 'element' : 'field';
  if (ts.isArrayLiteralExpression(p)) return 'element';
  if (ts.isSpreadElement(p) || ts.isSpreadAssignment(p)) return 'spread';
  if (ts.isAwaitExpression(p)) return 'await';
  if (ts.isIfStatement(p) || ts.isWhileStatement(p) || ts.isDoStatement(p) || ts.isForStatement(p) || (ts.isConditionalExpression(p) && p.condition === x) || ts.isPrefixUnaryExpression(p)
    || (ts.isBinaryExpression(p) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken].includes(p.operatorToken.kind))) return 'condition';
  return 'operand';
}
