import ts from 'typescript';
import type { Properties } from './properties.ts';

/**
 * A member a class reads and writes natively for a property core's property system
 * registers on it (`textProperty.register(TextBase)` for TextBase's `text`).
 * `register` defines the property's accessor on the class's prototype; the class's
 * native member calls that accessor directly, the nearest registering class's
 * member overriding its bases' as the prototype chain resolves it.
 */
export interface TypedMember {
  /** The class the property is registered on, which holds the member. */
  readonly cls: ts.ClassDeclaration;
  readonly name: string;
  /** The field declaring the member's type: the class's own, or the base's it overrides. */
  readonly field: ts.PropertyDeclaration;
  /** The field is a base's, which the class's member overrides. */
  readonly overrides: boolean;
}

export interface Members {
  /** The typed members a class holds, in the order its registrations come. */
  of(cls: ts.ClassLikeDeclaration): readonly TypedMember[];
  /** A class's own typed member for a name. */
  get(cls: ts.ClassLikeDeclaration, name: string): TypedMember | undefined;
  /** The members a statement's registration defines (`textProperty.register(TextBase);`), none for any other statement. */
  registeredBy(statement: ts.Statement): readonly TypedMember[];
}

/**
 * Each static registration (`fooProperty.register(Cls)`, a property `Properties` knows
 * registered on a class the program declares) whose name is a field the class or a
 * base declares. A name declared as an accessor or method, or not declared at all,
 * keeps its by-name access. A generic class holds no typed members: its statics
 * would be one per specialization.
 */
export function collectMembers(checker: ts.TypeChecker, files: readonly ts.SourceFile[], properties: Properties): Members {
  const byClass = new Map<ts.ClassLikeDeclaration, TypedMember[]>();
  const byStatement = new Map<ts.Statement, TypedMember[]>();
  const resolve = (n: ts.Node) => {
    const s = checker.getSymbolAtLocation(n);
    return s && s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s;
  };
  const base = (decl: ts.ClassLikeDeclaration): ts.ClassLikeDeclaration | undefined => {
    const h = decl.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
    const d = h && checker.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
    return d && ts.isClassLike(d) && !d.getSourceFile().isDeclarationFile ? d : undefined;
  };
  const declared = (cls: ts.ClassLikeDeclaration, name: string) =>
    cls.members.find((m) => !!m.name && !ts.isComputedPropertyName(m.name) && m.name.getText() === name && !(ts.isPropertyDeclaration(m) && isStatic(m)));
  /**
   * The field a registration's member is typed by: the root-most declaration, which the native member overrides
   * unless it is the class's own. Null where the class or a base declares the name as anything but a field.
   */
  const fieldFor = (cls: ts.ClassLikeDeclaration, name: string): { field: ts.PropertyDeclaration; overrides: boolean } | null => {
    let found: { field: ts.PropertyDeclaration; overrides: boolean } | null = null;
    for (let c: ts.ClassLikeDeclaration | undefined = cls; c; c = base(c)) {
      const m = declared(c, name);
      if (!m) continue;
      if (!ts.isPropertyDeclaration(m) || !ts.isIdentifier(m.name)) return null;
      found = { field: m, overrides: c !== cls };
    }
    return found;
  };
  for (const sf of files) {
    if (sf.isDeclarationFile) continue;
    const visit = (n: ts.Node) => {
      if (ts.isExpressionStatement(n)) {
        const call = n.expression;
        if (ts.isCallExpression(call) && ts.isPropertyAccessExpression(call.expression) && call.expression.name.text === 'register' && call.arguments.length === 1) {
          const name = properties.name(resolve(call.expression.expression));
          const cls = resolve(call.arguments[0])?.valueDeclaration;
          const at = name && cls && ts.isClassDeclaration(cls) && cls.name && !cls.typeParameters?.length && !cls.getSourceFile().isDeclarationFile ? fieldFor(cls, name) : null;
          if (at && !byClass.get(cls as ts.ClassDeclaration)?.some((m) => m.name === name)) {
            const member: TypedMember = { cls: cls as ts.ClassDeclaration, name: name!, ...at };
            byClass.set(member.cls, [...(byClass.get(member.cls) ?? []), member]);
            byStatement.set(n, [...(byStatement.get(n) ?? []), member]);
          }
        }
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
  }
  return {
    of: (cls) => byClass.get(cls) ?? [],
    get: (cls, name) => byClass.get(cls)?.find((m) => m.name === name),
    registeredBy: (s) => byStatement.get(s) ?? [],
  };
}

function isStatic(m: ts.ClassElement): boolean {
  return !!ts.getModifiers(m as ts.HasModifiers)?.some((x) => x.kind === ts.SyntaxKind.StaticKeyword);
}
