#!/usr/bin/env node
// ns-native: a NativeScript app written with a web framework, compiled to a
// native app with no JavaScript runtime.
//   node compiler/src/cli.ts <app folder> --out <dir> [--name RecipesVue] [--bundle <id>] [--build] [--device [--provision <profile> | --team-id <team> [--export-method debugging|release-testing|app-store-connect|enterprise]]]
//   node compiler/src/cli.ts <app folder> --platform android --out <dir> [--bundle <id>] [--build [--aab] [--key-store-path <file> --key-store-password <p> --key-store-alias <a> --key-store-alias-password <p>]] [--widgets <aar>]
// The app folder is a NativeScript project (package.json, app/). Its
// components and modules are type-checked together and translated to Swift
// against NativeScriptKit; --build generates the Xcode project and builds it.
// --all-errors lists every construct the translator cannot handle instead of
// stopping at the first; with --keep-going the project is written anyway, so
// Swift's own errors show where the translation is incomplete.
// --allow-unimplemented-properties (or release.allowUnimplementedProperties)
// builds an app that sets properties core declares and the kit does not apply, warning for each.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import type { ComponentIR } from './ir.ts';
import { vueComponent } from './vue.ts';
import { angularComponent, angularRoutes, angularRouteTree, routedComponents, type RouteNode } from './angular.ts';
import { svelteComponent } from './svelte.ts';
import { svelte5Component, svelteModule } from './svelte5.ts';
import { reactComponent, reactScreens, zustandStore } from './react.ts';
import { solidComponent, solidRoutes, solidStore } from './solid.ts';
import { octaneApp } from './octane.ts';
import { appDeclarations, createProgram, nodeModules } from './program.ts';
import { corePatches, corePatchesAndroid } from './core-patches.ts';
import { KIT, KIT_PLUGINS } from './core.ts';
import { kitIndex } from './kit-index.ts';
import { describe, PropertyGuard } from './unimplemented.ts';
import { Translator, type ComponentInfo } from './swift.ts';
import { isFragment, render, SCHEDULE, type Framework } from './codegen.ts';
import { createRequire } from 'node:module';
import { addInterfaces, translateModules } from './modules.ts';
import { appStylesheets, importedStylesheets, kitAst, kitCss } from './css.ts';
import { PluginSources, configuredOverrides } from './plugins/source.ts';
import { pluginNative, xcodegenLines } from './plugins/native.ts';
import { reachability } from './reach.ts';
import { nativeTable, type NativeClass, type NativeMethod } from './natives/symbols.ts';
import { coreNativeModules, coreNativeProject, installedCore } from './natives/core-ios.ts';
import { collectProperties } from './properties.ts';
import { appResourcesDir, iosDeploymentTarget, iosExtensionNames, iosExtensions, iosProjectResources, mergePodsXcconfig, pluginReplacements, releaseOptions } from './app-resources.ts';
import { generateProject, iosDependencies, packageLines, podfile, productLines, PROJECT_MARKER, removePods, swiftPackages } from './ios-dependencies.ts';
import { SourceLines } from './source-lines.ts';
import { archive, automaticSigningSettings, findProfile, signingSettings, type ExportMethod } from './ios-signing.ts';

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
// `x.ts` beside `x.ios.ts` is the other platforms' module: the platform's own file is the one `./x` resolves to.
const thisPlatform = platform === 'android' ? '.android.ts' : '.ios.ts';
const sources = files.filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts') && f !== entry && !/polyfills\.ts$/.test(f) && !otherPlatform.test(f) && !(!/\.(ios|android)\.ts$/.test(f) && files.includes(f.replace(/\.ts$/, thisPlatform))));
// Virtual replacements for app modules the release build reads differently (a zustand store).
const overrides = new Map<string, string>();

// Plugins: compiled from their TypeScript source; on iOS their native code is linked as a local Swift package.
const plugins = new PluginSources({ app, platform, overrides: configuredOverrides(app, platform), say });

