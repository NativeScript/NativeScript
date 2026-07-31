// Detect (and log) `require('http(s)://...')` calls made from CJS shims.
// Pattern: HTTP-served ESM modules end up in NS-vite's `__nsRequire`
// shim with HTTP URLs as their relative resolution targets. The guard
// is install-once-per-isolate, dedupes per-URL (so semver's ~30 deep
// imports produce ~30 lines on the first boot and 0 on subsequent
// boots within the same isolate), and uses `console.warn` so the
// message reads as advisory. Forensic detail
// (stack) lives on `globalThis.__NS_REQUIRE_GUARD_LAST__` for
// post-mortem inspection. Set `globalThis.__NS_REQUIRE_GUARD_VERBOSE__`
// to `true` before any module loads to restore per-call logging.
export const REQUIRE_GUARD_SNIPPET = `// [guard] install require('http(s)://') detector\n(()=>{try{var g=globalThis;if(g.__NS_REQUIRE_GUARD_INSTALLED__){}else{var seen=g.__NS_REQUIRE_GUARD_SEEN__||(g.__NS_REQUIRE_GUARD_SEEN__=new Set());var mk=function(o,l){return function(){try{var s=arguments[0];if(typeof s==='string'&&/^(?:https?:)\\/\\//.test(s)){var k=l+'|'+s;var v=g.__NS_REQUIRE_GUARD_VERBOSE__===true;var first=!seen.has(k);if(first)seen.add(k);if(first||v){var e=new Error('[ns-hmr][require-guard] require of URL: '+s+' via '+l);if(v)console.warn(e.message+'\\n'+(e.stack||''));else console.warn(e.message);try{g.__NS_REQUIRE_GUARD_LAST__={spec:s,stack:e.stack,label:l,ts:Date.now()};}catch(e3){}}}}catch(e1){}return o.apply(this, arguments);};};if(typeof g.require==='function'&&!g.require.__NS_REQ_GUARDED__){var o1=g.require;g.require=mk(o1,'require');g.require.__NS_REQ_GUARDED__=true;}if(typeof g.__nsRequire==='function'&&!g.__nsRequire.__NS_REQ_GUARDED__){var o2=g.__nsRequire;g.__nsRequire=mk(o2,'__nsRequire');g.__nsRequire.__NS_REQ_GUARDED__=true;}g.__NS_REQUIRE_GUARD_INSTALLED__=true;}}catch(e){}})();\n`;
