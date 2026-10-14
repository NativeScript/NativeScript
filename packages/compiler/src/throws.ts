import ts from 'typescript';
import { intlConstructor, isStringRaw, iterationThrows, unsafeReceiver } from './lang.ts';

type Fn = ts.SignatureDeclaration & { body?: ts.Node };

/** The constructors of buffers and views, which throw a RangeError for a length or an offset out of bounds. */
const BUFFER_TYPES = new Set(['ArrayBuffer', 'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array', 'BigInt64Array', 'BigUint64Array', 'DataView']);
/** Library functions that throw on their own (a TypeError, a SyntaxError, a RangeError). */
const THROWING_BUILTINS = new Set(['JSON.parse', 'JSON.stringify', 'Array.reduce', 'Array.reduceRight', 'String.repeat', 'String.padStart', 'String.padEnd', 'String.fromCodePoint', 'String.normalize', 'String.matchAll', 'String.replaceAll', 'Date.toISOString', 'Object.assign', 'Object.fromEntries', 'Object.defineProperty', 'Object.defineProperties', 'WeakMap.set', 'WeakSet.add',
  'Iterator.next', 'Iterator.return', 'Iterator.throw', 'Generator.next', 'Generator.return', 'Generator.throw',
  ...['Int8', 'Uint8', 'Uint8Clamped', 'Int16', 'Uint16', 'Int32', 'Uint32', 'Float32', 'Float64', 'BigInt64', 'BigUint64'].flatMap((t) => [`${t}Array.set`, `${t}Array.reduce`, `${t}Array.reduceRight`, `${t}Array.from`]),
  ...['Int8', 'Uint8', 'Int16', 'Uint16', 'Int32', 'Uint32', 'Float32', 'Float64', 'BigInt64', 'BigUint64'].flatMap((t) => [`DataView.get${t}`, `DataView.set${t}`]),
  'Number.toLocaleString', 'BigInt.toLocaleString', 'Function.apply', 'CallableFunction.apply', 'Object.defineProperties', 'Object.getPrototypeOf', 'Array.toLocaleString', 'Date.toLocaleString', 'Date.toLocaleDateString', 'Date.toLocaleTimeString', 'DateTimeFormat.format',
  'atob', 'btoa', 'Crypto.getRandomValues', 'TextDecoder.decode']);

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

  /** Whether a call throws for what its declaration does not show: a native method Swift imports as `throws`, a method an instance can hold a value in place of. */
  private nativeThrows: (call: ts.CallExpression | ts.NewExpression) => boolean;

  /** A declaration file's method or constructor whose compiled implementation is in the program (library mode). */
  private implementation: (decl: ts.Declaration) => ts.Declaration | null;

  /** A member read by name at run time (library mode: one only a declaration file declares), which throws on undefined. */
  private dynamicMember: (e: ts.PropertyAccessExpression) => boolean;

  /** Whether converting a value to the type its place declares can fail (an untyped value cast to a class), which throws a TypeError. */
  private castThrows: (n: ts.Node) => boolean;

  /** Whether a call runs a native method by its native signature (an override of one in a native subclass): it throws only as `nativeThrows` says. */
  private nativeEntry: (call: ts.CallExpression) => boolean;

  /** Whether the translation evaluates an expression where nothing it throws escapes (a `delete` written with `try?`). */
  private quiet: (n: ts.Node) => boolean;

  /** Whether the kit's Swift a function stands for throws (`ColorMix.argbFromColorMix` for core's): undefined where the function's own body decides. */
  private kitThrows: (fn: ts.Node) => boolean | undefined;

  /** A getter Swift declares without `throws` (paired with a setter), which reports what its body throws. */
  private reported: (get: ts.GetAccessorDeclaration, throws: (fn: ts.Node) => boolean) => boolean;

  /** An expression the translation writes as a runtime helper that cannot throw (`jsConstructor(x)`), its operands aside. */
  private plain: (n: ts.Node) => boolean;

  constructor(checker: ts.TypeChecker, files: readonly ts.SourceFile[], untyped: (n: ts.Node) => boolean, nativeThrows: (call: ts.CallExpression | ts.NewExpression) => boolean = () => false, implementation: (decl: ts.Declaration) => ts.Declaration | null = () => null, dynamicMember: (e: ts.PropertyAccessExpression) => boolean = () => false, baseInitThrows: (cls: ts.ClassLikeDeclaration) => boolean = () => false, replaced: (fn: ts.Node) => boolean = () => false, castThrows: (n: ts.Node) => boolean = () => false, nativeEntry: (call: ts.CallExpression) => boolean = () => false, quiet: (n: ts.Node) => boolean = () => false, kitThrows: (fn: ts.Node) => boolean | undefined = () => undefined, reported: (get: ts.GetAccessorDeclaration, throws: (fn: ts.Node) => boolean) => boolean = () => false, plain: (n: ts.Node) => boolean = () => false) {
    this.kitThrows = kitThrows;
    this.reported = reported;
    this.plain = plain;
    this.castThrows = castThrows;
    this.nativeEntry = nativeEntry;
    this.quiet = quiet;
    this.baseInitThrows = baseInitThrows;
    this.implementation = implementation;
    this.dynamicMember = dynamicMember;
    this.checker = checker;
    this.files = files;
    this.untyped = untyped;
    this.nativeThrows = nativeThrows;
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
        // A member the kit implements instead is a call into its Swift, which throws.
        if (this.kitThrows(fn) === false) continue;
        if (replaced(fn) || this.bodyThrows(fn)) { this.throwing.add(fn); changed = true; }
      }
    }
  }

  /** Whether calling `fn` (a declaration with a body) can throw. */
  fn(fn: ts.Node): boolean {
    const kit = this.kitThrows(fn);
    if (kit !== undefined) return kit;
    if (this.throwing.has(fn)) return true;
    // Swift initializers override as methods do: a class's constructor throws if one in its hierarchy does.
    if (ts.isConstructorDeclaration(fn) && ts.isClassLike(fn.parent)) {
      for (const other of [...this.ancestors(fn.parent), ...this.descendants(fn.parent)]) {
        const c = other.members.find((x) => ts.isConstructorDeclaration(x) && x !== fn);
        if (c && this.throwing.has(c)) return true;
      }
    }
    // Swift overrides share `throws`: a method throws if any method of its name in the hierarchy does.
    if ((ts.isMethodDeclaration(fn) || ts.isGetAccessorDeclaration(fn)) && ts.isClassLike(fn.parent) && fn.name) {
      const name = fn.name.getText();
      // An overloaded method's signatures and implementation are one Swift method; a getter is not its setter.
      for (const other of [fn.parent, ...this.ancestors(fn.parent), ...this.descendants(fn.parent)]) {
        if (other.members.some((x) => x !== fn && x.kind === fn.kind && x.name?.getText() === name && this.throwing.has(x))) return true;
      }
    }
    return false;
  }

  /** Whether evaluating `e` (not the functions it creates) can throw. */
  expr(e: ts.Node): boolean {
    let found = false;
    const visit = (n: ts.Node) => {
      if (found || ts.isFunctionLike(n) || ts.isClassLike(n) || this.quiet(n)) return;
      if (this.nodeThrows(n)) { found = true; return; }
      ts.forEachChild(n, visit);
    };
    visit(e);
    return found;
  }

  private bodyThrows(fn: Fn): boolean {
    let found = false;
    const visit = (n: ts.Node) => {
      if (found || (n !== fn && (ts.isFunctionLike(n) || ts.isClassLike(n))) || this.quiet(n)) return;
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
      if ((ts.isObjectBindingPattern(p.name) || ts.isArrayBindingPattern(p.name)) && this.untyped(p.name)) found = true;
    }
    if (ts.isConstructorDeclaration(fn)) {
      for (const m of fn.parent.members) if (ts.isPropertyDeclaration(m) && m.initializer && !isStatic(m)) visit(m.initializer);
    }
    return found;
  }

  private nodeThrows(n: ts.Node): boolean {
    const c = this.checker;
    if (this.plain(n)) return false;
    if (this.castThrows(n)) return true;
    // A module's Angular `computed(fn)` read as a value (`readonly color = ink`) runs fn, as its Swift getter does.
    if (ts.isIdentifier(n) && !(ts.isCallExpression(n.parent) && n.parent.expression === n) && !ts.isImportSpecifier(n.parent) && !ts.isExportSpecifier(n.parent) && !ts.isImportClause(n.parent)) {
      let s = c.getSymbolAtLocation(n);
      if (s && s.flags & ts.SymbolFlags.Alias) s = c.getAliasedSymbol(s);
      const d = s?.valueDeclaration;
      const init = d && ts.isVariableDeclaration(d) && d.name !== n && ts.isSourceFile(d.parent.parent.parent) ? d.initializer : undefined;
      if (init && ts.isCallExpression(init) && init.expression.getText() === 'computed' && init.arguments[0] && ts.isFunctionLike(init.arguments[0])) return this.fn(init.arguments[0]);
    }
    // `array.length = n` of an n that may be no valid length is a RangeError.
    if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && isArrayLengthWrite(n.left, n.right, c)) return true;
    // BigInt division, remainder and exponent throw a RangeError (a zero divisor, a negative exponent).
    if (ts.isBinaryExpression(n) && [ts.SyntaxKind.SlashToken, ts.SyntaxKind.PercentToken, ts.SyntaxKind.AsteriskAsteriskToken, ts.SyntaxKind.SlashEqualsToken, ts.SyntaxKind.PercentEqualsToken, ts.SyntaxKind.AsteriskAsteriskEqualsToken].includes(n.operatorToken.kind)
      && c.getTypeAtLocation(n.left).flags & ts.TypeFlags.BigIntLike) return true;
    // Iterating a generator or a script's iterator runs its code.
    if ((ts.isSpreadElement(n) || ts.isForOfStatement(n)) && (iterationThrows(c.getTypeAtLocation(n.expression), c) || this.untyped(n.expression))) return true;
    if (ts.isVariableDeclaration(n) && ts.isArrayBindingPattern(n.name) && n.initializer && iterationThrows(c.getTypeAtLocation(n.initializer), c)) return true;
    // A native collection (`indexPathsForVisibleRows`) is iterated as the runtime gives it, running no script.
    const scriptIterable = (a: ts.Expression) => iterationThrows(c.getTypeAtLocation(a), c) && !(c.getTypeAtLocation(a).getSymbol()?.declarations ?? []).some((d) => isNativeDeclaration(d.getSourceFile()));
    if ((ts.isCallExpression(n) || ts.isNewExpression(n)) && n.arguments?.some(scriptIterable)) {
      // A library function iterates what it is given; native code is given the collection itself.
      const file = c.getResolvedSignature(n)?.getDeclaration()?.getSourceFile();
      if (file?.isDeclarationFile && !isNativeDeclaration(file)) return true;
    }
    if (ts.isCallExpression(n) && ts.isElementAccessExpression(n.expression) && iterationThrows(c.getTypeAtLocation(n.expression.expression), c)) return true;
    if (ts.isVariableDeclaration(n) && (ts.isObjectBindingPattern(n.name) || ts.isArrayBindingPattern(n.name)) && n.initializer && this.untyped(n.initializer)) return true;
    // Destructuring runs the getters of the members it reads.
    if (ts.isVariableDeclaration(n) && ts.isObjectBindingPattern(n.name) && n.initializer) {
      const t = c.getNonNullableType(c.getTypeAtLocation(n.initializer));
      if (n.name.elements.some((el) => !el.dotDotDotToken && (t.getProperty((el.propertyName ?? el.name).getText())?.declarations ?? []).some((d) => ts.isGetAccessorDeclaration(d) && !!d.body && !this.reported(d, (f) => this.fn(f)) && this.fn(d)))) return true;
    }
    // `new Array(x)` of an untyped x: a length that is no valid one is a RangeError.
    if ((ts.isNewExpression(n) || ts.isCallExpression(n)) && ts.isIdentifier(n.expression) && n.expression.text === 'Array' && n.arguments?.length === 1 && !isArrayLengthLiteral(n.arguments[0])
      && (this.untyped(n.arguments[0]) || !!(c.getTypeAtLocation(n.arguments[0]).flags & ts.TypeFlags.NumberLike))) return true;
    if (ts.isCallExpression(n) || ts.isNewExpression(n)) return this.callThrows(n);
    if (ts.isTaggedTemplateExpression(n)) return !isStringRaw(n.tag, c) && this.tagThrows(n);
    if (ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n)) {
      // Reading a member of an untyped value throws on undefined and null.
      if (this.untyped(n.expression)) return true;
      if (ts.isPropertyAccessExpression(n) && this.dynamicMember(n)) return true;
      if (ts.isPropertyAccessExpression(n) && !n.questionDotToken && unsafeReceiver(n.expression, c)) return true;
      if (ts.isPropertyAccessExpression(n) && !n.questionDotToken && c.getTypeAtLocation(n.expression).flags & ts.TypeFlags.Never) return true;
      const decl = c.getSymbolAtLocation(ts.isPropertyAccessExpression(n) ? n.name : n.argumentExpression)?.declarations?.[0];
      if (decl && ts.isGetAccessorDeclaration(decl) && decl.body && !isAssignmentTarget(n)) return !this.reported(decl, (f) => this.fn(f)) && this.fn(decl);
    }
    return false;
  }

  private callThrows(call: ts.CallExpression | ts.NewExpression): boolean {
    const c = this.checker;
    if (this.nativeThrows(call)) return true;
    const resolved = c.getResolvedSignature(call)?.getDeclaration();
    // Native code runs a Swift closure it is given without `throws`: a native method throws only as its Swift import does.
    if (ts.isCallExpression(call) && ((resolved && isNativeDeclaration(resolved.getSourceFile())) || this.nativeEntry(call))) return false;
    // A promise's executor runs inside its constructor, which rejects with what it throws.
    if (ts.isNewExpression(call) && ts.isIdentifier(call.expression) && call.expression.text === 'Promise' && resolved && isLibFile(resolved.getSourceFile())) return false;
    if (ts.isCallExpression(call) && ts.isPropertyAccessExpression(call.expression) && this.dynamicMember(call.expression)) return true;
    if (c.getTypeAtLocation(call.expression).flags & ts.TypeFlags.Any || (ts.isPropertyAccessExpression(call.expression) && this.untyped(call.expression.expression))) return true;
    // A class held untyped (not the library's or a framework's, which are made directly) is constructed by name (`jsConstruct`), which throws for what is no constructor.
    if (ts.isNewExpression(call) && this.untyped(call.expression) && !(c.getSymbolAtLocation(call.expression)?.declarations ?? []).some((d) => isLibFile(d.getSourceFile()) || isNativeDeclaration(d.getSourceFile()))) return true;
    if (call.expression.kind === ts.SyntaxKind.SuperKeyword) {
      const cls = ts.findAncestor(call, ts.isClassLike);
      const base = cls && this.ancestors(cls)[1];
      return base ? this.initThrows(base) : !!cls && this.baseInitThrows(cls);
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
    // A library function held (`export const parse = parseFloat`, `readonly round = Math.round`): Swift holds it as a function value, which throws.
    if (ts.isCallExpression(call) && init && (ts.isIdentifier(init) || ts.isPropertyAccessExpression(init)) && !holder!.getSourceFile().isDeclarationFile
      && (['parseInt', 'parseFloat'].includes(init.getText()) || !!signature?.getSourceFile().isDeclarationFile)) return true;
    if (ts.isCallExpression(call) && holder && !holder.getSourceFile().isDeclarationFile && !signature?.getSourceFile().isDeclarationFile
      && (ts.isVariableDeclaration(holder) || ts.isParameter(holder) || ts.isPropertyDeclaration(holder) || ts.isPropertySignature(holder) || ts.isPropertyAssignment(holder) || ts.isGetAccessorDeclaration(holder) || ts.isShorthandPropertyAssignment(holder))) return true;
    // A local holding a library function (`const dip = Utils.layout.toDeviceIndependentPixels`), or one a call made (`view.dispose.bind(view)`): a Swift function value, which throws.
    if (ts.isCallExpression(call) && holder && ts.isVariableDeclaration(holder) && !holder.getSourceFile().isDeclarationFile && holder.initializer && (ts.isPropertyAccessExpression(skipParens(holder.initializer)) || ts.isCallExpression(skipParens(holder.initializer)))) return true;
    const decl = c.getResolvedSignature(call)?.getDeclaration();
    const args = call.arguments ?? ts.factory.createNodeArray();
    // A callback the callee runs: a closure literal throws if its body does; any other function value is assumed to.
    const callbackThrows = () => args.some((a, k) => {
      // Only a parameter of a function type is called: `set.delete(f)` takes a function as a value.
      const param = decl && !ts.isJSDocSignature(decl) ? decl.parameters[Math.min(k, decl.parameters.length - 1)] : undefined;
      if (param?.type && !takesFunction(param.type, c)) return false;
      const arg = skipParens(a);
      if (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg)) return !isAsync(arg) && this.fn(arg);
      // A function declaration an array method is given by name (`list.sort(compare)`) is passed as it is, throwing as its body does.
      let named = ts.isIdentifier(arg) ? c.getSymbolAtLocation(arg) : undefined;
      if (named && named.flags & ts.SymbolFlags.Alias) named = c.getAliasedSymbol(named);
      // A library function passed by name (`parts.map(parseFloat)`) throws only where the library's does.
      if (named?.declarations?.length && named.declarations.every((d) => isLibFile(d.getSourceFile()))) return THROWING_BUILTINS.has(named.name);
      const fnDecl = named?.valueDeclaration;
      if (fnDecl && ts.isFunctionDeclaration(fnDecl) && fnDecl.body && !isAsync(fnDecl) && !fnDecl.asteriskToken && decl && builtinName(decl)?.startsWith('Array.')) return this.fn(fnDecl);
      return c.getTypeAtLocation(arg).getCallSignatures().length > 0;
    });
    if (ts.isNewExpression(call) && ts.isIdentifier(call.expression) && call.expression.text === 'RegExp') return true;
    // A buffer or a view of an invalid length is a RangeError.
    if (ts.isNewExpression(call) && ts.isIdentifier(call.expression) && BUFFER_TYPES.has(call.expression.text) && c.getSymbolAtLocation(call.expression)?.declarations?.every((d) => d.getSourceFile().isDeclarationFile)) return true;
    // A weak reference to an untyped value refuses a primitive.
    if (ts.isNewExpression(call) && ts.isIdentifier(call.expression) && call.expression.text === 'WeakRef' && args[0] && this.untyped(args[0])) return true;
    // Intl's constructors reject options out of range; BigInt() a value with no integer.
    if (intlConstructor(call.expression, c)) return true;
    if (ts.isIdentifier(call.expression) && call.expression.text === 'BigInt' && c.getSymbolAtLocation(call.expression)?.declarations?.every((d) => d.getSourceFile().isDeclarationFile)) return true;
    // A weak collection made from entries rejects a primitive key.
    if (ts.isNewExpression(call) && args.length && ts.isIdentifier(call.expression) && ['WeakMap', 'WeakSet'].includes(call.expression.text)) return true;
    // A program class constructed by the constructor it inherits from a declared one (`class TestClass extends ViewBase`): its own initializer.
    if (ts.isNewExpression(call) && decl && ts.isConstructorDeclaration(decl) && decl.getSourceFile().isDeclarationFile && this.implicitConstructorThrows(call)) return true;
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
    // A value the program holds, of a function type a declaration file names (`callback: ControlStateChangeListenerCallback`): a Swift function type, which throws.
    if (file.isDeclarationFile && ts.isFunctionTypeNode(decl) && holder && !holder.getSourceFile().isDeclarationFile && !/[\\/]lib\.[\w.]*\.d\.ts$/.test(file.fileName)) return true;
    const compiled = file.isDeclarationFile ? this.implementation(decl) : null;
    if (compiled) return (compiled as Fn).body ? this.fn(compiled) : false;
    if (file.isDeclarationFile) {
      const owner = builtinName(decl);
      // `s.match(x)` makes a RegExp of anything else, which can be a SyntaxError.
      if (owner === 'String.match' || owner === 'String.search') return !args[0] || c.getTypeAtLocation(args[0]).getSymbol()?.name !== 'RegExp';
      // `f.call(…)` and `f.apply(…)` run f, whose Swift function type throws.
      if (owner && /^(Callable|Newable)?Function\.(call|apply)$/.test(owner)) return true;
      // Digits or a radix out of range is a RangeError: only a literal in range is known not to throw.
      if (owner === 'Number.toFixed') return !!args[0] && digitsLiteral(args[0], 0, 100, 0) === null;
      if (owner === 'Number.toPrecision') return !!args[0] && digitsLiteral(args[0], 1, 100, null) === null;
      if (owner === 'Number.toString') return !!args[0] && digitsLiteral(args[0], 2, 36, null) === null;
      if (owner && THROWING_BUILTINS.has(owner)) return /\.reduce(Right)?$/.test(owner) ? args.length < 2 || callbackThrows() : true;
      // A timer runs its callback later, reporting what it throws.
      if (owner && TIMERS.has(owner)) return false;
      // The library runs callbacks synchronously (map, forEach, sort, find): it rethrows. A promise's callbacks reject instead.
      if (/[\\/]lib\.[\w.]*\.d\.ts$/.test(file.fileName) && !/^Promise/.test(owner ?? '')) return callbackThrows();
      return false;
    }
    // A function value (an arrow stored in a variable or an object) has a Swift function type, which throws.
    if (ts.isArrowFunction(decl) || ts.isFunctionExpression(decl) || (ts.isMethodDeclaration(decl) && ts.isObjectLiteralExpression(decl.parent))) return true;
    if ((decl as Fn).body) return this.fn(decl);
    // An abstract method throws as an override of it does.
    if (ts.isMethodDeclaration(decl) && ts.isClassLike(decl.parent) && ts.getModifiers(decl)?.some((m) => m.kind === ts.SyntaxKind.AbstractKeyword)) return this.fn(decl);
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
    return this.initThrows(decl);
  }

  /** Whether making an instance of a class throws: its own constructor's or its base's, or (Swift initializers sharing `throws`) one a subclass declares. */
  /** Whether the initializer a program class's native or kit base gives it without arguments throws (`super()` of a core view). */
  private baseInitThrows: (cls: ts.ClassLikeDeclaration) => boolean;

  initThrows(decl: ts.ClassLikeDeclaration): boolean {
    const chain = this.ancestors(decl);
    for (const cls of chain) {
      if (cls.members.some((m) => ts.isPropertyDeclaration(m) && !!m.initializer && !isStatic(m) && this.expr(m.initializer))) return true;
      const ctor = cls.members.find(ts.isConstructorDeclaration);
      if (ctor) return this.fn(ctor);
    }
    if (this.baseInitThrows(chain.at(-1)!)) return true;
    // An inherited initializer throws if any constructor of the hierarchy it comes from does.
    const root = this.ancestors(decl).at(-1)!;
    return [root, ...this.descendants(root)].some((d) => { const ctor = d.members.find(ts.isConstructorDeclaration); return !!ctor && this.throwing.has(ctor); });
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

/** A digits or radix argument that is an integer literal in `min…max` (`toFixed(2)`), which cannot throw; `absent` where there is none. */
export function digitsLiteral(e: ts.Expression | undefined, min: number, max: number, absent: number | null): number | null {
  if (!e) return absent;
  if (!ts.isNumericLiteral(e)) return null;
  const n = Number(e.text);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

/** `array.length = n` where n is not a literal valid length. */
export function isArrayLengthWrite(left: ts.Expression, right: ts.Expression, c: ts.TypeChecker): left is ts.PropertyAccessExpression {
  if (!ts.isPropertyAccessExpression(left) || left.name.text !== 'length' || isArrayLengthLiteral(right)) return false;
  const t = c.getNonNullableType(c.getTypeAtLocation(left.expression));
  return c.isArrayType(t);
}

/** A literal that is a valid array length (`new Array(3)`), which cannot throw. */
export function isArrayLengthLiteral(e: ts.Expression): boolean {
  if (!ts.isNumericLiteral(e)) return false;
  const n = Number(e.text);
  return Number.isInteger(n) && n >= 0 && n <= 4294967295;
}

/** The library's functions that run a callback later, never inside the call. */
const TIMERS = new Set(['setTimeout', 'setInterval', 'queueMicrotask', 'requestAnimationFrame', 'setImmediate']);

const isLibFile = (f: ts.SourceFile) => /[\\/]lib\.[\w.]*\.d\.ts$/.test(f.fileName);

/** An Objective-C framework's declarations (`objc!UIKit.d.ts`). */
export const isNativeDeclaration = (f: ts.SourceFile) => /[\\/]objc![^\\/]*\.d\.ts$/.test(f.fileName);

/** Whether a parameter's declared type can be a function the library calls. */
function takesFunction(t: ts.TypeNode, c: ts.TypeChecker): boolean {
  if (ts.isParenthesizedTypeNode(t)) return takesFunction(t.type, c);
  if (ts.isUnionTypeNode(t)) return t.types.some((u) => takesFunction(u, c));
  // A value of the collection's element type (`set.delete(value: T)`) is stored or compared, never called.
  if (ts.isTypeReferenceNode(t) && (c.getSymbolAtLocation(t.typeName)?.flags ?? 0) & ts.SymbolFlags.TypeParameter) return false;
  if (ts.isFunctionTypeNode(t) || ts.isConstructorTypeNode(t) || ts.isTypeLiteralNode(t)) return true;
  // A named type may be a function's (`CallableFunction`, a type parameter for one): not a primitive, array or keyword.
  return ts.isTypeReferenceNode(t) && !/^(ReadonlyArray|Array|Promise|PromiseLike|Map|Set|RegExp|Date|ArrayLike|Iterable)$/.test(t.typeName.getText());
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
