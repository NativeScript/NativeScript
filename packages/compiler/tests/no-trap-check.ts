#!/usr/bin/env node
// Counts the code in Swift and Kotlin sources that stops the app instead of throwing a JavaScript error, against
// tests/no-trap-allow.txt. A JS error a script doesn't catch is reported (uncaughtErrorPolicy "report") and the app
// goes on; a trap ends it. Fails on a trap the list does not allow, and on a listed site that no longer occurs.
//   node tests/no-trap-check.ts [--swift] [--kotlin] [--list] [app sources…]
// --swift: the iOS kit (runtime and Core/); --kotlin: the Android kit (generated/, src/fromcore, the runtime and the hand
// port's files the generated kit keeps); neither: both. App sources (an app's generated Sources/) are listed as `app:<file>`.
// --list prints every trap found as an allow-list line, to start or review the list.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const compiler = join(import.meta.dirname, '..');
const argv = process.argv.slice(2);
const listing = argv.includes('--list');
const apps = argv.filter((a) => !a.startsWith('--'));
const swiftKit = [join(compiler, 'kit-apple', 'Sources', 'NativeScriptKit')];
const kotlinKit = [
  join(compiler, 'kit-android', 'generated'),
  join(compiler, 'kit-android', 'src', 'fromcore'),
  // The hand port's files the generated kit still builds with (kit-android/build.gradle.kts, `kept`).
  ...['Signals.kt', 'ColorMix.kt', 'JS.kt', 'ChangeDetection.kt', 'Rx.kt', 'UncaughtErrors.kt', 'MainThread.kt'].map((f) => join(compiler, 'kit-android', 'src', 'main', 'kotlin', 'org', 'nativescript', 'kit', f)),
  join(compiler, 'kit-android', 'src', 'main', 'kotlin', 'org', 'nativescript', 'kit', 'runtime'),
];
const both = !argv.includes('--swift') && !argv.includes('--kotlin');
const kits = [...(both || argv.includes('--swift') ? swiftKit : []), ...(both || argv.includes('--kotlin') ? kotlinKit : [])];

type Kind = 'try!' | 'as!' | 'fatalError' | '!' | 'IUO' | '!!' | 'error()' | 'TODO()';
interface Trap { file: string; line: number; kind: Kind; text: string }

/**
 * The source with comments removed and string literals emptied (`""`), keeping line breaks and the code inside
 * interpolations (`\(…)`, `${…}`), so patterns see only code.
 */
