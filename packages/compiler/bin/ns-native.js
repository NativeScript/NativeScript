#!/usr/bin/env node
// ns-native <app> --out <dir> [--name <Name>] [--bundle <id>] [--platform android] [--build]
import { existsSync } from 'node:fs';

// The published package runs its JavaScript (dist/, compiled at pack time); a checkout runs its TypeScript.
if (existsSync(new URL('../dist/cli.js', import.meta.url))) {
  await import('../dist/cli.js');
} else {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 23 || (major === 23 && minor < 6)) {
    console.error(`ns-native needs Node.js 23.6 or newer to run its TypeScript sources (this is ${process.version}); run bin/build-dist.mjs first, or use a newer Node.`);
    process.exit(1);
  }
  await import('./strip-types.js');
  await import('../src/cli.ts');
}
