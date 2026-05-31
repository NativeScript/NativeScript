import type { TransformResult, ViteDevServer } from 'vite';
import { createRequire } from 'node:module';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import * as path from 'path';

import babelCore from '@babel/core';
import { parse as babelParse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

import { genCode } from '../helpers/babel.js';
import { astExtractImportsAndStripTypes } from '../helpers/ast-extract.js';
import { astNormalizeModuleImportsAndHelpers, astVerifyAndAnnotateDuplicates } from '../helpers/ast-normalizer.js';
import { stripRtCoreSentinel, stripDanglingViteCjsImports } from '../helpers/sanitize.js';
import { vueSfcCompiler } from '../frameworks/vue/server/compiler.js';
import { buildInlineTemplateBlock, extractTemplateRender, processTemplateVariantMinimal } from '../frameworks/vue/server/sfc-transforms.js';
import { NS_NATIVE_TAGS } from './compiler.js';
import type { FrameworkServerStrategy } from './framework-strategy.js';
import { ensureDestructureCoreImports, ensureGuardPlainDynamicImports, ensureVariableDynamicImportHelper, ensureVersionedRtImports, extractExportMetadata } from './websocket-served-module-helpers.js';
import { REQUIRE_GUARD_SNIPPET } from './require-guard.js';

const babelTraverse: any = (traverse as any)?.default || (traverse as any);
const { parse, compileTemplate, compileScript } = vueSfcCompiler;

const pluginTransformTypescript: any = (() => {
	const requireFromHere = createRequire(import.meta.url);
	const loaded = requireFromHere('@babel/plugin-transform-typescript');
	return loaded?.default || loaded;
})();

type ProcessCodeForDeviceFn = (code: string, isVitePreBundled: boolean, preserveVendorImports?: boolean, isNodeModule?: boolean, sourceId?: string) => string;
type RewriteImportsFn = (code: string, importerPath: string, sfcFileMap: Map<string, string>, depFileMap: Map<string, string>, projectRoot: string, verbose?: boolean, outputDirOverrideRel?: string, httpOrigin?: string, resolveVendorAsHttp?: boolean) => string;
type CleanCodeFn = (code: string, strategy: FrameworkServerStrategy) => string;

/**
 * Dependencies the SFC route handlers need from the HMR plugin closure.
 * Server-side functions (`cleanCode`, `processCodeForDevice`, `rewriteImports`,
 * `getServerOrigin`) live in `websocket.ts`; they are injected here to keep the
 * SFC pipeline in its own module without a circular import.
 */
export interface RegisterSfcHandlersOptions {
	verbose: boolean;
	appVirtualWithSlash: string;
	sfcFileMap: Map<string, string>;
	depFileMap: Map<string, string>;
	getGraphVersion(): number;
	getStrategy(): FrameworkServerStrategy;
	getServerOrigin(server: ViteDevServer): string;
	cleanCode: CleanCodeFn;
	processCodeForDevice: ProcessCodeForDeviceFn;
	rewriteImports: RewriteImportsFn;
}

/**
 * Registers the three Vue SFC endpoints on the dev server:
 *   - `GET /ns/sfc`      — serves SFC modules (full delegates to the assembler; variants processed)
 *   - `GET /ns/sfc-meta` — JSON metadata (script exports, render presence) for an SFC
 *   - `GET /ns/asm`      — deterministic, self-contained SFC assembler module
 */
export function registerSfcHandlers(server: ViteDevServer, options: RegisterSfcHandlersOptions): void {
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
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
			res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
			res.setHeader('Pragma', 'no-cache');
			res.setHeader('Expires', '0');

			const base = '/ns/sfc';
			// Determine request spec, preserving variant query when present and handling optional version in path
			let pathParam = urlObj.searchParams.get('path') || ''; // may include its own query
			const rawRemainder = urlObj.pathname.slice(base.length) || '';
			let verFromPath: string | null = null;
			let pathStyle = rawRemainder;
			if (rawRemainder && rawRemainder.startsWith('/')) {
				const parts = rawRemainder.split('/'); // ["", maybe "<ver>", ...]
				if (parts.length > 2 && /^[0-9]+$/.test(parts[1] || '')) {
					verFromPath = parts[1];
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
				const origin = options.getServerOrigin(server);
				const ver = verFromPath || '0';
				const asmPath = `/ns/asm/${ver}?path=${encodeURIComponent(importerPath)}`;
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

				code = options.processCodeForDevice(code, false, true, /(?:^|\/)node_modules\//.test(fullSpec), fullSpec);
				// Transform static .vue imports into static imports from the assembler (no TLA) via AST
				try {
					const importerPath = fullSpec.replace(/[?#].*$/, '');
					const origin = options.getServerOrigin(server);
					const ver = verFromPath || '0';
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
								}
								// Strip query for plain .vue (keep variant imports intact)
								if (!/\bvue&type=/.test(src)) {
									spec = spec.replace(/[?#].*$/, '');
									const asmUrl = `/ns/asm/${ver}?path=${encodeURIComponent(spec)}&mode=inline`;
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
				code = options.cleanCode(code, strategy);
			}
			code = options.rewriteImports(code, importerPath, options.sfcFileMap, options.depFileMap, projectRoot, !!options.verbose, undefined, options.getServerOrigin(server));
			code = ensureVariableDynamicImportHelper(code);
			try {
				// For variant requests under /ns/sfc, prefer the version from the path segment when present
				// so that any internal '/ns/rt' or '/ns/sfc' imports are aligned with the same version.
				// `/ns/core` URLs are intentionally unversioned (realm-split history).
				const verNum = Number(verFromPath || '0');
				if (Number.isFinite(verNum) && verNum > 0) {
					code = ensureVersionedRtImports(code, options.getServerOrigin(server), verNum);
					code = strategy.ensureVersionedImports?.(code, options.getServerOrigin(server), verNum) ?? code;
				} else {
					code = ensureVersionedRtImports(code, options.getServerOrigin(server), options.getGraphVersion());
					code = strategy.ensureVersionedImports?.(code, options.getServerOrigin(server), options.getGraphVersion()) ?? code;
				}
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
				const verNum = Number(verFromPath || '0');
				if (Number.isFinite(verNum) && verNum > 0) {
					code = ensureVersionedRtImports(code, options.getServerOrigin(server), verNum);
				} else {
					code = ensureVersionedRtImports(code, options.getServerOrigin(server), options.getGraphVersion());
				}
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

	// 4) JSON metadata endpoint for SFCs: GET /ns/sfc-meta?path=/src/Comp.vue OR /ns/sfc-meta/<ver>?path=/src/Comp.vue
	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			if (!urlObj.pathname.startsWith('/ns/sfc-meta')) return next();
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Content-Type', 'application/json; charset=utf-8');
			res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
			res.setHeader('Pragma', 'no-cache');
			res.setHeader('Expires', '0');
			// Accept optional version segment similar to /ns/sfc
			{
				const metaBase = '/ns/sfc-meta';
				if (urlObj.pathname.startsWith(metaBase + '/')) {
					const rawRemainder = urlObj.pathname.slice(metaBase.length);
					const parts = rawRemainder.split('/');
					if (parts.length > 2 && /^[0-9]+$/.test(parts[1] || '')) {
						// consume version but we don't need it server-side
					}
				}
			}
			let spec = urlObj.searchParams.get('path') || '';
			if (!spec) {
				res.statusCode = 400;
				res.end(JSON.stringify({ error: 'missing path' }));
				return;
			}
			if (spec.startsWith('@/')) spec = options.appVirtualWithSlash + spec.slice(2);
			if (!spec.startsWith('/')) spec = '/' + spec;
			const base = spec.replace(/[?#].*$/, '');
			// Transform variants to inspect exports
			const [scriptR, templateR] = await Promise.all([server.transformRequest(base + '?vue&type=script'), server.transformRequest(base + '?vue&type=template')]);
			const scriptCode = scriptR?.code || '';
			const templateCode = templateR?.code || '';
			const scriptMeta = extractExportMetadata(scriptCode);
			// Robust render detection: Vue compiler may emit several shapes:
			// 1) export function render(_ctx, _cache) { ... }
			// 2) function render(_ctx,_cache) { ... } (later exported)
			// 3) export const render = (_ctx,_cache) => { ... }
			// 4) const render = (...) => { ... } (later exported)
			// 5) export { render } or export { render as render }
			// 6) Object property forms (rare in template output) render: (...) => {}
			const hasRender = /export\s+function\s+render\s*\(/.test(templateCode) || /(?:^|\n)\s*function\s+render\s*\(/.test(templateCode) || /export\s+(?:const|let|var)\s+render\s*=/.test(templateCode) || /(?:^|\n)\s*(?:const|let|var)\s+render\s*=/.test(templateCode) || /\brender\s*[:=]\s*/.test(templateCode) || /export\s*\{\s*render\s*(?:as\s*render)?\s*\}/.test(templateCode);
			if (hasRender && options.verbose) {
				console.log('[sfc-meta] detected render for', base);
			} else if (!hasRender && options.verbose) {
				console.warn('[sfc-meta] render NOT detected for', base);
			}
			const hash = createHash('md5').update(base).digest('hex').slice(0, 8);
			const payload = {
				path: base,
				hasScript: !!scriptCode,
				hasTemplate: !!templateCode,
				hasStyle: false,
				scriptExports: scriptMeta.named,
				scriptHasDefault: scriptMeta.hasDefault,
				templateHasRender: hasRender,
				hmrId: hash,
			};
			res.statusCode = 200;
			res.end(JSON.stringify(payload));
		} catch (e: any) {
			res.statusCode = 500;
			res.end(JSON.stringify({ error: e?.message || String(e) }));
		}
	});

	// 5) Deterministic SFC assembler: GET /ns/asm?path=/src/Comp.vue
	// Place BEFORE any broader /ns/sfc* handlers that might accidentally match and delegate.
	server.middlewares.use(async (req, res, next) => {
		const strategy = options.getStrategy();
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			if (!urlObj.pathname.startsWith('/ns/asm')) return next();
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
			res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
			res.setHeader('Pragma', 'no-cache');
			res.setHeader('Expires', '0');
			// Optional version segment as first path component after /ns/asm
			const asmBase = '/ns/asm';
			const asmRemainder = urlObj.pathname.slice(asmBase.length) || '';
			let verFromPath: string | null = null;
			if (asmRemainder && asmRemainder.startsWith('/')) {
				const p = asmRemainder.split('/');
				if (p.length > 1 && /^[0-9]+$/.test(p[1] || '')) {
					verFromPath = p[1];
				}
			}
			let spec = urlObj.searchParams.get('path') || '';
			const diag = urlObj.searchParams.get('diag') === '1';
			if (!spec) {
				res.statusCode = 400;
				res.end('export {}\n');
				return;
			}
			if (spec.startsWith('@/')) spec = options.appVirtualWithSlash + spec.slice(2);
			if (!spec.startsWith('/')) spec = '/' + spec;
			const base = spec.replace(/[?#].*$/, '');
			if (diag) {
				const code = `// [sfc-asm] ${base} (diag)\n` + `// vue shim for diag-only instantiation\n` + `var _createElementVNode = globalThis.createElementVNode || globalThis._createElementVNode;\n` + `const __ns_sfc__ = { name: ${JSON.stringify(base.split('/').pop() || 'DiagComp')}, render(){ return _createElementVNode ? _createElementVNode('StackLayout') : (globalThis.createElementVNode ? globalThis.createElementVNode('StackLayout') : {}); } };\nexport default __ns_sfc__;\n`;
				res.statusCode = 200;
				res.end(code);
				return;
			}
			const projectRoot = server.config?.root || process.cwd();
			// Ensure variant transforms exist so imports resolve (avoid Promise.all short-circuit on single failure)
			const safeTransform = async (cand: string): Promise<TransformResult | null> => {
				try {
					return await server.transformRequest(cand);
				} catch {
					return null;
				}
			};
			const scriptR = await safeTransform(base + '?vue&type=script');
			const templateR = await safeTransform(base + '?vue&type=template');
			const fullR = await safeTransform(base + '?vue');
			const hasScript = !!scriptR?.code;
			const hasTemplate = !!templateR?.code;
			const origin = options.getServerOrigin(server);
			const ver = String(verFromPath || options.getGraphVersion() || Date.now());
			const scriptUrl = `${origin}/ns/sfc/${ver}${base}?vue&type=script`;
			const templateCode = templateR?.code || '';

			// INLINE-FIRST assembler: compile SFC source into a self-contained ESM module (enhanced diagnostics)
			try {
				const root = server.config?.root || process.cwd();
				const abs = path.join(root, base.replace(/^\//, ''));
				let sfcSrc = '';
				try {
					sfcSrc = readFileSync(abs, 'utf-8');
				} catch {}
				if (sfcSrc) {
					const { descriptor } = parse(sfcSrc, { filename: abs });
					const id = createHash('md5').update(abs).digest('hex').slice(0, 8);
					// 1) Compile script (prefer inlineTemplate for a complete module)
					let compiledScript = '' as string;
					let bindingMetadata: any = undefined;
					let triedInlineTemplate = false;
					let hadScriptDefaultPre = false;
					let usedInlineScript = false;
					try {
						// First try inlineTemplate for a holistic, self-contained module with render + hoists
						// Use a strict NativeScript native element detector for inlineTemplate that does NOT treat generic PascalCase as native.
						// This ensures imported components like PageWrapper remain true components and get referenced via bindings.
						const isNSNative = (tag: string) => NS_NATIVE_TAGS.has(tag);
						const sInline: any = (compileScript as any)(
							descriptor as any,
							{
								id,
								inlineTemplate: true,
								reactivityTransform: false,
								// Pass only strict NS native element predicate; avoid broad PascalCase heuristic here.
								templateOptions: {
									compilerOptions: { isCustomElement: isNSNative },
								},
							} as any,
						);
						triedInlineTemplate = true;
						if (/export\s+default/.test(sInline?.content || '')) {
							compiledScript = sInline.content;
							bindingMetadata = sInline?.bindings;
							hadScriptDefaultPre = true;
							usedInlineScript = true;
						} else {
							// Fallback to standard script (no inline) and attempt separate template compile
							const s: any = (compileScript as any)(
								descriptor as any,
								{
									id,
									inlineTemplate: false,
									reactivityTransform: false,
								} as any,
							);
							compiledScript = s?.content || '';
							bindingMetadata = s?.bindings;
							hadScriptDefaultPre = /export\s+default/.test(compiledScript);
							usedInlineScript = false;
						}
					} catch (eScript) {
						if (options.verbose) {
							console.warn('[sfc-asm][compileScript] failed', base, (eScript as any)?.message);
						}
						// Retry without inlineTemplate
						try {
							const s: any = (compileScript as any)(
								descriptor as any,
								{
									id,
									inlineTemplate: false,
									reactivityTransform: false,
								} as any,
							);
							compiledScript = s?.content || '';
							bindingMetadata = s?.bindings;
							hadScriptDefaultPre = /export\s+default/.test(compiledScript);
							usedInlineScript = false;
						} catch (eNoInline) {
							if (options.verbose) {
								console.warn('[sfc-asm][compileScript][no-inline-fallback] failed', base, (eNoInline as any)?.message);
							}
						}
					}
					// Final fallback: if script compile yielded nothing, use the variant-transformed script
					if (!compiledScript && scriptR?.code) {
						try {
							compiledScript = scriptR.code;
							hadScriptDefaultPre = /export\s+default/.test(compiledScript);
						} catch {}
					}
					// If inlineTemplate produced a default export AND visibly contains a render, allow early-return.
					// Visible render forms we accept:
					//  - export function render(...) { ... }
					//  - setup(...) { ... return (_ctx, _cache) => { ... } }
					const hasInlineRender = /(^|\n)\s*export\s+function\s+render\s*\(/.test(compiledScript || '') || /\breturn\s*\(\s*_ctx\s*,\s*_cache\s*\)\s*=>\s*\{/.test(compiledScript || '');
					// Always use canonical assembler path; avoid inlineTemplate early-return which can miss render attachment
					// If we reached here, we are going to assemble canonically. Ensure the script we use does NOT include inlineTemplate render.
					if (usedInlineScript) {
						try {
							const sNoInline: any = (compileScript as any)(
								descriptor as any,
								{
									id,
									inlineTemplate: false,
									reactivityTransform: false,
								} as any,
							);
							compiledScript = sNoInline?.content || compiledScript;
							bindingMetadata = sNoInline?.bindings || bindingMetadata;
						} catch (eNoInline) {
							if (options.verbose) {
								console.warn('[sfc-asm][compileScript][no-inline-fallback] failed', base, (eNoInline as any)?.message);
							}
						}
					}
					// 2) Compile template
					let compiledTplCode = '' as string;
					let templateErr: any = null;
					try {
						const tplSrc = descriptor.template?.content || '';
						if (tplSrc) {
							const ct: any = compileTemplate({
								source: tplSrc,
								id,
								filename: abs,
								isProd: false,
								ssr: false,
								compilerOptions: {
									bindingMetadata,
									isCustomElement: (tag: string) => NS_NATIVE_TAGS.has(tag),
								},
							} as any);
							compiledTplCode = (ct && (ct.code || '')) || '';
							if (ct?.errors?.length && options.verbose) {
								console.warn('[sfc-asm][compileTemplate][errors]', base, ct.errors);
							}
						}
					} catch (eTpl) {
						templateErr = eTpl;
						if (options.verbose) {
							console.warn('[sfc-asm][compileTemplate] failed', base, (eTpl as any)?.message);
						}
						// Fallback: use the variant-transformed template code if available
						try {
							if (templateR?.code) compiledTplCode = templateR.code;
						} catch {}
					}
					// If still no template code, synthesize a minimal render stub so the module is valid
					if (!compiledTplCode) {
						try {
							compiledTplCode = "export function render(){ const _ = (globalThis.createElementVNode||globalThis._createElementVNode); return _? _('StackLayout') : {}; }\n";
						} catch {}
					}
					// 3) Sanitize script and rewrite .vue imports to inline assembler
					let scriptBody = compiledScript || '';
					if (scriptBody) {
						// Do NOT strip Vue/nativescript-vue imports; retarget them to the runtime bridge so helpers (e.g., onMounted) are bound.
						// Preserve the import clause and only rewrite the source to '/ns/rt'.
						scriptBody = scriptBody.replace(/(^|\n)\s*import\s+([^;\n]+)\s+from\s+["'](?:vue|nativescript-vue|~\/vendor\.mjs)(?:\/[^"]*)?["'];?/g, (_m: string, pfx: string, clause: string) => `${pfx}import ${clause} from "/ns/rt";`);
						try {
							const importerDir = path.posix.dirname(base);
							scriptBody = scriptBody.replace(/(^|\n)\s*import\s+([^;\n]+)\s+from\s+["']([^"'\n]+\.vue)(?:\?[^"'\n]*)?["'];?/g, (_m: string, pfx: string, clause: string, spec: string) => {
								let absImp = spec;
								if (spec.startsWith('./') || spec.startsWith('../')) {
									absImp = path.posix.normalize(path.posix.join(importerDir, spec));
									if (!absImp.startsWith('/')) absImp = '/' + absImp;
								} else if (!spec.startsWith('/')) {
									if (absImp.startsWith('@/')) absImp = options.appVirtualWithSlash + absImp.slice(2);
								}
								const asmUrl = `/ns/asm/${ver}?path=${encodeURIComponent(absImp)}&mode=inline`;
								return `${pfx}import ${clause} from ${JSON.stringify(asmUrl)};`;
							});
						} catch {}
					}
					// 4) Extract render from compiled template and prepare a full inline template block
					let helperBindings = '';
					let renderDecl = '';
					let inlineBlock: string | undefined = undefined;
					let renderOk = false;
					if (compiledTplCode) {
						try {
							// Build a full inline template block to preserve hoists where possible
							inlineBlock = buildInlineTemplateBlock(compiledTplCode) || undefined;
							if (!inlineBlock) {
								const extracted = extractTemplateRender(compiledTplCode);
								helperBindings = extracted.helperBindings;
								renderDecl = extracted.renderDecl;
								inlineBlock = extracted.inlineBlock;
								renderOk = extracted.ok;
							} else {
								renderOk = true;
							}
						} catch (eExtract) {
							if (options.verbose) {
								console.warn('[sfc-asm][extractTemplateRender] failed', base, (eExtract as any)?.message);
							}
						}
					}
					// Final guard: if no inline render extracted, attempt to import template variant or synthesize a no-op render
					if (!renderOk && !inlineBlock) {
						try {
							const templateUrl = `${origin}/ns/sfc/${ver}${base}?vue&type=template`;
							const importLine = `import * as __template from ${JSON.stringify(templateUrl)};`;
							// Attach only if scriptTransformed produces __ns_sfc__ later
							helperBindings += `\n${importLine}`;
							renderDecl += `\nfunction __ns_getRender(){\n  try {\n    if (__template && __template.render) return __template.render;\n  } catch (_e) {}\n  try {\n    const _ = globalThis.createElementVNode || globalThis._createElementVNode;\n    return _ ? function(){ return _('StackLayout'); } : function(){ return {}; };\n  } catch (_e) { return function(){ return {}; }; }\n}\n`;
							renderOk = true;
						} catch {}
					}
					// 5) Convert default export to const __ns_sfc__
					let scriptTransformed = scriptBody;
					if (scriptTransformed) {
						scriptTransformed = scriptTransformed.replace(/(^|\n)\s*export\s+default\s+/g, '$1const __ns_sfc__ = ').replace(/(^|\n)\s*export\s*\{[^}]*\}\s*;?\s*/g, '\n/* removed named exports for inline asm */\n');
						// Normalize any prior declaration of __ns_sfc__ to a plain assignment to avoid redeclare
						// Accept a semicolon before the declaration too
						scriptTransformed = scriptTransformed.replace(/(^|[\n;])\s*(?:const|let|var)\s+__ns_sfc__\s*=\s*/g, '$1__ns_sfc__ = ');
						// Ensure a single declaration appears once before first assignment
						if (!/(^|[\n;])\s*(?:const|let|var)\s+__ns_sfc__\b/.test(scriptTransformed)) {
							scriptTransformed = `let __ns_sfc__;\n` + scriptTransformed;
						}
						// Remove stray leading braces (artifact defense)
						scriptTransformed = scriptTransformed.replace(/^\s*\}+(?=\s*[^}])/, (m) => `/* [asm-fix] removed ${m.length} stray leading braces */\n`);
					} else {
						try {
							const compName = (base.split('/').pop() || 'Component').replace(/\.vue$/i, '') || 'Component';
							scriptTransformed = `import { defineComponent as _defineComponent } from "/ns/rt";\nlet __ns_sfc__;\n__ns_sfc__ = /*@__PURE__*/_defineComponent({ __name: ${JSON.stringify(compName)} });`;
						} catch {
							scriptTransformed = `import { defineComponent as _defineComponent } from "/ns/rt";\nlet __ns_sfc__;\n__ns_sfc__ = /*@__PURE__*/_defineComponent({});`;
						}
					}
					// 6) Emit final inline module with diagnostics comment
					const parts: string[] = [];
					parts.push(`// [sfc-asm] ${base} (inline-compiled)`);
					// Deterministic path: always use extracted helperBindings + renderDecl + scriptTransformed (ignore inlineBlock)
					// Emit hoisted template bindings first
					if (helperBindings) parts.push(helperBindings);
					// IMPORTANT: place script (with its imports) BEFORE renderDecl so imports never appear inside the render function.
					parts.push(scriptTransformed);
					parts.push(renderDecl);
					parts.push(`try { if (!__ns_sfc__.render) Object.defineProperty(__ns_sfc__, 'render', { configurable: true, enumerable: true, get(){ const r = (typeof __ns_getRender==='function' ? __ns_getRender() : undefined); Object.defineProperty(__ns_sfc__, 'render', { value: r, writable: true, configurable: true, enumerable: true }); return r; }, set(v){ Object.defineProperty(__ns_sfc__, 'render', { value: v, writable: true, configurable: true, enumerable: true }); } }); } catch(_e){}`);
					parts.push(`export function render(){ const f = (typeof __ns_getRender==='function' ? __ns_getRender() : (__ns_sfc__ && __ns_sfc__.render)); return typeof f==='function' ? f.apply(this, arguments) : undefined; }`);
					parts.push(`export default __ns_sfc__`);
					let inlineCode = parts.filter(Boolean).join('\n');
					inlineCode = options.processCodeForDevice(inlineCode, false, true);
					try {
						inlineCode = ensureDestructureCoreImports(inlineCode);
					} catch {}
					// Replace legacy mutation pipeline with canonical assembler for reliability
					{
						// First: strip TypeScript robustly using Babel transform
						try {
							const tsRes = await babelCore.transformAsync(scriptTransformed, {
								plugins: [[pluginTransformTypescript as any, { allowDeclareFields: true }]],
								ast: false,
								sourceType: 'module',
								configFile: false,
								babelrc: false,
							} as any);
							if (tsRes?.code) scriptTransformed = tsRes.code;
						} catch (eTs) {
							if (options.verbose) {
								console.warn('[sfc-asm][babel-ts][fail]', base, (eTs as any)?.message);
							}
						}
						// Hoist imports + strip residual TS via AST
						let importLines: string[] = [];
						try {
							const astRes = astExtractImportsAndStripTypes(scriptTransformed);
							importLines = astRes.imports;
							scriptTransformed = astRes.body;
							if (astRes.diagnostics.length && options.verbose) {
								console.warn('[sfc-asm][ast]', base, astRes.diagnostics.join('; '));
							}
						} catch (eAst) {
							if (options.verbose) {
								console.warn('[sfc-asm][ast][fail]', base, (eAst as any)?.message);
							}
						}
						// Ensure renderDecl ends with closing brace ONLY for function declaration forms
						// Avoid appending to const-assignment forms like: const __ns_render = (function(){ ... })();
						if (renderDecl && /(^|\n)\s*(?:export\s+)?function\s+__ns_render\s*\(/.test(renderDecl) && !/\}\s*$/.test(renderDecl)) {
							renderDecl = renderDecl.trimEnd() + '\n}';
						}
						const outParts: string[] = [];
						outParts.push(`// [sfc-asm] ${base} (inline-compiled)`);
						outParts.push('// [sfc-asm][canonical]');
						if (importLines.length) outParts.push(Array.from(new Set(importLines)).join('\n'));
						// Place component script first so the component object exists before we attach render.
						outParts.push(scriptTransformed);
						// Prefer full template block to guarantee presence of all hoisted constants.
						if (inlineBlock) {
							outParts.push(inlineBlock);
						} else {
							if (helperBindings) outParts.push(helperBindings);
							if (renderDecl && renderDecl.trim()) outParts.push(renderDecl);
						}
						outParts.push(`try { if (!__ns_sfc__.render) Object.defineProperty(__ns_sfc__, 'render', { configurable: true, enumerable: true, get(){ const r = (typeof __ns_getRender==='function' ? __ns_getRender() : (typeof __ns_render==='function' ? __ns_render : undefined)); Object.defineProperty(__ns_sfc__, 'render', { value: r, writable: true, configurable: true, enumerable: true }); return r; }, set(v){ Object.defineProperty(__ns_sfc__, 'render', { value: v, writable: true, configurable: true, enumerable: true }); } }); } catch(_e){}`);
						// Export named render as a function that resolves lazily
						outParts.push('export function render(){ const f = (typeof __ns_getRender==="function" ? __ns_getRender() : (typeof __ns_render==="function" ? __ns_render : (__ns_sfc__ && __ns_sfc__.render))); return typeof f === "function" ? f.apply(this, arguments) : undefined; }');
						outParts.push('export default __ns_sfc__');
						let inlineCode2 = outParts.filter(Boolean).join('\n');
						inlineCode2 = options.processCodeForDevice(inlineCode2, false, true);
						try {
							inlineCode2 = ensureDestructureCoreImports(inlineCode2);
						} catch {}
						// Hoist any late imports that accidentally landed after render or script assembly
						try {
							const lateImportRe = /^(?!\/\/).*^\s*import\s+[^;]+;?$/gm;
							const allImports: string[] = [];
							inlineCode2 = inlineCode2.replace(lateImportRe, (imp) => {
								allImports.push(imp);
								return '';
							});
							if (allImports.length) {
								// Place after helperBindings sentinel
								inlineCode2 = inlineCode2.replace(/(\/\/ \[sfc-asm\]\[canonical\]\n)/, `$1${Array.from(new Set(allImports)).join('\n')}\n/* [asm-fix] re-hoisted ${allImports.length} imports */\n`);
							}
						} catch {}
						// After hoisting, re-run AST normalization and duplicate-binding verification.
						// This guards against freshly hoisted imports reintroducing identifiers that collide
						// with earlier destructures (e.g., __ns_core_ns_1), which would otherwise surface at device runtime.
						try {
							inlineCode2 = astNormalizeModuleImportsAndHelpers(inlineCode2);
						} catch {}
						try {
							inlineCode2 = astVerifyAndAnnotateDuplicates(inlineCode2);
							if (/^\s*\/\/ \[ast-verify\]\[duplicate-bindings\]/m.test(inlineCode2)) {
								const diagnosticLine = (inlineCode2.match(/^\s*\/\/ \[ast-verify\]\[duplicate-bindings\][^\n]*/m) || [])[0] || '// [ast-verify][duplicate-bindings]';
								const brief = diagnosticLine.replace(/^[^:]*:?\s?/, '');
								const escaped = brief.replace(/["\\]/g, '\\$&');
								const thrower = `throw new Error("[nsv-hmr] Duplicate top-level bindings detected post-hoist: ${escaped}");`;
								inlineCode2 = `${thrower}\n` + inlineCode2;
							}
						} catch {}
						// Minimal cleanup only (avoid destructive type stripping breaking object literal property defaults)
						try {
							// Heal cases where a TS type strip earlier removed initializer: plain 'default' inside props objects
							// becomes 'default: undefined'. We only match when followed by ',' or '}' or newline to avoid 'export default'.
							inlineCode2 = inlineCode2.replace(/\bdefault\b\s*(?=\}|,|\n)/g, 'default: undefined');
							// Remove obvious leftover angle generic markers
							inlineCode2 = inlineCode2.replace(/<unknown>/g, '');
							// Fix accidental '}=> {' sequences
							inlineCode2 = inlineCode2.replace(/}\s*=>\s*\{/g, '');
							// No-op: removed prior broken normalization. Handlers are fixed in the dedicated passes below.
						} catch {}
						// Removed redundant render closure heal that could inject an extra '}' before component script.
						// Rewrite any remaining imports (e.g., relative app paths) to HTTP ESM endpoints
						try {
							inlineCode2 = options.rewriteImports(inlineCode2, base, options.sfcFileMap, options.depFileMap, projectRoot, !!options.verbose, undefined, options.getServerOrigin(server));
						} catch {}
						// Final TS strip on the whole assembled module (safety net)
						try {
							const tsFinal = await babelCore.transformAsync(inlineCode2, {
								plugins: [[pluginTransformTypescript as any, { allowDeclareFields: true }]],
								ast: false,
								sourceType: 'module',
								configFile: false,
								babelrc: false,
							} as any);
							if (tsFinal?.code) inlineCode2 = tsFinal.code;
						} catch {}
						// Heal Vue v-model update handlers that lost the ": else" branch during transforms:
						// "onUpdate:modelValue": _cache[N] || (_cache[N] = $event => _isRef(name) ? name.value = $event)
						// → add else branch to keep syntax valid: : (name = $event)
						try {
							// Fix missing else branch on v-model handlers: support dotted expressions (e.g., $setup.acceptTerms)
							const reMissingElse = /\"onUpdate:modelValue\"\s*:\s*_cache\[(\d+)\]\s*\|\|\s*\(_cache\[\1\]\s*=\s*\$event\s*=>\s*_isRef\(\s*([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*\)\s*\?\s*\2\.value\s*=\s*\$event\s*\)/g;
							inlineCode2 = inlineCode2.replace(reMissingElse, (_m, idx: string, expr: string) => {
								return `\"onUpdate:modelValue\": _cache[${idx}] || (_cache[${idx}] = $event => (_isRef(${expr}) ? (${expr}.value = $event) : (${expr} = $event)))`;
							});
							// Repair malformed handlers without an arrow (introduced by previous transforms):
							// Convert pattern assigning to $event without an arrow into a proper arrow using the same target expression.
							const reMalformed = /\"onUpdate:modelValue\"\s*:\s*_cache\[(\d+)\]\s*\|\|\s*\(_cache\[\1\]\s*=\s*[^=]*\(\s*([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*\)[^=]*=\s*\$event\s*\)\s*\)/g;
							inlineCode2 = inlineCode2.replace(reMalformed, (_m, idx: string, expr: string) => {
								return `\"onUpdate:modelValue\": _cache[${idx}] || (_cache[${idx}] = $event => (_isRef(${expr}) ? (${expr}.value = $event) : (${expr} = $event)))`;
							});
						} catch {}
						// Structural heal: ensure balanced braces before the first import statement
						try {
							const idx = inlineCode2.search(/^[\t ]*import\b/m);
							if (idx > 0) {
								const prefix = inlineCode2.slice(0, idx);
								let open = 0,
									close = 0;
								let inS = false,
									inD = false,
									inT = false,
									inLC = false,
									inBC = false;
								for (let i = 0; i < prefix.length; i++) {
									const ch = prefix[i],
										nx = prefix[i + 1];
									if (inLC) {
										if (ch === '\n') inLC = false;
										continue;
									}
									if (inBC) {
										if (ch === '*' && nx === '/') {
											inBC = false;
											i++;
										}
										continue;
									}
									if (inS) {
										if (ch === '\\') {
											i++;
											continue;
										}
										if (ch === "'") inS = false;
										continue;
									}
									if (inD) {
										if (ch === '\\') {
											i++;
											continue;
										}
										if (ch === '"') inD = false;
										continue;
									}
									if (inT) {
										if (ch === '\\') {
											i++;
											continue;
										}
										if (ch === '`') inT = false;
										continue;
									}
									if (ch === '/' && nx === '/') {
										inLC = true;
										i++;
										continue;
									}
									if (ch === '/' && nx === '*') {
										inBC = true;
										i++;
										continue;
									}
									if (ch === "'") {
										inS = true;
										continue;
									}
									if (ch === '"') {
										inD = true;
										continue;
									}
									if (ch === '`') {
										inT = true;
										continue;
									}
									if (ch === '{') open++;
									else if (ch === '}') close++;
								}
								const missing = open - close;
								if (missing > 0) {
									inlineCode2 = inlineCode2.slice(0, idx) + '}'.repeat(missing) + '\n' + inlineCode2.slice(idx);
								}
							}
						} catch {}
						// Final TS strip on the whole assembled module (safety net)
						try {
							const tsFinal = await babelCore.transformAsync(inlineCode2, {
								plugins: [[pluginTransformTypescript as any, { allowDeclareFields: true }]],
								ast: false,
								sourceType: 'module',
								configFile: false,
								babelrc: false,
							} as any);
							if (tsFinal?.code) inlineCode2 = tsFinal.code;
						} catch {}
						inlineCode2 = ensureVariableDynamicImportHelper(inlineCode2);
						inlineCode2 = ensureGuardPlainDynamicImports(inlineCode2, origin);
						inlineCode2 = REQUIRE_GUARD_SNIPPET + inlineCode2;
						// If no render materialized, return a clear error module for deterministic failure
						try {
							const lacksRender = !/__ns_render\b/.test(inlineCode2) && !/__ns_sfc__\.render\s*=/.test(inlineCode2);
							if (lacksRender) {
								const err = `throw new Error(\"[sfc-asm] ${base}: no render generated by assembler\");\nexport default {};`;
								res.statusCode = 200;
								res.end(err);
								return;
							}
						} catch {}
						// Cosmetic and parser-friendly: ensure a newline after the canonical banner
						try {
							inlineCode2 = inlineCode2.replace(/(\/\/ \[sfc-asm\]\[canonical\])(?!\n)/, '$1\n');
						} catch {}
						// Bust device cache for runtime bridge so helpers are always current for this graph version
						try {
							const origin = options.getServerOrigin(server);
							inlineCode2 = ensureVersionedRtImports(inlineCode2, origin, Number(ver));
							inlineCode2 = strategy.ensureVersionedImports?.(inlineCode2, origin, Number(ver)) ?? inlineCode2;
						} catch {}
						// Normalize imports/helpers via AST to ensure _defineComponent and other helpers are bound once
						try {
							inlineCode2 = astNormalizeModuleImportsAndHelpers(inlineCode2);
						} catch {}
						// Guarantee a concrete component object exists before exporting default.
						try {
							// Detect an existing declaration of __ns_sfc__ even if it's appended after a semicolon on the same line
							// e.g., "import ...;let __ns_sfc__;" (no newline). Accept start-of-string, newline, or semicolon as anchors.
							const hasDecl = /(^|[\n;])\s*(?:const|let|var)\s+__ns_sfc__\b/.test(inlineCode2);
							if (!hasDecl) {
								inlineCode2 = inlineCode2.replace(/(\/\/ \[sfc-asm\]\[canonical\]\n)/, `$1let __ns_sfc__ = {};\n`);
							}
							// Heal empty declarations (e.g., "let __ns_sfc__;" → initialize to {}), also when preceded by a semicolon
							inlineCode2 = inlineCode2.replace(/(^|[\n;])\s*let\s+__ns_sfc__\s*;?/g, '$1let __ns_sfc__ = {};');
							inlineCode2 = inlineCode2.replace(/(^|[\n;])\s*var\s+__ns_sfc__\s*;?/g, '$1var __ns_sfc__ = {};');
						} catch {}
						if (!/export\s+default\s+__ns_sfc__/.test(inlineCode2) && /__ns_sfc__/.test(inlineCode2)) inlineCode2 += '\nexport default __ns_sfc__';
						res.statusCode = 200;
						res.end(inlineCode2);
						return;
					}
				}
			} catch {}
			// Do not use compiled ?vue or variant fallbacks; assembler must succeed or emit an error
			// Prefer compiling template from source via compiler-sfc; fallback to variant extraction
			let inlineOk = false;
			let helperBindings = '';
			let renderDecl = '';
			let inlineBlock: string | undefined = undefined;
			try {
				const root = server.config?.root || process.cwd();
				const abs = path.join(root, base.replace(/^\//, ''));
				let sfcSrc = '';
				try {
					sfcSrc = readFileSync(abs, 'utf-8');
				} catch {}
				if (sfcSrc) {
					const { descriptor } = parse(sfcSrc, { filename: abs });
					const tpl = descriptor.template?.content || '';
					if (tpl) {
						const id = createHash('md5').update(abs).digest('hex').slice(0, 8);
						const ct = compileTemplate({
							source: tpl,
							id,
							filename: abs,
							isProd: false,
							ssr: false,
							compilerOptions: {
								isCustomElement: (tag: string) => NS_NATIVE_TAGS.has(tag),
							},
						});
						let compiled = (ct && (ct.code || '')) || '';
						if (compiled) {
							// Prefer a full inline template block preserving hoists
							inlineBlock = buildInlineTemplateBlock(compiled) || undefined;
							if (inlineBlock) {
								inlineOk = true;
							} else {
								const extracted = extractTemplateRender(compiled);
								inlineOk = extracted.ok;
								helperBindings = extracted.helperBindings;
								renderDecl = extracted.renderDecl;
								inlineBlock = extracted.inlineBlock;
							}
						}
					}
				}
			} catch {}
			// If compiler-sfc path didn't succeed, attempt variant extraction once
			if (!inlineOk) {
				const extracted = extractTemplateRender(templateCode);
				inlineOk = extracted.ok;
				helperBindings = extracted.helperBindings;
				renderDecl = extracted.renderDecl;
				inlineBlock = extracted.inlineBlock;
			}
			let asm: string;
			if (inlineOk) {
				if (inlineBlock && inlineBlock.trim()) {
					asm = [`// [sfc-asm] ${base} (inlined template body)`, `export * from ${JSON.stringify(scriptUrl)};`, `import * as __script from ${JSON.stringify(scriptUrl)};`, inlineBlock, `const __ns_sfc__ = (__script && __script.default) ? __script.default : {};`, `try { if (typeof __ns_render === 'function' && !__ns_sfc__.render) __ns_sfc__.render = __ns_render; } catch {}`, `export default __ns_sfc__;`].join('\n');
				} else {
					asm = [`// [sfc-asm] ${base} (inlined template)`, `export * from ${JSON.stringify(scriptUrl)};`, `import * as __script from ${JSON.stringify(scriptUrl)};`, helperBindings, renderDecl, `const __ns_sfc__ = (__script && __script.default) ? __script.default : {};`, `try { if (typeof __ns_render === 'function' && !__ns_sfc__.render) __ns_sfc__.render = __ns_render; } catch {}`, `export default __ns_sfc__;`].filter(Boolean).join('\n');
				}
			} else {
				// Deterministic error path when template extraction failed
				res.statusCode = 500;
				res.end(`throw new Error('[sfc-asm] ${base}: template extraction failed');\nexport default {};`);
				return;
			}
			// Run full device processing so helper aliasing and globals are consistent in this path too
			let code = REQUIRE_GUARD_SNIPPET + asm;
			code = options.processCodeForDevice(code, false, true, /(?:^|\/)node_modules\//.test(base), base);
			code = options.rewriteImports(code, base, options.sfcFileMap, options.depFileMap, projectRoot, !!options.verbose, undefined, options.getServerOrigin(server));
			try {
				code = ensureDestructureCoreImports(code);
			} catch {}
			code = ensureVariableDynamicImportHelper(code);
			code = ensureGuardPlainDynamicImports(code, origin);
			try {
				const origin = options.getServerOrigin(server);
				code = ensureVersionedRtImports(code, origin, Number(ver));
				code = strategy.ensureVersionedImports?.(code, origin, Number(ver)) ?? code;
			} catch {}
			// Inline-template body path already runs processCodeForDevice (AST + sanitizers); no additional _defineComponent fix needed
			res.statusCode = 200;
			res.end(code);
		} catch (e) {
			res.statusCode = 500;
			res.end('export {}\n');
		}
	});
}