export function codeOnly(src: string, kotlin: boolean): string {
  let out = '';
  let i = 0;
  const n = src.length;
  // Each open string: its quote and the brace/paren depth of the interpolation it is in, innermost last.
  const strings: { raw: number; triple: boolean; depth: number }[] = [];
  const keepBreaks = (s: string) => s.replace(/[^\n]/g, '');
  const code = () => {
    while (i < n) {
      const c = src[i];
      if (c === '/' && src[i + 1] === '/') {
        while (i < n && src[i] !== '\n') i++;
      } else if (c === '/' && src[i + 1] === '*') {
        // Both languages nest block comments.
        let depth = 0;
        const start = i;
        do {
          if (src[i] === '/' && src[i + 1] === '*') { depth++; i += 2; } else if (src[i] === '*' && src[i + 1] === '/') { depth--; i += 2; } else i++;
        } while (i < n && depth > 0);
        out += keepBreaks(src.slice(start, i));
      } else if (c === '"' || (!kotlin && c === '#' && /^#+"/.test(src.slice(i, i + 8)))) {
        const raw = kotlin ? 0 : /^#*/.exec(src.slice(i))![0].length;
        i += raw;
        const triple = src.startsWith('"""', i);
        i += triple ? 3 : 1;
        out += '""';
        strings.push({ raw, triple, depth: 0 });
        if (!string()) return;
      } else if (kotlin && c === "'") {
        // A Kotlin character literal.
        i++;
        while (i < n && src[i] !== "'") i += src[i] === '\\' ? 2 : 1;
        i++;
        out += "' '";
      } else if (strings.length && (c === '(' || c === '{')) {
        strings.at(-1)!.depth++;
        out += c;
        i++;
      } else if (strings.length && (c === ')' || c === '}')) {
        if (strings.at(-1)!.depth === 0) {
          // The interpolation ends: back to its string.
          i++;
          if (!string()) return;
        } else {
          strings.at(-1)!.depth--;
          out += c;
          i++;
        }
      } else {
        out += c;
        i++;
      }
    }
  };
  /** Skips a string's text up to its end or an interpolation; false at the end of the source. */
  const string = (): boolean => {
    const s = strings.at(-1)!;
    const close = (s.triple ? '"""' : '"') + '#'.repeat(s.raw);
    while (i < n) {
      if (src.startsWith(close, i)) {
        i += close.length;
        strings.pop();
        return true;
      }
      const escape = '\\' + '#'.repeat(s.raw);
      if (!kotlin && src.startsWith(escape + '(', i)) { i += escape.length + 1; return true; }
      if (kotlin && src.startsWith('${', i)) { i += 2; return true; }
      if (!s.raw && !kotlin && src[i] === '\\') { i += 2; continue; }
      if (kotlin && !s.triple && src[i] === '\\') { i += 2; continue; }
      if (src[i] === '\n') out += '\n';
      i++;
    }
    return false;
  };
  code();
  return out;
}

/** Whether `args` (a call's argument list) holds only literals: `URL(string: "…")!` cannot fail at run time. */
const literalArgs = (args: string) => args.split(',').every((a) => /^\s*(?:\w+:\s*)?(?:""|-?\d[\w.]*|true|false|nil|\.\w+)?\s*$/.test(a));

function swiftTraps(file: string, code: string): Trap[] {
  const traps: Trap[] = [];
  const lines = code.split('\n');
  lines.forEach((text, at) => {
    if (/^\s*#(?:if|elseif)\b/.test(text)) return;
    const add = (kind: Kind) => traps.push({ file, line: at + 1, kind, text: text.trim() });
    for (const _ of text.matchAll(/\btry!/g)) add('try!');
    for (const _ of text.matchAll(/\bas!/g)) add('as!');
    for (const _ of text.matchAll(/\b(?:fatalError|preconditionFailure|precondition)\s*\(/g)) add('fatalError');
    for (const m of text.matchAll(/[\w)\]>"]!(?!=)/g)) {
      const end = m.index! + 1;
      const before = text.slice(0, end);
      if (/\b(?:try|as)$/.test(before)) continue;
      // `T!` in a declaration: an implicitly unwrapped optional.
      if (/(?::|->)\s*(?:[A-Z][\w.]*(?:<[^<>]*>)?|\[[^\]]*\]|\([^()]*\))$/.test(before) && /^\s*(?:[=,){]|$)/.test(text.slice(end + 1))) { add('IUO'); continue; }
      if (before.endsWith('""')) continue;
      if (before.endsWith(')')) {
        let depth = 0;
        let open = end - 1;
        for (; open >= 0; open--) {
          if (text[open] === ')') depth++;
          else if (text[open] === '(' && --depth === 0) break;
        }
        if (open > 0 && literalArgs(text.slice(open + 1, end - 1)) && /[\w>]$/.test(text.slice(0, open))) continue;
      }
      add('!');
    }
  });
  return traps;
}

function kotlinTraps(file: string, code: string): Trap[] {
  const traps: Trap[] = [];
  // A file declaring its own `error` (a parser's, making the JS SyntaxError) calls that one.
  const ownError = /\bfun\s+error\s*\(/.test(code);
  code.split('\n').forEach((text, at) => {
    const add = (kind: Kind) => traps.push({ file, line: at + 1, kind, text: text.trim() });
    for (const _ of text.matchAll(/!!/g)) add('!!');
    if (!ownError) for (const _ of text.matchAll(/(?<![.\w])error\s*\(/g)) add('error()');
    for (const _ of text.matchAll(/(?<![.\w])TODO\s*\(/g)) add('TODO()');
  });
  return traps;
}

function sources(root: string): string[] {
  if (!existsSync(root)) return [];
  if (statSync(root).isFile()) return [root];
  return (readdirSync(root, { recursive: true }) as string[]).filter((f) => /\.(swift|kt)$/.test(f)).sort().map((f) => join(root, f));
}

/** A path as the list names it: a kit's from its source root, an app's as `app:` and its path in the app's sources, `/` separated. */
function key(path: string, root: string): string {
  const p = relative(compiler, path).split(sep).join('/');
  if (p.startsWith('..')) return 'app:' + (relative(root, path).split(sep).join('/') || path.split(sep).at(-1));
  return p.replace(/^kit-apple\/Sources\/NativeScriptKit\//, '').replace(/^kit-android\/(?:generated\/kotlin|src\/\w+\/kotlin)\/org\/nativescript\/kit\//, '');
}

export function scan(paths: string[]): Trap[] {
  const traps: Trap[] = [];
  for (const root of paths) {
    for (const f of sources(root)) {
      const kotlin = f.endsWith('.kt');
      const code = codeOnly(readFileSync(f, 'utf8'), kotlin);
      traps.push(...(kotlin ? kotlinTraps : swiftTraps)(key(f, root), code));
    }
  }
  return traps;
}

interface Allowed { file: string; kind: string; site: string; reason: string; used: number; line: number }

function readAllowList(): Allowed[] {
  const path = join(import.meta.dirname, 'no-trap-allow.txt');
  return readFileSync(path, 'utf8').split('\n').flatMap((l, at) => {
    if (!l.trim() || l.trimStart().startsWith('#')) return [];
    const [file, kind, site, reason] = l.split(' | ').map((s) => s.trim());
    if (!file || !kind || !site || !reason) throw new Error(`no-trap-allow.txt:${at + 1}: want "file | kind | site | reason"`);
    return [{ file, kind, site, reason, used: 0, line: at + 1 }];
  });
}

if (import.meta.main) {
  const paths = [...kits, ...apps];
  const traps = scan(paths);
  if (listing) {
    for (const t of traps) console.log(`${t.file} | ${t.kind} | ${t.text.length > 120 ? t.text.slice(0, 120) : t.text} | ${t.line}`);
    process.exit(0);
  }
  const allowed = readAllowList();
  const scanned = new Set(paths.flatMap((root) => sources(root).map((f) => key(f, root))));
  const unexpected = traps.filter((t) => {
    const entry = allowed.find((a) => (a.file.endsWith('*') ? t.file.startsWith(a.file.slice(0, -1)) : a.file === t.file) && a.kind === t.kind && t.text.includes(a.site));
    if (entry) entry.used++;
    return !entry;
  });
  // An entry for any app's file (`app:*`) names emitter output an app may or may not have.
  const stale = allowed.filter((a) => !a.used && scanned.has(a.file));
  const counts = (ts: Trap[]) => Object.entries(Object.groupBy(ts, (t) => t.kind)).map(([k, v]) => `${k} ${v!.length}`).join(', ') || 'none';
  console.log(`traps: ${traps.length} in ${paths.length} source root(s) (${counts(traps)}), ${traps.length - unexpected.length} allowed`);
  for (const t of unexpected) console.error(`trap not allowed: ${t.file}:${t.line}: ${t.kind}: ${t.text.slice(0, 200)}`);
  for (const a of stale) console.error(`no-trap-allow.txt:${a.line}: listed but not found, remove it: ${a.file} | ${a.kind} | ${a.site}`);
  if (unexpected.length || stale.length) {
    console.error(`no-trap: ${unexpected.length} trap(s) not allowed, ${stale.length} stale entr${stale.length === 1 ? 'y' : 'ies'}. Make the code throw a JS error, or list the site with its reason in tests/no-trap-allow.txt.`);
    process.exit(1);
  }
}
