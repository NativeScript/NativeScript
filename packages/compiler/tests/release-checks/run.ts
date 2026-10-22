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
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
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
import { PluginSources, verify, verifyBundle } from '../../src/plugins/source.ts';
import { manifest, ownTypings, pluginNative, scopedImports, usedImports, xcodegenLines } from '../../src/plugins/native.ts';
import { singleTry, Translator as SwiftTranslator } from '../../src/swift.ts';
import { translateModules } from '../../src/modules.ts';
import { conformsTo, lookupMember, nativeTable, setEmptyTable } from '../../src/natives/symbols.ts';
import { isFragment, render } from '../../src/codegen.ts';
import { Translator } from '../../src/kotlin.ts';
import { translateKotlinModules } from '../../src/kotlin-modules.ts';
import { AndroidNativeAPI, androidClassPath } from '../../src/native-calls-android.ts';
import { stubbedPlugins } from '../../src/app-resources.ts';
import { builtModules } from '../../src/ios-dependencies.ts';
import { STUBBED_PLUGINS } from '../../src/core.ts';
import { detectFramework, excludedFrameworkKitFiles, getFrameworkKitInfo } from '../../src/framework.ts';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';

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

    // A plugin published as ES5 CommonJS is checked against its source lowered the same way.
    const cjsSource = 'export class Counter {\n  constructor(private start: number) {}\n  next(step = 1): number { return this.start + step; }\n}\nexport const label = (n: number) => `n${n}`;\n';
    const cjsSrc = w('cjs/src/index.ios.ts', cjsSource);
    const cjsOut = (text: string) => ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES5 } }).outputText;
    const cjsJs = w('node_modules/@hk/cjs/index.ios.js', cjsOut(cjsSource));
    let cjs = '';
    try { verify('@hk/cjs', cjsJs, cjsSrc); } catch (e) { cjs = String(e); }
    writeFileSync(cjsJs, cjsOut(cjsSource.replace('this.start + step', 'this.start - step')));
    w('patches/@hk+cjs+1.0.0.patch', '');
    let cjsChanged = '';
    try { verify('@hk/cjs', cjsJs, cjsSrc, dir, '1.0.0'); } catch (e) { cjsChanged = String(e); }
    check(!cjs && cjsChanged.includes('does not match the published') && cjsChanged.includes('patched by patches/@hk+cjs+1.0.0.patch'), `an ES5 CommonJS plugin is verified against its source, and a mismatch names the app's patch of it${cjs ? `: ${cjs.split('\n').slice(0, 4).join(' ')}` : ''}`);

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

    // A plugin whose platform file exports less than the declarations beside it.
    w('node_modules/@hk/decl/package.json', JSON.stringify({ name: '@hk/decl', version: '1.0.0', main: 'index' }));
    w('node_modules/@hk/decl/index.ios.js', '');
    w('decl/package.json', JSON.stringify({ name: '@hk/decl' }));
    w('decl/common.ts', "export interface Options { n: number }\nexport function twice(n: number) { return 2 * n; }\nexport const kind = 'decl';\n");
    w('decl/shapes.ts', 'export class Square { side = 1; }\n');
    w('decl/index.ios.ts', "import { Options, twice } from './common';\nfunction scale(o: Options) { return twice(o.n); }\nexport class Decl { run(o: Options): number { return scale(o); } }\n");
    w('decl/index.d.ts', "import { Options } from './common';\nexport { Options };\nexport * from './shapes';\nexport { kind } from './common';\nexport interface Result { ok: boolean }\nexport declare function scale(o: Options): number;\nexport declare function missing(): void;\nexport declare class Decl { run(o: Options): number; }\n");
    const declUser = w('src/decl-user.ts', "import { Decl, Options, Result, Square, kind, scale } from '@hk/decl';\nconst o: Options = { n: 2 };\nexport const r: Result = { ok: new Decl().run(o) === scale(o) && new Square().side === 1 && kind === 'decl' };\n");
    let declared = '';
    try {
      const { program, checker, files } = createProgram([declUser], new Map(), 'ios', modules, new PluginSources({ app: dir, platform: 'ios', overrides: { '@hk/decl': join(dir, 'decl') } }));
      const entry = files.find((f) => f.fileName.endsWith('decl/index.ios.ts'))!;
      const names = checker.getExportsOfModule(checker.getSymbolAtLocation(entry)!).map((s) => s.name).sort().join();
      if (names !== 'Decl,Options,Result,Square,kind,scale') declared = `exports ${names}`;
      const translator = new SwiftTranslator(checker, new Map(), files);
      translator.errors = [];
      translateModules(translator, program, files.map((f) => f.fileName));
      if (translator.errors.length) declared = translator.errors.join('; ');
    } catch (e) { declared = String(e); }
    check(!declared, `a plugin's platform file exports what the declarations beside it export, values only where it has them${declared ? `: ${declared.split('\n').slice(0, 3).join(' ')}` : ''}`);

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

