// Shadow runs of the key plan (src/shapes.ts, src/shape-shadow.ts): translate a corpus with NS_SHAPE_SHADOW set
// (tests/forms-shadow.ts diff, or the kit generators), then summarize where the plan and the backends' key decisions
// disagree.
//
//   node tests/shape-shadow.ts summarize <records.jsonl ...>
//       disagreements by site and kind, per backend, with examples; classes the two backends decide differently
import { existsSync, readFileSync } from 'node:fs';

const [command, ...rest] = process.argv.slice(2);
if (command === 'summarize') summarize(rest);
else { console.error('usage: shape-shadow.ts summarize <records.jsonl ...>'); process.exit(2); }

interface Record { backend: string; site: string; mode: string; at: string; name?: string; diffs?: [string, unknown, unknown][]; error?: string; on?: boolean; flagged?: string; keys?: unknown; tracks?: boolean; notes?: boolean }

function summarize(files: string[]) {
  const records = new Map<string, Record>();
  for (const f of files) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, 'utf8').split('\n')) {
      if (!line) continue;
      const r = JSON.parse(line) as Record;
      records.set(`${r.backend}|${r.site}|${r.at}`, r);
    }
  }
  const all = [...records.values()];
  for (const backend of ['swift', 'kotlin']) {
    const mine = all.filter((r) => r.backend === backend);
    console.log(`\n== ${backend}: ${mine.length} decisions`);
    for (const site of ['class', 'hierarchy', 'literal']) {
      const at = mine.filter((r) => r.site === site);
      const by = (mode: string) => at.filter((r) => r.mode === mode).length;
      const differing = at.filter((r) => r.diffs?.length);
      const errors = at.filter((r) => r.error);
      const extra = site === 'class' ? `, keyed ${at.filter((r) => r.on).length}` : site === 'literal' ? `, null notes on ${at.filter((r) => r.tracks).length}, unset notes on ${at.filter((r) => r.notes).length}` : '';
      console.log(`${site}: ${at.length} (app ${by('app')}, lenient ${by('lenient')}, library ${by('library')}${extra}); differ ${differing.length}${errors.length ? `; errors ${errors.length} (${errors[0].error})` : ''}`);
      const kinds = new Map<string, Record[]>();
      for (const r of differing) for (const d of r.diffs!) {
        const k = `${d[0]}${site === 'literal' ? ` (${d[2]})` : ''}`;
        if (!kinds.has(k)) kinds.set(k, []);
        kinds.get(k)!.push(r);
      }
      for (const [k, rs] of [...kinds].sort((a, b) => b[1].length - a[1].length)) {
        const sample = rs.slice(0, 3).map((r) => {
          const d = r.diffs!.find((x) => `${x[0]}${site === 'literal' ? ` (${x[2]})` : ''}` === k)!;
          return `${r.at}${r.name ? ` ${r.name}` : ''}: plan ${JSON.stringify(d[1])} / backend ${JSON.stringify(d[2])}`;
        });
        console.log(`  ${rs.length} ${k}\n      ${sample.join('\n      ')}`);
      }
    }
  }
  // Twin decisions: a class both backends translated, decided differently.
  const classes = new Map<string, Record[]>();
  for (const r of all) if (r.site === 'class') { const k = r.at; if (!classes.has(k)) classes.set(k, []); classes.get(k)!.push(r); }
  const twins = [...classes.values()].filter((rs) => rs.length === 2 && (rs[0].on !== rs[1].on || rs[0].flagged !== rs[1].flagged || JSON.stringify(rs[0].keys) !== JSON.stringify(rs[1].keys)));
  console.log(`\n== classes both backends translated: ${[...classes.values()].filter((rs) => rs.length === 2).length}; decided differently: ${twins.length}`);
  for (const rs of twins.slice(0, 8)) {
    const [s, k] = rs[0].backend === 'swift' ? rs : [rs[1], rs[0]];
    console.log(`  ${s.at} ${s.name}: swift on ${s.on} flagged [${s.flagged}] / kotlin on ${k.on} flagged [${k.flagged}]`);
  }
}
