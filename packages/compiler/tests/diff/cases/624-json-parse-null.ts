// @app-lenient
// JSON.parse of null (a settings read with a null default) parses "null", as String(null) is.
function getString(key: string, fallback?: string): string { return key === 'set' ? '{"a":1}' : fallback; }
console.log(JSON.parse(getString('set', null)).a, JSON.parse(getString('unset', null)));
const state = JSON.parse(getString('unset', null)) ?? { fresh: true };
console.log(JSON.stringify(state));
try { JSON.parse(getString('unset')); } catch (e) { console.log(e instanceof SyntaxError); }
