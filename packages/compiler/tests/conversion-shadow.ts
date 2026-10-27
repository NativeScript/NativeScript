// Shadow runs of the conversion table (src/conversion.ts, src/conversion-shadow.ts): translate a corpus with
// NS_CONVERSION_SHADOW set (tests/forms-shadow.ts diff|apps, or a kit build) and summarize where `plan()`'s cell and the
// step the backend wrote differ.
//
//   node tests/conversion-shadow.ts summarize [--examples n] <label>=<records.jsonl> ...
//       per corpus and backend: sites, disagreements by slot kind, by caller and by table step → written step
import { existsSync, readFileSync } from 'node:fs';

const [command, ...rest] = process.argv.slice(2);
const flag = (name: string, fallback: string) => { const k = rest.indexOf(name); return k >= 0 ? rest.splice(k, 2)[1] : fallback; };

if (command === 'summarize') summarize();
else { console.error('usage: conversion-shadow.ts summarize [--examples n] <label>=<records.jsonl> ...'); process.exit(2); }

interface Record { backend: string; fn: string; site: string; kind: string; at: string | null; mode: string; cell: string; entry: string; plan: string; step: string; agree: boolean; throwsDiffer?: { plan: boolean; code: boolean }; formTo?: string; target: string; code: string; error?: string }

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
      distinct.set(`${r.backend}|${r.fn}|${r.at ?? r.site}|${r.target}|${r.code}`, r);
    }
    const records = [...distinct.values()];
    for (const backend of ['swift', 'kotlin']) {
      const all = records.filter((r) => r.backend === backend);
      if (!all.length) continue;
      const errors = all.filter((r) => r.error), ok = all.filter((r) => !r.error);
      const differ = ok.filter((r) => !r.agree);
      // Only where the table's step throws and the code isn't marked: a marked call throws on its own as well.
      const throwsDiffer = ok.filter((r) => r.throwsDiffer?.plan && !r.throwsDiffer.code);
      console.log(`\n## ${label} ${backend}: ${ok.length} sites, ${differ.length} differ (${pct(differ.length, ok.length)}), throwing step unmarked ${throwsDiffer.length}${errors.length ? `, ${errors.length} unanswered` : ''}`);
      table('by slot kind (sites / differ)', ok, (r) => r.kind, differ);
      table('by entry point', ok, (r) => r.fn, differ);
      console.log('  table step → written step (differ):');
      for (const [k, rs] of group(differ, (r) => `${r.cell} ${r.entry} ${r.plan} → ${r.step}`).slice(0, 25)) {
        const sites = group(rs, (r) => r.site).slice(0, 4).map(([s, x]) => `${s} ${x.length}`).join(', ');
        console.log(`    ${String(rs.length).padStart(5)}  ${k}  [${sites}]`);
        for (const r of rs.slice(0, examples)) console.log(`           ${r.at ?? r.site}: ${r.target} ← ${r.code.slice(0, 110)}`);
      }
      console.log('  callers with most differences:');
      console.log('    ' + group(differ, (r) => r.site).slice(0, 16).map(([s, x]) => `${s} ${x.length}`).join(', '));
    }
  }
}

function table(title: string, all: Record[], key: (r: Record) => string, differ: Record[]) {
  const d = new Map(group(differ, key));
  console.log(`  ${title}: ` + group(all, key).map(([k, rs]) => `${k} ${rs.length}/${d.get(k)?.length ?? 0}`).join(', '));
}

function group(rs: Record[], key: (r: Record) => string): [string, Record[]][] {
  const m = new Map<string, Record[]>();
  for (const r of rs) { const k = key(r), list = m.get(k); if (list) list.push(r); else m.set(k, [r]); }
  return [...m].sort((a, b) => b[1].length - a[1].length);
}

function pct(a: number, b: number): string {
  return b ? `${Math.round((100 * a) / b)}%` : '-';
}
