import ts from 'typescript';
import { intlConstructor, isStringRaw, iterationThrows, unsafeReceiver } from './lang.ts';

type Fn = ts.SignatureDeclaration & { body?: ts.Node };

/** Library functions that throw on their own (a TypeError, a SyntaxError, a RangeError). */
const THROWING_BUILTINS = new Set(['JSON.parse', 'JSON.stringify', 'Array.reduce', 'Array.reduceRight', 'String.repeat', 'String.normalize', 'String.matchAll', 'String.replaceAll', 'Date.toISOString', 'Object.assign', 'WeakMap.set', 'WeakSet.add',
  'Iterator.next', 'Iterator.return', 'Iterator.throw', 'Generator.next', 'Generator.return', 'Generator.throw',
  'Number.toLocaleString', 'BigInt.toLocaleString', 'Function.apply', 'CallableFunction.apply', 'Array.toLocaleString', 'Date.toLocaleString', 'Date.toLocaleDateString', 'Date.toLocaleTimeString', 'DateTimeFormat.format']);

/**
 * Which functions throw, worked out across the call graph: a function is
 * Swift `throws` when its body throws, or calls something that does, outside
 * a `try` that catches. Calls through function values (a callback parameter,
 * a stored closure) count as throwing, because function types are `throws`
 * in Swift. Async functions never throw synchronously; their errors reject.
 */
export class Throws {
  private throwing = new Set<ts.Node>();
  private checker: ts.TypeChecker;
  private files: readonly ts.SourceFile[];
  /** Whether a value is untyped in Swift (`Any?`): reading its members goes through `jsGet`, which throws. */
  private untyped: (n: ts.Node) => boolean;

  constructor(checker: ts.TypeChecker, files: readonly ts.SourceFile[], untyped: (n: ts.Node) => boolean) {
    this.checker = checker;
    this.files = files;
    this.untyped = untyped;
    const fns: Fn[] = [];
    const collect = (n: ts.Node) => {
      if (ts.isFunctionLike(n) && (n as Fn).body) fns.push(n as Fn);
      ts.forEachChild(n, collect);
    };
    for (const f of files) collect(f);
    for (let changed = true; changed; ) {
      changed = false;
      for (const fn of fns) {
        if (this.throwing.has(fn) || isAsync(fn) || (fn as ts.FunctionLikeDeclaration).asteriskToken) continue;
        if (this.bodyThrows(fn)) { this.throwing.add(fn); changed = true; }
      }
    }
  }

  /** Whether calling `fn` (a declaration with a body) can throw. */
  fn(fn: ts.Node): boolean {
    if (this.throwing.has(fn)) return true;
    // Swift overrides share `throws`: a method throws if any method of its name in the hierarchy does.
    if ((ts.isMethodDeclaration(fn) || ts.isGetAccessorDeclaration(fn)) && ts.isClassLike(fn.parent) && fn.name) {
      const name = fn.name.getText();
      for (const other of [...this.ancestors(fn.parent), ...this.descendants(fn.parent)]) {
        const m = other.members.find((x) => x.name?.getText() === name && x !== fn);
        if (m && this.throwing.has(m)) return true;
      }
    }
    return false;
  }

  /** Whether evaluating `e` (not the functions it creates) can throw. */
  expr(e: ts.Node): boolean {
    let found = false;
    const visit = (n: ts.Node) => {
      if (found || ts.isFunctionLike(n) || ts.isClassLike(n)) return;
      if (this.nodeThrows(n)) { found = true; return; }
      ts.forEachChild(n, visit);
    };
    visit(e);
    return found;
  }

