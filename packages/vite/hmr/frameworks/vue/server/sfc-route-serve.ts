import type { TransformResult, ViteDevServer } from 'vite';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import * as path from 'path';

import babelCore from '@babel/core';
import { parse as babelParse } from '@babel/parser';
import * as t from '@babel/types';

import { genCode } from '../../../helpers/babel.js';
import { setDeviceModuleHeaders } from '../../../server/route-helpers.js';
import { astNormalizeModuleImportsAndHelpers } from '../../../helpers/ast-normalizer.js';
import { stripRtCoreSentinel, stripDanglingViteCjsImports } from '../../../helpers/sanitize.js';
import { processTemplateVariantMinimal } from './sfc-transforms.js';
import { NS_NATIVE_TAGS } from '../../../server/compiler.js';
import { canonicalizeRtImports, ensureDestructureCoreImports, ensureVariableDynamicImportHelper } from '../../../server/websocket-served-module-helpers.js';
import { cleanCode, processCodeForDevice, rewriteImports } from '../../../server/websocket-device-transform.js';
import { REQUIRE_GUARD_SNIPPET } from '../../../server/require-guard.js';
import { getServerOrigin } from '../../../server/server-origin.js';
import { resolveProjectTsAliasRelative } from '../../../../helpers/ts-config-paths.js';
import type { RegisterSfcHandlersOptions } from './sfc-route-shared.js';
import { babelTraverse, canonicalizeNsMAppImports, compileScript, compileTemplate, parse, pluginTransformTypescript } from './sfc-route-shared.js';

/**
 * Registers `GET /ns/sfc` — serves SFC modules. Full SFCs delegate to the `/ns/asm`
 * assembler; script/template variants are processed for device delivery. Extracted
 * verbatim from `websocket-sfc.ts` (pure move, no behavior change).
 */
