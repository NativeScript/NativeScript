#!/usr/bin/env node
// The checks a compiled release runs before compiling, and the tools that map
// its native output back to TypeScript, on fixed inputs:
//   node tests/release-checks/run.ts
// - preflight: every line of cases/*.ts ending in `// expect: <text>` is reported with <text>, and no other line;
// - satisfies: version ranges as the contract reads package.json's peerDependencies;
// - Kotlin diagnostics: a Gradle error in a generated file maps to its TypeScript line through source-lines.json;
// - a plugin's own Java classes (plugin-java/, compiled with javac) translate as native calls without typings declaring them;
// - an app's module graph (tsconfig paths and exclude, what its entry reaches), its plugins' ES module bundles, the
//   imports and prefix header of the generated project, and native calls into a module the build has no table for.
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProgram } from '../../src/program.ts';
import { preflight } from '../../src/preflight.ts';
import { satisfies } from '../../src/contract.ts';
import { mapKotlinDiagnostics } from '../../src/kotlin-diagnostics.ts';
import { angularComponent, angularRouteTree, componentOf, declarableSource, routedComponents, type AngularComponent } from '../../src/angular.ts';
import { angularLibraries } from '../../src/angular-libraries.ts';
import { pathAliases } from '../../src/app-paths.ts';
import { appImports, reachedFrom, tsconfigIncluded } from '../../src/app-modules.ts';
import { runtimeFile } from '../../src/plugins/resolve.ts';
import { PluginSources, verifyBundle } from '../../src/plugins/source.ts';
import { manifest, ownTypings, scopedImports, usedImports } from '../../src/plugins/native.ts';
import { singleTry, Translator as SwiftTranslator } from '../../src/swift.ts';
import { translateModules } from '../../src/modules.ts';
import { setEmptyTable } from '../../src/natives/symbols.ts';
import { render } from '../../src/codegen.ts';
import { Translator } from '../../src/kotlin.ts';
import { translateKotlinModules } from '../../src/kotlin-modules.ts';
import { AndroidNativeAPI, androidClassPath } from '../../src/native-calls-android.ts';
import { spawnSync } from 'node:child_process';

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

  const mixed = component(`<Label text="Hi {{ items.length > 1 ? 'all' : 'one' }}!"></Label>`);
  check(method(mixed, (linked(mixed, 'Label').attrs as { name: string; method?: string }[]).find((a) => a.name === 'text')?.method ?? '-').includes("return (`Hi ${(this.items.length > 1 ? 'all' : 'one') ?? ''}!`);"), 'a text attribute mixing literal text and {{ }} is a template literal of both');
  const documented = componentOf('/app/pill.component.ts', `@Component({ selector: 'primary-pill', template: '' })\n/** A doc comment between the decorator and the class. */\nexport class PrimaryPill {}\n`);
  check(documented?.selector === 'primary-pill' && documented.name === 'PrimaryPill', "a component's selector is read whatever comes between its decorator and its class");

  // Angular's template features beyond bindings: platform filters, ng-container, NgSwitch, NgTemplateOutlet, pipes.
  const source = (template: string, members = 'items = [{ id: 1, name: "Alan Turing" }]; mode = "a"; when = new Date(0); first = { name: "Ada" };') => `import { Component } from '@angular/core';
@Component({ selector: 'People', template: \`${template}\` })
export class People { ${members} }
`;
  const shaped = (template: string, options: Parameters<typeof angularComponent>[3] = {}) => angularComponent('/app/people.component.ts', source(template), new Map(), options)!;
  const tags = (c: AngularComponent) => all(c.template as Node[]).map((n) => n.tag ?? n.kind);
  const filtered = shaped(`<StackLayout><android><Label text="a"></Label></android><ios><Button text="i"></Button></ios></StackLayout>`, { platform: 'ios' });
  check(tags(filtered).includes('Button') && !tags(filtered).includes('Label'), '<ios> renders its content on iOS and <android> nothing, as the platform filter components do');
  const contained = shaped(`<StackLayout><ng-container row="1"><Label text="x"></Label></ng-container></StackLayout>`);
  check(tags(contained).join() === 'StackLayout,Label', "<ng-container>'s attributes select directives only: its children join its parent");
  const switched = shaped(`<StackLayout [ngSwitch]="mode"><Label *ngSwitchCase="'a'" text="a"></Label><Label *ngSwitchDefault text="d"></Label></StackLayout>`);
  check(/=== \('a'\)/.test(switched.source) && /!\(\(this\.\$b\d+\(\)\) === \('a'\)\)/.test(switched.source), "ngSwitchDefault renders when no ngSwitchCase is === the switch's value");
  const outlet = shaped(`<StackLayout><ng-template #row let-person let-n="index"><Label [text]="n + person.name"></Label></ng-template><ng-container *ngTemplateOutlet="row; context: { $implicit: first, index: 1 }"></ng-container></StackLayout>`);
  check(/return \(\(\(1\)\) \+ \(\(this\.first\)\)\.name\)/.test(outlet.source), "ngTemplateOutlet renders the referenced template, its let- variables read from the context's properties");
  const piped = shaped(`<StackLayout><Label *ngFor="let item of items" [text]="item.name | uppercase"></Label><Label [text]="when | date: 'y'"></Label><Label [text]="items | json"></Label></StackLayout>`, { runtimeModule: '/app/__angular.release.ts' });
  const loop = all(piped.template as Node[]).find((n) => n.kind === 'for') as Node | undefined;
  check(!!loop && (loop.body ?? []).some((n) => n.kind === 'local'), 'a pipe in an *ngFor row is one per row, a local of the row');
  check(/\$c\d+\.pure1\(/.test(piped.source) && /\$c\d+\.pure2\(\(this\.when\), \('y'\)/.test(piped.source) && /\$p\d+\.transform\(this\.items\)/.test(piped.source), 'a pure pipe transforms through its site\'s cache, an impure one on every check');
  check(!!piped.usesRuntime && piped.source.includes("from './__angular.release'"), "@angular/common's pipes come from the build's Angular runtime module");
  let unknown = '';
  try { shaped(`<Label [text]="items | currency"></Label>`); } catch (e) { unknown = String(e); }
  check(unknown.includes("@angular/common's currency pipe is not supported"), 'a pipe the build has no class for stops the build, naming it');
  const classic = angularComponent('/app/badge.component.ts', `import { Component, Input } from '@angular/core';
@Component({ selector: 'Badge', template: '<Label [text]="tone"></Label>' })
export class Badge { @Input('total') count = 0; @Input() set tone(v: string) { this.shown = v; } shown = ''; bump() { this.count += 1; this.tone = 'x'; } }
`, new Map())!;
  check(classic.setters?.join() === 'tone' && classic.propAliases?.count === 'total', "an @Input setter is a setter prop, an aliased input bound by its alias");
  check(/this\.count\.\$assign\(this\.count\(\) \+ \(1\)\)/.test(classic.source) && /this\.\$set_tone\('x'\)/.test(classic.source), 'a component writing its own inputs writes their signal, or calls the setter');
  const queried = angularComponent('/app/q.component.ts', `import { Component, ElementRef, ViewChild } from '@angular/core';
@Component({ selector: 'Q', template: '<StackLayout #box><Label #title></Label></StackLayout>' })
export class Q { @ViewChild('box', { static: true }) box: ElementRef; @ViewChild('title') title: ElementRef; ngOnInit() {} ngAfterViewInit() {} ngOnDestroy() {} }
`, new Map())!;
  const box = all(queried.template as Node[]).find((n) => n.tag === 'StackLayout') as Node & { init?: boolean; queries?: unknown[] };
  check(!!queried.lateInit && !!box?.init && box.queries?.length === 1, 'a static view query is set when its element is made, and ngOnInit runs once it is');
  check(queried.afterViewInit === 'ngAfterViewInit' && queried.destroy === 'ngOnDestroy' && /this\.box = new \$ElementRef\(\$q\)/.test(queried.source), "ngAfterViewInit and ngOnDestroy are the component's hooks, a #ref query an ElementRef");
  const directive = { className: 'Glow', file: '/app/glow.directive.ts', selector: '[glow]', inputs: new Map([['glow', 'level']]), listeners: [{ event: 'tap', code: 'flash($event)' }], bindings: [{ prop: 'opacity', code: 'level' }], attributes: [], create: false, hooks: new Set(['ngOnInit']), structural: false, members: ['level', 'flash'] };
  const glowing = angularComponent('/app/g.component.ts', `import { Component } from '@angular/core';
import { Glow } from './glow.directive';
@Component({ selector: 'G', imports: [Glow], template: '<StackLayout><Label [glow]="2"></Label><Label text="no glow"></Label></StackLayout>' })
export class G {}
`, new Map(), { directives: [directive] })!;
  const lit = all(glowing.template as Node[]).filter((n) => n.tag === 'Label') as (Node & { directives?: { inputs: unknown[]; listeners: unknown[]; bindings: unknown[] }[] })[];
  check(lit[0]?.directives?.length === 1 && lit[0].directives[0].inputs.length === 1 && !lit[0].attrs?.some((a) => a.name === 'glow') && !lit[1]?.directives, "a directive in the component's scope applies where its selector matches, and its inputs' bindings are its own");
  const outOfScope = angularComponent('/app/h.component.ts', `import { Component } from '@angular/core';
@Component({ selector: 'H', template: '<Label [glow]="2"></Label>' })
export class H {}
`, new Map(), { directives: [directive] })!;
  check(!(all(outOfScope.template as Node[])[0] as { directives?: unknown[] }).directives, "a directive the component does not import does not apply");
  const keyworded = angularComponent('/app/k.component.ts', `import { Component } from '@angular/core';
@Component({ selector: 'K', template: '<Button (tap)="continue()" text="go"></Button>' })
export class K { continue() {} }
`, new Map())!;
  check(/\$e\d+\(\$event: \$EventData\) \{ this\.continue\(\); \}/.test(keyworded.source), 'a member named like a keyword (continue) is read on the component');
  const decl = declarableSource('/app/glyph.pipe.ts', `import { Pipe, Inject, Optional, ChangeDetectorRef } from '@angular/core';
@Pipe({ name: 'glyph', pure: false })
export class GlyphPipe { constructor(@Inject(TOKEN) private config: any, @Optional() private ref: ChangeDetectorRef) {} transform(v: string) { return v; } }
`) ?? '';
  check(!decl.includes('@Pipe') && !decl.includes('@Inject') && /static \$create\(\): GlyphPipe \{ return new GlyphPipe\(inject\(TOKEN\), inject\(ChangeDetectorRef, \{ optional: true \}\)\); \}/.test(decl) && decl.startsWith("import { inject } from '@angular/core';"), "a pipe's constructor is injected through $create, as Angular's factory injects it");
}

// ---- An app's own module graph ----
{
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-app-'));
  const w = (f: string, text: string) => { mkdirSync(dirname(join(dir, f)), { recursive: true }); writeFileSync(join(dir, f), text); return join(dir, f); };
  try {
    w('tsconfig.json', JSON.stringify({ compilerOptions: { paths: { '~/*': ['./src/*'], '@fixtures': ['./src/fixtures/index'], '@outside/*': ['../outside/*'] } }, exclude: ['**/*.spec.ts'] }));
    const main = w('src/main.ts', "import { routes } from './app.routes';\nimport { App } from '~/app/app';\nbootstrapApplication(App, { providers: [provideRouter(routes)] });\n");
    const routes = w('src/app.routes.ts', "export const routes = [{ path: 'a', loadComponent: () => import('~/app/lazy').then((m) => m.Lazy) }, { path: 'b', loadChildren: () => import('~/app/child.routes').then((m) => m.childRoutes) }];\n");
    const child = w('src/app/child.routes.ts', "import { Lazy } from '~/app/lazy';\nexport const childRoutes = [{ path: 'c', component: Lazy }];\n");
    const app = w('src/app/app.ts', "import { helper } from './helper';\nexport class App {}\n");
    const helper = w('src/app/helper.ios.ts', 'export const helper = 2;\n');
    const lazy = w('src/app/lazy.ts', 'export class Lazy {}\n');
    const spec = w('src/app/app.spec.ts', "import { App } from './app';\nimport { stub } from '@fixtures';\n");
    const fixtures = w('src/fixtures/index.ts', 'export const stub = 0;\n');
    const test = w('src/test.ts', "import './app/app.spec';\n");
    const aliased = pathAliases(dir);
    check(aliased('~/app/app') === join(dir, 'src/app/app') && aliased('@fixtures') === fixtures.replace(/\.ts$/, '') && aliased('~/app/missing') === undefined && aliased('@outside/x') === undefined, "tsconfig paths name the app's own files, and only those");
    const files = [main, routes, child, app, helper, lazy, spec, fixtures, test];
    const reached = reachedFrom([main], appImports(files, aliased, '.ios.ts').importsOf);
    check([routes, child, app, helper, lazy].every((f) => reached.has(f)) && ![spec, fixtures, test].some((f) => reached.has(f)), "an entry reaches its modules through relative and aliased imports, lazy ones too, and no test's");
    const included = tsconfigIncluded(dir, join(dir, 'src'))!;
    check(!included.has(spec) && included.has(test) && included.has(app), "a file the app's tsconfig excludes is not one of its modules");
    const tree = angularRouteTree(main, (f) => readFileSync(f, 'utf8'), aliased);
    check(!!tree && routedComponents(tree.routes).join() === 'Lazy,Lazy' && tree.files.has(child), 'lazy routes are followed through tsconfig paths');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ---- Plugins published as ES modules, and the generated project ----
{
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-esm-'));
  const w = (f: string, text: string) => { mkdirSync(dirname(join(dir, f)), { recursive: true }); writeFileSync(join(dir, f), text); return join(dir, f); };
  try {
    const modules = join(dir, 'node_modules');
    const pkg = join(modules, '@hk/esm');
    w('node_modules/@hk/esm/package.json', JSON.stringify({ name: '@hk/esm', version: '1.0.0', module: 'fesm2022/hk-esm.mjs', exports: { './package.json': { default: './package.json' }, '.': { types: './types/hk-esm.d.ts', default: './fesm2022/hk-esm.mjs' }, './testing': { types: './types/testing.d.ts', default: './fesm2022/hk-esm-testing.mjs' } } }));
    const sources = { a: 'export const a = 1;\n', index: "export * from './src/a';\n", generated: "/**\n * Generated bundle index. Do not edit.\n */\n\nexport * from './index';\n" };
    const bundle = w('node_modules/@hk/esm/fesm2022/hk-esm.mjs', 'const a = 1;\nexport { a };\n');
    w('node_modules/@hk/esm/fesm2022/hk-esm.mjs.map', JSON.stringify({ version: 3, file: 'hk-esm.mjs', sources: ['../../../../modules/esm/src/a.ts', '../../../../modules/esm/index.ts', '../../../../modules/esm/hk-esm.ts'], sourcesContent: [sources.a, sources.index, sources.generated], mappings: '' }));
    const testing = w('node_modules/@hk/esm/fesm2022/hk-esm-testing.mjs', 'export {};\n');
    w('checkout/modules/esm/package.json', JSON.stringify({ name: '@hk/esm' }));
    const a = w('checkout/modules/esm/src/a.ts', sources.a);
    const entry = w('checkout/modules/esm/index.ts', sources.index);
    check(runtimeFile('@hk/esm', modules, 'ios')?.file === bundle && runtimeFile('@hk/esm/testing', modules, 'ios')?.file === testing, "a package with only ES modules resolves to the file its exports name");
    const plugins = new PluginSources({ app: dir, platform: 'ios', overrides: { '@hk/esm': join(dir, 'checkout') } });
    const source = plugins.get(pkg);
    check(plugins.sourceOf(bundle) === entry, "a bundle is compiled from the entry its generated index re-exports");
    let verified = '';
    try { verifyBundle(source.name, bundle, source.bundles.get(bundle)!); } catch (e) { verified = String(e); }
    writeFileSync(a, 'export const a = 2;\n');
    let changed = '';
    try { verifyBundle(source.name, bundle, source.bundles.get(bundle)!); } catch (e) { changed = String(e); }
    check(!verified && changed.includes('was not built from its source') && changed.includes('src/a.ts'), "a bundle is checked against the sources its map embeds");
    let missing = '';
    try { plugins.sourceOf(testing); } catch (e) { missing = String(e); }
    check(missing.includes('has no TypeScript source'), "a bundle file without sources says so");

    // A plugin augmenting another's module in the declarations beside its source, as firebase-messaging augments firebase-core.
    symlinkSync(join(modulesDir, '@nativescript'), join(modules, '@nativescript'));
    for (const [name, text] of [['hub', 'export class Hub { name = "hub"; }\nexport function hub() { return new Hub(); }\n'], ['ext', "import '@hk/hub';\nexport const ext = 1;\n"]]) {
      w(`node_modules/@hk/${name}/package.json`, JSON.stringify({ name: `@hk/${name}`, version: '1.0.0', main: 'index' }));
      w(`node_modules/@hk/${name}/index.ios.js`, '');
      w(`${name}/package.json`, JSON.stringify({ name: `@hk/${name}` }));
      w(`${name}/index.ios.ts`, text);
    }
    w('ext/index.d.ts', "declare module '@hk/hub' {\n  interface Hub { extended(): number }\n}\nexport declare const ext: number;\n");
    const user = w('src/hub-user.ts', "import '@hk/ext';\nimport { hub } from '@hk/hub';\nexport const n: () => number = () => hub().extended();\n");
    let augmented = '';
    try { createProgram([user], new Map(), 'ios', modules, new PluginSources({ app: dir, platform: 'ios', overrides: { '@hk/hub': join(dir, 'hub'), '@hk/ext': join(dir, 'ext') } })); } catch (e) { augmented = String(e); }
    check(!augmented, `a plugin's augmentation of another plugin's module applies to that module's source${augmented ? `: ${augmented.split('\n')[1]}` : ''}`);

    const stub = { get: () => { throw new Error('acquired'); } } as unknown as PluginSources;
    const home = w('src/home.ts', "import { PagerModule } from '@hk/pager/angular';\n");
    w('node_modules/@hk/pager/index.js', '');
    let acquired = '';
    try { angularLibraries([home], modules, stub, new Set(['@hk/pager'])); } catch (e) { acquired = String(e); }
    check(!acquired, "the Angular wrapper of a package the app replaces is not acquired");

    const names = new Map<string, Set<string> | null>([['PlugA', new Set(['PlugA', 'PAView'])], ['PlugB', new Set(['PlugB', 'PBThing'])], ['Empty', new Set(['Empty'])], ['Untabled', null]]);
    const imported = usedImports('import Foundation\nimport PlugA\nimport PlugB\nimport Empty\nimport Untabled\n\nlet v = PAView()\n', names);
    check(imported === 'import Foundation\nimport PlugA\nimport Untabled\n\nlet v = PAView()\n', "a generated file imports the plugin modules it names, and those no table describes");
    const types = new Map([
      ['NativeScriptKit', { types: { ImageAsset: 'class' as const, Utils: 'enum' as const }, named: new Set(['ImageAsset', 'Utils']) }],
      ['Lottie', { types: { ImageAsset: 'class' as const }, named: new Set<string>() }],
      ['RevenueCat', { types: { SubscriptionInfo: 'class' as const }, named: new Set(['SubscriptionInfo']) }],
      ['StoreKit', { types: { SubscriptionInfo: 'struct' as const, Product: 'struct' as const }, named: new Set<string>() }],
    ]);
    const scoped = scopedImports('import NativeScriptKit\nimport Lottie\nimport RevenueCat\nimport StoreKit\n\nvar a: ImageAsset? = nil\nvar s: SubscriptionInfo? = nil\nvar u = Utils.self\n', types, 'NativeScriptKit', () => false);
    check(scoped.includes('import StoreKit\nimport class NativeScriptKit.ImageAsset\nimport class RevenueCat.SubscriptionInfo\n\n') && !scoped.includes('Utils\n'), "a type name two imported modules declare is the kit's, else the one its typings name, by a scoped import");
    const reexported = scopedImports('import NativeScriptKit\nimport RevenueCat\n\n// SubscriptionInfo\nvar s: SubscriptionInfo? = nil\nlet t = s.toString()\n', types, 'NativeScriptKit', () => false);
    check(reexported.includes('import RevenueCat\nimport class RevenueCat.SubscriptionInfo\n\n'), "a type name a module the file does not import declares too (StoreKit, which RevenueCat re-exports) is named by a scoped import");
    const own = { files: new Map([[join(pkg, 'index.ios.js'), join(dir, 'checkout/packages/review/index.ios.ts')]]) } as unknown as Parameters<typeof ownTypings>[0];
    check(ownTypings(own, [join(dir, 'checkout/packages/review/types/objc!NSCReview.d.ts'), join(dir, 'checkout/packages/other/types/objc!X.d.ts')]).join() === join(dir, 'checkout/packages/review/types/objc!NSCReview.d.ts'), "a plugin's typings beside its source are its own native code's");
    const clang = { kind: 'clang', name: 'Canvas', module: 'Canvas', path: 'Sources/Canvas', publicHeaders: 'include' } as unknown as Parameters<typeof manifest>[0][0];
    check(manifest([clang], '/out/Plugins/NSPluginsPrefix.h').includes('cSettings: [.unsafeFlags(["-include", "/out/Plugins/NSPluginsPrefix.h"])]'), "a plugin's Objective-C is compiled with the prefix header an app's own build gives it");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ---- Swift emission ----
{
  check(singleTry('try (try! Color(a))') === 'try (try! Color(a))' && singleTry('try ((try? x) != nil)') === 'try ((try? x) != nil)' && singleTry('try (try jsGet(a))') === 'try ( jsGet(a))', 'one try is dropped where two cover a check, never a try! or try?');
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-native-'));
  try {
    const dts = join(dir, 'objc!HKFakeKit.d.ts');
    writeFileSync(dts, 'declare class HKThing extends NSObject { static alloc(): HKThing; initWithName(name: string): HKThing; }\n');
    const file = join(dir, 'use.ios.ts');
    writeFileSync(file, "export const thing = HKThing.alloc().initWithName('x');\n");
    setEmptyTable('HKFakeKit', 'release-checks');
    const { checker, program, files } = createProgram([file], new Map(), 'ios', modulesDir, undefined, [dts]);
    const translator = new SwiftTranslator(checker, new Map(), files);
    translator.errors = [];
    translateModules(translator, program, [file]);
    check(translator.errors.some((e) => e.includes('HKThing.alloc().initWithName() (HKFakeKit is a module of neither')), 'a class of a module the build has no table for is reported where it is allocated');
    const setter = join(dir, 'offset.ts');
    writeFileSync(setter, 'export class Offset {\n  x = 0;\n  get at() { return { x: this.x }; }\n  set at({ x }: { x: number }) { this.x = x; }\n}\nnew Offset().at = { x: 2 };\n');
    const typed = createProgram([setter], new Map(), 'ios', modulesDir);
    const setters = new SwiftTranslator(typed.checker, new Map(), typed.files);
    setters.errors = [];
    translateModules(setters, typed.program, [setter]);
    check(setters.errors.length === 1 && setters.errors[0].includes('a setter whose parameter is a destructuring pattern'), 'a setter destructuring its value is reported, not a crash');
    const named = join(dir, 'named.ios.ts');
    writeFileSync(named, "export class ProcessInfo {\n  name = 'mine';\n}\nexport const processName = NSProcessInfo.processInfo.processName;\nexport const own = new ProcessInfo().name;\n");
    const clash = createProgram([named], new Map(), 'ios', modulesDir);
    const clashes = new SwiftTranslator(clash.checker, new Map(), clash.files);
    const clashCode = translateModules(clashes, clash.program, [named]).map((m) => m.code).join('\n');
    check(/= Foundation\.ProcessInfo\.processInfo\.processName/.test(clashCode) && /= ProcessInfo\(\)\.name/.test(clashCode), "a native class named as one of the program's is named by its module (Foundation.ProcessInfo)");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ---- Template errors are reported, never trapped ----
{
  // nstreamdown's `@if (token.type === 'mermaid') { <MdMermaid [content]="…" [isIncomplete]="getIsIncomplete(token)"> }`, every binding able to throw.
  const parent = {
    name: 'Streamdown', file: '/app/streamdown.ts', source: '', props: [],
    template: [{ kind: 'element' as const, tag: 'StackLayout', attrs: [], events: [{ name: 'tap', method: '$e3', when: '$b4' }], children: [
      { kind: 'if' as const, branches: [{ cond: '$b0', body: [{ kind: 'component' as const, name: 'MdMermaid', props: [{ name: 'content', method: '$b1' }, { name: 'isIncomplete', method: '$b2' }, { name: 'token', method: '$b5' }], events: [] }] }] },
    ] }],
  };
  const children = new Map([['MdMermaid', { props: ['content', 'isIncomplete', 'token'], optional: ['content', 'isIncomplete'] }]]);
  const swift = render(parent, children, () => true, 'angular').join('\n');
  const made = /let (c\d+) = MdMermaid\((.*)\)$/m.exec(swift);
  check(!!made && !/content:|isIncomplete:/.test(made[2]), "a component prop whose binding may throw starts at its default, not at a value read with try!");
  check(!!made && /token: untrack \{ jsReportedOrZero \{ try self\._b5\(\) \} \}/.test(made[2]), 'a required prop whose binding may throw starts at its zero, the error reported');
  check(!!made && new RegExp(`Check\\(\\{ try self\\._b2\\(\\) \\}\\) \\{ ${made[1]}\\.isIncomplete\\.value = \\$0 \\}`).test(swift), "the binding's own check sets the prop, reporting what it throws");
  check(/Choose\(r\d+, \{ jsReportedTruthy\(\{ try self\._b0\(\) \}\) \? 0 : 1 \}[,)]/.test(swift), 'a condition that throws is reported and counts as false');
  check(/if jsReportedTruthy\(\{ try self\._b4\(\) \}\) \{/.test(swift), "a listener's guard that throws is reported and counts as false");
  check(!/try!|try\?/.test(swift.replace(/let v\d+ = try! StackLayout\(\)/g, '')), 'no binding, condition or prop is read with try! or try?');
}

// ---- Top-level names the kit declares too ----
{
  // ui-chart's `Utils` namespace in the app's one package would hide kit-android's `Utils` from every file.
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-names-'));
  try {
    writeFileSync(join(dir, 'charting.ts'), 'export namespace Utils {\n  export function scaled(n: number): number {\n    return n * 2;\n  }\n}\nexport enum Trace {\n  Off,\n  On,\n}\n');
    writeFileSync(join(dir, 'theme.ts'), 'export interface Page {\n  title: string;\n}\n');
    const app = join(dir, 'app.ts');
    writeFileSync(app, "import { Trace, Utils } from './charting';\nimport { Page } from './theme';\nconst page: Page = { title: 'home' };\nconsole.log(Utils.scaled(2), Trace.On, page.title);\n");
    const { checker, program } = createProgram([app], new Map(), 'android', modulesDir);
    const all = program.getSourceFiles().filter((f) => !f.isDeclarationFile);
    const translator = new Translator(checker, new Map(), all, { pluginFiles: [join(dir, 'charting.ts')] });
    translator.appModule = 'org.example.app';
    const kit = new Set(['Utils', 'Trace', 'Page']);
    translator.core = { has: (n) => kit.has(n), isKitView: () => false, kitMember: () => null, isKitMethod: () => false, nativeClassOf: () => null, type: () => null, property: () => null, lvalue: () => null, call: () => null, construct: () => null, assign: () => null };
    const code = translateKotlinModules(translator, program, all.map((f) => f.fileName)).map((m) => m.code).join('\n') + translator.interfacesOf(join(dir, 'theme.ts'));
    check(/^object Utils__charting \{/m.test(code) && /^object Trace__charting \{/m.test(code) && /Utils__charting\.scaled\(2\.0\), Trace__charting\.On/.test(code) && !/^object (Utils|Trace) /m.test(code), "a plugin's namespace and enum named as kit-android's take their module's name (Kotlin)");
    check(/^class Page__theme\(/m.test(code) && /val page: Page__theme = Page__theme\(title = "home"\)/.test(code), "an app's interface named as a kit-android class takes its module's name, its literals too (Kotlin)");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ---- A plugin's own Java classes ----
{
  const dir = join(here, 'plugin-java');
  const out = mkdtempSync(join(tmpdir(), 'ns-release-checks-java-'));
  try {
    const javac = spawnSync('javac', ['-d', join(out, 'classes'), join(dir, 'com/example/peek/Peeker.java')], { encoding: 'utf8' });
    const jar = spawnSync('jar', ['cf', join(out, 'plugin.jar'), '-C', join(out, 'classes'), '.'], { encoding: 'utf8' });
    if (javac.status !== 0 || jar.status !== 0) throw new Error(`javac: ${javac.stderr}${jar.stderr}`);
    const file = join(dir, 'index.android.ts');
    // Type-checked as a plugin's source is: not as strictly as the app's.
    const plugin = { all: () => [{ root: dir }] } as unknown as Parameters<typeof createProgram>[4];
    const { checker, program, files } = createProgram([file], new Map(), 'android', modulesDir, plugin);
    const translator = new Translator(checker, new Map(), files, { pluginFiles: [file] });
    translator.appModule = 'org.example.app';
    translator.native = new AndroidNativeAPI(translator, androidClassPath(null, { archives: [join(out, 'plugin.jar')], dependencies: [] }));
    const code = translateKotlinModules(translator, program, [file]).map((m) => m.code).join('\n');
    check(/= com\.example\.peek\.Peeker\(\)/.test(code) && !/jsGet\(com\b/.test(code), "a plugin's Java class its typings lack is made with its constructor, found on the classpath");
    check(/com\.example\.peek\.Peeker\.twice\(/.test(code), "a plugin's Java class its typings lack has its static methods called directly");
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}

console.log(failed ? `${failed} release checks failed` : 'release checks pass');
process.exit(failed ? 1 : 0);
