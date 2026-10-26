import { appendFileSync } from 'node:fs';
import { relative } from 'node:path';
import ts from 'typescript';
import { type Form, Forms, representation } from './forms.ts';
import type { NullishSlots } from './lang.ts';
import type { ValueStates } from './value-states.ts';

// Shadow mode (NS_FORMS_SHADOW=<file>): each null/undefined decider a backend asks (value-states.ts) is answered as
// before, and one JSONL record per question says what `Form` would answer, so the two can be compared before any backend
// reads `Form`. It only observes: answers, call order and arguments reach the translator unchanged.

type Answer = (forms: Forms, node: ts.Node, checker: ts.TypeChecker) => boolean | null;

const declaration = (n: ts.Node, f: (form: Form) => boolean) => (forms: Forms) => (isSlotDeclaration(n) ? f(forms.formOfSlot(n)) : null);

/** The member's own slot: what every read and write of it shares. */
const member = (forms: Forms, n: ts.Node, checker: ts.TypeChecker) => {
  if (!ts.isPropertyAccessExpression(n)) return null;
  const d = checker.getSymbolAtLocation(n.name)?.valueDeclaration;
  const form = d && isSlotDeclaration(d) && !d.getSourceFile().isDeclarationFile ? forms.formOfSlot(d) : forms.formOf(n);
  return both(form);
};

/**
 * An entry read untyped where a typed nil may be null: an array element or Map value whose element form holds null, or a
 * field whose form does. Other expressions are not entries.
 */
const entry: Answer = (forms, n, checker) => {
  const x = ts.isExpression(n) ? ts.skipOuterExpressions(n) : n;
  const element = (e: ts.Expression) => { const f = forms.formOf(e).element; return !!f && nilMayBeNull(f); };
  if (ts.isElementAccessExpression(x)) return element(x.expression);
  if (ts.isCallExpression(x) && ts.isPropertyAccessExpression(x.expression) && x.expression.name.text === 'get') return element(x.expression.expression);
  if (!ts.isPropertyAccessExpression(x)) return null;
  const d = checker.getSymbolAtLocation(x.name)?.valueDeclaration;
  const form = d && isSlotDeclaration(d) ? forms.formOfSlot(d) : forms.formOf(x);
  return nilMayBeNull(form);
};

/** A typed form whose nil may be null: it holds null alone, or null and undefined apart. */
function nilMayBeNull(f: Form): boolean {
  const r = representation(f);
  return r === 'null' || r === 'nullish';
}

/** A parameter's states beyond what its declared type admits, which its native type then must hold too. */
const beyondDeclared = (...states: ('null' | 'undefined')[]): Answer => (forms, n) => {
  if (!ts.isParameter(n)) return null;
  const declared = forms.declaredForm(n), form = forms.formOfSlot(n);
  return !declared.foreign && states.some((s) => form[s] && !declared[s]);
};

/**
 * The form a value is held in: a read of a variable, parameter or field is held as its slot is, whatever narrowing
 * proves of it there; any other expression as it is.
 */
function heldForm(forms: Forms, n: ts.Expression, checker: ts.TypeChecker): Form {
  const x = ts.skipOuterExpressions(n, ts.OuterExpressionKinds.Parentheses);
  const name = ts.isIdentifier(x) ? x : ts.isPropertyAccessExpression(x) ? x.name : null;
  const d = name && checker.getSymbolAtLocation(name)?.valueDeclaration;
  return d && isSlotDeclaration(d) && !ts.isFunctionLike(d) && !d.getSourceFile().isDeclarationFile ? forms.formOfSlot(d) : forms.formOf(n);
}

/**
 * Whether a form holds both empty states apart, foreign or not: today's deciders ask that of untyped slots as well. Both
 * unobserved are one empty state (§2.3b M1').
 */
function both(f: Form): boolean {
  return f.undefined && f.null && f.observed;
}

/** Values of more than one kind (`number | string`, a function or an object): held untyped already, whatever their empty states. */
function oneKind(f: Form, checker: ts.TypeChecker): boolean {
  const parts = f.type.isUnion() ? f.type.types : [f.type];
  const kind = (x: ts.Type) => (x.flags & ts.TypeFlags.StringLike ? 's' : x.flags & ts.TypeFlags.NumberLike ? 'n' : x.flags & ts.TypeFlags.BooleanLike ? 'b' : x.getCallSignatures().length ? 'f' : checker.typeToString(x));
  return new Set(parts.map(kind)).size === 1;
}

/** Whether the value is held untyped for its empty states: both of them, or a typed value Form calls foreign. */
const heldUntyped: Answer = (forms, n, checker) => {
  if (!ts.isExpression(n) || ts.isPropertyAccessExpression(n)) return null;
  const held = heldForm(forms, n, checker);
  if (!oneKind(held, checker)) return null;
  const typed = !(checker.getTypeAtLocation(n).flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown));
  return representation(held) === 'nullish' || (held.foreign && typed);
};

