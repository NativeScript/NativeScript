// Untyped values converted where they meet a typed slot. Both runtimes convert an untyped array into a new typed array,
// and an untyped object into a new object of an interface's class: a copy, not a view. Where the program can tell
// the copy apart from what it was made from (a write through it, a reference kept to it, an identity test), the
// release would print another result, so each such site is refused.
import ts from 'typescript';

export type SharingReport = (n: ts.Node, what: string, hint: string) => void;

type Use = { kind: 'writes to it' | 'keeps it' | 'compares it by identity'; at: ts.Node };

const MUTATORS = new Set(['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill', 'copyWithin', 'set']);
/** Methods whose callback runs before they return, so a callback reading a value doesn't keep it. */
const SYNC_CALLBACKS = new Set(['forEach', 'map', 'filter', 'find', 'findIndex', 'findLast', 'findLastIndex', 'some', 'every', 'reduce', 'reduceRight', 'flatMap', 'sort']);
/** Array methods whose result holds the receiver's own elements. */
const SAME_ELEMENTS = new Set(['filter', 'slice', 'concat', 'find', 'findLast', 'at', 'flat', 'pop', 'shift', 'toReversed', 'toSorted', 'toSpliced', 'reverse', 'sort', 'splice', 'values']);
/** Array methods whose result is a new array, and those whose result is their receiver. */
const NEW_ARRAY = new Set(['map', 'filter', 'slice', 'concat', 'flat', 'flatMap', 'split', 'toReversed', 'toSorted', 'toSpliced']);
const SAME_ARRAY = new Set(['fill', 'sort', 'reverse', 'copyWithin']);
const IDENTITY_ARG = new Set(['indexOf', 'lastIndexOf', 'includes']);
const KEY_ARG = new Set(['get', 'has', 'delete', 'set', 'add']);
const IDENTITY_OPS = new Set([ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken]);

const isFunctionLike = (n: ts.Node): n is ts.FunctionLikeDeclaration => ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n) || ts.isMethodDeclaration(n) || ts.isConstructorDeclaration(n) || ts.isGetAccessor(n) || ts.isSetAccessor(n);
const isNullishLiteral = (e: ts.Expression) => e.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(e) && e.text === 'undefined') || ts.isVoidExpression(e);
const assignment = (k: ts.SyntaxKind) => k >= ts.SyntaxKind.FirstAssignment && k <= ts.SyntaxKind.LastAssignment;

