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
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProgram } from '../../src/program.ts';
import { preflight } from '../../src/preflight.ts';
import { satisfies } from '../../src/contract.ts';
import { mapKotlinDiagnostics } from '../../src/kotlin-diagnostics.ts';
import { angularComponent, angularDirectives, angularRouteTree, angularRoutes, componentOf, declarableSource, declarablesIn, hostedComponent, routedComponents, type AngularComponent } from '../../src/angular.ts';
import { angularLibraries, registeredElements } from '../../src/angular-libraries.ts';
import { pathAliases } from '../../src/app-paths.ts';
import { appImports, reachedFrom, tsconfigIncluded } from '../../src/app-modules.ts';
import { runtimeFile } from '../../src/plugins/resolve.ts';
import { PluginSources, verify, verifyBundle } from '../../src/plugins/source.ts';
import { manifest, ownTypings, pluginNative, scopedImports, usedImports, xcodegenLines } from '../../src/plugins/native.ts';
import { singleTry, Translator as SwiftTranslator } from '../../src/swift.ts';
import { translateModules } from '../../src/modules.ts';
import { conformsTo, lookupMember, nativeTable, setEmptyTable } from '../../src/natives/symbols.ts';
import { isFragment, render } from '../../src/codegen.ts';
import { render as renderKotlin } from '../../src/codegen-kotlin.ts';
import { Translator } from '../../src/kotlin.ts';
import { CoreKotlin } from '../../src/core-kotlin.ts';
import { translateKotlinModules } from '../../src/kotlin-modules.ts';
import { AndroidNativeAPI, androidClassPath } from '../../src/native-calls-android.ts';
import { stubbedPlugins } from '../../src/app-resources.ts';
import { builtModules, iosDependencies, packageLines, productLines, type SwiftPackage } from '../../src/ios-dependencies.ts';
import { STUBBED_PLUGINS } from '../../src/core.ts';
import { detectFramework, excludedFrameworkKitFiles, getFrameworkKitInfo } from '../../src/framework.ts';
import { execFileSync, spawnSync } from 'node:child_process';
import { kitProjectDir } from '../../src/android.ts';
import { KIT_ANDROID } from '../../src/paths.ts';
import { buildKotlinRuntime, kotlinc, kotlinStdlib } from '../native-build.ts';
import ts from 'typescript';

const here = dirname(fileURLToPath(import.meta.url));
const modulesDir = process.env.NS_DIFF_MODULES ?? resolve(here, '../node_modules');
let failed = 0;
const check = (ok: boolean, what: string) => {
  console.log(`${ok ? '✓' : '✗'} ${what}`);
  if (!ok) failed++;
};

// Each section runs in a function of its own, never a bare block: this module's frame lives for the whole run and keeps
// every top-level block's locals (each a program of several hundred MB) reachable until it ends.

// ---- preflight ----
const cases = readdirSync(join(here, 'cases')).filter((f) => f.endsWith('.ts')).map((f) => join(here, 'cases', f));
for (const platform of ['ios', 'android'] as const) (() => {
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
})();

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
(() => {
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
})();

// ---- An app's own module graph ----
(() => {
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
})();

// ---- Plugins published as ES modules, and the generated project ----
(() => {
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
    w('node_modules/@hk/decl/index.android.js', '');
    w('decl/package.json', JSON.stringify({ name: '@hk/decl' }));
    w('decl/common.ts', "import { View } from '@nativescript/core';\nimport { Holder } from '.';\nexport interface Options { n: number }\nexport function twice(n: number) { return 2 * n; }\nexport const kind = 'decl';\nexport function attach(view: View & Holder) { view.attachHolder(1); }\nexport class Indicator { holder: View & Holder; hold(view: View) { if (view?.['attachHolder']) { this.holder = view as View & Holder; this.holder.attachHolder(2); } } }\n");
    w('decl/shapes.ts', 'export class Square { side = 1; }\n');
    w('decl/index.ios.ts', "import { Options, twice } from './common';\nfunction scale(o: Options) { return twice(o.n); }\nexport class Decl { run(o: Options): number { return scale(o); } }\nexport { attach } from './common';\n");
    w('decl/index.android.ts', "import { Options, twice } from './common';\nfunction scale(o: Options) { return twice(o.n); }\nexport class Decl { run(o: Options): number { return scale(o); } }\nexport { attach } from './common';\n");
    w('decl/index.d.ts', "import { Options } from './common';\nexport { Options };\nexport * from './shapes';\nexport { kind } from './common';\nexport interface Result { ok: boolean }\nexport interface Holder { attachHolder(n: number): void }\nexport declare function scale(o: Options): number;\nexport declare function missing(): void;\nexport declare class Decl { run(o: Options): number; }\n");
    const declUser = w('src/decl-user.ts', "import { Decl, Options, Result, Square, kind, scale, attach } from '@hk/decl';\nconst o: Options = { n: 2 };\nexport const attachTo = attach;\nexport const r: Result = { ok: new Decl().run(o) === scale(o) && new Square().side === 1 && kind === 'decl' };\n");
    let declared = '';
    try {
      const { program, checker, files } = createProgram([declUser], new Map(), 'ios', modules, new PluginSources({ app: dir, platform: 'ios', overrides: { '@hk/decl': join(dir, 'decl') } }));
      const entry = files.find((f) => f.fileName.endsWith('decl/index.ios.ts'))!;
      const names = checker.getExportsOfModule(checker.getSymbolAtLocation(entry)!).map((s) => s.name).sort().join();
      if (names !== 'Decl,Holder,Options,Result,Square,attach,kind,scale') declared = `exports ${names}`;
      const translator = new SwiftTranslator(checker, new Map(), files);
      translator.errors = [];
      translateModules(translator, program, files.map((f) => f.fileName));
      if (translator.errors.length) declared = translator.errors.join('; ');
      const android = createProgram([declUser], new Map(), 'android', modules, new PluginSources({ app: dir, platform: 'android', overrides: { '@hk/decl': join(dir, 'decl') } }));
      const kotlin = new Translator(android.checker, new Map(), android.files);
      kotlin.core = new CoreKotlin(kotlin, true);
      kotlin.errors = [];
      translateKotlinModules(kotlin, android.program, android.files.map((f) => f.fileName));
      if (kotlin.errors.length) declared = kotlin.errors.join('; ');
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
})();

// ---- Plugins' iOS code: Swift beside Objective-C, and the tables of their modules ----
(() => {
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
        { deps: { modules: [], searchArgs: () => [], classes: {}, clangModules: [], dispose: () => {} }, packages: [], declarations: [typings], bindings: join(dir, 'bindings'), say: () => {} });
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
})();

// ---- A plugin's Swift built on its own Swift package's Clang module ----
(() => {
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-spm-'));
  const w = (f: string, text: string) => { mkdirSync(dirname(join(dir, f)), { recursive: true }); writeFileSync(join(dir, f), text); return join(dir, f); };
  const tableCache = process.env.NS_NATIVE_TABLE_CACHE;
  process.env.NS_NATIVE_TABLE_CACHE = join(dir, 'tables');
  let deps: ReturnType<typeof iosDependencies> | null = null;
  try {
    // As image-cache-it over SDWebImage: everything the plugin declares is under `#if canImport` of its package's Objective-C module.
    w('package.json', JSON.stringify({ name: 'spm-app', version: '1.0.0' }));
    w('cached/pkg/Package.swift', '// swift-tools-version:5.7\nimport PackageDescription\nlet package = Package(name: "HKCPkg", platforms: [.iOS(.v13)], products: [.library(name: "HKCPkg", targets: ["HKCPkg"])], targets: [.target(name: "HKCPkg", path: "Sources/HKCPkg")])\n');
    w('cached/pkg/Sources/HKCPkg/include/HKCLoader.h', '#import <Foundation/Foundation.h>\n@interface HKCLoader : NSObject\n+ (NSInteger)answer;\n@end\n');
    w('cached/pkg/Sources/HKCPkg/HKCLoader.m', '#import "HKCLoader.h"\n@implementation HKCLoader\n+ (NSInteger)answer { return 42; }\n@end\n');
    w('cached/platforms/ios/src/HKCachedView.swift', ['import UIKit', '#if canImport(HKCPkg)', 'import HKCPkg', '',
      '@objc(HKCachedStretch)', 'public enum HKCachedStretch: Int {', '  case none, aspectFill', '}', '',
      '@objcMembers', '@objc(HKCachedView)', 'public class HKCachedView: UIView {', '  public var stretch: HKCachedStretch = .none',
      '  public static func answer() -> Int { HKCLoader.answer() }', '}', '#endif', ''].join('\n'));
    const packages: SwiftPackage[] = [{ name: 'HKCPkg', libs: ['HKCPkg'], targets: [], path: join(dir, 'cached/pkg'), plugin: '@hk/cached', pluginDir: join(dir, 'cached') }];
    deps = iosDependencies({ app: dir, packages, deploymentTarget: '17.0', say: () => {} });
    const source = { name: '@hk/cached', version: '1.0.0', dir: join(dir, 'cached'), typings: [], files: new Map() } as unknown as Parameters<typeof pluginNative>[0][0];
    // The app's project as cli.ts writes it, its Swift naming what the plugin declares as translated code does.
    const build = (owner: string | null) => {
      const out = join(dir, `project-${owner ? 'plugin' : 'app'}`);
      const declared = packages.map((p) => ({ ...p, plugin: owner }));
      const native = pluginNative([source], out, { deps: deps!, packages: declared, declarations: [], bindings: join(dir, 'bindings'), say: () => {} });
      const lines = xcodegenLines(native, out);
      w(`${out.slice(dir.length + 1)}/App/main.swift`, 'import UIKit\nimport NSPlugin_hk_cached\nlet view = HKCachedView()\nview.stretch = HKCachedStretch.aspectFill\nprint(HKCachedView.answer())\n');
      writeFileSync(join(out, 'project.yml'), `name: SPMCheck\noptions:\n  deploymentTarget:\n    iOS: "17.0"\npackages:\n${lines.packages}${packageLines(declared, out)}targets:\n${lines.targets}  SPMCheck:\n    type: application\n    platform: iOS\n    sources: [App]\n    dependencies:\n${lines.dependencies}${productLines(declared)}    settings:\n      base:\n        GENERATE_INFOPLIST_FILE: YES\n        CODE_SIGNING_ALLOWED: NO\n        PRODUCT_BUNDLE_IDENTIFIER: org.nativescript.spmcheck\n`);
      execFileSync('xcodegen', ['generate', '--quiet'], { cwd: out, stdio: 'ignore' });
      const r = spawnSync('xcodebuild', ['-project', 'SPMCheck.xcodeproj', '-scheme', 'SPMCheck', '-configuration', 'Release', '-destination', 'generic/platform=iOS Simulator',
        '-derivedDataPath', join(out, 'dd'), '-quiet', 'build'], { cwd: out, encoding: 'utf8', maxBuffer: 1 << 28 });
      const app = join(out, 'dd/Build/Products/Release-iphonesimulator/SPMCheck.app/SPMCheck');
      const classes = existsSync(app) ? spawnSync('nm', ['-gUj', app], { encoding: 'utf8' }).stdout : '';
      rmSync(join(out, 'dd'), { recursive: true, force: true });
      return { status: r.status, output: `${r.stdout}${r.stderr}`, classes };
    };
    const built = build('@hk/cached');
    const table = nativeTable('NSPlugin_hk_cached');
    check(!!table.classes.HKCachedView?.static.answer && table.enums.HKCachedStretch?.cases.AspectFill?.swift === 'aspectFill', "a plugin's Swift under `canImport` of its Swift package's Objective-C module is in its table");
    check(built.status === 0 && built.classes.includes('_OBJC_CLASS_$_HKCachedView') && built.classes.includes('_OBJC_CLASS_$_HKCLoader'), `a plugin's Swift on its package's Objective-C module builds what its table describes, the package linked once${built.status ? `: ${built.output.split('\n').find((l) => /error:/.test(l)) ?? ''}` : ''}`);
    // The app declaring the package too, it is the app's: the plugin's Swift stays a static library, which cannot see the module.
    const blind = build(null);
    check(blind.status !== 0 && blind.output.includes('@hk/cached: its Swift tests canImport(HKCPkg), which the build translated against, and its target cannot import HKCPkg'), "a plugin target that cannot see a module its table was extracted with fails to build, naming the module");
  } catch (e) {
    check(false, `a plugin's Swift built on its own Swift package's Clang module: ${String(e).split('\n').slice(0, 3).join(' ')}`);
  } finally {
    deps?.dispose();
    if (tableCache === undefined) delete process.env.NS_NATIVE_TABLE_CACHE; else process.env.NS_NATIVE_TABLE_CACHE = tableCache;
    rmSync(dir, { recursive: true, force: true });
  }
})();

