// Node refuses to strip types from files under node_modules, which is where
// this package is installed, so the compiler's sources are stripped here.
// Imported by the bin and passed with --import to the compiler's own child
// processes. The API's experimental warning concerns this hook alone.
import module from 'node:module';

const emitWarning = process.emitWarning;
process.emitWarning = (warning, ...rest) => {
  if (!String(warning).includes('stripTypeScriptTypes')) emitWarning.call(process, warning, ...rest);
};
const compiler = new URL('../src/', import.meta.url).href;
module.registerHooks({
  load(url, context, nextLoad) {
    if (!url.startsWith(compiler) || !url.endsWith('.ts')) return nextLoad(url, context);
    const { source } = nextLoad(url, { ...context, format: 'module' });
    return { format: 'module', source: module.stripTypeScriptTypes(String(source)), shortCircuit: true };
  },
});