/** `lenient` names the files translated as written without types (a plugin's), where an interface's value stays untyped. */
export function checkSharing(checker: ts.TypeChecker, files: readonly ts.SourceFile[], report: SharingReport, keeps?: (st: ts.Statement) => boolean, lenient: (file: string) => boolean = () => false): void {
  const isAny = (t: ts.Type) => !!(t.flags & ts.TypeFlags.Any);
  const appDeclared = (d: ts.Declaration) => !d.getSourceFile().isDeclarationFile && !/[\\/]node_modules[\\/]/.test(d.getSourceFile().fileName);

  /** The copy a slot of type `t` makes of an untyped value: 'array', 'object' (an app interface's class), or none. */
  const copyKind = (t: ts.Type, at: ts.Node): 'array' | 'object' | null => {
    t = checker.getNonNullableType(t);
    const loose = lenient(at.getSourceFile().fileName);
    if (checker.isArrayType(t)) {
      const el = checker.getTypeArguments(t as ts.TypeReference)[0];
      if (loose) return el.flags & (ts.TypeFlags.NumberLike | ts.TypeFlags.StringLike | ts.TypeFlags.BooleanLike) ? 'array' : null;
      return isAny(el) || el.flags & ts.TypeFlags.TypeParameter ? null : 'array';
    }
    if (loose || !(t.flags & ts.TypeFlags.Object) || checker.isTupleType(t) || t.getCallSignatures().length || t.getConstructSignatures().length) return null;
    const decls = (t.aliasSymbol ?? t.getSymbol())?.declarations ?? [];
    return decls.length && decls.every((d) => (ts.isInterfaceDeclaration(d) || ts.isTypeLiteralNode(d) || ts.isTypeAliasDeclaration(d)) && appDeclared(d)) ? 'object' : null;
  };
  /** A value of type `from` given to a slot of type `to` becomes a new array or object. */
  const converts = (from: ts.Type, to: ts.Type, at: ts.Node) => {
    const kind = copyKind(to, at);
    if (!kind) return null;
    if (isAny(from)) return kind;
    const f = checker.getNonNullableType(from);
    return kind === 'array' && checker.isArrayType(f) && isAny(checker.getTypeArguments(f as ts.TypeReference)[0]) ? kind : null;
  };
  /** A value nothing else can hold: what its copy is made from is never seen again. */
  const fresh = (e: ts.Expression): boolean => {
    e = skip(e);
    while (ts.isAsExpression(e) || ts.isTypeAssertionExpression(e)) e = skip(e.expression);
    if (isNullishLiteral(e) || ts.isLiteralExpression(e)) return true;
    if (ts.isArrayLiteralExpression(e) || ts.isObjectLiteralExpression(e) || ts.isNewExpression(e)) return true;
    if (!ts.isCallExpression(e)) return false;
    const c = e.expression;
    if (ts.isIdentifier(c)) return c.text === 'Array';
    if (!ts.isPropertyAccessExpression(c)) return false;
    const on = ts.isIdentifier(c.expression) ? c.expression.text : '';
    if ((on === 'JSON' && c.name.text === 'parse') || (on === 'Array' && (c.name.text === 'from' || c.name.text === 'of'))) return true;
    return NEW_ARRAY.has(c.name.text) || (SAME_ARRAY.has(c.name.text) && fresh(c.expression));
  };
  const skip = (e: ts.Expression): ts.Expression => {
    while (ts.isParenthesizedExpression(e) || ts.isNonNullExpression(e) || ts.isSatisfiesExpression(e)) e = e.expression;
    return e;
  };
  /** A value read from a copy that is itself a copy (an interface-typed member, an array of them): its uses count too. */
  const copied = (e: ts.Node) => !!copyKind(checker.getTypeAtLocation(e), e);
  const elementCopied = (array: ts.Expression) => {
    const t = checker.getNonNullableType(checker.getTypeAtLocation(array));
    return checker.isArrayType(t) && !!copyKind(checker.getTypeArguments(t as ts.TypeReference)[0], array);
  };
  const declOf = (e: ts.Expression): ts.SignatureDeclaration | undefined => {
    const d = checker.getResolvedSignature(e.parent as ts.CallLikeExpression)?.getDeclaration();
    return d && !ts.isJSDocSignature(d) && isFunctionLike(d) && d.body && appDeclared(d) ? d : undefined;
  };

  const paramUses = new Map<ts.ParameterDeclaration, Use | null>();
  /** How a function uses its parameter, through the functions it hands it to. */
  const paramUse = (p: ts.ParameterDeclaration): Use | null => {
    if (paramUses.has(p)) return paramUses.get(p)!;
    paramUses.set(p, null);
    const fn = p.parent as ts.FunctionLikeDeclaration;
    const sym = ts.isIdentifier(p.name) ? checker.getSymbolAtLocation(p.name) : undefined;
    const use = sym && fn.body ? symbolUse(sym, fn.body) : null;
    paramUses.set(p, use);
    return use;
  };
  /** The first use of `sym` within `scope` that tells a copy from its source. */
  const symbolUses = new Map<ts.Symbol, Use | null>();
  const symbolUse = (sym: ts.Symbol, scope: ts.Node): Use | null => {
    if (symbolUses.has(sym)) return symbolUses.get(sym)!;
    symbolUses.set(sym, null);
    let found: Use | null = null;
    const visit = (n: ts.Node): void => {
      if (found) return;
      if (ts.isIdentifier(n) && n.parent && !((ts.isParameter(n.parent) || ts.isVariableDeclaration(n.parent) || ts.isBindingElement(n.parent)) && n.parent.name === n) && checker.getSymbolAtLocation(n) === sym || (ts.isShorthandPropertyAssignment(n) && checker.getShorthandAssignmentValueSymbol(n) === sym)) {
        found = ts.isShorthandPropertyAssignment(n) ? { kind: 'keeps it', at: n } : escapes(n as ts.Identifier, scope) ?? valueUse(n as ts.Identifier, true);
        if (found) return;
      }
      ts.forEachChild(n, visit);
    };
    visit(scope);
    symbolUses.set(sym, found);
    return found;
  };
  /** A reference inside a function made within `scope` (other than a callback run on the spot) outlives the call. */
  const escapes = (ref: ts.Node, scope: ts.Node): Use | null => {
    for (let n = ref.parent; n && n !== scope; n = n.parent) {
      if (!isFunctionLike(n)) continue;
      const call = n.parent;
      if (ts.isCallExpression(call) && call.arguments.includes(n as ts.Expression) && ts.isPropertyAccessExpression(call.expression) && SYNC_CALLBACKS.has(call.expression.name.text)) continue;
      return { kind: 'keeps it', at: n };
    }
    return null;
  };
  /** What happens to the value `e` evaluates to; `bare` is a reference to the binding itself, which assigning rebinds. */
  const valueUse = (e: ts.Expression, bare = false): Use | null => {
    const p = e.parent;
    if (ts.isParenthesizedExpression(p) || ts.isNonNullExpression(p) || ts.isAsExpression(p) || ts.isTypeAssertionExpression(p) || ts.isSatisfiesExpression(p)) return valueUse(p);
    if (ts.isConditionalExpression(p)) return p.condition === e ? null : valueUse(p);
    if (ts.isBinaryExpression(p)) {
      const op = p.operatorToken.kind;
      if (assignment(op) && p.left === e) return bare ? null : { kind: 'writes to it', at: p };
      if (op === ts.SyntaxKind.EqualsToken) {
        const left = skip(p.left);
        const local = ts.isIdentifier(left) ? checker.getSymbolAtLocation(left) : undefined;
        const decl = local?.valueDeclaration;
        if (local && decl && ts.isVariableDeclaration(decl) && !isModuleLevel(decl)) return symbolUse(local, functionOf(decl) ?? decl.getSourceFile());
        return { kind: 'keeps it', at: p };
      }
      if (IDENTITY_OPS.has(op)) return isNullishLiteral(skip(p.left === e ? p.right : p.left)) ? null : { kind: 'compares it by identity', at: p };
      if (op === ts.SyntaxKind.QuestionQuestionToken || op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.AmpersandAmpersandToken) return valueUse(p);
      if (op === ts.SyntaxKind.CommaToken) return p.right === e ? valueUse(p) : null;
      return null;
    }
    if ((ts.isPrefixUnaryExpression(p) || ts.isPostfixUnaryExpression(p)) && (p.operator === ts.SyntaxKind.PlusPlusToken || p.operator === ts.SyntaxKind.MinusMinusToken)) return bare ? null : { kind: 'writes to it', at: p };
    if (ts.isDeleteExpression(p)) return { kind: 'writes to it', at: p };
    if ((ts.isPropertyAccessExpression(p) || ts.isElementAccessExpression(p)) && p.expression === e) {
      const call = p.parent;
      if (ts.isPropertyAccessExpression(p) && ts.isCallExpression(call) && call.expression === p) {
        const name = p.name.text;
        if (MUTATORS.has(name) && checker.isArrayType(checker.getNonNullableType(checker.getTypeAtLocation(e)))) return { kind: 'writes to it', at: call };
        if (SYNC_CALLBACKS.has(name)) for (const cb of call.arguments) if (ts.isArrowFunction(cb) || ts.isFunctionExpression(cb)) {
          // The callback's element and array parameters are the receiver's own.
          for (const [k, prm] of cb.parameters.entries()) {
            if ((k === 0 || k === (name.startsWith('reduce') ? 3 : 2)) && ts.isIdentifier(prm.name) && (k > 0 || elementCopied(e))) {
              const s = checker.getSymbolAtLocation(prm.name);
              const u = s && cb.body ? symbolUse(s, cb.body) : null;
              if (u) return u;
            }
          }
        }
        return SAME_ELEMENTS.has(name) && elementCopied(e) ? valueUse(call) : null;
      }
      // A member written on the copy, or a member's value that is itself a copy. An interface's class writes a named
      // member through to the object it was read from (`jsWriteThrough`); an array's copy has no such link.
      if (written(p)) return ts.isPropertyAccessExpression(p) && !ts.isDeleteExpression(p.parent) && copyKind(checker.getTypeAtLocation(e), e) === 'object' ? null : { kind: 'writes to it', at: p.parent };
      return copied(p) ? valueUse(p) : null;
    }
    if ((ts.isCallExpression(p) || ts.isNewExpression(p)) && p.arguments?.includes(e)) {
      const k = p.arguments.indexOf(e);
      const callee = ts.isCallExpression(p) && ts.isPropertyAccessExpression(p.expression) ? p.expression.name.text : undefined;
      if (callee && ((IDENTITY_ARG.has(callee) && k === 0) || (KEY_ARG.has(callee) && k === 0 && collectionReceiver(p.expression as ts.PropertyAccessExpression)))) return { kind: 'compares it by identity', at: p };
      if (callee && (callee === 'push' || callee === 'unshift' || callee === 'splice') || (callee === 'set' && k === 1)) return { kind: 'keeps it', at: p };
      if (ts.isCallExpression(p) && ts.isPropertyAccessExpression(p.expression) && ts.isIdentifier(p.expression.expression) && p.expression.expression.text === 'Object' && callee === 'is') return { kind: 'compares it by identity', at: p };
      const d = declOf(e);
      const prm = d?.parameters[Math.min(k, d.parameters.length - 1)];
      if (prm && !prm.dotDotDotToken) return paramUse(prm);
      return null;
    }
    if (ts.isReturnStatement(p) || (ts.isArrowFunction(p) && p.body === e)) return { kind: 'keeps it', at: p };
    if (ts.isVariableDeclaration(p) && p.initializer === e && ts.isIdentifier(p.name)) {
      const s = checker.getSymbolAtLocation(p.name);
      return s ? symbolUse(s, functionOf(p) ?? p.getSourceFile()) : null;
    }
    if (ts.isForOfStatement(p) && p.expression === e) {
      const d = ts.isVariableDeclarationList(p.initializer) ? p.initializer.declarations[0] : undefined;
      const s = d && ts.isIdentifier(d.name) && elementCopied(e) ? checker.getSymbolAtLocation(d.name) : undefined;
      return s ? symbolUse(s, p.statement) : null;
    }
    if (ts.isPropertyAssignment(p) || ts.isArrayLiteralExpression(p) || ts.isPropertyDeclaration(p) || ts.isYieldExpression(p)) return { kind: 'keeps it', at: p };
    return null;
  };
  const written = (e: ts.Expression): boolean => {
    while (ts.isParenthesizedExpression(e.parent) || ts.isNonNullExpression(e.parent)) e = e.parent;
    const p = e.parent;
    if (ts.isBinaryExpression(p)) return p.left === e && assignment(p.operatorToken.kind);
    return ts.isDeleteExpression(p) || ((ts.isPrefixUnaryExpression(p) || ts.isPostfixUnaryExpression(p)) && (p.operator === ts.SyntaxKind.PlusPlusToken || p.operator === ts.SyntaxKind.MinusMinusToken));
  };
  const isModuleLevel = (d: ts.VariableDeclaration) => !functionOf(d);
  const functionOf = (n: ts.Node): ts.Node | undefined => {
    for (let x = n.parent; x; x = x.parent) if (isFunctionLike(x)) return x.body;
    return undefined;
  };
  const collectionReceiver = (pa: ts.PropertyAccessExpression) => {
    const name = checker.getNonNullableType(checker.getTypeAtLocation(pa.expression)).getSymbol()?.name;
    return name === 'Map' || name === 'Set' || name === 'WeakMap' || name === 'WeakSet';
  };
  const describe = (u: Use) => {
    const sf = u.at.getSourceFile();
    return `${u.kind} (${sf.fileName.split(/[\\/]/).pop()}:${sf.getLineAndCharacterOfPosition(u.at.getStart(sf)).line + 1})`;
  };
  const noun = (k: 'array' | 'object') => (k === 'array' ? 'a new array' : "a new object of the interface's class");
  const HINT = 'give the value its type where it is made (`const out: number[] = []`, a typed field), so no copy is made; or copy explicitly (`const copy: number[] = Array.from(raw)`) and write the results back yourself';

  const visit = (n: ts.Node): void => {
    // An argument converted for an app function that writes to its parameter, keeps it or compares it.
    if ((ts.isCallExpression(n) || ts.isNewExpression(n)) && n.arguments?.length) {
      const sig = checker.getResolvedSignature(n);
      const d = sig?.getDeclaration();
      const fn = d && !ts.isJSDocSignature(d) && isFunctionLike(d) && d.body && appDeclared(d) ? d : undefined;
      const pa = ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) ? n.expression : undefined;
      n.arguments.forEach((a, k) => {
        if (ts.isSpreadElement(a) || fresh(a)) return;
        const prm = fn?.parameters[k];
        if (fn && prm && !prm.dotDotDotToken) {
          const kind = converts(checker.getTypeAtLocation(a), checker.getTypeAtLocation(prm), prm);
          const use = kind && paramUse(prm);
          if (kind && use) report(a, `\`${a.getText()}\` given to ${calleeName(n)}'s parameter \`${prm.name.getText()}\`: an untyped value converted into ${noun(kind)}, a copy, where ${calleeName(n)} ${describe(use)}`, HINT);
          return;
        }
        // An untyped value looked up by identity in a typed array, map or set: its copy is never the one held.
        if (pa && k === 0 && (IDENTITY_ARG.has(pa.name.text) || (KEY_ARG.has(pa.name.text) && collectionReceiver(pa))) && isAny(checker.getTypeAtLocation(a)) && sig) {
          const pt = sig.getParameters()[0] && checker.getTypeOfSymbolAtLocation(sig.getParameters()[0], n);
          const kind = pt && copyKind(pt, n);
          if (kind) report(a, `\`${a.getText()}\` looked up by identity with ${pa.name.text}(): an untyped value converted into ${noun(kind)}, a copy, which is never the one held`, HINT);
        }
      });
    }
    // A local given an untyped value: a copy, so writes through it and identity tests on it differ from its source.
    if (ts.isVariableDeclaration(n) && n.initializer && ts.isIdentifier(n.name) && n.type && !fresh(n.initializer)) {
      const kind = converts(checker.getTypeAtLocation(n.initializer), checker.getTypeAtLocation(n.name), n);
      const s = kind && checker.getSymbolAtLocation(n.name);
      const use = s ? symbolUse(s, functionOf(n) ?? n.getSourceFile()) : null;
      if (kind && use && use.kind !== 'keeps it') report(n, `\`${n.name.text}\`, an untyped value converted into ${noun(kind)} (a copy), where the code ${describe(use)}`, HINT);
    }
    // `raw as T`: the same copy.
    if ((ts.isAsExpression(n) || ts.isTypeAssertionExpression(n)) && !fresh(n.expression)) {
      const kind = converts(checker.getTypeAtLocation(n.expression), checker.getTypeAtLocation(n), n);
      const use = kind ? valueUse(n) : null;
      if (kind && use && use.kind !== 'keeps it') report(n, `\`${n.getText()}\`, an untyped value converted into ${noun(kind)} (a copy), where the code ${describe(use)}`, HINT);
    }
    ts.forEachChild(n, visit);
  };
  const calleeName = (n: ts.CallExpression | ts.NewExpression) => {
    const c = ts.isCallExpression(n) ? n.expression : n.expression;
    return ts.isPropertyAccessExpression(c) ? c.name.text : c.getText().slice(0, 40);
  };
  for (const sf of files) if (!sf.isDeclarationFile) for (const st of sf.statements) if (!keeps || keeps(st)) visit(st);
}

/** Names of members the program writes on objects that are not class instances (`options.width = 2`, `o.count++`). */
export function assignedMembers(checker: ts.TypeChecker, files: readonly ts.SourceFile[]): Set<string> {
  const names = new Set<string>();
  const note = (target: ts.Expression) => {
    if (!ts.isPropertyAccessExpression(target)) return;
    const owner = checker.getSymbolAtLocation(target.name)?.declarations?.[0]?.parent;
    if (!owner || !ts.isClassLike(owner)) names.add(target.name.text);
  };
  const visit = (n: ts.Node): void => {
    if (ts.isBinaryExpression(n) && assignment(n.operatorToken.kind)) note(n.left);
    else if ((ts.isPrefixUnaryExpression(n) || ts.isPostfixUnaryExpression(n)) && (n.operator === ts.SyntaxKind.PlusPlusToken || n.operator === ts.SyntaxKind.MinusMinusToken)) note(n.operand);
    ts.forEachChild(n, visit);
  };
  for (const sf of files) if (!sf.isDeclarationFile) visit(sf);
  return names;
}
