import ts from 'typescript';
import { isCoreDeclaration } from './core.ts';

/**
 * Plugin idioms that patch @nativescript/core at run time, recognized so a
 * closed-world build can give them as explicit kit hooks:
 *
 * - a mixin function (`applyMixins(Target, [Mixin…])` whose body copies
 *   `Object.getOwnPropertyNames(base.prototype)` onto `derived.prototype`,
 *   wrapping methods the target has: the mixin's runs first): the mixin's
 *   methods join the core class (a Swift extension), its `initNativeView`/
 *   `disposeNativeView` become lifecycle hooks, its `[prop.setNative]`
 *   methods native setters of that class;
 * - `require('@nativescript/core/…').Name`: core's class of that name;
 * - `Core.prototype.method = function () { … }`: a replacement of a core
 *   class's method, which the kit takes as a hook where it has one.
 */
export interface Patterns {
  /** A mixin class → the core class it is mixed into. */
  mixinTarget(cls: ts.ClassDeclaration): string | null;
  /** Whether a call is a recognized mixin application. */
  isMixinCall(call: ts.CallExpression): ts.ClassDeclaration[] | null;
  /** The core class a `require(…).Name` declaration names. */
  requiredCore(decl: ts.Node | undefined): string | null;
  /** `Core.prototype.method = function () { … }`: the core class, the method and the function. */
  prototypeMethod(e: ts.Expression): { target: string; method: string; fn: ts.FunctionExpression } | null;
}

export function recognizePatterns(checker: ts.TypeChecker, files: readonly ts.SourceFile[]): Patterns {
  const resolve = (n: ts.Node) => {
    const s = checker.getSymbolAtLocation(n);
    return s && s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s;
  };
  const isMixinFunction = (decl: ts.Declaration | undefined) => !!decl && ts.isFunctionDeclaration(decl) && !!decl.body
    && /Object\.getOwnPropertyNames\(\s*\w+\.prototype\s*\)/.test(decl.body.getText()) && /\w+\.prototype\[name\]\s*=/.test(decl.body.getText());
  const requiredCore = (decl: ts.Node | undefined): string | null => {
    if (!decl || !ts.isVariableDeclaration(decl) || !decl.initializer) return null;
    const init = decl.initializer;
    if (!ts.isPropertyAccessExpression(init) || !ts.isCallExpression(init.expression)) return null;
    const call = init.expression;
    if (!ts.isIdentifier(call.expression) || call.expression.text !== 'require' || !ts.isStringLiteralLike(call.arguments[0] ?? ts.factory.createIdentifier(''))) return null;
    return (call.arguments[0] as ts.StringLiteral).text.startsWith('@nativescript/core') ? init.name.text : null;
  };
  const targetName = (e: ts.Expression): string | null => {
    const sym = resolve(e);
    const decl = sym?.valueDeclaration;
    if (decl && ts.isClassDeclaration(decl) && isCoreDeclaration(decl)) return decl.name!.text;
    return requiredCore(decl);
  };
  const mixins = new Map<ts.ClassDeclaration, string>();
  const calls = new Map<ts.CallExpression, ts.ClassDeclaration[]>();
  for (const sf of files) {
    const visit = (n: ts.Node) => {
      if (ts.isCallExpression(n) && isMixinFunction(resolve(n.expression)?.valueDeclaration) && n.arguments.length >= 2) {
        const target = targetName(n.arguments[0]);
        const list = n.arguments[1];
        if (target && ts.isArrayLiteralExpression(list)) {
          const classes = list.elements.map((x) => resolve(x)?.valueDeclaration).filter((d): d is ts.ClassDeclaration => !!d && ts.isClassDeclaration(d));
          if (classes.length === list.elements.length && n.arguments.length === 2) {
            for (const c of classes) mixins.set(c, target);
            calls.set(n, classes);
          }
        }
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
  }
  const prototypeMethod = (e: ts.Expression) => {
    if (!ts.isBinaryExpression(e) || e.operatorToken.kind !== ts.SyntaxKind.EqualsToken || !ts.isFunctionExpression(e.right)) return null;
    const left = e.left;
    if (!ts.isPropertyAccessExpression(left) || !ts.isPropertyAccessExpression(left.expression) || left.expression.name.text !== 'prototype') return null;
    const target = targetName(left.expression.expression);
    return target ? { target, method: left.name.text, fn: e.right } : null;
  };
  return {
    mixinTarget: (cls) => mixins.get(cls) ?? null,
    isMixinCall: (call) => calls.get(call) ?? null,
    requiredCore,
    prototypeMethod,
  };
}
