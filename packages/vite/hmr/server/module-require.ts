import fs from 'node:fs';
import path from 'node:path';
import { isCSSRequest, parseAst, type DevEnvironment, type Plugin, type ResolvedConfig } from 'vite';
import { isBuiltinModuleId } from '../../helpers/builtin-modules.js';
import type { ModuleRequireKind } from '../../runtime/module-require.js';

/** The device helper every transformed module imports its `require` factory from. */
export const MODULE_REQUIRE_HELPER = '@nativescript/vite/runtime/module-require.js';

const REQUIRE = 'require';
const NON_WEBPACK_REQUIRE = '__non_webpack_require__';
const REQUIRE_NAMES = new Set([REQUIRE, NON_WEBPACK_REQUIRE]);

/** What a module does with the free (not locally bound) `require` / `__non_webpack_require__` identifiers. */
export interface FreeRequireUse {
	require: boolean;
	nonWebpackRequire: boolean;
	/** String-literal specifiers of free `require(...)` / `__non_webpack_require__(...)` calls, deduplicated, in source order. */
	specifiers: string[];
}

type AstNode = { type: string; [key: string]: any };

const functionTypeRE = /Function(?:Expression|Declaration)$|Method$/;
const blockTypeRE = /^(?:Program|BlockStatement|StaticBlock|SwitchStatement|For(?:In|Of)?Statement)$/;
const isFunction = (node: AstNode) => functionTypeRE.test(node.type);
const isVarScope = (node: AstNode) => node.type === 'Program' || isFunction(node);
const isBlockScope = (node: AstNode) => blockTypeRE.test(node.type);

// Children that must not see `parent` as an enclosing scope: an else branch nests
// inside the `if`, and a switch discriminant is evaluated outside the case block.
function isSkippedParent(node: AstNode, parent: AstNode): boolean {
	return (parent.type === 'IfStatement' && node === parent.alternate) || (parent.type === 'SwitchStatement' && node === parent.discriminant);
}

// Adapted from Vite's ssrTransform `isRefIdentifier`.
function isRefIdentifier(id: AstNode, parent: AstNode, parents: AstNode[], patternProperties: WeakSet<AstNode>): boolean {
	if (parent.type === 'CatchClause' || ((parent.type === 'VariableDeclarator' || parent.type === 'ClassDeclaration' || parent.type === 'ClassExpression') && parent.id === id)) return false;
	if (isFunction(parent) && (parent.id === id || parent.params.includes(id))) return false;
	if (parent.type === 'MethodDefinition' && !parent.computed) return false;
	if ((parent.type === 'PropertyDefinition' || parent.type === 'AccessorProperty') && !parent.computed) return parent.value === id;
	if (parent.type === 'Property' && !parent.computed && parent.key === id) return false;
	if (patternProperties.has(parent) && parent.value === id) return false;
	if (parent.type === 'ArrayPattern' && !parents.some((p) => p.type === 'AssignmentExpression')) return false;
	if (parent.type === 'MemberExpression' && parent.property === id && !parent.computed) return false;
	if ((parent.type === 'LabeledStatement' || parent.type === 'BreakStatement' || parent.type === 'ContinueStatement') && parent.label === id) return false;
	if (parent.type === 'MetaProperty') return false;
	if (parent.type === 'ExportSpecifier' || parent.type === 'ExportAllDeclaration') return false;
	return true;
}

function literalSpecifier(node: AstNode | undefined): string | null {
	if (!node) return null;
	if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
	if (node.type === 'TemplateLiteral' && node.expressions.length === 0 && node.quasis.length === 1) return node.quasis[0].value.cooked ?? null;
	return null;
}

/**
 * Finds the references to `require` and `__non_webpack_require__` that no
 * enclosing scope binds (module scope included), and the string-literal
 * specifiers they are called with.
 */
