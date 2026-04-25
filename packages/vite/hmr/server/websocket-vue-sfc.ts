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

const babelTraverse: any = (traverse as any)?.default || (traverse as any);
const { parse, compileTemplate, compileScript } = vueSfcCompiler;

const pluginTransformTypescript: any = (() => {
	const requireFromHere = createRequire(import.meta.url);
	const loaded = requireFromHere('@babel/plugin-transform-typescript');
	return loaded?.default || loaded;
})();

type ProcessCodeForDeviceFn = (code: string, isVitePreBundled: boolean, preserveVendorImports?: boolean, isNodeModule?: boolean, sourceId?: string) => string;
type RewriteImportsFn = (code: string, importerPath: string, sfcFileMap: Map<string, string>, depFileMap: Map<string, string>, projectRoot: string, verbose?: boolean, outputDirOverrideRel?: string, httpOrigin?: string, resolveVendorAsHttp?: boolean) => string;

export interface RegisterVueSfcHandlersOptions {
	verbose: boolean;
	requireGuardSnippet: string;
	appVirtualWithSlash: string;
	sfcFileMap: Map<string, string>;
	depFileMap: Map<string, string>;
	getGraphVersion(): number;
	getStrategy(): FrameworkServerStrategy;
	getServerOrigin(server: ViteDevServer): string;
	cleanCode(code: string): string;
	processCodeForDevice: ProcessCodeForDeviceFn;
	rewriteImports: RewriteImportsFn;
	ensureVersionedCoreImports(code: string, origin: string, version: number): string;
}

export interface ParsedVersionedEndpointPath {
	verFromPath: string | null;
	pathStyle: string;
}

function setJavascriptResponseHeaders(res: any): void {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
	res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Expires', '0');
}

function setJsonResponseHeaders(res: any): void {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Content-Type', 'application/json; charset=utf-8');
	res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Expires', '0');
}

export function parseVersionedEndpointPath(basePath: string, pathname: string): ParsedVersionedEndpointPath {
	const rawRemainder = pathname.slice(basePath.length) || '';
	let verFromPath: string | null = null;
	let pathStyle = rawRemainder;
	if (rawRemainder && rawRemainder.startsWith('/')) {
		const parts = rawRemainder.split('/');
		if (parts.length > 2 && /^[0-9]+$/.test(parts[1] || '')) {
			verFromPath = parts[1];
			pathStyle = '/' + parts.slice(2).join('/');
		}
	}
	return { verFromPath, pathStyle };
}

export function buildSfcDelegatedModule(importerPath: string, version: string): string {
	const asmPath = `/ns/asm/${version}?path=${encodeURIComponent(importerPath)}`;
	return `// [sfc] kind=full (delegated to assembler) path=${importerPath}\nexport * from ${JSON.stringify(asmPath)};\nexport { default } from ${JSON.stringify(asmPath)};\n`;
}