// 1. Each component through its framework's front end; 2. the component the app starts with.
const started = Date.now();
let components: ComponentIR[];
let modules: string[];
let root: string;
let prelude = '';
let routing: { routes: { path: string; component: string }[]; initial: string } | null = null;
/** An Angular route tree, written into the entry once the components are translated. */
let routeTree: RouteNode[] | null = null;
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
  // The Angular components of plugins the app imports (`<package>/angular`), compiled from their source with the app's.
  const libraries = angularLibraries(sources, nodeModules(app), plugins);
  sources.push(...libraries);
  const selectors = new Map<string, string>();
  for (const f of sources) {
    const text = readFileSync(f, 'utf8');
    const m = /@Component\(\{[\s\S]*?selector:\s*['"]([^'"]+)['"][\s\S]*?\}\)\s*export class (\w+)/.exec(text);
    if (m) selectors.set(m[1], m[2]);
  }
  // The configuration the entry provides, lazy routes followed into their files; else one routes file read flat.
  const tree = angularRouteTree(entry, (f) => readFileSync(f, 'utf8'));
  const routesFile = tree ? undefined : sources.find((f) => /Routes\b/.test(readFileSync(f, 'utf8')) && /component:/.test(readFileSync(f, 'utf8')));
  const { routes, initial } = routesFile ? angularRoutes(readFileSync(routesFile, 'utf8')) : { routes: [], initial: '/' };
  const routeFiles = new Set([...(tree?.files ?? []), ...(routesFile ? [routesFile] : [])]);
  // Tags the entry registers too (`registerElement('Glass', …)` in main.ts, before the app bootstraps).
  const elements = registeredElements([...(entry && !sources.includes(entry) ? [entry] : []), ...sources], nodeModules(app));
  // zone.js change detection, which Angular 22 runs only where the app provides it.
  zone = [entryText, ...sources.map((f) => readFileSync(f, 'utf8'))].some((t) => /\bprovideZoneChangeDetection\(/.test(t));
  components = sources.map((f) => angularComponent(f, readFileSync(f, 'utf8'), selectors, { zone, elements: new Map([...elements].map(([tag, e]) => [tag, e.name])) })).filter((c): c is NonNullable<typeof c> => !!c);
  const routed = new Set(tree ? routedComponents(tree.routes) : routes.map((r) => r.component));
  for (const c of components) c.page = routed.has(c.name);
  // The classes of registered tags, imported where the build can reach them: route files, which only configure, are not compiled.
  if (elements.size) {
    const file = join(appDir, '__elements.release.ts');
    const specs = [...elements.values()];
    overrides.set(file, specs.map((e) => `import { ${e.name} } from '${e.from}';`).join('\n') + `\nexport function $elements(): any[] { return [${specs.map((e) => `new ${e.name}()`).join(', ')}]; }\n`);
  }
  // An NgModule declares; the release build reads what it declares from the components themselves.
  const ngModules = sources.filter((f) => {
    const sf = ts.createSourceFile(f, readFileSync(f, 'utf8'), ts.ScriptTarget.Latest, true);
    return sf.statements.some((st) => ts.isClassDeclaration(st) && ts.getDecorators(st)?.some((d) => /^NgModule\(/.test(d.expression.getText())))
      && sf.statements.every((st) => ts.isImportDeclaration(st) || (ts.isClassDeclaration(st) && ts.getDecorators(st)?.some((d) => /^NgModule\(/.test(d.expression.getText()))));
  });
  modules = [...sources.filter((f) => !routeFiles.has(f) && !ngModules.includes(f) && !components.some((c) => c.file === f.replace(/\.ts$/, '.release.ts'))), ...(elements.size ? [join(appDir, '__elements.release.ts')] : [])];
  routing = { routes, initial };
  // The entry's own statements (an app delegate, a keyboard setup) run after the modules it imports, the bootstrap call aside.
  const entryModule = angularEntryModule(entry, entryText);
  if (entryModule) {
    overrides.set(entry, entryModule);
    modules.push(entry);
  }
  root = /bootstrapApplication\(\s*(\w+)/.exec(entryText)?.[1] ?? '';
  const appModule = /bootstrapModule\(\s*(\w+)/.exec(entryText)?.[1];
  if (!root && appModule) {
    const declaring = ngModules.map((f) => readFileSync(f, 'utf8')).find((t) => new RegExp(`class\\s+${appModule}\\b`).test(t));
    root = (declaring && /bootstrap:\s*\[\s*(\w+)/.exec(declaring)?.[1]) ?? '';
  }
  if (!root) throw new Error(`${entry}: no bootstrapApplication(Component) or bootstrapModule(AppModule) with a bootstrap component`);
  routeTree = tree?.routes ?? null;
  prelude = tree
    ? ''
    : `        Router.shared.routes = [${routes.map((r) => `Route(${JSON.stringify(r.path)}) { ${r.component}().render() }`).join(', ')}]\n        Router.shared.initial = ${JSON.stringify(initial)}\n`;
}

// The app's CSS through its own build's pipeline, which also gives the bundler's defines the sources are read with.
const sheets = appStylesheets(app, platform, importedStylesheets(entry, appDir));

// 3. Type-check everything as one program, then translate.
// `const { X } = await import('./x')` reads an app module the build links statically: the module evaluates at startup.
for (const c of components) c.source = staticImports(c.source);
for (const f of modules) {
  const text = overrides.get(f) ?? (existsSync(f) ? readFileSync(f, 'utf8') : undefined);
  const rewritten = text === undefined ? undefined : staticImports(text);
  if (rewritten !== undefined && rewritten !== text) overrides.set(f, rewritten);
}
const virtual = new Map([...components.map((c) => [c.file, c.source] as [string, string]), ...overrides]);
const declarations = platform === 'ios' ? [
  ...appDeclarations(app),
  // The native typings of plugins whose components compile with the app's.
  ...plugins.all().flatMap((p) => p.typings),
] : [];
const replacements = pluginReplacements(app, platform);
modules.push(...Object.values(replacements).filter((f) => !modules.includes(f)));
const { checker, program, files: sourceFiles, pluginFiles, resolved } = createProgram(modules, virtual, platform, undefined, plugins, declarations, replacements);
const infos = new Map<string, ComponentInfo & { outputs?: string[]; outputFields?: Record<string, string>; optional?: string[]; passed?: boolean; fragment?: boolean; initThrows?: boolean }>(components.map((c) => [c.name, { name: c.name, props: c.props, outputs: c.outputs, outputFields: c.outputFields, optional: c.optional, passed: c.passed, fragment: framework === 'angular' && !c.page && isFragment(c.template) }]));
// A closed world: the plugin code the app reaches, checked against what npm installed before it is compiled.
const appFiles = [...modules, ...components.map((c) => c.file)];
const reach = reachability(program, resolved, appFiles, new Set(pluginFiles), platform);
const compiledPlugins = pluginFiles.filter((f) => reach.modules.has(f) && program.getSourceFile(f)!.statements.some((st) => reach.keeps(st) && !ts.isImportDeclaration(st) && !ts.isExportDeclaration(st)));
plugins.verify(compiledPlugins);
const properties = collectProperties(checker, sourceFiles);
// The files the translated code says it came from: a component's source for its virtual class, a module's own file for a replacement of it.
const sourceLines = args.includes('--no-source-lines') ? null : new SourceLines(new Map([
  ...components.map((c) => [c.file, componentSource(c)] as const),
  ...[...overrides.keys()].map((f) => [f, f] as const),
]));
/** The file a component was written in: beside its virtual file, or the .tsx declaring its function. */
function componentSource(c: ComponentIR): string | null {
  for (const candidate of [c.file.replace(/\.release\.ts$/, '.ts'), c.file.replace(/\.ts$/, '')]) if (candidate !== c.file && existsSync(candidate)) return candidate;
  return files.find((f) => /\.[jt]sx$/.test(f) && new RegExp(`function\\s+${c.name}\\b`).test(readFileSync(f, 'utf8'))) ?? null;
}
/** `--key-store-path` with its password, alias and alias password, as the NativeScript CLI takes them. */
function keyStore() {
  const path = opt('--key-store-path');
  if (!path) return undefined;
  const [password, alias, aliasPassword] = ['--key-store-password', '--key-store-alias', '--key-store-alias-password'].map((o) => opt(o));
  if (password === undefined || alias === undefined || aliasPassword === undefined) throw new Error('--key-store-path needs --key-store-password, --key-store-alias and --key-store-alias-password');
  return { path, password, alias, aliasPassword };
}
// Properties the app sets that core declares and the kit does not apply: an error unless the app opts out.
const allowUnapplied = args.includes('--allow-unimplemented-properties') || releaseOptions(app, platform).allowUnimplementedProperties === true;
const kitName = platform === 'android' ? 'kit-android' : 'NativeScriptKit';
const unapplied = await (async () => {
  const kit = platform === 'android'
    ? await import('./core-kotlin.ts').then((k) => ({ index: k.kotlinKitIndex(k.KIT), sources: k.KIT }))
    : { index: kitIndex(KIT), sources: KIT };
  const guard = new PropertyGuard(checker, program, { ...kit, name: kitName, platform });
  const found = [...guard.templates(components, new Map(components.map((c) => [c.name, c.props])), componentSource), ...guard.stylesheets(sheets)];
  return found.map((u) => describe(u, kitName));
})();
if (unapplied.length && allowUnapplied) for (const u of unapplied) console.warn(`warning: ${u}`);
// iOS with --all-errors reports them with the translator's.
else if (unapplied.length && !(platform === 'ios' && args.includes('--all-errors'))) {
  console.error(unapplied.join('\n'));
  if (!args.includes('--keep-going')) throw new Error(`${unapplied.length} properties core declares that ${kitName} does not apply (--allow-unimplemented-properties or release.allowUnimplementedProperties builds anyway)`);
}
if (platform === 'android') {
  const { writeAndroid } = await import('./android.ts');
  const css = kitCss(sheets);
  await writeAndroid({ app, out: resolve(opt('--out', join(app, 'platforms', 'native-android'))!), name, framework: style, zone, components, modules, program, checker, files: sourceFiles, infos, css, root, routes: routing, lines: sourceLines, applicationId: opt('--bundle'), widgetsAar: opt('--widgets'), appDir, build: args.includes('--build'), bundle: args.includes('--aab') || args.includes('--device'), keyStore: keyStore(), plugins: plugins.all(), pluginFiles, reach, properties, compiledPlugins, resolved, mounted, corePatches: corePatchesAndroid(app, nodeModules(app)), allowUnapplied });
  process.exit(0);
}
// Before the translator: it reads the plugin modules' symbol tables and which typings declare them.
const packages = swiftPackages(app);
const deploymentTarget = iosDeploymentTarget(app);
const dependencies = iosDependencies({ app, packages, deploymentTarget, say });
const typings = program.getSourceFiles().filter((f) => f.isDeclarationFile).map((f) => f.fileName);
// What may declare the app's own Swift and the packages' modules: the app's declarations, and those of the plugins that add packages.
const owners = packages.flatMap((p) => (p.pluginDir ? [p.pluginDir + '/'] : []));
const nativeTypings = typings.filter((f) => !f.startsWith('/__shims__/') && (!f.includes('/node_modules/') || owners.some((d) => f.startsWith(d))));
const native = pluginNative(plugins.all(), out, {
  deps: dependencies, packages, declarations: typings, say,
  app: { module: name, src: join(appResourcesDir(app), 'iOS', 'src'), declarations: nativeTypings },
});
dependencies.dispose();
const translator = new Translator(checker, infos, sourceFiles, { pluginFiles, reach, properties });
translator.lines = sourceLines;
const located = (code: string) => (sourceLines ? sourceLines.swift(code) : code);
translator.appModule = name;
translator.plainFields = framework === 'angular';
// The app's own Swift classes (`App_Resources/iOS/src`) that TypeScript declares untyped (`declare const X: any`): objects calling them by NativeScript's names.
const appNative = native.appSwift ? nativeTable(name).classes : {};
translator.appNativeClasses = new Set(Object.keys(appNative).filter((c) => !appNative[c].extension && appNative[c].kind === 'class'));
translator.allowUnapplied = allowUnapplied;
if (args.includes('--all-errors')) translator.errors = allowUnapplied ? [] : [...unapplied];

rmSync(join(out, 'Sources'), { recursive: true, force: true });
mkdirSync(join(out, 'Sources'), { recursive: true });
const header = (from: string) => `// Compiled by ns-native from ${relative(app, from)}; edit that file, not this one.\nimport Foundation\nimport UIKit\nimport NativeScriptKit\n${native.modules.map((m) => `import ${m}\n`).join('')}${SDK_IMPORTS}\n`;
// A component's file declares more than the component (interfaces, constants): it is a module as well.
// The SDK frameworks beyond UIKit the program's code names (CoreSpotlight, SafariServices), imported by every file once all are known.
const SDK_IMPORTS = '// @sdk-imports\n';
const translated = translateModules(translator, program, [...modules, ...components.map((c) => c.file), ...compiledPlugins], resolved);
// Every component's members first: whether a constructor throws is known before any template creates the component.
const members = new Map<string, string>();
for (const c of components) {
  const cls = program.getSourceFile(c.file)!.statements.find(ts.isClassDeclaration)!;
  try {
    members.set(c.name, located(translator.componentMembers(cls, c.props).join('\n')));
  } catch (e) {
    if (!translator.errors) throw e;
    translator.errors.push(`${c.name}: ${(e as Error).message}`);
  }
  infos.get(c.name)!.initThrows = translator.initThrows(c.name);
}
for (const c of components) {
  const sf = program.getSourceFile(c.file)!;
  const cls = sf.statements.find(ts.isClassDeclaration)!;
  try {
    const lines = [`final class ${c.name} {`, members.get(c.name) ?? '', '', ...render(c, infos, (m) => translator.memberThrows(cls, m), style, { slots: mounted, rowSignals: mounted, zone, itemType: (m) => translator.memberElementType(cls, m) }), '}'];
    writeFileSync(join(out, 'Sources', c.name + '.swift'), header(c.file.replace(/\.ts$/, '')) + lines.join('\n') + '\n');
  } catch (e) {
    if (!translator.errors) throw e;
    translator.errors.push(`${c.name}: ${(e as Error).message}${process.env.NS_NATIVE_STACKS ? '\n' + (e as Error).stack?.split('\n').slice(1, 30).join('\n') : ''}`);
  }
}
if (translator.errors?.length) {
  console.error([...new Set(translator.errors)].join('\n'));
  if (!args.includes('--keep-going')) throw new Error(`${new Set(translator.errors).size} constructs the release build cannot translate yet`);
}
addInterfaces(translator, translated);
// File names differ in more than case: a module `app.tsx` beside a component `App` would overwrite it on a case-insensitive disk.
// A file named main.swift is Swift's top-level code, which the entry's `@main` rules out.
const taken = new Set([...components.map((c) => c.name.toLowerCase()), 'main']);
for (const m of translated) {
  if (!m.code.trim()) continue;
  let file = m.name;
  while (taken.has(file.toLowerCase())) file += '_module';
  taken.add(file.toLowerCase());
  writeFileSync(join(out, 'Sources', file + '.swift'), header(m.file) + located(m.code));
}
const shapes = SourceLines.strip(translator.shapesCode());
if (shapes) writeFileSync(join(out, 'Sources', '__Objects.swift'), `// Compiled by ns-native: the app's object literals without a declared type.\nimport Foundation\nimport NativeScriptKit\n${native.modules.length || /\bUI[A-Z]/.test(shapes) ? `import UIKit\n${native.modules.map((m) => `import ${m}\n`).join('')}` : ''}${SDK_IMPORTS}\n${shapes}\n`);
const inits = translated.filter((m) => m.init).map((m) => `        ${m.init}()\n`).join('');
// The app's CSS as its NativeScript build ships it: the AST core applies.
const css = kitAst(sheets);
const patched = corePatches(app, nodeModules(app));
if (patched?.patches.length) say(`${relative(app, patched.file)}: ${patched.patches.join(', ')}`);
if (routeTree) prelude = `        Router.shared.config = ${routeConfig(routeTree, '        ', translator.throwingInits)}\n`;
// Set before the module initializers run: they may make views.
const switches = (zone ? '        Zone.enabled = true\n' : '') + (patched?.patches ?? []).map((p) => `        CorePatches.${p} = true\n`).join('');
// Core's modules first, as the app's bundle evaluates @nativescript/core before its own code.
const start = switches + `        CorePackages.useAppConfig(appPackageJSON)\n        CoreModules.initialize()\n        Reactivity.schedule = .${SCHEDULE[framework]}\n` + (mounted
  // The entry's own statements run the app (`Application.run`), after every module it imports.
  ? `        NativeScriptApplication.cssAST = appCSS\n${inits}`
  : `${inits}${prelude}        NativeScriptApplication.run(cssAST: appCSS) { ${root}().render() }\n`);
if (translator.usedAppNative.size) writeFileSync(join(out, 'Sources', '__AppNative.swift'), `// Compiled by ns-native: the app's own Swift classes, called by name from untyped TypeScript.\nimport Foundation\nimport NativeScriptKit\n\n${appNativeObjects([...translator.usedAppNative].map((c) => appNative[c]))}`);
const sdkModules = translator.native.sdkModules().filter((m) => !['Foundation', 'UIKit', ...native.modules].includes(m));
for (const f of readdirSync(join(out, 'Sources'))) {
  const p = join(out, 'Sources', f);
  const text = readFileSync(p, 'utf8');
  if (text.includes(SDK_IMPORTS)) writeFileSync(p, text.replace(SDK_IMPORTS, sdkModules.map((m) => `import ${m}\n`).join('')));
}
// A kit type an imported SDK module also declares (`Progress`): the app's module resolves the name to the kit's.
const clashes = translator.native.kitClashes(translator.kitTypes());
if (clashes.length) writeFileSync(join(out, 'Sources', '__KitNames.swift'), `// Compiled by ns-native: the kit's types whose names the SDK also declares.\nimport NativeScriptKit\n\n${clashes.map((n) => `typealias ${n} = NativeScriptKit.${n}\n`).join('')}`);
// Core's modules the app reaches, listed for the kit to run: nothing else names the others, so the link leaves them out.
const appSwift = readdirSync(join(out, 'Sources')).filter((f) => f.endsWith('.swift') && f !== '__Entry.swift').map((f) => readFileSync(join(out, 'Sources', f), 'utf8')).join('\n');
const closedWorld = coreClosedWorld(join(kit, 'Sources', 'NativeScriptKit'), appSwift + start);
say(`core in this app: ${closedWorld.initializers.length} module initializers run, ${closedWorld.excluded.length} files left out`);
const entryStart = start.replace('        CoreModules.initialize()\n', `        CoreModules.initializers = [\n${closedWorld.initializers.map((i) => `            ${i},\n`).join('')}        ]\n        CoreModules.initialize()\n`);
writeFileSync(join(out, 'Sources', '__Entry.swift'), `// Compiled by ns-native: the app's entry and its CSS.\nimport NativeScriptKit\n\n@main\nenum ${name}App {\n    static func main() {\n${entryStart}    }\n}\n\nlet appCSS = """\n${css.replace(/\\/g, '\\\\').replace(/"""/g, '\\"""')}"""\n\n// What core reads as \`~/package.json\`.\nlet appPackageJSON = """\n${appPackageJSON(app).replace(/\\/g, '\\\\').replace(/"""/g, '\\"""')}\n"""\n`);
say(`${components.length} components and ${modules.length} modules from ${framework} compiled to Swift in ${Date.now() - started} ms → ${relative(process.cwd(), join(out, 'Sources'))}`);

// 4. The Xcode project. The kit is a static library target rather than its
// Swift package because package targets get none of the project's settings.
// Virtual function and witness method elimination with internalized public
// symbols let the link drop the kit's code and vtable entries the app never
// reaches; every Swift module in the link must be compiled with them and with
// full LTO. They are `-experimental-hermetic-seal-at-link` without
// `-conditional-runtime-records`, which keeps a class in the Objective-C class
// list only if its `CN` symbol is referenced, and code creating instances
// references the full metadata instead: the runtime then cannot find such a
// class from its metaclass, and `+[NSBundle bundleForClass:]`, which UIKit
// calls on the first responder, aborts.
const bundle = opt('--bundle', `org.nativescript.${name.toLowerCase()}.native`)!;
const pluginLines = xcodegenLines(native, out);
const kitSources = join(kit, 'Sources', 'NativeScriptKit');
const core = installedCore(app);
const coreModules = core ? coreNativeModules(core).map((m) => m.module) : [];
const excluded = [...kitFilesUnreached(kitSources, readdirSync(join(out, 'Sources')).map((f) => readFileSync(join(out, 'Sources', f), 'utf8')).join('\n'), coreModules, new Set(closedWorld.excluded)), ...closedWorld.excluded];
const coreNative = coreNativeProject(core ?? '', kitImports(kitSources, excluded, coreModules), out);
const profile = opt('--provision') ? findProfile(opt('--provision')!) : null;
const team = !profile && opt('--team-id') ? { id: opt('--team-id')!, method: opt('--export-method', 'debugging') as ExportMethod } : undefined;
const signing: Record<string, string> = profile ? signingSettings(profile) : team ? automaticSigningSettings(team.id) : { CODE_SIGNING_ALLOWED: 'NO' };
const pods = podfile({ app, name, deploymentTarget, nested: native.swift.map((t) => t.name), extensions: iosExtensionNames(app) });
if (pods) writeFileSync(join(out, 'Podfile'), pods);
else removePods(out, name);
const resources = iosProjectResources({ app, appDir, out, name, pods: !!pods, say });
const extensions = iosExtensions({ app, out, bundle, packages, signing, team: resources.team, say });
const appSettings = { PRODUCT_BUNDLE_IDENTIFIER: bundle, SWIFT_VERSION: '"5.9"', ...resources.settings, ...coreNative.settings, ...signing };
// Reflection metadata keeps every type's descriptor, and through it the type and all it calls, in the
// binary; the kit reflects only on tuples (Mirror of a tuple needs none), so a Release build has none.
// A framework the kit imports for code the app never reaches (WebKit for WebView, Photos for saving
// images) is left out of the link, and so not loaded at launch, by `-dead_strip_dylibs`.
// Virtual function and witness elimination hold only when every Swift module in the link is compiled
// for them: code from pods and packages, built without, would call methods they removed or thunks they need.
const wholeProgram = !pods && !packages.length && !pluginLines.packages;
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
${wholeProgram ? '      OTHER_SWIFT_FLAGS: -Xfrontend -enable-llvm-vfe -Xfrontend -enable-llvm-wme -Xfrontend -internalize-at-link\n' : ''}      DEAD_CODE_STRIPPING: YES
      OTHER_LDFLAGS: "$(inherited) -Wl,-dead_strip_dylibs"
      SWIFT_REFLECTION_METADATA_LEVEL: none
${pluginLines.packages || packages.length ? `packages:\n${pluginLines.packages}${packageLines(packages, out)}` : ''}targets:
  NativeScriptKit:
    type: library.static
    platform: iOS
    sources:
      - path: ${relative(out, kitSources)}
${excluded.length ? `        excludes: [${excluded.join(', ')}]\n` : ''}${coreNative.kitDependencies ? `    dependencies:\n${coreNative.kitDependencies}` : ''}    settings:
      base:
        SWIFT_VERSION: "5.9"
${Object.entries(coreNative.settings).map(([k, v]) => `        ${k}: ${v}\n`).join('')}${coreNative.targets}${pluginLines.targets}${extensions.targets}  ${name}:
    type: application
    platform: iOS
    sources:
      - path: Sources
${coreNative.appSources}${pluginLines.sources}${resources.sources}    dependencies:
      - target: NativeScriptKit
${coreNative.appDependencies}${pluginLines.dependencies}${productLines(packages)}${extensions.dependencies}${resources.configFiles ? `    configFiles:\n      Debug: ${resources.configFiles.Debug}\n      Release: ${resources.configFiles.Release}\n` : ''}    settings:
      base:
${Object.entries(appSettings).map(([k, v]) => `        ${k}: ${v}\n`).join('')}`);

// A project with pods is generated and integrated here, so a build of it (the NativeScript CLI's) only builds its workspace.
let project: string[] | null = null;
if (pods) {
  project = generateProject({ out, name, pods: true, mergeXcconfig: () => mergePodsXcconfig(out, name), say });
  writeFileSync(join(out, PROJECT_MARKER), JSON.stringify({ workspace: `${name}.xcworkspace` }) + '\n');
}
if (args.includes('--build')) {
  const { execFileSync } = await import('node:child_process');
  project ??= generateProject({ out, name, pods: false, mergeXcconfig: () => {}, say });
  if (args.includes('--device')) {
    const built = archive({ out, name, project, bundle, profile, extensionProfiles: extensions.profiles, team, say });
    say(`archived ${relative(process.cwd(), built.archive)}, ${relative(process.cwd(), built.ipa)}`);
  } else {
    execFileSync('xcodebuild', [...project, '-scheme', name, '-configuration', 'Release', '-destination', 'generic/platform=iOS Simulator', '-derivedDataPath', 'build', 'build', '-quiet'], { cwd: out, stdio: 'inherit' });
    say(`built ${relative(process.cwd(), out)}/build`);
  }
}

/**
 * The kit files importing a framework beyond Foundation and UIKit whose types
 * the app's Swift does not name: an app links what the kit imports, and a
 * linked framework is loaded at launch with everything it links (WebKit, some
 * fifty images) whether or not the app reaches the code that uses it.
 * Core's own native modules (`linked`) are part of the kit as Foundation is.
 */
function kitFilesUnreached(dir: string, appSwift: string, linked: string[], leftOut: ReadonlySet<string>): string[] {
  const names = new Set<string>();
  const read = (text: string) => { for (const m of text.matchAll(/\b[A-Za-z_]\w*\b/g)) names.add(m[0]); };
  read(appSwift);
  // A file importing only what every app links stays, and what it names is reached; the others stay when something that stays names one of their types.
  const pending: { path: string; text: string; types: string[] }[] = [];
  for (const f of readdirSync(dir, { recursive: true }) as string[]) {
    if (!f.endsWith('.swift') || leftOut.has(f)) continue;
    const text = readFileSync(join(dir, f), 'utf8');
    // Core's modules are one program: each one's initializer runs at launch, as core's index imports them all.
    if (f.startsWith('Core/') || [...text.matchAll(/^import (\w+)/gm)].every((m) => ['Foundation', 'UIKit', 'ObjectiveC', ...linked].includes(m[1]))) { read(text); continue; }
    pending.push({ path: f, text, types: [...text.matchAll(/^(?:(?:open|public|final)\s+)*(?:class|struct|enum|protocol)\s+(\w+)/gm)].map((m) => m[1]) });
  }
  for (let more = true; more; ) {
    more = false;
    for (let k = pending.length - 1; k >= 0; k--) {
      if (!pending[k].types.some((t) => names.has(t))) continue;
      read(pending[k].text);
      pending.splice(k, 1);
      more = true;
    }
  }
  return pending.map((p) => p.path).sort();
}

/**
 * Core as an app reaches it, from the kit manifest's graph. What runs: the modules declaring
 * what the app's Swift and the kit's own name (or name through a function core's index exports
 * or an object shape), and every module those evaluate first, as importing a module runs its
 * imports' top levels; their initializers, in the order core's index evaluates them. What is
 * compiled: those files and every file declaring a name they mention, which Swift needs whether
 * or not it runs; the others are left out of the kit's target, and with them the frameworks
 * only they use (WebKit with WebView).
 */
function coreClosedWorld(kitSources: string, appSwift: string): { initializers: string[]; excluded: string[] } {
  const coreDir = join(kitSources, 'Core');
  const manifest = join(coreDir, 'manifest.json');
  const graph: Record<string, { init?: string; imports: string[] }> | undefined = existsSync(manifest) ? JSON.parse(readFileSync(manifest, 'utf8')).graph : undefined;
  if (!graph) throw new Error(`${manifest} has no module graph: regenerate the kit from core (tools/native-kit/generate.mts)`);
  const files = readdirSync(coreDir).filter((f) => f.endsWith('.swift') && f !== '__Modules.swift');
  const text = new Map(files.map((f) => [f, readFileSync(join(coreDir, f), 'utf8')]));
  const words = (code: string) => new Set(code.match(/\b[A-Za-z_]\w*\b/g) ?? []);
  const declaring = new Map<string, string>();
  for (const [f, code] of text) for (const m of code.matchAll(/^(?:@\w+(?:\([^)]*\))?\s+)*(?:(?:open|public|final|indirect)\s+)*(?:class|struct|enum|protocol|func|typealias|let|var)\s+(\w+)/gm)) if (!declaring.has(m[1])) declaring.set(m[1], f);
  const named = (code: string) => [...words(code)].flatMap((w) => declaring.get(w) ?? []);
  let roots = named(appSwift);
  for (const f of readdirSync(kitSources, { recursive: true }) as string[]) if (f.endsWith('.swift') && !f.startsWith('Core/')) roots.push(...named(readFileSync(join(kitSources, f), 'utf8')));
  const running = new Set<string>();
  const seen = new Set<string>();
  const run = (f: string) => {
    if (seen.has(f)) return;
    seen.add(f);
    // A module runs, and so do its imports; an export or a shape runs nothing itself, only what it names.
    if (graph[f]) { running.add(f); graph[f].imports.forEach(run); } else named(text.get(f) ?? '').forEach(run);
  };
  roots.forEach(run);
  const compiled = new Set<string>();
  const compile = (f: string) => {
    if (compiled.has(f) || !text.has(f)) return;
    compiled.add(f);
    named(text.get(f)!).forEach(compile);
    graph[f]?.imports.forEach(compile);
  };
  [...roots, ...running].forEach(compile);
  return {
    initializers: Object.keys(graph).filter((f) => running.has(f) && graph[f].init).map((f) => graph[f].init!),
    excluded: files.filter((f) => !compiled.has(f)).map((f) => `Core/${f}`),
  };
}

/** The app's package.json as its bundle has it, or an empty object. */
function appPackageJSON(app: string): string {
  const file = join(app, 'package.json');
  return existsSync(file) ? readFileSync(file, 'utf8').trim() : '{}';
}

/** The modules among `modules` that the kit's files the app links import (core's own native code). */
function kitImports(dir: string, excluded: string[], modules: string[]): Set<string> {
  const found = new Set<string>();
  for (const f of readdirSync(dir, { recursive: true }) as string[]) {
    if (!f.endsWith('.swift') || excluded.includes(f)) continue;
    for (const m of readFileSync(join(dir, f), 'utf8').matchAll(/^import (\w+)/gm)) if (modules.includes(m[1])) found.add(m[1]);
  }
  return found;
}

/** A route tree as the kit's `RouteConfig`s. */
function routeConfig(routes: RouteNode[], indent: string, throwing: Set<string> = new Set()): string {
  const one = (r: RouteNode): string => {
    const named = [
      r.outlet ? `outlet: ${JSON.stringify(r.outlet)}` : '',
      r.redirectTo !== undefined ? `redirectTo: ${JSON.stringify(r.redirectTo)}` : '',
      r.full ? 'full: true' : '',
      r.children?.length ? `children: ${routeConfig(r.children, indent + '    ', throwing)}` : '',
    ].filter(Boolean);
    return `RouteConfig(${[JSON.stringify(r.path), ...named].join(', ')})${r.component ? ` { ${throwing.has(r.component) ? 'try! ' : ''}${r.component}().render() }` : ''}`;
  };
  return `[\n${routes.map((r) => `${indent}    ${one(r)}`).join(',\n')}\n${indent}]`;
}

/**
 * Tags registered for plugin views: `registerElement('Tag', () => Class)` in the app, and in the
 * Angular entry (`<package>/angular`) of a plugin the app imports, with the module each class is from.
 */
function registeredElements(sources: string[], modulesDir: string): Map<string, { name: string; from: string }> {
  const found = new Map<string, { name: string; from: string }>();
  const scan = (text: string, file: string | null) => {
    const imports = new Map<string, string>();
    for (const m of text.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g)) {
      for (const part of m[1].split(',')) {
        const [orig, alias] = part.trim().split(/\s+as\s+/);
        if (orig) imports.set((alias ?? orig).trim(), JSON.stringify([orig.trim(), m[2]]));
      }
    }
    for (const m of text.matchAll(/registerElement\(\s*['"](\w+)['"]\s*,\s*\(\)\s*=>\s*(\w+)\s*\)/g)) {
      const imported = imports.get(m[2]);
      if (!imported) continue;
      const [name, from] = JSON.parse(imported) as [string, string];
      // Core's own views are elements already.
      if (from === '@nativescript/core') continue;
      found.set(m[1], { name, from: from.startsWith('.') && file ? resolve(dirname(file), from) : from });
    }
  };
  for (const f of sources) {
    const text = readFileSync(f, 'utf8');
    scan(text, f);
    for (const m of text.matchAll(/from\s*['"]((?:@[\w.-]+\/)?[\w.-]+)\/angular['"]/g)) {
      const dir = join(modulesDir, m[1], 'angular');
      const entry = existsSync(dir) ? readdirSync(dir).flatMap((d) => (/^fesm/.test(d) ? readdirSync(join(dir, d)).filter((x) => x.endsWith('.mjs')).map((x) => join(dir, d, x)) : [])).sort().reverse()[0] : undefined;
      if (entry) scan(readFileSync(entry, 'utf8'), null);
    }
  }
  return found;
}

/** The TypeScript of each `<package>/angular` entry the app imports, from the plugin's source beside its main module. */
function angularLibraries(sources: string[], modulesDir: string, plugins: PluginSources): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const f of sources) {
    for (const m of readFileSync(f, 'utf8').matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]((?:@[\w.-]+\/)?[\w.-]+)\/angular['"]/g)) {
      const wanted = m[1].split(',').map((x) => x.trim().split(/\s+as\s+/)[0]).filter(Boolean);
      // A plugin the kit implements renders its elements itself: its Angular wrapper's components are not compiled.
      if (seen.has(m[2]) || KIT_PLUGINS.includes(m[2])) continue;
      seen.add(m[2]);
      const dir = join(modulesDir, m[2]);
      const main = ['index.ios.js', 'index.js'].map((x) => join(dir, x)).find(existsSync);
      if (!main) continue;
      plugins.get(dir);
      const mainSource = plugins.sourceOf(main);
      const angular = mainSource && join(dirname(mainSource), 'angular');
      // A wrapper written against Angular's view internals (ElementRef, ViewContainerRef) has no components of its own the build reads.
      if (!angular || !existsSync(angular)) continue;
      const components = new Map<string, string>();
      const walk = (d: string) => {
        for (const x of readdirSync(d)) {
          const p = join(d, x);
          if (statSync(p).isDirectory()) walk(p);
          else if (x.endsWith('.ts') && !x.endsWith('.d.ts') && !x.endsWith('.spec.ts')) {
            const name = /@Component\([\s\S]*?\}\)\s*export class (\w+)/.exec(readFileSync(p, 'utf8'))?.[1];
            if (name) components.set(name, p);
          }
        }
      };
      walk(angular);
      // The components the app imports and those their `imports` name, transitively, with the modules of their own they import.
      const queue = wanted.filter((w) => components.has(w));
      const taken = new Set<string>();
      const files = [...components.values()];
      while (queue.length) {
        const name = queue.pop()!;
        if (taken.has(name)) continue;
        taken.add(name);
        const file = components.get(name)!;
        out.push(file);
        const text = readFileSync(file, 'utf8');
        const imports = /imports:\s*\[([^\]]*)\]/.exec(text)?.[1] ?? '';
        for (const i of imports.split(',').map((x) => x.trim())) if (components.has(i)) queue.push(i);
        for (const m of text.matchAll(/from\s*['"](\.[^'"]+)['"]/g)) {
          const support = [resolve(dirname(file), m[1]) + '.ts', join(resolve(dirname(file), m[1]), 'index.ts')].find(existsSync);
          if (support && !files.includes(support) && !out.includes(support)) out.push(support);
          // A component the code itself uses (a dialog it opens).
          for (const [other, f] of components) if (f === support) queue.push(other);
        }
      }
    }
  }
  return out;
}

/** The Angular entry without the call that bootstraps the app, or null when that is all it does. */
function angularEntryModule(file: string, text: string): string | null {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const isBootstrap = (st: ts.Statement) => ts.isExpressionStatement(st) && ts.isCallExpression(st.expression)
    && /^(runNativeScriptAngularApp|platformNativeScript|platformNativeScriptDynamic|bootstrapApplication)\b/.test(st.expression.expression.getText());
  const rest = sf.statements.filter((st) => !ts.isImportDeclaration(st) && !isBootstrap(st));
  if (!rest.length) return null;
  let out = text;
  for (const st of [...sf.statements].filter(isBootstrap).reverse()) out = out.slice(0, st.getStart()) + out.slice(st.getStart(), st.getEnd()).replace(/[^\n]/g, ' ') + out.slice(st.getEnd());
  return out;
}

/** `const { A, B } = await import('./x')` as a destructuring of names imported from './x' (appended: imports hoist), positions kept. */
function staticImports(text: string): string {
  let n = 0;
  const added: string[] = [];
  const out = text.replace(/\{([\w\s,]+)\}(\s*=\s*)await\s+import\((\s*['"](\.[^'"]+)['"]\s*)\)/g, (whole, names: string, eq: string, arg: string, spec: string) => {
    const list = names.split(',').map((x) => x.trim()).filter(Boolean);
    const prefix = `__import${n++}_`;
    added.push(`import { ${list.map((x) => `${x} as ${prefix}${x}`).join(', ')} } from '${spec}';`);
    const value = `await Promise.resolve({ ${list.map((x) => `${x}: ${prefix}${x}`).join(', ')} })`;
    return `{${names}}${eq}${value}`.padEnd(whole.length, ' ');
  });
  return added.length ? out + '\n' + added.join('\n') + '\n' : text;
}

/**
 * A JavaScript object for each of the app's Swift classes that untyped code calls (`AppleWidgetUtils.getDataWithKey(key)`):
 * its static methods by NativeScript's names, arguments read as the Swift parameters take them, results boxed.
 */
function appNativeObjects(classes: NativeClass[]): string {
  const read = (type: string, code: string) => {
    const t = type.replace(/\?$/, '');
    const conv = t === 'String' ? `jsToString(${code})` : t === 'Bool' ? `jsTruthy(${code})` : t === 'Double' ? `jsToNumber(${code})` : /^(Int|Int32|Int64|UInt|CGFloat|Float)$/.test(t) ? `${t}(jsToNumber(${code}))`
      : t === 'NSDictionary' || t === '[AnyHashable : Any]' ? `(jsToNativeDictionary(${code}) as NSDictionary)` : `(jsToNative(${code}) as! ${t})`;
    return type.endsWith('?') ? `(jsIsNullish(${code}) ? nil : ${conv})` : conv;
  };
  return classes.map((c) => {
    const methods = Object.entries(c.static).filter(([, m]) => m.kind === 'method') as [string, NativeMethod][];
    const cases = methods.map(([js, m]) => {
      const args = m.params.map((p, k) => `${m.labels[k] ? `${m.labels[k]}: ` : ''}${read(p, `jsArg(__a, ${k})`)}`).join(', ');
      const call = `${c.swift}.${m.swift}(${args})`;
      return `        case ${JSON.stringify(js)}: return { (__a: [Any?]) throws -> Any? in ${m.returns === 'Void' ? `${call}; return nil` : `return ${call}`} }`;
    });
    return `final class __AppNative_${c.swift}: JSDynamic {
    static let shared = __AppNative_${c.swift}()
    var jsKeys: [String] { [] }
    var jsClassName: String? { ${JSON.stringify(c.swift)} }
    subscript(jsKey key: String) -> Any? {
        get {
            switch key {
${cases.join('\n')}
            default: return nil
            }
        }
        set {}
    }
}
`;
  }).join('\n');
}
