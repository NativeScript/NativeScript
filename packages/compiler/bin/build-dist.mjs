// Compiles the compiler's TypeScript to JavaScript in dist/, which the bin runs when present: the published package
// then runs on the Node versions the NativeScript CLI supports, not only those that strip types (23.6+).
import ts from 'typescript';
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src'), dist = join(root, 'dist');
rmSync(dist, { recursive: true, force: true });
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
let count = 0;
for (const file of walk(src)) {
  const out = join(dist, relative(src, file));
  mkdirSync(dirname(out), { recursive: true });
  if (!file.endsWith('.ts') || file.endsWith('.d.ts')) { writeFileSync(out, readFileSync(file)); continue; }
  const { outputText, diagnostics } = ts.transpileModule(readFileSync(file, 'utf8'), {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, rewriteRelativeImportExtensions: true, verbatimModuleSyntax: false, sourceMap: false },
  });
  if (diagnostics?.length) throw new Error(`${file}: ${ts.flattenDiagnosticMessageText(diagnostics[0].messageText, '\n')}`);
  writeFileSync(out.replace(/\.ts$/, '.js'), outputText);
  count++;
}
console.log(`${count} modules compiled to ${relative(process.cwd(), dist) || dist}`);