/** A typed value held as an optional whose nil is `state`, where the value there may be empty. */
const nilIs = (state: 'null' | 'undefined'): Answer => (forms, n, checker) => {
  if (!ts.isExpression(n)) return null;
  const held = heldForm(forms, n, checker), here = forms.formOf(n);
  // One empty state for both: its nil is undefined wherever the value there may be empty.
  return representation(held) === state && (here[state] || (state === 'undefined' && here.null));
};

const DECIDERS: Record<string, { answer: Answer; old: (r: unknown) => boolean }> = {
  nilIsNull: { answer: nilIs('null'), old: Boolean },
  nilIsUndefined: { answer: nilIs('undefined'), old: Boolean },
  nullDistinct: { answer: (f, n, c) => nilIs('null')(f, n, c) || entry(f, n, c), old: Boolean },
  nullableEntry: { answer: entry, old: (r) => r !== null },
  // A member read's answer is its receiver's, which is asked on its own.
  heldNullish: { answer: heldUntyped, old: Boolean },
  nullishMember: { answer: member, old: Boolean },
  nullishShapeField: { answer: member, old: (r) => r !== null },
  // Either empty state: the parameter's native type is then optional, its nil whichever state reached it.
  mayBeNull: { answer: beyondDeclared('null', 'undefined'), old: Boolean },
  givenUndefined: { answer: beyondDeclared('undefined'), old: Boolean },
  // Today's loose slots are strings, numbers and booleans: other values are held by reference, untyped where they must be.
  nullishHeld: { answer: (f, n) => declaration(n, (x) => representation(x) === 'nullish')(f), old: Boolean },
  looseDeclaration: { answer: (f, n) => declaration(n, (x) => x.foreign && !!(x.type.flags & (ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike | ts.TypeFlags.BooleanLike)))(f), old: Boolean },
};

/** A question `Form` has no answer to: a platform's declaration (a fixed point), or a literal empty value, emitted as itself. */
function moot(n: ts.Node): boolean {
  if (!n.getSourceFile() || n.getSourceFile().isDeclarationFile) return true;
  if (!ts.isExpression(n)) return false;
  const x = ts.skipOuterExpressions(n);
  return x.kind === ts.SyntaxKind.NullKeyword || ts.isVoidExpression(x) || (ts.isIdentifier(x) && x.text === 'undefined');
}

function isSlotDeclaration(n: ts.Node): n is ts.Declaration {
  return ts.isVariableDeclaration(n) || ts.isParameter(n) || ts.isPropertyDeclaration(n) || ts.isPropertySignature(n) || ts.isBindingElement(n)
    || ts.isPropertyAssignment(n) || ts.isShorthandPropertyAssignment(n) || ts.isFunctionLike(n);
}

// A refused translation ends the process before the next turn: what it asked until then is still recorded.
const unflushed = new Set<() => void>();
let exitHook = false;

/** Records each question asked of `states` to `NS_FORMS_SHADOW`. */
export function shadowForms(states: ValueStates): void {
  const out = process.env.NS_FORMS_SHADOW!;
  if (!exitHook) { exitHook = true; process.once('exit', () => { for (const f of [...unflushed]) f(); }); }
  const translator = states.backend, backend = translator.name;
  const methods = states as unknown as Record<string, (...args: unknown[]) => unknown>;
  let forms: Forms | null = null, failed: Error | null = null;
  const formsOf = () => {
    if (forms) return forms;
    if (failed) throw failed;
    forms = new Forms(translator.sourceFiles, translator.checker, (f) => translator.trust.strictFile(f), { library: !!translator.library, native: (d) => translator.trust.nativeDeclaration(d), nativeNil: (d) => !!translator.native?.holdsNil?.(d) });
    try {
      forms.build();
    } catch (e) {
      appendFileSync(out, JSON.stringify({ buildError: backend, message: (e as Error).stack?.split('\n').slice(0, 4).join(' ') }) + '\n');
      forms = null;
      throw (failed = e as Error);
    }
    appendFileSync(out, JSON.stringify({ timing: backend, ms: Math.round(forms.buildMs), files: translator.sourceFiles.filter((f) => !f.isDeclarationFile).length, library: !!translator.library, ...forms.bothStates() }) + '\n');
    return forms;
  };
  const seen = new Set<string>();
  // Answers wait until the translation has run: building forms asks the checker in its own order, which would change
  // what the translation's own questions are answered (symbol ids in unique-symbol names).
  const pending: (() => string)[] = [];
  const flush = () => {
    unflushed.delete(flush);
    const lines = pending.splice(0).map((line) => line());
    if (lines.length) appendFileSync(out, lines.join('\n') + '\n');
  };
  const record = (decider: string, node: ts.Node, old: boolean, answer: () => boolean | null) => {
    if (!node.getSourceFile?.() || node.pos < 0) return;
    const file = node.getSourceFile();
    const { line, character } = file.getLineAndCharacterOfPosition(node.getStart());
    const at = `${relative(process.cwd(), file.fileName)}:${line + 1}:${character + 1}`;
    const key = `${decider}|${at}|${node.kind}`;
    if (seen.has(key)) return;
    seen.add(key);
    const mode = translator.library ? 'library' : translator.trust.strictFile(file) ? 'strict' : translator.lenientApp ? 'lenient-app' : 'lenient';
    if (!pending.length) { setImmediate(flush); unflushed.add(flush); }
    pending.push(() => {
      let form: boolean | null = null, states = '', error: string | undefined;
      try {
        form = moot(node) ? null : answer();
        const f = ts.isExpression(node) ? formsOf().formOf(node) : isSlotDeclaration(node) ? formsOf().formOfSlot(node) : null;
        if (f) states = (f.undefined ? 'U' : '') + (f.missing ? 'M' : '') + (f.null ? 'N' : '') + (f.hole ? 'H' : '') + (f.foreign ? 'F' : '') + (f.observed ? 'o' : '') + (f.element ? `[${(f.element.undefined ? 'U' : '') + (f.element.null ? 'N' : '') + (f.element.foreign ? 'F' : '')}]` : '');
      } catch (e) {
        error = (e as Error).message.slice(0, 200);
      }
      return JSON.stringify({ backend, at, kind: ts.SyntaxKind[node.kind], site: siteOf(node), decider, mode, old, form, states, ...(error ? { error } : {}) });
    });
  };
  for (const [name, { answer, old }] of Object.entries(DECIDERS)) {
    const original = methods[name];
    methods[name] = function (this: unknown, ...args: unknown[]) {
      const result = original.apply(states, args);
      const node = args[0] as ts.Node | undefined;
      if (node && typeof node === 'object' && 'kind' in node) record(name, node, old(result), () => answer(formsOf(), node, translator.checker));
      return result;
    };
  }
  const nullish = methods.nullish;
  const wrapped = new WeakSet<object>();
  methods.nullish = function () {
    const slots = nullish.apply(states) as NullishSlots;
    if (!wrapped.has(slots)) {
      wrapped.add(slots);
      slots.held = recording(slots.held, (d, has) => record('nullishSlots.held', d, has, () => heldSlot(formsOf(), d, translator.checker)));
      slots.fields = recording(slots.fields, (d, has) => record('nullishSlots.fields', d, has, () => (isSlotDeclaration(d) ? both(formsOf().formOfSlot(d)) : null)));
    }
    return slots;
  };
}

