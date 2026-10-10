// The Android target: the app's components and modules as Kotlin against
// NativeScriptKit for Android (native-release/kit-android), in a Gradle
// project whose resources are the app's own App_Resources/Android.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';
import type { ComponentIR } from './ir.ts';
import { Translator, kotlinString } from './kotlin.ts';
import type { RouteNode } from './angular.ts';
import { ndk, prepareBindingArchives, type AndroidBinding } from './bindings-android.ts';
import { render } from './codegen-kotlin.ts';
import { SCHEDULE, type Framework } from './codegen.ts';
import { addKotlinInterfaces, translateKotlinModules } from './kotlin-modules.ts';
import { CoreKotlin } from './core-kotlin.ts';
import { AndroidNativeAPI, androidClassPath } from './native-calls-android.ts';
import { pluginNativeAndroid } from './plugins/native-android.ts';
import type { PluginSource } from './plugins/source.ts';
import type { Reach } from './reach.ts';
import type { Properties } from './properties.ts';
import { SourceLines } from './source-lines.ts';
import { androidManifest, appResourcesDir, copyAndroidFonts, pluginManifests } from './app-resources.ts';
import { KIT_ANDROID } from './paths.ts';

export interface AndroidBuild {
  app: string;
  out: string;
  name: string;
  framework: string;
  /** Angular checked by zone.js. */
  zone?: boolean;
  components: ComponentIR[];
  modules: string[];
  program: ts.Program;
  checker: ts.TypeChecker;
  /** The app's files and the components' virtual files, in translation order. */
  files: readonly ts.SourceFile[];
  infos: Map<string, { name: string; props: string[]; outputs?: string[]; outputFields?: Record<string, string> }>;
  css: string;
  root: string;
  routes: { routes: { path: string; component: string }[]; initial: string } | null;
  /** Angular's route tree (outlets, children, redirects), where the app configures one. */
  routeTree?: RouteNode[] | null;
  /** Source lines for the Kotlin, written as `source-lines.json` for `retrace.ts`; null leaves them out. */
  lines: SourceLines | null;
  applicationId?: string;
  widgetsAar?: string;
  /** The app folder: its fonts become assets. */
  appDir: string;
  build: boolean;
  /** Build an app bundle (.aab) beside the APK. */
  bundle?: boolean;
  /** The release keystore (`--key-store-path`, `--key-store-password`, `--key-store-alias`, `--key-store-alias-password`). */
  keyStore?: { path: string; password: string; alias: string; aliasPassword: string };
  /** The plugins the app imports: their Android code is built and linked. */
  plugins?: PluginSource[];
  /** The plugins' source files, what of them the app reaches, and the properties they register. */
  pluginFiles?: string[];
  reach?: Reach;
  properties?: Properties;
  /** The plugin modules translated with the app. */
  compiledPlugins?: string[];
  resolved?: (containing: string, specifier: string) => string | undefined;
  /** The app mounts its own roots (Octane's `renderNativeScriptApp` in the entry): the entry is a module that runs the app. */
  mounted?: boolean;
  /** Kit switches the app's patch of core turns on. */
  corePatches?: string[];
  /** `--allow-unimplemented-properties`. */
  allowUnapplied?: boolean;
  /** `--all-errors`: every construct the translator cannot handle, instead of the first. */
  allErrors?: boolean;
  /** The app's own configuration leaves strict checking off. */
  lenient?: boolean;
  /** The kit's bindings of plugins the app uses (bindings-android.ts). */
  bindings?: AndroidBinding[];
  /**
   * `--generated-kit`: the kit compiled from core (`-PgeneratedKit`). Core's own activity runs the app, which the app's
   * `android.app.Application` starts, as NativeScript's runtime does, with the stylesheet as its build parses it.
   */
  generatedKit?: boolean;
  /** The app's stylesheet as css2json-loader's AST, which core loads as `app.css` in the generated kit. */
  cssAST?: string;
}

/** A route tree as the kit's `RouteConfig`s. */
function kotlinRouteConfig(routes: RouteNode[], indent: string): string {
  const one = (r: RouteNode): string => {
    const named = [
      r.outlet ? `outlet = ${kotlinString(r.outlet)}` : '',
      r.redirectTo !== undefined ? `redirectTo = ${kotlinString(r.redirectTo)}` : '',
      r.full ? 'full = true' : '',
      r.children?.length ? `children = ${kotlinRouteConfig(r.children, indent + '    ')}` : '',
    ].filter(Boolean);
    return `RouteConfig(${[kotlinString(r.path), ...named].join(', ')})${r.component ? ` { ${r.component}().render() }` : ''}`;
  };
  return `listOf(\n${routes.map((r) => `${indent}    ${one(r)}`).join(',\n')}\n${indent})`;
}

