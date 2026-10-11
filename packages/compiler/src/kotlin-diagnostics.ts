// Kotlin compiler diagnostics in a compiled Android project, in terms of the
// app's source. Kotlin has no #sourceLocation, so an error points into a
// generated .kt file; the project's source-lines.json (written beside the
// Gradle project) says which TypeScript statement each Kotlin line began in.
//   e: file:///…/Home.kt:14:9 Unresolved reference 'x'.
// becomes
//   e: /app/src/home.ts:7: Unresolved reference 'x'. (Home.kt:14:9)
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';

type Table = { package: string; files: Record<string, [number, string, number][]> };

/** `log` with each `e:`/`w:` line in a generated Kotlin file given its TypeScript line; other lines unchanged. */
export function mapKotlinDiagnostics(log: string, project: string): string {
  const file = join(project, 'source-lines.json');
  if (!existsSync(file)) return log;
  const table: Table = JSON.parse(readFileSync(file, 'utf8'));
  const roots = [resolve(project), realpathSync(project)];
  return log.replace(/^([ew]): (?:file:\/\/)?(\S*?([^/\s]+\.kt)):(\d+):(\d+) (.*)$/gm, (whole, level: string, path: string, name: string, line: string, column: string, message: string) => {
    if (!roots.some((r) => path.startsWith(r + '/'))) return whole;
    let at: [number, string, number] | undefined;
    for (const r of table.files[name] ?? []) { if (r[0] > +line) break; at = r; }
    return at?.[1] ? `${level}: ${at[1]}:${at[2]}: ${message} (${name}:${line}:${column})` : whole;
  });
}
