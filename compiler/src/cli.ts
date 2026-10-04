#!/usr/bin/env node
// ns-native: a NativeScript app written with a web framework, compiled to a
// native app with no JavaScript runtime.
//   node compiler/src/cli.ts <app folder> --out <dir> [--name RecipesVue] [--bundle <id>] [--build] [--device [--provision <profile>]]
//   node compiler/src/cli.ts <app folder> --platform android --out <dir> [--bundle <id>] [--build [--aab] [--key-store-path <file> --key-store-password <p> --key-store-alias <a> --key-store-alias-password <p>]] [--widgets <aar>]
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
import { reactComponent, reactScreens, zustandStore } from './react.ts';
import { solidComponent, solidRoutes, solidStore } from './solid.ts';
import { octaneApp } from './octane.ts';
import { createProgram, nodeModules } from './program.ts';
import { corePatches } from './core-patches.ts';
import { Translator, type ComponentInfo } from './swift.ts';
import { render } from './codegen.ts';
import { addInterfaces, translateModules } from './modules.ts';
import { appStylesheets, importedStylesheets, kitCss } from './css.ts';
import { PluginSources, configuredOverrides } from './plugins/source.ts';
import { pluginNative, xcodegenLines } from './plugins/native.ts';
import { reachability } from './reach.ts';
import { collectProperties } from './properties.ts';
import { iosProjectResources } from './app-resources.ts';
import { SourceLines } from './source-lines.ts';
import { archive, findProfile, signingSettings } from './ios-signing.ts';

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
  components = sources.map((f) => angularComponent(f, readFileSync(f, 'utf8'), selectors)).filter((c): c is NonNullable<typeof c> => !!c);
  for (const c of components) c.page = routes.some((r) => r.component === c.name);
  modules = sources.filter((f) => f !== routesFile && !components.some((c) => c.file === f.replace(/\.ts$/, '.release.ts')));
  routing = { routes, initial };
  root = /bootstrapApplication\(\s*(\w+)/.exec(entryText)?.[1] ?? '';
  if (!root) throw new Error(`${entry}: no bootstrapApplication(Component)`);
  prelude = `        Router.shared.routes = [${routes.map((r) => `Route(${JSON.stringify(r.path)}) { ${r.component}().render() }`).join(', ')}]\n        Router.shared.initial = ${JSON.stringify(initial)}\n`;
}

// 3. Type-check everything as one program, then translate.
const virtual = new Map([...components.map((c) => [c.file, c.source] as [string, string]), ...overrides]);
// Plugins: compiled from their TypeScript source; on iOS their native code is linked as a local Swift package.
const plugins = new PluginSources({ app, platform, overrides: configuredOverrides(app), say });
const { checker, program, files: sourceFiles, pluginFiles, resolved } = createProgram(modules, virtual, platform, undefined, plugins);
const infos = new Map<string, ComponentInfo & { outputs?: string[]; optional?: string[]; passed?: boolean }>(components.map((c) => [c.name, { name: c.name, props: c.props, outputs: c.outputs, optional: c.optional, passed: c.passed }]));
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
if (platform === 'android') {
  const { writeAndroid } = await import('./android.ts');
  const css = kitCss(appStylesheets(app, 'android', importedStylesheets(entry, appDir)));
  await writeAndroid({ app, out: resolve(opt('--out', join(app, 'platforms', 'native-android'))!), name, framework, components, modules, program, checker, files: sourceFiles, infos, css, root, routes: routing, lines: sourceLines, applicationId: opt('--bundle'), widgetsAar: opt('--widgets'), appDir, build: args.includes('--build'), bundle: args.includes('--aab') || args.includes('--device'), keyStore: keyStore() });
  process.exit(0);
}
// Before the translator: it reads the plugin modules' symbol tables and which typings declare them.
const native = pluginNative(plugins.all(), out);
const translator = new Translator(checker, infos, sourceFiles, { pluginFiles, reach, properties });
translator.lines = sourceLines;
const located = (code: string) => (sourceLines ? sourceLines.swift(code) : code);

rmSync(join(out, 'Sources'), { recursive: true, force: true });
mkdirSync(join(out, 'Sources'), { recursive: true });
const header = (from: string) => `// Compiled by ns-native from ${relative(app, from)}; edit that file, not this one.\nimport Foundation\nimport UIKit\nimport NativeScriptKit\n${native.modules.map((m) => `import ${m}\n`).join('')}\n`;
const translated = translateModules(translator, program, [...modules, ...compiledPlugins], resolved);
for (const c of components) {
  const sf = program.getSourceFile(c.file)!;
  const cls = sf.statements.find(ts.isClassDeclaration)!;
  const lines = [`final class ${c.name} {`, located(translator.componentMembers(cls, c.props).join('\n')), '', ...render(c, infos, (m) => translator.memberThrows(cls, m), framework, { slots: mounted, rowSignals: mounted }), '}'];
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
  writeFileSync(join(out, 'Sources', file + '.swift'), header(m.file) + located(m.code));
}
const shapes = SourceLines.strip(translator.shapesCode());
if (shapes) writeFileSync(join(out, 'Sources', '__Objects.swift'), `// Compiled by ns-native: the app's object literals without a declared type.\nimport Foundation\nimport NativeScriptKit\n${native.modules.length || /\bUI[A-Z]/.test(shapes) ? `import UIKit\n${native.modules.map((m) => `import ${m}\n`).join('')}` : ''}\n${shapes}\n`);
const inits = translated.filter((m) => m.init).map((m) => `        ${m.init}()\n`).join('');
const css = kitCss(appStylesheets(app, 'ios', importedStylesheets(entry, appDir)));
const patched = corePatches(app, nodeModules(app));
if (patched?.patches.length) say(`${relative(app, patched.file)}: ${patched.patches.join(', ')}`);
// Set before the module initializers run: they may make views.
const switches = (patched?.patches ?? []).map((p) => `        CorePatches.${p} = true\n`).join('');
const start = switches + (mounted
  // The entry's own statements run the app (`Application.run`), after every module it imports.
  ? `        NativeScriptApplication.css = appCSS\n        Reactivity.scheduled = true\n${inits}`
  : `${inits}${prelude}        NativeScriptApplication.run(css: appCSS) { ${root}().render() }\n`);
