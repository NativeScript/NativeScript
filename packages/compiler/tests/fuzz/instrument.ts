// The type-violation sites of a case and its text with every site guarded by a switch: `(__fz(7) ? (__fzv() as any as T) : (e))`.
// One build of the instrumented case runs every variant; which site gets a wrong value, and which value, is chosen per run.
// The replacement keeps the site's static type T, so the code around it compiles as it did, and only the value violates T.
import ts from 'typescript';

export type SiteKind = 'arg' | 'callback-arg' | 'field' | 'literal-field' | 'return' | 'as' | 'optional-chain' | 'var';
export type Category = 'number' | 'string' | 'boolean' | 'function' | 'array' | 'object';
export type ValueKind = 'undefined' | 'null' | 'primitive' | 'object';

/** The wrong values, as TypeScript source; a variant names one by index. */
export const BAD_VALUES = ['undefined', 'null', '0', '42', "''", "'7'", "'text'", 'true', 'false', '{}', '{ unrelated: 1 }', '[]'];

/** Per category: the wrong primitives and wrong objects one is drawn from. */
const WRONG: Record<Category, { primitive: number[]; object: number[] }> = {
  number: { primitive: [5, 4, 6, 7], object: [9, 10, 11] },
  string: { primitive: [3, 2, 7], object: [9, 11, 10] },
  boolean: { primitive: [2, 3, 4, 6], object: [9, 11] },
  function: { primitive: [3, 6], object: [9, 10] },
  array: { primitive: [6, 3], object: [9, 10] },
  object: { primitive: [3, 6, 7], object: [9, 10, 11] },
};

export const valueKind = (v: number): ValueKind => (v === 0 ? 'undefined' : v === 1 ? 'null' : v >= 9 ? 'object' : 'primitive');

export interface Site {
  id: number;
  /** Stable across runs while the case's text is: `<line>:<col>:<kind>`. */
  key: string;
  kind: SiteKind;
  line: number;
  col: number;
  start: number;
  end: number;
  /** The site's source text. */
  text: string;
  /** The static type kept, as TypeScript source; null for an `as` operand that is already untyped. */
  type: string | null;
  category: Category;
  /** `name: ` in front of a shorthand property, which becomes a full one. */
  prefix: string;
  /** Where the statement or class member holding the site starts. */
  statement: number;
}

const F = ts.TypeFlags;

function categoryOf(checker: ts.TypeChecker, t: ts.Type): Category {
  const parts = (t.isUnion() ? t.types : [t]).filter((p) => !(p.flags & (F.Undefined | F.Null | F.Void)));
  const one = (p: ts.Type): Category => {
    if (p.flags & F.NumberLike) return 'number';
    if (p.flags & F.StringLike) return 'string';
    if (p.flags & F.BooleanLike) return 'boolean';
    if (checker.isArrayType(p) || checker.isTupleType(p)) return 'array';
    if (p.getCallSignatures().length && !p.getProperties().some((s) => s.flags & ts.SymbolFlags.Property)) return 'function';
    return 'object';
  };
  const cats = new Set(parts.map(one));
  return cats.size === 1 ? [...cats][0] : 'object';
}

/** Types no wrong value can violate, or that the replacement cannot name. */
function unusable(t: ts.Type): boolean {
  if (t.flags & (F.Any | F.Unknown | F.Never | F.Void | F.Undefined | F.Null | F.TypeParameter | F.ESSymbolLike)) return true;
  return t.isUnion() && t.types.every((p) => p.flags & (F.Undefined | F.Null | F.Void));
}

const FORMAT = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope | ts.TypeFormatFlags.WriteArrowStyleSignature;

