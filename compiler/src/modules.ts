import ts from 'typescript';
import { basename } from 'node:path';
import type { Translator } from './swift.ts';

export interface TranslatedModule {
  file: string;
  /** The Swift file's name, without the extension. */
  name: string;
  code: string;
  /** The function running the module's top-level statements, if it has any. */
  init: string | null;
}

/**
 * The app's plain modules as Swift, in the order JavaScript evaluates them
 * (each module after the modules it imports). Top-level statements with
 * effects become an init function per module: Swift initializes globals
 * lazily, so they run from the entry point in that order instead.
 */
export function translateModules(translator: Translator, program: ts.Program, files: string[], resolved?: (containing: string, specifier: string) => string | undefined): TranslatedModule[] {
  const ordered = evaluationOrder(program, files, resolved);
  const used = new Set<string>();
  const out: TranslatedModule[] = [];
  for (const file of ordered) {
    const sf = program.getSourceFile(file)!;
    let name = basename(file).replace(/\.tsx?$/, '').replace(/\W/g, '_');
    while (used.has(name)) name += '_';
    used.add(name);
    let code = '', init: string[] = [];
    try { ({ code, init } = translator.module(sf)); } catch (e) { if (!translator.errors) throw e; translator.errors.push((e as Error).message); }
    const initName = init.length ? `__init_${name}` : null;
    const throws = init.some((l) => /\btry\b/.test(l));
    const initCode = initName ? `\n\nfunc ${initName}() {\n${throws ? `    jsReport {\n${init.map((l) => '    ' + l).join('\n')}\n    }` : init.join('\n')}\n}\n` : '';
    out.push({ file, name, code: code + initCode, init: initName });
  }
  return out;
}

/** Interfaces become classes once everything that might use them is translated (modules and components). */
export function addInterfaces(translator: Translator, modules: TranslatedModule[]) {
  for (const m of modules) m.code = (translator.interfacesOf(m.file) + m.code).trim() + '\n';
}

/**
 * Post-order over imports, starting from `entries` (files evaluated first, as
 * a bundle's entry is, whether or not they are among `files`), then each file
 * in `files`. An import the emit drops (`import type`, or bindings used only
 * as types) evaluates nothing.
 */
export function evaluationOrder(program: ts.Program, files: string[], resolvedBy?: (containing: string, specifier: string) => string | undefined, entries: string[] = []): string[] {
  const wanted = new Set(files);
  const seen = new Set<string>();
  const order: string[] = [];
  const visit = (file: string) => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const resolved of importedFiles(program, file, resolvedBy, entries.length > 0)) {
      // A module that only re-exports (a plugin's index) is passed through to the modules it imports.
      if (wanted.has(resolved) || !(program.getSourceFile(resolved) ?? parsed(program, resolved, entries.length > 0))?.isDeclarationFile) visit(resolved);
    }
    if (wanted.has(file)) order.push(file);
  };
  for (const f of [...entries, ...files]) visit(f);
  return order;
}

/**
 * The files of `files` that evaluating `file` evaluates first: its imports that the
 * emit keeps, each passed through to what it imports when it is not among `files`
 * itself (a barrel). What runs a module's top level runs these modules' first.
 */
export function evaluatedImports(program: ts.Program, file: string, files: ReadonlySet<string>, resolvedBy?: (containing: string, specifier: string) => string | undefined): string[] {
  const found = new Set<string>();
  const seen = new Set<string>([file]);
  const visit = (from: string) => {
    for (const resolved of importedFiles(program, from, resolvedBy, false)) {
      if (seen.has(resolved)) continue;
      seen.add(resolved);
      if (files.has(resolved)) found.add(resolved);
      else if (!program.getSourceFile(resolved)?.isDeclarationFile) visit(resolved);
    }
  };
  visit(file);
  return [...found];
}

function parsed(program: ts.Program, file: string, outside: boolean): ts.SourceFile | undefined {
  return program.getSourceFile(file) ?? (outside && ts.sys.fileExists(file) ? ts.createSourceFile(file, ts.sys.readFile(file)!, ts.ScriptTarget.Latest, true) : undefined);
}

/** The files a file's imports and re-exports resolve to, leaving out those the emit drops (`import type`, bindings used only as types). */
function importedFiles(program: ts.Program, file: string, resolvedBy: ((containing: string, specifier: string) => string | undefined) | undefined, outside: boolean): string[] {
  const sf = parsed(program, file, outside);
  if (!sf) return [];
  const values = valueNames(sf);
  const out: string[] = [];
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) && !(ts.isExportDeclaration(st) && st.moduleSpecifier)) continue;
    if (elided(st, values)) continue;
    const spec = (st.moduleSpecifier as ts.StringLiteral).text;
    // As the program resolved it (a plugin's import reaches its source), else as TypeScript would.
    const resolved = resolvedBy?.(file, spec) ?? ts.resolveModuleName(spec, file, program.getCompilerOptions(), ts.sys).resolvedModule?.resolvedFileName
      ?? (program as any).getResolvedModule?.(sf, spec, undefined)?.resolvedModule?.resolvedFileName;
    if (resolved) out.push(resolved);
  }
  return out;
}

/** The names a file reads as values, outside its imports and its types. */
function valueNames(sf: ts.SourceFile): Set<string> {
  const names = new Set<string>();
  const walk = (n: ts.Node) => {
    if (ts.isImportDeclaration(n) || ts.isTypeNode(n) || ts.isInterfaceDeclaration(n) || ts.isTypeAliasDeclaration(n)) return;
    if (ts.isHeritageClause(n) && n.token === ts.SyntaxKind.ImplementsKeyword) return;
    if (ts.isIdentifier(n)) names.add(n.text);
    ts.forEachChild(n, walk);
  };
  walk(sf);
  return names;
}

/** An import or re-export TypeScript's emit leaves out. */
function elided(st: ts.ImportDeclaration | ts.ExportDeclaration, values: Set<string>): boolean {
  if (ts.isExportDeclaration(st)) return st.isTypeOnly || (!!st.exportClause && ts.isNamedExports(st.exportClause) && st.exportClause.elements.length > 0 && st.exportClause.elements.every((e) => e.isTypeOnly));
  const clause = st.importClause;
  if (!clause) return false;
  if (clause.isTypeOnly) return true;
  const bound: string[] = [];
  if (clause.name) bound.push(clause.name.text);
  const nb = clause.namedBindings;
  if (nb && ts.isNamespaceImport(nb)) bound.push(nb.name.text);
  if (nb && ts.isNamedImports(nb)) for (const e of nb.elements) if (!e.isTypeOnly) bound.push(e.name.text);
  return !bound.some((b) => values.has(b));
}
