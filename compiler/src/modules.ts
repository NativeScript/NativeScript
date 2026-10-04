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
export function translateModules(translator: Translator, program: ts.Program, files: string[]): TranslatedModule[] {
  const ordered = evaluationOrder(program, files);
  const used = new Set<string>();
  const out: TranslatedModule[] = [];
  for (const file of ordered) {
    const sf = program.getSourceFile(file)!;
    let name = basename(file).replace(/\.tsx?$/, '').replace(/\W/g, '_');
    while (used.has(name)) name += '_';
    used.add(name);
    const { code, init } = translator.module(sf);
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

/** Post-order over imports, starting from each file in `files`. */
function evaluationOrder(program: ts.Program, files: string[]): string[] {
  const wanted = new Set(files);
  const seen = new Set<string>();
  const order: string[] = [];
  const visit = (file: string) => {
    if (seen.has(file)) return;
    seen.add(file);
    const sf = program.getSourceFile(file);
    if (!sf) return;
    for (const st of sf.statements) {
      if (!ts.isImportDeclaration(st) && !(ts.isExportDeclaration(st) && st.moduleSpecifier)) continue;
      const spec = (st.moduleSpecifier as ts.StringLiteral).text;
      const resolved = ts.resolveModuleName(spec, file, program.getCompilerOptions(), ts.sys).resolvedModule?.resolvedFileName
        ?? (program as any).getResolvedModule?.(sf, spec, undefined)?.resolvedModule?.resolvedFileName;
      if (resolved && wanted.has(resolved)) visit(resolved);
    }
    if (wanted.has(file)) order.push(file);
  };
  for (const f of files) visit(f);
  return order;
}