/** `packaging { … }` from what the plugins' include.gradle files exclude and pick first: native libraries under jniLibs, the rest resources. */
function packagingBlock(p: { excludes: string[]; pickFirsts: string[] }): string {
  const so = (f: string) => f.endsWith('.so');
  const set = (items: string[]) => `setOf(${items.map(kotlinString).join(', ')})`;
  const lines = [
    ...(p.excludes.some(so) ? [`jniLibs.excludes += ${set(p.excludes.filter(so))}`] : []),
    ...(p.pickFirsts.some(so) ? [`jniLibs.pickFirsts += ${set(p.pickFirsts.filter(so))}`] : []),
    ...(p.excludes.some((f) => !so(f)) ? [`resources.excludes += ${set(p.excludes.filter((f) => !so(f)))}`] : []),
    ...(p.pickFirsts.some((f) => !so(f)) ? [`resources.pickFirsts += ${set(p.pickFirsts.filter((f) => !so(f)))}`] : []),
  ];
  return lines.length ? `\n    packaging {\n${lines.map((l) => `        ${l}\n`).join('')}    }\n` : '';
}

/** The flexbox react-nativescript-navigation's FrameNavigatorView renders a screen into. */
const REACT_SCREEN_CONTENT = { flexGrow: '1', flexDirection: 'column', width: '100%', height: '100%' };

const kit = KIT_ANDROID;
const say = (m: string) => console.log(`[ns-native] ${m}`);

