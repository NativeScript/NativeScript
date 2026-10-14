import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

/** ktfmt, pinned: the release and its SHA-256. */
const VERSION = '0.64';
const SHA256 = '5b3d5286fd2defcc7dc8e28c21ddf156cc6b2d8682bdcd929ce4333e7a6201f2';
const JAR = join(dirname(import.meta.dirname), 'node_modules/.cache/ktfmt', `ktfmt-${VERSION}-with-dependencies.jar`);

/** The pinned ktfmt jar, fetched from Maven Central into the compiler's node_modules/.cache the first time; null where it cannot be. */
function ktfmtJar(): string | null {
  if (!existsSync(JAR)) {
    mkdirSync(dirname(JAR), { recursive: true });
    const part = `${JAR}.part`;
    try {
      execFileSync('curl', ['-sfL', '-o', part, `https://repo1.maven.org/maven2/com/facebook/ktfmt/${VERSION}/ktfmt-${VERSION}-with-dependencies.jar`], { stdio: 'ignore' });
    } catch { rmSync(part, { force: true }); return null; }
    if (createHash('sha256').update(readFileSync(part)).digest('hex') !== SHA256) { rmSync(part, { force: true }); return null; }
    execFileSync('mv', [part, JAR]);
  }
  return JAR;
}

/**
 * Kotlin sources formatted by ktfmt in Kotlin's coding conventions (`--kotlinlang-style`), in one run. A file ktfmt
 * cannot format is left as written. `required`: a missing ktfmt (no network on the first run) throws; otherwise the
 * sources are left as written.
 */
export function formatKotlin(codes: string[], required = false): string[] {
  const jar = ktfmtJar();
  if (!jar) {
    if (required) throw new Error(`ktfmt ${VERSION} could not be fetched from Maven Central into ${dirname(JAR)}`);
    return codes;
  }
  const dir = mkdtempSync(join(tmpdir(), 'ns-ktfmt-'));
  try {
    const files = codes.map((code, k) => { const f = join(dir, `f${k}.kt`); writeFileSync(f, code); return f; });
    const r = spawnSync('java', ['-jar', jar, '--kotlinlang-style', ...files], { encoding: 'utf8', maxBuffer: 1 << 26 });
    if (r.status !== 0 && r.error && required) throw r.error;
    return files.map((f) => readFileSync(f, 'utf8'));
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
