#!/usr/bin/env node
// ns-compiled-verify --js <.app> --compiled <.app> [--steps verify.json]: a compiled release compared with its JavaScript release
import { existsSync } from 'node:fs';

if (existsSync(new URL('../dist/verify.js', import.meta.url))) {
  await import('../dist/verify.js');
} else {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 23 || (major === 23 && minor < 6)) {
    console.error(`ns-compiled-verify needs Node.js 23.6 or newer to run its TypeScript sources (this is ${process.version}); run bin/build-dist.mjs first, or use a newer Node.`);
    process.exit(1);
  }
  await import('./strip-types.js');
  await import('../src/verify.ts');
}
