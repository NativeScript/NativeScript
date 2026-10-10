import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { KIT_ANDROID } from './paths.ts';

/**
 * Plugins whose script binds a JavaScript engine (`global.CanvasModule`, installed by native code into V8) have a
 * binding in the kit instead, at `Bindings/<package>/android` (as kit-apple's at `Bindings/<package>/ios`): Kotlin
 * host objects over the plugin's native library through a JNI layer of the kit's, and a script that replaces the
 * plugin's for the app's build. The plugin's native code is still linked, its engine library stubbed.
 */
export interface AndroidBinding {
  package: string;
  /** The script the app's imports of the package resolve to. */
  script: string;
  /** Kotlin sources compiled with the app. */
  kotlin: string;
  /** The JNI layer's CMake project. */
  jni: string;
  /** The object whose `install()` the entry calls before any module runs. */
  installer: string;
  /** Libraries of the plugin's that bind the engine: empty libraries of their names stand in for them. */
  stubs: string[];
  /** Libraries of the plugin's the JNI layer links, made available to CMake (`-D<name>=<dir>/<abi>/lib<x>.so`). */
  links: { lib: string; define: string }[];
}

const BINDINGS: AndroidBinding[] = [
  {
    package: '@nativescript/canvas',
    script: join(KIT_ANDROID, 'Bindings/@nativescript/canvas/android/canvas.ts'),
    kotlin: join(KIT_ANDROID, 'Bindings/@nativescript/canvas/android/kotlin'),
    jni: join(KIT_ANDROID, 'Bindings/@nativescript/canvas/android/jni'),
    installer: 'org.nativescript.kit.canvas.NSBinding_nativescript_canvas',
    stubs: ['canvasnativev8'],
    links: [{ lib: 'canvasnative', define: 'CANVAS_NATIVE_LIBS' }],
  },
];

const ABIS: Record<string, string> = { 'arm64-v8a': 'aarch64-linux-android24', 'armeabi-v7a': 'armv7a-linux-androideabi24', x86: 'i686-linux-android24', x86_64: 'x86_64-linux-android24' };

/** The kit's bindings of the packages the app depends on. */
export function androidBindings(app: string): AndroidBinding[] {
  const pkg = JSON.parse(readFileSync(join(app, 'package.json'), 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  return BINDINGS.filter((b) => deps[b.package]);
}

/** The NDK a binding's JNI layer builds with: ANDROID_NDK_HOME, else the SDK's newest. */
export function ndk(): { dir: string; version: string } {
  const fromEnv = process.env.ANDROID_NDK_HOME ?? process.env.ANDROID_NDK_ROOT;
  if (fromEnv && existsSync(fromEnv)) return { dir: fromEnv, version: ndkVersion(fromEnv) };
  const sdk = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT ?? join(homedir(), 'Library/Android/sdk');
  const root = join(sdk, 'ndk');
  const versions = existsSync(root) ? readdirSync(root).filter((v) => /^\d+\./.test(v)).sort((a, b) => b.localeCompare(a, undefined, { numeric: true })) : [];
  if (!versions.length) throw new Error(`a plugin this app uses (${BINDINGS.map((b) => b.package).join(', ')}) is compiled with the Android NDK, which is not installed: install it with \`sdkmanager "ndk;<version>"\` or set ANDROID_NDK_HOME`);
  return { dir: join(root, versions[0]), version: versions[0] };
}

function ndkVersion(dir: string): string {
  const props = join(dir, 'source.properties');
  return (existsSync(props) && /Pkg\.Revision\s*=\s*([\d.]+)/.exec(readFileSync(props, 'utf8'))?.[1]) || '';
}

/**
 * The plugin's archive with its engine libraries replaced by empty ones (its Java code loads them by name), and the
 * libraries the JNI layer links, extracted per ABI under `dir`.
 */
export function prepareBindingArchives(binding: AndroidBinding, archives: string[], dir: string): { archives: string[]; defines: string[] } {
  const listing = (aar: string) => execFileSync('unzip', ['-Z1', aar], { encoding: 'utf8' }).split('\n');
  const own = archives.find((a) => a.endsWith('.aar') && listing(a).some((f) => binding.stubs.some((s) => f.endsWith(`/lib${s}.so`))));
  if (!own) return { archives, defines: [] };
  const work = join(dir, binding.package.replace(/[@/]/g, '_'));
  rmSync(work, { recursive: true, force: true });
  const unpacked = join(work, 'aar');
  mkdirSync(unpacked, { recursive: true });
  execFileSync('unzip', ['-q', own, '-d', unpacked]);
  const { dir: ndkDir } = ndk();
  const clang = join(ndkDir, 'toolchains/llvm/prebuilt', process.platform === 'darwin' ? 'darwin-x86_64' : 'linux-x86_64', 'bin/clang');
  const empty = join(work, 'empty.c');
  writeFileSync(empty, '');
  const defines: string[] = [];
  for (const abi of readdirSync(join(unpacked, 'jni'))) {
    const target = ABIS[abi];
    if (!target) continue;
    for (const stub of binding.stubs) {
      const lib = join(unpacked, 'jni', abi, `lib${stub}.so`);
      if (existsSync(lib)) execFileSync(clang, [`--target=${target}`, '-shared', '-nostdlib', '-o', lib, empty]);
    }
    for (const link of binding.links) {
      const from = join(unpacked, 'jni', abi, `lib${link.lib}.so`);
      const to = join(work, 'libs', abi);
      mkdirSync(to, { recursive: true });
      if (existsSync(from)) copyFileSync(from, join(to, `lib${link.lib}.so`));
    }
  }
  for (const link of binding.links) defines.push(`-D${link.define}=${join(work, 'libs')}`);
  const repacked = join(work, own.split('/').pop()!);
  execFileSync('zip', ['-q', '-r', repacked, '.'], { cwd: unpacked });
  return { archives: archives.map((a) => (a === own ? repacked : a)), defines };
}