// ---- The modules a build of the Swift packages and pods leaves ----
(() => {
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
    check(built.clangModules.join() === 'CHud,CNested', `a build's Clang modules are known, with maps of their own or generated (${built.clangModules.join()})`);
    check(built.modules.join() === 'CHud,CNested,Swifty,Vendor', `a build's modules include a C target's with a module map of its own and a framework below the products, and no other package's (${built.modules.join()})`);
    check(arg(`-I${join(dir, 'SourcePackages/checkouts/nested/Sources/CNested/include')}`) && arg(`-fmodule-map-file=${own}`) && arg(join(dir, products, 'XCFrameworkIntermediates/vendor')),
      "a C target's public headers, a package's own module map and a nested framework's directory are visible as Xcode makes them");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
})();

// ---- Binary-only plugins: refused unless stubbed ----
(() => {
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
})();

// ---- Swift emission ----
(() => {
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
    const holes = join(dir, 'holes.ts');
    writeFileSync(holes, "class Card { name = 'c'; }\nconst c = new Card();\n// @ts-ignore\nexport const cards: Card[] = [c, undefined, null];\n");
    const loose = createProgram([holes], new Map(), 'ios', modulesDir);
    const looseApp = new SwiftTranslator(loose.checker, new Map(), loose.files, { lenientApp: true });
    looseApp.errors = [];
    translateModules(looseApp, loose.program, [holes]);
    check(looseApp.errors.length === 1 && looseApp.errors[0].includes('null or undefined in an array of Card, whose type leaves both out'), "a non-strict app's null or undefined in an array of objects is reported, as Swift's array of them holds neither");
    const named = join(dir, 'named.ios.ts');
    writeFileSync(named, "export class ProcessInfo {\n  name = 'mine';\n}\nexport const processName = NSProcessInfo.processInfo.processName;\nexport const own = new ProcessInfo().name;\n");
    const clash = createProgram([named], new Map(), 'ios', modulesDir);
    const clashes = new SwiftTranslator(clash.checker, new Map(), clash.files);
    const clashCode = translateModules(clashes, clash.program, [named]).map((m) => m.code).join('\n');
    check(/= Foundation\.ProcessInfo\.processInfo\.processName/.test(clashCode) && /= ProcessInfo\(\)\.name/.test(clashCode), "a native class named as one of the program's is named by its module (Foundation.ProcessInfo)");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
})();

// ---- Angular component classes ----
(() => {
  const make = (text: string) => angularComponent('/app/cls.component.ts', text, new Map())!;
  const noArg = make("import { Component, Input, OnChanges } from '@angular/core';\n@Component({ selector: 'C', template: `<Label [text]=\"name\"></Label>` })\nexport class C implements OnChanges { @Input() name = ''; seen = 0; ngOnChanges() { this.seen++; } }\n");
  check(/this\.ngOnChanges\(\);/.test(noArg.source) && !/this\.ngOnChanges\(changes\)/.test(noArg.source), 'ngOnChanges declared without a parameter is called without one');
  const ctor = make("import { Component } from '@angular/core';\nclass Clock { now() { return 1; } }\n@Component({ selector: 'C', template: `<Label [text]=\"t\"></Label>` })\nexport class C { t = 0; constructor(private clock: Clock) { this.t = clock.now(); } }\n");
  check(/const clock = this\.clock;/.test(ctor.source), "a constructor's body naming a parameter property reads the field it became");
  const inherited = make("import { Component } from '@angular/core';\nclass Base { title = 'base'; }\n@Component({ selector: 'C', template: `<Label [text]=\"title\"></Label>` })\nexport class C extends Base {}\n");
  check(/this\.title/.test(inherited.source), "a template names a member the component inherits");
  const multiline = make("import { Component } from '@angular/core';\n@Component({ selector: 'C', template: `<Label [text]=\"on ? 'a' : 'b\nc'\"></Label>` })\nexport class C { on = true; }\n");
  check(multiline.source.includes("'b\\nc'"), 'a string literal written across lines in a template stays one string');
})();

