// App_Resources and project settings, applied to the generated projects the
// way the NativeScript CLI applies them to platforms/ios and platforms/android
// (ios-project-service, ios-entitlements-service, xcconfig-service,
// android-project-service and the runtime's app/build.gradle).
import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';
import { mergePlist, readPlist, writePlist, type PlistDict } from './plist.ts';

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

export function appResourcesDir(app: string): string {
  return resolve(app, (readConfig(app).appResourcesPath as string | undefined) ?? 'App_Resources');
}

/**
 * The CLI's `getAllProductionPlugins`: the packages the app's production
 * dependencies bring in, transitively, that declare `nativescript` in their
 * package.json, in the order the dependency tree reaches them.
 */
export function productionPlugins(app: string): { name: string; dir: string }[] {
  const out: { name: string; dir: string }[] = [];
  const seen = new Set<string>();
  const queue: { from: string; deps: Record<string, string> }[] = [{ from: app, deps: JSON.parse(readFileSync(join(app, 'package.json'), 'utf8')).dependencies ?? {} }];
  while (queue.length) {
    const { from, deps } = queue.shift()!;
    for (const name of Object.keys(deps)) {
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
  /** The target's base configuration file (relative to the project), if any. */
  configFile: string | null;
  /** Entries for the target's `sources:` list, as YAML lines. */
  sources: string;
}

/** Entries of App_Resources/iOS the CLI does not copy into the bundle, or copies there though nothing reads them. */
const NOT_RESOURCES = new Set(['Info.plist', 'Podfile', 'src', 'extensions', 'watchapp', 'watchextension', 'build.xcconfig', 'app.entitlements']);
/** Directories that are resources as a whole rather than folders of resources. */
const BUNDLE_LIKE = /\.(xcassets|lproj|bundle|scnassets|xcstrings|storyboardc)$/;
/** NativeScriptKit's iOS version; an app target cannot import it with a lower deployment target. */
const KIT_DEPLOYMENT_TARGET = 17;

export function iosProjectResources(o: { app: string; appDir: string; out: string; name: string; say: (m: string) => void }): IOSProjectResources {
  const res = join(appResourcesDir(o.app), 'iOS');
  const plugins = productionPlugins(o.app).map((p) => join(p.dir, 'platforms', 'ios'));
  const settings: Record<string, string> = {};
  const sources: string[] = [];

  // Info.plist: each plugin's, then the app's, then the bundle id from the build setting.
  const appPlist = join(res, 'Info.plist');
  if (existsSync(appPlist)) {
    let plist: PlistDict = {};
    for (const file of [...plugins.map((p) => join(p, 'Info.plist')), appPlist]) if (existsSync(file)) plist = mergePlist(plist, readPlist(file));
    plist = mergePlist(plist, { CFBundleIdentifier: '$(PRODUCT_BUNDLE_IDENTIFIER)' });
    writeFileSync(join(o.out, 'Info.plist'), writePlist(plist));
    settings.INFOPLIST_FILE = 'Info.plist';
  } else {
    // No App_Resources Info.plist: Xcode writes one from the build settings.
    Object.assign(settings, {
      GENERATE_INFOPLIST_FILE: 'YES',
      INFOPLIST_KEY_UILaunchScreen_Generation: 'YES',
      INFOPLIST_KEY_UISupportedInterfaceOrientations: 'UIInterfaceOrientationPortrait',
      INFOPLIST_KEY_CFBundleDisplayName: o.name,
    });
  }

  // build.xcconfig: the app's first, so a plugin cannot override a setting the app chose.
  const xcconfigs = [join(res, 'build.xcconfig'), ...plugins.map((p) => join(p, 'build.xcconfig'))].filter(existsSync);
  let merged: XcconfigEntry[] = [];
  for (const file of xcconfigs) merged = mergeXcconfig(merged, parseXcconfig(file));
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

  if (merged.length) {
    writeFileSync(join(o.out, 'build.xcconfig'), merged.map((e) => (e.kind === 'include' ? e.line : `${e.key} = ${e.value}`)).join('\n') + '\n');
  } else rmSync(join(o.out, 'build.xcconfig'), { force: true });
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
  // Fonts in the app folder, registered at launch as core registers app/fonts.
  const fonts = join(o.appDir, 'fonts');
  if (existsSync(fonts) && statSync(fonts).isDirectory()) sources.push(`      - path: ${relative(o.out, fonts)}\n        type: folder\n        buildPhase: resources\n`);

  return { settings, configFile: merged.length ? 'build.xcconfig' : null, sources: sources.join('') };
}

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
export function androidManifest(o: { app: string; applicationId: string; activity: string }): string | null {
  const file = join(appResourcesDir(o.app), 'Android', 'src', 'main', 'AndroidManifest.xml');
  if (!existsSync(file)) return null;
  let xml = readFileSync(file, 'utf8').replace(/__PACKAGE__/g, o.applicationId);
  xml = xml.replace(/(<manifest\b[^>]*?)\s+package="[^"]*"/, '$1');
  xml = xml.replace(/<activity\b[^>]*android:name="com\.tns\.ErrorReportActivity"[^>]*?(\/>|>[\s\S]*?<\/activity>)\s*/g, '');
  xml = xml.replace(/android:name="com\.tns\.NativeScriptActivity"/g, `android:name="${o.activity}"`);
  xml = xml.replace(/(<application\b[^>]*?)\s+android:name="com\.tns\.NativeScriptApplication"/, '$1');
  const custom = /<application\b[^>]*?android:name="([^"]+)"/.exec(xml);
  if (custom) throw new Error(`${relative(o.app, file)}: the application class ${custom[1]} extends the JavaScript runtime's; a native release has none`);
  const runtime = /android:name="(com\.tns\.[\w.]+)"/.exec(xml);
  if (runtime) throw new Error(`${relative(o.app, file)}: ${runtime[1]} is part of the JavaScript runtime; a native release has none`);
  return xml;
}

/**
 * The production plugins' `platforms/android/AndroidManifest.xml`, prepared for
 * the manifest merger as the CLI's plugin build prepares them (package
 * attribute removed, `__PACKAGE__` substituted), written under `dir`.
 */
export function pluginManifests(o: { app: string; applicationId: string; dir: string }): string[] {
  rmSync(o.dir, { recursive: true, force: true });
  const out: string[] = [];
  for (const p of productionPlugins(o.app)) {
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

/** Fonts in the app folder, as assets at `app/fonts/`, where core reads them. */
export function copyAndroidFonts(appDir: string, assets: string): boolean {
  const fonts = join(appDir, 'fonts');
  if (!existsSync(fonts) || !statSync(fonts).isDirectory()) return false;
  const to = join(assets, 'app', 'fonts');
  mkdirSync(to, { recursive: true });
  for (const f of readdirSync(fonts)) if (/\.(ttf|otf)$/i.test(f)) copyFileSync(join(fonts, f), join(to, f));
  return true;
}