// ---- Plugins' iOS code: Swift beside Objective-C, and the tables of their modules ----
{
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-mixed-'));
  const w = (f: string, text: string) => { mkdirSync(dirname(join(dir, f)), { recursive: true }); writeFileSync(join(dir, f), text); return join(dir, f); };
  const tableCache = process.env.NS_NATIVE_TABLE_CACHE;
  try {
    // As firebase-messaging-core: a module map over Objective-C, and Swift importing it.
    w('mixed/platforms/ios/src/module.modulemap', 'module HKMixedObjC {\n  umbrella header "HKMixedObjC.h"\n  export *\n}\n');
    w('mixed/platforms/ios/src/HKMixedObjC.h', '#import <Foundation/Foundation.h>\n@interface HKMixedLoader : NSObject\n+ (NSString *)greeting;\n@end\n');
    w('mixed/platforms/ios/src/HKMixedLoader.m', '#import "HKMixedObjC.h"\n@implementation HKMixedLoader\n+ (NSString *)greeting { return @"hi"; }\n@end\n');
    w('mixed/platforms/ios/src/HKMixedHelper.swift', [
      'import UIKit', 'import HKMixedObjC', '',
      '@objc public enum HKMixedMode: Int {', '  case quiet, loud', '}', '',
      '@objc(HKMixedHelper)', 'public class HKMixedHelper: NSObject {',
      '  @objc public static func greet(_ mode: HKMixedMode) -> String { HKMixedLoader.greeting() }',
      '  @_spi(Testing) @objc public static func hidden() {}', '}', '',
      '@objc public protocol HKMixedPinging {', '  func hkPing() -> Int', '}', '',
      'extension UIView: HKMixedPinging {', '  public func hkPing() -> Int { 1 }', '}', ''].join('\n'));
    w('mixed/platforms/ios/typings/objc!HKMixed.d.ts', 'declare class HKMixedHelper extends NSObject { static greet(mode: HKMixedMode): string; }\n');
    const typings = w('mixed/typings/objc!HKMixed.d.ts', 'declare const enum HKMixedMode { Quiet = 0, Loud = 1 }\ndeclare class HKMixedHelper extends NSObject { static greet(mode: HKMixedMode): string; }\ninterface HKMixedPinging { hkPing(): number; }\n');
    // Without a module map, the Objective-C module is named apart from the Swift one.
    w('nomap/platforms/ios/src/HKNoMap.h', '#import <Foundation/Foundation.h>\n@interface HKNoMap : NSObject\n@end\n');
    w('nomap/platforms/ios/src/HKNoMap.m', '#import "HKNoMap.h"\n@implementation HKNoMap\n@end\n');
    w('nomap/platforms/ios/src/HKNoMapSwift.swift', 'import Foundation\n@objc public class HKNoMapSwift: NSObject {}\n');
    // As firebase-messaging: an empty umbrella header beside Swift that imports another plugin's Objective-C.
    w('umbrella/platforms/ios/src/module.modulemap', 'module HKUmbrella {\n  umbrella header "HKUmbrella.h"\n  export *\n}\n');
    w('umbrella/platforms/ios/src/HKUmbrella.h', '');
    w('umbrella/platforms/ios/src/HKUmbrellaDelegate.swift', 'import Foundation\nimport HKMixedObjC\n@objc public class HKUmbrellaDelegate: NSObject {\n  @objc public static func greeting() -> String { HKMixedLoader.greeting() }\n}\n');
    // As ui-webview: a module map of the CLI's own framework beside Swift alone.
    w('stale/platforms/ios/src/module.modulemap', 'framework module HKStale {\n  umbrella header "HKStale.h"\n}\n');
    w('stale/platforms/ios/src/HKStale.swift', 'import Foundation\n@objc public class HKStale: NSObject {}\n');

    process.env.NS_NATIVE_TABLE_CACHE = join(dir, 'tables');
    const unread = nativeTable('NSPlugin_hk_mixed');
    if (tableCache === undefined) delete process.env.NS_NATIVE_TABLE_CACHE; else process.env.NS_NATIVE_TABLE_CACHE = tableCache;
    const cachedEmpty = (existsSync(join(dir, 'tables')) ? readdirSync(join(dir, 'tables'), { recursive: true }) as string[] : []).filter((f) => f.endsWith('.json'));
    check(!Object.keys(unread.classes).length && !cachedEmpty.length, `an SDK module the extractor cannot read is not cached as empty${cachedEmpty.length ? `: ${cachedEmpty.join()}` : ''}`);

    const source = (name: string, at: string, typings: string[] = []) => ({ name, version: '1.0.0', dir: join(dir, at), typings, files: new Map() }) as unknown as Parameters<typeof pluginNative>[0][0];
    const out = join(dir, 'project');
    let native: ReturnType<typeof pluginNative> | null = null;
    let failure = '';
    try {
      native = pluginNative([source('@hk/mixed', 'mixed', [typings]), source('@hk/nomap', 'nomap'), source('@hk/umbrella', 'umbrella'), source('@hk/stale', 'stale')], out,
        { deps: { modules: [], searchArgs: () => [], classes: {}, dispose: () => {} }, packages: [], declarations: [typings], bindings: join(dir, 'bindings'), say: () => {} });
    } catch (e) { failure = String(e); }
    check(!!native && native.modules.join() === 'HKMixedObjC,NSPlugin_hk_mixed,NSPlugin_hk_nomap_ObjC,NSPlugin_hk_nomap,NSPlugin_hk_stale,NSPlugin_hk_umbrella'
      && native.package?.products.join() === 'HKMixedObjC,NSPlugin_hk_nomap_ObjC',
      `a plugin's Swift and Objective-C are modules of their own; an empty umbrella header, a module map beside Swift alone and typings are none${failure ? `: ${failure.split('\n').slice(0, 3).join(' ')}` : native ? ` (${native.modules.join()})` : ''}`);
    if (native) {
      const swift = Object.fromEntries(native.swift.map((t) => [t.name, t.products.join()]));
      check(swift.NSPlugin_hk_mixed === 'HKMixedObjC' && swift.NSPlugin_hk_umbrella === 'HKMixedObjC' && swift.NSPlugin_hk_nomap === '', `a plugin's Swift depends on the Objective-C modules it imports, another plugin's too (${JSON.stringify(swift)})`);
      const lines = xcodegenLines(native, out).targets;
      check(/ {2}NSPlugin_hk_umbrella:\n(?: {4}.*\n)*? {4}dependencies:\n {6}- package: NSPlugins\n {8}product: HKMixedObjC\n {8}link: false\n(?: {4,}.*\n)*? {8}SWIFT_INCLUDE_PATHS: "\$\(inherited\) \$\(SRCROOT\)\/Plugins\/Sources\/HKMixedObjC"\n/.test(lines),
        "the Swift module's target depends on the local package's product it imports, and finds its module map");
      const table = nativeTable('NSPlugin_hk_mixed');
      const mode = table.enums.HKMixedMode;
      check(mode?.kind === 'enum' && mode.raw === 'Int' && mode.cases.Loud?.swift === 'loud', `a Swift @objc enum is in its module's table as Objective-C names it (${JSON.stringify(mode)})`);
      check(!!table.classes.HKMixedHelper?.static.greet && !table.classes.HKMixedHelper.static.hidden, "a declaration of a Swift module's SPI is not in its table");
      check(conformsTo('UIKit', 'UIView', 'HKMixedPinging') && lookupMember('UIKit', 'UIView', 'hkPing', false)?.swift === 'hkPing', "a protocol a plugin's extension adopts is one of the extended class's");
      let longName: unknown = 'threw';
      try { longName = lookupMember('UIKit', 'UIView', 'setLongPressHK', false); } catch { /* reported below */ }
      check(longName === null, 'a member a class lacks, its name spelling `Long` as a word, is not found');
      const use = w('src/use.ios.ts', 'export const loud = HKMixedHelper.greet(HKMixedMode.Loud);\n');
      const { checker, program, files } = createProgram([use], new Map(), 'ios', modulesDir, undefined, [typings]);
      const translator = new SwiftTranslator(checker, new Map(), files);
      translator.errors = [];
      const code = translateModules(translator, program, [use]).map((m) => m.code).join('\n');
      check(!translator.errors.length && /HKMixedHelper\.greet\(HKMixedMode\.loud\)/.test(code), `a Swift @objc enum's case is named as Swift names it${translator.errors.length ? `: ${translator.errors[0]}` : ''}`);
    }
  } finally {
    if (tableCache === undefined) delete process.env.NS_NATIVE_TABLE_CACHE; else process.env.NS_NATIVE_TABLE_CACHE = tableCache;
    rmSync(dir, { recursive: true, force: true });
  }
}

