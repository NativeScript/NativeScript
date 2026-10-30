// Shadow runs of the value-form model (src/forms.ts, src/forms-shadow.ts): translate a corpus with NS_FORMS_SHADOW set
// and summarize where `Form` and today's null/undefined deciders disagree.
//
//   node tests/forms-shadow.ts diff <out> [--compiler <packages/compiler>] [--jobs 8] [case prefix ...]
//       translates every diff case for both backends into <out>/<target>/<case> (records go to $NS_FORMS_SHADOW when set)
//   node tests/forms-shadow.ts apps <out> [--core <dist/packages/core>]
//       translates Guitar, openjs, gallery-angular and xml-ts for iOS and Android into <out>/<app>-<platform>; openjs
//       takes the given core build, as regress.sh's realapp gives it the branch's. Records go to $NS_FORMS_SHADOW with
//       the app's name before its extension, as each app's paths are relative to its own folder (NS_CONVERSION_SHADOW too)
//   node tests/forms-shadow.ts summarize <records.jsonl ...>
//       disagreements by decider, site kind and backend, with examples and the known failures they fall in
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join, resolve } from 'node:path';

const here = import.meta.dirname;
const [command, ...rest] = process.argv.slice(2);
const flag = (name: string, fallback: string) => { const k = rest.indexOf(name); return k >= 0 ? rest.splice(k, 2)[1] : fallback; };

if (command === 'diff') await diff();
else if (command === 'translate-one') await translateOne();
else if (command === 'apps') apps();
else if (command === 'summarize') summarize(rest);
else { console.error('usage: forms-shadow.ts diff|apps|summarize …'); process.exit(2); }

async function diff() {
  const compiler = resolve(flag('--compiler', join(here, '..')));
  const jobs = Number(flag('--jobs', '8'));
  const [out, ...prefixes] = rest;
  const casesDir = join(compiler, 'tests/diff/cases');
  const cases = readdirSync(casesDir).filter((f) => f.endsWith('.ts') && (!prefixes.length || prefixes.some((p) => f.startsWith(p)))).sort();
  const { runsOn } = await import(join(compiler, 'tests/diff/case-options.ts'));
  const work = cases.flatMap((c) => (['swift', 'kotlin'] as const).filter((t) => runsOn(join(casesDir, c), t)).map((t) => [c, t]));
  let next = 0, failed = 0;
  const run = async (): Promise<void> => {
    while (next < work.length) {
      const [c, t] = work[next++];
      const dir = join(out, t, basename(c, '.ts'));
      rmSync(dir, { recursive: true, force: true });
      mkdirSync(dir, { recursive: true });
      const code = await new Promise<number>((r) => spawn('node', ['--stack-size=8000', import.meta.filename, 'translate-one', compiler, join(casesDir, c), dir, t], { stdio: ['ignore', 'ignore', 'ignore'] }).on('exit', (x) => r(x ?? 1)));
      if (code) failed++;
    }
  };
  await Promise.all(Array.from({ length: jobs }, run));
  console.log(`translated ${work.length - failed}/${work.length} (the rest refused, as their diff cases are)`);
}

async function translateOne() {
  const [compiler, file, out, target] = rest;
  const { translateKotlin, translateSwift } = await import(join(compiler, 'tests/native-build.ts'));
  const { kotlinOptions, swiftOptions } = await import(join(compiler, 'tests/diff/case-options.ts'));
  if (target === 'kotlin') translateKotlin([file], out, 'c' + basename(file, '.ts').replace(/\W/g, '_'), kotlinOptions(file));
  else translateSwift([file], out, swiftOptions(file));
}

