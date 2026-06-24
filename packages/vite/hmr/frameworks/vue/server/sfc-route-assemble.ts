import type { TransformResult, ViteDevServer } from 'vite';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import * as path from 'path';

import babelCore from '@babel/core';

import { setDeviceModuleHeaders } from '../../../server/route-helpers.js';
import { astExtractImportsAndStripTypes } from '../../../helpers/ast-extract.js';
import { astNormalizeModuleImportsAndHelpers, astVerifyAndAnnotateDuplicates } from '../../../helpers/ast-normalizer.js';
import { buildInlineTemplateBlock, extractTemplateRender } from './sfc-transforms.js';
import { NS_NATIVE_TAGS } from '../../../server/compiler.js';
import { ensureDestructureCoreImports, ensureGuardPlainDynamicImports, ensureVariableDynamicImportHelper, ensureVersionedRtImports } from '../../../server/websocket-served-module-helpers.js';
import { processCodeForDevice, rewriteImports } from '../../../server/websocket-device-transform.js';
import { REQUIRE_GUARD_SNIPPET } from '../../../server/require-guard.js';
import { getServerOrigin } from '../../../server/server-origin.js';
import { resolveProjectTsAliasRelative } from '../../../../helpers/ts-config-paths.js';
import type { RegisterSfcHandlersOptions } from './sfc-route-shared.js';
import { compileScript, compileSfcStylesToCss, compileTemplate, ensureVersionedNsMAppImports, parse, pluginTransformTypescript } from './sfc-route-shared.js';
import { buildCssRegisterSnippet } from '../../../server/css-device-module.js';

// Cache assembled SFC modules keyed on `base | version | source-content-hash`.
// The source hash in the key means a changed SFC always produces a new key —
// stale output can never be served — and a new graph version (HMR) also rotates
// the key. This skips the full compile (compileScript ×N + multiple Babel
// passes) on repeat requests for unchanged content. Bounded with FIFO eviction.
const sfcAsmCache = new Map<string, string>();
const SFC_ASM_CACHE_MAX = 128;
function setAsmCache(key: string, value: string): void {
	if (sfcAsmCache.has(key)) sfcAsmCache.delete(key);
	sfcAsmCache.set(key, value);
	if (sfcAsmCache.size > SFC_ASM_CACHE_MAX) {
		const oldest = sfcAsmCache.keys().next().value;
		if (oldest !== undefined) sfcAsmCache.delete(oldest);
	}
}

/**
 * Registers `GET /ns/asm` — the deterministic, self-contained SFC assembler module.
 * Extracted verbatim from `websocket-sfc.ts` (pure move, no behavior change).
 */