export function findFreeRequireUse(program: AstNode): FreeRequireUse {
	const scopes = new WeakMap<AstNode, Set<string>>();
	const patternProperties = new WeakSet<AstNode>();
	const candidates: Array<{ id: AstNode; parent: AstNode; parents: AstNode[] }> = [];
	const declare = (scope: AstNode | undefined, name: string) => {
		if (!scope || !REQUIRE_NAMES.has(name)) return;
		let names = scopes.get(scope);
		if (!names) scopes.set(scope, (names = new Set()));
		names.add(name);
	};
	const declarePattern = (pattern: AstNode | null, scope: AstNode | undefined) => {
		if (!pattern) return;
		switch (pattern.type) {
			case 'Identifier':
				declare(scope, pattern.name);
				break;
			case 'RestElement':
				declarePattern(pattern.argument, scope);
				break;
			case 'AssignmentPattern':
				declarePattern(pattern.left, scope);
				break;
			case 'ArrayPattern':
				for (const element of pattern.elements) declarePattern(element, scope);
				break;
			case 'ObjectPattern':
				for (const property of pattern.properties) declarePattern(property.type === 'RestElement' ? property.argument : property.value, scope);
				break;
		}
	};
	const isBound = (name: string, parents: AstNode[]) => parents.some((node) => scopes.get(node)?.has(name));

	const visit = (node: AstNode, parent: AstNode | null, parents: AstNode[]) => {
		if (node.type === 'ImportDeclaration') {
			for (const specifier of node.specifiers) declare(program, specifier.local.name);
			return;
		}
		if (parent && !isSkippedParent(node, parent)) parents = [parent, ...parents];
		if (node.type === 'Identifier') {
			if (parent && REQUIRE_NAMES.has(node.name) && isRefIdentifier(node, parent, parents, patternProperties)) candidates.push({ id: node, parent, parents });
			return;
		}
		if (isFunction(node)) {
			if (node.type === 'FunctionDeclaration' && node.id) declare(parents.find(isBlockScope), node.id.name);
			if (node.type === 'FunctionExpression' && node.id) declare(node, node.id.name);
			for (const param of node.params) declarePattern(param, node);
		} else if (node.type === 'ClassDeclaration' && node.id) {
			declare(parents.find(isBlockScope), node.id.name);
		} else if (node.type === 'ClassExpression' && node.id) {
			declare(node, node.id.name);
		} else if (node.type === 'Property' && parent?.type === 'ObjectPattern') {
			patternProperties.add(node);
		} else if (node.type === 'VariableDeclarator') {
			const kind = parent?.type === 'VariableDeclaration' ? parent.kind : 'var';
			declarePattern(node.id, parents.find(kind === 'var' ? isVarScope : isBlockScope));
		} else if (node.type === 'CatchClause' && node.param) {
			declarePattern(node.param, node);
		}
		for (const key in node) {
			if (key === 'type' || key === 'start' || key === 'end' || key === 'loc' || key === 'range') continue;
			const value = node[key];
			if (Array.isArray(value)) {
				for (const child of value) if (child && typeof child.type === 'string') visit(child, node, parents);
			} else if (value && typeof value.type === 'string') {
				visit(value, node, parents);
			}
		}
	};
	visit(program, null, []);

	const use: FreeRequireUse = { require: false, nonWebpackRequire: false, specifiers: [] };
	for (const { id, parent, parents } of candidates) {
		if (isBound(id.name, parents)) continue;
		if (id.name === REQUIRE) use.require = true;
		else use.nonWebpackRequire = true;
		if (parent.type === 'CallExpression' && parent.callee === id) {
			const specifier = literalSpecifier(parent.arguments[0]);
			if (specifier != null && !use.specifiers.includes(specifier)) use.specifiers.push(specifier);
		}
	}
	return use;
}

