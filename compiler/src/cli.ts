#!/usr/bin/env node
// ns-native: a NativeScript app written with a web framework, compiled to a
// native app with no JavaScript runtime.
//   node compiler/src/cli.ts <app folder> --out <dir> [--name RecipesVue] [--build] [--device]
//   node compiler/src/cli.ts <app folder> --platform android --out <dir> [--build] [--widgets <aar>]
// The app folder is a NativeScript project (package.json, app/). Its
// components and modules are type-checked together and translated to Swift
// against NativeScriptKit; --build generates the Xcode project and builds it.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import type { ComponentIR } from './ir.ts';
import { vueComponent } from './vue.ts';
import { angularComponent, angularRoutes } from './angular.ts';
import { svelteComponent } from './svelte.ts';
import { svelte5Component, svelteModule } from './svelte5.ts';
import { reactComponent, reactScreens, zustandStore } from './react.ts';
import { solidComponent, solidRoutes, solidStore } from './solid.ts';
import { octaneApp } from './octane.ts';
import { createProgram, nodeModules } from './program.ts';
import { corePatches } from './core-patches.ts';
import { Translator, type ComponentInfo } from './swift.ts';
import { render, type Framework } from './codegen.ts';
import { createRequire } from 'node:module';
import { addInterfaces, translateModules } from './modules.ts';
import { appStylesheets, importedStylesheets, kitCss } from './css.ts';
import { PluginSources, configuredOverrides } from './plugins/source.ts';
import { pluginNative, xcodegenLines } from './plugins/native.ts';
import { reachability } from './reach.ts';
import { collectProperties } from './properties.ts';

const args = process.argv.slice(2);
const opt = (name: string, fallback?: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const here = dirname(fileURLToPath(import.meta.url));
const kit = resolve(here, '../../kit');
const app = resolve(args[0] ?? '.');
const pkg = JSON.parse(readFileSync(join(app, 'package.json'), 'utf8'));
const appDir = join(app, dirname(pkg.main ?? 'app/app.ts'));
const name = opt('--name', basename(app).replace(/(^|[-_])(\w)/g, (_: string, __: string, c: string) => c.toUpperCase()))!;
const out = resolve(opt('--out', join(app, 'platforms', 'native'))!);
const say = (m: string) => console.log(`[ns-native] ${m}`);
const platform = opt('--platform') === 'android' ? 'android' : 'ios';

const files: string[] = [];
const walk = (d: string) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else files.push(p); } };
walk(appDir);
const entry = join(app, pkg.main ?? 'app/app.ts');
const deps = { ...pkg.dependencies };
const framework = deps['nativescript-vue'] ? 'vue' : deps['@nativescript/angular'] ? 'angular' : deps['@nativescript-community/svelte-native'] ? 'svelte' : deps['react-nativescript'] ? 'react' : deps['@nativescript-community/solid-js'] ? 'solid' : deps['@nativescript-community/octane'] ? 'octane' : null;
if (!framework) throw new Error('no supported framework in package.json');
const entryText = readFileSync(entry, 'utf8');
// `x.ios.ts` and `x.android.ts` are one module, `./x`, for their platform.
const otherPlatform = opt('--platform') === 'android' ? /\.ios\.tsx?$/ : /\.android\.tsx?$/;
const sources = files.filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts') && f !== entry && !/polyfills\.ts$/.test(f) && !otherPlatform.test(f));
// Virtual replacements for app modules the release build reads differently (a zustand store).
const overrides = new Map<string, string>();

