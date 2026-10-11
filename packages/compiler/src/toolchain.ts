// The native toolchain a compiled release builds with, checked before the
// compile so a missing or too-old tool is named with its fix rather than
// surfacing later as an xcodebuild or Gradle failure.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/**
 * The oldest Xcode the generated kit compiles with: it calls the newest iOS APIs behind availability checks.
 * The oldest JDK the Android Gradle plugin the generated project uses (8.12) runs on.
 */
export const TOOLCHAIN = { xcode: 26, jdk: 17, compileSdk: 36 } as const;

export function checkToolchain(platform: 'ios' | 'android'): { errors: string[]; warnings: string[] } {
  const errors: string[] = [], warnings: string[] = [];
  if (platform === 'ios') {
    if (process.platform !== 'darwin') errors.push('A compiled iOS release builds on macOS, with Xcode.');
    else {
      const r = spawnSync('xcodebuild', ['-version'], { encoding: 'utf8' });
      const version = /Xcode (\d+)(?:\.(\d+))?/.exec(r.stdout ?? '');
      if (r.error || r.status !== 0 || !version) errors.push(`Xcode was not found (xcodebuild -version: ${(r.stderr || r.error?.message || '').trim().split('\n')[0]}). Install Xcode ${TOOLCHAIN.xcode} or newer and select it with xcode-select -s.`);
      else if (+version[1] < TOOLCHAIN.xcode) errors.push(`Xcode ${version[1]}.${version[2] ?? 0} is selected; a compiled iOS release needs Xcode ${TOOLCHAIN.xcode} or newer (the kit uses the newest iOS APIs behind availability checks). Select a newer one with xcode-select -s.`);
    }
    return { errors, warnings };
  }
  const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
  const r = spawnSync(java, ['-version'], { encoding: 'utf8' });
  const jdk = /version "(\d+)(?:\.(\d+))?/.exec(`${r.stderr}${r.stdout}`);
  if (r.error || !jdk) errors.push(`No Java found (${java}). Install JDK ${TOOLCHAIN.jdk} or newer and set JAVA_HOME.`);
  else {
    const major = jdk[1] === '1' ? +(jdk[2] ?? 0) : +jdk[1];
    if (major < TOOLCHAIN.jdk) errors.push(`Java ${major} is on the path; Gradle for a compiled Android release needs JDK ${TOOLCHAIN.jdk} or newer. Set JAVA_HOME to one.`);
  }
  const sdk = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT ?? [join(homedir(), 'Library', 'Android', 'sdk'), join(homedir(), 'Android', 'Sdk')].find(existsSync);
  if (!sdk || !existsSync(sdk)) errors.push('The Android SDK was not found: set ANDROID_HOME to it (Android Studio installs it).');
  else if (!existsSync(join(sdk, 'platforms', `android-${TOOLCHAIN.compileSdk}`))) {
    const have = existsSync(join(sdk, 'platforms')) ? readdirSync(join(sdk, 'platforms')).join(', ') : 'none';
    warnings.push(`The Android SDK at ${sdk} has no platforms/android-${TOOLCHAIN.compileSdk} (has: ${have}); Gradle installs it if the SDK licenses are accepted (sdkmanager --licenses).`);
  }
  return { errors, warnings };
}
