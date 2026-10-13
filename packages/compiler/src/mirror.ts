import { copyFileSync, lstatSync, mkdirSync, readFileSync, readdirSync, readlinkSync, rmSync, symlinkSync, type Stats } from 'node:fs';
import { join } from 'node:path';

/**
 * Makes `to` a copy of `from`, rewriting only the files whose content differs and removing what
 * `from` lacks. Xcode recompiles every target importing a module whose files got a new inode or
 * mtime, so a folder deleted and copied again on each build recompiles the whole kit.
 */
export function mirror(from: string, to: string): void {
  const src = lstatSync(from);
  const dst = lstatOrNull(to);
  if (src.isDirectory()) {
    if (dst && !dst.isDirectory()) rmSync(to, { recursive: true, force: true });
    mkdirSync(to, { recursive: true });
    const names = new Set(readdirSync(from));
    for (const name of readdirSync(to)) if (!names.has(name)) rmSync(join(to, name), { recursive: true, force: true });
    for (const name of names) mirror(join(from, name), join(to, name));
    return;
  }
  if (src.isSymbolicLink()) {
    const target = readlinkSync(from);
    if (dst?.isSymbolicLink() && readlinkSync(to) === target) return;
    if (dst) rmSync(to, { recursive: true, force: true });
    symlinkSync(target, to);
    return;
  }
  if (dst?.isFile() && dst.size === src.size && readFileSync(to).equals(readFileSync(from))) return;
  if (dst) rmSync(to, { recursive: true, force: true });
  copyFileSync(from, to);
}

function lstatOrNull(path: string): Stats | null {
  try {
    return lstatSync(path);
  } catch {
    return null;
  }
}