function apps() {
  const core = flag('--core', '');
  const [out] = rest;
  const github = join(homedir(), 'Documents/github');
  const kitcore = join(github, 'NativeScript/swiftui-live/.claude/worktrees/kitcore/native-release');
  const cache = join(homedir(), 'Library/Caches/ns-regress');
  const cli = join(here, '../src/cli.ts');
  const list: { name: string; dir: string; id: string; copy: string | null; core?: boolean }[] = [
    { name: 'guitar', dir: join(github, 'NathanWalker/ns-duo-guitar-compiled'), id: 'io.nstudio.guitarpocketbook', copy: 'guitar' },
    { name: 'openjs', dir: join(github, 'nstudio/openjs-app-native-release'), id: 'org.openjsf.app', copy: 'openjs', core: true },
    { name: 'gallery-angular', dir: join(kitcore, 'gallery-angular'), id: 'org.nativescript.galleryangular.native', copy: null },
    { name: 'xml-ts', dir: join(kitcore, 'xml-ts'), id: 'org.nativescript.xmlts.native', copy: null },
  ];
  for (const app of list) {
    let dir = app.dir;
    // A store app translates in a copy of its HEAD with regress.sh's cached node_modules, as regress.sh's realapp does.
    if (app.copy) {
      const modules = readdirSync(cache).find((d) => d.startsWith(app.copy + '-'));
      if (!modules) { console.log(`${app.name}: no cached node_modules in ${cache}, skipped`); continue; }
      dir = join(out, 'src', app.name);
      rmSync(dir, { recursive: true, force: true });
      mkdirSync(dir, { recursive: true });
      execFileSync('sh', ['-c', `git -C '${app.dir}' archive HEAD | tar -x -C '${dir}'`]);
      execFileSync('cp', ['-c', '-R', join(cache, modules, 'node_modules'), dir]);
      rmSync(join(dir, 'node_modules/@nativescript/compiler'), { recursive: true, force: true });
      symlinkSync(resolve(here, '..'), join(dir, 'node_modules/@nativescript/compiler'));
      if (app.core && core) execFileSync('rsync', ['-a', '--delete', core + '/', join(dir, 'node_modules/@nativescript/core/')]);
    }
    for (const platform of ['ios', 'android']) {
      const target = join(out, `${app.name}-${platform}`);
      const start = Date.now();
      try {
        const shadow = Object.fromEntries(['NS_FORMS_SHADOW', 'NS_CONVERSION_SHADOW'].filter((k) => process.env[k]).map((k) => [k, process.env[k]!.replace(/(\.\w+)?$/, `-${app.name}$1`)]));
        execFileSync('node', [cli, dir, '--platform', platform, '--out', target, '--name', app.name.replace(/\W/g, ''), '--bundle', app.id], { cwd: dir, env: { ...process.env, ...shadow }, stdio: ['ignore', 'ignore', 'pipe'], maxBuffer: 1 << 28 });
        console.log(`${app.name} ${platform}: translated in ${((Date.now() - start) / 1000).toFixed(0)} s`);
      } catch (e) {
        console.log(`${app.name} ${platform}: FAILED ${String((e as { stderr?: Buffer }).stderr ?? e).split('\n').filter(Boolean).slice(-2).join(' ').slice(0, 200)}`);
      }
    }
  }
}

interface Record { backend: string; at: string; kind: string; site: string; decider: string; mode: string; old: boolean; form: boolean | null; states: string; error?: string }

