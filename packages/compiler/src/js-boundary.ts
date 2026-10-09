import ts from 'typescript';
import type { JsEmitter } from './js-dynamic.ts';
import type { JsExport, JsGraph, JsModule } from './js-modules.ts';

/**
 * Where the app's typed code meets the npm packages compiled from their
 * JavaScript: which of the app's imports load such a package, what each
 * imported name reads in Swift, and which modules the app reaches (only those
 * are compiled). The app type-checks against the packages' declarations; in
 * Swift every value of a type they declare is dynamic (`Any?`), converted at
 * the boundary to the app's own types.
 */
export class JsBoundary {
  readonly graph: JsGraph;
  readonly emitter: JsEmitter;
  private readonly checker: ts.TypeChecker;
  private readonly imports: Map<string, string>;
  readonly declared: (file: string) => boolean;

  constructor(graph: JsGraph, emitter: JsEmitter, checker: ts.TypeChecker, imports: Map<string, string>, declared: (file: string) => boolean) {
    this.graph = graph;
    this.emitter = emitter;
    this.checker = checker;
    this.imports = imports;
    this.declared = declared;
  }

  /** The JavaScript module an import declaration loads, if it loads one. */
  moduleOf(st: ts.ImportDeclaration | ts.ExportDeclaration): JsModule | null {
    if (!st.moduleSpecifier || !ts.isStringLiteral(st.moduleSpecifier)) return null;
    const file = this.imports.get(`${st.getSourceFile().fileName}\0${st.moduleSpecifier.text}`);
    return file ? this.graph.module(file) : null;
  }

  /** Marks what the program's files read of the packages, so their modules are compiled. */
  reach(files: readonly ts.SourceFile[]) {
    for (const sf of files) {
      for (const st of sf.statements) {
        if (!ts.isImportDeclaration(st) && !ts.isExportDeclaration(st)) continue;
        const m = this.moduleOf(st);
        if (!m) continue;
        for (const name of this.namesRead(st)) this.graph.need(m, name);
      }
    }
  }

  /** The exports an import declaration reads: a namespace read only as `ns.name` reads only those names. */
  private namesRead(st: ts.ImportDeclaration | ts.ExportDeclaration): string[] {
    if (ts.isExportDeclaration(st)) {
      if (st.isTypeOnly) return [];
      if (!st.exportClause || ts.isNamespaceExport(st.exportClause)) return ['*'];
      return st.exportClause.elements.filter((el) => !el.isTypeOnly).map((el) => (el.propertyName ?? el.name).text);
    }
    const c = st.importClause;
    if (!c) return ['*'];
    if (c.isTypeOnly) return [];
    const names: string[] = [];
    if (c.name) names.push('default');
    const b = c.namedBindings;
    if (b && ts.isNamedImports(b)) for (const el of b.elements) if (!el.isTypeOnly) names.push((el.propertyName ?? el.name).text);
    if (b && ts.isNamespaceImport(b)) names.push(...this.namespaceUses(b));
    return names;
  }

  private namespaceUses(ns: ts.NamespaceImport): string[] {
    const sym = this.checker.getSymbolAtLocation(ns.name);
    const out = new Set<string>();
    let whole = false;
    const visit = (n: ts.Node) => {
      if (whole) return;
      if (ts.isIdentifier(n) && n !== ns.name && n.text === ns.name.text && this.checker.getSymbolAtLocation(n) === sym) {
        const p = n.parent;
        if (ts.isPropertyAccessExpression(p) && p.expression === n) out.add(p.name.text);
        else if (ts.isQualifiedName(p) || ts.isTypeQueryNode(p) || ts.isTypeReferenceNode(p)) { /* a type */ }
        else whole = true;
      }
      ts.forEachChild(n, visit);
    };
    visit(ns.getSourceFile());
    return whole ? ['*'] : [...out];
  }

  /** What an identifier naming an import from a package reads, as Swift; null for any other identifier. */
  importRead(e: ts.Identifier): string | null {
    const target = this.importTarget(e);
    return target ? this.emitter.bindingRead(target) : null;
  }

  /** `ns.name` of a package's namespace import: the export itself. */
  namespaceMember(target: ts.Identifier, name: string): string | null {
    const t = this.importTarget(target);
    if (!t || t.kind !== 'namespace' || t.module.kind !== 'esm') return null;
    const found = this.graph.resolveExport(t.module, name);
    return found ? this.emitter.bindingRead(found) : 'nil';
  }

  private importTarget(e: ts.Identifier): JsExport | null {
    const local = ts.isShorthandPropertyAssignment(e.parent) && e.parent.name === e ? this.checker.getShorthandAssignmentValueSymbol(e.parent) : this.checker.getSymbolAtLocation(e);
    if (!local || !(local.flags & ts.SymbolFlags.Alias)) return null;
    const decl = local.declarations?.[0];
    const st = decl && ts.findAncestor(decl, ts.isImportDeclaration);
    if (!decl || !st) return null;
    const m = this.moduleOf(st);
    if (!m) return null;
    if (ts.isNamespaceImport(decl)) return { kind: 'namespace', module: m };
    const name = ts.isImportSpecifier(decl) ? (decl.propertyName ?? decl.name).text : 'default';
    return this.graph.resolveExport(m, name) ?? { kind: 'unresolved', module: m, name };
  }

  /** The module records an import declaration evaluates first: through a barrel the app does not otherwise reach, the modules defining what it imports. */
  evaluatedBy(st: ts.ImportDeclaration): string[] {
    const m = this.moduleOf(st);
    if (!m || st.importClause?.isTypeOnly) return [];
    return this.emitter.evaluationTargets(m, st);
  }
}
