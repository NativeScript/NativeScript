// AST-first normalization helpers for HMR HTTP ESM runtime
// - Ensures a single default import from '/ns/rt' with one destructure of underscored helpers
// - Filters $navigateTo/$navigateBack from any /ns/rt named imports at the AST boundary
// - Adds a verification pass to annotate duplicate top-level const/let bindings

import { parse as babelParse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { genCode } from './babel.js';

// Ensure traverse callable across CJS/ESM builds
const babelTraverse: any = (traverse as any)?.default || (traverse as any);

// Normalize imports and helper aliases deterministically.
// Contract:
// - Input: arbitrary JS/TS module text
// - Output: JS with a single default import from '/ns/rt' and one destructure for any underscored helpers used
// - Navigation helpers are stripped from any /ns/rt named imports
// - A marker comment '/* [ast-normalized] */' is injected at the top
export function astNormalizeModuleImportsAndHelpers(code: string): string {
	try {
		// Pre-scan for underscored helper usages to inform aliasing during import rewrite
		const needAlias = new Set<string>();
		try {
			const re = /(^|[^.\w$])_([A-Za-z]\w*)\b/g;
			let m: RegExpExecArray | null;
			while ((m = re.exec(code))) {
				const base = m[2].replace(/^_+/, '');
				if (!/(^|_)(ctx|cache)$/.test(base) && !/^(hoisted_|component_|directive_|sfc_main|ns_sfc__|ns_sfc|sfc)/.test(base)) {
					needAlias.add(base);
				}
			}
		} catch {}
		const ast = babelParse(code, {
			sourceType: 'module',
			plugins: ['typescript', 'jsx', 'importMeta', 'topLevelAwait'] as any,
			errorRecovery: true,
			allowReturnOutsideFunction: true,
			allowUndeclaredExports: true,
		});

		const underscoreUses = new Set<string>();
		const declared = new Set<string>();
		let navToUsed = false;
		let navBackUsed = false;
		let defineStoreUsed = false;
		let showModalUsed = false;

		const isRtLike = (src: string | null | undefined) => !!src && /(?:https?:\/\/[^"']+)?\/ns\/rt(?:\/[\d]+)?(?:\?p=[^"']+)?$/.test(src);
		const isCoreLike = (src: string | null | undefined) => !!src && /(?:https?:\/\/[^"']+)?\/ns\/core(?:\/[\d]+)?(?:\?p=[^"']+)?$/.test(src);
		const isSfcPath = (src: string | null | undefined) => !!src && /\.vue(?:\?|$)/.test(src);
		const isVuePrebundle = (src: string | null | undefined) => !!src && /\.vite\/deps\/(?:vue|nativescript-vue)[^/]*\.js/.test(src);
		const isVuePackage = (src: string | null | undefined) => !!src && (src === 'vue' || src.startsWith('vue/') || src.includes('nativescript-vue'));
		const isVueLike = (src: string | null | undefined) => (isVuePackage(src) || isVuePrebundle(src)) && !isSfcPath(src);
		const isViteVirtual = (src: string | null | undefined) => !!src && (/\/\@id\//.test(src) || /\0/.test(src) || /__x00__/.test(src));
		const isVitePrebundle = (src: string | null | undefined) => !!src && /node_modules\/\.vite\/deps\//.test(src);
		const vitePrebundleId = (src: string | null | undefined): string | null => {
			if (!src) return null;
			const m = src.match(/\.vite\/deps\/([^?]+?)\.[mc]?js/);
			return m ? m[1] : null;
		};
		const isNsCorePackage = (src: string | null | undefined) => !!src && /^@nativescript\/core(\/.*)?$/.test(src);

		let seq = 0;
		const makeUid = (hint: string) => `__ns_${hint}_${++seq}`;
		const uniqueRtLocal = (preferred?: string) => {
			let name = preferred && !declared.has(preferred) ? preferred : '';
			if (!name) {
				let i = 1;
				while (declared.has(`__ns_rt_ns_${i}`)) i++;
				name = `__ns_rt_ns_${i}`;
			}
			return name;
		};

		let existingRtImport: t.ImportDeclaration | null = null;
		let existingRtDefaultLocal: string | null = null;
		const existingRtLocals = new Set<string>();

		babelTraverse(ast, {
			Program(path) {
				Object.keys(path.scope.bindings).forEach((b) => declared.add(b));
			},
			ImportDeclaration(path) {
				const src = path.node.source?.value as string;
				if (src === '@') {
					path.node.source = t.stringLiteral('/ns/m/__invalid_at__.mjs');
				}
				if (isVueLike(src)) {
					path.node.source = t.stringLiteral('/ns/rt');
				} else if (isNsCorePackage(src)) {
					// Rewrite any @nativescript/core[/*] to the HTTP-ESM bridge
					path.node.source = t.stringLiteral('/ns/core');
				} else if (isVitePrebundle(src)) {
					const id = vitePrebundleId(src);
					if (id && /^(?:pinia)(?:$|[_\.-])/.test(id)) {
						// Rewrite pinia prebundles to bare 'pinia' so vendor binding can handle it later
						path.node.source = t.stringLiteral('pinia');
					} else if (isVuePrebundle(src)) {
						// Route vue prebundles to runtime bridge
						path.node.source = t.stringLiteral('/ns/rt');
					} else {
						// Keep other prebundles as-is; they may be fetchable directly from the dev server
					}
				} else if (isViteVirtual(src) || src === '@vite/client' || src === '/@vite/client') {
					// Removing the Vite client import should also remove its declared locals from our
					// `declared` set; otherwise later bridge rewrites may unnecessarily suffix names
					// (e.g. `__vite__createHotContext_1`) while call sites still reference the original.
					try {
						for (const s of path.node.specifiers || []) {
							const local = (s as any)?.local?.name;
							if (typeof local === 'string' && local) declared.delete(local);
						}
					} catch {}
					path.remove();
					return;
				}
				const isRt = isRtLike(path.node.source?.value as string);
				const isCore = isCoreLike(path.node.source?.value as string);
				// Ensure any generated binding names are valid identifiers and not reserved like 'this'
				const isValidLocal = (n: string) => {
					try {
						return t.isValidIdentifier(n) && n !== 'this';
					} catch {
						return /^[A-Za-z_$][\w$]*$/.test(n) && n !== 'this';
					}
				};
				const makeUniqueLocal = (base: string) => {
					let name = base;
					if (!isValidLocal(name)) {
						name = `__ns_${name.replace(/[^A-Za-z0-9_$]+/g, '_') || 'id'}`;
					}
					let i = 1;
					let cand = name;
					while (declared.has(cand)) {
						cand = `${name}_${i++}`;
					}
					declared.add(cand);
					return cand;
				};
				if (isRt || isCore) {
					let named = (path.node.specifiers || []).filter((s) => t.isImportSpecifier(s)) as t.ImportSpecifier[];
					if (isRt && named.length) {
						named = named.filter((s) => {
							const imp = s.imported as any;
							const name = (imp && (imp.name || String(imp))) as string;
							return name !== '$navigateTo' && name !== '$navigateBack';
						});
					}
					const hasDefault = path.node.specifiers.some((s) => t.isImportDefaultSpecifier(s));
					const hasNamespace = path.node.specifiers.some((s) => t.isImportNamespaceSpecifier(s));
					if (isRt) {
						// If we already have a default /ns/rt local chosen, rewrite this import to use it and remove the import
						if (existingRtDefaultLocal) {
							// If this import has a default with a different local, create an alias const newLocal = existingLocal;
							const def = path.node.specifiers.find((s) => t.isImportDefaultSpecifier(s)) as t.ImportDefaultSpecifier | undefined;
							if (def) {
								const newLocal = def.local.name;
								if (newLocal !== existingRtDefaultLocal) {
									const alias = t.variableDeclaration('const', [t.variableDeclarator(t.identifier(newLocal), t.identifier(existingRtDefaultLocal))]);
									path.insertAfter(alias);
								}
							}
							// If there are named specifiers, emit a destructure off existing default
							if (named.length) {
								const props = named.map((s) => {
									const imp: any = s.imported as any;
									const importedName = (imp && (imp.name || imp.value || String(imp))) as string;
									// Skip internal bridge sentinels that would collide with explicit core imports
									if (importedName === 'ns_core_ns_1') {
										return null as any;
									}
									// Also skip any accidental rt sentinel properties (e.g., 'ns_rt_ns_1')
									if (/^ns_rt_ns_\d+$/.test(importedName)) {
										return null as any;
									}
									const wantAlias = needAlias.has(importedName);
									const localName = wantAlias ? `_${importedName}` : s.local.name;
									existingRtLocals.add(localName);
									// build safe property (string key if not valid identifier or is 'this')
									const keyIsId = (() => {
										try {
											return t.isValidIdentifier(importedName) && importedName !== 'this';
										} catch {
											return /^[A-Za-z_$][\w$]*$/.test(importedName) && importedName !== 'this';
										}
									})();
									const key = keyIsId ? (t.identifier(importedName) as any) : (t.stringLiteral(importedName) as any);
									const shorthand = keyIsId && localName === importedName;
									return t.objectProperty(key, t.identifier(localName), false, shorthand);
								});
								const safeProps = props.filter(Boolean) as t.ObjectProperty[];
								if (safeProps.length) {
									const decl = t.variableDeclaration('const', [t.variableDeclarator(t.objectPattern(safeProps), t.identifier(existingRtDefaultLocal))]);
									path.insertAfter(decl);
								}
							}
							// Remove this import entirely (dedupe)
							path.remove();
							return;
						}
						// First time we see /ns/rt: capture default or synthesize one
						if (!existingRtImport) existingRtImport = path.node;
						const def = path.node.specifiers.find((s) => t.isImportDefaultSpecifier(s)) as t.ImportDefaultSpecifier | undefined;
						if (def) existingRtDefaultLocal = def.local.name;
						if (!existingRtDefaultLocal) {
							// No default present: add one
							const tmp = uniqueRtLocal();
							path.node.specifiers.unshift(t.importDefaultSpecifier(t.identifier(tmp)));
							existingRtDefaultLocal = tmp;
						}
						// Convert any named specifiers to destructure and drop them from the import
						if (named.length) {
							const props = named.map((s) => {
								const imp: any = s.imported as any;
								const importedName = (imp && (imp.name || imp.value || String(imp))) as string;
								// Skip internal bridge sentinels that would collide with explicit core imports
								if (importedName === 'ns_core_ns_1') {
									return null as any;
								}
								// Also skip any accidental rt sentinel properties (e.g., 'ns_rt_ns_1')
								if (/^ns_rt_ns_\d+$/.test(importedName)) {
									return null as any;
								}
								const wantAlias = needAlias.has(importedName);
								const localName = wantAlias ? `_${importedName}` : s.local.name;
								existingRtLocals.add(localName);
								const keyIsId = (() => {
									try {
										return t.isValidIdentifier(importedName) && importedName !== 'this';
									} catch {
										return /^[A-Za-z_$][\w$]*$/.test(importedName) && importedName !== 'this';
									}
								})();
								const key = keyIsId ? (t.identifier(importedName) as any) : (t.stringLiteral(importedName) as any);
								const shorthand = keyIsId && localName === importedName;
								return t.objectProperty(key, t.identifier(localName), false, shorthand);
							});
							const safeProps = props.filter(Boolean) as t.ObjectProperty[];
							if (safeProps.length) {
								const decl = t.variableDeclaration('const', [t.variableDeclarator(t.objectPattern(safeProps), t.identifier(existingRtDefaultLocal))]);
								path.insertAfter(decl);
							}
							path.node.specifiers = path.node.specifiers.filter((s) => !t.isImportSpecifier(s));
						}
						// Collect any local names introduced by this import for declared set
						for (const s of path.node.specifiers) {
							if ((s as any).local?.name) declared.add((s as any).local.name);
						}
						return;
					}

					// Non-rt core path: handle like before
					if (named.length) {
						let tmpName = hasDefault && !hasNamespace ? (path.node.specifiers.find((s) => t.isImportDefaultSpecifier(s)) as t.ImportDefaultSpecifier).local.name : makeUid(isCore ? 'core_ns' : 'ns');
						if (!hasDefault || hasNamespace) {
							path.node.specifiers = [t.importDefaultSpecifier(t.identifier(tmpName))];
						}
						const props = named.map((s) => {
							const imp: any = s.imported as any;
							const importedName = (imp && (imp.name || imp.value || String(imp))) as string;
							const keyIsId = (() => {
								try {
									return t.isValidIdentifier(importedName) && importedName !== 'this';
								} catch {
									return /^[A-Za-z_$][\w$]*$/.test(importedName) && importedName !== 'this';
								}
							})();
							const key = keyIsId ? (t.identifier(importedName) as any) : (t.stringLiteral(importedName) as any);
							const shorthand = keyIsId && s.local.name === importedName;
							return t.objectProperty(key, t.identifier(s.local.name), false, shorthand);
						});
						const decl = t.variableDeclaration('const', [t.variableDeclarator(t.objectPattern(props), t.identifier(tmpName))]);
						path.insertAfter(decl);
						path.node.specifiers = path.node.specifiers.filter((s) => !t.isImportSpecifier(s));
					}
				}
			},
			ImportExpression(path) {
				const arg = path.node.source;
				if (t.isStringLiteral(arg)) {
					const src = arg.value;
					if (isVueLike(src)) {
						path.node.source = t.stringLiteral('/ns/rt');
					} else if (isNsCorePackage(src)) {
						path.node.source = t.stringLiteral('/ns/core');
					}
				}
			},
			CallExpression(path) {
				if (t.isImport(path.node.callee) || (t.isIdentifier(path.node.callee) && path.node.callee.name === 'import')) {
					const first = path.node.arguments[0];
					if (t.isStringLiteral(first)) {
						if (isVueLike(first.value)) {
							path.node.arguments[0] = t.stringLiteral('/ns/rt');
						} else if (isNsCorePackage(first.value)) {
							path.node.arguments[0] = t.stringLiteral('/ns/core');
						}
					}
					return;
				}
				if (t.isIdentifier(path.node.callee) && path.node.callee.name === 'require') {
					const first = path.node.arguments[0];
					if (t.isStringLiteral(first)) {
						const v = first.value;
						if (isVueLike(v)) {
							path.node.arguments[0] = t.stringLiteral('/ns/rt');
						} else if (isNsCorePackage(v)) {
							path.node.arguments[0] = t.stringLiteral('/ns/core');
						}
					}
				}
			},
			VariableDeclarator(path) {
				const id = path.node.id;
				if (t.isIdentifier(id)) {
					declared.add(id.name);
				} else if (t.isObjectPattern(id)) {
					for (const prop of id.properties) {
						if (t.isObjectProperty(prop)) {
							const val: any = prop.value as any;
							if (t.isIdentifier(val)) declared.add(val.name);
							else if (t.isAssignmentPattern(val) && t.isIdentifier(val.left)) declared.add(val.left.name);
						} else if (t.isRestElement(prop)) {
							const arg: any = prop.argument as any;
							if (t.isIdentifier(arg)) declared.add(arg.name);
						}
					}
				}
			},
			FunctionDeclaration(path) {
				if (path.node.id?.name) declared.add(path.node.id.name);
			},
			Identifier(path) {
				const name = path.node.name;
				if (!name || !name.startsWith('_')) return;
				if (/^__ns_(?:rt|core)_ns(?:\d+|_re)$/.test(name)) return;
				if (path.scope.hasBinding(name)) return;
				if (t.isObjectProperty(path.parent) && path.parent.key === path.node && !path.parent.computed) return;
				if (t.isMemberExpression(path.parent) && path.parent.property === path.node && !path.parent.computed) return;
				if (/^(ctx|cache)$/.test(name)) return;
				if (/^(sfc_main|ns_sfc__|sfc)/.test(name)) return;
				if (/^(hoisted_|component_|directive_)/.test(name)) return;
				underscoreUses.add(name);
			},
		});

		// Detect free uses of $navigateTo/$navigateBack (not declared at top-level)
		try {
			babelTraverse(ast as any, {
				Identifier(path: any) {
					const nm = path.node.name;
					// detect defineStore and navigation helpers as free uses
					if (nm !== '$navigateTo' && nm !== '$navigateBack' && nm !== '$showModal' && nm !== 'defineStore') return;
					// Ignore property keys like obj.$navigateTo or { $navigateTo: ... }
					if (t.isObjectProperty(path.parent) && path.parent.key === path.node && !path.parent.computed) return;
					if (t.isMemberExpression(path.parent) && path.parent.property === path.node && !path.parent.computed) return;
					// If any scope provides a binding, treat it as declared (avoid shadowing locals)
					if (path.scope.hasBinding(nm)) return;
					if (nm === '$navigateTo') navToUsed = true;
					if (nm === '$navigateBack') navBackUsed = true;
					if (nm === '$showModal') showModalUsed = true;
					if (nm === 'defineStore') defineStoreUsed = true;
				},
			});
		} catch {}

		// Fallback: if traversal didn't detect underscored helper uses, do a conservative text scan
		if (!underscoreUses.size) {
			try {
				const re = /(^|[^.\w$])_([A-Za-z]\w*)\b/g;
				let m: RegExpExecArray | null;
				while ((m = re.exec(code))) {
					const name = m[2];
					// Never consider `_this` as a helper alias
					if (name === 'this') continue;
					if (/(^|_)(ctx|cache)$/.test(name)) continue;
					if (/^(hoisted_|component_|directive_|sfc_main|ns_sfc__|ns_sfc|sfc)/.test(name)) continue;
					underscoreUses.add(name);
				}
			} catch {}
		}

		if (underscoreUses.size) {
			let defLocal = existingRtDefaultLocal;
			if (!defLocal) {
				defLocal = uniqueRtLocal();
				if (existingRtImport) {
					existingRtImport.specifiers.unshift(t.importDefaultSpecifier(t.identifier(defLocal)));
					existingRtDefaultLocal = defLocal;
				} else {
					const imp = t.importDeclaration([t.importDefaultSpecifier(t.identifier(defLocal))], t.stringLiteral('/ns/rt'));
					(ast.program as any).body.unshift(imp);
					existingRtImport = imp;
					existingRtDefaultLocal = defLocal;
				}
			}
			const props: t.ObjectProperty[] = [];
			for (const underscored of underscoreUses) {
				// Never alias our own generated internals
				if (/^__ns_(?:rt|core)_ns(?:\d+|_re)$/.test(underscored)) continue;
				const base = underscored.replace(/^_+/, '');
				// Do not attempt to destructure a property named 'this' from /ns/rt
				if (base === 'this') continue;
				// Ensure local binding is a valid, non-reserved identifier
				let localName = underscored;
				if (!t.isIdentifier(t.identifier(localName)) || localName === 'this') {
					localName = `__ns_${base || 'id'}`;
				}
				while (declared.has(localName)) {
					localName = `${localName}_1`;
				}
				declared.add(localName);
				existingRtLocals.add(localName);
				// Safe key: use identifier if valid and not 'this', otherwise string literal
				const keyIsId = (() => {
					try {
						return t.isValidIdentifier(base) && base !== 'this';
					} catch {
						return /^[A-Za-z_$][\w$]*$/.test(base) && base !== 'this';
					}
				})();
				const key = keyIsId ? (t.identifier(base) as any) : (t.stringLiteral(base) as any);
				const shorthand = keyIsId && localName === base;
				props.push(t.objectProperty(key, t.identifier(localName), false, shorthand));
			}
			if (props.length) {
				const decl = t.variableDeclaration('const', [t.variableDeclarator(t.objectPattern(props), t.identifier(defLocal!))]);
				const body: any[] = (ast.program as any).body as any[];
				const idx = existingRtImport ? body.indexOf(existingRtImport as any) : -1;
				if (idx >= 0) body.splice(idx + 1, 0, decl);
				else body.unshift(decl);
			}
		}

		// Final clean-up: dedupe any remaining /ns/rt default imports
		try {
			const prog: any = ast.program as any;
			const body: any[] = prog.body as any[];
			let keptDefaultLocal: string | null = null;
			const newBody: any[] = [];
			for (const node of body) {
				if (t.isImportDeclaration(node) && isRtLike((node.source as any)?.value)) {
					const def = node.specifiers.find((s) => t.isImportDefaultSpecifier(s as any)) as t.ImportDefaultSpecifier | undefined;
					if (def) {
						const local = def.local.name;
						if (!keptDefaultLocal) {
							keptDefaultLocal = local;
							newBody.push(node);
							continue;
						}
						if (local === keptDefaultLocal) {
							// duplicate identical default import -> drop
							continue;
						}
						// different local -> alias and drop import
						newBody.push(t.variableDeclaration('const', [t.variableDeclarator(t.identifier(local), t.identifier(keptDefaultLocal))]));
						continue;
					}
					// no default specifier -> drop (named-only imports should have been rewritten)
					continue;
				}
				newBody.push(node);
			}
			prog.body = newBody;
		} catch {}

		// Merge multiple destructures from the same /ns/rt namespace and strip navigation helpers from them
		try {
			const rtNames = new Set<string>();
			if (existingRtDefaultLocal) rtNames.add(existingRtDefaultLocal);
			// Also add any obvious temp namespace names we generate
			rtNames.add('__ns_rt_ns_1');
			rtNames.add('__ns_rt_ns_2'); // heuristic; real merges keyed by actual matches below
			const collected = new Map<string, t.ObjectProperty>();
			const toRemove: any[] = [];
			const body: any[] = (ast.program as any).body as any[];
			const defaultLocal = existingRtDefaultLocal || '__ns_rt_ns_1';
			for (const stmt of body) {
				if (t.isVariableDeclaration(stmt)) {
					const remaining: t.VariableDeclarator[] = [];
					for (const d of stmt.declarations as t.VariableDeclarator[]) {
						if (t.isObjectPattern(d.id) && t.isIdentifier((d as any).init)) {
							const initName = ((d as any).init as t.Identifier).name;
							if (rtNames.has(initName) || /^__ns_rt_ns(?:\d+|_re)$/.test(initName)) {
								for (const p of d.id.properties) {
									if (t.isObjectProperty(p)) {
										const key = (p.key as any).name || String(p.key as any);
										if (key === '$navigateTo' || key === '$navigateBack') continue;
										// Skip internal core bridge sentinel(s) to avoid duplicate locals like __ns_core_ns_1/__ns_core_ns_2
										if (/^ns_core_ns_\d+$/.test(key)) continue;
										// Skip any accidental runtime sentinel property mappings (e.g., ns_rt_ns_1)
										if (/^ns_rt_ns_\d+$/.test(key)) continue;
										const localId = (p.value as any).name || String(p.value as any);
										// Never collect bindings that shadow the default import local
										if (localId === defaultLocal || key === defaultLocal) continue;
										if (/^__ns_rt_ns(?:\d+|_re)$/.test(localId) || /^__ns_rt_ns(?:\d+|_re)$/.test(key)) continue;
										// Also skip any locals that look like core bridge internals to prevent shadowing
										if (/^__ns_core_ns(?:\d+|_re)$/.test(localId) || /^__ns_core_ns(?:\d+|_re)$/.test(key)) continue;
										if (!collected.has(localId)) {
											collected.set(localId, t.objectProperty(t.identifier(key), t.identifier(localId)));
										}
									}
								}
								continue; // drop this declarator
							}
						}
						remaining.push(d);
					}
					(stmt as any).declarations = remaining;
					if (remaining.length === 0) toRemove.push(stmt);
				}
			}
			if (toRemove.length) {
				(ast.program as any).body = body.filter((n) => !toRemove.includes(n));
			}
			if (collected.size) {
				const props = Array.from(collected.values());
				const defLocal = existingRtDefaultLocal || '__ns_rt_ns_1';
				const merged = t.variableDeclaration('const', [t.variableDeclarator(t.objectPattern(props), t.identifier(defLocal))]);
				const prog: any = ast.program as any;
				const body2: any[] = prog.body as any[];
				const idx = existingRtImport ? body2.indexOf(existingRtImport as any) : -1;
				if (idx >= 0) body2.splice(idx + 1, 0, merged);
				else body2.unshift(merged);
			}
		} catch {}

		// Targeted cleanup: remove any ns_core_ns_<n> property from destructures of /ns/rt default locals.
		// This prevents creating locals like __ns_core_ns_1/__ns_core_ns_2 that could collide with an explicit core default import.
		try {
			babelTraverse(ast as any, {
				VariableDeclarator(path: any) {
					const id = path.node.id;
					const init = path.node.init;
					if (!t.isObjectPattern(id) || !t.isIdentifier(init)) return;
					const initName = init.name;
					if (!(initName && (/^__ns_rt_ns(?:\d+|_re)$/.test(initName) || initName === existingRtDefaultLocal))) return;
					const props = id.properties.filter((p: any) => !(t.isObjectProperty(p) && /^ns_core_ns_\d+$/.test(((p.key as any).name || String(p.key as any)) as string)));
					if (props.length === 0) {
						path.remove();
					} else if (props.length !== id.properties.length) {
						path.node.id = t.objectPattern(props as any);
					}
				},
			});
		} catch {}

		// Inject navigation wrappers and defineStore destructure if referenced but not declared at top level
		try {
			const needTo = navToUsed && !declared.has('$navigateTo');
			const needBack = navBackUsed && !declared.has('$navigateBack');
			const needShow = showModalUsed && !declared.has('$showModal');
			const needDefineStore = defineStoreUsed && !declared.has('defineStore');
			if (needTo || needBack || needShow || needDefineStore) {
				// Ensure a default /ns/rt local exists to source wrappers from
				if (!existingRtDefaultLocal) {
					const tmp = uniqueRtLocal();
					const imp = t.importDeclaration([t.importDefaultSpecifier(t.identifier(tmp))], t.stringLiteral('/ns/rt'));
					(ast.program as any).body.unshift(imp);
					existingRtDefaultLocal = tmp;
					existingRtImport = imp as any;
				}
				const rtId = t.identifier(existingRtDefaultLocal!);
				const decls: t.VariableDeclaration[] = [];
				if (needTo) {
					const param = t.restElement(t.identifier('args'));
					const call = t.callExpression(t.memberExpression(rtId, t.identifier('$navigateTo')), [t.spreadElement(t.identifier('args'))]);
					const arrow = t.arrowFunctionExpression([param as any], call);
					decls.push(t.variableDeclaration('const', [t.variableDeclarator(t.identifier('$navigateTo'), arrow)]));
				}
				if (needBack) {
					const param = t.restElement(t.identifier('args'));
					const call = t.callExpression(t.memberExpression(rtId, t.identifier('$navigateBack')), [t.spreadElement(t.identifier('args'))]);
					const arrow = t.arrowFunctionExpression([param as any], call);
					decls.push(t.variableDeclaration('const', [t.variableDeclarator(t.identifier('$navigateBack'), arrow)]));
				}
				if (needDefineStore) {
					// const { defineStore } = __ns_rt_ns_X;
					const prop = t.objectProperty(t.identifier('defineStore'), t.identifier('defineStore'), false, true);
					decls.push(t.variableDeclaration('const', [t.variableDeclarator(t.objectPattern([prop]), rtId)]));
					declared.add('defineStore');
				}
				if (needShow) {
					// const { $showModal } = __ns_rt_ns_X;
					const prop = t.objectProperty(t.identifier('$showModal'), t.identifier('$showModal'), false, true);
					decls.push(t.variableDeclaration('const', [t.variableDeclarator(t.objectPattern([prop]), rtId)]));
					declared.add('$showModal');
				}
				// Insert wrappers immediately after the rt import if present, else at top
				const bodyArr: any[] = (ast.program as any).body as any[];
				const idx = existingRtImport ? bodyArr.indexOf(existingRtImport as any) : -1;
				if (idx >= 0) {
					bodyArr.splice(idx + 1, 0, ...(decls as any));
				} else {
					(ast.program as any).body = [...(decls as any), ...bodyArr];
				}
			}
		} catch {}

		let { code: out } = genCode(ast, { retainLines: true, compact: false });
		// Textual safety net: drop duplicate identical default imports from /ns/rt
		try {
			const seen = new Set<string>();
			out = out.replace(/\bimport\s+(\w+)\s+from\s+["']\/ns\/rt["'];?/g, (match, local) => {
				if (seen.has(local)) {
					return '';
				}
				seen.add(local);
				return match;
			});
		} catch {}
		// Textual safety net: remove ns_core_ns_<n> and ns_rt_ns_* destructures off __ns_rt_ns_* (and off the actual /ns/rt local) to avoid local collisions or bogus aliasing
		try {
			// If we can detect the actual default local imported from /ns/rt, also heal destructures off that identifier
			try {
				const m = out.match(/import\s+([A-Za-z_$][\w$]*)\s+from\s+["']\/ns\/rt["']/);
				const rtLocal = m ? m[1] : null;
				if (rtLocal) {
					// Remove any ns_core_ns_<n> mapping inside destructures off that local (standalone and multi-prop positions)
					const rtId = rtLocal.replace(/[$]/g, '\\$&');
					const reStandalone = new RegExp(`(^|\\n)\\s*const\\s*\\{[^}]*ns_core_ns_\\d+\\s*:\\s*__ns_core_ns_(?:\\d+|re)[^}]*\\}\\s*=\\s*${rtId}\\s*;\\s*`, 'g');
					out = out.replace(reStandalone, '$1');
					const reLead = new RegExp(`(\\{\\s*)ns_core_ns_\\d+\\s*:\\s*__ns_core_ns_(?:\\d+|re)\\s*,\\s*([^}]*\\}\\s*=\\s*${rtId}\\s*;)`, 'g');
					out = out.replace(reLead, '{$2');
					const reTrail = new RegExp(`(\\{[^}]*?,)\\s*ns_core_ns_\\d+\\s*:\\s*__ns_core_ns_(?:\\d+|re)\\s*(\\}\\s*=\\s*${rtId}\\s*;)`, 'g');
					out = out.replace(reTrail, '$1$2');
					const reMid = new RegExp(`(\\{[^}]*?,)\\s*ns_core_ns_\\d+\\s*:\\s*__ns_core_ns_(?:\\d+|re)\\s*,\\s*([^}]*\\}\\s*=\\s*${rtId}\\s*;)`, 'g');
					out = out.replace(reMid, '$1$2');
				}
			} catch {}
			// Remove the standalone form: const { ns_core_ns_<n>: __ns_core_ns_<n> } = __ns_rt_ns_X;
			out = out.replace(/(^|\n)\s*const\s*\{[^}]*ns_core_ns_\d+\s*:\s*__ns_core_ns_(?:\d+|re)[^}]*\}\s*=\s*__ns_rt_ns(?:\d+|_re)\s*;\s*/g, '$1');
			// Remove leading property in a multi-prop destructure
			out = out.replace(/(\{\s*)ns_core_ns_\d+\s*:\s*__ns_core_ns_(?:\d+|re)\s*,\s*([^}]*\}\s*=\s*__ns_rt_ns(?:\d+|_re)\s*;)/g, '{$2');
			// Remove trailing property in a multi-prop destructure
			out = out.replace(/(\{[^}]*?,)\s*ns_core_ns_\d+\s*:\s*__ns_core_ns_(?:\d+|re)\s*(\}\s*=\s*__ns_rt_ns(?:\d+|_re)\s*;)/g, '$1$2');
			// Remove middle property in a multi-prop destructure
			out = out.replace(/(\{[^}]*?,)\s*ns_core_ns_\d+\s*:\s*__ns_core_ns_(?:\d+|re)\s*,\s*([^}]*\}\s*=\s*__ns_rt_ns(?:\d+|_re)\s*;)/g, '$1$2');
			// Ultra-conservative fallback: strip any 'ns_core_ns_<n>: __ns_core_ns_<m>' occurrences
			out = out.replace(/ns_core_ns_\d+\s*:\s*__ns_core_ns_(?:\d+|re)\s*,?\s*/g, () => '');
			// Also strip any accidental 'ns_rt_ns_<n>: __ns_rt_ns_<m>' property mappings
			out = out.replace(/(^|\n)\s*const\s*\{[^}]*ns_rt_ns_\d+\s*:\s*__ns_rt_ns_(?:\d+|re)[^}]*\}\s*=\s*__ns_rt_ns(?:\d+|_re)\s*;\s*/g, '$1');
			out = out.replace(/(\{\s*)ns_rt_ns_\d+\s*:\s*__ns_rt_ns_(?:\d+|re)\s*,\s*([^}]*\}\s*=\s*__ns_rt_ns(?:\d+|_re)\s*;)/g, '{$2');
			out = out.replace(/(\{[^}]*?,)\s*ns_rt_ns_\d+\s*:\s*__ns_rt_ns_(?:\d+|re)\s*(\}\s*=\s*__ns_rt_ns(?:\d+|_re)\s*;)/g, '$1$2');
			out = out.replace(/(\{[^}]*?,)\s*ns_rt_ns_\d+\s*:\s*__ns_rt_ns_(?:\d+|re)\s*,\s*([^}]*\}\s*=\s*__ns_rt_ns(?:\d+|_re)\s*;)/g, '$1$2');
			// Remove empty destructures that may result: const { } = __ns_rt_nsX;
			out = out.replace(/(^|\n)\s*const\s*\{\s*\}\s*=\s*__ns_rt_ns(?:\d+|_re)\s*;\s*/g, '$1');
		} catch {}
		return `/* [ast-normalized] */\n${out}`;
	} catch {
		// Fallback: attempt minimal textual dedupe of /ns/rt default imports
		try {
			const seen = new Set<string>();
			const deduped = code.replace(/\bimport\s+(\w+)\s+from\s+["']\/ns\/rt["'];?/g, (match, local) => {
				if (seen.has(local)) return '';
				seen.add(local);
				return match;
			});
			return deduped;
		} catch {
			return code;
		}
	}
}

