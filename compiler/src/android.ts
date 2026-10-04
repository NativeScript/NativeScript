// The Android target: the app's components and modules as Kotlin against
// NativeScriptKit for Android (native-release/kit-android), in a Gradle
// project whose resources are the app's own App_Resources/Android.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';
import type { ComponentIR } from './ir.ts';
import { Translator, kotlinString } from './kotlin.ts';
import { render } from './codegen-kotlin.ts';
import { addKotlinInterfaces, translateKotlinModules } from './kotlin-modules.ts';
import { CoreKotlin } from './core-kotlin.ts';
import { AndroidNativeAPI, androidClassPath } from './native-calls-android.ts';
import { pluginNativeAndroid } from './plugins/native-android.ts';
import type { PluginSource } from './plugins/source.ts';
import type { Reach } from './reach.ts';
import type { Properties } from './properties.ts';

export interface AndroidBuild {
  app: string;
  /** The folder of the app's entry, whose `fonts/` core reads font files from. */
  appDir?: string;
  out: string;
  name: string;
  framework: string;
  components: ComponentIR[];
  modules: string[];
  program: ts.Program;
  checker: ts.TypeChecker;
  /** The app's files and the components' virtual files, in translation order. */
  files: readonly ts.SourceFile[];
  infos: Map<string, { name: string; props: string[]; outputs?: string[] }>;
  css: string;
  root: string;
  routes: { routes: { path: string; component: string }[]; initial: string } | null;
  applicationId?: string;
  widgetsAar?: string;
  /** The plugins the app imports: their Android code is built and linked. */
  plugins?: PluginSource[];
  build: boolean;
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
}

/** The flexbox react-nativescript-navigation's FrameNavigatorView renders a screen into. */
const REACT_SCREEN_CONTENT = { flexGrow: '1', flexDirection: 'column', width: '100%', height: '100%' };

