#!/usr/bin/env node
// A native Android release's stack trace, or its Gradle build log, in terms of the app's source:
//   node compiler/src/retrace.ts <android project> [trace.txt]   (the trace on stdin without a file)
//   node compiler/src/retrace.ts --build-log <android project> [gradle.log]   (Kotlin's errors only)
// R8's retrace undoes the release build's renaming and line packing with the
// build's mapping.txt; the project's source-lines.json then takes each frame
// in a compiled Kotlin file to the .ts/.vue/.tsx/.svelte line it came from, and
// the kit's own (kit-android/generated/source-lines.json) takes each frame in
// the kit generated from core to core's .ts line. Kotlin compiler errors
// (`e: file:///…/X.kt:12:3 …`) in a build log are mapped the same way.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { mapKotlinDiagnostics } from './kotlin-diagnostics.ts';
import { KIT_ANDROID } from './paths.ts';

const buildLog = process.argv.includes('--build-log');
const [project, traceFile] = process.argv.slice(2).filter((a) => a !== '--build-log');
if (!project) { console.error('usage: retrace.ts [--build-log] <android project> [trace.txt]'); process.exit(2); }
let trace = readFileSync(traceFile ?? 0, 'utf8');
if (!existsSync(join(project, 'source-lines.json'))) { console.error(`${project} has no source-lines.json: give the compiled Android project (platforms/compiled/android), built without --no-source-lines`); process.exit(1); }
trace = mapKotlinDiagnostics(trace, project);
if (buildLog) { process.stdout.write(trace); process.exit(0); }

const mapping = join(project, 'build', 'outputs', 'mapping', 'release', 'mapping.txt');
if (existsSync(mapping) && /^\s*at\s/m.test(trace)) {
  const tool = r8Retrace();
  if (!tool) { console.error('R8 retrace not found (Android SDK cmdline-tools); set ANDROID_HOME'); process.exit(1); }
  const scratch = mkdtempSync(join(tmpdir(), 'ns-retrace-'));
  try {
    writeFileSync(join(scratch, 'trace.txt'), trace);
    trace = execFileSync(tool, [mapping, join(scratch, 'trace.txt')], { encoding: 'utf8', maxBuffer: 64 << 20 });
  } finally { rmSync(scratch, { recursive: true, force: true }); }
}

type Table = { package: string; files: Record<string, [number, string, number][]> };
const app: Table = JSON.parse(readFileSync(join(project, 'source-lines.json'), 'utf8'));
const kitLines = join(KIT_ANDROID, 'generated', 'source-lines.json');
const kit: Table | null = existsSync(kitLines) ? JSON.parse(readFileSync(kitLines, 'utf8')) : null;
// Frames of the app's classes and the generated kit's; retrace names a file R8 kept no name for after its class, with .java.
process.stdout.write(trace.replace(/(\bat\s+([\w$.]+)\.[\w$<>-]+\s*)\(([\w$]+)\.(?:kt|java):(\d+)\)/g, (whole, frame: string, cls: string, file: string, line: string) => {
  const table = cls.startsWith(app.package + '.') ? app : kit && cls.startsWith(kit.package + '.') ? kit : null;
  const ranges = table?.files[file + '.kt'];
  if (!ranges) return whole;
  let at: [number, string, number] | undefined;
  for (const r of ranges) { if (r[0] > +line) break; at = r; }
  if (!at?.[1]) return whole;
  return `${frame}(${table === kit ? '@nativescript/core/' : ''}${at[1]}:${at[2]})`;
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
