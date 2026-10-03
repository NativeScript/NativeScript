#!/usr/bin/env node
// ns-native: a NativeScript app written with a web framework, compiled to a
// native app with no JavaScript runtime.
//   node compiler/src/cli.ts <app folder> --out <dir> [--name RecipesVue] [--build] [--device]
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
import { createProgram } from './program.ts';
import { Translator, type ComponentInfo } from './swift.ts';
import { render } from './codegen.ts';

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

const files: string[] = [];
const walk = (d: string) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else files.push(p); } };
walk(appDir);
const entry = join(app, pkg.main ?? 'app/app.ts');
const deps = { ...pkg.dependencies };
const framework = deps['nativescript-vue'] ? 'vue' : deps['@nativescript/angular'] ? 'angular' : deps['@nativescript-community/svelte-native'] ? 'svelte' : null;
if (!framework) throw new Error('no supported framework in package.json');
const entryText = readFileSync(entry, 'utf8');
const sources = files.filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts') && f !== entry && !/polyfills\.ts$/.test(f));

// 1. Each component through its framework's front end; 2. the component the app starts with.
const started = Date.now();
let components: ComponentIR[];
let modules: string[];
let root: string;
let prelude = '';
if (framework === 'vue') {
  components = files.filter((f) => f.endsWith('.vue')).map((f) => vueComponent(f, readFileSync(f, 'utf8')));
  modules = sources;
  const rootImport = /createApp\(\s*(\w+)\s*\)/.exec(entryText)?.[1];
  const rootFile = rootImport && new RegExp(`import\\s+${rootImport}\\s+from\\s+['"]([^'"]+)['"]`).exec(entryText)?.[1];
  if (!rootFile) throw new Error(`${entry}: no createApp(Component)`);
  root = basename(rootFile, '.vue');
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
  root = /bootstrapApplication\(\s*(\w+)/.exec(entryText)?.[1] ?? '';
  if (!root) throw new Error(`${entry}: no bootstrapApplication(Component)`);
  prelude = `        Router.shared.routes = [${routes.map((r) => `Route(${JSON.stringify(r.path)}) { ${r.component}().render() }`).join(', ')}]\n        Router.shared.initial = ${JSON.stringify(initial)}\n`;
}

// 3. Type-check everything as one program, then translate.
const virtual = new Map(components.map((c) => [c.file, c.source]));
const { checker, program } = createProgram(modules, virtual);
const infos = new Map<string, ComponentInfo & { outputs?: string[] }>(components.map((c) => [c.name, { name: c.name, props: c.props, outputs: c.outputs }]));
const translator = new Translator(checker, infos);

rmSync(join(out, 'Sources'), { recursive: true, force: true });
mkdirSync(join(out, 'Sources'), { recursive: true });
const header = (from: string) => `// Compiled by ns-native from ${relative(app, from)}; edit that file, not this one.\nimport Foundation\nimport NativeScriptKit\n\n`;
for (const m of modules) {
  const sf = program.getSourceFile(m)!;
  writeFileSync(join(out, 'Sources', basename(m, '.ts') + '.swift'), header(m) + translator.module(sf));
}
for (const c of components) {
  const sf = program.getSourceFile(c.file)!;
  const cls = sf.statements.find(ts.isClassDeclaration)!;
  const lines = [`final class ${c.name} {`, ...translator.componentMembers(cls, c.props), '', ...render(c, infos), '}'];
  writeFileSync(join(out, 'Sources', c.name + '.swift'), header(c.file.replace(/\.ts$/, '')) + lines.join('\n') + '\n');
}
const css = files.filter((f) => f.endsWith('.css')).map((f) => readFileSync(f, 'utf8')).join('\n');
writeFileSync(join(out, 'Sources', '__Entry.swift'), `// Compiled by ns-native: the app's entry and its CSS.\nimport NativeScriptKit\n\n@main\nenum ${name}App {\n    static func main() {\n${prelude}        NativeScriptApplication.run(css: appCSS) { ${root}().render() }\n    }\n}\n\nlet appCSS = """\n${css.replace(/\\/g, '\\\\').replace(/"""/g, '\\"""')}"""\n`);
say(`${components.length} components and ${modules.length} modules from ${framework} compiled to Swift in ${Date.now() - started} ms → ${relative(process.cwd(), join(out, 'Sources'))}`);

// 4. The Xcode project.
const bundle = opt('--bundle', `org.nativescript.${name.toLowerCase()}.native`)!;
writeFileSync(join(out, 'project.yml'), `name: ${name}
options:
  bundleIdPrefix: org.nativescript
  deploymentTarget:
    iOS: "17.0"
packages:
  NativeScriptKit:
    path: ${relative(out, kit)}
targets:
  ${name}:
    type: application
    platform: iOS
    sources: [Sources]
    dependencies:
      - package: NativeScriptKit
    settings:
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
