// Runs an app's stylesheets through its own NativeScript build's CSS pipeline
// and writes what that build hands core: each stylesheet's PostCSS output and
// its rework-css AST. It runs in a process of its own, started as the
// NativeScript CLI starts the bundler: the project as cwd, the CLI's env flags
// in argv and the same env data in NATIVESCRIPT_BUNDLER_ENV.
//   node css-worker.ts <out.json> <nativescript-cli-lib.js> <ios|android> [<imported stylesheet> ...]
// webpack: the app's webpack config is resolved, each stylesheet's loaders are
// matched by webpack's rule compiler and run by its loader runner, through
// css2json-loader. vite: the app's vite config is resolved for a production
// build and app.css takes @nativescript/vite's own steps (the platform @import
// rewrite, Vite's preprocessCSS, rework-css's parse).
import fs, { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [outFile, cliLib, platform, ...stylesheets] = process.argv.slice(2);
/** Components' stylesheets, by path: they have no file of their own. */
const componentCss: Record<string, string> = process.env.NS_NATIVE_COMPONENT_CSS ? JSON.parse(readFileSync(process.env.NS_NATIVE_COMPONENT_CSS, 'utf8')) : {};
const app = process.cwd();
const appRequire = createRequire(join(app, 'package.json'));

// The CLI's BundlerCompilerService.buildEnvData and buildEnvCommandLineParams for a release build.
const project = createRequire(cliLib)(cliLib).projectDataService.getProjectData(app);
const env: Record<string, unknown> = {
  [platform]: true,
  appId: project.projectIdentifiers[platform],
  appPath: project.getAppDirectoryRelativePath(),
  appResourcesPath: project.getAppResourcesRelativeDirectoryPath(),
  buildPath: project.getBuildRelativeDirectoryPath(),
  nativescriptLibPath: cliLib,
  verbose: false,
  production: true,
  config: process.env.NATIVESCRIPT_CONFIG_NAME ?? 'false',
};
process.env.NATIVESCRIPT_CONFIG_NAME = env.config as string;
const flags = Object.entries(env).filter(([, v]) => v !== false && v !== undefined).map(([k, v]) => (v === true ? `--env.${k}` : `--env.${k}=${v}`));
process.env.NATIVESCRIPT_WEBPACK_ENV = process.env.NATIVESCRIPT_BUNDLER_ENV = JSON.stringify(env);

/** The folder holding the package.json of the package `file` belongs to. */
function packageDir(file: string): string {
  for (let dir = dirname(file); dir !== dirname(dir); dir = dirname(dir)) if (fs.existsSync(join(dir, 'package.json'))) return dir;
  throw new Error(`${file}: no package.json above it`);
}

type Sheet = { file: string; css: string; ast: unknown };

async function webpackSheets(configPath: string): Promise<Sheet[]> {
  const fromNsWebpack = createRequire(appRequire.resolve('@nativescript/webpack/package.json'));
  const { parseEnvFlags } = fromNsWebpack('./dist/cli/parseEnvFlags');
  const config = appRequire(configPath)(parseEnvFlags(flags));
  const fromWebpack = createRequire(fromNsWebpack.resolve('webpack/package.json'));
  const rule = (name: string) => fromWebpack(`./lib/rules/${name}`);
  const Matcher = rule('BasicMatcherRulePlugin');
  const Effect = rule('BasicEffectRulePlugin');
  // NormalModuleFactory's rule compiler, without the matchers for import attributes and globs.
  const ruleSet = new (rule('RuleSetCompiler'))([
    new Matcher('test', 'resource'), new Matcher('scheme'), new Matcher('mimetype'), new Matcher('dependency'),
    new Matcher('include', 'resource'), new Matcher('exclude', 'resource', true), new Matcher('resource'),
    new Matcher('resourceQuery'), new Matcher('resourceFragment'), new Matcher('realResource'), new Matcher('issuer'),
    new Matcher('compiler'), new Matcher('issuerLayer'), new (rule('ObjectMatcherRulePlugin'))('descriptionData'),
    new Matcher('descriptionRelativePath'), new Effect('type'), new Effect('sideEffects'), new Effect('parser'),
    new Effect('resolve'), new Effect('generator'), new Effect('layer'), new (rule('UseEffectRulePlugin'))(),
  ]).compile([{ rules: config.module?.rules ?? [] }]);
  const { runLoaders } = (() => { try { return fromWebpack('./lib/loaders/LoaderRunner'); } catch { return fromWebpack('loader-runner'); } })();
  const loaderDirs: string[] = config.resolveLoader?.modules ?? ['node_modules'];
  const resolveLoader = (name: string) => {
    for (const dir of loaderDirs) {
      try { return dir.startsWith('/') ? createRequire(join(dir, 'index.js')).resolve(join(dir, name)) : appRequire.resolve(name); } catch {}
    }
    throw new Error(`loader ${name} not found in ${loaderDirs.join(', ')}`);
  };
  const descriptionData = JSON.parse(readFileSync(join(app, 'package.json'), 'utf8'));
  // `this.getResolve(options)`, which sass-loader resolves `@import`s with: webpack's resolver, given the build's options and the loader's.
  const { ResolverFactory, CachedInputFileSystem } = fromWebpack('enhanced-resolve');
  const files = new CachedInputFileSystem(fs, 4000);
  const getResolve = (options: object) => {
    const resolver = ResolverFactory.createResolver({ fileSystem: files, ...config.resolve, ...options });
    return (from: string, request: string, callback?: (e: Error | null, r?: string) => void) => {
      const found = new Promise<string>((ok, no) => resolver.resolve({}, from, request, {}, (e: Error | null, r?: string | false) => (e || !r ? no(e ?? new Error(`${request} not found from ${from}`)) : ok(r))));
      if (!callback) return found;
      found.then((r) => callback(null, r), (e) => callback(e));
    };
  };
  const run = (resource: string, loaders: { loader: string; options?: unknown }[], content?: string) =>
    new Promise<string>((done, fail) => {
      const context = {
        webpack: true, version: 2, mode: config.mode, target: config.target, sourceMap: false, hot: false, fs,
        rootContext: config.context ?? app,
        getOptions(this: { query: unknown }) { return typeof this.query === 'object' && this.query ? this.query : {}; },
        emitWarning: (e: Error) => console.error(`[css] ${resource}: ${e?.message ?? e}`),
        emitError: (e: Error) => console.error(`[css] ${resource}: ${e?.message ?? e}`),
        getLogger: () => console, getResolve,
        addBuildDependency() {}, addMissingDependency() {}, emitFile() {},
      };
      runLoaders({
        resource, context,
        loaders: loaders.map((l) => ({ loader: resolveLoader(l.loader), options: l.options })),
        processResource: (ctx: { addDependency(p: string): void }, path: string, cb: (e: Error | null, b?: Buffer) => void) => {
          ctx.addDependency(path);
          cb(null, content !== undefined ? Buffer.from(content) : readFileSync(path));
        },
      }, (error: Error | null, result: { result?: (string | Buffer)[] }) => (error ? fail(error) : done(String(result.result![0]))));
    });
  // app-css-loader: `./app` next to the entry, platform variants and Sass first.
  const entryDir = fromNsWebpack('./dist').Utils.platform.getEntryDirPath();
  const global = [`.${platform}.scss`, `.${platform}.css`, '.scss', '.css'].map((ext) => join(entryDir, 'app' + ext)).find((f) => fs.existsSync(f));
  const sheets: Sheet[] = [];
  for (const file of [...(global ? [global] : []), ...stylesheets.filter((f) => f !== global)]) {
    const effects = ruleSet.exec({ resource: file, realResource: file, resourceQuery: '', resourceFragment: '', scheme: '', mimetype: '', dependency: 'esm', descriptionData, issuer: '', compiler: undefined, issuerLayer: '' });
    const post: any[] = [], normal: any[] = [], pre: any[] = [];
    for (const e of effects) if (e.type === 'use') (e.enforce === 'post' ? post : e.enforce === 'pre' ? pre : normal).push(e.value);
    const chain = [...post, ...normal, ...pre];
    const json = chain.findIndex((l) => /(^|[\\/])css2json-loader([\\/]|$)/.test(l.loader));
    // A component's stylesheet its framework reads as text (Angular's raw-loader), which core parses when the component adds it.
    const asText = json < 0 && file in componentCss;
    if (json < 0 && !asText) throw new Error(`${file}: its loaders (${chain.map((l) => l.loader).join(', ')}) do not include css2json-loader`);
    const toJson = asText ? { loader: fromNsWebpack.resolve('./dist/loaders/css2json-loader') } : chain[json];
    const css = await run(file, asText ? chain.filter((l) => !/(^|[\\/])raw-loader([\\/]|$)/.test(l.loader)) : chain.slice(json + 1), componentCss[file]);
    const module = await run(file, [toJson], css);
    const [imports, exported] = module.split('const ___CSS2JSON_LOADER_EXPORT___ = ');
    if (/\brequire\(/.test(imports)) throw new Error(`${file}: an @import the build loads as a stylesheet of its own`);
    sheets.push({ file, css, ast: JSON.parse(exported.slice(0, exported.indexOf('\n'))) });
  }
  return sheets;
}

async function viteSheets(configPath: string): Promise<Sheet[]> {
  process.argv.splice(2, process.argv.length, '--mode=production', '--', ...flags);
  const vite = await import(pathToFileURL(appRequire.resolve('vite')).href);
  const nsVite = packageDir(appRequire.resolve('@nativescript/vite'));
  const helper = (name: string) => import(pathToFileURL(join(nsVite, 'helpers', name)).href);
  const { resolveProjectGlobalCssPath } = await helper('utils.js');
  const { rewritePlatformCssImports } = await helper('css-platform-plugin.js');
  const { parse } = createRequire(join(nsVite, 'package.json'))('css');
  const config = await vite.resolveConfig({ configFile: configPath, mode: 'production' }, 'build', 'production', 'production');
  defines = Object.fromEntries(Object.entries(config.define ?? {}).filter(([k, v]) => /^[\w$.]+$/.test(k) && typeof v === 'string'));
  const appCss: string | null = resolveProjectGlobalCssPath(app);
  const imported = stylesheets.filter((f) => f !== appCss && !(f in componentCss));
  if (imported.length) throw new Error(`${imported.join(', ')}: stylesheets imported from modules are not read for vite apps yet`);
  const sheet = async (file: string, raw: string): Promise<Sheet> => {
    const code = rewritePlatformCssImports(raw, dirname(file), platform) ?? raw;
    const result = await vite.preprocessCSS(code, file, config);
    const ast = JSON.parse(JSON.stringify(parse(result.code, { silent: true }), (key, value) => (key === 'position' ? undefined : value)));
    return { file, css: result.code, ast };
  };
  const sheets: Sheet[] = appCss ? [await sheet(appCss, readFileSync(appCss, 'utf8'))] : [];
  for (const f of stylesheets) if (f in componentCss) sheets.push(await sheet(f, componentCss[f]));
  return sheets;
}

/** The bundler's compile-time replacements (vite's `define`), as source text by the expression they replace. */
let defines: Record<string, string> = {};
const sheets = project.bundler === 'vite' ? await viteSheets(project.bundlerConfigPath) : await webpackSheets(project.bundlerConfigPath);
writeFileSync(outFile, JSON.stringify({ sheets, defines }));
process.exit(0);