const cleanUrl = (id: string) => id.replace(/[?#].*$/s, '');

/** Specifiers the runtime's own require serves: `ns:` builtins and its `node:` shims (which `resolve.alias` may point elsewhere for imports). */
export function isRuntimeRequireSpecifier(specifier: string): boolean {
	return specifier.startsWith('node:') || isBuiltinModuleId(specifier);
}

/**
 * Vite's `isFilePathESM` for an importer id, which decides how import analysis
 * shapes a CommonJS dependency's namespace import (`interopNamedImports`).
 */
export function createNodeModeCheck(): (id: string) => boolean {
	const typeByDir = new Map<string, boolean>();
	const isModulePackageDir = (dir: string): boolean => {
		const cached = typeByDir.get(dir);
		if (cached !== undefined) return cached;
		let result = false;
		const pkg = path.join(dir, 'package.json');
		if (fs.existsSync(pkg)) {
			try {
				result = JSON.parse(fs.readFileSync(pkg, 'utf8')).type === 'module';
			} catch {}
		} else {
			const parent = path.dirname(dir);
			result = parent !== dir && isModulePackageDir(parent);
		}
		typeByDir.set(dir, result);
		return result;
	};
	return (id) => {
		if (/\.m[jt]s$/.test(id)) return true;
		if (/\.c[jt]s$/.test(id)) return false;
		if (id.startsWith('\0')) return true;
		if (!path.isAbsolute(id)) return false;
		return isModulePackageDir(path.dirname(id));
	};
}

const viteClientRE = /\/vite\/dist\/client\//;
const ownRuntimeRE = /\/runtime\/(?:module-require|strict-global-require)\.[cm]?[jt]s$/;

/**
 * Dev server only: gives each served module that uses a free `require` (or
 * webpack's `__non_webpack_require__`) a module-scoped `require` from
 * {@link MODULE_REQUIRE_HELPER}, so served code never reaches the runtime's
 * global `require`.
 *
 * A string-literal specifier that resolves when the module is served becomes a
 * hoisted `import * as` of that same specifier (import analysis writes its URL,
 * so the module has one instance), and `require` returns it synchronously.
 * `ns:` / `node:` specifiers go to the runtime's `createRequire`; anything else
 * throws when called, naming the module and the specifier.
 */
export function nsModuleRequirePlugin(): Plugin {
	let config: ResolvedConfig;
	let isNodeMode: (id: string) => boolean;
	return {
		name: 'ns-module-require',
		apply: 'serve',
		// After the framework compilers and Vite's TS transform, before import analysis.
		enforce: 'post',
		config(userConfig) {
			// `/@vite/env` turns each define into a global at boot, which would hand served
			// code the runtime's global require; served modules get the per-module one.
			if (userConfig.define && NON_WEBPACK_REQUIRE in userConfig.define) delete userConfig.define[NON_WEBPACK_REQUIRE];
		},
		configResolved(resolved) {
			config = resolved;
			const nodeMode = createNodeModeCheck();
			isNodeMode = (id) => !resolved.legacy?.inconsistentCjsInterop && nodeMode(id);
		},
		applyToEnvironment(environment) {
			return environment.config.consumer === 'client';
		},
		resolveId: {
			order: 'pre',
			handler(source) {
				// A node_modules importer may not see @nativescript/vite; resolve as the app does.
				if (source !== MODULE_REQUIRE_HELPER) return null;
				return this.resolve(source, path.join(config.root, 'package.json'), { skipSelf: true });
			},
		},
		async transform(code, id) {
			if (!code.includes(REQUIRE)) return null;
			const file = cleanUrl(id);
			const environment = this.environment as DevEnvironment;
			const optimizer = environment.depsOptimizer;
			if (optimizer?.isOptimizedDepFile(id) || viteClientRE.test(file) || ownRuntimeRE.test(file) || isCSSRequest(id)) return null;
			let program: AstNode;
			try {
				program = parseAst(code, { lang: 'js' }) as unknown as AstNode;
			} catch {
				// Import analysis reports the syntax error.
				return null;
			}
			const use = findFreeRequireUse(program);
			if (!use.require && !use.nonWebpackRequire) return null;

			const deps: Array<{ specifier: string; local: string; kind: ModuleRequireKind }> = [];
			for (const specifier of use.specifiers) {
				if (isRuntimeRequireSpecifier(specifier)) continue;
				const resolved = await this.resolve(specifier, id);
				if (!resolved) continue;
				let kind: ModuleRequireKind = 'esm';
				const resolvedFile = cleanUrl(resolved.id);
				if (resolvedFile.endsWith('.json')) {
					kind = 'default';
				} else if (optimizer?.isOptimizedDepFile(resolved.id)) {
					// Same metadata and fallback as import analysis' `optimizedDepNeedsInterop`.
					const info = optimizer.metadata.depInfoList.find((dep) => dep.file === resolvedFile);
					let needsInterop = info?.needsInterop;
					if (needsInterop === undefined && info?.src && info.exportsData) {
						const exportsData = await info.exportsData;
						needsInterop = !!environment.config.optimizeDeps.needsInterop?.includes(info.id) || !exportsData.hasModuleSyntax;
					}
					if (needsInterop) kind = isNodeMode(id) ? 'default' : 'interop';
				}
				deps.push({ specifier, local: `__nsRequireDep${deps.length}`, kind });
			}

			const importer = path.isAbsolute(file) ? path.relative(config.root, file).split(path.sep).join('/') : file;
			const table = `{${deps.map((dep) => `${JSON.stringify(dep.specifier)}:[${dep.local},${JSON.stringify(dep.kind)}]`).join(',')}}`;
			const factory = `__nsCreateModuleRequire(${JSON.stringify(importer)},${table})`;
			let prelude = `import { createModuleRequire as __nsCreateModuleRequire } from ${JSON.stringify(MODULE_REQUIRE_HELPER)};`;
			for (const dep of deps) prelude += `import * as ${dep.local} from ${JSON.stringify(dep.specifier)};`;
			if (use.require) {
				prelude += `const ${REQUIRE} = ${factory};`;
				if (use.nonWebpackRequire) prelude += `const ${NON_WEBPACK_REQUIRE} = ${REQUIRE};`;
			} else {
				prelude += `const ${NON_WEBPACK_REQUIRE} = ${factory};`;
			}
			// Kept on the first line (after a hashbang) so no line moves and the incoming source map still fits.
			const at = code.startsWith('#!') ? code.indexOf('\n') + 1 : 0;
			if (code.startsWith('#!') && at === 0) return null;
			return { code: code.slice(0, at) + prelude + code.slice(at), map: null };
		},
	};
}