// 1. Each component through its framework's front end; 2. the component the app starts with.
const started = Date.now();
let components: ComponentIR[];
let modules: string[];
let root: string;
let prelude = '';
let routing: { routes: { path: string; component: string }[]; initial: string } | null = null;
/** The app mounts its own roots (Octane's `renderNativeScriptApp` in the entry): the entry is a module that runs the app. */
let mounted = false;
/** The framework as its templates update: Svelte 5 orders updates as Svelte 4 does not. */
let style: Framework = framework;
/** Angular checked by zone.js: every binding re-read after each task. */
let zone = false;
if (framework === 'vue') {
  components = files.filter((f) => f.endsWith('.vue')).map((f) => vueComponent(f, readFileSync(f, 'utf8')));
  modules = sources;
  const rootImport = /createApp\(\s*(\w+)\s*\)/.exec(entryText)?.[1];
  const rootFile = rootImport && new RegExp(`import\\s+${rootImport}\\s+from\\s+['"]([^'"]+)['"]`).exec(entryText)?.[1];
  if (!rootFile) throw new Error(`${entry}: no createApp(Component)`);
  root = basename(rootFile, '.vue');
} else if (framework === 'react') {
  const tsx = files.filter((f) => f.endsWith('.tsx'));
  const texts = new Map([...sources, ...tsx].map((f) => [f, readFileSync(f, 'utf8')]));
  const navigatorFile = tsx.find((f) => /\.Navigator\b/.test(texts.get(f)!));
  const { screens, initial, container } = navigatorFile ? reactScreens(texts.get(navigatorFile)!) : { screens: [], initial: '', container: null };
  const fns: { file: string; fn: ts.FunctionDeclaration }[] = [];
  for (const f of tsx) {
    if (f === navigatorFile) continue;
    const sf = ts.createSourceFile(f, texts.get(f)!, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    for (const st of sf.statements) if (ts.isFunctionDeclaration(st) && st.name && /^[A-Z]/.test(st.name.text)) fns.push({ file: f, fn: st });
  }
  const names = new Map(fns.map(({ file, fn }) => [fn.name!.text, file]));
  components = fns.map(({ file, fn }) => reactComponent(file, texts.get(file)!, fn, screens, texts, names));
  for (const f of sources) { const store = zustandStore(texts.get(f)!); if (store) overrides.set(f, store); }
  modules = sources;
  // The navigator is the app's frame, starting at the initial screen.
  const start = screens.find((s) => s.name === initial)!;
  const frameName = container ?? 'Navigator';
  components.push({ name: frameName, file: join(dirname(navigatorFile!), frameName + '.react.ts'), source: `import ${start.component} from './${start.component}.react';\nexport default class ${frameName} {}\n`, props: [], template: [{ kind: 'element', tag: 'Frame', attrs: [], events: [], children: [{ kind: 'component', name: start.component, props: [], events: [] }] }] });
  root = frameName;
} else if (framework === 'solid') {
  const tsx = files.filter((f) => f.endsWith('.tsx'));
  const texts = new Map([...sources, ...tsx].map((f) => [f, readFileSync(f, 'utf8')]));
  const routerFile = tsx.find((f) => /<StackRouter\b/.test(texts.get(f)!));
  const { routes, initial } = routerFile ? solidRoutes(texts.get(routerFile)!) : { routes: [], initial: '' };
  const fns: { file: string; fn: ts.FunctionDeclaration }[] = [];
  for (const f of tsx) {
    if (f === routerFile) continue;
    const sf = ts.createSourceFile(f, texts.get(f)!, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    for (const st of sf.statements) if (ts.isFunctionDeclaration(st) && st.name && /^[A-Z]/.test(st.name.text)) fns.push({ file: f, fn: st });
  }
  const names = new Set(fns.map(({ fn }) => fn.name!.text));
  components = fns.map(({ file, fn }) => solidComponent(file, fn, routes, names));
  for (const f of sources) { const store = solidStore(texts.get(f)!); if (store) overrides.set(f, store); }
  modules = sources;
  const start = routes.find((r) => r.name === initial)!;
  components.push({ name: 'StackRouter', file: join(dirname(routerFile!), 'StackRouter.solid.ts'), source: `import ${start.component} from './components/${start.component}.solid';\nexport default class StackRouter {}\n`, props: [], template: [{ kind: 'element', tag: 'Frame', attrs: [], events: [], children: [{ kind: 'component', name: start.component, props: [], events: [] }] }] });
  root = 'StackRouter';
} else if (framework === 'octane') {
  const tsx = files.filter((f) => f.endsWith('.tsx'));
  const app = octaneApp(entry, new Map([entry, ...sources, ...tsx].map((f) => [f, readFileSync(f, 'utf8')])), platform);
  components = app.components;
  for (const [f, store] of app.overrides) overrides.set(f, store);
  mounted = !!app.mounted;
  modules = mounted ? [...sources, ...tsx, entry] : sources.filter((f) => !app.glue.has(f));
  root = app.root;
} else if (framework === 'svelte' && Number(JSON.parse(readFileSync(join(nodeModules(app), 'svelte', 'package.json'), 'utf8')).version.split('.')[0]) >= 5) {
  // Svelte 5: parsed by the app's own compiler; `.svelte.ts` modules' runes as Svelte compiles them.
  const { parse } = createRequire(join(app, 'package.json'))('svelte/compiler');
  components = files.filter((f) => f.endsWith('.svelte')).map((f) => svelte5Component(f, readFileSync(f, 'utf8'), parse, platform));
  for (const f of sources) {
    const module = f.endsWith('.svelte.ts') ? svelteModule(f, readFileSync(f, 'utf8')) : null;
    if (module) overrides.set(f, module);
  }
  modules = sources;
  style = 'svelte5';
  const rootImport = /svelteNative(?:NoFrame)?\(\s*(\w+)/.exec(entryText)?.[1];
  const rootFile = rootImport && new RegExp(`import\\s+${rootImport}\\s+from\\s+['"]([^'"]+)['"]`).exec(entryText)?.[1];
  if (!rootFile) throw new Error(`${entry}: no svelteNative(Component)`);
  root = basename(rootFile, '.svelte');
} else if (framework === 'svelte') {
  const isStoreFile = (f: string) => /from\s+['"]svelte\/store['"]/.test(readFileSync(f, 'utf8'));
  components = files.filter((f) => f.endsWith('.svelte')).map((f) => svelteComponent(f, readFileSync(f, 'utf8'), (spec) => {
    const target = resolve(dirname(f), spec);
    return [target + '.ts', target + '/index.ts'].some((t) => existsSync(t) && isStoreFile(t));
  }));
  modules = sources;
  const rootImport = /svelteNative(?:NoFrame)?\(\s*(\w+)/.exec(entryText)?.[1];
  const rootFile = rootImport && new RegExp(`import\\s+${rootImport}\\s+from\\s+['"]([^'"]+)['"]`).exec(entryText)?.[1];
  if (!rootFile) throw new Error(`${entry}: no svelteNative(Component)`);
  root = basename(rootFile, '.svelte');
} else {
  const selectors = new Map<string, string>();
  for (const f of sources) {
    const text = readFileSync(f, 'utf8');
    const m = /@Component\(\{[\s\S]*?selector:\s*['"]([^'"]+)['"][\s\S]*?\}\)\s*export class (\w+)/.exec(text);
    if (m) selectors.set(m[1], m[2]);
  }
  const routesFile = sources.find((f) => /Routes\b/.test(readFileSync(f, 'utf8')) && /component:/.test(readFileSync(f, 'utf8')));
  const { routes, initial } = routesFile ? angularRoutes(readFileSync(routesFile, 'utf8')) : { routes: [], initial: '/' };
  // zone.js change detection, which Angular 22 runs only where the app provides it.
  zone = [entryText, ...sources.map((f) => readFileSync(f, 'utf8'))].some((t) => /\bprovideZoneChangeDetection\(/.test(t));
  components = sources.map((f) => angularComponent(f, readFileSync(f, 'utf8'), selectors, { zone })).filter((c): c is NonNullable<typeof c> => !!c);
  for (const c of components) c.page = routes.some((r) => r.component === c.name);
  // An NgModule declares; the release build reads what it declares from the components themselves.
  const ngModules = sources.filter((f) => {
    const sf = ts.createSourceFile(f, readFileSync(f, 'utf8'), ts.ScriptTarget.Latest, true);
    return sf.statements.some((st) => ts.isClassDeclaration(st) && ts.getDecorators(st)?.some((d) => /^NgModule\(/.test(d.expression.getText())))
      && sf.statements.every((st) => ts.isImportDeclaration(st) || (ts.isClassDeclaration(st) && ts.getDecorators(st)?.some((d) => /^NgModule\(/.test(d.expression.getText()))));
  });
  modules = sources.filter((f) => f !== routesFile && !ngModules.includes(f) && !components.some((c) => c.file === f.replace(/\.ts$/, '.release.ts')));
  routing = { routes, initial };
  root = /bootstrapApplication\(\s*(\w+)/.exec(entryText)?.[1] ?? '';
  const appModule = /bootstrapModule\(\s*(\w+)/.exec(entryText)?.[1];
  if (!root && appModule) {
    const declaring = ngModules.map((f) => readFileSync(f, 'utf8')).find((t) => new RegExp(`class\\s+${appModule}\\b`).test(t));
    root = (declaring && /bootstrap:\s*\[\s*(\w+)/.exec(declaring)?.[1]) ?? '';
  }
  if (!root) throw new Error(`${entry}: no bootstrapApplication(Component) or bootstrapModule(AppModule) with a bootstrap component`);
  prelude = `        Router.shared.routes = [${routes.map((r) => `Route(${JSON.stringify(r.path)}) { ${r.component}().render() }`).join(', ')}]\n        Router.shared.initial = ${JSON.stringify(initial)}\n`;
}

// 3. Type-check everything as one program, then translate.
const virtual = new Map([...components.map((c) => [c.file, c.source] as [string, string]), ...overrides]);
// Plugins: compiled from their TypeScript source; on iOS their native code is linked as a local Swift package.
const plugins = new PluginSources({ app, platform, overrides: configuredOverrides(app), say });
const { checker, program, files: sourceFiles, pluginFiles, resolved } = createProgram(modules, virtual, platform, undefined, plugins);
const infos = new Map<string, ComponentInfo & { outputs?: string[]; outputFields?: Record<string, string>; optional?: string[]; passed?: boolean }>(components.map((c) => [c.name, { name: c.name, props: c.props, outputs: c.outputs, outputFields: c.outputFields, optional: c.optional, passed: c.passed }]));
// A closed world: the plugin code the app reaches, checked against what npm installed before it is compiled.
const appFiles = [...modules, ...components.map((c) => c.file)];
const reach = reachability(program, resolved, appFiles, new Set(pluginFiles), platform);
const compiledPlugins = pluginFiles.filter((f) => reach.modules.has(f) && program.getSourceFile(f)!.statements.some((st) => reach.keeps(st) && !ts.isImportDeclaration(st) && !ts.isExportDeclaration(st)));
plugins.verify(compiledPlugins);
const properties = collectProperties(checker, sourceFiles);
if (platform === 'android') {
  const { writeAndroid } = await import('./android.ts');
  const css = kitCss(appStylesheets(app, 'android', importedStylesheets(entry, appDir)));
  await writeAndroid({ app, out: resolve(opt('--out', join(app, 'platforms', 'native-android'))!), name, framework: style, zone, components, modules, program, checker, files: sourceFiles, infos, css, root, routes: routing, applicationId: opt('--bundle'), widgetsAar: opt('--widgets'), build: args.includes('--build') });
  process.exit(0);
}
// Before the translator: it reads the plugin modules' symbol tables and which typings declare them.
const native = pluginNative(plugins.all(), out);
const translator = new Translator(checker, infos, sourceFiles, { pluginFiles, reach, properties });
translator.appModule = name;

rmSync(join(out, 'Sources'), { recursive: true, force: true });
mkdirSync(join(out, 'Sources'), { recursive: true });
const header = (from: string) => `// Compiled by ns-native from ${relative(app, from)}; edit that file, not this one.\nimport Foundation\nimport UIKit\nimport NativeScriptKit\n${native.modules.map((m) => `import ${m}\n`).join('')}\n`;
const translated = translateModules(translator, program, [...modules, ...compiledPlugins], resolved);
for (const c of components) {
  const sf = program.getSourceFile(c.file)!;
  const cls = sf.statements.find(ts.isClassDeclaration)!;
  const lines = [`final class ${c.name} {`, ...translator.componentMembers(cls, c.props), '', ...render(c, infos, (m) => translator.memberThrows(cls, m), style, { slots: mounted, rowSignals: mounted, zone }), '}'];
  writeFileSync(join(out, 'Sources', c.name + '.swift'), header(c.file.replace(/\.ts$/, '')) + lines.join('\n') + '\n');
}
addInterfaces(translator, translated);
// File names differ in more than case: a module `app.tsx` beside a component `App` would overwrite it on a case-insensitive disk.
const taken = new Set(components.map((c) => c.name.toLowerCase()));
for (const m of translated) {
  if (!m.code.trim()) continue;
  let file = m.name;
  while (taken.has(file.toLowerCase())) file += '_module';
  taken.add(file.toLowerCase());
  writeFileSync(join(out, 'Sources', file + '.swift'), header(m.file) + m.code);
}
const shapes = translator.shapesCode();
if (shapes) writeFileSync(join(out, 'Sources', '__Objects.swift'), `// Compiled by ns-native: the app's object literals without a declared type.\nimport Foundation\nimport NativeScriptKit\n${native.modules.length || /\bUI[A-Z]/.test(shapes) ? `import UIKit\n${native.modules.map((m) => `import ${m}\n`).join('')}` : ''}\n${shapes}\n`);
const inits = translated.filter((m) => m.init).map((m) => `        ${m.init}()\n`).join('');
const css = kitCss(appStylesheets(app, 'ios', importedStylesheets(entry, appDir)));
const patched = corePatches(app, nodeModules(app));
if (patched?.patches.length) say(`${relative(app, patched.file)}: ${patched.patches.join(', ')}`);
// Set before the module initializers run: they may make views.
const switches = (zone ? '        Zone.enabled = true\n' : '') + (patched?.patches ?? []).map((p) => `        CorePatches.${p} = true\n`).join('');
const start = switches + (mounted
  // The entry's own statements run the app (`Application.run`), after every module it imports.
  ? `        NativeScriptApplication.css = appCSS\n        Reactivity.scheduled = true\n${inits}`
  : `${inits}${prelude}        NativeScriptApplication.run(css: appCSS) { ${root}().render() }\n`);
writeFileSync(join(out, 'Sources', '__Entry.swift'), `// Compiled by ns-native: the app's entry and its CSS.\nimport NativeScriptKit\n\n@main\nenum ${name}App {\n    static func main() {\n${start}    }\n}\n\nlet appCSS = """\n${css.replace(/\\/g, '\\\\').replace(/"""/g, '\\"""')}"""\n`);
say(`${components.length} components and ${modules.length} modules from ${framework} compiled to Swift in ${Date.now() - started} ms → ${relative(process.cwd(), join(out, 'Sources'))}`);

// 4. The Xcode project. The kit is a static library target rather than its
// Swift package because package targets get none of the project's settings.
// The hermetic seal lets the link drop the kit's code, vtable entries and
// conformances the app never reaches; it needs every Swift module in the link
// compiled with it and with full LTO.
// A plugin's Swift module goes without it: sealed, its UIView subclass loses the
// Objective-C class data UIKit reads (`+[NSBundle bundleForClass:]` aborts).
const bundle = opt('--bundle', `org.nativescript.${name.toLowerCase()}.native`)!;
const pluginLines = xcodegenLines(native, out);
writeFileSync(join(out, 'project.yml'), `name: ${name}
options:
  bundleIdPrefix: org.nativescript
  deploymentTarget:
    iOS: "17.0"
settings:
  configs:
    Release:
      SWIFT_OPTIMIZATION_LEVEL: -Osize
      SWIFT_LTO: YES
${native.swift.length ? '' : '      OTHER_SWIFT_FLAGS: -experimental-hermetic-seal-at-link\n'}      DEAD_CODE_STRIPPING: YES
${pluginLines.packages ? `packages:\n${pluginLines.packages}` : ''}targets:
  NativeScriptKit:
    type: library.static
    platform: iOS
    sources: [${relative(out, join(kit, 'Sources', 'NativeScriptKit'))}]
    settings:
      base:
        SWIFT_VERSION: "5.9"
${pluginLines.targets}  ${name}:
    type: application
    platform: iOS
    sources: [Sources]
    dependencies:
      - target: NativeScriptKit
${pluginLines.dependencies}    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: ${bundle}
        SWIFT_VERSION: "5.9"
        GENERATE_INFOPLIST_FILE: YES
        INFOPLIST_KEY_UILaunchScreen_Generation: YES
        INFOPLIST_KEY_UISupportedInterfaceOrientations: UIInterfaceOrientationPortrait
        INFOPLIST_KEY_CFBundleDisplayName: ${name}
        TARGETED_DEVICE_FAMILY: "1"
        CODE_SIGNING_ALLOWED: NO
`);

if (args.includes('--build')) {
  const { execFileSync } = await import('node:child_process');
  execFileSync('xcodegen', ['generate', '--quiet'], { cwd: out, stdio: 'inherit' });
  const destination = args.includes('--device') ? 'generic/platform=iOS' : 'generic/platform=iOS Simulator';
  execFileSync('xcodebuild', ['-project', `${name}.xcodeproj`, '-scheme', name, '-configuration', 'Release', '-destination', destination, '-derivedDataPath', 'build', 'build', '-quiet'], { cwd: out, stdio: 'inherit' });
  say(`built ${relative(process.cwd(), out)}/build`);
}
