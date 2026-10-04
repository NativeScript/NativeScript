// Where each translated statement came from. The translators put a marker
// (`/*@ns:<n>*/`) at the start of every statement they emit; once a file is
// assembled, the markers become Swift `#sourceLocation` directives, or, for
// Kotlin (which has no such directive), a table from Kotlin lines to source
// lines that `retrace.ts` applies to a stack trace.
//
// A component's virtual class is not the file the developer wrote: its lines
// are matched to the component's source file by the identifiers and literals
// they share (the front ends copy script code and template expressions
// through, renaming bindings), so a statement maps to the line it was written on.
import { existsSync, readFileSync } from 'node:fs';
import ts from 'typescript';

export interface SourceLocation { file: string; line: number }

const MARKER = /\/\*@ns:(\d+|-)\*\//g;
const LEADING = /^(\s*)\/\*@ns:(\d+|-)\*\//;

export class SourceLines {
  private locations: SourceLocation[] = [];
  private index = new Map<string, number>();
  /** Virtual file → the file it stands for, and its lines matched to that file's. */
  private aligned = new Map<string, { file: string; lines: (number | null)[] }>();

  /**
   * `origins`: for each file whose program text is not the file on disk (a
   * component's virtual class, a module the release build reads differently),
   * the file it was made from, or null when there is none (code the compiler wrote).
   */
  private origins: Map<string, string | null>;
  constructor(origins: Map<string, string | null>) { this.origins = origins; }

  /** The marker for the statement `s`; one that ends the current region when its source line is unknown. */
  mark(s: ts.Node): string {
    const at = this.locate(s);
    if (!at) return SourceLines.end;
    const key = `${at.file}:${at.line}`;
    let n = this.index.get(key);
    if (n === undefined) { n = this.locations.length; this.locations.push(at); this.index.set(key, n); }
    return `/*@ns:${n}*/`;
  }

  /** Ends the region the last marker began: what follows is generated code with no source line. */
  static readonly end = '/*@ns:-*/';

  locate(s: ts.Node): SourceLocation | null {
    const sf = s.getSourceFile();
    if (!sf) return null;
    const line = sf.getLineAndCharacterOfPosition(s.getStart(sf)).line;
    const origin = this.origins.get(sf.fileName);
    if (origin === null) return null;
    if (origin === undefined) return { file: sf.fileName, line: line + 1 };
    const matched = this.align(sf, origin).lines[line];
    return matched == null ? null : { file: origin, line: matched + 1 };
  }

  /** Swift: each leading marker becomes a `#sourceLocation` line before the statement; a region's end resets it. */
  swift(code: string): string {
    let open = false;
    const out: string[] = [];
    for (const line of code.split('\n')) {
      const m = LEADING.exec(line);
      if (m && m[2] === '-') { if (open) out.push('#sourceLocation()'); open = false; }
      else if (m) { const at = this.locations[+m[2]]; out.push(`#sourceLocation(file: ${JSON.stringify(at.file)}, line: ${at.line})`); open = true; }
      out.push(line.replace(MARKER, ''));
    }
    if (open) out.push('#sourceLocation()');
    return out.join('\n');
  }

  /** Kotlin: the markers removed, and each line of the result with the location its statement began at (null for generated code). */
  kotlin(code: string): { code: string; lines: (SourceLocation | null)[] } {
    let current: SourceLocation | null = null;
    const lines: (SourceLocation | null)[] = [];
    const out: string[] = [];
    for (const line of code.split('\n')) {
      const m = LEADING.exec(line);
      if (m) current = m[2] === '-' ? null : this.locations[+m[2]];
      out.push(line.replace(MARKER, ''));
      lines.push(current);
    }
    return { code: out.join('\n'), lines };
  }

  /** Strips the markers (a file with no source lines, or a build without them). */
  static strip(code: string): string {
    return code.replace(MARKER, '');
  }

  private align(sf: ts.SourceFile, origin: string) {
    let a = this.aligned.get(sf.fileName);
    if (a) return a;
    const original = existsSync(origin) ? readFileSync(origin, 'utf8').split('\n') : [];
    a = { file: origin, lines: alignLines(sf.text.split('\n'), original) };
    this.aligned.set(sf.fileName, a);
    return a;
  }
}