  private bodyThrows(fn: Fn): boolean {
    let found = false;
    const visit = (n: ts.Node) => {
      if (found || (n !== fn && (ts.isFunctionLike(n) || ts.isClassLike(n)))) return;
      if (ts.isTryStatement(n) && n.catchClause) {
        // What the try block throws is caught; the catch and finally blocks can still throw.
        visit(n.catchClause.block);
        if (n.finallyBlock) visit(n.finallyBlock);
        return;
      }
      if (ts.isThrowStatement(n) || this.nodeThrows(n)) { found = true; return; }
      ts.forEachChild(n, visit);
    };
    if (fn.body) visit(fn.body);
    for (const p of fn.parameters) {
      if (p.initializer) visit(p.initializer);
      // Destructuring an untyped argument reads its members, which throws on undefined and null.
      if (ts.isObjectBindingPattern(p.name) && this.untyped(p.name)) found = true;
    }
    if (ts.isConstructorDeclaration(fn)) {
      for (const m of fn.parent.members) if (ts.isPropertyDeclaration(m) && m.initializer && !isStatic(m)) visit(m.initializer);
    }
    return found;
  }

  private nodeThrows(n: ts.Node): boolean {
    const c = this.checker;
    // BigInt division, remainder and exponent throw a RangeError (a zero divisor, a negative exponent).
    if (ts.isBinaryExpression(n) && [ts.SyntaxKind.SlashToken, ts.SyntaxKind.PercentToken, ts.SyntaxKind.AsteriskAsteriskToken, ts.SyntaxKind.SlashEqualsToken, ts.SyntaxKind.PercentEqualsToken, ts.SyntaxKind.AsteriskAsteriskEqualsToken].includes(n.operatorToken.kind)
      && c.getTypeAtLocation(n.left).flags & ts.TypeFlags.BigIntLike) return true;
    // Iterating a generator or a script's iterator runs its code.
    if ((ts.isSpreadElement(n) || ts.isForOfStatement(n)) && iterationThrows(c.getTypeAtLocation(n.expression), c)) return true;
    if (ts.isVariableDeclaration(n) && ts.isArrayBindingPattern(n.name) && n.initializer && iterationThrows(c.getTypeAtLocation(n.initializer), c)) return true;
    if ((ts.isCallExpression(n) || ts.isNewExpression(n)) && n.arguments?.some((a) => iterationThrows(c.getTypeAtLocation(a), c)) && c.getResolvedSignature(n)?.getDeclaration()?.getSourceFile().isDeclarationFile) return true;
    if (ts.isCallExpression(n) && ts.isElementAccessExpression(n.expression) && iterationThrows(c.getTypeAtLocation(n.expression.expression), c)) return true;
    if (ts.isVariableDeclaration(n) && ts.isObjectBindingPattern(n.name) && n.initializer && this.untyped(n.initializer)) return true;
    if (ts.isCallExpression(n) || ts.isNewExpression(n)) return this.callThrows(n);
    if (ts.isTaggedTemplateExpression(n)) return !isStringRaw(n.tag, c) && this.tagThrows(n);
    if (ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n)) {
      // Reading a member of an untyped value throws on undefined and null.
      if (this.untyped(n.expression)) return true;
      if (ts.isPropertyAccessExpression(n) && !n.questionDotToken && unsafeReceiver(n.expression, c)) return true;
      if (ts.isPropertyAccessExpression(n) && !n.questionDotToken && c.getTypeAtLocation(n.expression).flags & ts.TypeFlags.Never) return true;
      const decl = c.getSymbolAtLocation(ts.isPropertyAccessExpression(n) ? n.name : n.argumentExpression)?.declarations?.[0];
      if (decl && ts.isGetAccessorDeclaration(decl) && decl.body && !isAssignmentTarget(n)) return this.fn(decl);
    }
    return false;
  }

  private callThrows(call: ts.CallExpression | ts.NewExpression): boolean {
    const c = this.checker;
    if (c.getTypeAtLocation(call.expression).flags & ts.TypeFlags.Any || (ts.isPropertyAccessExpression(call.expression) && this.untyped(call.expression.expression))) return true;
    if (call.expression.kind === ts.SyntaxKind.SuperKeyword) {
      const cls = ts.findAncestor(call, ts.isClassLike);
      const base = cls && this.ancestors(cls)[1];
      const ctor = base?.members.find(ts.isConstructorDeclaration);
      return ctor ? this.fn(ctor) : false;
    }
    // A call through a variable, parameter, property or getter holding a function: Swift function types throw.
    const callee = ts.isPropertyAccessExpression(call.expression) ? call.expression.name : call.expression;
    let held = c.getSymbolAtLocation(callee);
    if (held && held.flags & ts.SymbolFlags.Alias) held = c.getAliasedSymbol(held);
    const holder = held?.valueDeclaration;
    // Reading an Angular `computed(fn)` runs fn.
    const init = holder && (ts.isPropertyDeclaration(holder) || ts.isVariableDeclaration(holder)) ? holder.initializer : undefined;
    if (init && ts.isCallExpression(init) && init.expression.getText() === 'computed' && init.arguments[0] && ts.isFunctionLike(init.arguments[0])) return this.fn(init.arguments[0]);
    const signature = c.getResolvedSignature(call)?.getDeclaration();
    if (ts.isCallExpression(call) && holder && !holder.getSourceFile().isDeclarationFile && !signature?.getSourceFile().isDeclarationFile
      && (ts.isVariableDeclaration(holder) || ts.isParameter(holder) || ts.isPropertyDeclaration(holder) || ts.isPropertySignature(holder) || ts.isPropertyAssignment(holder) || ts.isGetAccessorDeclaration(holder) || ts.isShorthandPropertyAssignment(holder))) return true;
    const decl = c.getResolvedSignature(call)?.getDeclaration();
    const args = call.arguments ?? ts.factory.createNodeArray();
    // A callback the callee runs: a closure literal throws if its body does; any other function value is assumed to.
    const callbackThrows = () => args.some((a) => {
      const arg = skipParens(a);
      if (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg)) return !isAsync(arg) && this.fn(arg);
      return c.getTypeAtLocation(arg).getCallSignatures().length > 0;
    });
    if (ts.isNewExpression(call) && ts.isIdentifier(call.expression) && call.expression.text === 'RegExp') return true;
    // Intl's constructors reject options out of range; BigInt() a value with no integer.
    if (intlConstructor(call.expression, c)) return true;
    if (ts.isIdentifier(call.expression) && call.expression.text === 'BigInt' && c.getSymbolAtLocation(call.expression)?.declarations?.every((d) => d.getSourceFile().isDeclarationFile)) return true;
    // A weak collection made from entries rejects a primitive key.
    if (ts.isNewExpression(call) && args.length && ts.isIdentifier(call.expression) && ['WeakMap', 'WeakSet'].includes(call.expression.text)) return true;
    if (!decl || ts.isJSDocSignature(decl)) {
      if (ts.isNewExpression(call)) return this.implicitConstructorThrows(call);
      return true;
    }
    const file = decl.getSourceFile();
    // An overload signature: the implementation runs.
    if (!file.isDeclarationFile && !(decl as Fn).body && (ts.isConstructorDeclaration(decl) || ts.isMethodDeclaration(decl) || ts.isFunctionDeclaration(decl))) {
      const impl = ts.isConstructorDeclaration(decl) ? decl.parent.members.find((m) => ts.isConstructorDeclaration(m) && !!m.body)
        : ((ts.isMethodDeclaration(decl) ? decl.parent.members : (decl.parent as ts.SourceFile).statements) as ts.NodeArray<ts.Node>).find((m) => (ts.isMethodDeclaration(m) || ts.isFunctionDeclaration(m)) && !!m.body && m.name?.getText() === decl.name?.getText());
      if (impl) return this.fn(impl);
    }
    if (file.isDeclarationFile) {
      const owner = builtinName(decl);
      // `s.match(x)` makes a RegExp of anything else, which can be a SyntaxError.
      if (owner === 'String.match') return !args[0] || c.getTypeAtLocation(args[0]).getSymbol()?.name !== 'RegExp';
      if (owner && THROWING_BUILTINS.has(owner)) return owner === 'Array.reduce' || owner === 'Array.reduceRight' ? args.length < 2 || callbackThrows() : true;
      // The library runs callbacks synchronously (map, forEach, sort, find): it rethrows. A promise's callbacks reject instead.
      if (/[\\/]lib\.[\w.]*\.d\.ts$/.test(file.fileName) && !/^Promise/.test(owner ?? '')) return callbackThrows();
      return false;
    }
    // A function value (an arrow stored in a variable or an object) has a Swift function type, which throws.
    if (ts.isArrowFunction(decl) || ts.isFunctionExpression(decl)) return true;
    if ((decl as Fn).body) return this.fn(decl);
    // A signature without a body (an interface method, a function-typed member) is a function type.
    return !ts.isConstructorDeclaration(decl) && !ts.isClassLike(decl);
  }

  /** A tag is called as a function: through a function value it throws, else as its declaration does. */
  private tagThrows(e: ts.TaggedTemplateExpression): boolean {
    const decl = this.checker.getResolvedSignature(e)?.getDeclaration();
    if (!decl || ts.isJSDocSignature(decl) || decl.getSourceFile().isDeclarationFile) return !!decl && !decl.getSourceFile().isDeclarationFile;
    if ((decl as Fn).body && !ts.isArrowFunction(decl) && !ts.isFunctionExpression(decl)) return this.fn(decl);
    return true;
  }

  private implicitConstructorThrows(call: ts.NewExpression): boolean {
    const decl = this.checker.getTypeAtLocation(call.expression).getSymbol()?.valueDeclaration;
    if (!decl || !ts.isClassLike(decl) || decl.getSourceFile().isDeclarationFile) return false;
    for (const cls of this.ancestors(decl)) {
      if (cls.members.some((m) => ts.isPropertyDeclaration(m) && !!m.initializer && !isStatic(m) && this.expr(m.initializer))) return true;
      const ctor = cls.members.find(ts.isConstructorDeclaration);
      if (ctor) return this.fn(ctor);
    }
    return false;
  }

  /** The class and the app classes it extends, nearest first. */
  private ancestors(cls: ts.ClassLikeDeclaration): ts.ClassLikeDeclaration[] {
    const out: ts.ClassLikeDeclaration[] = [];
    for (let c: ts.ClassLikeDeclaration | undefined = cls; c; ) {
      out.push(c);
      const base = c.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
      const decl = base && this.checker.getTypeAtLocation(base.expression).getSymbol()?.valueDeclaration;
      c = decl && ts.isClassLike(decl) && !decl.getSourceFile().isDeclarationFile ? decl : undefined;
    }
    return out;
  }

  private descendants(cls: ts.ClassLikeDeclaration): ts.ClassLikeDeclaration[] {
    const out: ts.ClassLikeDeclaration[] = [];
    const visit = (n: ts.Node) => {
      if (ts.isClassLike(n) && n !== cls && this.ancestors(n).includes(cls)) out.push(n);
      ts.forEachChild(n, visit);
    };
    for (const f of this.files) visit(f);
    return out;
  }
}

export function isAsync(fn: ts.Node): boolean {
  return ts.canHaveModifiers(fn) && !!ts.getModifiers(fn)?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword);
}

export function isStatic(m: ts.Node): boolean {
  return ts.canHaveModifiers(m) && !!ts.getModifiers(m)?.some((x) => x.kind === ts.SyntaxKind.StaticKeyword);
}

function skipParens(e: ts.Expression): ts.Expression {
  while (ts.isParenthesizedExpression(e)) e = e.expression;
  return e;
}

function isAssignmentTarget(n: ts.Node): boolean {
  const p = n.parent;
  return ts.isBinaryExpression(p) && p.left === n && p.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && p.operatorToken.kind <= ts.SyntaxKind.LastAssignment;
}

/** `Array.reduce` for the lib's `reduce` in `interface Array<T>`. */
function builtinName(decl: ts.Declaration): string | null {
  const owner = decl.parent;
  const name = (decl as ts.NamedDeclaration).name?.getText();
  if (!name) return null;
  if (ts.isInterfaceDeclaration(owner)) return `${owner.name.text.replace(/^ReadonlyArray$/, 'Array').replace(/Constructor$/, '')}.${name}`;
  return name;
}
