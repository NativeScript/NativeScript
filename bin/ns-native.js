#!/usr/bin/env node
// ns-native <app> --out <dir> [--name <Name>] [--bundle <id>] [--platform android] [--build]
import module from 'node:module';

const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 23 || (major === 23 && minor < 6)) {
  console.error(`ns-native needs Node.js 23.6 or newer (it runs its TypeScript sources directly); this is ${process.version}.`);
  process.exit(1);
}

// Node refuses to strip types from files under node_modules, which is where
// this package is installed, so the compiler's sources are stripped here.
// The API's experimental warning concerns this hook alone, not the app.
const emitWarning = process.emitWarning;
process.emitWarning = (warning, ...rest) => {
  if (!String(warning).includes('stripTypeScriptTypes')) emitWarning.call(process, warning, ...rest);
};
const compiler = new URL('../compiler/src/', import.meta.url).href;
module.registerHooks({
  load(url, context, nextLoad) {
    if (!url.startsWith(compiler) || !url.endsWith('.ts')) return nextLoad(url, context);
    const { source } = nextLoad(url, { ...context, format: 'module' });
    return { format: 'module', source: module.stripTypeScriptTypes(String(source)), shortCircuit: true };
  },
});

await import('../compiler/src/cli.ts');
