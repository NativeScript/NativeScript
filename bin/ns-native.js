#!/usr/bin/env node
// ns-native <app> --out <dir> [--name <Name>] [--bundle <id>] [--platform android] [--build]
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 23 || (major === 23 && minor < 6)) {
  console.error(`ns-native needs Node.js 23.6 or newer (it runs its TypeScript sources directly); this is ${process.version}.`);
  process.exit(1);
}

await import('./strip-types.js');
await import('../compiler/src/cli.ts');
