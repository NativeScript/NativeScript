// Shadow runs of the type step (src/type-step.ts, src/type-step-shadow.ts): translate a corpus with NS_TYPESTEP_SHADOW
// set (tests/forms-shadow.ts diff|apps, or a kit build) and summarize, per backend and family (box, unbox, function,
// identity), the sites by writer and caller and where the step and the written code differ.
//
//   node tests/type-step-shadow.ts summarize [--examples n] <label>=<records.jsonl> ...
import { existsSync, readFileSync } from 'node:fs';

const [command, ...rest] = process.argv.slice(2);
const flag = (name: string, fallback: string) => { const k = rest.indexOf(name); return k >= 0 ? rest.splice(k, 2)[1] : fallback; };

if (command === 'summarize') summarize();
else { console.error('usage: type-step-shadow.ts summarize [--examples n] <label>=<records.jsonl> ...'); process.exit(2); }

interface Record { backend: string; fn: string; site: string; nested: boolean; at: string | null; mode: string; from: string | null; to: string | null; code: string; family?: string; step?: string | null; composite?: string; written?: string; differ?: string[]; error?: string }

function summarize() {
  const examples = Number(flag('--examples', '2'));
  for (const arg of rest) {
    const [label, file] = arg.includes('=') ? arg.split(/=(.*)/s) : [arg, arg];
    if (!existsSync(file)) { console.log(`${label}: no records`); continue; }
    // A diff case's helpers are translated with every case that imports them: one site each.
    const distinct = new Map<string, Record>();
    for (const l of readFileSync(file, 'utf8').split('\n')) {
      if (!l) continue;
      const r = JSON.parse(l) as Record;
      distinct.set(`${r.backend}|${r.fn}|${r.site}|${r.at}|${r.from}|${r.to}|${r.code}`, r);
    }
    const records = [...distinct.values()];
    for (const backend of ['swift', 'kotlin']) {
      const all = records.filter((r) => r.backend === backend);
      if (!all.length) continue;
      const errors = all.filter((r) => r.error), ok = all.filter((r) => !r.error);
      const differ = ok.filter((r) => r.differ?.length);
      console.log(`\n## ${label} ${backend}: ${ok.length} sites (${ok.filter((r) => !r.nested).length} outer), ${differ.length} differ${errors.length ? `, ${errors.length} unanswered` : ''}`);
      for (const [fam, rs] of group(ok, (r) => r.family ?? '?')) {
        const d = rs.filter((r) => r.differ?.length);
        console.log(`  ${fam}: ${rs.length} sites, ${d.length} differ; composites ${top(rs, (r) => r.composite ?? '-', 8)}`);
        console.log(`    writers: ${top(rs, (r) => r.fn, 10)}`);
        console.log(`    callers: ${top(rs.filter((r) => !r.nested), (r) => `${r.fn}←${r.site}`, 12)}`);
        console.log(`    written: ${top(rs, (r) => r.written ?? '-', 10)}`);
        for (const [why, xs] of group(d.flatMap((r) => r.differ!.map((w) => [w, r] as const)), ([w]) => w)) {
          console.log(`    ${String(xs.length).padStart(5)}  ${why}  [${top(xs.map(([, r]) => r), (r) => `${r.fn}←${r.site}`, 5)}]`);
          for (const [, r] of xs.slice(0, examples)) console.log(`             ${r.at ?? r.site}: ${r.from} → ${r.to} ⇒ ${r.code.slice(0, 120)}`);
        }
      }
    }
  }
}

function top<T>(rs: T[], key: (r: T) => string, n: number): string {
  return group(rs, key).slice(0, n).map(([k, x]) => `${k} ${x.length}`).join(', ');
}

function group<T>(rs: readonly T[], key: (r: T) => string): [string, T[]][] {
  const m = new Map<string, T[]>();
  for (const r of rs) { const k = key(r), list = m.get(k); if (list) list.push(r); else m.set(k, [r]); }
  return [...m].sort((a, b) => b[1].length - a[1].length);
}