export async function writeAndroid(b: AndroidBuild): Promise<void> {
  const started = Date.now();
  const pkg = `org.nativescript.${b.name.toLowerCase()}`;
  const sources = join(b.out, 'src', 'main', 'kotlin', ...pkg.split('.'));
  rmSync(join(b.out, 'src'), { recursive: true, force: true });
  mkdirSync(sources, { recursive: true });

  const widgets = b.widgetsAar ? resolve(b.widgetsAar) : findWidgetsAar(b.app);
  // Before the translator: calls into plugin classes are checked against the plugins' built AARs.
  const native = pluginNativeAndroid(b.plugins ?? [], { app: b.app, say });
  const bindingDefines: string[] = [];
  for (const binding of b.bindings ?? []) {
    const prepared = prepareBindingArchives(binding, native.archives, join(b.out, 'bindings'));
    native.archives = prepared.archives;
    bindingDefines.push(...prepared.defines);
  }
  const translator = new Translator(b.checker, b.infos, b.files, { pluginFiles: b.pluginFiles, reach: b.reach, properties: b.properties });
  translator.appModule = pkg;
  translator.allowUnapplied = !!b.allowUnapplied;
  translator.core = new CoreKotlin(translator, !!b.generatedKit);
  translator.lines = b.lines;
  if (b.allErrors) translator.errors = [];
  translator.lenientApp = !!b.lenient;
  const table: Record<string, [number, string, number][]> = {};
  /** A Kotlin file as written, its markers turned into ranges of the line table: [first Kotlin line, source file, source line]. */
  const write = (file: string, code: string) => {
    if (!b.lines) { writeFileSync(file, code); return; }
    const located = b.lines.kotlin(code);
    writeFileSync(file, located.code);
    const ranges: [number, string, number][] = [];
    located.lines.forEach((at, i) => {
      const last = ranges.at(-1);
      if (at ? !last || last[1] !== relative(b.app, at.file) || last[2] !== at.line : last && last[2] !== 0) ranges.push([i + 1, at ? relative(b.app, at.file) : '', at?.line ?? 0]);
    });
    if (ranges.length) table[basename(file)] = ranges;
  };
  translator.native = new AndroidNativeAPI(translator, androidClassPath(widgets, native));
  for (const p of b.plugins ?? []) for (const t of p.typings) (translator.native as AndroidNativeAPI).pluginTypings.add(t);
  // The app's own typings of Java APIs no package types (`declare module androidx { … }` in a script .d.ts).
  const appDir = resolve(b.app) + '/';
  for (const sf of b.program.getSourceFiles()) {
    if (!sf.isDeclarationFile || !sf.fileName.startsWith(appDir) || sf.fileName.includes('/node_modules/')) continue;
    if (!/^(import|export)\b/m.test(sf.text) && /^declare\s+(module|namespace)\s+(android|androidx|java|javax|com|org|kotlin|io)\b/m.test(sf.text)) (translator.native as AndroidNativeAPI).pluginTypings.add(sf.fileName);
  }
  const suppress = '@file:Suppress("unused", "UNUSED_VARIABLE", "RedundantExplicitType", "NAME_SHADOWING", "UNCHECKED_CAST", "UNREACHABLE_CODE", "UNUSED_PARAMETER")';
  const header = (from: string) => `// Compiled by ns-native from ${relative(b.app, from)}; edit that file, not this one.\n${suppress}\npackage ${pkg}\n\nimport org.nativescript.kit.*\n\n`;
  // A component's file is a module too: what it declares beside the component (its constants and helpers).
  const modules = translateKotlinModules(translator, b.program, [...b.modules, ...b.components.map((c) => c.file), ...(b.compiledPlugins ?? [])], b.resolved);
  for (const c of b.components) {
    const sf = b.program.getSourceFile(c.file)!;
    const cls = sf.statements.find(ts.isClassDeclaration)!;
    try {
      const { params, lines } = translator.componentMembers(cls, c.props);
      const body = [`class ${c.name}(${params.join(', ')}) {`, ...lines, SourceLines.end, ...render(c, b.infos, { framework: b.framework, zone: b.zone, slots: b.mounted, rowSignals: b.mounted, ...(b.framework === 'react' ? { screenContent: REACT_SCREEN_CONTENT } : {}) }), '}'];
      write(join(sources, c.name + '.kt'), header(c.file.replace(/\.ts$/, '')) + body.join('\n') + '\n');
    } catch (e) {
      if (!translator.errors) throw e;
      translator.errors.push(`${c.name}: ${(e as Error).message}`);
    }
  }
  if (translator.errors?.length) throw new Error(`${new Set(translator.errors).size} constructs the release build cannot translate yet:\n  ${[...new Set(translator.errors)].join('\n  ')}`);
  addKotlinInterfaces(translator, modules);
  // File names differ in more than case: a module `streamdown.tsx` beside a component `Streamdown` would overwrite it on a case-insensitive disk.
  const taken = new Set(b.components.map((c) => c.name.toLowerCase()));
  for (const m of modules) {
    if (!m.code.trim()) continue;
    let file = m.name;
    while (taken.has(file.toLowerCase())) file += '_module';
    taken.add(file.toLowerCase());
    write(join(sources, file + '.kt'), header(m.file) + m.code);
  }
  writeFileSync(join(b.out, 'source-lines.json'), JSON.stringify({ package: pkg, files: table }) + '\n');
  const shapes = SourceLines.strip(translator.shapesCode());
  if (shapes) writeFileSync(join(sources, '__Objects.kt'), `// Compiled by ns-native: the app's object literals without a declared type.\n${suppress}\npackage ${pkg}\n\nimport org.nativescript.kit.*\n\n${shapes}\n`);
  const inits = (b.zone ? '        Zone.enabled = true\n' : '') + modules.filter((m) => m.init).map((m) => `        ${m.init}()\n`).join('');
  const routes = b.routes
    ? `        Router.shared.routes = listOf(${b.routes.routes.map((r) => `Route(${kotlinString(r.path)}) { ${r.component}().render() }`).join(', ')})\n        Router.shared.initial = ${kotlinString(b.routes.initial)}\n`
    : '';
  // Set before the module initializers run: they may make views.
  const switches = (b.corePatches ?? []).map((p) => `        CorePatches.${p} = true\n`).join('');
  // The entry's own statements run the app (`Application.run`), after every module it imports.
  const start = `${switches}        Reactivity.schedule = Reactivity.Schedule.${SCHEDULE[b.framework as Framework].toUpperCase()}\n` + (b.mounted ? `${inits}        return Application.rootView()\n` : `${inits}${routes}        return ${b.root}().render()\n`);
  // A binding's objects are in place before any module runs, as the plugin's engine module is installed at startup.
  const installs = (b.bindings ?? []).map((x) => `        ${x.installer}.install()\n`).join('');
  if (b.generatedKit) {
    const run = `${installs}${switches}        Reactivity.schedule = Reactivity.Schedule.${SCHEDULE[b.framework as Framework].toUpperCase()}\n` + (b.mounted
      ? `        NativeScriptApplication.prepare(cssAST = appCSS)\n        CoreModules.initialize()\n${inits}`
      : `        NativeScriptApplication.prepare(cssAST = appCSS)\n        CoreModules.initialize()\n${inits}${b.routeTree ? `        Router.shared.config = ${kotlinRouteConfig(b.routeTree, '        ')}\n` : routes}        NativeScriptApplication.start { ${b.root}().render() }\n`);
    writeFileSync(join(sources, '__Entry.kt'), `// Compiled by ns-native: the app's entry and its CSS.
package ${pkg}

import org.nativescript.kit.*

/** The app, started before core's activity (com.tns.NativeScriptActivity) shows it. */
class MainApplication : android.app.Application() {
    override fun onCreate() {
        super.onCreate()
${run}    }
}

val appCSS = ${kotlinString(b.cssAST ?? '{"type":"stylesheet","stylesheet":{"rules":[]}}')}
`);
  } else writeFileSync(join(sources, '__Entry.kt'), `// Compiled by ns-native: the app's entry and its CSS.
package ${pkg}

import org.nativescript.kit.*

class MainActivity : NativeScriptActivity() {
    override val css: String get() = appCSS

    override fun root(): View {
${start}    }
}

val appCSS = ${kotlinString(b.css)}
`);
  say(`${b.components.length} components and ${b.modules.length} modules from ${b.framework} compiled to Kotlin in ${Date.now() - started} ms → ${relative(process.cwd(), sources)}`);

  // The Gradle project: this app module, and the kit as a library module.
  const appResources = join(appResourcesDir(b.app), 'Android');
  const main = join(appResources, 'src', 'main');
  const resources = join(main, 'res');
  if (!widgets) throw new Error('@nativescript/core is not installed in the app (its widgets AAR is the layout the native build links); run npm install, or pass --widgets <aar>');
  const applicationId = b.applicationId ?? `${pkg}.native`;
  // A plugin built into an AAR brings its manifest as a library's; the merger takes it from there.
  const overlays = pluginManifests({ app: b.app, applicationId, dir: join(b.out, 'plugin-manifests'), except: new Set((b.plugins ?? []).map((p) => p.name)) });
  const gradleFile = (f: string) => (existsSync(join(appResources, f)) ? `apply(from = ${kotlinString(join(appResources, f))})\n` : '');
  if (b.bindings?.length) {
    mkdirSync(join(b.out, 'bindings'), { recursive: true });
    writeFileSync(join(b.out, 'bindings', 'CMakeLists.txt'), `cmake_minimum_required(VERSION 3.22)\nproject(bindings)\n${b.bindings.map((x, k) => `add_subdirectory(${JSON.stringify(x.jni)} binding${k})\n`).join('')}`);
  }
  writeFileSync(join(b.out, 'settings.gradle.kts'), `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
${native.repositories.map((r) => `        maven { url = uri(${kotlinString(r)}) }\n`).join('')}    }
}
rootProject.name = ${kotlinString(b.name)}
include(":kit")
project(":kit").projectDir = file(${kotlinString(relative(b.out, kit))})
`);
  writeFileSync(join(b.out, 'gradle.properties'), `org.gradle.jvmargs=-Xmx4g -Dfile.encoding=UTF-8
android.useAndroidX=true
nativescriptWidgetsAar=${widgets}
${b.generatedKit ? 'generatedKit=true\n' : ''}`);
  writeFileSync(join(b.out, 'build.gradle.kts'), `plugins {
    id("com.android.application") version "8.12.1"
    id("com.android.library") version "8.12.1" apply false
    id("org.jetbrains.kotlin.android") version "2.2.20"
}
${gradleFile('before-plugins.gradle')}
android {
    namespace = ${kotlinString(pkg)}
    compileSdk = 36

    defaultConfig {
        applicationId = ${kotlinString(applicationId)}
        minSdk = ${native.minSdk}
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"
${bindingDefines.length ? `        externalNativeBuild { cmake { arguments += listOf(${bindingDefines.map(kotlinString).join(', ')}) } }\n` : ''}    }
${b.bindings?.length ? `    ndkVersion = ${kotlinString(ndk().version)}\n    externalNativeBuild { cmake { path = file(${kotlinString(join(b.out, 'bindings', 'CMakeLists.txt'))}) } }\n${b.bindings.map((x) => `    sourceSets["main"].java.srcDirs(${kotlinString(x.kotlin)})\n`).join('')}` : ''}
    sourceSets["main"].res.srcDirs(${kotlinString(resources)}, "src/main/res")
${['java', 'assets'].filter((d) => existsSync(join(main, d))).map((d) => `    sourceSets["main"].${d}.srcDirs(${kotlinString(join(main, d))})\n`).join('')}
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            // Signed with the debug key so the release build installs as is.
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
${packagingBlock(native.packaging)}}

kotlin {
    compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) }
}

dependencies {
    implementation(project(":kit"))
${native.archives.map((a) => `    implementation(files(${kotlinString(a)}))\n`).join('')}${native.dependencies.map((d) => `    ${d.configuration}(${kotlinString(d.coords)})\n`).join('')}${native.constraints.length ? `    constraints {\n${native.constraints.map((d) => `        ${d.configuration}(${kotlinString(d.coords)})\n`).join('')}    }\n` : ''}}
${overlays.length ? `
// The plugins' manifests, merged into the app's as the plugins' own would be.
androidComponents {
    onVariants { variant ->
${overlays.map((m) => `        variant.sources.manifests.addStaticManifestFile(${kotlinString(m)})\n`).join('')}    }
}
` : ''}${gradleFile('app.gradle')}`);
  // The app's members are reached by name through reflection, as the kit's are.
  writeFileSync(join(b.out, 'proguard-rules.pro'), `-dontwarn org.nativescript.widgets.**\n-keep class ${pkg}.** { *; }\n${native.keepRules.map((r) => `${r}\n`).join('')}`);
  mkdirSync(join(b.out, 'src', 'main', 'res', 'values'), { recursive: true });
  // The runtime template's strings.xml, named after the folder (letters and digits only), unless App_Resources replaces the file.
  const label = basename(resolve(b.app)).replace(/[^a-zA-Z0-9]/g, '');
  if (!existsSync(join(resources, 'values', 'strings.xml'))) writeFileSync(join(b.out, 'src', 'main', 'res', 'values', 'strings.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${label}</string>
    <string name="title_activity_kimera">${label}</string>
</resources>
`);
  copyAndroidFonts(b.appDir, join(b.out, 'src', 'main', 'assets'));
  // App_Resources' manifest, else the runtime template's activity: the launch theme, then AppTheme once created.
  const activity = b.generatedKit ? 'com.tns.NativeScriptActivity' : `${pkg}.MainActivity`;
  writeFileSync(join(b.out, 'src', 'main', 'AndroidManifest.xml'), androidManifest({ app: b.app, applicationId, activity, application: b.generatedKit ? `${pkg}.MainApplication` : undefined }) ?? `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application${b.generatedKit ? `\n        android:name="${pkg}.MainApplication"` : ''}
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme"
        android:hardwareAccelerated="true">
        <activity
            android:name="${activity}"
            android:label="@string/title_activity_kimera"
            android:configChanges="keyboard|keyboardHidden|orientation|screenSize|smallestScreenSize|screenLayout|locale|uiMode"
            android:theme="@style/LaunchScreenTheme"
            android:hardwareAccelerated="true"
            android:launchMode="singleTask"
            android:exported="true">
            <meta-data android:name="SET_THEME_ON_LAUNCH" android:resource="@style/AppTheme" />
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`);

  if (b.build) {
    const { execFileSync } = await import('node:child_process');
    // Signed with the keystore when one is given, as Android Studio's signed builds inject it.
    const k = b.keyStore;
    const signing = k ? [`-Pandroid.injected.signing.store.file=${resolve(k.path)}`, `-Pandroid.injected.signing.store.password=${k.password}`, `-Pandroid.injected.signing.key.alias=${k.alias}`, `-Pandroid.injected.signing.key.password=${k.aliasPassword}`] : [];
    execFileSync(join(kit, 'gradlew'), ['-p', b.out, ':assembleRelease', ...(b.bundle ? [':bundleRelease'] : []), ...signing, '--quiet'], { stdio: 'inherit' });
    const apk = join(b.out, 'build', 'outputs', 'apk', 'release', `${b.name}-release.apk`);
    say(`built ${relative(process.cwd(), existsSync(apk) ? apk : join(b.out, 'build', 'outputs', 'apk', 'release'))}`);
    const aab = join(b.out, 'build', 'outputs', 'bundle', 'release', `${b.name}-release.aab`);
    if (b.bundle) say(`built ${relative(process.cwd(), aab)}`);
    if (!k) say('no --key-store-path: signed with the debug key, which installs for testing but no store accepts');
  }
}

/** The widgets AAR @nativescript/core ships, from the app's node_modules (or a parent's). */
function findWidgetsAar(app: string): string | null {
  for (let dir = app; ; dir = dirname(dir)) {
    const candidate = join(dir, 'node_modules', '@nativescript', 'core', 'platforms', 'android', 'widgets-release.aar');
    if (existsSync(candidate)) return candidate;
    if (dirname(dir) === dir) return null;
  }
}