// ---- The modules a build of the Swift packages and pods leaves ----
{
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-built-'));
  const w = (f: string, text: string) => { mkdirSync(dirname(join(dir, f)), { recursive: true }); writeFileSync(join(dir, f), text); return join(dir, f); };
  try {
    const products = 'Build/Products/Debug-iphonesimulator';
    const maps = 'Build/Intermediates.noindex/GeneratedModuleMaps-iphonesimulator';
    w(`${maps}/CNested.modulemap`, `module CNested {\n  umbrella header "${join(dir, 'SourcePackages/checkouts/nested/Sources/CNested/include/CNested/CNested.h')}"\n  export *\n}\n`);
    w('SourcePackages/checkouts/nested/Sources/CNested/include/CNested/CNested.h', '');
    w(`${products}/CNested.o`, '');
    const own = w('SourcePackages/checkouts/hud/Sources/CHud/include/module.modulemap', 'module CHud {\n  header "CHud.h"\n  export *\n}\n');
    w(`${products}/CHud.o`, '');
    w('SourcePackages/checkouts/hud/Tests/CHudTests/module.modulemap', 'module CHudTests {}\n');
    w('SourcePackages/checkouts/unused/Sources/CUnused/include/module.modulemap', 'module CUnused {}\n');
    w(`${products}/XCFrameworkIntermediates/vendor/Vendor.framework/Modules/module.modulemap`, 'framework module Vendor {}\n');
    w(`${products}/Swifty.swiftmodule/arm64.swiftmodule`, '');
    const built = builtModules(dir);
    const arg = (a: string) => built.args.includes(a);
    check(built.modules.join() === 'CHud,CNested,Swifty,Vendor', `a build's modules include a C target's with a module map of its own and a framework below the products, and no other package's (${built.modules.join()})`);
    check(arg(`-I${join(dir, 'SourcePackages/checkouts/nested/Sources/CNested/include')}`) && arg(`-fmodule-map-file=${own}`) && arg(join(dir, products, 'XCFrameworkIntermediates/vendor')),
      "a C target's public headers, a package's own module map and a nested framework's directory are visible as Xcode makes them");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ---- Binary-only plugins: refused unless stubbed ----
{
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-stubs-'));
  const w = (f: string, text: string) => { mkdirSync(dirname(join(dir, f)), { recursive: true }); writeFileSync(join(dir, f), text); return join(dir, f); };
  try {
    w('package.json', JSON.stringify({ name: 'stubs', main: 'src/main.ts', dependencies: { 'nativescript-ui-listview': '15.2.3' } }));
    const refused = stubbedPlugins(dir, 'ios');
    check(refused.stubbed.length === 0 && refused.errors.length === 1 && refused.errors[0].startsWith('nativescript-ui-listview is a binary-only plugin') && refused.errors[0].includes("release.pluginReplacements: { 'nativescript-ui-listview'") && refused.errors[0].includes("release.stubPlugins: ['nativescript-ui-listview']"), 'a binary-only plugin stops the build, naming both remedies');
    w('nativescript.config.ts', "export default { id: 'org.stubs', release: { pluginReplacements: { 'nativescript-ui-listview': './src/list.ts' } } };\n");
    const replaced = stubbedPlugins(dir, 'ios');
    check(!replaced.errors.length && !replaced.stubbed.length, 'a binary-only plugin the app replaces builds');
    w('nativescript.config.ts', "export default { id: 'org.stubs', release: { stubPlugins: ['nativescript-ui-listview'] } };\n");
    const stubbed = stubbedPlugins(dir, 'ios');
    check(!stubbed.errors.length && stubbed.stubbed.join() === 'nativescript-ui-listview', 'release.stubPlugins builds a binary-only plugin as its stand-in');
    w('nativescript.config.ts', "export default { id: 'org.stubs', release: { stubPlugins: ['nativescript-ui-listview', 'some-plugin'] } };\n");
    let unknown = '';
    try { stubbedPlugins(dir, 'ios'); } catch (e) { unknown = String(e); }
    check(unknown.includes('some-plugin has no stand-in'), 'release.stubPlugins refuses a package it has no stand-in for');

    STUBBED_PLUGINS.add('nativescript-ui-listview');
    const user = w('src/list-user.ts', "import { RadListView, ListViewEventData } from 'nativescript-ui-listview';\nexport const list = new RadListView();\nexport function onTap(e: ListViewEventData): number { list.refresh(); return e.index; }\n");
    let typed = '';
    try { createProgram([user], new Map(), 'ios', modulesDir); } catch (e) { typed = String(e); }
    check(!typed, `a stubbed plugin's imports type-check against its stand-ins${typed ? `: ${typed.split('\n')[1]}` : ''}`);
    const c = angularComponent(join(dir, 'src/list.component.ts'), "import { Component } from '@angular/core';\n@Component({ selector: 'List', template: `<GridLayout rows=\"*\"><RadListView row=\"0\" [items]=\"items\" (itemTap)=\"tap()\"><ng-template tkListItemTemplate let-item=\"item\"><Label [text]=\"item\"></Label></ng-template></RadListView></GridLayout>` })\nexport class List { items = ['a']; tap() {} }\n", new Map())!;
    const stand = (c.template[0] as { children: { tag: string; attrs: { name: string }[]; events: unknown[]; children: unknown[] }[] }).children[0];
    check(stand.tag === 'ContentView' && stand.attrs.map((a) => a.name).join() === 'row' && !stand.events.length && !stand.children.length, "a stubbed plugin's element is an empty ContentView keeping its place in the layout");
  } finally {
    STUBBED_PLUGINS.clear();
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

// ---- Angular component classes ----
{
  const make = (text: string) => angularComponent('/app/cls.component.ts', text, new Map())!;
  const noArg = make("import { Component, Input, OnChanges } from '@angular/core';\n@Component({ selector: 'C', template: `<Label [text]=\"name\"></Label>` })\nexport class C implements OnChanges { @Input() name = ''; seen = 0; ngOnChanges() { this.seen++; } }\n");
  check(/this\.ngOnChanges\(\);/.test(noArg.source) && !/this\.ngOnChanges\(changes\)/.test(noArg.source), 'ngOnChanges declared without a parameter is called without one');
  const ctor = make("import { Component } from '@angular/core';\nclass Clock { now() { return 1; } }\n@Component({ selector: 'C', template: `<Label [text]=\"t\"></Label>` })\nexport class C { t = 0; constructor(private clock: Clock) { this.t = clock.now(); } }\n");
  check(/const clock = this\.clock;/.test(ctor.source), "a constructor's body naming a parameter property reads the field it became");
  const inherited = make("import { Component } from '@angular/core';\nclass Base { title = 'base'; }\n@Component({ selector: 'C', template: `<Label [text]=\"title\"></Label>` })\nexport class C extends Base {}\n");
  check(/this\.title/.test(inherited.source), "a template names a member the component inherits");
  const multiline = make("import { Component } from '@angular/core';\n@Component({ selector: 'C', template: `<Label [text]=\"on ? 'a' : 'b\nc'\"></Label>` })\nexport class C { on = true; }\n");
  check(multiline.source.includes("'b\\nc'"), 'a string literal written across lines in a template stays one string');
}

// ---- Angular fragments through nested components ----
{
  const outer = angularComponent('/app/outer.component.ts', "import { Component } from '@angular/core';\n@Component({ selector: 'Outer', template: `<Inner></Inner>` })\nexport class Outer {}\n", new Map([['Inner', 'Inner']]))!;
  const infos = new Map([['Inner', { name: 'Inner', props: [], fragment: true }], ['Outer', { name: 'Outer', props: [] }]]);
  check(isFragment(outer.template, infos) && !isFragment(outer.template, new Map([['Inner', { name: 'Inner', props: [] }]])), 'a template that is one component is a fragment when that component is');
  const swift = render(outer, infos, () => false, 'angular').join('\n');
  check(swift.includes('func render(into region: Region) throws'), 'a component rendering a fragment component renders into its parent region');
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

// ---- Framework kit auto-detection & layering + Angular C2/E5/F6/F7/F12 ----
{
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-ng-kit-'));
  try {
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { '@angular/core': '~19.0.0' } }));
    mkdirSync(join(dir, 'nested-xml', 'app'), { recursive: true });
    writeFileSync(join(dir, 'nested-xml', 'package.json'), JSON.stringify({ dependencies: { '@nativescript/core': '~9.1.0' } }));
    writeFileSync(join(dir, 'nested-xml', 'app', 'main-page.xml'), '<Page></Page>');
    check(detectFramework(dir) === 'angular' && detectFramework(join(dir, 'nested-xml')) === 'core', 'detectFramework auto-detects angular from package.json dependencies without leaking ancestor packages');
    check(getFrameworkKitInfo('angular').kitName === 'NativeScriptAngularKit', 'getFrameworkKitInfo maps angular to NativeScriptAngularKit layered on NativeScriptKit');
    check(excludedFrameworkKitFiles('vue', 'apple').has('AngularAPI.swift') && !excludedFrameworkKitFiles('angular', 'apple').has('AngularAPI.swift'), 'excludedFrameworkKitFiles excludes non-active framework kit sources');

    const compFile = join(dir, 'kiddo-card.component.ts');
    writeFileSync(compFile, `
import { Component, Injectable, Input, Optional, SkipSelf, input, model } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CardService {
  prefix = 'card:';
}

@Injectable({ providedIn: 'root' })
export class CoreSingletonModule {
  constructor(@Optional() @SkipSelf() parentModule?: CoreSingletonModule) {
    if (parentModule) throw new Error('already loaded');
  }
}

@Component({
  selector: 'KiddoCard',
  template: '<Label [text]="displayTitle"></Label>',
})
export class KiddoCardComponent {
  subtitle = input<string>();
  active = model<boolean>();
  private _title = '';
  private _badge = '';

  constructor(private cardService: CardService) {}

  @Input()
  get title(): string {
    return this._title;
  }
  set title(v: string) {
    this._title = v.trim();
  }

  @Input()
  set badge(v: string) {
    this._badge = '[' + v + ']';
  }

  get displayTitle(): string {
    return this.cardService.prefix + this._title + this._badge + (this.subtitle() ?? '');
  }
}
`);
    const ir = angularComponent(compFile, readFileSync(compFile, 'utf8'), new Map())!;
    check(ir.props.includes('subtitle') && ir.props.includes('active') && ir.props.includes('title') && ir.props.includes('badge'), 'angularComponent extracts 0-arg input<T>()/model<T>() and getter/setter @Input props');

    const overrides = new Map([[compFile, ir.source]]);
    const { checker: swChecker, program: swProg, files: swFiles } = createProgram([compFile], overrides, 'ios', modulesDir);
    const sw = new SwiftTranslator(swChecker, new Map([['KiddoCardComponent', { props: ir.props, optional: ir.optional }]]), swFiles);
    sw.plainFields = true;
    const swMod = translateModules(sw, swProg, [compFile]).map((m) => m.code).join('\n');
    const swCls = swProg.getSourceFile(compFile)!.statements.filter(ts.isClassDeclaration).find((c) => c.name?.text === 'KiddoCardComponent')!;
    const swCode = sw.componentMembers(swCls, ir.props).join('\n') + '\n' + swMod;
    check(/let subtitle: Signal<String\?>/.test(swCode) && /let active: Signal<Bool\?>/.test(swCode) && /init\(subtitle: String\? = nil, active: Bool\? = nil\)/.test(swCode), '0-arg input<T>() and model<T>() emit optional Signal initialized to nil (Swift)');
    check(/let cardService: CardService/.test(swCode) && /self\.cardService = CardService\.shared/.test(swCode), '@Component constructor parameter property is DI-resolved to shared instance (Swift)');
    check(/var title: String \{/.test(swCode) && /func _set_title\(/.test(swCode) && /func _set_badge\(/.test(swCode), 'getter+setter and setter-only @Input accessors rewrite cleanly to getter + _set_ methods (Swift)');
    check(/init\(_ parentModule: CoreSingletonModule\? = nil\)/.test(swCode), '@Optional() @SkipSelf() singleton guard parameter defaults to nil (Swift)');

    const { checker: ktChecker, program: ktProg, files: ktFiles } = createProgram([compFile], overrides, 'android', modulesDir);
    const kt = new Translator(ktChecker, new Map([['KiddoCardComponent', { props: ir.props, optional: ir.optional }]]), ktFiles);
    kt.appModule = 'org.example.app';
    kt.plainFields = true;
    const ktMod = translateKotlinModules(kt, ktProg, [compFile]).map((m) => m.code).join('\n');
    const ktCls = ktProg.getSourceFile(compFile)!.statements.filter(ts.isClassDeclaration).find((c) => c.name?.text === 'KiddoCardComponent')!;
    const ktMembers = kt.componentMembers(ktCls, ir.props);
    const ktCode = [...ktMembers.params, ...ktMembers.lines, ktMod].join('\n');
    check(/subtitle: String\? = null/.test(ktCode) && /active: Boolean\? = null/.test(ktCode) && /val subtitle: Signal<String\?> = Signal<String\?>\(subtitle\)/.test(ktCode) && /val active: Signal<Boolean\?> = Signal<Boolean\?>\(active\)/.test(ktCode), '0-arg input<T>() and model<T>() emit nullable Signal initialized to null (Kotlin)');
    check(/val cardService: CardService = CardService\.shared/.test(ktCode), '@Component constructor parameter property is DI-resolved to shared instance (Kotlin)');
    check(/val title: String\s+get\(\)/.test(ktCode) && /fun _set_title\(/.test(ktCode) && /fun _set_badge\(/.test(ktCode), 'getter+setter and setter-only @Input accessors rewrite cleanly to getter + _set_ methods (Kotlin)');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ---- HttpClient: a `responseType: 'text'` response is a string ----
{
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-http-'));
  try {
    const file = join(dir, 'docs.service.ts');
    writeFileSync(file, `
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export async function readDoc(http: HttpClient, url: string): Promise<string> {
  const text = await firstValueFrom(http.get(url, { responseType: 'text' }));
  return text.trim();
}
`);
    // An app's iOS build compiles @angular/common/http from runtime/angular-rx.ts, as it does with plugins.
    symlinkSync(modulesDir, join(dir, 'node_modules'), 'dir');
    const sw = createProgram([file], new Map(), 'ios', modulesDir, new PluginSources({ app: dir, platform: 'ios' }));
    const swCode = translateModules(new SwiftTranslator(sw.checker, new Map(), sw.files, { pluginFiles: sw.pluginFiles }), sw.program, [file]).map((m) => m.code).join('\n');
    check(/let text: String = /.test(swCode), "HttpClient.get with responseType 'text' reads its body as a String (Swift)");
    const kt = createProgram([file], new Map(), 'android', modulesDir);
    const ktTranslator = new Translator(kt.checker, new Map(), kt.files);
    ktTranslator.appModule = 'org.example.app';
    const ktCode = translateKotlinModules(ktTranslator, kt.program, [file]).map((m) => m.code).join('\n');
    check(/\.get\(url, [^\n]*\)\.mapValues \{ __v: Any\? -> jsAssertedString\(__v\) \}/.test(ktCode), "HttpClient.get with responseType 'text' reads its body as a String (Kotlin)");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

console.log(failed ? `${failed} release checks failed` : 'release checks pass');
process.exit(failed ? 1 : 0);