export function templateHasRender(templateCode: string): boolean {
	return /export\s+function\s+render\s*\(/.test(templateCode) || /(?:^|\n)\s*function\s+render\s*\(/.test(templateCode) || /export\s+(?:const|let|var)\s+render\s*=/.test(templateCode) || /(?:^|\n)\s*(?:const|let|var)\s+render\s*=/.test(templateCode) || /\brender\s*[:=]\s*/.test(templateCode) || /export\s*\{\s*render\s*(?:as\s*render)?\s*\}/.test(templateCode);
}

function normalizeRequestedSpec(spec: string, appVirtualWithSlash: string): string {
	let normalized = spec || '';
	if (normalized.startsWith('@/')) normalized = appVirtualWithSlash + normalized.slice(2);
	if (!normalized.startsWith('/')) normalized = '/' + normalized;
	return normalized;
}

export function registerVueSfcHandlers(server: ViteDevServer, options: RegisterVueSfcHandlersOptions): void {
	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			const pathname = urlObj.pathname;
			const isNs = pathname === '/ns/sfc' || pathname.startsWith('/ns/sfc/');
			if (!isNs) return next();
			if (pathname.startsWith('/ns/asm') || pathname.startsWith('/ns/sfc-meta')) return next();

			setJavascriptResponseHeaders(res);

			const basePath = '/ns/sfc';
			let pathParam = urlObj.searchParams.get('path') || '';
			const { verFromPath, pathStyle: rawPathStyle } = parseVersionedEndpointPath(basePath, pathname);
			let pathStyle = rawPathStyle;
			if (pathStyle && pathStyle !== '/' && !pathParam) {
				if (!pathStyle.startsWith('/')) pathStyle = '/' + pathStyle;
				pathParam = pathStyle + (urlObj.search || '');
			}

			let fullSpec = pathParam || '';
			if (!fullSpec) {
				res.statusCode = 200;
				res.end('export {}\n');
				return;
			}
			fullSpec = normalizeRequestedSpec(fullSpec, options.appVirtualWithSlash);

			const isVariant = /[?&]vue&type=/.test(fullSpec);
			const variantTypeMatch = /[?&]type=([^&]+)/.exec(fullSpec);
			const variantType = variantTypeMatch?.[1] || null;
			const isStyleVariant = /[?&]type=style\b/.test(fullSpec);

			let candidate = fullSpec;
			let transformed: TransformResult | null = null;
			if (!isVariant) {
				const baseFilePath = fullSpec.replace(/[?#].*$/, '');
				const candidates = [baseFilePath + (baseFilePath.includes('?') ? '&' : '?') + 'vue', baseFilePath];
				for (const currentCandidate of candidates) {
					try {
						const result = await server.transformRequest(currentCandidate);
						if (result?.code) {
							transformed = result;
							candidate = currentCandidate;
							break;
						}
					} catch {}
				}
				if (!transformed?.code) {
					if (options.verbose) {
						try {
							console.warn('[sfc][serve] transform miss for', fullSpec);
						} catch {}
					}
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

			if (isStyleVariant) {
				const sig = `// [sfc] kind=variant:style path=${fullSpec.replace(/\n/g, '')} len=0 default=false\n`;
				res.statusCode = 200;
				res.end(`${sig}export {}\n`);
				return;
			}

			let code = transformed.code;
			code = options.requireGuardSnippet + code;
			const projectRoot = (server as any).config?.root || process.cwd();

			if (!isVariant) {
				const importerPath = fullSpec.replace(/[?#].*$/, '');
				const version = verFromPath || '0';
				res.statusCode = 200;
				res.end(buildSfcDelegatedModule(importerPath, version));
				return;
			}

			if (variantType === 'template') {
				const preferSelfCompile = !!process.env.NS_HMR_SELF_COMPILE_TEMPLATE;
				if (preferSelfCompile) {
					try {
						const projectRootTemplate = (server as any).config?.root || process.cwd();
						const baseFilePath = fullSpec.replace(/[?#].*$/, '');
						const absolutePath = path.join(projectRootTemplate, baseFilePath.replace(/^\//, ''));
						let sfcSource = '';
						try {
							sfcSource = readFileSync(absolutePath, 'utf-8');
						} catch {}
						if (sfcSource) {
							const { descriptor } = parse(sfcSource, { filename: absolutePath });
							const id = createHash('md5').update(absolutePath).digest('hex').slice(0, 8);
							let bindingMetadata: any = undefined;
							try {
								const script: any = (compileScript as any)(
									descriptor as any,
									{
										id,
										inlineTemplate: false,
										reactivityTransform: false,
									} as any,
								);
								bindingMetadata = script?.bindings;
							} catch {}
							const templateSource = descriptor.template?.content || '';
							const compiledTemplate: any = compileTemplate({
								source: templateSource,
								id,
								filename: absolutePath,
								isProd: false,
								ssr: false,
								compilerOptions: {
									bindingMetadata,
									isCustomElement: (tag: string) => NS_NATIVE_TAGS.has(tag),
								},
							} as any);
							let out = (compiledTemplate && (compiledTemplate.code || '')) || '';
							try {
								out = out.replace(/from\s+["'](?:nativescript-vue|vue)[^"']*["']/g, 'from "/ns/rt"');
							} catch {}
							code = processTemplateVariantMinimal(out);
						} else {
							code = 'export {}\n';
						}
					} catch (templateError) {
						if (options.verbose) {
							try {
								console.warn('[sfc][template][self-compile][fail]', fullSpec, (templateError as any)?.message);
							} catch {}
						}
						code = transformed.code || 'export {}\n';
						code = processTemplateVariantMinimal(code);
					}
				} else {
					code = transformed.code || 'export {}\n';
					code = processTemplateVariantMinimal(code);
				}
			}

			try {
				const ast = babelParse(code, {
					sourceType: 'module',
					plugins: ['typescript'] as any,
				}) as any;
				const templateBindings = new Set<string>();
				const navToLocals: string[] = [];
				const navBackLocals: string[] = [];
				babelTraverse(ast, {
					ImportDeclaration(pathNode: any) {
						const spec = pathNode.node.source.value || '';
						if (typeof spec === 'string' && /\.vue\?[^\n]*type=template/.test(spec)) {
							const ids: string[] = [];
							for (const currentSpecifier of pathNode.node.specifiers) {
								if (t.isImportSpecifier(currentSpecifier)) {
									const imported = t.isIdentifier(currentSpecifier.imported) ? currentSpecifier.imported.name : undefined;
									const local = t.isIdentifier(currentSpecifier.local) ? currentSpecifier.local.name : undefined;
									if ((imported === 'render' || imported === undefined) && local) ids.push(local);
								} else if (t.isImportDefaultSpecifier(currentSpecifier) || t.isImportNamespaceSpecifier(currentSpecifier)) {
									if (t.isIdentifier(currentSpecifier.local)) ids.push(currentSpecifier.local.name);
								}
							}
							ids.forEach((name) => templateBindings.add(name));
							pathNode.remove();
							return;
						}
						const isNsVue = typeof spec === 'string' && (/nativescript-vue/.test(spec) || /vendor\.mjs$/.test(spec) || /\/node_modules\/\.vite\/deps\/nativescript-vue\.js/.test(spec));
						if (isNsVue) {
							const remain: typeof pathNode.node.specifiers = [];
							for (const currentSpecifier of pathNode.node.specifiers) {
								if (t.isImportSpecifier(currentSpecifier)) {
									const imported = t.isIdentifier(currentSpecifier.imported) ? currentSpecifier.imported.name : undefined;
									const local = t.isIdentifier(currentSpecifier.local) ? currentSpecifier.local.name : undefined;
									if (local && (imported === '$navigateTo' || imported === 'navigateTo')) {
										navToLocals.push(local);
										continue;
									}
									if (local && (imported === '$navigateBack' || imported === 'navigateBack')) {
										navBackLocals.push(local);
										continue;
									}
								}
								remain.push(currentSpecifier);
							}
							if (remain.length) {
								pathNode.node.specifiers = remain;
							} else {
								pathNode.remove();
							}
						}
					},
				});
				if (templateBindings.size) {
					babelTraverse(ast, {
						Identifier(pathNode: any) {
							if (templateBindings.has(pathNode.node.name)) {
								pathNode.replaceWith(t.identifier('undefined'));
							}
						},
						AssignmentExpression(pathNode: any) {
							if (t.isMemberExpression(pathNode.node.left) && t.isIdentifier(pathNode.node.left.property, { name: 'render' })) {
								const e = t.identifier('__e');
								const guarded = t.tryStatement(t.blockStatement([t.variableDeclaration('const', [t.variableDeclarator(e, pathNode.node.right as any)]), t.ifStatement(t.logicalExpression('&&', t.binaryExpression('!==', t.unaryExpression('typeof', pathNode.node.left.object as any, true), t.stringLiteral('undefined')), t.binaryExpression('!==', t.unaryExpression('typeof', e, true), t.stringLiteral('undefined'))), t.blockStatement([t.expressionStatement(t.assignmentExpression('=', pathNode.node.left as any, e))]))]), t.catchClause(t.identifier('_e'), t.blockStatement([])));
								pathNode.replaceWithMultiple([guarded]);
							}
						},
					});
				}
				let outCode = genCode(ast as any).code;
				if (navToLocals.length || navBackLocals.length) {
					const shimLines: string[] = [];
					for (const currentName of navToLocals) shimLines.push(`import __ns_rt_nav_to_mod from "/ns/rt";\nconst ${currentName} = (...args) => __ns_rt_nav_to_mod.$navigateTo(...args);`);
					for (const currentName of navBackLocals) shimLines.push(`import __ns_rt_nav_back_mod from "/ns/rt";\nconst ${currentName} = (...args) => __ns_rt_nav_back_mod.$navigateBack(...args);`);
					outCode = shimLines.join('\n') + '\n' + outCode;
				}
				code = outCode;
			} catch {}

			code = options.processCodeForDevice(code, false, true, /(?:^|\/)node_modules\//.test(fullSpec), fullSpec);
			try {
				const importerPath = fullSpec.replace(/[?#].*$/, '');
				const version = verFromPath || '0';
				const ast = babelParse(code, {
					sourceType: 'module',
					plugins: ['typescript'] as any,
				}) as any;
				babelTraverse(ast, {
					ImportDeclaration(pathNode: any) {
						const src = pathNode.node.source.value || '';
						if (typeof src !== 'string') return;
						if (/^https?:\/\//.test(src)) return;
						if (/\.vue(?:$|\?)/.test(src)) {
							let spec = src;
							if (spec.startsWith('./') || spec.startsWith('../')) {
								spec = path.posix.normalize(path.posix.join(path.posix.dirname(importerPath), spec));
								if (!spec.startsWith('/')) spec = '/' + spec;
							} else if (!spec.startsWith('/')) {
								if (spec.startsWith('@@/')) spec = '/' + spec.slice(2);
								if (spec.startsWith('@/')) spec = options.appVirtualWithSlash + spec.slice(2);
							}
							if (!/\bvue&type=/.test(src)) {
								spec = spec.replace(/[?#].*$/, '');
								const asmUrl = `/ns/asm/${version}?path=${encodeURIComponent(spec)}&mode=inline`;
								pathNode.node.source = t.stringLiteral(asmUrl);
							}
						}
					},
				});
				code = genCode(ast as any).code;
			} catch {}

			try {
				const importerPath = fullSpec.replace(/[?#].*$/, '');
				const tsResult = await babelCore.transformAsync(code, {
					plugins: [[pluginTransformTypescript as any, { allowDeclareFields: true }]],
					sourceType: 'module',
					filename: importerPath.endsWith('.vue') ? importerPath.replace(/\.vue$/, '.ts') : importerPath + '.ts',
					comments: true,
					configFile: false,
					babelrc: false,
				});
				if (tsResult?.code) {
					code = tsResult.code;
				}
			} catch (variantTsError) {
				if (options.verbose) {
					try {
						console.warn('[sfc][variant:script][babel-ts][fail]', fullSpec, (variantTsError as any)?.message);
					} catch {}
				}
			}

			const importerPath = fullSpec.replace(/[?#].*$/, '');
			if (variantType !== 'template') {
				code = options.cleanCode(code);
			}
			code = options.rewriteImports(code, importerPath, options.sfcFileMap, options.depFileMap, projectRoot, !!options.verbose, undefined, options.getServerOrigin(server));
			code = ensureVariableDynamicImportHelper(code);
			try {
				const versionNumber = Number(verFromPath || '0');
				const currentVersion = Number.isFinite(versionNumber) && versionNumber > 0 ? versionNumber : options.getGraphVersion();
				const origin = options.getServerOrigin(server);
				code = ensureVersionedRtImports(code, origin, currentVersion);
				code = options.getStrategy().ensureVersionedImports(code, origin, currentVersion);
				code = options.ensureVersionedCoreImports(code, origin, currentVersion);
			} catch {}
			try {
				code = ensureDestructureCoreImports(code);
			} catch {}
			try {
				code = astNormalizeModuleImportsAndHelpers(code);
			} catch {}
			try {
				code = stripRtCoreSentinel(code);
			} catch {}
			try {
				const versionNumber = Number(verFromPath || '0');
				const currentVersion = Number.isFinite(versionNumber) && versionNumber > 0 ? versionNumber : options.getGraphVersion();
				const origin = options.getServerOrigin(server);
				code = ensureVersionedRtImports(code, origin, currentVersion);
				code = options.ensureVersionedCoreImports(code, origin, currentVersion);
			} catch {}
			try {
				code = stripDanglingViteCjsImports(code);
			} catch {}

			const hasDefault = /\bexport\s+default\b/.test(code);
			const kind = isVariant ? `variant:${variantType || 'unknown'}` : 'full';
			const sig = `// [sfc] kind=${kind} path=${importerPath} len=${code.length} default=${hasDefault} wrapped=${false}\n`;
			if (options.verbose) {
				try {
					console.log(`[sfc][serve] ${fullSpec} kind=${kind} default=${hasDefault} bytes=${code.length}`);
				} catch {}
			}
			if (!hasDefault) {
				const match = code.match(/\b(?:const|let|var)\s+(__ns_sfc__|_sfc_main)\b/);
				if (match && match[1]) {
					code += `\nexport default ${match[1]};`;
				} else if (/\b_defineComponent\s*\(|\bdefineComponent\s*\(/.test(code)) {
					code += '\nexport default (typeof __ns_sfc__ !== "undefined" ? __ns_sfc__ : (typeof _sfc_main !== "undefined" ? _sfc_main : undefined));';
				}
			}
			res.statusCode = 200;
			res.end(sig + code);
		} catch {
			res.statusCode = 500;
			res.end('export {}\n');
		}
	});

	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			if (!urlObj.pathname.startsWith('/ns/sfc-meta')) return next();

			setJsonResponseHeaders(res);

			let spec = urlObj.searchParams.get('path') || '';
			if (!spec) {
				res.statusCode = 400;
				res.end(JSON.stringify({ error: 'missing path' }));
				return;
			}
			spec = normalizeRequestedSpec(spec, options.appVirtualWithSlash);
			const base = spec.replace(/[?#].*$/, '');
			const [scriptResult, templateResult] = await Promise.all([server.transformRequest(base + '?vue&type=script'), server.transformRequest(base + '?vue&type=template')]);
			const scriptCode = scriptResult?.code || '';
			const templateCode = templateResult?.code || '';
			const scriptMeta = extractExportMetadata(scriptCode);
			const hasRender = templateHasRender(templateCode);
			if (hasRender && options.verbose) {
				try {
					console.log('[sfc-meta] detected render for', base);
				} catch {}
			} else if (!hasRender && options.verbose) {
				try {
					console.warn('[sfc-meta] render NOT detected for', base);
				} catch {}
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
		} catch (error: any) {
			res.statusCode = 500;
			res.end(JSON.stringify({ error: error?.message || String(error) }));
		}
	});

	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			if (!urlObj.pathname.startsWith('/ns/asm')) return next();

			setJavascriptResponseHeaders(res);

			const asmBase = '/ns/asm';
			const { verFromPath } = parseVersionedEndpointPath(asmBase, urlObj.pathname);
			let spec = urlObj.searchParams.get('path') || '';
			const diag = urlObj.searchParams.get('diag') === '1';
			if (!spec) {
				res.statusCode = 400;
				res.end('export {}\n');
				return;
			}
			spec = normalizeRequestedSpec(spec, options.appVirtualWithSlash);
			const base = spec.replace(/[?#].*$/, '');
			if (diag) {
				const code = `// [sfc-asm] ${base} (diag)\n` + `// vue shim for diag-only instantiation\n` + `var _createElementVNode = globalThis.createElementVNode || globalThis._createElementVNode;\n` + `const __ns_sfc__ = { name: ${JSON.stringify(base.split('/').pop() || 'DiagComp')}, render(){ return _createElementVNode ? _createElementVNode('StackLayout') : (globalThis.createElementVNode ? globalThis.createElementVNode('StackLayout') : {}); } };\nexport default __ns_sfc__;\n`;
				res.statusCode = 200;
				res.end(code);
				return;
			}

			const projectRoot = (server as any).config?.root || process.cwd();
			const safeTransform = async (candidate: string): Promise<TransformResult | null> => {
				try {
					return await server.transformRequest(candidate);
				} catch {
					return null;
				}
			};
			const scriptResult = await safeTransform(base + '?vue&type=script');
			const templateResult = await safeTransform(base + '?vue&type=template');
			await safeTransform(base + '?vue');
			const origin = options.getServerOrigin(server);
			const version = String(verFromPath || options.getGraphVersion() || Date.now());
			const scriptUrl = `${origin}/ns/sfc/${version}${base}?vue&type=script`;
			const templateCode = templateResult?.code || '';

			try {
				const root = (server as any).config?.root || process.cwd();
				const absolutePath = path.join(root, base.replace(/^\//, ''));
				let sfcSource = '';
				try {
					sfcSource = readFileSync(absolutePath, 'utf-8');
				} catch {}
				if (sfcSource) {
					const { descriptor } = parse(sfcSource, { filename: absolutePath });
					const id = createHash('md5').update(absolutePath).digest('hex').slice(0, 8);
					let compiledScript = '';
					let bindingMetadata: any = undefined;
					let usedInlineScript = false;
					try {
						const isNSNative = (tag: string) => NS_NATIVE_TAGS.has(tag);
						const inlineScript: any = (compileScript as any)(
							descriptor as any,
							{
								id,
								inlineTemplate: true,
								reactivityTransform: false,
								templateOptions: {
									compilerOptions: { isCustomElement: isNSNative },
								},
							} as any,
						);
						if (/export\s+default/.test(inlineScript?.content || '')) {
							compiledScript = inlineScript.content;
							bindingMetadata = inlineScript?.bindings;
							usedInlineScript = true;
						} else {
							const fallbackScript: any = (compileScript as any)(
								descriptor as any,
								{
									id,
									inlineTemplate: false,
									reactivityTransform: false,
								} as any,
							);
							compiledScript = fallbackScript?.content || '';
							bindingMetadata = fallbackScript?.bindings;
						}
					} catch (scriptError) {
						if (options.verbose) {
							try {
								console.warn('[sfc-asm][compileScript] failed', base, (scriptError as any)?.message);
							} catch {}
						}
						try {
							const fallbackScript: any = (compileScript as any)(
								descriptor as any,
								{
									id,
									inlineTemplate: false,
									reactivityTransform: false,
								} as any,
							);
							compiledScript = fallbackScript?.content || '';
							bindingMetadata = fallbackScript?.bindings;
						} catch (fallbackError) {
							if (options.verbose) {
								try {
									console.warn('[sfc-asm][compileScript][no-inline-fallback] failed', base, (fallbackError as any)?.message);
								} catch {}
							}
						}
					}
					if (!compiledScript && scriptResult?.code) {
						compiledScript = scriptResult.code;
					}
					if (usedInlineScript) {
						try {
							const noInlineScript: any = (compileScript as any)(
								descriptor as any,
								{
									id,
									inlineTemplate: false,
									reactivityTransform: false,
								} as any,
							);
							compiledScript = noInlineScript?.content || compiledScript;
							bindingMetadata = noInlineScript?.bindings || bindingMetadata;
						} catch (noInlineError) {
							if (options.verbose) {
								try {
									console.warn('[sfc-asm][compileScript][no-inline-fallback] failed', base, (noInlineError as any)?.message);
								} catch {}
							}
						}
					}

					let compiledTemplateCode = '';
					try {
						const templateSource = descriptor.template?.content || '';
						if (templateSource) {
							const compiledTemplate: any = compileTemplate({
								source: templateSource,
								id,
								filename: absolutePath,
								isProd: false,
								ssr: false,
								compilerOptions: {
									bindingMetadata,
									isCustomElement: (tag: string) => NS_NATIVE_TAGS.has(tag),
								},
							} as any);
							compiledTemplateCode = (compiledTemplate && (compiledTemplate.code || '')) || '';
							if (compiledTemplate?.errors?.length && options.verbose) {
								try {
									console.warn('[sfc-asm][compileTemplate][errors]', base, compiledTemplate.errors);
								} catch {}
							}
						}
					} catch (templateError) {
						if (options.verbose) {
							try {
								console.warn('[sfc-asm][compileTemplate] failed', base, (templateError as any)?.message);
							} catch {}
						}
						if (templateResult?.code) compiledTemplateCode = templateResult.code;
					}
					if (!compiledTemplateCode) {
						compiledTemplateCode = "export function render(){ const _ = (globalThis.createElementVNode||globalThis._createElementVNode); return _? _('StackLayout') : {}; }\n";
					}

					let scriptBody = compiledScript || '';
					if (scriptBody) {
						scriptBody = scriptBody.replace(/(^|\n)\s*import\s+([^;\n]+)\s+from\s+["'](?:vue|nativescript-vue|~\/vendor\.mjs)(?:\/[^\"]*)?["'];?/g, (_match: string, prefix: string, clause: string) => `${prefix}import ${clause} from "/ns/rt";`);
						try {
							const importerDir = path.posix.dirname(base);
							scriptBody = scriptBody.replace(/(^|\n)\s*import\s+([^;\n]+)\s+from\s+["']([^"'\n]+\.vue)(?:\?[^"'\n]*)?["'];?/g, (_match: string, prefix: string, clause: string, importSpec: string) => {
								let absoluteImport = importSpec;
								if (importSpec.startsWith('./') || importSpec.startsWith('../')) {
									absoluteImport = path.posix.normalize(path.posix.join(importerDir, importSpec));
									if (!absoluteImport.startsWith('/')) absoluteImport = '/' + absoluteImport;
								} else if (!importSpec.startsWith('/')) {
									if (absoluteImport.startsWith('@/')) absoluteImport = options.appVirtualWithSlash + absoluteImport.slice(2);
								}
								const asmUrl = `/ns/asm/${version}?path=${encodeURIComponent(absoluteImport)}&mode=inline`;
								return `${prefix}import ${clause} from ${JSON.stringify(asmUrl)};`;
							});
						} catch {}
					}

					let helperBindings = '';
					let renderDecl = '';
					let inlineBlock: string | undefined;
					let renderOk = false;
					if (compiledTemplateCode) {
						try {
							inlineBlock = buildInlineTemplateBlock(compiledTemplateCode) || undefined;
							if (!inlineBlock) {
								const extracted = extractTemplateRender(compiledTemplateCode);
								helperBindings = extracted.helperBindings;
								renderDecl = extracted.renderDecl;
								inlineBlock = extracted.inlineBlock;
								renderOk = extracted.ok;
							} else {
								renderOk = true;
							}
						} catch (extractError) {
							if (options.verbose) {
								try {
									console.warn('[sfc-asm][extractTemplateRender] failed', base, (extractError as any)?.message);
								} catch {}
							}
						}
					}
					if (!renderOk && !inlineBlock) {
						try {
							const templateUrl = `${origin}/ns/sfc/${version}${base}?vue&type=template`;
							const importLine = `import * as __template from ${JSON.stringify(templateUrl)};`;
							helperBindings += `\n${importLine}`;
							renderDecl += `\nfunction __ns_getRender(){\n  try {\n    if (__template && __template.render) return __template.render;\n  } catch (_e) {}\n  try {\n    const _ = globalThis.createElementVNode || globalThis._createElementVNode;\n    return _ ? function(){ return _('StackLayout'); } : function(){ return {}; };\n  } catch (_e) { return function(){ return {}; }; }\n}\n`;
							renderOk = true;
						} catch {}
					}

					let scriptTransformed = scriptBody;
					if (scriptTransformed) {
						scriptTransformed = scriptTransformed.replace(/(^|\n)\s*export\s+default\s+/g, '$1const __ns_sfc__ = ').replace(/(^|\n)\s*export\s*\{[^}]*\}\s*;?\s*/g, '\n/* removed named exports for inline asm */\n');
						scriptTransformed = scriptTransformed.replace(/(^|[\n;])\s*(?:const|let|var)\s+__ns_sfc__\s*=\s*/g, '$1__ns_sfc__ = ');
						if (!/(^|[\n;])\s*(?:const|let|var)\s+__ns_sfc__\b/.test(scriptTransformed)) {
							scriptTransformed = 'let __ns_sfc__;\n' + scriptTransformed;
						}
						scriptTransformed = scriptTransformed.replace(/^\s*\}+(?=\s*[^}])/, (value) => `/* [asm-fix] removed ${value.length} stray leading braces */\n`);
					} else {
						try {
							const componentName = (base.split('/').pop() || 'Component').replace(/\.vue$/i, '') || 'Component';
							scriptTransformed = `import { defineComponent as _defineComponent } from "/ns/rt";\nlet __ns_sfc__;\n__ns_sfc__ = /*@__PURE__*/_defineComponent({ __name: ${JSON.stringify(componentName)} });`;
						} catch {
							scriptTransformed = 'import { defineComponent as _defineComponent } from "/ns/rt";\nlet __ns_sfc__;\n__ns_sfc__ = /*@__PURE__*/_defineComponent({});';
						}
					}

					const parts: string[] = [];
					parts.push(`// [sfc-asm] ${base} (inline-compiled)`);
					if (helperBindings) parts.push(helperBindings);
					parts.push(scriptTransformed);
					parts.push(renderDecl);
					parts.push(`try { if (!__ns_sfc__.render) Object.defineProperty(__ns_sfc__, 'render', { configurable: true, enumerable: true, get(){ const r = (typeof __ns_getRender==='function' ? __ns_getRender() : undefined); Object.defineProperty(__ns_sfc__, 'render', { value: r, writable: true, configurable: true, enumerable: true }); return r; }, set(v){ Object.defineProperty(__ns_sfc__, 'render', { value: v, writable: true, configurable: true, enumerable: true }); } }); } catch(_e){}`);
					parts.push("export function render(){ const f = (typeof __ns_getRender==='function' ? __ns_getRender() : (__ns_sfc__ && __ns_sfc__.render)); return typeof f==='function' ? f.apply(this, arguments) : undefined; }");
					parts.push('export default __ns_sfc__');
					let inlineCode = parts.filter(Boolean).join('\n');
					inlineCode = options.processCodeForDevice(inlineCode, false, true);
					try {
						inlineCode = options.ensureVersionedCoreImports(inlineCode, options.getServerOrigin(server), Number(version));
					} catch {}
					try {
						inlineCode = ensureDestructureCoreImports(inlineCode);
					} catch {}

					try {
						const tsResult = await babelCore.transformAsync(scriptTransformed, {
							plugins: [[pluginTransformTypescript as any, { allowDeclareFields: true }]],
							ast: false,
							sourceType: 'module',
							configFile: false,
							babelrc: false,
						} as any);
						if (tsResult?.code) scriptTransformed = tsResult.code;
					} catch (tsError) {
						if (options.verbose) {
							try {
								console.warn('[sfc-asm][babel-ts][fail]', base, (tsError as any)?.message);
							} catch {}
						}
					}

					let importLines: string[] = [];
					try {
						const astResult = astExtractImportsAndStripTypes(scriptTransformed);
						importLines = astResult.imports;
						scriptTransformed = astResult.body;
						if (astResult.diagnostics.length && options.verbose) {
							try {
								console.warn('[sfc-asm][ast]', base, astResult.diagnostics.join('; '));
							} catch {}
						}
					} catch (astError) {
						if (options.verbose) {
							try {
								console.warn('[sfc-asm][ast][fail]', base, (astError as any)?.message);
							} catch {}
						}
					}

					if (renderDecl && /(^|\n)\s*(?:export\s+)?function\s+__ns_render\s*\(/.test(renderDecl) && !/\}\s*$/.test(renderDecl)) {
						renderDecl = renderDecl.trimEnd() + '\n}';
					}

					const outParts: string[] = [];
					outParts.push(`// [sfc-asm] ${base} (inline-compiled)`);
					outParts.push('// [sfc-asm][canonical]');
					if (importLines.length) outParts.push(Array.from(new Set(importLines)).join('\n'));
					outParts.push(scriptTransformed);
					if (inlineBlock) {
						outParts.push(inlineBlock);
					} else {
						if (helperBindings) outParts.push(helperBindings);
						if (renderDecl && renderDecl.trim()) outParts.push(renderDecl);
					}
					outParts.push(`try { if (!__ns_sfc__.render) Object.defineProperty(__ns_sfc__, 'render', { configurable: true, enumerable: true, get(){ const r = (typeof __ns_getRender==='function' ? __ns_getRender() : (typeof __ns_render==='function' ? __ns_render : undefined)); Object.defineProperty(__ns_sfc__, 'render', { value: r, writable: true, configurable: true, enumerable: true }); return r; }, set(v){ Object.defineProperty(__ns_sfc__, 'render', { value: v, writable: true, configurable: true, enumerable: true }); } }); } catch(_e){}`);
					outParts.push('export function render(){ const f = (typeof __ns_getRender==="function" ? __ns_getRender() : (typeof __ns_render==="function" ? __ns_render : (__ns_sfc__ && __ns_sfc__.render))); return typeof f === "function" ? f.apply(this, arguments) : undefined; }');
					outParts.push('export default __ns_sfc__');
					let inlineCode2 = outParts.filter(Boolean).join('\n');
					inlineCode2 = options.processCodeForDevice(inlineCode2, false, true);
					try {
						inlineCode2 = options.ensureVersionedCoreImports(inlineCode2, options.getServerOrigin(server), Number(version));
					} catch {}
					try {
						inlineCode2 = ensureDestructureCoreImports(inlineCode2);
					} catch {}

					try {
						const lateImportPattern = /^(?!\/\/).*^\s*import\s+[^;]+;?$/gm;
						const allImports: string[] = [];
						inlineCode2 = inlineCode2.replace(lateImportPattern, (value) => {
							allImports.push(value);
							return '';
						});
						if (allImports.length) {
							inlineCode2 = inlineCode2.replace(/(\/\/ \[sfc-asm\]\[canonical\]\n)/, `$1${Array.from(new Set(allImports)).join('\n')}\n/* [asm-fix] re-hoisted ${allImports.length} imports */\n`);
						}
					} catch {}

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
					try {
						inlineCode2 = inlineCode2.replace(/\bdefault\b\s*(?=\}|,|\n)/g, 'default: undefined');
						inlineCode2 = inlineCode2.replace(/<unknown>/g, '');
						inlineCode2 = inlineCode2.replace(/}\s*=>\s*\{/g, '');
					} catch {}
					try {
						inlineCode2 = options.rewriteImports(inlineCode2, base, options.sfcFileMap, options.depFileMap, projectRoot, !!options.verbose, undefined, options.getServerOrigin(server));
					} catch {}
					try {
						const finalTs = await babelCore.transformAsync(inlineCode2, {
							plugins: [[pluginTransformTypescript as any, { allowDeclareFields: true }]],
							ast: false,
							sourceType: 'module',
							configFile: false,
							babelrc: false,
						} as any);
						if (finalTs?.code) inlineCode2 = finalTs.code;
					} catch {}
					try {
						const missingElse = /"onUpdate:modelValue"\s*:\s*_cache\[(\d+)\]\s*\|\|\s*\(_cache\[\1\]\s*=\s*\$event\s*=>\s*_isRef\(\s*([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*\)\s*\?\s*\2\.value\s*=\s*\$event\s*\)/g;
						inlineCode2 = inlineCode2.replace(missingElse, (_match, idx: string, expr: string) => `"onUpdate:modelValue": _cache[${idx}] || (_cache[${idx}] = $event => (_isRef(${expr}) ? (${expr}.value = $event) : (${expr} = $event)))`);
						const malformed = /"onUpdate:modelValue"\s*:\s*_cache\[(\d+)\]\s*\|\|\s*\(_cache\[\1\]\s*=\s*[^=]*\(\s*([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*\)[^=]*=\s*\$event\s*\)\s*\)/g;
						inlineCode2 = inlineCode2.replace(malformed, (_match, idx: string, expr: string) => `"onUpdate:modelValue": _cache[${idx}] || (_cache[${idx}] = $event => (_isRef(${expr}) ? (${expr}.value = $event) : (${expr} = $event)))`);
					} catch {}
					try {
						const firstImportIndex = inlineCode2.search(/^[\t ]*import\b/m);
						if (firstImportIndex > 0) {
							const prefix = inlineCode2.slice(0, firstImportIndex);
							let open = 0;
							let close = 0;
							let inSingle = false;
							let inDouble = false;
							let inTemplate = false;
							let inLineComment = false;
							let inBlockComment = false;
							for (let index = 0; index < prefix.length; index++) {
								const ch = prefix[index];
								const nextChar = prefix[index + 1];
								if (inLineComment) {
									if (ch === '\n') inLineComment = false;
									continue;
								}
								if (inBlockComment) {
									if (ch === '*' && nextChar === '/') {
										inBlockComment = false;
										index++;
									}
									continue;
								}
								if (inSingle) {
									if (ch === '\\') {
										index++;
										continue;
									}
									if (ch === "'") inSingle = false;
									continue;
								}
								if (inDouble) {
									if (ch === '\\') {
										index++;
										continue;
									}
									if (ch === '"') inDouble = false;
									continue;
								}
								if (inTemplate) {
									if (ch === '\\') {
										index++;
										continue;
									}
									if (ch === '`') inTemplate = false;
									continue;
								}
								if (ch === '/' && nextChar === '/') {
									inLineComment = true;
									index++;
									continue;
								}
								if (ch === '/' && nextChar === '*') {
									inBlockComment = true;
									index++;
									continue;
								}
								if (ch === "'") {
									inSingle = true;
									continue;
								}
								if (ch === '"') {
									inDouble = true;
									continue;
								}
								if (ch === '`') {
									inTemplate = true;
									continue;
								}
								if (ch === '{') open++;
								else if (ch === '}') close++;
							}
							const missing = open - close;
							if (missing > 0) {
								inlineCode2 = inlineCode2.slice(0, firstImportIndex) + '}'.repeat(missing) + '\n' + inlineCode2.slice(firstImportIndex);
							}
						}
					} catch {}
					try {
						const finalTs = await babelCore.transformAsync(inlineCode2, {
							plugins: [[pluginTransformTypescript as any, { allowDeclareFields: true }]],
							ast: false,
							sourceType: 'module',
							configFile: false,
							babelrc: false,
						} as any);
						if (finalTs?.code) inlineCode2 = finalTs.code;
					} catch {}
					inlineCode2 = ensureVariableDynamicImportHelper(inlineCode2);
					inlineCode2 = ensureGuardPlainDynamicImports(inlineCode2, origin);
					inlineCode2 = options.requireGuardSnippet + inlineCode2;
					try {
						const lacksRender = !/__ns_render\b/.test(inlineCode2) && !/__ns_sfc__\.render\s*=/.test(inlineCode2);
						if (lacksRender) {
							const err = `throw new Error("[sfc-asm] ${base}: no render generated by assembler");\nexport default {};`;
							res.statusCode = 200;
							res.end(err);
							return;
						}
					} catch {}
					try {
						inlineCode2 = inlineCode2.replace(/(\/\/ \[sfc-asm\]\[canonical\])(?!\n)/, '$1\n');
					} catch {}
					try {
						const origin = options.getServerOrigin(server);
						inlineCode2 = ensureVersionedRtImports(inlineCode2, origin, Number(version));
						inlineCode2 = options.getStrategy().ensureVersionedImports(inlineCode2, origin, Number(version));
						inlineCode2 = options.ensureVersionedCoreImports(inlineCode2, origin, Number(version));
					} catch {}
					try {
						inlineCode2 = astNormalizeModuleImportsAndHelpers(inlineCode2);
					} catch {}
					try {
						const hasDecl = /(^|[\n;])\s*(?:const|let|var)\s+__ns_sfc__\b/.test(inlineCode2);
						if (!hasDecl) {
							inlineCode2 = inlineCode2.replace(/(\/\/ \[sfc-asm\]\[canonical\]\n)/, '$1let __ns_sfc__ = {};\n');
						}
						inlineCode2 = inlineCode2.replace(/(^|[\n;])\s*let\s+__ns_sfc__\s*;?/g, '$1let __ns_sfc__ = {};');
						inlineCode2 = inlineCode2.replace(/(^|[\n;])\s*var\s+__ns_sfc__\s*;?/g, '$1var __ns_sfc__ = {};');
					} catch {}
					if (!/export\s+default\s+__ns_sfc__/.test(inlineCode2) && /__ns_sfc__/.test(inlineCode2)) inlineCode2 += '\nexport default __ns_sfc__';
					res.statusCode = 200;
					res.end(inlineCode2);
					return;
				}
			} catch {}

			let inlineOk = false;
			let helperBindings = '';
			let renderDecl = '';
			let inlineBlock: string | undefined;
			try {
				const root = (server as any).config?.root || process.cwd();
				const absolutePath = path.join(root, base.replace(/^\//, ''));
				let sfcSource = '';
				try {
					sfcSource = readFileSync(absolutePath, 'utf-8');
				} catch {}
				if (sfcSource) {
					const { descriptor } = parse(sfcSource, { filename: absolutePath });
					const templateSource = descriptor.template?.content || '';
					if (templateSource) {
						const id = createHash('md5').update(absolutePath).digest('hex').slice(0, 8);
						const compiledTemplate = compileTemplate({
							source: templateSource,
							id,
							filename: absolutePath,
							isProd: false,
							ssr: false,
							compilerOptions: {
								isCustomElement: (tag: string) => NS_NATIVE_TAGS.has(tag),
							},
						});
						const compiled = ((compiledTemplate as any)?.code || '') as string;
						if (compiled) {
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
			if (!inlineOk) {
				const extracted = extractTemplateRender(templateCode);
				inlineOk = extracted.ok;
				helperBindings = extracted.helperBindings;
				renderDecl = extracted.renderDecl;
				inlineBlock = extracted.inlineBlock;
			}
			if (!inlineOk) {
				res.statusCode = 500;
				res.end(`throw new Error('[sfc-asm] ${base}: template extraction failed');\nexport default {};`);
				return;
			}

			let asm: string;
			if (inlineBlock && inlineBlock.trim()) {
				asm = [`// [sfc-asm] ${base} (inlined template body)`, `export * from ${JSON.stringify(scriptUrl)};`, `import * as __script from ${JSON.stringify(scriptUrl)};`, inlineBlock, `const __ns_sfc__ = (__script && __script.default) ? __script.default : {};`, `try { if (typeof __ns_render === 'function' && !__ns_sfc__.render) __ns_sfc__.render = __ns_render; } catch {}`, 'export default __ns_sfc__;'].join('\n');
			} else {
				asm = [`// [sfc-asm] ${base} (inlined template)`, `export * from ${JSON.stringify(scriptUrl)};`, `import * as __script from ${JSON.stringify(scriptUrl)};`, helperBindings, renderDecl, `const __ns_sfc__ = (__script && __script.default) ? __script.default : {};`, `try { if (typeof __ns_render === 'function' && !__ns_sfc__.render) __ns_sfc__.render = __ns_render; } catch {}`, 'export default __ns_sfc__;'].filter(Boolean).join('\n');
			}

			let code = options.requireGuardSnippet + asm;
			code = options.processCodeForDevice(code, false, true, /(?:^|\/)node_modules\//.test(base), base);
			try {
				code = options.ensureVersionedCoreImports(code, options.getServerOrigin(server), Number(version));
			} catch {}
			code = options.rewriteImports(code, base, options.sfcFileMap, options.depFileMap, projectRoot, !!options.verbose, undefined, options.getServerOrigin(server));
			try {
				code = ensureDestructureCoreImports(code);
			} catch {}
			code = ensureVariableDynamicImportHelper(code);
			code = ensureGuardPlainDynamicImports(code, origin);
			try {
				const origin = options.getServerOrigin(server);
				code = ensureVersionedRtImports(code, origin, Number(version));
				code = options.getStrategy().ensureVersionedImports(code, origin, Number(version));
				code = options.ensureVersionedCoreImports(code, origin, Number(version));
			} catch {}
			res.statusCode = 200;
			res.end(code);
		} catch {
			res.statusCode = 500;
			res.end('export {}\n');
		}
	});
}
