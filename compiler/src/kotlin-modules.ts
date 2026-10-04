import ts from 'typescript';
import { basename } from 'node:path';
import { evaluationOrder } from './modules.ts';
import type { Translator } from './kotlin.ts';

export interface KotlinModule {
  file: string;
  /** The Kotlin file's name, without the extension. */
  name: string;
  code: string;
  /** The function running the module's top-level statements, if it has any. */
  init: string | null;
}

/**
 * The app's plain modules as Kotlin, in the order JavaScript evaluates them.
 * Top-level statements with effects become an init function per module, which
 * the entry point calls in that order: Kotlin initializes a file's properties
 * when the file is first used instead.
 */
export function translateKotlinModules(translator: Translator, program: ts.Program, files: string[]): KotlinModule[] {
  const used = new Set<string>();
  const out: KotlinModule[] = [];
  for (const file of evaluationOrder(program, files)) {
    const sf = program.getSourceFile(file)!;
    let name = basename(file).replace(/\.tsx?$/, '').replace(/\W/g, '_');
    if (/^\d/.test(name)) name = '_' + name;
    while (used.has(name)) name += '_';
    used.add(name);
    const { code, init } = translator.module(sf);
    const initName = init.length ? `__init_${name}` : null;
    const initCode = initName ? `\n\nfun ${initName}() {\n${init.join('\n')}\n}\n` : '';
    out.push({ file, name, code: code + initCode, init: initName });
  }
  return out;
}

/** Interfaces become classes once everything that might use them is translated. */
export function addKotlinInterfaces(translator: Translator, modules: KotlinModule[]) {
  for (const m of modules) m.code = (translator.interfacesOf(m.file) + m.code).trim() + '\n';
}