export function registerSfcAsmRoute(server: ViteDevServer, options: RegisterSfcHandlersOptions): void {
	// 5) Deterministic SFC assembler: GET /ns/asm?path=/src/Comp.vue
	// Place BEFORE any broader /ns/sfc* handlers that might accidentally match and delegate.
	server.middlewares.use(async (req, res, next) => {
		const strategy = options.getStrategy();
		let asmCacheKey: string | null = null;
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			if (!urlObj.pathname.startsWith('/ns/asm')) return next();
			setDeviceModuleHeaders(res);
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
			else if (!spec.startsWith('/') && !spec.startsWith('.')) {
				// Resolve tsconfig path aliases (e.g. @present/..., @app) that the
				// assembler reaches via its own import rewriting — Vite's resolver
				// never touched these, so without this the on-disk read below fails
				// (file not found) → template extraction fails → HTTP 500.
				const aliasRel = resolveProjectTsAliasRelative(spec.replace(/[?#].*$/, ''), server.config?.root || process.cwd());
				if (aliasRel) spec = aliasRel;
			}
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
			// Warm Vite's transform cache for the full-SFC URL; result is unused (the
			// assembler reads the SFC from disk and compiles it inline below).
			await safeTransform(base + '?vue');
			const origin = getServerOrigin(server);
			// Preserve graph version 0 (a valid, falsy version): `||` would fall
			// through to a non-deterministic Date.now() timestamp, giving the same
			// SFC a different URL on every fetch (defeats the device module cache
			// and disagrees with the client, which sends ver='0').
			const graphVer = options.getGraphVersion();
			const ver = String(verFromPath ?? (graphVer != null ? graphVer : Date.now()));
			const scriptUrl = `${origin}/ns/sfc/${ver}${base}?vue&type=script`;
			const templateCode = templateR?.code || '';

			// Compiled SFC <style> registration snippet, shared by the canonical and
			// fallback emit paths below. Populated once the descriptor is parsed.
			let sfcCssSnippet = '';
			// Stamps a stable, path-based `__hmrId` on the component so Vue's
			// registerHMR auto-creates a record at mount — enabling in-place
			// `__VUE_HMR_RUNTIME__.reload` on edit (preserves the App.vue shell /
			// route / scroll) instead of a full resetRootView. Bracket-notation +
			// no explicit createRecord so the Vue-HMR `postClean` strip can't catch it.
			const sfcHmrId = createHash('md5').update(base).digest('hex').slice(0, 8);
			const sfcHmrSnippet = `\n;try{ if (typeof __ns_sfc__ !== 'undefined' && __ns_sfc__) __ns_sfc__["__hmrId"] = ${JSON.stringify(sfcHmrId)}; }catch(__e){}\n`;
			// INLINE-FIRST assembler: compile SFC source into a self-contained ESM module (enhanced diagnostics)
			try {
				const root = server.config?.root || process.cwd();
				const abs = path.join(root, base.replace(/^\//, ''));
				let sfcSrc = '';
				try {
					sfcSrc = readFileSync(abs, 'utf-8');
				} catch {}
				if (sfcSrc) {
					// Content+version keyed cache: serve a prior assembly of identical
					// source for this base/version without recompiling.
					asmCacheKey = `${base}|${ver}|${createHash('md5').update(sfcSrc).digest('hex')}`;
					const cachedAsm = sfcAsmCache.get(asmCacheKey);
					if (cachedAsm !== undefined) {
						res.statusCode = 200;
						res.end(cachedAsm);
						return;
					}
					const { descriptor } = parse(sfcSrc, { filename: abs });
					// Compile the SFC's <style> blocks and build the CSS-register snippet
					// appended below (HMR otherwise drops <style scoped> — only app.css
					// would apply).
					try {
						const sfcCss = await compileSfcStylesToCss(descriptor, abs, projectRoot, !!options.verbose);
						sfcCssSnippet = buildCssRegisterSnippet('sfc:' + base, sfcCss);
					} catch (eCss) {
						if (options.verbose) {
							console.warn('[sfc-asm][style] failed', base, (eCss as any)?.message);
						}
					}
					const id = createHash('md5').update(abs).digest('hex').slice(0, 8);
					// 1) Compile script (prefer inlineTemplate for a complete module)
					let compiledScript = '' as string;
					let bindingMetadata: any = undefined;
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
						if (/export\s+default/.test(sInline?.content || '')) {
							compiledScript = sInline.content;
							bindingMetadata = sInline?.bindings;
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
						} catch {}
					}
					// Always use the canonical assembler path; we deliberately avoid the
					// inlineTemplate early-return which can miss render attachment.
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
									else {
										// tsconfig path aliases (@present/..., @app, @domain, …) →
										// project-root-relative path so the child /ns/asm fetch resolves.
										const aliasRel = resolveProjectTsAliasRelative(spec, projectRoot);
										if (aliasRel) absImp = aliasRel;
									}
								}
								const asmUrl = `/ns/asm/${ver}?path=${encodeURIComponent(absImp)}&mode=inline`;
								return `${pfx}import ${clause} from ${JSON.stringify(asmUrl)};`;
							});
						} catch {}
						// Resolve NON-.vue tsconfig path aliases (e.g. @app, @app/constants/layout,
						// @domain/i18n, @infra/platform, @/foo) in the SFC <script>. The .vue alias
						// imports are handled above (wrapped into /ns/asm). These barrel/.ts aliases
						// bypass Vite's resolver in this disk-read assembler path, so the downstream
						// `processCodeForDevice` rewriter would otherwise mis-classify them as bare
						// node_modules packages (→ /ns/m/node_modules/@app/...). Map each recognized
						// alias to its `/ns/m` project path so the child fetch resolves. Guarded by
						// `resolveProjectTsAliasRelative` returning non-null, so relative, node_modules,
						// and framework (`vue`) specifiers are left untouched — no cross-framework impact.
						try {
							const resolveBareAlias = (spec: string): string | null => {
								const clean = spec.replace(/[?#].*$/, '');
								if (clean.endsWith('.vue')) return null; // handled by the .vue pass above
								const rel = resolveProjectTsAliasRelative(clean, projectRoot);
								return rel ? '/ns/m' + rel + spec.slice(clean.length) : null;
							};
							const rewriteFromClause = (m: string, pfx: string, q: string, spec: string): string => {
								const r = resolveBareAlias(spec);
								return r ? `${pfx}${q}${r}${q}` : m;
							};
							// import ... from '<spec>'  /  export ... from '<spec>'  (newline-tolerant)
							scriptBody = scriptBody.replace(/((?:^|\n)[ \t]*(?:import|export)\b[^;"']*?\bfrom[ \t]*)(["'])([^"'\n]+)\2/g, rewriteFromClause);
							// side-effect import '<spec>'
							scriptBody = scriptBody.replace(/((?:^|\n)[ \t]*import[ \t]*)(["'])([^"'\n]+)\2/g, rewriteFromClause);
							// dynamic import('<spec>')
							scriptBody = scriptBody.replace(/(\bimport[ \t]*\([ \t]*)(["'])([^"'\n]+)\2/g, rewriteFromClause);
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
					inlineCode = processCodeForDevice(inlineCode, false, true);
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
						inlineCode2 = processCodeForDevice(inlineCode2, false, true);
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
							inlineCode2 = rewriteImports(inlineCode2, base, options.sfcFileMap, options.depFileMap, projectRoot, !!options.verbose, undefined, getServerOrigin(server));
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
						inlineCode2 = ensureGuardPlainDynamicImports(inlineCode2);
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
							const origin = getServerOrigin(server);
							inlineCode2 = ensureVersionedRtImports(inlineCode2, origin, Number(ver));
							inlineCode2 = strategy.ensureVersionedImports?.(inlineCode2, origin, Number(ver)) ?? inlineCode2;
							// App-source deps too: the artifact must link against the
							// CURRENT dep content even when V8 still caches the stable
							// `/ns/m/<app-path>` key from a previous save.
							inlineCode2 = ensureVersionedNsMAppImports(inlineCode2, Number(ver));
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
						// Apply the component's compiled <style> CSS at module eval.
						if (sfcCssSnippet) inlineCode2 += sfcCssSnippet;
						if (sfcHmrSnippet) inlineCode2 += sfcHmrSnippet;
						if (asmCacheKey) setAsmCache(asmCacheKey, inlineCode2);
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
						const compiled = (ct && (ct.code || '')) || '';
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
			code = processCodeForDevice(code, false, true, /(?:^|\/)node_modules\//.test(base), base);
			code = rewriteImports(code, base, options.sfcFileMap, options.depFileMap, projectRoot, !!options.verbose, undefined, getServerOrigin(server));
			try {
				code = ensureDestructureCoreImports(code);
			} catch {}
			code = ensureVariableDynamicImportHelper(code);
			code = ensureGuardPlainDynamicImports(code);
			try {
				const origin = getServerOrigin(server);
				code = ensureVersionedRtImports(code, origin, Number(ver));
				code = strategy.ensureVersionedImports?.(code, origin, Number(ver)) ?? code;
				code = ensureVersionedNsMAppImports(code, Number(ver));
			} catch {}
			// Inline-template body path already runs processCodeForDevice (AST + sanitizers); no additional _defineComponent fix needed
			// Apply the component's compiled <style> CSS at module eval.
			if (sfcCssSnippet) code += sfcCssSnippet;
			if (sfcHmrSnippet) code += sfcHmrSnippet;
			if (asmCacheKey) setAsmCache(asmCacheKey, code);
			res.statusCode = 200;
			res.end(code);
		} catch (e) {
			res.statusCode = 500;
			res.end('export {}\n');
		}
	});
}
