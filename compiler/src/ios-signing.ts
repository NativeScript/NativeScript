// Device builds: an archive, and an .ipa exported from it. Signing is manual
// only, from a provisioning profile already on the machine; nothing here asks
// Xcode to create or register anything on a developer account.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';
import { parsePlist, writePlist } from './plist.ts';

export interface Profile {
  uuid: string;
  name: string;
  team: string;
  /** The export method its kind of profile signs for. */
  method: 'debugging' | 'release-testing' | 'app-store-connect' | 'enterprise';
}

const PROFILE_DIRS = [join(homedir(), 'Library', 'Developer', 'Xcode', 'UserData', 'Provisioning Profiles'), join(homedir(), 'Library', 'MobileDevice', 'Provisioning Profiles')];

/** A profile given as a .mobileprovision path, or by the UUID or name of one installed. */
export function findProfile(given: string): Profile {
  const files = existsSync(given) ? [given] : PROFILE_DIRS.filter(existsSync).flatMap((d) => readdirSync(d).filter((f) => f.endsWith('.mobileprovision')).map((f) => join(d, f)));
  for (const file of files) {
    const p = parsePlist(execFileSync('security', ['cms', '-D', '-i', file], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
    if (file !== given && p.UUID !== given && p.Name !== given) continue;
    const entitlements = (p.Entitlements ?? {}) as Record<string, unknown>;
    const method = entitlements['get-task-allow'] === true ? 'debugging' : p.ProvisionsAllDevices === true ? 'enterprise' : p.ProvisionedDevices ? 'release-testing' : 'app-store-connect';
    return { uuid: p.UUID as string, name: p.Name as string, team: (p.TeamIdentifier as string[])[0], method };
  }
  throw new Error(`no provisioning profile ${given} (a .mobileprovision file, or the UUID or name of one in ${PROFILE_DIRS.join(' or ')})`);
}

/** The app target's settings for manual signing with the profile. */
export function signingSettings(profile: Profile): Record<string, string> {
  return {
    CODE_SIGN_STYLE: 'Manual',
    DEVELOPMENT_TEAM: profile.team,
    PROVISIONING_PROFILE_SPECIFIER: profile.uuid,
    CODE_SIGN_IDENTITY: profile.method === 'debugging' ? '"Apple Development"' : '"Apple Distribution"',
  };
}

/**
 * `xcodebuild archive` for any iOS device, then the .ipa: exported with the
 * profile when there is one, else the archived app zipped as an unsigned .ipa.
 * Returns the archive and the .ipa.
 */
export function archive(o: { out: string; name: string; bundle: string; profile: Profile | null; say: (m: string) => void }): { archive: string; ipa: string } {
  const archivePath = join(o.out, `${o.name}.xcarchive`);
  const exportPath = join(o.out, 'ipa');
  rmSync(archivePath, { recursive: true, force: true });
  rmSync(exportPath, { recursive: true, force: true });
  execFileSync('xcodebuild', ['archive', '-project', `${o.name}.xcodeproj`, '-scheme', o.name, '-configuration', 'Release', '-destination', 'generic/platform=iOS',
    '-derivedDataPath', 'build', '-archivePath', archivePath, '-quiet'], { cwd: o.out, stdio: 'inherit' });
  mkdirSync(exportPath, { recursive: true });
  if (o.profile) {
    const options = join(o.out, 'ExportOptions.plist');
    writeFileSync(options, writePlist({
      method: o.profile.method,
      signingStyle: 'manual',
      teamID: o.profile.team,
      provisioningProfiles: { [o.bundle]: o.profile.uuid },
    }));
    execFileSync('xcodebuild', ['-exportArchive', '-archivePath', archivePath, '-exportPath', exportPath, '-exportOptionsPlist', options, '-quiet'], { cwd: o.out, stdio: 'inherit' });
    const ipa = readdirSync(exportPath).find((f) => f.endsWith('.ipa'));
    if (!ipa) throw new Error(`xcodebuild -exportArchive wrote no .ipa to ${exportPath}`);
    return { archive: archivePath, ipa: join(exportPath, ipa) };
  }
  o.say('no --provision: the archive and the .ipa are unsigned; sign them for a device or the App Store');
  const apps = join(archivePath, 'Products', 'Applications');
  const app = readdirSync(apps).find((f) => f.endsWith('.app'))!;
  const payload = join(exportPath, 'Payload');
  cpSync(join(apps, app), join(payload, app), { recursive: true, verbatimSymlinks: true });
  const ipa = join(exportPath, `${basename(app, '.app')}.ipa`);
  execFileSync('zip', ['-qry', ipa, 'Payload'], { cwd: exportPath });
  rmSync(payload, { recursive: true, force: true });
  return { archive: archivePath, ipa };
}
