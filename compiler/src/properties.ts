import ts from 'typescript';

const PROPERTY_CLASSES = new Set(['Property', 'CssProperty', 'InheritedProperty', 'InheritedCssProperty', 'CoercibleProperty', 'ShorthandProperty']);

/**
 * The view properties the program defines with core's `Property` and
 * registers on classes: each property variable's name, and which names each
 * class (or core class) has. A field a class declares under a registered
 * name is that property, as core's accessor on the prototype makes it.
 */
export interface Properties {
  /** A property variable (`const fooProperty = new Property({ name: 'foo' })`) → its name. */
  name(sym: ts.Symbol | undefined): string | null;
  /** Names registered on a class the program declares. */
  onClass(decl: ts.ClassLikeDeclaration): Set<string>;
  /** Whether `name` is registered on this class or a class it extends. */
  isRegistered(decl: ts.ClassLikeDeclaration, name: string): boolean;
  /** Whether `name` is registered on any class (a subclass's prototype may hold its accessor). */
  isRegisteredAnywhere(name: string): boolean;
}

export function collectProperties(checker: ts.TypeChecker, files: readonly ts.SourceFile[]): Properties {
  const names = new Map<ts.Symbol, string>();
  const byClass = new Map<ts.Node, Set<string>>();
  const resolve = (n: ts.Node) => {
    const s = checker.getSymbolAtLocation(n);
    return s && s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s;
  };
  const propertyName = (sym: ts.Symbol | undefined): string | null => {
    if (!sym) return null;
    if (names.has(sym)) return names.get(sym)!;
    const decl = sym.valueDeclaration;
    if (!decl || !ts.isVariableDeclaration(decl) || !decl.initializer || !ts.isNewExpression(decl.initializer)) return null;
    const ctor = decl.initializer.expression;
    if (!ts.isIdentifier(ctor) || !PROPERTY_CLASSES.has(ctor.text)) return null;
    const options = decl.initializer.arguments?.[0];
    if (!options || !ts.isObjectLiteralExpression(options)) return null;
    const p = options.properties.find((x): x is ts.PropertyAssignment => ts.isPropertyAssignment(x) && x.name.getText() === 'name');
    if (!p || !ts.isStringLiteralLike(p.initializer)) return null;
    names.set(sym, p.initializer.text);
    return p.initializer.text;
  };
  for (const sf of files) {
    const visit = (n: ts.Node) => {
      if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === 'register' && n.arguments.length === 1) {
        const name = propertyName(resolve(n.expression.expression));
        const cls = resolve(n.arguments[0])?.valueDeclaration;
        if (name && cls && ts.isClassLike(cls)) {
          const set = byClass.get(cls) ?? new Set<string>();
          set.add(name);
          byClass.set(cls, set);
        }
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
  }
  const base = (decl: ts.ClassLikeDeclaration): ts.ClassLikeDeclaration | undefined => {
    const h = decl.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
    const d = h && checker.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
    return d && ts.isClassLike(d) ? d : undefined;
  };
  return {
    name: propertyName,
    onClass: (decl) => byClass.get(decl) ?? new Set(),
    isRegistered: (decl, name) => {
      for (let c: ts.ClassLikeDeclaration | undefined = decl; c; c = base(c)) if (byClass.get(c)?.has(name)) return true;
      return false;
    },
    isRegisteredAnywhere: (name) => [...byClass.values()].some((set) => set.has(name)),
  };
}
