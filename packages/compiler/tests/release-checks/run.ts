#!/usr/bin/env node
// The checks a compiled release runs before compiling, and the tools that map
// its native output back to TypeScript, on fixed inputs:
//   node tests/release-checks/run.ts
// - preflight: every line of cases/*.ts ending in `// expect: <text>` is reported with <text>, and no other line;
// - satisfies: version ranges as the contract reads package.json's peerDependencies;
// - Kotlin diagnostics: a Gradle error in a generated file maps to its TypeScript line through source-lines.json.
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProgram } from '../../src/program.ts';
import { preflight } from '../../src/preflight.ts';
import { satisfies } from '../../src/contract.ts';
import { mapKotlinDiagnostics } from '../../src/kotlin-diagnostics.ts';
import { angularComponent, type AngularComponent } from '../../src/angular.ts';

const here = dirname(fileURLToPath(import.meta.url));
const modulesDir = process.env.NS_DIFF_MODULES ?? resolve(here, '../node_modules');
let failed = 0;
const check = (ok: boolean, what: string) => {
  console.log(`${ok ? '✓' : '✗'} ${what}`);
  if (!ok) failed++;
};

// ---- preflight ----
const cases = readdirSync(join(here, 'cases')).filter((f) => f.endsWith('.ts')).map((f) => join(here, 'cases', f));
for (const platform of ['ios', 'android'] as const) {
  const { checker, files } = createProgram(cases, new Map(), platform, modulesDir);
  const findings = preflight(checker, files);
  for (const file of cases) {
    const lines = readFileSync(file, 'utf8').split('\n');
    const expected = new Map(lines.flatMap((l, k) => {
      const m = /\/\/ expect: (.+)$/.exec(l);
      return m ? [[k + 1, m[1].trim()] as const] : [];
    }));
    const got = findings.filter((f) => f.file === file);
    for (const [line, text] of expected) {
      const hit = got.find((f) => f.line === line);
      check(!!hit && hit.what.includes(text) && hit.hint.length > 0, `preflight (${platform}) ${file.split('/').pop()}:${line} reports ${text}${hit ? '' : ' (not reported)'}`);
    }
    for (const f of got.filter((f) => !expected.has(f.line))) check(false, `preflight (${platform}) ${file.split('/').pop()}:${f.line} reports nothing (reported: ${f.what})`);
  }
}

// ---- version ranges ----
const ranges: [string, string, boolean][] = [
  ['3.1.2', '>=3.1.0 <4.0.0', true], ['4.0.0', '>=3.1.0 <4.0.0', false], ['4.0.0-rc.1', '>=3.1.0 <4.0.0', true],
  ['22.0.1-dev.0', '>=22.0.0 <23.0.0', true], ['2.0.0-rc.0', '>=2.0.0-rc.0 <3.0.0', true], ['2.0.0-beta.3', '>=2.0.0-rc.0 <3.0.0', false],
  ['5.55.2', '>=4.2.0 <5.0.0 || >=5.50.0 <6.0.0', true], ['5.10.0', '>=4.2.0 <5.0.0 || >=5.50.0 <6.0.0', false],
  ['0.2.5', '^0.2.4', true], ['0.3.0', '^0.2.4', false], ['9.1.9', '~9.1.3', true], ['9.2.0', '~9.1.3', false], ['9.1.3', '9.1.3', true], ['1.0.0', '*', true],
];
for (const [v, r, want] of ranges) check(satisfies(v, r) === want, `satisfies(${v}, ${r}) is ${want}`);

// ---- Kotlin diagnostics ----
const project = mkdtempSync(join(tmpdir(), 'ns-release-checks-'));
try {
  writeFileSync(join(project, 'source-lines.json'), JSON.stringify({ package: 'org.example.app', files: { 'Home.kt': [[1, '', 0], [10, '/app/src/home.ts', 7], [20, '/app/src/home.ts', 12]] } }));
  const log = [
    `e: file://${project}/src/main/kotlin/org/example/app/Home.kt:14:9 Unresolved reference 'x'.`,
    `e: file://${project}/src/main/kotlin/org/example/app/Home.kt:3:1 Syntax error.`,
    'w: file:///elsewhere/Other.kt:1:1 Unused.',
    '> Task :compileReleaseKotlin FAILED',
  ].join('\n');
  const mapped = mapKotlinDiagnostics(log, project).split('\n');
  check(mapped[0].startsWith('e: /app/src/home.ts:7: ') && mapped[0].includes('Home.kt:14:9') && mapped[0].includes("Unresolved reference 'x'."), 'a Kotlin error in a translated statement names its TypeScript line');
  check(mapped[1] === log.split('\n')[1], 'a Kotlin error in generated code with no source line is left as it is');
  check(mapped[2] === log.split('\n')[2] && mapped[3] === log.split('\n')[3], 'other lines are left as they are');
} finally {
  rmSync(project, { recursive: true, force: true });
}