/** Words that the front ends add or that every line has; they say nothing about where a line came from. */
const NOISE = new Set(['this', 'value', 'return', 'const', 'let', 'var', 'function', 'async', 'await', 'new', 'true', 'false', 'null', 'undefined',
  'export', 'default', 'class', 'readonly', 'get', 'set', 'void', 'string', 'number', 'boolean', 'any', 'as', 'of', 'in', 'if', 'else']);
/** Identifiers, numbers and string literals, and the identifiers inside strings too (template attribute values are strings). */
const tokens = (line: string): string[] => {
  const out: string[] = [];
  for (const t of line.match(/[A-Za-z_$][\w$]*|\d+(?:\.\d+)?|'[^']*'|"[^"]*"|`[^`]*`/g) ?? []) {
    out.push(t);
    if (/^["'`]/.test(t)) out.push(...tokens(t.slice(1, -1)));
  }
  return out.filter((t) => !NOISE.has(t) && !/^\$[a-z]\d+$/.test(t) && !/^\$(ref|signal|event|EventData|passed)$/.test(t));
};

/**
 * A template binding's expression as the developer wrote it: the virtual
 * method's body without the front end's `this.`, `.value` and parentheses;
 * for a two-way binding's handler, the bound path.
 */
const bindingExpression = (line: string): string | null => {
  const m = /^\s*\$[a-z]\d+\(.*?\)\s*(?::[^{]+)?\{\s*(?:return\s+)?(.*?);?\s*\}\s*$/.exec(line);
  if (!m) return null;
  let expr = m[1].replace(/\bthis\./g, '').replace(/\.value\b/g, '').replace(/\s+/g, ' ').trim();
  while (/^\(.*\)$/.test(expr) && balanced(expr.slice(1, -1))) expr = expr.slice(1, -1).trim();
  return /^([\w$.]+) = \$event\b/.exec(expr)?.[1] ?? expr;
};
const balanced = (s: string) => {
  let depth = 0;
  for (const c of s) if ((depth += c === '(' ? 1 : c === ')' ? -1 : 0) < 0) return false;
  return depth === 0;
};

/**
 * Each virtual line's best match among the original lines. A template
 * binding goes to the line where its expression is an attribute value or an
 * interpolation; any other line to the original line sharing the most
 * tokens, each weighted by how rare it is in the original, nearest the
 * previous match on a tie. Lines sharing nothing distinctive map to nothing.
 */
export function alignLines(virtual: string[], original: string[]): (number | null)[] {
  const orig = original.map((l) => tokens(l));
  const df = new Map<string, number>();
  for (const ts_ of orig) for (const t of new Set(ts_)) df.set(t, (df.get(t) ?? 0) + 1);
  const weight = (t: string) => (df.has(t) ? 1 / df.get(t)! : 0);
  const squashed = original.map((l) => l.replace(/\s+/g, ' '));
  let previous = 0;
  const nearest = (candidates: number[]) => candidates.reduce((a, b) => (Math.abs(b - previous) < Math.abs(a - previous) ? b : a));
  return virtual.map((line) => {
    const expr = bindingExpression(line);
    if (expr) {
      const quoted = [`"${expr}"`, `{{ ${expr} }}`, `{{${expr}}}`, `{${expr}}`, `'${expr}'`];
      const hits = squashed.map((l, j) => (quoted.some((q) => l.includes(q)) ? j : -1)).filter((j) => j >= 0);
      if (hits.length) return (previous = nearest(hits));
    }
    const want = tokens(line);
    const total = want.reduce((s, t) => s + weight(t), 0);
    if (!total) return null;
    let best: number[] = [], bestScore = 0;
    for (let j = 0; j < orig.length; j++) {
      const have = new Map<string, number>();
      for (const t of orig[j]) have.set(t, (have.get(t) ?? 0) + 1);
      let score = 0;
      for (const t of want) { const n = have.get(t); if (n) { score += weight(t); have.set(t, n - 1); } }
      if (score > bestScore + 1e-9) { best = [j]; bestScore = score; } else if (score > 0 && Math.abs(score - bestScore) <= 1e-9) best.push(j);
    }
    // Half of what the line says must be on the original line.
    if (!best.length || bestScore < total / 2) return null;
    return (previous = nearest(best));
  });
}
