#!/usr/bin/env node
// ns-native-retrace <android project> [trace.txt]: an Android stack trace of a compiled release in source lines
import { existsSync } from 'node:fs';

if (existsSync(new URL('../dist/retrace.js', import.meta.url))) {
  await import('../dist/retrace.js');
} else {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 23 || (major === 23 && minor < 6)) {
    console.error(`ns-native-retrace needs Node.js 23.6 or newer to run its TypeScript sources (this is ${process.version}); run bin/build-dist.mjs first, or use a newer Node.`);
    process.exit(1);
  }
  await import('./strip-types.js');
  await import('../src/retrace.ts');
}
