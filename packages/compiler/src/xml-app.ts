// A plain NativeScript app (`Application.run({ moduleName })`, XML pages with
// code-behind modules): core's own Builder builds its views at run time, as it
// does in the app's JavaScript build. What the compiled app adds is the module
// registry the app's bundle would have: each XML file's text, each page
// stylesheet's AST, each script module's exports, and core's UI classes the
// XML names, under the names `registerBundlerModules` gives them.
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

export interface XmlApp {
  /** The virtual module registering the app's script modules' exports (`__nsRegisterAppModules`). */
  registry: { file: string; source: string };
  /** XML files, relative to the app folder, with their text. */
  xml: { name: string; text: string }[];
  /** Page stylesheets (`main-page.css`, not app.css), by path. */
  pageStyles: string[];
  /** The core element names the XML uses without a namespace prefix: the UI barrel's classes. */
  elements: string[];
}

/** The names a module exports, as its source declares them, and those of them that are classes XML can make (`<my:Card>`). */
function exportedNames(file: string): { names: string[]; classes: Set<string> } {
  const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const names: string[] = [];
  const classes = new Set<string>();
  const exported = (n: ts.Node) => !!ts.getModifiers(n as ts.HasModifiers)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
  const isDefault = (n: ts.Node) => !!ts.getModifiers(n as ts.HasModifiers)?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
  for (const st of sf.statements) {
    if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) && exported(st) && st.name) {
      const name = isDefault(st) ? 'default' : st.name.text;
      names.push(name);
      // Core's Builder makes a component with `new Class()`: a concrete class whose constructor takes no argument it needs.
      const ctor = ts.isClassDeclaration(st) ? st.members.find(ts.isConstructorDeclaration) : undefined;
      const abstract = ts.getModifiers(st)?.some((m) => m.kind === ts.SyntaxKind.AbstractKeyword);
      if (ts.isClassDeclaration(st) && !abstract && (!ctor || ctor.parameters.every((p) => p.questionToken || p.initializer))) classes.add(name);
    }
    else if (ts.isVariableStatement(st) && exported(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) names.push(d.name.text);
    else if (ts.isExportDeclaration(st) && !st.moduleSpecifier && st.exportClause && ts.isNamedExports(st.exportClause)) for (const e of st.exportClause.elements) names.push(e.name.text);
  }
  return { names: [...new Set(names)], classes };
}

export function xmlApp(appDir: string, files: string[], sources: string[], entry: string): XmlApp {
  const rel = (f: string) => relative(appDir, f).split('\\').join('/');
  const xml = files.filter((f) => f.endsWith('.xml') && f.startsWith(appDir)).map((f) => ({ name: rel(f), text: readFileSync(f, 'utf8') }));
  const pageStyles = files.filter((f) => /\.s?css$/.test(f) && f.startsWith(appDir) && !/^app(\.(ios|android))?\.s?css$/.test(rel(f)));
  // `<Label …>`, not `<ListView.itemTemplate>` (a property) or `<my:Card>` (a custom component, from its own module).
  const elements = new Set<string>();
  for (const { text } of xml) for (const m of text.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<([A-Za-z_][\w]*)(?=[\s/>])/g)) elements.add(m[1]);
  const imports: string[] = [];
  const entries: string[] = [];
  sources.filter((f) => f !== entry).forEach((f, k) => {
    const { names, classes } = exportedNames(f);
    if (!names.length) return;
    const spec = './' + rel(f).replace(/\.ts$/, '');
    const local = (n: string) => `__m${k}_${n}`;
    const named = names.filter((n) => n !== 'default').map((n) => `${n} as ${local(n)}`);
    const clauses = [...(names.includes('default') ? [local('default')] : []), ...(named.length ? [`{ ${named.join(', ')} }`] : [])];
    imports.push(`import ${clauses.join(', ')} from '${spec}';`);
    const value = (n: string) => (classes.has(n) ? `__nsClass(() => new ${local(n)}())` : local(n));
    entries.push(`  ${JSON.stringify(rel(f))}: { ${names.map((n) => `${JSON.stringify(n)}: ${value(n)}`).join(', ')} },`);
  });
  const source = `${imports.join('\n')}\n\n__nsRegisterAppModules({\n${entries.join('\n')}\n});\n`;
  return { registry: { file: join(appDir, '__app_modules.ts'), source }, xml, pageStyles, elements: [...elements].sort() };
}