/** `nullishSlots`'s `held`: a slot of one kind of value that may hold both. */
function heldSlot(forms: Forms, d: ts.Declaration, checker: ts.TypeChecker): boolean | null {
  if (!isSlotDeclaration(d)) return null;
  const f = forms.formOfSlot(d);
  return oneKind(f, checker) ? both(f) : null;
}

function recording(set: Set<ts.Declaration>, asked: (d: ts.Declaration, has: boolean) => void): Set<ts.Declaration> {
  return new (class extends Set<ts.Declaration> {
    override has(d: ts.Declaration): boolean {
      const has = super.has(d);
      if (d && typeof d === 'object' && 'kind' in d) asked(d, has);
      return has;
    }
  })(set);
}

/** Where the value a question is asked about is placed or read, in the fuzz harness's site words where they apply. */
function siteOf(n: ts.Node): string {
  if (!ts.isExpression(n)) return ts.isParameter(n) ? 'parameter' : ts.isPropertyDeclaration(n) || ts.isPropertySignature(n) ? 'field' : ts.isFunctionLike(n) ? 'function' : ts.isVariableDeclaration(n) ? 'variable' : 'declaration';
  let x: ts.Node = n;
  while (ts.isParenthesizedExpression(x.parent)) x = x.parent;
  const p = x.parent;
  if ((ts.isCallExpression(p) || ts.isNewExpression(p)) && p.arguments?.includes(x as ts.Expression)) return ts.isFunctionLike(ts.skipOuterExpressions(n as ts.Expression)) ? 'callback' : 'arg';
  if (ts.isReturnStatement(p) || (ts.isArrowFunction(p) && p.body === x)) return 'return';
  if (ts.isVariableDeclaration(p) && p.initializer === x) return 'var';
  if (ts.isPropertyDeclaration(p) && p.initializer === x) return 'field';
  if (ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p)) return 'literal-field';
  if (ts.isBinaryExpression(p) && p.right === x && p.operatorToken.kind === ts.SyntaxKind.EqualsToken) return ts.isIdentifier(p.left) ? 'var' : 'field';
  if (ts.isArrayLiteralExpression(p) || ts.isSpreadElement(p)) return 'element';
  if (ts.isAwaitExpression(p)) return 'await';
  if (ts.isBinaryExpression(p) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken].includes(p.operatorToken.kind)) return 'compare';
  if (ts.isTemplateSpan(p) || (ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.PlusToken)) return 'string';
  if (ts.isTypeOfExpression(p)) return 'typeof';
  if (ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n)) return n.questionDotToken ? 'optional-chain' : ts.isElementAccessExpression(n) ? 'element-read' : 'member-read';
  if (ts.isCallExpression(n)) return 'call-result';
  if (ts.isAwaitExpression(n)) return 'await';
  return 'other';
}