// ---- NgClass and NgStyle ----
await (async () => {
  type Node = { kind: string; tag?: string; attrs?: { name: string; value?: string; method?: string }[]; children?: Node[]; directives?: { make: string; inputs: { set: string; method?: string }[]; attributes: { name: string; value: string }[] }[] };
  const make = (template: string, selectors = new Map<string, string>()) => angularComponent('/app/c.component.ts', `import { Component, signal } from '@angular/core';
@Component({ selector: 'C', template: \`${template}\` })
export class C { on = signal(true); w = signal(10); name = 'Ada'; }
`, selectors, { runtimeModule: '/app/__angular.release.ts' })!;
  const all = (nodes: Node[]): Node[] => nodes.flatMap((n) => [n, ...all(n.children ?? [])]);
  const label = (c: AngularComponent) => all(c.template as Node[]).find((n) => n.tag === 'Label')!;
  const method = (c: AngularComponent, name: string) => c.source.split('\n').find((l) => l.trimStart().startsWith(`${name}(`)) ?? '';

  const classed = make(`<Label class="base x" [class.on]="on()" [ngClass]="{ big: on(), 'a b': true }"></Label>`);
  const ngClassUse = label(classed).directives?.[0];
  check(!!ngClassUse && method(classed, ngClassUse.make).includes('new $Ng_NgClass()') && method(classed, ngClassUse.inputs[0].set).includes('.apply($v)')
    && method(classed, ngClassUse.inputs[0].method!).includes(`["base x", { big: this.on(), 'a b': true }, ["on", (this.on())]]`), "[ngClass] is the runtime's NgClass on the element, given the static class, NgClass's value and the [class.x] bindings");
  check(!label(classed).attrs!.some((a) => a.name === 'class' || a.name === 'ngClass'), 'beside [ngClass], the static class and [class.x] are NgClass\'s, not bound as the view\'s className');
  check(!!classed.usesRuntime && classed.source.includes("NgClass as $Ng_NgClass } from './__angular.release'"), "NgClass comes from the build's Angular runtime module");
  const fixedClass = make(`<Label ngClass="p q"></Label>`);
  const fixedUse = label(fixedClass).directives?.[0];
  check(!!fixedUse && method(fixedClass, fixedUse.inputs[0].method!).includes('["", "p q", []]') && !label(fixedClass).attrs!.some((a) => a.name === 'ngClass'), 'a static ngClass attribute names its classes through NgClass');
  const piped = make(`<Label [ngClass]="name | lowercase"></Label>`);
  check(/\["", \$c\d+\.pure1\(\(this\.name\), \(\$x0\) => \$p\d+\.transform\(\$x0\)\), \[\]\]/.test(piped.source), "a pipe in [ngClass] is one per view, as in any binding");
  const onComponent = make(`<Badge class="b" [ngClass]="{ on: on() }"></Badge>`, new Map([['Badge', 'Badge']]));
  const badge = all(onComponent.template as Node[]).find((n) => n.kind === 'component') as Node & { props?: { name: string; method?: string }[] };
  check(!!badge.props?.some((p) => p.name === 'class' && p.method && method(onComponent, p.method).includes('$Ng_ngClassNames("b", { on: this.on() }, [])')), "[ngClass] on a component is its class, which falls through to its root view as [class.x] does");

  const styled = make(`<Label style="color: red" [ngStyle]="{ 'width.px': w(), 'background-color': on() ? 'red' : null }"></Label>`);
  const use = label(styled).directives?.find((d) => d.make && method(styled, d.make).includes('NgStyle'));
  check(!!use && method(styled, use.make).includes('new $Ng_NgStyle($unsetValue)') && styled.source.includes("import { unsetValue as $unsetValue } from '@nativescript/core';") && method(styled, use.inputs[0].set).includes('.apply($v)')
    && method(styled, use.inputs[0].method!).includes(`[{ 'width.px': this.w(), 'background-color': this.on() ? 'red' : null }] as any[]`), "[ngStyle] is the runtime's NgStyle on the element, given its value");
  check(!!use && use.attributes.some((a) => a.name === 'style' && a.value === 'color: red') && !label(styled).attrs!.some((a) => a.name === 'style' || a.name === 'ngStyle'), 'a static style beside [ngStyle] is set by it, before its first styles');
  const bound = make(`<Label style="color: red" [style.background-color]="on() ? 'red' : null" [style.width.px]="w()" [style.--gap]="w()"></Label>`);
  const boundUse = label(bound).directives?.find((d) => d.make && method(bound, d.make).includes('NgStyle'));
  check(!!boundUse && method(bound, boundUse.inputs[0].method!).includes(`[{ "background-color": (this.on() ? 'red' : null), "width.px": (this.w()), "--gap": (this.w()) }] as any[]`)
    && boundUse.attributes.some((a) => a.name === 'style') && !label(bound).attrs!.some((a) => a.name !== 'style' && /background|width|gap/.test(a.name)), "[style.x] bindings are one NgStyle object on the element (dashed names, units, CSS variables; null removes)");
  const toggled = make(`<Label class="a x b" [class.x]="on()" [class.y]="on()"></Label>`);
  const toggledClass = label(toggled).attrs!.find((a) => a.name === 'class');
  check(!!toggledClass?.method && method(toggled, toggledClass.method).includes('$Ng_ngClassNames("a x b", null, ["x", (this.on()), "y", (this.on())])'), '[class.x] without NgClass decides a static class x it names, through ngClassNames');
  const swift = render(styled, new Map(), () => false, 'angular').join('\n');
  const kotlin = renderKotlin(styled, new Map(), { framework: 'angular' }).join('\n');
  check(/ElementRef\.hosting\(v\d+\) \{ self\._b\d+\(\) \}[\s\S]*kitSet\("style", "color: red"\)[\s\S]*Check\(\{ self\._b\d+\(\) \}\)/.test(swift) && /ElementRef\.hosting\(v\d+\) \{ this\._b\d+\(\) \}[\s\S]*kitSet\("style", "color: red"\)[\s\S]*Check\(\{ this\._b\d+\(\) \}\)/.test(kotlin), "NgStyle is made with the element as its ElementRef, the static style set before its styles (Swift, Kotlin)");

  // Diff cases 740 and 741 translate the runtime's NgClass and NgStyle code (strict and non-strict): their copies must stay the runtime's.
  const pieces = (file: string) => {
    const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    const out = new Map<string, string>();
    for (const st of sf.statements) {
      if (ts.isFunctionDeclaration(st) && st.name && st.body) out.set(st.name.text, st.body.getText());
      if (ts.isClassDeclaration(st) && st.name && ['NgClass', 'NgStyle'].includes(st.name.text)) for (const m of st.members) if (ts.isMethodDeclaration(m) && m.body) out.set(`${st.name.text}.${(m.name as ts.Identifier).text}`, m.body.getText());
    }
    return out;
  };
  const runtimePieces = pieces(join(here, '../../runtime/angular.ts'));
  for (const c of ['740-ngclass-ngstyle.ts', '741-ngclass-ngstyle-lenient.ts']) {
    const casePieces = pieces(join(here, '../diff/cases', c));
    check(['ngClassNames', 'ngStyleEntries', 'viewClasses', 'NgClass.apply', 'NgClass.update', 'NgClass.toggle', 'NgStyle.apply', 'NgStyle.set'].every((k) => !!runtimePieces.get(k) && runtimePieces.get(k) === casePieces.get(k)), `diff case ${c}'s NgClass and NgStyle code is the runtime's`);
  }

  // The runtime's NgClass and NgStyle, run in Node with a stand-in for the ElementRef they inject.
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-ngclass-'));
  try {
    const unset = 'UNSET';
    writeFileSync(join(dir, 'ng.ts'), `let host: any = null;\nexport const $host = (v: any) => { host = v; };\nexport class ElementRef { nativeElement: any = host; }\nexport class ChangeDetectorRef { markForCheck(): void {} }\nexport function inject(_: any): any { return new ElementRef(); }\n`);
    writeFileSync(join(dir, 'angular.ts'), readFileSync(join(here, '../../runtime/angular.ts'), 'utf8').replace("from '@angular/core'", "from './ng.ts'"));
    const rt = await import(join(dir, 'angular.ts'));
    const ng = await import(join(dir, 'ng.ts'));
    const record = (sets: string[]) => new Proxy({ className: '' } as Record<string, unknown>, { set: (t, k, v) => { if (k === 'className') sets.push(String(v)); t[k as string] = v; return true; } });
    const classSets: string[] = [];
    const classView = record(classSets);
    ng.$host(classView);
    const ngClass = new rt.NgClass();
    const classes = (base: string, value: unknown, toggles: unknown[]) => { classSets.length = 0; ngClass.apply([base, value, toggles]); return classView.className; };
    check(classes('card x', { a: true, 'b c': 1, d: 0 }, ['on', true]) === 'card x a b c on', 'NgClass adds the classes its value names beside the static ones and [class.x]');
    check(classes('card x', { 'b c': 1, e: true }, ['on', true]) === 'card x b c on e' && JSON.stringify(classSets) === '["card x b c on","card x b c on e"]', 'a class NgClass no longer names is removed and a new one added, one className change each: the static classes and [class.x] stay');
    check(classes('card x', { x: false, 'b c': 1, e: true }, ['on', true]) === 'card b c on e' && classes('card x', { 'b c': 1, e: true }, ['on', true]) === 'card b c on e x', 'NgClass naming a static class false removes it, and no longer naming it brings it back, as NgClass does');
    check(classes('card x', ['e'], ['on', false]) === 'card e x' && classes('card x', 'e  f ', ['on', undefined]) === 'card e x f' && classes('card x', new Set(['f']), ['on', 'yes']) === 'card x f on', 'NgClass takes a string, an array or a Set; [class.x] changes its class when its value does');
    check(classes('card x', null, ['on', true]) === 'card x on' && classSets.length === 1, 'NgClass of null removes what it added and nothing else');
    let thrownClass = '';
    try { classes('card', [1], []); } catch (e) { thrownClass = String(e); }
    check(thrownClass.includes('NgClass can only toggle CSS classes expressed as strings, got 1'), "NgClass of an array holding a non-string throws, as Angular's does");
    const names = rt.ngClassNames as (base: string, value: unknown, toggles: unknown[]) => string;
    check(names('', 'a  b ', []) === 'a b' && names('', ['a', 'b c'], []) === 'a b c' && names('', new Set(['a', 'b']), []) === 'a b' && names('', { a: true, 'b c': 1, d: 0, e: null }, []) === 'a b c', 'on a component, NgClass takes a string, an array, a Set, or an object of conditions whose keys may name several classes');
    check(names('base', null, []) === 'base' && names('base', undefined, []) === 'base' && names('base', 3, []) === 'base', 'on a component, NgClass of null, undefined or a number adds nothing to the static classes');
    const before = names('card x', { a: true, b: true }, ['on', true]), after = names('card x', { b: true }, ['on', true]);
    check(before === 'card x a b on' && after === 'card x b on', 'on a component, a class NgClass no longer names is removed, and only that one');
    check(names('card x', { x: false }, []) === 'card' && names('card x', {}, []) === 'card x', 'on a component, NgClass naming a static class false removes it, and no longer naming it brings it back');
    check(names('a x b', null, ['x', false, 'y', true]) === 'a b y' && names('a x', null, ['x', true]) === 'a x', 'without NgClass, a false [class.x] removes a static class x');
    check(names('card', { on: true }, ['on', false]) === 'card' && names('card', { on: false }, ['on', true]) === 'card on' && names('card on', null, ['on', undefined]) === 'card on', "on a component, [class.x] decides its class after NgClass, and an undefined one decides nothing");

    const sets: [string, unknown][] = [];
    const vars = new Map<string, unknown>();
    let restyled = 0;
    const style = new Proxy({ unscopedCssVariables: vars, setUnscopedCssVariable: (k: string, v: unknown) => vars.set(k, v) } as Record<string, unknown>, { set: (t, k, v) => { sets.push([String(k), v]); t[k as string] = v; return true; } });
    ng.$host({ style, _onCssStateChange: () => restyled++ });
    const ngStyle = new rt.NgStyle(unset);
    const apply = (value: unknown) => { sets.length = 0; ngStyle.apply([value]); return JSON.stringify(sets); };
    check(apply({ 'width.px': 10, 'font-size': 12, color: 'red' }) === '[["width","10px"],["font-size",12],["color","red"]]', "NgStyle sets each style by the name its key gives, a unit after the dot appended");
    check(apply({ 'width.px': 20, 'font-size': 12 }) === `[["color","${unset}"],["width","20px"]]`, 'a style no longer named is removed, a changed one set again, an unchanged one left');
    check(apply({ 'width.px': null, 'font-size': 12 }) === `[["width","${unset}"]]` && apply(null) === '[]' && apply(undefined) === '[]', "a null style value removes the style; a null or undefined NgStyle leaves the styles as they are");
    check(apply({ 'width.%': 50, 'font-size': 12 }) === `[["width","${unset}"],["width","50%"]]` && apply(new Map([['width.%', 50], ['color', 'blue']])) === `[["font-size","${unset}"],["color","blue"]]`, 'a style whose unit changes is set with the new unit, and NgStyle takes a Map');
    apply({ '--accent': 'red' });
    check(vars.get('--accent') === 'red' && restyled === 1 && apply({}) === '[]' && !vars.has('--accent') && restyled === 2, "a CSS variable is set and removed among the style's unscoped variables, as @nativescript/angular's renderer does");
    let wrong = '';
    try { rt.ngStyleEntries('color: red'); } catch (e) { wrong = String(e); }
    check(wrong.includes('NgStyle takes an object or a Map of styles'), 'NgStyle of a string throws');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
})();

// ---- Angular fragments through nested components ----
(() => {
  const outer = angularComponent('/app/outer.component.ts', "import { Component } from '@angular/core';\n@Component({ selector: 'Outer', template: `<Inner></Inner>` })\nexport class Outer {}\n", new Map([['Inner', 'Inner']]))!;
  const infos = new Map([['Inner', { name: 'Inner', props: [], fragment: true }], ['Outer', { name: 'Outer', props: [] }]]);
  check(isFragment(outer.template, infos) && !isFragment(outer.template, new Map([['Inner', { name: 'Inner', props: [] }]])), 'a template that is one component is a fragment when that component is');
  const swift = render(outer, infos, () => false, 'angular').join('\n');
  check(swift.includes('func render(into region: Region) throws'), 'a component rendering a fragment component renders into its parent region');
})();

// ---- Zoneless Angular: a listener checks its view and the views above it ----
(() => {
  const page = angularComponent('/app/status.component.ts', "import { Component } from '@angular/core';\n@Component({ selector: 'Status', template: `<StackLayout><Label [text]=\"status\"></Label><Badge [count]=\"taps\" (picked)=\"pick()\"></Badge><Button text=\"Go\" (tap)=\"go()\"></Button></StackLayout>` })\nexport class Status { status = 'idle'; taps = 0; go() { this.status = 'busy'; this.taps++; } pick() {} }\n", new Map([['Badge', 'Badge']]))!;
  const infos = new Map([['Badge', { name: 'Badge', props: ['count'], outputs: ['picked'] }], ['Status', { name: 'Status', props: [] }]]);
  for (const [backend, code] of [['Swift', render(page, infos, () => false, 'angular').join('\n')], ['Kotlin', renderKotlin(page, infos, { framework: 'angular' }).join('\n')]] as const) {
    const effects = code.match(/^\s*Effect \{.*$/gm) ?? [];
    check(!effects.length && (code.match(/Check\(\{ (self|this)\._b\d+\(\) \}\)/g) ?? []).length === 2, `a zoneless template's bindings, a view's and a component input's, are checks of its view, re-read when it is checked (${backend})`);
    const listeners = code.split('\n').filter((l) => /\.kitOn\("tap"\)|\.on \{/.test(l));
    const marks = backend === 'Swift' ? /\[__dv = EffectOrder\.current\.view\] .* in Reactivity\.event\(dirty: __dv\)/ : /^\s*EffectOrder\.current\.view\.let \{ __dv -> .* -> Reactivity\.event\(__dv\) \{/;
    check(listeners.length === 2 && listeners.every((l) => marks.test(l)), `a zoneless template's listeners, a view's and a component output's, mark the view they were added in dirty (${backend})`);
  }
})();

// ---- Component providers: each instance of a component makes its own injector ----
(() => {
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-providers-'));
  try {
    const store = join(dir, 'store.ts'), panel = join(dir, 'panel.component.ts'), page = join(dir, 'page.component.ts');
    writeFileSync(store, `import { Injectable, InjectionToken, inject } from '@angular/core';
export const LABEL = new InjectionToken<string>('LABEL');
@Injectable() export class Counter { count = 0; }
@Injectable() export class Tally { readonly counter = inject(Counter); }
`);
    writeFileSync(panel, `import { Component, inject } from '@angular/core';
import { Counter, LABEL, Tally } from './store';
@Component({ selector: 'Panel', template: '<Label [text]="label"></Label>', providers: [Counter, { provide: Tally, useClass: Tally }, { provide: LABEL, useValue: 'one' }] })
export class Panel {
  readonly tally = inject(Tally);
  readonly label = inject(LABEL);
  constructor(private readonly counter: Counter) {
    if (this.counter.count > 0) return;
    this.counter.count++;
  }
}
`);
    writeFileSync(page, "import { Component } from '@angular/core';\nimport { Panel } from './panel.component';\n@Component({ selector: 'Page', imports: [Panel], template: '<StackLayout><Panel></Panel><Panel></Panel></StackLayout>' })\nexport class Page {}\n");
    const ir = angularComponent(panel, readFileSync(panel, 'utf8'), new Map())!;
    const pageIr = angularComponent(page, readFileSync(page, 'utf8'), new Map([['Panel', 'Panel']]))!;
    const members = ir.source.slice(ir.source.indexOf('export class Panel {'));
    check(ir.injector === '$injector' && /^export class Panel \{\s*readonly \$injector = NodeInjector\.enter\(\[Counter, /.test(members) && members.indexOf('$injector') < members.indexOf('counter: Counter = inject(Counter)'), "a component's providers make its injector in its first field, before its injected constructor parameters");
    check(/\{ this\.\$injector\.leave\(\); return; \}[\s\S]*this\.counter\.count\+\+;\s*this\.\$injector\.leave\(\);\s*\}/.test(members), 'the injector stops being current when the constructor returns, early or at its end');
    const infos = new Map([['Panel', { name: 'Panel', props: [] }], ['Page', { name: 'Page', props: [] }]]);
    check(render(ir, infos, () => false, 'angular').join('\n').includes('try EffectOrder.view(injector: self._injector) {') && renderKotlin(ir, infos, { framework: 'angular' }).join('\n').includes('EffectOrder.view(this._injector) {'), "a component's view injects from its injector (Swift, Kotlin)");
    const pageSwift = render(pageIr, infos, () => false, 'angular').join('\n');
    check((pageSwift.match(/let c\d+ = Panel\(\)/g) ?? []).length === 2 && pageSwift.includes('try EffectOrder.view {'), 'a parent without providers renders two instances of the component, each made by its own init');
    for (const platform of ['ios', 'android'] as const) {
      const { checker, program, files } = createProgram([panel, store], new Map([[panel, ir.source]]), platform, modulesDir);
      const cls = program.getSourceFile(panel)!.statements.filter(ts.isClassDeclaration).find((c) => c.name?.text === 'Panel')!;
      if (platform === 'ios') {
        const sw = new SwiftTranslator(checker, new Map([['Panel', { props: ir.props, optional: ir.optional }]]), files);
        translateModules(sw, program, [panel, store]);
        const init = sw.componentMembers(cls, ir.props).join('\n').split('init() {')[1] ?? '';
        check(/^\s*self\._injector = NodeInjector\.enter\(JSArray<Any\?>\(\[Counter\.self, JSObject\(\[\("provide", Tally\.self\), \("useClass", Tally\.self\)\]\)/.test(init), 'each instance makes its injector first, from its providers (Swift)');
      } else {
        const kt = new Translator(checker, new Map([['Panel', { props: ir.props }]]), files);
        kt.appModule = 'org.example.app';
        translateKotlinModules(kt, program, [panel, store]);
        const lines = kt.componentMembers(cls, ir.props).lines;
        check(/^\s*val _injector: NodeInjector = NodeInjector\.enter\(jsArrayOf<Any\?>\(Counter::class\.java, /.test(lines[0] ?? ''), 'each instance makes its injector first, from its providers (Kotlin)');
      }
    }
    const field = join(dir, 'field.component.ts');
    writeFileSync(field, "import { Component } from '@angular/core';\n@Component({ selector: 'Field', template: '<Label [text]=\"name\"></Label>' })\nexport class Field {\n  name = '';\n  take(value: any) { this.name = value; }\n}\n");
    const fieldIr = angularComponent(field, readFileSync(field, 'utf8'), new Map())!;
    const fieldProgram = createProgram([field], new Map([[field, fieldIr.source]]), 'ios', modulesDir);
    const fieldSwift = new SwiftTranslator(fieldProgram.checker, new Map([['Field', { props: fieldIr.props, optional: fieldIr.optional }]]), fieldProgram.files);
    translateModules(fieldSwift, fieldProgram.program, [field]);
    const fieldCls = fieldProgram.program.getSourceFile(field)!.statements.filter(ts.isClassDeclaration).find((c) => c.name?.text === 'Field')!;
    const fieldCode = fieldSwift.componentMembers(fieldCls, fieldIr.props).join('\n');
    check(/self\.name = \S*\(value\)/.test(fieldCode) && !fieldCode.includes('jsSet(self'), "an untyped value written to a component's field is assigned to it, as a component has no members by name (Swift)");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
})();

// ---- A component extending a class: the base's members copied into it ----
(() => {
  // In a process of its own: the programs this run makes stay in memory until it ends, near Node's default heap limit.
  const r = spawnSync(process.execPath, [join(here, 'component-bases.ts')], { encoding: 'utf8', maxBuffer: 64 << 20 });
  process.stdout.write(r.stdout + r.stderr);
  failed += Math.max((r.stdout.match(/^✗/gm) ?? []).length, r.status === 0 ? 0 : 1);
})();

// ---- Template errors are reported, never trapped ----
(() => {
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
  const list = render({ name: 'Rows', file: '/app/rows.ts', source: '', props: [], template: [{ kind: 'element' as const, tag: 'ListView', attrs: [{ name: 'items', method: '$b0' }], events: [], children: [] }] }, new Map(), () => true, 'angular').join('\n');
  check(/\.bind\(items: \{ jsReportedItems \{ try self\._b0\(\) \} \}/.test(list), "a list's items that throw are reported, and the list shows none");
})();

// ---- A component's computed signal read in a binding ----
(() => {
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-computed-'));
  try {
    const file = join(dir, 'people.component.ts');
    writeFileSync(file, `import { Component, computed, signal } from '@angular/core';
const BYLINE = { byline: true } as const;
class Person { name = 'Ada'; }
type Row = Person | typeof BYLINE;
@Component({ selector: 'People', template: '<ListView [items]="rows()"></ListView>' })
export class People {
  readonly people = signal<Person[]>([]);
  readonly rows = computed<Row[]>(() => [BYLINE, ...this.people()]);
}
`);
    const ir = angularComponent(file, readFileSync(file, 'utf8'), new Map())!;
    const { checker, program, files } = createProgram([file], new Map([[file, ir.source]]), 'ios', modulesDir);
    const sw = new SwiftTranslator(checker, new Map([['People', { props: ir.props, optional: ir.optional }]]), files);
    sw.plainFields = true;
    translateModules(sw, program, [file]);
    const cls = program.getSourceFile(file)!.statements.filter(ts.isClassDeclaration).find((c) => c.name?.text === 'People')!;
    sw.componentMembers(cls, ir.props);
    const items = (ir.template as { attrs?: { name: string; method?: string }[] }[])[0]?.attrs?.find((a) => a.name === 'items')?.method ?? '-';
    check(!sw.memberThrows(cls, items), "reading a component's computed array (`rows()`) in a binding throws nothing (Swift)");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
})();

// ---- Top-level names the kit declares too ----
(() => {
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
})();

// ---- A plugin's own Java classes ----
(() => {
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
})();

// ---- Framework kit auto-detection & layering + Angular C2/E5/F6/F7/F12 ----
(() => {
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
})();

// ---- HttpClient: a `responseType: 'text'` response is a string ----
(() => {
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
})();

// ---- the compiler installed in an app's node_modules ----
(() => {
  // Its runtime modules (runtime/angular-rx.ts) then sit under node_modules and below the app's tsconfig.json; a lenient
  // app's iOS build must translate them as the checkout does.
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-installed-'));
  try {
    const compiler = resolve(here, '../..');
    const pkg = join(dir, 'node_modules', '@nativescript', 'compiler');
    for (const d of ['bin', 'src', 'runtime']) cpSync(join(compiler, d), join(pkg, d), { recursive: true });
    cpSync(join(compiler, 'package.json'), join(pkg, 'package.json'));
    for (const d of ['node_modules', 'kit-apple', 'kit-android']) if (existsSync(join(compiler, d))) symlinkSync(join(compiler, d), join(pkg, d), 'dir');
    // Node strips no types under node_modules: the installed package runs dist/, as published.
    const dist = spawnSync(process.execPath, [join(pkg, 'bin', 'build-dist.mjs')], { encoding: 'utf8' });
    const app = join(dir, 'app');
    mkdirSync(app);
    symlinkSync(modulesDir, join(app, 'node_modules'), 'dir');
    writeFileSync(join(app, 'tsconfig.json'), '{ "compilerOptions": { "strict": false } }\n');
    writeFileSync(join(app, 'person-detail.component.ts'), `
import { inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

export class PersonDetail {
  route = inject(ActivatedRoute);
  router = inject(Router);
  id(): number { return +this.route.snapshot.params.id; }
  open(id: number) { this.router.navigate(['/item', id], { relativeTo: this.route }); }
}
`);
    writeFileSync(join(dir, 'translate.mjs'), `
const [base, ext, app] = process.argv.slice(2);
const load = (m) => import(base + '/' + m + ext);
const { createProgram } = await load('program');
const { PluginSources, writtenStrict } = await load('plugins/source');
const { Translator } = await load('swift');
const { translateModules } = await load('modules');
const file = app + '/person-detail.component.ts';
const sw = createProgram([file], new Map(), 'ios', app + '/node_modules', new PluginSources({ app, platform: 'ios' }));
const rx = sw.pluginFiles.filter((f) => f.endsWith('/runtime/angular-rx.ts'));
const t = new Translator(sw.checker, new Map(), sw.files, { pluginFiles: sw.pluginFiles, lenientFiles: sw.pluginFiles.filter((f) => !writtenStrict(f)), lenientApp: sw.lenient });
console.log(translateModules(t, sw.program, [file, ...rx]).map((m) => m.code.split(base.replace(/\\/(src|dist)$/, '')).join('<compiler>')).join('\\n'));
`);
    const run = (base: string, ext: string) => spawnSync(process.execPath, [join(dir, 'translate.mjs'), base, ext, app], { encoding: 'utf8', maxBuffer: 64 << 20 });
    const checkout = run(join(compiler, 'src'), '.ts');
    const installed = dist.status === 0 ? run(join(pkg, 'dist'), '.js') : dist;
    if (checkout.status !== 0 || installed.status !== 0) console.log((checkout.stderr + installed.stderr).trim().split('\n').slice(-6).join('\n'));
    check(checkout.status === 0 && installed.status === 0 && /class ActivatedRoute/.test(checkout.stdout) && installed.stdout === checkout.stdout, "an installed compiler translates its runtime modules as the checkout does (a lenient app's ActivatedRoute, rxjs's Observable)");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
})();

// ---- NativeDialogConfig on Android ----
(() => {
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-dialog-'));
  try {
    const file = join(dir, 'sheet.service.ts');
    writeFileSync(file, `
import { NativeDialogConfig, NativeDialogService } from '@nativescript/angular';

export function openSheet(dialogs: NativeDialogService, cmp: any, config?: NativeDialogConfig) {
  return dialogs.open(cmp, { nativeOptions: { fullscreen: true }, ...(config || {}) });
}
`);
    const kt = createProgram([file], new Map(), 'android', modulesDir);
    const ktTranslator = new Translator(kt.checker, new Map(), kt.files);
    ktTranslator.appModule = 'org.example.app';
    const ktCode = translateKotlinModules(ktTranslator, kt.program, [file]).map((m) => m.code).join('\n');
    check(/config: Any\? = null/.test(ktCode) && !ktCode.includes('NativeDialogConfig'), "a NativeDialogConfig is the plain object kit-android's NativeDialogService takes (Kotlin)");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
})();

// ---- Angular components an attribute selects ----
(() => {
  const bar = "import { Component, input, output } from '@angular/core';\n@Component({ selector: '[searchBar]', template: `<Label [text]=\"hint()\"></Label>` })\nexport class SearchBar { ai = input(false); hint = input('', { alias: 'hintText' }); submitted = output<string>(); }\n";
  const hosted = hostedComponent('/app/search-bar.component.ts', bar)!;
  const page = (template: string, imports = 'SearchBar') => angularComponent('/app/home.component.ts', `import { Component, ViewChild } from '@angular/core';\nimport { SearchBar } from './search-bar.component';\n@Component({ selector: 'Home', imports: [${imports}], template: \`${template}\` })\nexport class Home { @ViewChild('bar') bar: SearchBar; go() {} done(v: string) {} }\n`, new Map(), { hosts: [hosted] })!;
  type Node = { kind: string; tag?: string; name?: string; attrs?: { name: string }[]; props?: { name: string }[]; events?: { name: string; payload?: boolean }[]; children?: Node[]; queries?: { on: string }[] };
  const host = page(`<GridLayout searchBar [ai]="true" [columns]="2" hintText="Ask" (tap)="go()" (submitted)="done($event)" #bar></GridLayout>`).template[0] as Node;
  const inner = host.children?.[0];
  check(host.tag === 'GridLayout' && host.children?.length === 1 && inner?.kind === 'component' && inner.name === 'SearchBar', 'an element whose attribute selects a component hosts it: the component renders into the element');
  check(inner?.props?.map((p) => p.name).sort().join() === 'ai,hintText' && inner.events?.map((e) => e.name).join() === 'submitted' && !!inner.events?.[0].payload, "the component's inputs (by alias) and outputs bound on its host are the component's");
  check(host.attrs?.map((a) => a.name).sort().join() === 'columns,hintText,searchBar' && host.events?.map((e) => e.name).join() === 'tap', "the host's other bindings and events are the element's, and its static attributes are written to it");
  check(inner?.queries?.length === 1 && inner.queries[0].on === 'instance' && !host.queries?.length, "a reference on the host names the component");
  const swift = render(page(`<StackLayout><GridLayout searchBar></GridLayout></StackLayout>`), new Map([['SearchBar', { props: ['ai', 'hint'], optional: ['ai', 'hint'], propAliases: { hint: 'hintText' }, outputs: ['submitted'] }], ['Home', { props: [] }]]), () => false, 'angular').join('\n');
  check(/let (v\d+) = try GridLayout\(\)[\s\S]*let (v\d+) = try c\d+\.render\(\)[\s\S]*\1\.kitAddChild\(\2\)/.test(swift), "the hosted component's view is the host element's child (Swift)");
  const outOfScope = page(`<GridLayout searchBar [ai]="true"></GridLayout>`, '').template[0] as Node;
  check(!outOfScope.children?.length && outOfScope.attrs?.some((a) => a.name === 'ai'), 'a component the template does not import is not hosted');
  const refused = (template: string, source = bar) => {
    try { angularComponent('/app/home.component.ts', `import { Component } from '@angular/core';\nimport { SearchBar } from './search-bar.component';\n@Component({ selector: 'Home', imports: [SearchBar], template: \`${template}\` })\nexport class Home {}\n`, new Map(), { hosts: [hostedComponent('/app/search-bar.component.ts', source)!] }); return ''; } catch (e) { return String(e); }
  };
  check(refused(`<GridLayout searchBar><Label text="x"></Label></GridLayout>`).includes('content on <GridLayout>, the host of SearchBar'), "content inside a component's host is refused (no <ng-content> yet)");
  check(refused(`<GridLayout searchBar></GridLayout>`, bar.replace('export class SearchBar {', "export class SearchBar { el = inject(ElementRef);").replace('{ Component,', '{ Component, ElementRef, inject,')).includes("SearchBar's own ElementRef or host bindings"), 'a hosted component reading its host element is refused');
})();

// ---- Plugin elements registered with a ViewClassMeta ----
(() => {
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-ng-elements-'));
  try {
    const entry = join(dir, 'node_modules/fake-panel/angular/fesm2022/fake-panel-angular.mjs');
    mkdirSync(dirname(entry), { recursive: true });
    writeFileSync(entry, "import { registerElement } from '@nativescript/angular';\nimport { Panel, Badge, Chip } from 'fake-panel';\nconst panelMeta = {\n  insertChild: (parent, child) => { if (child.id === 'main') parent.mainContent = child; },\n  removeChild: (parent, child) => { if (child.id === 'main') parent.mainContent = null; },\n};\nregisterElement('Panel', () => Panel, panelMeta);\nregisterElement('Badge', () => Badge, {});\nregisterElement('Chip', () => Chip);\n");
    const app = join(dir, 'src/main.ts');
    mkdirSync(dirname(app), { recursive: true });
    writeFileSync(app, "import { registerElement } from '@nativescript/angular';\nimport { PanelModule } from 'fake-panel/angular';\nimport { Glass } from './glass';\nregisterElement('Glass', () => Glass, { skipAddToDom: true });\n");
    const found = registeredElements([app], join(dir, 'node_modules'));
    check(found.get('Panel')?.name === 'Panel' && found.get('Panel')?.meta?.join() === 'insertChild,removeChild' && found.get('Badge')?.meta?.length === 0 && found.get('Chip')?.meta === undefined && found.get('Glass')?.from === join(dir, 'src/glass'),
      "registerElement with a third argument registers its tag, with the meta's keys");
    const elements = new Map([...found].map(([tag, e]) => [tag, e.name]));
    const elementMeta = new Map([...found].flatMap(([tag, e]) => (e.meta === undefined ? [] : [[tag, e.meta] as const])));
    const use = (template: string) => {
      try { return angularComponent('/app/home.component.ts', `import { Component } from '@angular/core';\n@Component({ selector: 'Home', template: \`${template}\` })\nexport class Home {}\n`, new Map(), { elements, elementMeta })!.template[0] as { tag?: string }; } catch (e) { return String(e); }
    };
    const empty = use('<Panel></Panel>');
    check(typeof empty === 'object' && empty.tag === 'Panel' && typeof use('<Badge><Label text="1"></Label></Badge>') === 'object', 'a tag registered with a meta is an element; one whose meta has no renderer hooks takes children');
    check(String(use('<Panel><Label id="main" text="x"></Label></Panel>')).includes('the children of <Panel> join it through its registerElement meta (insertChild, removeChild)'), "children of a tag whose meta inserts them itself are refused, not added as the layout's");
    check(String(use('<StackLayout><Glass></Glass></StackLayout>')).includes('<Glass> is registered with skipAddToDom'), 'a tag registered with skipAddToDom is refused');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
})();

// ---- Angular features a release build refuses rather than ignores ----
(() => {
  const thrown = (f: () => unknown) => { try { f(); return ''; } catch (e) { return String(e); } };
  const page = (template: string, members = 'form: any; name = ""; items: string[] = [];', options: Parameters<typeof angularComponent>[3] = {}, selectors = new Map<string, string>()) =>
    thrown(() => angularComponent('/app/form.component.ts', `import { Component } from '@angular/core';\n@Component({ selector: 'Form', template: \`${template}\` })\nexport class Form { ${members} }\n`, selectors, options));
  const refuses = (template: string, text: string, what: string, selectors?: Map<string, string>) => {
    const e = page(template, undefined, {}, selectors);
    check(e.includes(text) && e.includes('not supported in a release build yet'), `${what} stops the build: ${e ? e.split(': ').slice(1).join(': ') : 'it compiled'}`);
  };
  refuses(`<StackLayout [formGroup]="form"></StackLayout>`, '[formGroup] (@angular/forms) on <StackLayout>', '[formGroup]');
  refuses(`<TextField formControlName="name"></TextField>`, 'formControlName (@angular/forms) on <TextField>', 'formControlName');
  refuses(`<StackLayout formGroupName="address"></StackLayout>`, 'formGroupName (@angular/forms)', 'formGroupName');
  refuses(`<TextField [formControl]="form"></TextField>`, '[formControl] (@angular/forms)', '[formControl]');
  refuses(`<TextField [(ngModel)]="name"></TextField>`, '[(ngModel)] (@angular/forms) on <TextField>', '[(ngModel)]');
  refuses(`<TextField [ngModel]="name" (ngModelChange)="name = $event"></TextField>`, '[ngModel] (@angular/forms)', '[ngModel] with (ngModelChange)');
  refuses(`<StackLayout ngForm (ngSubmit)="name = ''"></StackLayout>`, 'ngForm (@angular/forms)', 'ngForm');
  refuses(`<StackLayout (ngSubmit)="name = ''"></StackLayout>`, '(ngSubmit) (@angular/forms)', '(ngSubmit)');
  refuses(`<Rating [(ngModel)]="name"></Rating>`, '[(ngModel)] (@angular/forms) on <Rating>', '[(ngModel)] on a component', new Map([['Rating', 'Rating']]));
  refuses(`<Label #m="ngModel"></Label>`, `#m="ngModel" on <Label>, a reference to a directive's exportAs`, "a reference to a directive's exportAs");
  refuses(`<Rating [ngStyle]="{ color: 'red' }"></Rating>`, "[ngStyle] (@angular/common's NgStyle) on <Rating>", '[ngStyle] on a component', new Map([['Rating', 'Rating']]));
  refuses(`<Label ngStyle="color: red"></Label>`, "ngStyle (@angular/common's NgStyle) on <Label>", 'a static ngStyle attribute');
  refuses(`<ng-container [ngClass]="{ on: true }"></ng-container>`, "[ngClass] (@angular/common's NgClass) on <ng-container>", '[ngClass] on <ng-container>');
  refuses(`<ng-container [ngStyle]="{ color: 'red' }"></ng-container>`, "[ngStyle] (@angular/common's NgStyle) on <ng-container>", '[ngStyle] on <ng-container>');
  refuses(`<Label [class]="name" [ngClass]="{ on: true }"></Label>`, '[class] beside [ngClass] on <Label>', '[class] beside [ngClass]');
  refuses(`<Label routerLink="/a"></Label>`, "routerLink (@angular/router's RouterLink; nsRouterLink is supported)", "@angular/router's routerLink");
  refuses(`<StackLayout [ngTemplateOutlet]="null"></StackLayout>`, "[ngTemplateOutlet] (@angular/common's NgTemplateOutlet, which a release build runs on <ng-container>)", '[ngTemplateOutlet] on an element');
  refuses(`<Label [ngIf]="true"></Label>`, "[ngIf] (@angular/common's NgIf without its template (*ngIf))", 'NgIf without its template');
  refuses(`<Label animate.enter="fade"></Label>`, "animate.enter (Angular's enter animation)", 'animate.enter');
  refuses(`<Label (animate.leave)="name = ''"></Label>`, 'the animation event (animate.leave) on <Label>', '(animate.leave)');
  refuses(`<Label (@fade.done)="name = ''"></Label>`, 'the animation event (@fade.done) on <Label>', 'a legacy animation event');
  refuses(`<Label (window:resize)="name = ''"></Label>`, '(window:resize), an event of the window, on <Label>', 'a global event target');
  refuses(`<ng-container #group></ng-container>`, '#group on <ng-container>', 'a reference on <ng-container>');
  refuses(`<ng-container formGroupName="address"></ng-container>`, 'formGroupName (@angular/forms) on <ng-container>', 'a forms directive on <ng-container>');
  refuses(`<page-router-outlet actionBarVisibility="never"></page-router-outlet>`, 'actionBarVisibility="never" on <page-router-outlet>', "page-router-outlet's actionBarVisibility other than auto");
  refuses(`<page-router-outlet (activate)="name = ''"></page-router-outlet>`, '(activate) on <page-router-outlet>', "page-router-outlet's events");
  check(!page(`<page-router-outlet name="tab" actionBarVisibility="auto"></page-router-outlet>`), "page-router-outlet's name and actionBarVisibility=\"auto\" (the Frame's default) compile");
  const fc = angularDirectives(['/app/fc.directive.ts'], () => "import { Directive } from '@angular/core';\n@Directive({ selector: '[formControl]', inputs: ['formControl'] })\nexport class FormControlLike { formControl: any; }\n");
  const fcPage = thrown(() => angularComponent('/app/form.component.ts', "import { Component } from '@angular/core';\nimport { FormControlLike } from './fc.directive';\n@Component({ selector: 'Form', imports: [FormControlLike], template: `<TextField [formControl]=\"form\"></TextField>` })\nexport class Form { form: any; }\n", new Map(), { directives: fc }));
  check(!fcPage, `an app directive selected by [formControl] binds it${fcPage ? `: ${fcPage}` : ''}`);
  const dim = angularDirectives(['/app/dim.directive.ts'], () => "import { Directive } from '@angular/core';\n@Directive({ selector: '[dimmed]' })\nexport class Dim {}\n");
  const dimmed = thrown(() => angularComponent('/app/form.component.ts', "import { Component } from '@angular/core';\nimport { Dim } from './dim.directive';\n@Component({ selector: 'Form', imports: [Dim], template: `<ng-container dimmed></ng-container>` })\nexport class Form {}\n", new Map(), { directives: dim }));
  check(dimmed.includes('the directive Dim on <ng-container> is not supported in a release build yet'), `an app directive on <ng-container> stops the build${dimmed ? '' : ': it compiled'}`);

  const empty = angularComponent('/app/list.component.ts', "import { Component } from '@angular/core';\n@Component({ selector: 'List', template: `<StackLayout>@for (x of items; track x) { <Label [text]=\"x\"></Label> } @empty { <Label text=\"None\"></Label> }</StackLayout>` })\nexport class List { items: string[] = []; }\n", new Map())!;
  type Node = { kind: string; tag?: string; items?: string; branches?: { cond: string | null; body: Node[] }[]; children?: Node[]; attrs?: { name: string; value?: string }[] };
  const [loop, none] = (empty.template[0] as Node).children ?? [];
  const cond = none?.branches?.[0]?.cond ?? '-';
  check(loop?.kind === 'for' && none?.kind === 'if' && none.branches?.length === 1 && none.branches[0].body[0]?.attrs?.some((a) => a.value === 'None') === true
    && empty.source.includes(`${cond}() { return (!!(this.${loop.items}().length === 0)); }`), "@for's @empty renders in the loop's place while its collection is empty");

  const meta = (fields: string, members = '') => thrown(() => angularComponent('/app/c.component.ts', `import { Component, input, output, viewChild, booleanAttribute } from '@angular/core';\nconst template = '';\n@Component({ selector: 'C', template: '<Label></Label>', ${fields} })\nexport class C { ${members} }\n`, new Map()));
  for (const [fields, text] of [
    ["viewProviders: [Object]", "@Component's viewProviders"], ["host: { class: 'card' }", "@Component's host"],
    ["inputs: ['x']", "@Component's inputs"], ["outputs: ['y']", "@Component's outputs"], ["preserveWhitespaces: true", "@Component's preserveWhitespaces"],
    ["hostDirectives: []", "@Component's hostDirectives"], ["interpolation: ['[[', ']]']", "@Component's interpolation"],
  ]) {
    const e = meta(fields);
    check(e.includes(`${text} is not supported in a release build yet`), `${text} stops the build${e ? '' : ': it compiled'}`);
  }
  check(meta('template').includes("@Component's template is read as `name: value`"), "a shorthand @Component field stops the build");
  check(!meta("standalone: true, schemas: [], exportAs: 'c', animations: [], preserveWhitespaces: false, encapsulation: 2"), '@Component fields that only steer the compiler compile');
  for (const [members, text] of [
    ["on = input(false, { transform: booleanAttribute });", "input()'s transform (on) is not supported in a release build yet"],
    ["done = output<void>({ alias: 'finished' });", "output()'s alias (done) is not supported in a release build yet"],
    ["box = viewChild('box');", 'the signal query viewChild() (box) is not supported in a release build yet'],
  ]) {
    const e = meta('standalone: true', members);
    check(e.includes(text), `${text.split(' is ')[0]} stops the build${e ? '' : ': it compiled'}`);
  }
  check(!meta('standalone: true', "on = input(false, { alias: 'enabled', debugName: 'on' });"), "input()'s alias and debugName compile");
  const directive = (body: string, fields = '') => thrown(() => angularDirectives(['/app/d.directive.ts'], () => `import { Directive, input } from '@angular/core';\n@Directive({ selector: '[dim]'${fields} })\nexport class Dim { ${body} }\n`));
  check(directive("level = input(1);").includes('input() (level) in a directive is not supported in a release build yet'), "a directive's signal input stops the build");
  check(directive('', ", exportAs: 'dim'").includes('its exportAs is not supported in a release build yet'), "a directive's exportAs stops the build");
  for (const [fields, members, text] of [
    ['providers: [Store, { provide: Store, useClass: Store, multi: true }]', '', "its multi is not supported in a release build yet"],
    ['providers: [...SHARED]', '', "the provider ...SHARED in @Component's providers is not supported in a release build yet"],
    ['providers: [provideStore()]', '', "the provider provideStore() in @Component's providers is not supported in a release build yet"],
    ['providers: SHARED', '', "@Component's providers are read as an array literal in a release build"],
    ['providers: [{ provide: Store }]', '', 'needs provide and one of useClass, useValue, useFactory or useExisting'],
    ['providers: [{ provide: Store, useFactory: (s: Store) => s, deps: [[new Optional(), Store]] }]', '', 'deps other than a list of tokens for useFactory are not supported'],
    ['providers: [Store]', 'store = inject(Store, { skipSelf: true });', "inject()'s skipSelf in a component with providers is not supported in a release build yet"],
    ['providers: [Store]', 'constructor(@Self() private store: Store) {}', '@Self() in a component with providers is not supported in a release build yet'],
  ]) {
    const e = meta(fields, members);
    check(e.includes(text), `component providers: ${text.split(' is ')[0].split(' are ')[0]} stops the build${e ? '' : ': it compiled'}`);
  }
  const extended = thrown(() => angularComponent('/app/c.component.ts', "import { Component } from '@angular/core';\nclass Base {}\n@Component({ selector: 'C', template: '<Label></Label>', providers: [Base] })\nexport class C extends Base {}\n", new Map()));
  check(extended.includes("@Component's providers on a class that extends another are not supported in a release build yet"), 'component providers on a derived class stop the build');
  const ngModule = "import { NgModule } from '@angular/core';\n@NgModule({ declarations: [], providers: [{ provide: 'API', useValue: '/api' }] })\nexport class AppModule {}\n";
  check(thrown(() => declarablesIn('/app/app.module.ts', ngModule, true)).includes("the NgModule AppModule's providers are not supported in a release build yet") && !thrown(() => declarablesIn('/lib/lib.module.ts', ngModule)), "an app NgModule's providers stop the build (a library's wrapper module is not read for them)");

  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-ng-routes-'));
  try {
    const w = (f: string, text: string) => { mkdirSync(dirname(join(dir, f)), { recursive: true }); writeFileSync(join(dir, f), text); return join(dir, f); };
    w('src/home.ts', 'export class Home {}\n');
    const tree = (route: string, features = '') => {
      const main = w('src/main.ts', `import { routes } from './app.routes';\nbootstrapApplication(App, { providers: [provideNativeScriptRouter(routes${features})] });\n`);
      w('src/app.routes.ts', `import { Home } from './home';\nconst more = [{ path: 'more', component: Home }];\nexport const routes = [${route}];\n`);
      return thrown(() => angularRouteTree(main, (f) => readFileSync(f, 'utf8')));
    };
    const canLoad = tree("{ path: 'admin', component: Home, canLoad: [() => false] }");
    check(canLoad.includes("route guards (canLoad on 'admin') are not supported in a release build yet"), `the route guard canLoad stops the build${canLoad ? '' : ': it compiled'}`);
    for (const guard of ['canActivate', 'canActivateChild', 'canDeactivate', 'canMatch']) {
      const e = tree(`{ path: 'admin', component: Home, ${guard}: [() => false] }`);
      check(!e, `the route guard ${guard} compiles${e ? `: ${e}` : ''}`);
    }
    check(tree("{ path: 'a', component: Home, canActivate: guards }").includes("a route's canActivate that is not an array (guards) is not supported"), 'guards not given as an array stop the build');
    check(tree("{ path: 'a', redirectTo: '/b', canMatch: [() => true] }").includes("canMatch on a redirect on 'a' is not supported"), 'canMatch on a redirect stops the build');
    check(tree("{ path: 'a', component: Home, canActivate: [Missing] }").includes("the canActivate guard Missing, which the release build can't find in the app's files, is not supported"), "a guard name the build can't resolve stops it");
    {
      w('src/auth.ts', "import { Injectable, inject } from '@angular/core';\nexport class Session { ok = true; }\n@Injectable({ providedIn: 'root' })\nexport class AuthGuard { canActivate(route: any): boolean { return true; } canDeactivate(): boolean { return true; } }\nexport const loggedIn = () => true;\n");
      w('src/guards/index.ts', "export { AuthGuard as Auth } from '../auth';\n");
      const main = w('src/main.ts', "import { routes } from './app/app.routes';\nbootstrapApplication(App, { providers: [provideNativeScriptRouter(routes)] });\n");
      w('src/app/app.routes.ts', "import { inject } from '@angular/core';\nimport { Home } from '../home';\nimport { Auth } from '../guards';\nimport { Session, loggedIn } from '../auth';\nconst role = (r: string) => () => inject(Session).ok && r === 'admin';\nexport const routes = [{ path: 'a', component: Home, canActivate: [Auth, loggedIn, () => inject(Session).ok], canDeactivate: [Auth] }, { path: 'b', children: [{ path: 'c', component: Home }], canActivateChild: [role('admin')] }, { path: 'd', component: Home }];\n");
      const t = angularRouteTree(main, (f) => readFileSync(f, 'utf8'))!;
      const [a, b, d] = t.routes;
      check(a.guards === 0 && a.deactivate === true && b.guards === 1 && !b.children![0].guards && d.guards === undefined && !d.deactivate, 'guarded routes carry the id their guards register under, and canDeactivate marks the route');
      const ios = t.guards[0].source(join(dir, 'src'), 'ios');
      const android = t.guards[0].source(join(dir, 'src'), 'android');
      check(t.guards.length === 1 && ios.includes("import { Auth } from \"./guards\";") && ios.includes("import { Session, loggedIn } from \"./auth\";") && ios.includes("import { inject } from \"@angular/core\";") && !ios.includes('Home'), "a guard module imports what the guards name, its specifiers relative to the app's folder");
      check(ios.includes("KitRouter.shared.addGuard(0, 'canActivate', (a: any, b: any, c: any, d: any): any => ɵguardResult(inject(Auth).canActivate(a)));") && ios.includes("inject(Auth).canDeactivate()"), "a class guard is injected and its method called with the arguments it declares (a re-export followed)");
      check(/const ɵguard1: \(a: any, b: any\) => any = loggedIn;/.test(ios) && /const ɵguard2: \(a: any, b: any\) => any = \(\) => inject\(Session\)\.ok;/.test(ios), 'a function guard, named or inline, is evaluated once and called with Angular\'s arguments');
      check(ios.includes("const role = (r: string) => () => inject(Session).ok && r === 'admin';") && ios.includes("addGuard(1, 'canActivateChild'"), "the route file's declarations a guard names are copied, and a guard factory's call is the guard");
      check(!android.includes('ɵguardResult') && android.includes('addGuard(0, \'canActivate\', (a: any, b: any, c: any, d: any): any => inject(Auth).canActivate(a));'), "on Android the kit reads a guard's Observable itself");
    }
    check(tree("{ path: 'item', component: Home, resolve: { item: () => 1 } }").includes("route resolvers (resolve on 'item') are not supported in a release build yet"), 'a route resolver stops the build');
    for (const [field, text] of [
      ["data: { title: 'x' }", "a route's data on 'a' is not supported"], ['providers: []', "a route's providers on 'a' is not supported"],
      ["redirectTo: () => '/b'", "a route's redirectTo that is not a string (() => '/b') is not supported"], ['component', "a route's component is read as `name: value`"],
    ]) {
      const e = tree(`{ path: 'a', ${field} }`);
      check(e.includes(text), `${text.split(' is ')[0]} stops the build${e ? '' : ': it compiled'}`);
    }
    check(tree("{ matcher: () => null, component: Home }").includes("a route's matcher is not supported"), "a route's matcher stops the build");
    check(tree("{ path: 'a', component: Home }", ', withComponentInputBinding()').includes('the router feature withComponentInputBinding() is not supported in a release build yet'), 'a router feature that changes routing stops the build');
    check(!tree("{ path: 'a', component: Home, title: 'A', runGuardsAndResolvers: 'always' }", ', withPreloading(PreloadAllModules)'), "a route's title and runGuardsAndResolvers, and withPreloading, compile");
    const followed = (() => { try { return routedComponents(angularRouteTree(w('src/main.ts', "import { routes } from './app.routes';\nprovideNativeScriptRouter(routes);\n"), (f) => readFileSync(f, 'utf8'))!.routes); } catch { return []; } });
    w('src/app.routes.ts', "import { Home } from './home';\nconst more = [{ path: 'more', component: Home }];\nexport const routes = [{ path: '', children: more }];\n");
    check(followed().join() === 'Home', "a route's children named by a constant are followed");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  const flat = (text: string) => thrown(() => angularRoutes(text, '/app/app-routing.module.ts'));
  check(flat("const routes = [{ path: 'a', component: A, canActivate: [AuthGuard] }];").includes("route guards (canActivate on 'a') are not supported in a release build yet"), 'a route guard in a routes file outside the entry stops the build');
  check(flat("const routes = [{ path: 'a', component: A, children: [] }];").includes("a route's children, with the routes given outside the entry, is not supported"), 'nested routes outside the entry stop the build');
  check(flat("const routes = [{ path: 'a', redirectTo: '/b' }];").includes("a redirect from a path other than ''"), "a redirect from a path other than '' outside the entry stops the build");
  check(flat("const routes = [{ path: 'a', component: A }];\n@NgModule({ imports: [NativeScriptRouterModule.forRoot(routes, { bindToComponentInputs: true })] })\nexport class R {}\n").includes('the router option bindToComponentInputs is not supported'), "forRoot's options that change routing stop the build");
  check(!flat("const routes = [{ path: '', redirectTo: '/a', pathMatch: 'full' }, { path: 'a', component: A }];\nNativeScriptRouterModule.forRoot(routes, { enableTracing: true });\nconst row = { id: 1, path: 'x' };\n"), 'a flat route table, and an object with a path that is not a route, compile');
})();

// ---- Angular exports and a non-strict app's diagnostics ----
(() => {
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-ng-exports-'));
  try {
    symlinkSync(modulesDir, join(dir, 'node_modules'), 'dir');
    writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify({ compilerOptions: { strict: false } }));
    const file = join(dir, 'boot.ts');
    writeFileSync(file, `
import { enableProdMode } from '@angular/core';
import type { HttpEvent } from '@angular/common/http';
import type { CanActivate, IsActiveMatchOptions, Params } from '@angular/router';
import { isAngularHmrRestoringRoute } from '@nativescript/angular';

export class Guard implements CanActivate {
  canActivate(): boolean { return true; }
}
export const exact: IsActiveMatchOptions = { paths: 'exact', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' };
export function page(p: Params): string { return String(p['page'] ?? 1); }
export function status(e: HttpEvent<string>): number { return e.status; }
enableProdMode();
export const restoring = isAngularHmrRestoringRoute();
`);
    const lenient = join(dir, 'lenient.ts');
    writeFileSync(lenient, "declare const flag: boolean;\nexport const a = undefined ?? false;\nexport const b = !Boolean(undefined || flag);\nexport const e = undefined ? 'test' : 'production';\nexport function d() { if ({}) return 1; return 2; }\n");
    let ios = '', android = '';
    let swCode = '', ktCode = '';
    try {
      const sw = createProgram([file, lenient], new Map(), 'ios', modulesDir, new PluginSources({ app: dir, platform: 'ios' }));
      swCode = translateModules(new SwiftTranslator(sw.checker, new Map(), sw.files, { pluginFiles: sw.pluginFiles }), sw.program, [file]).map((m) => m.code).join('\n');
    } catch (e) { ios = String(e); }
    try {
      const kt = createProgram([file, lenient], new Map(), 'android', modulesDir);
      const ktTranslator = new Translator(kt.checker, new Map(), kt.files);
      ktTranslator.appModule = 'org.example.app';
      ktCode = translateKotlinModules(ktTranslator, kt.program, [file]).map((m) => m.code).join('\n');
    } catch (e) { android = String(e); }
    check(!ios && !android, `Angular's CanActivate, Params, IsActiveMatchOptions, HttpEvent, enableProdMode and isAngularHmrRestoringRoute type-check and translate, and a non-strict app's always-nullish, -truthy and -falsy operands are not errors${ios || android ? `: ${(ios || android).split('\n').slice(0, 3).join(' ')}` : ''}`);
    check(!/enableProdMode/.test(swCode) && !/enableProdMode/.test(ktCode) && /restoring[^\n]*= false/.test(ktCode), 'enableProdMode is nothing in a release build, and no route is restored for hot module replacement');
    writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify({ compilerOptions: { strict: true } }));
    let strict = '';
    try { createProgram([lenient], new Map(), 'android', modulesDir); } catch (e) { strict = String(e); }
    check(strict.includes('TS2871') && strict.includes('TS2873'), "a strict app's always-nullish and always-falsy operands stay errors");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
})();

// ---- An own value for a class's method (Kotlin) ----
(() => {
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-own-method-'));
  try {
    const translate = (source: string) => {
      const file = join(dir, 'store.ts');
      writeFileSync(file, source);
      const kt = createProgram([file], new Map(), 'android', modulesDir);
      const ktTranslator = new Translator(kt.checker, new Map(), kt.files);
      ktTranslator.appModule = 'org.example.app';
      try { translateKotlinModules(ktTranslator, kt.program, [file]); return ''; } catch (e) { return String(e); }
    };
    const store = 'export class Store { dispatch(a: string): number { return a.length; } static make(): Store { return new Store(); } }\nexport const s = new Store();\n';
    check(!translate(store + 's.dispatch = (a: string) => -1;\n'), "an instance is given its own function for a class method on Android");
    check(translate(store + 'Store.make = () => s;\n').includes("giving Store.make a value in place of the class's static method is not supported in a release build yet"), "a class given its own function for a static method stops the Android build");
    check(!translate(store + "export const o = { f(): number { return 1; } };\no.f = () => 2;\n"), "an object literal's method is replaced on Android");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
})();

// ---- @angular/forms' directives in templates ----
(() => {
  const compile = (template: string, members = 'name = ""; agree = false; form: any; save(f: any) {}', imports = 'NativeScriptFormsModule, ReactiveFormsModule', selectors = new Map<string, string>()) =>
    angularComponent('/app/form.component.ts', `import { Component, signal } from '@angular/core';\nimport { ReactiveFormsModule, FormsModule } from '@angular/forms';\nimport { NativeScriptFormsModule } from '@nativescript/angular';\n@Component({ selector: 'Form', imports: [${imports}], template: \`${template}\` })\nexport class Form { ${members} }\n`, selectors, {})!;
  const fails = (template: string, members?: string, imports?: string, selectors?: Map<string, string>) => { try { compile(template, members, imports, selectors); return ''; } catch (e) { return String(e); } };
  const methodOf = (c: AngularComponent, m: string) => c.source.split('\n').find((l) => l.trimStart().startsWith(`${m}(`)) ?? '';
  const usesOf = (c: AngularComponent): any[] => {
    const all: any[] = [];
    const walk = (nodes: any[]) => { for (const x of nodes) { all.push(...(x.directives ?? [])); walk(x.children ?? []); walk(x.body ?? []); for (const b of x.branches ?? []) walk(b.body); } };
    walk(c.template);
    return all;
  };
  const makes = (c: AngularComponent) => usesOf(c).map((u) => methodOf(c, u.make).replace(/^.*return \(new \$F_(\w+)\((.*)\)\); }$/, '$1($2)'));

  const td = compile(`<StackLayout ngForm #f="ngForm" (ngSubmit)="save(f)"><TextField [(ngModel)]="name" name="n" required minlength="3" #m="ngModel"></TextField><Label [text]="m.valid ? 'ok' : 'bad'"></Label></StackLayout><Button [isEnabled]="f.valid"></Button>`);
  const tdMakes = makes(td);
  check(JSON.stringify(tdMakes) === JSON.stringify([
    "NgForm([], [], 'always', [false])",
    'NgControlStatus($Ng_hostView(), $Ng_viewChecker(), $d0, true)',
    'NsValueAccessor($Ng_hostView(), "text", $unsetValue)',
    'RequiredValidator(true)',
    'MinLengthValidator(true)',
    'NgModel($d0, [$d3, $d4], [], $d2, $Ng_viewChecker(), [true, true, false, false])',
    'NgControlStatus($Ng_hostView(), $Ng_viewChecker(), $d5, false)',
  ]), `an ngForm with an ngModel below it: NgForm, the accessor, validator directives, NgModel under the form, and their NgControlStatus, in Angular's order (${tdMakes.join(' · ')})`);
  check(/\$e\d+\(\$d0: \$F_NgForm, \$event: any\) \{ this\.save\(\$d0\); \}/.test(td.source), "(ngSubmit) is NgForm's output, its template reference naming NgForm in its own handler");
  check(td.source.includes('this.name = $event;') && td.source.includes('[(this.name), "n", undefined, undefined]'), '[(ngModel)] binds NgModel and writes its ngModelChange back to the field');
  check(td.source.includes("return ($d5.valid ? 'ok' : 'bad');") && /\$b\d+\(\$d0: \$F_NgForm, \$d1: \$F_NgControlStatus\) \{ return \(\$d0\.valid\); \}/.test(td.source), 'a template reference to NgModel or NgForm names it in the elements after it and below it');
  check(td.source.includes('$d2.onChange($event.value);') && td.source.includes('$d2.onTouched();') && usesOf(td).some((u) => u.listeners.some((l: any) => l.event === 'textChange')), "a TextField's value accessor takes its textChange and blur, as @nativescript/angular's does");
  const sig = compile(`<Switch [(ngModel)]="on"></Switch><Slider [(ngModel)]="level"></Slider>`, 'on = signal(false); level = 3;');
  check(sig.source.includes('this.on.set($event);') && sig.source.includes('this.level = $event;') && sig.source.includes('"checked"') && sig.source.includes('"value"'), '[(ngModel)] on a signal sets it, on a field assigns it, and Switch and Slider take their accessors');

  const rx = compile(`<StackLayout [formGroup]="form" (ngSubmit)="save(form)"><TextField formControlName="name" class="in" [class.big]="agree"></TextField><StackLayout formGroupName="address"><SegmentedBar formControlName="plan"></SegmentedBar></StackLayout></StackLayout><DatePicker [formControl]="form"></DatePicker>`);
  const rxMakes = makes(rx);
  check(rxMakes.includes('FormGroupDirective([], [], \'always\', "formGroup", [true])') && rxMakes.includes('FormControlName($d0, [], [], $d2, [true, false])')
    && rxMakes.some((m) => /^FormGroupName\(\$d0, \[\], \[\], false, \[true\]\)$/.test(m)) && rxMakes.some((m) => /^FormControlName\(\$d\d+, \[\], \[\], \$d\d+, \[true, false\]\)$/.test(m) && !m.startsWith('FormControlName($d0,'))
    && rxMakes.some((m) => /^FormControlDirective\(\[\], \[\], \$d\d+, 'always', \[true, false\]\)$/.test(m)), `formGroup with formControlName and formGroupName below it, and a standalone formControl, each under its parent (${rxMakes.join(' · ')})`);
  check(usesOf(rx).some((u) => methodOf(rx, u.make).includes('new $Ng_NgClass()')) && !rx.template.some((x: any) => (x.children ?? []).some((c: any) => c.attrs?.some((a: any) => a.name === 'class'))), "[class.x] beside the ng-* classes goes through NgClass, which shares the view's classes with them");

  const swift = render(td, new Map(), () => false, 'angular').join('\n');
  const kotlin = renderKotlin(td, new Map(), { framework: 'angular' }).join('\n');
  check(/d\d+\.update\.subscribe \{ \[__dv = EffectOrder\.current\.view\] \(event: Any\?\) in Reactivity\.event\(dirty: __dv\)/.test(swift) && /d\d+\.update\.subscribe \{ event: Any\? -> /.test(kotlin), "a directive's output is a listener of the view it is in (Swift, Kotlin)");
  check(/Button\(\)[\s\S]*self\._b\d+\(d1, d2\)/.test(swift) && /Button\(\)[\s\S]*this\._b\d+\(d1, d2\)/.test(kotlin), 'an element after a form directive reads it (Swift, Kotlin)');

  const refused = (what: string, e: string, text: string) => check(e.includes(text), `${what}: ${e ? e.split(': ').slice(1).join(': ').slice(0, 160) : 'it compiled'}`);
  refused('ngDefaultControl stops the build', fails(`<Label ngModel ngDefaultControl></Label>`), "ngDefaultControl (@angular/forms' DefaultValueAccessor");
  refused('a forms control on a component stops the build', fails(`<Rating [(ngModel)]="name"></Rating>`, undefined, undefined, new Map([['Rating', 'Rating']])), "a component, is not supported in a release build yet: it needs the component's own ControlValueAccessor");
  refused('ngModel on a view no accessor takes stops the build (NG01203)', fails(`<Label [(ngModel)]="name"></Label>`), 'NG01203: No value accessor for form control');
  refused('ngModel without NativeScriptFormsModule stops the build (NG01203)', fails(`<TextField [(ngModel)]="name"></TextField>`, undefined, 'FormsModule'), "TextValueAccessor: import NativeScriptFormsModule");
  refused('formControlName without a form above it stops the build', fails(`<TextField formControlName="name"></TextField>`), 'NG01050: formControlName must be used with a parent formGroup');
  refused('formControlName in an ngModelGroup stops the build', fails(`<StackLayout ngForm><StackLayout ngModelGroup="a"><TextField formControlName="name"></TextField></StackLayout></StackLayout>`), 'NG01051');
  refused('formGroupName without a form above it stops the build', fails(`<StackLayout formGroupName="a"></StackLayout>`), 'NG01053');
  refused('ngModelGroup outside a form stops the build', fails(`<StackLayout ngModelGroup="a"></StackLayout>`), 'NG01353');
  refused('ngModel in a formGroup stops the build', fails(`<StackLayout [formGroup]="form"><TextField [(ngModel)]="name"></TextField></StackLayout>`), 'NG01350');
  check(!fails(`<StackLayout [formGroup]="form"><TextField [(ngModel)]="name" [ngModelOptions]="{ standalone: true }"></TextField></StackLayout>`), 'a standalone ngModel in a formGroup compiles');
  refused('ngModel in a form without a name stops the build', fails(`<StackLayout ngForm><TextField [(ngModel)]="name"></TextField></StackLayout>`), 'NG01352');
  refused('[class] beside a forms control stops the build', fails(`<TextField [(ngModel)]="name" [class]="'x'"></TextField>`), '[class] beside');
  refused("a reference to an exportAs the element doesn't have stops the build", fails(`<TextField [(ngModel)]="name" #f="ngForm"></TextField>`), `#f="ngForm" on <TextField>, a reference to a directive's exportAs`);
})();

// ---- @angular/forms: the port against the package ----
(() => {
  // Each forms diff case run in Node twice, against @angular/forms and against runtime/angular-forms.ts in its place: the
  // port's semantics checked apart from the translators. What the package's typing would reject, the cases leave out.
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-forms-'));
  try {
    symlinkSync(modulesDir, join(dir, 'node_modules'), 'dir');
    const js = (source: string) => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
    writeFileSync(join(dir, 'forms-port.mjs'), js(readFileSync(join(here, '../../runtime/angular-forms.ts'), 'utf8')));
    const run = (file: string) => {
      const r = spawnSync(process.execPath, [file], { cwd: dir, encoding: 'utf8', timeout: 60_000 });
      return `${r.status}\n${r.stdout}\n${r.stderr.split('\n')[0]}`;
    };
    const casesDir = join(here, '../diff/cases');
    const formsCases = readdirSync(casesDir).filter((f) => /^78\d-forms-.*\.ts$/.test(f) && !/^\/\/ @forms-port$/m.test(readFileSync(join(casesDir, f), 'utf8')));
    check(formsCases.length >= 7, 'the forms diff cases are found');
    for (const c of formsCases) {
      const source = js(readFileSync(join(casesDir, c), 'utf8'));
      writeFileSync(join(dir, 'package.mjs'), source);
      writeFileSync(join(dir, 'port.mjs'), source.replace(/from ['"]@angular\/forms['"]/g, "from './forms-port.mjs'"));
      const expected = run('package.mjs');
      const got = run('port.mjs');
      check(expected.startsWith('0\n') && got === expected, `${c} prints the same in Node with the port as with @angular/forms`);
      if (got !== expected) console.log(`    package: ${JSON.stringify(expected.slice(0, 400))}\n    port:    ${JSON.stringify(got.slice(0, 400))}`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
})();

(() => {
  // kit-android's runtime on the host JVM, for what no diff case reaches: the harness translates no Java class reference.
  const build = process.env.NS_DIFF_BUILD ?? join(tmpdir(), 'ns-native-diff');
  const dir = join(build, 'release-checks-java');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'Main.kt'), `import org.nativescript.kit.*
class Holder { @JvmField var drawable: Any? = null }
fun main() {
    val map = java.util.HashMap<String, String>()
    val view = Holder()
    if (jsGet(view, "cached") == null) jsSet(view, "cached", jsCallMethod(map, "get", "missing"))
    println(listOf(jsCallMethod(map, "get", "missing") === JSNull, jsCallMethod(map, "put", "k", "a") === JSNull, jsCallMethod(map, "put", "k", "b"),
        jsCallMethod(map, "clear") == null, jsGet(view, "drawable") === JSNull, jsGet(view, "cached") === JSNull).joinToString(" "))
}
`);
  let got: string;
  try {
    const runtime = buildKotlinRuntime(build);
    const errors = kotlinc([join(dir, 'Main.kt')], join(dir, 'classes'), [runtime]);
    got = errors ? errors[0] : spawnSync('java', ['-cp', [join(dir, 'classes'), runtime, kotlinStdlib()].join(':'), 'MainKt'], { encoding: 'utf8' }).stdout.trim();
  } catch (e) {
    got = (e as Error).message.split('\n')[0];
  }
  const expected = 'true true a true true true';
  check(got === expected, "a Java method's or field's null reads as script's null on Android, a void method's result as undefined");
  if (got !== expected) console.log(`    got: ${got.slice(0, 300)}`);
})();

// ---- The kit's Gradle path from an output folder under a symlink ----
(() => {
  // The link sits at a different depth from its target, as $TMPDIR's /var does from /private/var.
  const dir = realpathSync(mkdtempSync(join(tmpdir(), 'ns-release-checks-symlinked-out-')));
  try {
    mkdirSync(join(dir, 'a', 'b', 'real', 'out'), { recursive: true });
    symlinkSync(join(dir, 'a', 'b', 'real'), join(dir, 'link'), 'dir');
    const out = join(dir, 'link', 'out');
    const resolved = resolve(realpathSync(out), kitProjectDir(out));
    check(existsSync(resolved) && realpathSync(resolved) === realpathSync(KIT_ANDROID), `settings.gradle.kts names the kit from an --out under a symlink (resolved to ${resolved})`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
})();

console.log(failed ? `${failed} release checks failed` : 'release checks pass');
process.exit(failed ? 1 : 0);
