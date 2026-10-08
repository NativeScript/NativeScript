#!/usr/bin/env node
// ns-native-retrace <android project> [trace.txt]: an Android stack trace of a compiled release in source lines
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 23 || (major === 23 && minor < 6)) {
  console.error(`ns-native-retrace needs Node.js 23.6 or newer (it runs its TypeScript sources directly); this is ${process.version}.`);
  process.exit(1);
}

await import('./strip-types.js');
await import('../compiler/src/retrace.ts');
