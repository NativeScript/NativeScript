// XcodeGen, which turns the generated project.yml into the Xcode project: the one NS_XCODEGEN or PATH names, else a
// pinned release, downloaded once into the user's cache and checked against its published SHA-256.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { delimiter, join } from 'node:path';

const VERSION = '2.46.0';
const SHA256 = '4d9e34b62172d645eed6457cac13fc222569974098ef4ee9c3368bedf0196806';
const URL = `https://github.com/yonaskolb/XcodeGen/releases/download/${VERSION}/xcodegen.zip`;

export function xcodegen(say: (m: string) => void = () => {}): string {
  if (process.env.NS_XCODEGEN) return process.env.NS_XCODEGEN;
  for (const dir of (process.env.PATH ?? '').split(delimiter)) if (dir && existsSync(join(dir, 'xcodegen'))) return join(dir, 'xcodegen');
  const cache = join(process.env.XDG_CACHE_HOME ?? join(homedir(), 'Library', 'Caches'), 'nativescript', 'xcodegen', VERSION);
  // The binary reads its setting presets from ../share beside it, so the release's folder stays whole.
  const bin = join(cache, 'xcodegen', 'bin', 'xcodegen');
  if (existsSync(bin)) return bin;
  say(`downloading XcodeGen ${VERSION}`);
  const staging = `${cache}.download`;
  rmSync(staging, { recursive: true, force: true });
  mkdirSync(staging, { recursive: true });
  const zip = join(staging, 'xcodegen.zip');
  execFileSync('curl', ['-fsSL', '--retry', '3', '-o', zip, URL], { stdio: 'inherit' });
  const digest = createHash('sha256').update(readFileSync(zip)).digest('hex');
  if (digest !== SHA256) {
    rmSync(staging, { recursive: true, force: true });
    throw new Error(`XcodeGen ${VERSION} from ${URL} has SHA-256 ${digest}, not ${SHA256}: not used. Install XcodeGen (brew install xcodegen) or set NS_XCODEGEN.`);
  }
  execFileSync('/usr/bin/unzip', ['-q', zip, '-d', staging]);
  rmSync(zip);
  chmodSync(join(staging, 'xcodegen', 'bin', 'xcodegen'), 0o755);
  rmSync(cache, { recursive: true, force: true });
  renameSync(staging, cache);
  return bin;
}
