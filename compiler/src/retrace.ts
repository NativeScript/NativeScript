#!/usr/bin/env node
// A native Android release's stack trace in terms of the app's source:
//   node compiler/src/retrace.ts <android project> [trace.txt]   (the trace on stdin without a file)
// R8's retrace undoes the release build's renaming and line packing with the
// build's mapping.txt; the project's source-lines.json then takes each frame
// in a compiled Kotlin file to the .ts/.vue/.tsx/.svelte line it came from.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

const [project, traceFile] = process.argv.slice(2);
if (!project) { console.error('usage: retrace.ts <android project> [trace.txt]'); process.exit(2); }
let trace = readFileSync(traceFile ?? 0, 'utf8');

const mapping = join(project, 'build', 'outputs', 'mapping', 'release', 'mapping.txt');
if (existsSync(mapping)) {
  const tool = r8Retrace();
  if (!tool) { console.error('R8 retrace not found (Android SDK cmdline-tools); set ANDROID_HOME'); process.exit(1); }
  const scratch = mkdtempSync(join(tmpdir(), 'ns-retrace-'));
  try {
    writeFileSync(join(scratch, 'trace.txt'), trace);
    trace = execFileSync(tool, [mapping, join(scratch, 'trace.txt')], { encoding: 'utf8', maxBuffer: 64 << 20 });
  } finally { rmSync(scratch, { recursive: true, force: true }); }
}

const lines: { package: string; files: Record<string, [number, string, number][]> } = JSON.parse(readFileSync(join(project, 'source-lines.json'), 'utf8'));
// Frames of the app's classes; retrace names a file R8 kept no name for after its class, with .java.
process.stdout.write(trace.replace(/(\bat\s+([\w$.]+)\.[\w$<>-]+\s*)\(([\w$]+)\.(?:kt|java):(\d+)\)/g, (whole, frame: string, cls: string, file: string, line: string) => {
  const ranges = cls.startsWith(lines.package + '.') ? lines.files[file + '.kt'] : undefined;
  if (!ranges) return whole;
  let at: [number, string, number] | undefined;
  for (const r of ranges) { if (r[0] > +line) break; at = r; }
  return `${frame}(${at?.[1] ? `${at[1]}:${at[2]}` : `${file}.kt:${line}`})`;
}));

function r8Retrace(): string | null {
  const sdk = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT ?? join(homedir(), 'Library', 'Android', 'sdk');
  const tools = join(sdk, 'cmdline-tools');
  if (!existsSync(tools)) return null;
  const versions = readdirSync(tools).sort((a, b) => (a === 'latest' ? -1 : b === 'latest' ? 1 : b.localeCompare(a, undefined, { numeric: true })));
  for (const v of versions) {
    const bin = join(tools, v, 'bin', process.platform === 'win32' ? 'retrace.bat' : 'retrace');
    if (existsSync(bin)) return bin;
  }
  return null;
}