export function registerSfcServeRoute(server: ViteDevServer, options: RegisterSfcHandlersOptions): void {
	// 3) ESM endpoint for SFC modules: GET /ns/sfc?path=/src/Comp.vue[?vue&type=*] OR /ns/sfc/src/Comp.vue[?vue&type=*]
	// Also accept alias /ns/sfc
	// Preserves variant queries (?vue&type=script|template|style) and adds a diagnostic signature comment.
	server.middlewares.use(async (req, res, next) => {
		const strategy = options.getStrategy();
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			const p = urlObj.pathname;
			// Only match exactly "/ns/sfc" or paths under it.
			const isNs = p === '/ns/sfc' || p.startsWith('/ns/sfc/');
			if (!isNs) return next();
			if (p.startsWith('/ns/asm') || p.startsWith('/ns/sfc-meta')) return next();
			setDeviceModuleHeaders(res);

			const base = '/ns/sfc';
			// Determine request spec, preserving variant query when present. The
			// canonical URL carries no version; a versioned `/ns/sfc/<ver>/…` path
			// segment (stale cached device code) is stripped and ignored — SFC
			// freshness is eviction-driven, not URL-driven.
			let pathParam = urlObj.searchParams.get('path') || ''; // may include its own query
			const rawRemainder = urlObj.pathname.slice(base.length) || '';
			let pathStyle = rawRemainder;
			if (rawRemainder && rawRemainder.startsWith('/')) {
				const parts = rawRemainder.split('/'); // ["", maybe "<ver>", ...]
				if (parts.length > 2 && /^[0-9]+$/.test(parts[1] || '')) {
					pathStyle = '/' + parts.slice(2).join('/');
				}
			}
			if (pathStyle && pathStyle !== '/' && !pathParam) {
				if (!pathStyle.startsWith('/')) pathStyle = '/' + pathStyle;
				// Include endpoint query for variant-style requests (e.g. /ns/sfc/Comp.vue?vue&type=template)
				pathParam = pathStyle + (urlObj.search || '');
			}
			let fullSpec = pathParam || '';
			if (!fullSpec) {
				res.statusCode = 200;
				res.end('export {}\n');
				return;
			}
			if (fullSpec.startsWith('@/')) fullSpec = options.appVirtualWithSlash + fullSpec.slice(2);
			else if (!fullSpec.startsWith('/') && !fullSpec.startsWith('.')) {
				// Resolve tsconfig path aliases (@present/..., @app, …) so the served
				// SFC/variant can be located on disk — Vite's resolver isn't in this path.
				const q = fullSpec.match(/[?#].*$/)?.[0] || '';
				const aliasRel = resolveProjectTsAliasRelative(fullSpec.slice(0, fullSpec.length - q.length), server.config?.root || process.cwd());
				if (aliasRel) fullSpec = aliasRel + q;
			}
			if (!fullSpec.startsWith('/')) fullSpec = '/' + fullSpec;

			const isVariant = /[?&]vue&type=/.test(fullSpec);
			const variantTypeMatch = /[?&]type=([^&]+)/.exec(fullSpec);
			const variantType = variantTypeMatch?.[1] || null;
			const isStyleVariant = /[?&]type=style\b/.test(fullSpec);

			// Determine candidate for transformRequest
			// For full SFCs we prefer a clean base path + '?vue'; if that fails, try base without query as fallback.
			let candidate = fullSpec;
			let transformed: TransformResult | null = null;
			if (!isVariant) {
				const basePath = fullSpec.replace(/[?#].*$/, '');
				const candidates = [basePath + (basePath.includes('?') ? '&' : '?') + 'vue', basePath];
				for (const c of candidates) {
					try {
						const r = await server.transformRequest(c);
						if (r?.code) {
							transformed = r;
							candidate = c;
							break;
						}
					} catch {}
				}
				if (!transformed?.code) {
					if (options.verbose) {
						console.warn(`[sfc][serve] transform miss for`, fullSpec);
					}
					// Emit an erroring module to surface the failure at import site with helpful hints
					try {
						const tried = candidates.slice(0, 8);
						const out = `// [sfc] transform miss kind=full path=${fullSpec.replace(/\n/g, '')} tried=${tried.length}\n` + `throw new Error(${JSON.stringify('[ns/sfc] transform failed for full SFC: ' + fullSpec + ' (tried ' + tried.length + ')')});\nexport {}\n`;
						res.statusCode = 404;
						res.end(out);
						return;
					} catch {
						res.statusCode = 404;
						res.end('export {}\n');
						return;
					}
				}
			} else {
				try {
					transformed = await server.transformRequest(candidate);
				} catch {}
				if (!transformed?.code) {
					try {
						const out = `// [sfc] transform miss kind=variant path=${fullSpec.replace(/\n/g, '')}\n` + `throw new Error(${JSON.stringify('[ns/sfc] transform failed for variant: ' + fullSpec)});\nexport {}\n`;
						res.statusCode = 404;
						res.end(out);
						return;
					} catch {
						res.statusCode = 404;
						res.end('export {}\n');
						return;
					}
				}
			}

			// For style variants, return an empty module immediately
			if (isStyleVariant) {
				const sig = `// [sfc] kind=variant:style path=${fullSpec.replace(/\n/g, '')} len=0 default=false\n`;
				res.statusCode = 200;
				res.end(`${sig}export {}\n`);
				return;
			}

			let code = transformed.code;
			// Prepend guard to capture any URL-based require attempts
			code = REQUIRE_GUARD_SNIPPET + code;
			const projectRoot = server.config?.root || process.cwd();
			// IMPORTANT: Do not run cleanCode() on template variant; it can strip required pieces.
			// We'll handle script/full SFC below, and treat template minimally right away.

			// Full SFCs delegate to deterministic assembler module; variants (script/template) still go through processing
			if (!isVariant) {
				const importerPath = fullSpec.replace(/[?#].*$/, '');
				// Canonical (unversioned) assembler URL: the delegation body is
				// stable across saves; freshness comes from the client evicting
				// the assembler URL before re-import.
				const asmPath = `/ns/asm?path=${encodeURIComponent(importerPath)}`;
				const delegated = `// [sfc] kind=full (delegated to assembler) path=${importerPath}\nexport * from ${JSON.stringify(asmPath)};\nexport { default } from ${JSON.stringify(asmPath)};\n`;
				res.statusCode = 200;
				res.end(delegated);
				return;
			} else {
				// Variants
				if (variantType === 'template') {
					const preferSelfCompile = !!process.env.NS_HMR_SELF_COMPILE_TEMPLATE;
					// Compile the template ourselves to guarantee no Vite HMR code and stable output
					if (preferSelfCompile)
						try {
							const projectRootT = server.config?.root || process.cwd();
							const basePath = fullSpec.replace(/[?#].*$/, '');
							const abs = path.join(projectRootT, basePath.replace(/^\//, ''));
							let sfcSrc = '';
							try {
								sfcSrc = readFileSync(abs, 'utf-8');
							} catch {}
							if (sfcSrc) {
								const { descriptor } = parse(sfcSrc, { filename: abs });
								const id = createHash('md5').update(abs).digest('hex').slice(0, 8);
								let bindingMetadata: any = undefined;
								try {
									const s: any = (compileScript as any)(
										descriptor as any,
										{
											id,
											inlineTemplate: false,
											reactivityTransform: false,
										} as any,
									);
									bindingMetadata = s?.bindings;
								} catch {}
								const tpl = descriptor.template?.content || '';
								const ct: any = compileTemplate({
									source: tpl,
									id,
									filename: abs,
									isProd: false,
									ssr: false,
									compilerOptions: {
										bindingMetadata,
										isCustomElement: (tag: string) => NS_NATIVE_TAGS.has(tag),
									},
								} as any);
								let out = (ct && (ct.code || '')) || '';
								// Map Vue helper imports to runtime bridge
								try {
									out = out.replace(/from\s+["'](?:nativescript-vue|vue)[^"']*["']/g, 'from "/ns/rt"');
								} catch {}
								// No import.meta.hot present when compiling ourselves, but keep minimal sanitizer just in case
								out = processTemplateVariantMinimal(out);
								code = out;
							} else {
								code = 'export {}\n';
							}
						} catch (eTplSelf) {
							if (options.verbose) {
								console.warn('[sfc][template][self-compile][fail]', fullSpec, (eTplSelf as any)?.message);
							}
							code = transformed.code || 'export {}\n';
							code = processTemplateVariantMinimal(code);
						}
					else {
						// Prefer using Vite's template transform and apply minimal sanitization; avoids compiler mismatches and warnings
						code = transformed.code || 'export {}\n';
						code = processTemplateVariantMinimal(code);
					}
					// fall through to shared post-processing (versioning, signature, etc.)
				}

				// Script variants still need vendor mappings and general device processing (no SFC assembly)
				// IMPORTANT: Use a Babel AST transform to remove imports of the template variant and
				// neutralize their usage without brittle regex.
				try {
					const ast = babelParse(code, {
						sourceType: 'module',
						plugins: ['typescript'] as any,
					}) as any;
					const templateBindings = new Set<string>();
					const navToLocals: string[] = [];
					const navBackLocals: string[] = [];
					babelTraverse(ast, {
						ImportDeclaration(path: any) {
							const spec = path.node.source.value || '';
							// Remove template variant imports and collect their local identifiers for neutralization
							if (typeof spec === 'string' && /\.vue\?[^\n]*type=template/.test(spec)) {
								const ids: string[] = [];
								for (const s of path.node.specifiers) {
									if (t.isImportSpecifier(s)) {
										const imported = t.isIdentifier(s.imported) ? s.imported.name : undefined;
										const local = t.isIdentifier(s.local) ? s.local.name : undefined;
										if ((imported === 'render' || imported === undefined) && local) ids.push(local);
									} else if (t.isImportDefaultSpecifier(s) || t.isImportNamespaceSpecifier(s)) {
										if (t.isIdentifier(s.local)) ids.push(s.local.name);
									}
								}
								ids.forEach((n) => templateBindings.add(n));
								path.remove();
								return;
							}
							// Rewrite $navigateTo/$navigateBack imports from nativescript-vue (or prebundle) to use globals
							const isNsVue = typeof spec === 'string' && (/nativescript-vue/.test(spec) || /vendor\.mjs$/.test(spec) || /\/node_modules\/\.vite\/deps\/nativescript-vue\.js/.test(spec));
							if (isNsVue) {
								const remain: typeof path.node.specifiers = [];
								for (const s of path.node.specifiers) {
									if (t.isImportSpecifier(s)) {
										const imported = t.isIdentifier(s.imported) ? s.imported.name : undefined;
										const local = t.isIdentifier(s.local) ? s.local.name : undefined;
										if (local && (imported === '$navigateTo' || imported === 'navigateTo')) {
											navToLocals.push(local);
											continue;
										}
										if (local && (imported === '$navigateBack' || imported === 'navigateBack')) {
											navBackLocals.push(local);
											continue;
										}
									}
									remain.push(s);
								}
								if (remain.length) {
									path.node.specifiers = remain;
								} else {
									path.remove();
								}
							}
						},
					});
					if (templateBindings.size) {
						babelTraverse(ast, {
							Identifier(path: any) {
								if (templateBindings.has(path.node.name)) {
									path.replaceWith(t.identifier('undefined'));
								}
							},
							AssignmentExpression(path: any) {
								// Guard component.render = <alias> to avoid TDZ when alias is undefined
								if (
									t.isMemberExpression(path.node.left) &&
									t.isIdentifier(path.node.left.property, {
										name: 'render',
									})
								) {
									const e = t.identifier('__e');
									const guarded = t.tryStatement(t.blockStatement([t.variableDeclaration('const', [t.variableDeclarator(e, path.node.right as any)]), t.ifStatement(t.logicalExpression('&&', t.binaryExpression('!==', t.unaryExpression('typeof', path.node.left.object as any, true), t.stringLiteral('undefined')), t.binaryExpression('!==', t.unaryExpression('typeof', e, true), t.stringLiteral('undefined'))), t.blockStatement([t.expressionStatement(t.assignmentExpression('=', path.node.left as any, e))]))]), t.catchClause(t.identifier('_e'), t.blockStatement([])));
									path.replaceWithMultiple([guarded]);
								}
							},
						});
					}
					let outCode = genCode(ast as any).code;
					if (navToLocals.length || navBackLocals.length) {
						const shimLines: string[] = [];
						for (const n of navToLocals) shimLines.push(`import __ns_rt_nav_to_mod from "/ns/rt";\nconst ${n} = (...args) => __ns_rt_nav_to_mod.$navigateTo(...args);`);
						for (const n of navBackLocals) shimLines.push(`import __ns_rt_nav_back_mod from "/ns/rt";\nconst ${n} = (...args) => __ns_rt_nav_back_mod.$navigateBack(...args);`);
						outCode = shimLines.join('\n') + '\n' + outCode;
					}
					code = outCode;
				} catch {}

				code = processCodeForDevice(code, false, true, /(?:^|\/)node_modules\//.test(fullSpec), fullSpec);
				// Transform static .vue imports into static imports from the assembler (no TLA) via AST
				try {
					const importerPath = fullSpec.replace(/[?#].*$/, '');
					const ast2 = babelParse(code, {
						sourceType: 'module',
						plugins: ['typescript'] as any,
					}) as any;
					babelTraverse(ast2, {
						ImportDeclaration(p: any) {
							const src = p.node.source.value || '';
							if (typeof src !== 'string') return;
							if (/^https?:\/\//.test(src)) return; // leave absolute URLs
							if (/\.vue(?:$|\?)/.test(src)) {
								let spec = src;
								// Resolve to absolute project path
								if (spec.startsWith('./') || spec.startsWith('../')) {
									spec = path.posix.normalize(path.posix.join(path.posix.dirname(importerPath), spec));
									if (!spec.startsWith('/')) spec = '/' + spec;
								} else if (!spec.startsWith('/')) {
									// Handle '@/'
									if (spec.startsWith('@@/')) spec = '/' + spec.slice(2);
									if (spec.startsWith('@/')) spec = options.appVirtualWithSlash + spec.slice(2);
									// tsconfig path aliases (@present/..., @app, @domain, …)
									if (!spec.startsWith('/')) {
										const aliasRel = resolveProjectTsAliasRelative(spec.replace(/[?#].*$/, ''), server.config?.root || process.cwd());
										if (aliasRel) spec = aliasRel;
									}
								}
								// Strip query for plain .vue (keep variant imports intact)
								if (!/\bvue&type=/.test(src)) {
									spec = spec.replace(/[?#].*$/, '');
									const asmUrl = `/ns/asm?path=${encodeURIComponent(spec)}&mode=inline`;
									p.node.source = t.stringLiteral(asmUrl);
								}
							}
						},
					});
					code = genCode(ast2 as any).code;
				} catch {}

				// After rewrites, strip any TypeScript syntax from the script variant to avoid device-side parse errors
				try {
					const importerPath = fullSpec.replace(/[?#].*$/, '');
					const tsRes = await babelCore.transformAsync(code, {
						plugins: [[pluginTransformTypescript as any, { allowDeclareFields: true }]],
						sourceType: 'module',
						// Help Babel infer TS parsing even if the virtual filename isn't .ts
						filename: importerPath.endsWith('.vue') ? importerPath.replace(/\.vue$/, '.ts') : importerPath + '.ts',
						comments: true,
						configFile: false,
						babelrc: false,
					});
					if (tsRes?.code) {
						code = tsRes.code;
					}
				} catch (eTsVar) {
					if (options.verbose) {
						console.warn('[sfc][variant:script][babel-ts][fail]', fullSpec, (eTsVar as any)?.message);
					}
				}
			}

			const importerPath = fullSpec.replace(/[?#].*$/, '');
			// Only run cleanCode for non-template cases (script/full). Template code must remain intact.
			if (!isVariant || variantType !== 'template') {
				code = cleanCode(code, strategy);
			}
			code = rewriteImports(code, importerPath, options.sfcFileMap, options.depFileMap, projectRoot, !!options.verbose, undefined, getServerOrigin(server));
			code = ensureVariableDynamicImportHelper(code);
			try {
				// Every emitted URL is canonical (unversioned): `/ns/rt`/`/ns/core`
				// bridges, `/ns/sfc` artifacts, and `/ns/m` app deps alike.
				// Freshness for all of them is eviction-driven.
				code = canonicalizeRtImports(code, getServerOrigin(server));
				code = strategy.canonicalizeFrameworkImports?.(code, getServerOrigin(server)) ?? code;
				code = canonicalizeNsMAppImports(code);
			} catch {}
			// Final guard for SFC variant output as well
			try {
				code = ensureDestructureCoreImports(code);
			} catch {}

			// CRITICAL: As a last step for script/template variants, re-run AST normalization and strip
			// any sentinel destructures that could cause duplicate locals, then re-apply rt versioning.
			try {
				code = astNormalizeModuleImportsAndHelpers(code);
			} catch {}
			try {
				// Remove any rt->core sentinel destructures that slipped in late
				code = stripRtCoreSentinel(code);
			} catch {}
			try {
				code = canonicalizeRtImports(code, getServerOrigin(server));
			} catch {}
			// Last-chance sanitizer for dangling Vite CJS import helper usages that may surface after late transforms
			try {
				code = stripDanglingViteCjsImports(code);
			} catch {}

			const hasDefault = /\bexport\s+default\b/.test(code);
			const kind = isVariant ? `variant:${variantType || 'unknown'}` : 'full';
			const sig = `// [sfc] kind=${kind} path=${importerPath} len=${code.length} default=${hasDefault} wrapped=${false}\n`;
			if (options.verbose) {
				console.log(`[sfc][serve] ${fullSpec} kind=${kind} default=${hasDefault} bytes=${code.length}`);
			}
			// Ensure script variants always provide a default export if they declare a component
			if (!hasDefault) {
				// Prefer an explicit identifier if present
				const m = code.match(/\b(?:const|let|var)\s+(__ns_sfc__|_sfc_main)\b/);
				if (m && m[1]) {
					code += `\nexport default ${m[1]};`;
				} else if (/\b_defineComponent\s*\(|\bdefineComponent\s*\(/.test(code)) {
					// Fallback: export whichever is defined at runtime without throwing on missing identifiers
					code += `\nexport default (typeof __ns_sfc__ !== "undefined" ? __ns_sfc__ : (typeof _sfc_main !== "undefined" ? _sfc_main : undefined));`;
				}
			}
			res.statusCode = 200;
			res.end(sig + code);
		} catch (e) {
			res.statusCode = 500;
			res.end('export {}\n');
		}
	});
}