// Verification: duplicate top-level bindings annotated for fast diagnostics
export function astVerifyAndAnnotateDuplicates(code: string): string {
	try {
		const ast = babelParse(code, {
			sourceType: 'module',
			plugins: ['typescript', 'jsx'] as any,
			errorRecovery: true,
		});
		const seen = new Map<string, number>();
		(ast.program.body as any[]).forEach((node: any) => {
			// Count variable declarations (const/let) including object pattern bindings
			if (node?.type === 'VariableDeclaration' && (node.kind === 'const' || node.kind === 'let')) {
				for (const d of node.declarations || []) {
					const id = d?.id;
					if (id?.type === 'Identifier') {
						const name = id.name;
						seen.set(name, (seen.get(name) || 0) + 1);
					} else if (id?.type === 'ObjectPattern') {
						for (const p of id.properties || []) {
							if (p?.type === 'ObjectProperty') {
								const v = p.value;
								if (v?.type === 'Identifier') {
									const name = v.name;
									seen.set(name, (seen.get(name) || 0) + 1);
								}
							}
						}
					}
				}
			}
			// Count import specifier bindings (default, namespace, named), excluding type-only imports
			if (node?.type === 'ImportDeclaration' && node.importKind !== 'type') {
				for (const s of node.specifiers || []) {
					if (s.type === 'ImportDefaultSpecifier' || s.type === 'ImportNamespaceSpecifier' || s.type === 'ImportSpecifier') {
						const local = (s.local && s.local.name) || null;
						if (local) seen.set(local, (seen.get(local) || 0) + 1);
					}
				}
			}
		});
		const dups = Array.from(seen.entries()).filter(([_, c]) => c > 1);
		if (dups.length) {
			const note = dups.map(([n, c]) => `${n} x${c}`).join(', ');
			return `// [ast-verify][duplicate-bindings] ${note}\n` + code;
		}
		return code;
	} catch {
		return code;
	}
}

export default {
	astNormalizeModuleImportsAndHelpers,
	astVerifyAndAnnotateDuplicates,
};
