// App_Resources and project settings, applied to the generated projects the
// way the NativeScript CLI applies them to platforms/ios and platforms/android
// (ios-project-service, ios-entitlements-service, xcconfig-service,
// android-project-service and the runtime's app/build.gradle).
import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';
import { mergePlist, readPlist, writePlist, type PlistDict } from './plist.ts';
import { productLines, type SwiftPackage } from './ios-dependencies.ts';
import { KIT_PLUGINS } from './core.ts';

/** The literal values of nativescript.config.ts's exported object; anything computed is left out. */
export function readConfig(app: string): Record<string, unknown> {
  const file = ['nativescript.config.ts', 'nativescript.config.js'].map((f) => join(app, f)).find(existsSync);
  if (!file) return {};
  const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const value = (e: ts.Expression): unknown => {
    if (ts.isAsExpression(e) || ts.isSatisfiesExpression(e) || ts.isParenthesizedExpression(e)) return value(e.expression);
    if (ts.isStringLiteralLike(e)) return e.text;
    if (ts.isNumericLiteral(e)) return Number(e.text);
    if (e.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (e.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (ts.isArrayLiteralExpression(e)) return e.elements.map(value);
    if (ts.isObjectLiteralExpression(e)) {
      const out: Record<string, unknown> = {};
      for (const p of e.properties) if (ts.isPropertyAssignment(p)) out[p.name.getText().replace(/^['"]|['"]$/g, '')] = value(p.initializer);
      return out;
    }
    return undefined;
  };
  for (const st of sf.statements) if (ts.isExportAssignment(st)) return (value(st.expression) as Record<string, unknown>) ?? {};
  return {};
}

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

/**
 * The config's `release` (`compiled` and the compiler's options) with `<platform>.release` merged over it;
 * object values such as `pluginReplacements` merge by key.
 */
export function releaseOptions(app: string, platform: 'ios' | 'android'): Record<string, unknown> {
  const config = readConfig(app);
  const own = isObject(config[platform]) ? (config[platform] as Record<string, unknown>).release : undefined;
  const out: Record<string, unknown> = { ...(isObject(config.release) ? config.release : {}) };
  for (const [key, v] of Object.entries(isObject(own) ? own : {})) out[key] = isObject(v) && isObject(out[key]) ? { ...out[key], ...v } : v;
  return out;
}

/**
 * `release.pluginReplacements`: packages the native build replaces with a TypeScript module of
 * the app's (a stand-in for a plugin whose job has no meaning without the JavaScript runtime), resolved paths.
 */
export function pluginReplacements(app: string, platform: 'ios' | 'android'): Record<string, string> {
  const replacements = releaseOptions(app, platform).pluginReplacements as Record<string, string> | undefined;
  return Object.fromEntries(Object.entries(replacements ?? {}).map(([name, file]) => [name, resolve(app, file)]));
}

export function appResourcesDir(app: string): string {
  return resolve(app, (readConfig(app).appResourcesPath as string | undefined) ?? 'App_Resources');
}

/**
 * The CLI's `getAllProductionPlugins`: the packages the app's production
 * dependencies bring in, transitively, that declare `nativescript` in their
 * package.json, in the order the dependency tree reaches them.
 */
export function productionPlugins(app: string, platform: 'ios' | 'android'): { name: string; dir: string }[] {
  const out: { name: string; dir: string }[] = [];
  const seen = new Set<string>();
  const replaced = pluginReplacements(app, platform);
  const queue: { from: string; deps: Record<string, string> }[] = [{ from: app, deps: JSON.parse(readFileSync(join(app, 'package.json'), 'utf8')).dependencies ?? {} }];
  while (queue.length) {
    const { from, deps } = queue.shift()!;
    for (const name of Object.keys(deps)) {
      // A plugin the kit implements, or the app replaces, brings none of its native pieces, nor its own dependencies' (canvas's font manager).
      if (KIT_PLUGINS.includes(name) || replaced[name]) continue;
      const dir = locatePackage(from, name);
      if (!dir || seen.has(dir)) continue;
      seen.add(dir);
      const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
      if (pkg.nativescript) out.push({ name, dir });
      queue.push({ from: dir, deps: pkg.dependencies ?? {} });
    }
  }
  return out;
}

function locatePackage(from: string, name: string): string | null {
  for (let dir = from; ; dir = dirname(dir)) {
    const candidate = join(dir, 'node_modules', name);
    if (existsSync(join(candidate, 'package.json'))) return candidate;
    if (dirname(dir) === dir) return null;
  }
}

// ---------------------------------------------------------------- iOS

/** What the app target of project.yml takes from App_Resources/iOS. */
export interface IOSProjectResources {
  /** `settings.base` entries for the app target. */
  settings: Record<string, string>;
  /** The target's base configuration file per configuration (relative to the project), if any. */
  configFiles: { Debug: string; Release: string } | null;
  /** Entries for the target's `sources:` list, as YAML lines. */
  sources: string;
  /** The team build.xcconfig signs with. */
  team?: string;
}

/** Entries of App_Resources/iOS the CLI does not copy into the bundle, or copies there though nothing reads them. */
const NOT_RESOURCES = new Set(['Info.plist', 'Podfile', 'src', 'extensions', 'watchapp', 'watchextension', 'build.xcconfig', 'app.entitlements']);
/** Directories that are resources as a whole rather than folders of resources. */
const BUNDLE_LIKE = /\.(xcassets|lproj|bundle|scnassets|xcstrings|storyboardc)$/;
/** NativeScriptKit's iOS version; an app target cannot import it with a lower deployment target. */
const KIT_DEPLOYMENT_TARGET = 17;

/** build.xcconfig, the app's first, so a plugin cannot override a setting the app chose. */
function mergedXcconfig(app: string): XcconfigEntry[] {
  const plugins = productionPlugins(app, 'ios').map((p) => join(p.dir, 'platforms', 'ios'));
  const xcconfigs = [join(appResourcesDir(app), 'iOS', 'build.xcconfig'), ...plugins.map((p) => join(p, 'build.xcconfig'))].filter(existsSync);
  let merged: XcconfigEntry[] = [];
  for (const file of xcconfigs) merged = mergeXcconfig(merged, parseXcconfig(file));
  return merged;
}

/** The iOS version the app targets: build.xcconfig's, unless it is older than the kit's. */
export function iosDeploymentTarget(app: string): string {
  const set = mergedXcconfig(app).find((e) => e.kind === 'setting' && e.key === 'IPHONEOS_DEPLOYMENT_TARGET');
  return set && set.kind === 'setting' && parseFloat(set.value) > KIT_DEPLOYMENT_TARGET ? set.value.replace(/"/g, '') : `${KIT_DEPLOYMENT_TARGET}.0`;
}

/**
 * The scene manifest NativeScript's app template declares: UIKit stops an app built with the current SDK that adopts no
 * scene life cycle, and core's own scene delegate takes the session.
 */
const SCENE_MANIFEST: PlistDict = { UIApplicationPreferredDefaultSceneSessionRole: 'UIWindowSceneSessionRoleApplication', UIApplicationSupportsMultipleScenes: false };

export function iosProjectResources(o: { app: string; appDir: string; out: string; name: string; pods: boolean; say: (m: string) => void }): IOSProjectResources {
  const res = join(appResourcesDir(o.app), 'iOS');
  const plugins = productionPlugins(o.app, 'ios').map((p) => join(p.dir, 'platforms', 'ios'));
  const settings: Record<string, string> = {};
  const sources: string[] = [];

  // Info.plist: each plugin's, then the app's, then the bundle id from the build setting.
  const appPlist = join(res, 'Info.plist');
  if (existsSync(appPlist)) {
    let plist: PlistDict = {};
    for (const file of [...plugins.map((p) => join(p, 'Info.plist')), appPlist]) if (existsSync(file)) plist = mergePlist(plist, readPlist(file));
    plist = mergePlist(plist, { CFBundleIdentifier: '$(PRODUCT_BUNDLE_IDENTIFIER)' });
    if (!plist.UIApplicationSceneManifest) {
      o.say(`${relative(o.app, appPlist)} declares no UIApplicationSceneManifest: the template's is added, as an app built with the current SDK must adopt scenes`);
      plist.UIApplicationSceneManifest = SCENE_MANIFEST;
    }
    writeFileSync(join(o.out, 'Info.plist'), writePlist(plist));
    settings.INFOPLIST_FILE = 'Info.plist';
  } else {
    // No App_Resources Info.plist: Xcode writes one from the build settings, into this one, which adopts scenes.
    writeFileSync(join(o.out, 'Info.plist'), writePlist({ UIApplicationSceneManifest: SCENE_MANIFEST }));
    Object.assign(settings, {
      INFOPLIST_FILE: 'Info.plist',
      GENERATE_INFOPLIST_FILE: 'YES',
      INFOPLIST_KEY_UILaunchScreen_Generation: 'YES',
      INFOPLIST_KEY_UISupportedInterfaceOrientations: 'UIInterfaceOrientationPortrait',
      INFOPLIST_KEY_CFBundleDisplayName: o.name,
    });
  }

  const merged = mergedXcconfig(o.app);
  const configured = (key: string) => merged.find((e) => e.kind === 'setting' && e.key.replace(/\[.*$/, '') === key);

  // app.entitlements: the plugins', then the app's.
  const entitlementFiles = [...plugins.map((p) => join(p, 'app.entitlements')), join(res, 'app.entitlements')].filter(existsSync);
  rmSync(join(o.out, `${o.name}.entitlements`), { force: true });
  if (entitlementFiles.length) {
    let entitlements: PlistDict = {};
    for (const file of entitlementFiles) entitlements = mergePlist(entitlements, readPlist(file));
    writeFileSync(join(o.out, `${o.name}.entitlements`), writePlist(entitlements));
    if (!configured('CODE_SIGN_ENTITLEMENTS')) settings.CODE_SIGN_ENTITLEMENTS = `${o.name}.entitlements`;
  }

  if (merged.length) writeFileSync(join(o.out, 'build.xcconfig'), writeXcconfig(merged));
  else rmSync(join(o.out, 'build.xcconfig'), { force: true });
  // With pods, the app target's configuration is the pods' merged with build.xcconfig (`mergePodsXcconfig`) once `pod install` has written theirs.
  for (const c of ['debug', 'release']) {
    if (o.pods) writeFileSync(join(o.out, `build.${c}.xcconfig`), merged.length ? writeXcconfig(merged) : '');
    else rmSync(join(o.out, `build.${c}.xcconfig`), { force: true });
  }
  // The runtime template's default, which an app's build.xcconfig overrides.
  if (!configured('TARGETED_DEVICE_FAMILY')) settings.TARGETED_DEVICE_FAMILY = '"1,2"';
  const target = configured('IPHONEOS_DEPLOYMENT_TARGET');
  if (target && target.kind === 'setting' && parseFloat(target.value) < KIT_DEPLOYMENT_TARGET) {
    o.say(`App_Resources/iOS/build.xcconfig: IPHONEOS_DEPLOYMENT_TARGET ${target.value} raised to ${KIT_DEPLOYMENT_TARGET}.0, the oldest iOS the native build runs on`);
    settings.IPHONEOS_DEPLOYMENT_TARGET = `"${KIT_DEPLOYMENT_TARGET}.0"`;
  }

  // Everything else in App_Resources/iOS is copied into the bundle, as the CLI copies it to platforms/ios/<name>/Resources.
  const staged = join(o.out, 'Resources');
  rmSync(staged, { recursive: true, force: true });
  const entries = existsSync(res) ? readdirSync(res).filter((f) => !NOT_RESOURCES.has(f) && !f.startsWith('.')) : [];
  if (entries.length) {
    mkdirSync(staged, { recursive: true });
    const folders: string[] = [];
    for (const f of entries) {
      cpSync(join(res, f), join(staged, f), { recursive: true });
      if (statSync(join(res, f)).isDirectory() && !BUNDLE_LIKE.test(f)) folders.push(f);
    }
    sources.push(`      - path: Resources\n        buildPhase: resources\n${folders.length ? `        excludes: [${folders.map((f) => JSON.stringify(f + '/**')).join(', ')}]\n` : ''}`);
    for (const f of folders) sources.push(`      - path: Resources/${f}\n        type: folder\n        buildPhase: resources\n`);
  }
  // What the app's own build copies beside its bundle, at `app/` where `~/assets/logo.png` resolves, and
  // its fonts, at `app/fonts/` where core registers them at launch.
  const appFiles = join(o.out, 'AppFiles');
  rmSync(appFiles, { recursive: true, force: true });
  const files = copiedAppFiles(o.appDir, readConfig(o.app).bundler === 'vite');
  for (const f of files) {
    mkdirSync(dirname(join(appFiles, 'app', f)), { recursive: true });
    copyFileSync(join(o.appDir, f), join(appFiles, 'app', f));
  }
  if (files.length) sources.push(`      - path: AppFiles/app\n        type: folder\n        buildPhase: resources\n`);

  const team = configured('DEVELOPMENT_TEAM');
  return {
    settings,
    configFiles: o.pods ? { Debug: 'build.debug.xcconfig', Release: 'build.release.xcconfig' } : merged.length ? { Debug: 'build.xcconfig', Release: 'build.xcconfig' } : null,
    sources: sources.join(''),
    team: team?.kind === 'setting' ? team.value : undefined,
  };
}

/**
 * `mergePodXcconfigFile`: each configuration's pods xcconfig, with
 * build.xcconfig merged into it, as the app target's configuration file.
 */
export function mergePodsXcconfig(out: string, name: string) {
  const own = existsSync(join(out, 'build.xcconfig')) ? parseXcconfig(join(out, 'build.xcconfig')) : [];
  for (const c of ['debug', 'release']) {
    const pods = join(out, 'Pods', 'Target Support Files', `Pods-${name}`, `Pods-${name}.${c}.xcconfig`);
    writeFileSync(join(out, `build.${c}.xcconfig`), writeXcconfig(mergeXcconfig(existsSync(pods) ? parseXcconfig(pods) : [], own)));
  }
}

const writeXcconfig = (entries: XcconfigEntry[]) => entries.map((e) => (e.kind === 'include' ? e.line : `${e.key} = ${e.value}`)).join('\n') + '\n';

/**
 * App_Resources/iOS/extensions/<name>/: an app extension target per folder,
 * as `IOSExtensionsService` adds it: its sources, `<app id>.<name>`, its
 * Info.plist, extension.json's frameworks and build settings (both
 * configurations', then the named one's), the Swift packages that name it,
 * the app's signing, and embedded in the app. An extension is a link of its
 * own, built without the app's dead code settings.
 */
export function iosExtensions(o: { app: string; out: string; bundle: string; packages: SwiftPackage[]; signing: Record<string, string>; team?: string; say: (m: string) => void }): { targets: string; dependencies: string; profiles: Record<string, string> } {
  const dir = join(appResourcesDir(o.app), 'iOS', 'extensions');
  const names = iosExtensionNames(o.app);
  for (const p of o.packages) for (const t of p.targets) if (!names.includes(t)) o.say(`the Swift package ${p.name} names a target ${t} the app does not have`);
  const provisioning = existsSync(join(dir, 'provisioning.json')) ? JSON.parse(readFileSync(join(dir, 'provisioning.json'), 'utf8')) as Record<string, string> : {};
  const profiles: Record<string, string> = {};
  const targets = names.map((name) => {
    const ext = join(dir, name);
    const json = existsSync(join(ext, 'extension.json')) ? JSON.parse(readFileSync(join(ext, 'extension.json'), 'utf8')) : {};
    const bundle = `${o.bundle}.${name}`;
    const rel = relative(o.out, ext);
    // Paths in extension.json are relative to the CLI's platforms/ios.
    const path = (v: unknown) => {
      if (typeof v !== 'string' || v.startsWith('/') || v.startsWith('$')) return v;
      const from = [resolve(o.app, 'platforms', 'ios', v), resolve(ext, v)].find(existsSync);
      return from ? relative(o.out, from) : v;
    };
    const values = (props: Record<string, unknown> | undefined) => Object.fromEntries(Object.entries(props ?? {}).map(([k, v]) => [k, /^(CODE_SIGN_ENTITLEMENTS|INFOPLIST_FILE)$/.test(k) ? path(pbxValue(v)) : pbxValue(v)]));
    const signing = { ...o.signing };
    if (signing.PROVISIONING_PROFILE_SPECIFIER) {
      delete signing.PROVISIONING_PROFILE_SPECIFIER;
      if (provisioning[bundle]) signing.PROVISIONING_PROFILE_SPECIFIER = profiles[bundle] = provisioning[bundle];
    }
    const base: Record<string, unknown> = {
      PRODUCT_BUNDLE_IDENTIFIER: bundle,
      PRODUCT_NAME: name,
      ...(existsSync(join(ext, 'Info.plist')) ? { INFOPLIST_FILE: join(rel, 'Info.plist') } : {}),
      LD_RUNPATH_SEARCH_PATHS: '$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks',
      SKIP_INSTALL: 'YES',
      SWIFT_LTO: 'NO',
      OTHER_SWIFT_FLAGS: '',
      ...(o.team ? { DEVELOPMENT_TEAM: o.team } : {}),
      ...signing,
      ...(json.assetcatalogCompilerAppiconName ? { ASSETCATALOG_COMPILER_APPICON_NAME: json.assetcatalogCompilerAppiconName } : {}),
      ...values(json.targetBuildConfigurationProperties),
    };
    const named = json.targetNamedBuildConfigurationProperties ?? {};
    const configs = (['Debug', 'Release'] as const).map((c) => [c, values(named[c.toLowerCase()])] as const).filter(([, v]) => Object.keys(v).length);
    const settings = (entries: Record<string, unknown>, indent: string) => Object.entries(entries).map(([k, v]) => `${indent}${k}: ${yamlValue(v)}\n`).join('');
    const deps = [...((json.frameworks ?? []) as string[]).map((f) => `      - sdk: ${f}\n`), productLines(o.packages.filter((p) => p.targets.includes(name)))].join('');
    return `  ${name}:
    type: app-extension
    platform: iOS
    sources:
      - path: ${JSON.stringify(rel)}
        excludes: ["extension.json", "Info.plist", "*.entitlements", "Podfile"]
${deps ? `    dependencies:\n${deps}` : ''}    settings:
      base:
${settings(base, '        ')}${configs.length ? `      configs:\n${configs.map(([c, v]) => `        ${c}:\n${settings(v, '          ')}`).join('')}` : ''}`;
  }).join('');
  return { targets, dependencies: names.map((n) => `      - target: ${n}\n        embed: true\n`).join(''), profiles };
}

export function iosExtensionNames(app: string): string[] {
  const dir = join(appResourcesDir(app), 'iOS', 'extensions');
  return existsSync(dir) ? readdirSync(dir).filter((f) => !f.startsWith('.') && statSync(join(dir, f)).isDirectory()).sort() : [];
}

/** A value as the CLI writes it into the pbxproj: `"\"-O\""` is `-O`, `"(\"DEBUG=1\",\"$(inherited)\",)"` a list. */
function pbxValue(v: unknown): unknown {
  if (typeof v !== 'string') return v;
  const t = v.trim();
  const list = /^\(([\s\S]*)\)$/.exec(t);
  if (list) return [...list[1].matchAll(/"((?:[^"\\]|\\.)*)"|([^\s,"]+)/g)].map((m) => (m[1] !== undefined ? m[1].replace(/\\(.)/g, '$1') : m[2]));
  return /^"[\s\S]*"$/.test(t) ? t.slice(1, -1).replace(/\\(.)/g, '$1') : v;
}

const yamlValue = (v: unknown): string => (Array.isArray(v) ? `[${v.map((x) => JSON.stringify(String(x))).join(', ')}]` : JSON.stringify(String(v)));

type XcconfigEntry = { kind: 'include'; line: string } | { kind: 'setting'; key: string; value: string };

function parseXcconfig(file: string): XcconfigEntry[] {
  const out: XcconfigEntry[] = [];
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    const line = raw.replace(/\/\/.*$/, '').trim();
    if (!line) continue;
    const include = /^#include(\??)\s+"([^"]+)"/.exec(line);
    if (include) { out.push({ kind: 'include', line: `#include${include[1]} "${resolve(dirname(file), include[2])}"` }); continue; }
    const m = /^([A-Za-z_][\w]*(?:\[[^\]]*\])*)\s*=\s*(.*?);?$/.exec(line);
    if (m) out.push({ kind: 'setting', key: m[1], value: m[2].trim() });
  }
  return out;
}