function summarize(files: string[]) {
  const records = new Map<string, Record>();
  const timings: string[] = [];
  for (const f of files) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, 'utf8').split('\n')) {
      if (!line) continue;
      const r = JSON.parse(line);
      if (r.timing) { timings.push(`${basename(f)} ${r.timing}: ${r.ms} ms over ${r.files} files${r.library ? ' (library)' : ''}`); continue; }
      records.set(`${r.backend}|${r.decider}|${r.at}|${r.kind}`, r);
    }
  }
  const knownDiff = JSON.parse(readFileSync(join(here, 'diff/known-failures.json'), 'utf8'));
  const knownFuzz = JSON.parse(readFileSync(join(here, 'fuzz/known-fuzz-failures.json'), 'utf8'));
  const fuzzLines = new Map<string, Set<string>>();
  for (const t of ['swift', 'kotlin']) {
    for (const k of Object.keys(knownFuzz[t] ?? {})) {
      const [c, pos] = k.split('|');
      const key = `${t}|${c}|${pos.split(':')[0]}`;
      fuzzLines.set(key, (fuzzLines.get(key) ?? new Set()).add(k));
    }
  }
  /** The diff case (or fuzz case) a record's file is, and the known failures it falls in. */
  const known = (r: Record): string[] => {
    const m = /(?:^|\/)(\d{2,3}-[\w-]+?)(?:-g\d+)?\.ts:(\d+):/.exec(r.at);
    if (!m) return [];
    const out: string[] = [];
    if (knownDiff[r.backend]?.[m[1]]) out.push(`diff ${m[1]}`);
    const fuzz = fuzzLines.get(`${r.backend}|${m[1]}|${m[2]}`);
    if (fuzz) out.push(`fuzz ${m[1]}:${m[2]} (${fuzz.size})`);
    return out;
  };
  const all = [...records.values()];
  const answered = all.filter((r) => r.form !== null && !r.error);
  const differ = answered.filter((r) => r.old !== r.form);
  console.log(`records ${all.length}, answered ${answered.length}, errors ${all.filter((r) => r.error).length}, disagreements ${differ.length}`);
  const count = (rs: Record[], key: (r: Record) => string) => {
    const m = new Map<string, Record[]>();
    for (const r of rs) { const k = key(r), list = m.get(k); if (list) list.push(r); else m.set(k, [r]); }
    return [...m].sort((a, b) => b[1].length - a[1].length);
  };
  console.log('\nby decider (asked / disagree: old false, Form true | old true, Form false):');
  for (const [k, rs] of count(answered, (r) => `${r.backend} ${r.decider}`)) {
    const d = rs.filter((r) => r.old !== r.form);
    console.log(`  ${k}: ${rs.length} / ${d.filter((r) => r.form).length} | ${d.filter((r) => !r.form).length}`);
  }
  console.log('\ngroups (backend, decider, mode, site, old→Form):');
  for (const [k, rs] of count(differ, (r) => `${r.backend} ${r.decider} ${r.mode} ${r.site} ${r.old}→${r.form}`).slice(0, 60)) {
    const ks = new Map<string, number>();
    for (const r of rs) for (const x of known(r)) ks.set(x.split(':')[0].replace(/ \(\d+\)$/, ''), (ks.get(x.split(':')[0]) ?? 0) + 1);
    const kinds = count(rs, (r) => r.kind).slice(0, 3).map(([x, v]) => `${x} ${v.length}`).join(', ');
    console.log(`  ${rs.length}  ${k}  [${kinds}]`);
    for (const r of rs.filter((_, i) => i % Math.max(1, Math.floor(rs.length / 3)) === 0).slice(0, 3)) console.log(`      ${r.at} ${r.kind} states=${r.states || '-'}`);
    if (ks.size) console.log(`      known: ${[...ks].slice(0, 8).map(([x, v]) => `${x}×${v}`).join(', ')}`);
  }
  const byKnown = new Map<string, number>();
  for (const r of differ) for (const x of known(r)) { const id = x.startsWith('diff') ? x : x.replace(/:\d+ \(\d+\)$/, ''); byKnown.set(`${r.backend} ${id}`, (byKnown.get(`${r.backend} ${id}`) ?? 0) + 1); }
  console.log('\nknown failures with disagreements:');
  for (const [k, v] of [...byKnown].sort((a, b) => b[1] - a[1]).slice(0, 60)) console.log(`  ${k}: ${v}`);
  const errors = count(all.filter((r) => r.error), (r) => r.error!.slice(0, 120));
  if (errors.length) { console.log('\nerrors:'); for (const [k, rs] of errors.slice(0, 10)) console.log(`  ${rs.length} ${k} (${rs[0].at})`); }
  console.log('\nbuild cost:');
  for (const t of timings.sort((a, b) => Number(/: (\d+) ms/.exec(b)![1]) - Number(/: (\d+) ms/.exec(a)![1])).slice(0, 8)) console.log(`  ${t}`);
}
