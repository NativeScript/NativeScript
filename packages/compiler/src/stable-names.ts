import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import ts from 'typescript';

// The checker names a member keyed by a unique symbol `__@key@8429`, after the symbol's id, and ids are handed out in
// the order the checker is asked things (process-wide, across programs). Generated names made from that would change
// whenever any analysis asks in another order, so they are made from the symbol's declaration instead.

const UNIQUE = /^__@(.+)@\d+$/;
const names = new WeakMap<ts.Symbol, string>();

/**
 * A property's name for generated code: its own, or for a unique symbol's key `__@<description>@<n>`, `n` from the
 * declaring file's package path and the declaration's place among that file's declarations of the same name.
 */
export function memberName(p: ts.Symbol, checker: ts.TypeChecker): string {
  const name = p.name, m = UNIQUE.exec(name);
  if (!m) return name;
  let stable = names.get(p);
  if (stable === undefined) {
    const d = uniqueSymbolDeclaration(p, checker);
    stable = d ? `__@${m[1]}@${declarationKey(d)}` : name;
    names.set(p, stable);
  }
  return stable;
}

/** The declaration of the unique symbol whose key names `p`. */
function uniqueSymbolDeclaration(p: ts.Symbol, checker: ts.TypeChecker): ts.Declaration | undefined {
  const named = (t: ts.Type | undefined) => (t && t.flags & ts.TypeFlags.UniqueESSymbol && (t as ts.UniqueESSymbolType).escapedName === p.escapedName ? t.symbol?.declarations?.[0] : undefined);
  for (const d of p.declarations ?? []) {
    const key = keyExpression(d);
    const found = key && named(checker.getTypeAtLocation(key));
    if (found) return found;
  }
  // A mapped type's member (`Record<typeof key, unknown>`, what `key in this` narrows to) has no declaration, only its key's type.
  return named((p as { links?: { nameType?: ts.Type } }).links?.nameType);
}

function keyExpression(d: ts.Declaration): ts.Expression | undefined {
  const name = ts.getNameOfDeclaration(d);
  if (name && ts.isComputedPropertyName(name)) return name.expression;
  if (ts.isElementAccessExpression(d)) return d.argumentExpression;
  if (ts.isBinaryExpression(d) && ts.isElementAccessExpression(d.left)) return d.left.argumentExpression;
  return undefined;
}

function declarationKey(d: ts.Declaration): number {
  const file = d.getSourceFile(), text = ts.getNameOfDeclaration(d)?.getText(file) ?? '';
  let ordinal = 0, found = false;
  const visit = (n: ts.Node): void => {
    if (found) return;
    if (n === d) { found = true; return; }
    if (NAMED.some((is) => is(n)) && ts.getNameOfDeclaration(n as ts.Declaration)?.getText(file) === text) ordinal++;
    ts.forEachChild(n, visit);
  };
  visit(file);
  return parseInt(createHash('sha1').update(`${packagePath(file.fileName)}#${ordinal}`).digest('hex').slice(0, 7), 16);
}

const NAMED: ((n: ts.Node) => boolean)[] = [ts.isVariableDeclaration, ts.isPropertyDeclaration, ts.isPropertySignature, ts.isParameter, ts.isBindingElement,
  ts.isPropertyAssignment, ts.isMethodDeclaration, ts.isMethodSignature, ts.isFunctionDeclaration, ts.isClassDeclaration, ts.isAccessor, ts.isEnumMember];

const packages = new Map<string, string | null>();

/** A file's path within its package, after the package's name: the same in every checkout and install. */
function packagePath(file: string): string {
  for (let dir = dirname(file); ; dir = dirname(dir)) {
    let name = packages.get(dir);
    if (name === undefined) {
      const manifest = join(dir, 'package.json');
      try { name = existsSync(manifest) ? (JSON.parse(readFileSync(manifest, 'utf8')).name ?? '') as string : null; } catch { name = ''; }
      packages.set(dir, name);
    }
    if (name !== null) return `${name}/${relative(dir, file)}`;
    if (dirname(dir) === dir) return file.slice(file.lastIndexOf('/') + 1);
  }
}