const INHERITED = /\$[({]inherited[)}]/;

/** `XcconfigService.mergeFiles`: a key already set wins, unless its value inherits, in which case the incoming value is appended. */
function mergeXcconfig(into: XcconfigEntry[], from: XcconfigEntry[]): XcconfigEntry[] {
  const out = into.map((e) => ({ ...e }));
  for (const e of from) {
    if (e.kind === 'include') { if (!out.some((x) => x.kind === 'include' && x.line === e.line)) out.push(e); continue; }
    const kept = out.find((x): x is Extract<XcconfigEntry, { kind: 'setting' }> => x.kind === 'setting' && x.key === e.key);
    if (!kept) { out.push({ ...e }); continue; }
    if (INHERITED.test(kept.value)) {
      const appended = e.value.replace(INHERITED, '').trim();
      if (appended) kept.value = `${kept.value} ${appended}`;
    }
  }
  return out;
}

// ---------------------------------------------------------------- Android

/**
 * App_Resources/Android/src/main/AndroidManifest.xml for the native app: the
 * CLI's `__PACKAGE__` substitution, the runtime's activity as the app's
 * MainActivity, and the runtime's application class and error activity left
 * out (the native app has neither). The package attribute goes: the Gradle
 * project's namespace replaces it.
 */
export function androidManifest(o: { app: string; applicationId: string; activity: string; application?: string }): string | null {
  const file = join(appResourcesDir(o.app), 'Android', 'src', 'main', 'AndroidManifest.xml');
  if (!existsSync(file)) return null;
  let xml = readFileSync(file, 'utf8').replace(/__PACKAGE__/g, o.applicationId);
  xml = xml.replace(/(<manifest\b[^>]*?)\s+package="[^"]*"/, '$1');
  xml = xml.replace(/<activity\b[^>]*android:name="com\.tns\.ErrorReportActivity"[^>]*?(\/>|>[\s\S]*?<\/activity>)\s*/g, '');
  xml = xml.replace(/android:name="com\.tns\.NativeScriptActivity"/g, `android:name="${o.activity}"`);
  xml = xml.replace(/(<application\b[^>]*?)\s+android:name="com\.tns\.NativeScriptApplication"/, '$1');
  const custom = /<application\b[^>]*?android:name="([^"]+)"/.exec(xml);
  if (custom) throw new Error(`${relative(o.app, file)}: the application class ${custom[1]} extends the JavaScript runtime's; a native release has none`);
  // The kit compiled from core starts the app from an application class of the app's, and core's own activity shows it.
  if (o.application) xml = xml.replace(/<application\b/, `<application android:name="${o.application}"`);
  const runtime = /android:name="(com\.tns\.[\w.]+)"/.exec(xml.replaceAll(`android:name="${o.activity}"`, ''));
  if (runtime) throw new Error(`${relative(o.app, file)}: ${runtime[1]} is part of the JavaScript runtime; a native release has none`);
  return xml;
}