/** Every site in `sf` the fuzzer can replace, outermost first where they nest. */
export function findSites(checker: ts.TypeChecker, sf: ts.SourceFile): Site[] {
  const sites: Site[] = [];
  const seen = new Set<string>();
  const widened = (t: ts.Type) => (t.isLiteral() || t.flags & F.BooleanLiteral ? checker.getBaseTypeOfLiteralType(t) : t);
  const add = (e: ts.Expression, kind: SiteKind, typeOf: 'contextual' | 'own' | ts.TypeNode, prefix = '') => {
    if (ts.isSpreadElement(e) || ts.isOmittedExpression(e)) return;
    // An assertion's own operand is the site: guarding the assertion as well would type its result by the guard, not by `as`.
    if (kind !== 'as' && ts.isAsExpression(ts.skipPartiallyEmittedExpressions(skipParens(e)))) return;
    // A guarded method reference is called without its receiver: `(c ? v : (o.m))()` runs `m` with no `this`.
    if (isCallee(e)) return;
    const start = e.getStart(sf), end = e.end;
    if (seen.has(`${start}:${end}`)) return;
    let t: ts.Type | undefined;
    let typeText: string | null;
    if (typeof typeOf === 'object') {
      t = checker.getTypeFromTypeNode(typeOf);
      typeText = typeOf.getText(sf);
    } else {
      t = typeOf === 'contextual' ? checker.getContextualType(e) : undefined;
      // An argument to an untyped parameter (console.log's) is no typed slot.
      if (t && (kind === 'arg' || kind === 'callback-arg') && t.flags & (F.Any | F.Unknown)) return;
      if (!t || unusable(t)) t = widened(checker.getTypeAtLocation(e));
      if (kind === 'as' && t.flags & (F.Any | F.Unknown)) typeText = null;
      else {
        if (unusable(t)) return;
        typeText = checker.typeToString(t, e, FORMAT);
      }
    }
    if (typeText !== null && (unusable(t) || /\bimport\(|\btypeof\b|__/.test(typeText))) return;
    seen.add(`${start}:${end}`);
    const { line, character } = sf.getLineAndCharacterOfPosition(start);
    let st: ts.Node = e;
    while (st.parent && !ts.isBlock(st.parent) && !ts.isSourceFile(st.parent) && !ts.isCaseClause(st.parent) && !ts.isDefaultClause(st.parent) && !ts.isModuleBlock(st.parent) && !ts.isClassLike(st.parent)) st = st.parent;
    sites.push({ id: sites.length, key: `${line + 1}:${character + 1}:${kind}`, kind, line: line + 1, col: character + 1, start, end, text: e.getText(sf), type: typeText, category: t.flags & (F.Any | F.Unknown) ? 'object' : categoryOf(checker, t), prefix, statement: st.getStart(sf) });
  };
  const callbackCallee = (callee: ts.Expression): boolean => {
    const decl = checker.getSymbolAtLocation(ts.isPropertyAccessExpression(callee) ? callee.name : callee)?.valueDeclaration;
    return !!decl && (ts.isParameter(decl) || ts.isPropertyDeclaration(decl) || ts.isPropertySignature(decl) || (ts.isVariableDeclaration(decl) && !!decl.type));
  };
  const skip = (n: ts.Node) => ts.isDecorator(n) || ts.isEnumDeclaration(n) || ts.isTypeNode(n) || ts.isImportDeclaration(n) || ts.isExportDeclaration(n) || ts.isParameter(n) || ts.isComputedPropertyName(n) || ts.isModuleDeclaration(n) && !!(ts.getCombinedModifierFlags(n) & ts.ModifierFlags.Ambient);
  const visit = (n: ts.Node): void => {
    if (skip(n)) return;
    if ((ts.isCallExpression(n) || ts.isNewExpression(n)) && n.arguments && n.expression.kind !== ts.SyntaxKind.ImportKeyword) {
      const kind: SiteKind = callbackCallee(n.expression) ? 'callback-arg' : 'arg';
      for (const a of n.arguments) add(a, kind, 'contextual');
    }
    if (ts.isPropertyAssignment(n) && ts.isObjectLiteralExpression(n.parent) && !ts.isComputedPropertyName(n.name) && !isAssignmentTarget(n.parent)) add(n.initializer, 'literal-field', 'contextual');
    if (ts.isShorthandPropertyAssignment(n) && !n.objectAssignmentInitializer && !isAssignmentTarget(n.parent)) add(n.name, 'literal-field', 'contextual', `${n.name.text}: `);
    if (ts.isPropertyDeclaration(n) && n.initializer && !(ts.getCombinedModifierFlags(n) & (ts.ModifierFlags.Ambient | ts.ModifierFlags.Abstract))) add(n.initializer, 'field', n.type ?? 'own');
    if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && (ts.isPropertyAccessExpression(n.left) || ts.isElementAccessExpression(n.left))) add(n.right, 'field', 'contextual');
    if (ts.isReturnStatement(n) && n.expression) add(n.expression, 'return', 'contextual');
    if (ts.isArrowFunction(n) && !ts.isBlock(n.body)) add(n.body, 'return', 'contextual');
    if (ts.isAsExpression(n) && !(ts.isTypeReferenceNode(n.type) && n.type.getText(sf) === 'const')) add(n.expression, 'as', 'own');
    if ((ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n) || ts.isCallExpression(n)) && n.questionDotToken) add(n.expression, 'optional-chain', 'own');
    if (ts.isVariableDeclaration(n) && n.type && n.initializer && ts.isIdentifier(n.name)) add(n.initializer, 'var', n.type);
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return sites.sort((a, b) => a.start - b.start || b.end - a.end).map((s, id) => ({ ...s, id }));
}

/** A property read the enclosing call (through parentheses, `as` and `!`) calls as a method. */
function isCallee(e: ts.Expression): boolean {
  if (!ts.isPropertyAccessExpression(skipParens(e)) && !ts.isElementAccessExpression(skipParens(e))) return false;
  let n: ts.Node = e;
  while (ts.isParenthesizedExpression(n.parent) || ts.isAsExpression(n.parent) || ts.isNonNullExpression(n.parent)) n = n.parent;
  return (ts.isCallExpression(n.parent) || ts.isTaggedTemplateExpression(n.parent)) && (ts.isCallExpression(n.parent) ? n.parent.expression : n.parent.tag) === n;
}

function skipParens(e: ts.Expression): ts.Expression {
  while (ts.isParenthesizedExpression(e)) e = e.expression;
  return e;
}

