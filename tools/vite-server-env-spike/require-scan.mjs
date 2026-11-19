// Static require check shared by thin-crawl.mjs and payload-probe.mjs, independent of the dev
// server's own scope walk (acorn + eslint-scope).
// Served code must not reach a global require: no free `require` / `__require` /
// `__non_webpack_require__` reference may remain. A pre-bundle's `__require("x")` (Rolldown's
// helper, bound locally) falls back to the global require at runtime, so one naming an EXCLUDED
// package fails; the other pre-bundle internals are listed. Served modules must not call
// `globalThis.require(` / `global.require(` / `self.require(` either (the strict shadow may define it).
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const repoRoot = path.resolve(import.meta.dirname, '../..');
const rootReq = createRequire(path.join(repoRoot, 'package.json'));
const acorn = await import(pathToFileURL(rootReq.resolve('acorn')).href);
const eslintScope = rootReq('eslint-scope');

const REQUIRE_NAMES = new Set(['require', '__require', '__non_webpack_require__']);
const GLOBAL_OBJECT_NAMES = new Set(['globalThis', 'global', 'self']);
/** Cheap pre-filter: a body without one of these tokens cannot fail the check. */
export const REQUIRE_TOKEN_RE = /\b(require|__require|__non_webpack_require__)\b/;
const literalArg = (node) => (node?.type === 'Literal' && typeof node.value === 'string' ? node.value : node?.type === 'TemplateLiteral' && !node.expressions.length ? node.quasis[0].value.cooked : null);

/** `{ free, helperCalls, memberCalls }` for a module body, or `{ error }` when it does not parse. */
export function scanRequires(code) {
	let ast;
	try {
		ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', allowHashBang: true, ranges: true });
	} catch (error) {
		return { error: error.message };
	}
	const callArg = new Map();
	const memberCallArg = new Map();
	// `context` names the enclosing `<x>.System = { import() {...} }` method, the one known site.
	const walk = (node, context = null) => {
		if (!node || typeof node.type !== 'string') return;
		if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && REQUIRE_NAMES.has(node.callee.name)) callArg.set(node.callee, literalArg(node.arguments[0]));
		const callee = node.type === 'CallExpression' ? node.callee : null;
		if (callee?.type === 'MemberExpression' && callee.object.type === 'Identifier' && GLOBAL_OBJECT_NAMES.has(callee.object.name) && (callee.computed ? literalArg(callee.property) : callee.property.name) === 'require') {
			memberCallArg.set(callee.object, { spec: literalArg(node.arguments[0]), context });
		}
		let childContext = context;
		if (node.type === 'AssignmentExpression' && node.left.type === 'MemberExpression' && !node.left.computed && node.left.property.name === 'System') childContext = 'System';
		else if (context === 'System' && node.type === 'Property' && !node.computed && node.key.name === 'import') childContext = 'System.import';
		else if (context === 'System' && node.type !== 'ObjectExpression') childContext = null;
		for (const key in node) {
			const v = node[key];
			const next = key === 'left' && node.type === 'AssignmentExpression' ? context : childContext;
			if (Array.isArray(v)) v.forEach((child) => walk(child, next));
			else if (v && typeof v === 'object' && key !== 'loc') walk(v, next);
		}
	};
	walk(ast);
	const free = [];
	const memberCalls = [];
	let manager;
	try {
		manager = eslintScope.analyze(ast, { ecmaVersion: 2022, sourceType: 'module', fallback: 'iteration' });
	} catch (error) {
		return { error: `scope analysis: ${error.message}` };
	}
	for (const ref of manager.globalScope.through) {
		const id = ref.identifier;
		if (memberCallArg.has(id)) memberCalls.push({ name: `${id.name}.require`, via: `${id.name}.require()`, spec: memberCallArg.get(id).spec ?? null, context: memberCallArg.get(id).context });
		if (!REQUIRE_NAMES.has(id.name)) continue;
		free.push({ name: id.name, call: callArg.has(id), spec: callArg.get(id) ?? null });
	}
	const helperCalls = [...callArg].filter(([id]) => id.name === '__require').map(([, spec]) => spec);
	return { free, helperCalls, memberCalls };
}

// Core's `global.System = { import(path) { ... global.require(path) ... } }` shim: no caller found; reported, not failed.
const CORE_GLOBALS_RE = /\/(?:@nativescript\/core|packages\/core)\/globals\/index\.[jt]s$/;
export const isKnownUncalledGlobalRequire = (pathname, call) => CORE_GLOBALS_RE.test(pathname) && call.name === 'global.require' && call.context === 'System.import';
/** The opt-in strict shadow defines `globalThis.require` itself. */
export const isStrictGlobalRequireShadow = (pathname) => /\/runtime\/strict-global-require\.js$/.test(pathname);

/** A pre-bundle's require-like calls: `__require` / free calls naming an excluded package fail, the rest are internals. */
export function classifyDepRequires(scan, isExcludedSpec) {
	const failures = [];
	const internals = [];
	const specs = [...scan.helperCalls.map((spec) => ({ via: '__require', spec })), ...scan.free.filter((f) => f.name !== '__require').map((f) => ({ via: `free ${f.name}${f.call ? '()' : ''}`, spec: f.spec }))];
	for (const entry of specs) (entry.spec != null && isExcludedSpec(entry.spec) ? failures : internals).push(entry);
	return { failures, internals };
}