/**
 * The production plugins' `platforms/android/AndroidManifest.xml`, prepared for
 * the manifest merger as the CLI's plugin build prepares them (package
 * attribute removed, `__PACKAGE__` substituted), written under `dir`; those in
 * `except` are left to the build that links them.
 */
export function pluginManifests(o: { app: string; applicationId: string; dir: string; except?: Set<string> }): string[] {
  rmSync(o.dir, { recursive: true, force: true });
  const out: string[] = [];
  for (const p of productionPlugins(o.app, 'android')) {
    if (o.except?.has(p.name)) continue;
    const file = join(p.dir, 'platforms', 'android', 'AndroidManifest.xml');
    if (!existsSync(file)) continue;
    const xml = readFileSync(file, 'utf8').replace(/__PACKAGE__/g, o.applicationId).replace(/(<manifest\b[^>]*?)\s+package="[^"]*"/, '$1');
    if (!/<(uses-|permission|application|queries|supports-|compatible-|instrumentation)/.test(xml)) continue;
    const to = join(o.dir, p.name.replace(/^@/, '').replace(/\//g, '_'), 'AndroidManifest.xml');
    mkdirSync(dirname(to), { recursive: true });
    writeFileSync(to, xml);
    out.push(to);
  }
  return out;
}

/**
 * The app folder's files its NativeScript build copies as they are: `assets/**` and the fonts by both
 * bundlers, and every other `.jpg` and `.png` too by webpack's default copy rules.
 */
function copiedAppFiles(appDir: string, vite: boolean): string[] {
  if (!existsSync(appDir)) return [];
  return (readdirSync(appDir, { recursive: true }) as string[])
    .map((f) => f.split('\\').join('/'))
    .filter((f) => !/(^|\/)(node_modules|App_Resources|\.[^/]+)(\/|$)/.test(f) && statSync(join(appDir, f)).isFile())
    .filter((f) => f.startsWith('assets/') || (f.startsWith('fonts/') && /\.(ttf|otf)$/i.test(f)) || (!vite && !f.startsWith('fonts/') && /\.(jpg|png)$/.test(f)))
    .sort();
}

/** Fonts in the app folder, as assets at `app/fonts/`, where core reads them. */
export function copyAndroidFonts(appDir: string, assets: string): boolean {
  const fonts = join(appDir, 'fonts');
  if (!existsSync(fonts) || !statSync(fonts).isDirectory()) return false;
  const to = join(assets, 'app', 'fonts');
  mkdirSync(to, { recursive: true });
  for (const f of readdirSync(fonts)) if (/\.(ttf|otf)$/i.test(f)) copyFileSync(join(fonts, f), join(to, f));
  return true;
}