/** A literal that is a destructuring target, or nested in one: its fields are places, and a guard around one is a syntax error. */
function isAssignmentTarget(n: ts.Node): boolean {
  for (;;) {
    const p = n.parent;
    if ((ts.isPropertyAssignment(p) && p.initializer === n) || ts.isSpreadAssignment(p)) n = p.parent;
    else if (ts.isArrayLiteralExpression(p) || ts.isSpreadElement(p) || ts.isParenthesizedExpression(p)) n = p;
    else break;
  }
  const p = n.parent;
  return (ts.isBinaryExpression(p) && p.left === n && p.operatorToken.kind === ts.SyntaxKind.EqualsToken) || (ts.isForOfStatement(p) && p.initializer === n);
}

/**
 * The sites split into builds of their own: none nesting another and at most `perStatement` in one statement, since
 * guards inside guards make expressions swiftc gives up type-checking ("failed to produce diagnostic").
 */
export function groups(sites: Site[], perStatement = 3): Site[][] {
  const out: Site[][] = [];
  for (const s of [...sites].sort((a, b) => a.start - b.start || b.end - a.end)) {
    const fits = (g: Site[]) => !g.some((o) => o.start < s.end && s.start < o.end) && g.filter((o) => o.statement === s.statement).length < perStatement;
    const g = out.find(fits);
    if (g) g.push(s);
    else out.push([s]);
  }
  return out;
}

/** The hook module's name, beside the case. */
export const HOOK = '__fuzz';

/**
 * `text` with each of `sites` guarded, and the hook imported last so every line keeps its number;
 * with each site's span in the result, to tell which site a diagnostic of the result is in.
 */
export function instrument(text: string, sites: Site[]): { text: string; spans: Map<number, [number, number]> } {
  const sorted = [...sites].sort((a, b) => a.start - b.start || b.end - a.end);
  const spans = new Map<number, [number, number]>();
  const render = (from: number, to: number, list: Site[], at: number): string => {
    let out = '', pos = from, i = 0;
    while (i < list.length) {
      const s = list[i];
      let j = i + 1;
      while (j < list.length && list[j].start < s.end) j++;
      out += text.slice(pos, s.start);
      const wrong = s.type === null ? '__fzv()' : `(__fzv() as any as (${s.type}))`;
      const head = `${s.prefix}(__fz(${s.id}) ? ${wrong} : (`;
      const begin = at + out.length;
      const inner = render(s.start, s.end, list.slice(i + 1, j), begin + head.length);
      out += head + inner + '))';
      spans.set(s.id, [begin, at + out.length]);
      pos = s.end;
      i = j;
    }
    return out + text.slice(pos, to);
  };
  return { text: render(0, text.length, sorted, 0) + `\nimport { __fz, __fzv } from './${HOOK}.ts';\n`, spans };
}

/** The site and wrong value one run selects, read from `globalThis.__fuzz` (`<site>:<value>`), which the entry point sets. */
export function hookSource(): string {
  return `const selected = String((globalThis as any).__fuzz ?? '');
const colon = selected.indexOf(':');
const site = colon > 0 ? Number(selected.slice(0, colon)) : -1;
const value = colon > 0 ? Number(selected.slice(colon + 1)) : -1;
export function __fz(id: number): boolean {
  return id === site;
}
export function __fzv(): any {
  switch (value) {
${BAD_VALUES.map((v, k) => `    case ${k}: return ${v};`).join('\n')}
  }
  return undefined;
}
`;
}

/** Node's hook: the same choice, plus a count of each site's evaluations written to $NS_FUZZ_CENSUS at exit. */
export function nodeHookSource(): string {
  return `import { writeFileSync } from 'node:fs';
const selected = String(process.env.NS_FUZZ ?? '');
const colon = selected.indexOf(':');
const site = colon > 0 ? Number(selected.slice(0, colon)) : -1;
const value = colon > 0 ? Number(selected.slice(colon + 1)) : -1;
const census = process.env.NS_FUZZ_CENSUS ? new Map() : null;
if (census) process.on('exit', () => writeFileSync(process.env.NS_FUZZ_CENSUS, JSON.stringify([...census])));
export function __fz(id) {
  if (census) census.set(id, (census.get(id) ?? 0) + 1);
  return id === site;
}
const values = [${BAD_VALUES.map((v) => `() => (${v})`).join(', ')}];
export function __fzv() {
  return values[value]?.();
}
`;
}

/** The wrong values a site gets: undefined, null, one wrong primitive and one wrong object, the last two drawn by `rand`. */
export function valuesFor(site: Site, rand: () => number): number[] {
  const w = WRONG[site.category];
  const pick = (list: number[]) => list[Math.floor(rand() * list.length)];
  return [0, 1, pick(w.primitive), pick(w.object)];
}

/** The case's text with one site replaced by one wrong value, as a reader would write it: the repro. */
export function standalone(text: string, site: Site, value: number): string {
  const wrong = site.type === null ? `(${BAD_VALUES[value]} as any)` : `(${BAD_VALUES[value]} as any as ${site.type})`;
  return text.slice(0, site.start) + site.prefix + wrong + text.slice(site.end);
}