writeFileSync(join(out, 'Sources', '__Entry.swift'), `// Compiled by ns-native: the app's entry and its CSS.\nimport NativeScriptKit\n\n@main\nenum ${name}App {\n    static func main() {\n${start}    }\n}\n\nlet appCSS = """\n${css.replace(/\\/g, '\\\\').replace(/"""/g, '\\"""')}"""\n`);
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
const excluded = kitFilesUnreached(kitSources, readdirSync(join(out, 'Sources')).map((f) => readFileSync(join(out, 'Sources', f), 'utf8')).join('\n'));
const resources = iosProjectResources({ app, appDir, out, name, say });
if (opt('--team-id') && !opt('--provision')) throw new Error('--team-id alone would sign automatically, which registers the app on the team; give the provisioning profile with --provision');
const profile = opt('--provision') ? findProfile(opt('--provision')!) : null;
const appSettings = { PRODUCT_BUNDLE_IDENTIFIER: bundle, SWIFT_VERSION: '"5.9"', ...resources.settings, ...(profile ? signingSettings(profile) : { CODE_SIGNING_ALLOWED: 'NO' }) };
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
      OTHER_SWIFT_FLAGS: -Xfrontend -enable-llvm-vfe -Xfrontend -enable-llvm-wme -Xfrontend -internalize-at-link
      DEAD_CODE_STRIPPING: YES
${pluginLines.packages ? `packages:\n${pluginLines.packages}` : ''}targets:
  NativeScriptKit:
    type: library.static
    platform: iOS
    sources:
      - path: ${relative(out, kitSources)}
${excluded.length ? `        excludes: [${excluded.join(', ')}]\n` : ''}    settings:
      base:
        SWIFT_VERSION: "5.9"
${pluginLines.targets}  ${name}:
    type: application
    platform: iOS
    sources:
      - path: Sources
${resources.sources}    dependencies:
      - target: NativeScriptKit
${pluginLines.dependencies}${resources.configFile ? `    configFiles:\n      Debug: ${resources.configFile}\n      Release: ${resources.configFile}\n` : ''}    settings:
      base:
${Object.entries(appSettings).map(([k, v]) => `        ${k}: ${v}\n`).join('')}`);

if (args.includes('--build')) {
  const { execFileSync } = await import('node:child_process');
  execFileSync('xcodegen', ['generate', '--quiet'], { cwd: out, stdio: 'inherit' });
  if (args.includes('--device')) {
    const built = archive({ out, name, bundle, profile, say });
    say(`archived ${relative(process.cwd(), built.archive)}, ${relative(process.cwd(), built.ipa)}`);
  } else {
    execFileSync('xcodebuild', ['-project', `${name}.xcodeproj`, '-scheme', name, '-configuration', 'Release', '-destination', 'generic/platform=iOS Simulator', '-derivedDataPath', 'build', 'build', '-quiet'], { cwd: out, stdio: 'inherit' });
    say(`built ${relative(process.cwd(), out)}/build`);
  }
}

/**
 * The kit files importing a framework beyond Foundation and UIKit whose types
 * the app's Swift does not name: an app links what the kit imports, and a
 * linked framework is loaded at launch with everything it links (WebKit, some
 * fifty images) whether or not the app reaches the code that uses it.
 */
function kitFilesUnreached(dir: string, appSwift: string): string[] {
  const unreached: string[] = [];
  const visit = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) { visit(p); continue; }
      if (!f.endsWith('.swift')) continue;
      const text = readFileSync(p, 'utf8');
      if ([...text.matchAll(/^import (\w+)/gm)].every((m) => ['Foundation', 'UIKit', 'ObjectiveC'].includes(m[1]))) continue;
      const types = [...text.matchAll(/^(?:(?:open|public|final)\s+)*(?:class|struct|enum|protocol)\s+(\w+)/gm)].map((m) => m[1]);
      if (!types.some((t) => new RegExp(`\\b${t}\\b`).test(appSwift))) unreached.push(relative(dir, p));
    }
  };
  visit(dir);
  return unreached;
}