// ---- Angular templates ----
{
  const component = (template: string) => angularComponent('/app/people.component.ts', `import { Component, inject } from '@angular/core';
@Component({ selector: 'People', template: \`${template}\` })
export class People { items = [{ id: 1, name: 'Alan Turing' }]; }
`, new Map())!;
  type Node = { kind: string; tag?: string; attrs?: { name: string }[]; events?: { name: string; method: string }[]; children?: Node[]; body?: Node[] };
  const all = (nodes: Node[]): Node[] => nodes.flatMap((n) => [n, ...all(n.children ?? []), ...all(n.body ?? [])]);
  const linked = (c: AngularComponent, tag: string) => all(c.template as Node[]).find((n) => n.tag === tag)!;
  const method = (c: AngularComponent, name: string) => c.source.split('\n').find((l) => l.trimStart().startsWith(`${name}(`)) ?? '';

  const rows = component(`<ListView [items]="items"><ng-template let-item="item"><StackLayout [nsRouterLink]="['/item', item.id]"><Label [text]="item.name"></Label></StackLayout></ng-template></ListView>`);
  const row = linked(rows, 'StackLayout');
  const tap = row.events?.find((e) => e.name === 'tap');
  check(!!tap && !row.attrs?.some((a) => a.name === 'nsRouterLink'), '[nsRouterLink] on a ListView row template is a tap handler, not a view property');
  check(!!tap && /^\s*\$e\d+\(item = .*\$event.*this\.\$router\.navigate\(\['\/item', item\.id\], \{ relativeTo: this\.\$route \}\)/.test(method(rows, tap.method)), "a row's link navigates with the row's item");
  check(/readonly \$route = inject\(\$ActivatedRoute\)/.test(rows.source), "a link resolves against the component's own route, read when it is made");

  const plain = component(`<Label text="About" nsRouterLink="about" pageTransition="none" clearHistory="true"></Label><Button [nsRouterLink]="target" text="Go"></Button>`);
  const label = linked(plain, 'Label');
  check(!label.attrs?.some((a) => ['nsRouterLink', 'pageTransition', 'clearHistory'].includes(a.name)), "nsRouterLink's inputs are the directive's, not the view's");
  check(method(plain, label.events?.[0]?.method ?? '-').includes(`navigate(["about"], { relativeTo: this.$route, animated: false, clearHistory: true })`), 'a fixed link is one command, with its transition and clearHistory');
  check(/Array\.isArray\(\$commands\) \? \$commands : \[\$commands\]/.test(method(plain, linked(plain, 'Button').events?.[0]?.method ?? '-')), 'a bound link is its commands, or one command');

  const lineOf = (c: AngularComponent, name: string) => c.source.split('\n').findIndex((l) => l.trimStart().startsWith(`${name}(`));
  const pinned = (c: AngularComponent, name: string) => c.templateLines?.lines.find(([v]) => v === lineOf(c, name))?.[1];
  const multi = component(`<StackLayout>
  <Label [text]="items[0]?.name"></Label>
</StackLayout>`);
  const label2 = linked(multi, 'Label');
  check(multi.templateLines?.file === '/app/people.component.ts' && pinned(multi, (label2.attrs as { name: string; method?: string }[]).find((a) => a.name === 'text')!.method!) === 3, "a binding's method is located at its line in the template, not by matching the component's code");
  check(/\$b\d+\(\): any \{ return \(this\.items\[0\]\?\.name\); \}/.test(multi.source), 'a view property bound to an optional chain takes undefined where the chain stops, whatever its type says');

  let refused = '';
  try { component(`<Label nsRouterLink="/a" [queryParams]="{ q: 1 }"></Label>`); } catch (e) { refused = String(e); }
  check(refused.includes("nsRouterLink's queryParams is not supported"), 'a link input the compiled router has no use for stops the build');
}

console.log(failed ? `${failed} release checks failed` : 'release checks pass');
process.exit(failed ? 1 : 0);