const kit = resolve(dirname(new URL(import.meta.url).pathname), '../../kit-android');
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
  const translator = new Translator(b.checker, b.infos, b.files, { pluginFiles: b.pluginFiles, reach: b.reach, properties: b.properties });
  translator.core = new CoreKotlin(translator);
  translator.native = new AndroidNativeAPI(translator, androidClassPath(widgets, native));
  for (const p of b.plugins ?? []) for (const t of p.typings) (translator.native as AndroidNativeAPI).pluginTypings.add(t);
  const suppress = '@file:Suppress("unused", "UNUSED_VARIABLE", "RedundantExplicitType", "NAME_SHADOWING", "UNCHECKED_CAST", "UNREACHABLE_CODE", "UNUSED_PARAMETER")';
  const header = (from: string) => `// Compiled by ns-native from ${relative(b.app, from)}; edit that file, not this one.\n${suppress}\npackage ${pkg}\n\nimport org.nativescript.kit.*\n\n`;
  const modules = translateKotlinModules(translator, b.program, [...b.modules, ...(b.compiledPlugins ?? [])], b.resolved);
  for (const c of b.components) {
    const sf = b.program.getSourceFile(c.file)!;
    const cls = sf.statements.find(ts.isClassDeclaration)!;
    const { params, lines } = translator.componentMembers(cls, c.props);
    const body = [`class ${c.name}(${params.join(', ')}) {`, ...lines, '', ...render(c, b.infos, { framework: b.framework, slots: b.mounted, rowSignals: b.mounted, ...(b.framework === 'react' ? { screenContent: REACT_SCREEN_CONTENT } : {}) }), '}'];
    writeFileSync(join(sources, c.name + '.kt'), header(c.file.replace(/\.ts$/, '')) + body.join('\n') + '\n');
  }
  addKotlinInterfaces(translator, modules);
  // File names differ in more than case: a module `streamdown.tsx` beside a component `Streamdown` would overwrite it on a case-insensitive disk.
  const taken = new Set(b.components.map((c) => c.name.toLowerCase()));
  for (const m of modules) {
    if (!m.code.trim()) continue;
    let file = m.name;
    while (taken.has(file.toLowerCase())) file += '_module';
    taken.add(file.toLowerCase());
    writeFileSync(join(sources, file + '.kt'), header(m.file) + m.code);
  }
  const shapes = translator.shapesCode();
  if (shapes) writeFileSync(join(sources, '__Objects.kt'), `// Compiled by ns-native: the app's object literals without a declared type.\n${suppress}\npackage ${pkg}\n\nimport org.nativescript.kit.*\n\n${shapes}\n`);
  const inits = modules.filter((m) => m.init).map((m) => `        ${m.init}()\n`).join('');
  const routes = b.routes
    ? `        Router.shared.routes = listOf(${b.routes.routes.map((r) => `Route(${kotlinString(r.path)}) { ${r.component}().render() }`).join(', ')})\n        Router.shared.initial = ${kotlinString(b.routes.initial)}\n`
    : '';
  // Set before the module initializers run: they may make views.
  const switches = (b.corePatches ?? []).map((p) => `        CorePatches.${p} = true\n`).join('');
  // The entry's own statements run the app (`Application.run`), after every module it imports.
  const start = b.mounted ? `${switches}        Reactivity.scheduled = true\n${inits}        return Application.rootView()\n` : `${switches}${inits}${routes}        return ${b.root}().render()\n`;
  writeFileSync(join(sources, '__Entry.kt'), `// Compiled by ns-native: the app's entry and its CSS.
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
  const resources = join(b.app, 'App_Resources', 'Android', 'src', 'main', 'res');
  const fonts = b.appDir && join(b.appDir, 'fonts');
  const assetFonts = join(b.out, 'src', 'main', 'assets', 'app', 'fonts');
  rmSync(assetFonts, { recursive: true, force: true });
  if (fonts && existsSync(fonts)) cpSync(fonts, assetFonts, { recursive: true });
  if (!widgets) throw new Error('@nativescript/core is not installed in the app (its widgets AAR is the layout the native build links); run npm install, or pass --widgets <aar>');
  const applicationId = b.applicationId ?? `${pkg}.native`;
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
`);
  writeFileSync(join(b.out, 'build.gradle.kts'), `plugins {
    id("com.android.application") version "8.12.1"
    id("com.android.library") version "8.12.1" apply false
    id("org.jetbrains.kotlin.android") version "2.2.20"
}

android {
    namespace = ${kotlinString(pkg)}
    compileSdk = 36

    defaultConfig {
        applicationId = ${kotlinString(applicationId)}
        minSdk = ${native.minSdk}
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"
    }

    sourceSets["main"].res.srcDirs(${kotlinString(resources)}, "src/main/res")

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
}

kotlin {
    compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) }
}

dependencies {
    implementation(project(":kit"))
${native.archives.map((a) => `    implementation(files(${kotlinString(a)}))\n`).join('')}${native.dependencies.map((d) => `    ${d.configuration}(${kotlinString(d.coords)})\n`).join('')}}
`);
  writeFileSync(join(b.out, 'proguard-rules.pro'), `-dontwarn org.nativescript.widgets.**\n${native.keepRules.map((r) => `${r}\n`).join('')}`);
  mkdirSync(join(b.out, 'src', 'main', 'res', 'values'), { recursive: true });
  // The NativeScript CLI names the app after its folder, letters and digits only, unless App_Resources does.
  const appStrings = join(b.app, 'App_Resources', 'Android', 'src', 'main', 'res', 'values', 'strings.xml');
  const label = (existsSync(appStrings) && /<string name="app_name">([^<]*)</.exec(readFileSync(appStrings, 'utf8'))?.[1]) || basename(resolve(b.app)).replace(/[^a-zA-Z0-9]/g, '');
  writeFileSync(join(b.out, 'src', 'main', 'res', 'values', 'strings.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${label}</string>
    <string name="title_activity_kimera">${label}</string>
</resources>
`);
  // The activity as App_Resources declares NativeScript's: the launch theme, then AppTheme once created.
  writeFileSync(join(b.out, 'src', 'main', 'AndroidManifest.xml'), `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme"
        android:hardwareAccelerated="true">
        <activity
            android:name=".MainActivity"
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
    execFileSync(join(kit, 'gradlew'), ['-p', b.out, ':assembleRelease', '--quiet'], { stdio: 'inherit' });
    const apk = join(b.out, 'build', 'outputs', 'apk', 'release', `${basename(b.out)}-release.apk`);
    say(`built ${relative(process.cwd(), existsSync(apk) ? apk : join(b.out, 'build', 'outputs', 'apk', 'release'))}`);
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

