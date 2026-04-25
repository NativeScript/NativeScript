import type { ViteDevServer } from 'vite';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'fs';
import * as path from 'path';

import babelCore from '@babel/core';

import { getPackageJson, getProjectFilePath } from '../../helpers/project.js';

const pluginTransformTypescript: any = (() => {
	const requireFromHere = createRequire(import.meta.url);
	const loaded = requireFromHere('@babel/plugin-transform-typescript');
	return loaded?.default || loaded;
})();

export interface RegisterRuntimeCompatHandlersOptions {
	verbose: boolean;
	requireGuardSnippet: string;
	appRootDir: string;
	defaultMainEntry: string;
	defaultMainEntryVirtual: string;
	getGraphVersion(): number;
	getServerOrigin(server: ViteDevServer): string;
}

function setJavascriptResponseHeaders(res: any): void {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
	res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Expires', '0');
}

function setNoStoreHeaders(res: any): void {
	res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Expires', '0');
}

export function buildNsRtBridgeModule(rtVer: string, requireGuardSnippet: string): string {
	const code =
		`// [ns-rt][v2.3] NativeScript-Vue runtime bridge (module-scoped cache, no globals)\n` +
		`const __origin = ((typeof globalThis !== 'undefined' && globalThis && globalThis.__NS_HTTP_ORIGIN__) || (new URL(import.meta.url)).origin);\n` +
		`let __ns_core_bridge = null; try { import(__origin + "/ns/core/${rtVer}").then(m => { __ns_core_bridge = m; }).catch(() => {}); } catch {}\n` +
		`const g = globalThis;\n` +
		`const reg = (g.__nsVendorRegistry ||= new Map());\n` +
		`const req = reg && reg.get ? (g.__nsVendorRequire || g.__nsRequire || g.require) : (g.__nsRequire || g.require);\n` +
		`let __cached_rt = null;\n` +
		`let __cached_vm = null;\n` +
		`const __RT_REALM_TAG = (globalThis.__NS_RT_REALM__ ||= Math.random().toString(36).slice(2));\n` +
		`try { if (!(globalThis.__NS_RT_ONCE__ && globalThis.__NS_RT_ONCE__.eval)) { (globalThis.__NS_RT_ONCE__ ||= {}).eval = true; if (globalThis.__NS_ENV_VERBOSE__) console.log('[ns-rt] evaluated', { rtRealm: __RT_REALM_TAG }); } } catch {}\n` +
		`function __ensure(){\n` +
		`  if (__cached_rt) return __cached_rt;\n` +
		`  let vm = null;\n` +
		`  try { vm = reg && reg.has && reg.has('nativescript-vue') ? reg.get('nativescript-vue') : (typeof req==='function' ? req('nativescript-vue') : null); } catch {}\n` +
		`  if (!vm) { try { vm = reg && reg.has && reg.has('vue') ? reg.get('vue') : (typeof req==='function' ? req('vue') : null); } catch {} }\n` +
		`  const rt = (vm && (vm.default ?? vm)) || {};\n` +
		`  __cached_vm = vm;\n` +
		`  __cached_rt = rt;\n` +
		`  return rt;\n` +
		`}\n` +
		`try {\n` +
		`  const dev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;\n` +
		`  if (dev) {\n` +
		`    const ns = (__ns_core_bridge && (__ns_core_bridge.__esModule && __ns_core_bridge.default ? __ns_core_bridge.default : (__ns_core_bridge.default || __ns_core_bridge))) || __ns_core_bridge || {};\n` +
		`    if (ns) {\n` +
		`      if (!g.Frame && ns.Frame) g.Frame = ns.Frame;\n` +
		`      if (!g.Page && ns.Page) g.Page = ns.Page;\n` +
		`      if (!g.Application && (ns.Application||ns.app||ns.application)) g.Application = (ns.Application||ns.app||ns.application);\n` +
		`    }\n` +
		`  }\n` +
		`} catch {}\n` +
		`const __get = (k) => { const rt = __ensure(); const v = rt && rt[k]; if (typeof v !== 'function' && v === undefined) { throw new Error('[ns-rt] missing export '+k); } return v; };\n` +
		`export const __realm = __RT_REALM_TAG;\n` +
		`export const defineComponent = (...a) => (__get('defineComponent'))(...a);\n` +
		`export const resolveComponent = (...a) => (__ensure().resolveComponent)(...a);\n` +
		`export const createVNode = (...a) => (__ensure().createVNode)(...a);\n` +
		`export const createTextVNode = (...a) => (__ensure().createTextVNode)(...a);\n` +
		`export const createCommentVNode = (...a) => (__ensure().createCommentVNode)(...a);\n` +
		`export const Fragment = (__ensure().Fragment);\n` +
		`export const Teleport = (__ensure().Teleport);\n` +
		`export const Transition = (__ensure().Transition);\n` +
		`export const TransitionGroup = (__ensure().TransitionGroup);\n` +
		`export const KeepAlive = (__ensure().KeepAlive);\n` +
		`export const Suspense = (__ensure().Suspense);\n` +
		`export const withCtx = (...a) => (__ensure().withCtx)(...a);\n` +
		`export const openBlock = (...a) => (__ensure().openBlock)(...a);\n` +
		`export const createBlock = (...a) => (__ensure().createBlock)(...a);\n` +
		`export const createElementVNode = (...a) => (__ensure().createElementVNode)(...a);\n` +
		`export const createElementBlock = (...a) => (__ensure().createElementBlock)(...a);\n` +
		`export const renderSlot = (...a) => (__ensure().renderSlot)(...a);\n` +
		`export const mergeProps = (...a) => (__ensure().mergeProps)(...a);\n` +
		`export const toHandlers = (...a) => (__ensure().toHandlers)(...a);\n` +
		`export const renderList = (...a) => (__ensure().renderList)(...a);\n` +
		`export const normalizeProps = (...a) => (__ensure().normalizeProps)(...a);\n` +
		`export const guardReactiveProps = (...a) => (__ensure().guardReactiveProps)(...a);\n` +
		`export const normalizeClass = (...a) => (__ensure().normalizeClass)(...a);\n` +
		`export const normalizeStyle = (...a) => (__ensure().normalizeStyle)(...a);\n` +
		`export const toDisplayString = (...a) => (__ensure().toDisplayString)(...a);\n` +
		`export const withDirectives = (...a) => (__ensure().withDirectives)(...a);\n` +
		`export const resolveDirective = (...a) => (__ensure().resolveDirective)(...a);\n` +
		`export const withModifiers = (...a) => (__ensure().withModifiers)(...a);\n` +
		`export const withKeys = (...a) => (__ensure().withKeys)(...a);\n` +
		`export const resolveDynamicComponent = (...a) => (__ensure().resolveDynamicComponent)(...a);\n` +
		`export const isVNode = (...a) => (__ensure().isVNode)(...a);\n` +
		`export const cloneVNode = (...a) => (__ensure().cloneVNode)(...a);\n` +
		`export const isRef = (...a) => (__ensure().isRef)(...a);\n` +
		`export const ref = (...a) => (__ensure().ref)(...a);\n` +
		`export const shallowRef = (...a) => (__ensure().shallowRef)(...a);\n` +
		`export const unref = (...a) => (__ensure().unref)(...a);\n` +
		`export const computed = (...a) => (__ensure().computed)(...a);\n` +
		`export const reactive = (...a) => (__ensure().reactive)(...a);\n` +
		`export const readonly = (...a) => (__ensure().readonly)(...a);\n` +
		`export const isReactive = (...a) => (__ensure().isReactive)(...a);\n` +
		`export const isReadonly = (...a) => (__ensure().isReadonly)(...a);\n` +
		`export const toRaw = (...a) => (__ensure().toRaw)(...a);\n` +
		`export const markRaw = (...a) => (__ensure().markRaw)(...a);\n` +
		`export const shallowReactive = (...a) => (__ensure().shallowReactive)(...a);\n` +
		`export const shallowReadonly = (...a) => (__ensure().shallowReadonly)(...a);\n` +
		`export const watch = (...a) => (__ensure().watch)(...a);\n` +
		`export const watchEffect = (...a) => (__ensure().watchEffect)(...a);\n` +
		`export const watchPostEffect = (...a) => (__ensure().watchPostEffect)(...a);\n` +
		`export const watchSyncEffect = (...a) => (__ensure().watchSyncEffect)(...a);\n` +
		`export const onBeforeMount = (...a) => (__ensure().onBeforeMount)(...a);\n` +
		`export const onMounted = (...a) => (__ensure().onMounted)(...a);\n` +
		`export const onBeforeUpdate = (...a) => (__ensure().onBeforeUpdate)(...a);\n` +
		`export const onUpdated = (...a) => (__ensure().onUpdated)(...a);\n` +
		`export const onBeforeUnmount = (...a) => (__ensure().onBeforeUnmount)(...a);\n` +
		`export const onUnmounted = (...a) => (__ensure().onUnmounted)(...a);\n` +
		`export const onActivated = (...a) => (__ensure().onActivated)(...a);\n` +
		`export const onDeactivated = (...a) => (__ensure().onDeactivated)(...a);\n` +
		`export const onErrorCaptured = (...a) => (__ensure().onErrorCaptured)(...a);\n` +
		`export const onRenderTracked = (...a) => (__ensure().onRenderTracked)(...a);\n` +
		`export const onRenderTriggered = (...a) => (__ensure().onRenderTriggered)(...a);\n` +
		`export const nextTick = (...a) => (__ensure().nextTick)(...a);\n` +
		`export const h = (...a) => (__ensure().h)(...a);\n` +
		`export const provide = (...a) => (__ensure().provide)(...a);\n` +
		`export const inject = (...a) => (__ensure().inject)(...a);\n` +
		`export const vShow = (__ensure().vShow);\n` +
		`export const createApp = (...a) => (__ensure().createApp)(...a);\n` +
		`export const registerElement = (...a) => (__ensure().registerElement)(...a);\n` +
		`export const $navigateTo = (...a) => { const vm = (__cached_vm || (void __ensure(), __cached_vm)); const rt = __ensure(); try { if (!(g && g.Frame)) { const ns = (__ns_core_bridge && (__ns_core_bridge.__esModule && __ns_core_bridge.default ? __ns_core_bridge.default : (__ns_core_bridge.default || __ns_core_bridge))) || __ns_core_bridge || {}; if (ns) { if (!g.Frame && ns.Frame) g.Frame = ns.Frame; if (!g.Page && ns.Page) g.Page = ns.Page; if (!g.Application && (ns.Application||ns.app||ns.application)) g.Application = (ns.Application||ns.app||ns.application); } } } catch {} try { const hmrRealm = (g && g.__NS_HMR_REALM__) || 'unknown'; const hasTop = !!(g && g.Frame && g.Frame.topmost && g.Frame.topmost()); const top = hasTop ? g.Frame.topmost() : null; const ctor = top && top.constructor && top.constructor.name; } catch {} if (g && typeof g.__nsNavigateUsingApp === 'function') { try { return g.__nsNavigateUsingApp(...a); } catch (e) { try { console.error('[ns-rt] $navigateTo app navigator error', e); } catch {} throw e; } } try { console.error('[ns-rt] $navigateTo unavailable: app navigator missing'); } catch {} throw new Error('$navigateTo unavailable: app navigator missing'); } ;\n` +
		`export const $navigateBack = (...a) => { const vm = (__cached_vm || (void __ensure(), __cached_vm)); const rt = __ensure(); const impl = (vm && (vm.$navigateBack || (vm.default && vm.default.$navigateBack))) || (rt && (rt.$navigateBack || (rt.runtimeHelpers && rt.runtimeHelpers.navigateBack))); let res; try { const via = (impl && (impl === (vm && vm.$navigateBack) || impl === (vm && vm.default && vm.default.$navigateBack))) ? 'vm' : (impl ? 'rt' : 'none'); } catch {} try { if (typeof impl === 'function') res = impl(...a); } catch {} try { const top = (g && g.Frame && g.Frame.topmost && g.Frame.topmost()); if (!res && top && top.canGoBack && top.canGoBack()) { res = top.goBack(); } } catch {} try { const hook = g && (g.__NS_HMR_ON_NAVIGATE_BACK || g.__NS_HMR_ON_BACK || g.__nsAttemptBackRemount); if (typeof hook === 'function') hook(); } catch {} return res; }\n` +
		`export const $showModal = (...a) => { const vm = (__cached_vm || (void __ensure(), __cached_vm)); const rt = __ensure(); const impl = (vm && (vm.$showModal || (vm.default && vm.default.$showModal))) || (rt && (rt.$showModal || (rt.runtimeHelpers && rt.runtimeHelpers.showModal))); try { if (typeof impl === 'function') return impl(...a); } catch (e) { } return undefined; }\n` +
		`export default {\n` +
		`  defineComponent, resolveComponent, createVNode, createTextVNode, createCommentVNode,\n` +
		`  Fragment, Teleport, Transition, TransitionGroup, KeepAlive, Suspense, withCtx, openBlock,\n` +
		`  createBlock, createElementVNode, createElementBlock, renderSlot, mergeProps, toHandlers,\n` +
		`  renderList, normalizeProps, guardReactiveProps, normalizeClass, normalizeStyle, toDisplayString,\n` +
		`  withDirectives, resolveDirective, withModifiers, withKeys, resolveDynamicComponent,\n` +
		`  isVNode, cloneVNode, isRef, ref, shallowRef, unref, computed, reactive, readonly, isReactive, isReadonly, toRaw, markRaw, shallowReactive, shallowReadonly,\n` +
		`  watch, watchEffect, watchPostEffect, watchSyncEffect, onBeforeMount, onMounted, onBeforeUpdate, onUpdated,\n` +
		`  onBeforeUnmount, onUnmounted, onActivated, onDeactivated, onErrorCaptured, onRenderTracked, onRenderTriggered, nextTick, h, provide, inject, vShow, createApp, registerElement,\n` +
		`  $navigateTo, $navigateBack, $showModal\n` +
		`};\n`;

	return requireGuardSnippet + code;
}

async function loadEntryRuntimeContent(verbose: boolean): Promise<string> {
	let content = '';
	try {
		const requireFromHere = createRequire(import.meta.url);
		const entryRtPath = requireFromHere.resolve('@nativescript/vite/hmr/entry-runtime.js');
		content = readFileSync(entryRtPath, 'utf-8');
	} catch (error) {
		try {
			const tsPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'entry-runtime.ts');
			if (existsSync(tsPath)) {
				const tsSource = readFileSync(tsPath, 'utf-8');
				const result = babelCore.transformSync(tsSource, {
					filename: tsPath,
					plugins: [[pluginTransformTypescript, { isTSX: false, allowDeclareFields: true }]],
					sourceType: 'module',
				});
				if (result?.code) {
					content = result.code;
				}
			}
		} catch (transformError) {
			if (verbose) console.warn('[hmr-http] entry-runtime.ts transform failed', transformError);
		}
		if (!content) {
			content = 'export default async function start(){ console.error("[/ns/entry-rt] not found"); }\n';
		}
	}
	return content;
}

function resolveMainEntry(appRootDir: string, defaultMainEntry: string, defaultMainEntryVirtual: string): string {
	let mainEntry = '/';
	try {
		const pkg = getPackageJson();
		const main = pkg?.main || defaultMainEntry;
		const abs = getProjectFilePath(main).replace(/\\/g, '/');
		const marker = `/${appRootDir}/`;
		const index = abs.indexOf(marker);
		mainEntry = index >= 0 ? abs.substring(index) : defaultMainEntryVirtual;
	} catch {}
	return mainEntry;
}

export function buildNsEntryWrapper(params: { origin: string; mainEntry: string; ver: string; verbose: boolean; requireGuardSnippet: string }): string {
	const { origin, mainEntry, ver, verbose, requireGuardSnippet } = params;
	let code =
		requireGuardSnippet +
		`// [ns-entry][v${ver}] wrapper (script-safe) bytes will follow\n` +
		`(async function(){\n` +
		`  let origin = ${JSON.stringify(origin)}; const main = ${JSON.stringify(mainEntry)}; const __ns_graph_ver = ${JSON.stringify(ver)};\n` +
		`  try { const __b = (globalThis && globalThis.__NS_ENTRY_BASE__) ? String(globalThis.__NS_ENTRY_BASE__) : ''; if (__b) { try { const __o = new URL(__b).origin; if (__o) origin = __o; } catch {} } } catch {}\n` +
		`  const __VERBOSE__ = (typeof __NS_ENV_VERBOSE__ !== 'undefined' && __NS_ENV_VERBOSE__) || (globalThis && globalThis.process && globalThis.process.env && globalThis.process.env.verbose) || (globalThis && globalThis.__NS_ENV_VERBOSE__) || ${JSON.stringify(!!verbose)};\n` +
		`  if (__VERBOSE__) console.info('[ns-entry][wrapper] start', { origin, main, ver: __ns_graph_ver });\n` +
		`  async function __ns_import_entry_rt(u){\n` +
		`    try { const r = await fetch(u); const t = await r.text(); if (__VERBOSE__) console.info('[ns-entry][wrapper] entry-rt fetched bytes', (t&&t.length)||0);\n` +
		`      let s = t.replace(/export\\s+default\\s+async\\s+function\\s+([A-Za-z0-9_$]+)?/,'globalThis.__NS_START_ENTRY__=async function $1')\n` +
		`               .replace(/export\\s+default\\s+function\\s+([A-Za-z0-9_$]+)?/,'globalThis.__NS_START_ENTRY__=function $1');\n` +
		`      if (String(s).indexOf('__NS_START_ENTRY__') === -1) { s = 'globalThis.__NS_START_ENTRY__=' + s.replace(/export\\s+default\\s*/,''); }\n` +
		`      try { (0,eval)(s); } catch (ee) { console.error('[ns-entry][wrapper] eval entry-rt failed', ee && (ee.message||ee)); throw ee; }\n` +
		`      const fn = globalThis.__NS_START_ENTRY__; if (!fn) { throw new Error('entry-rt missing __NS_START_ENTRY__'); }\n` +
		`      return { default: fn };\n` +
		`    } catch(e) { console.error('[ns-entry][wrapper] entry-rt fetch/eval failed', e && (e.message||e)); throw e; }\n` +
		`  }\n` +
		`  const __entryRtUrl = '/ns/entry-rt?v=' + String(__ns_graph_ver);\n` +
		`  let __mod; try { __mod = await __ns_import_entry_rt(__entryRtUrl); if (__VERBOSE__) console.info('[ns-entry][wrapper] entry-rt ready'); } catch (e) { console.error('[ns-entry][wrapper] failed to prepare entry-rt', e && (e.message||e)); throw e; }\n` +
		`  const startEntry = (__mod && (__mod.default || __mod));\n` +
		`  try { await startEntry({ origin, main, ver: __ns_graph_ver, verbose: !!__VERBOSE__ }); if (__VERBOSE__) console.info('[ns-entry][wrapper] startEntry() resolved'); } catch (e) { console.error('[ns-entry][wrapper] startEntry() failed', e && (e.message||e)); throw e; }\n` +
		`})();\n`;
	code += `\n//# sourceURL=${origin}/ns/entry`;
	return code;
}

export function registerRuntimeCompatHandlers(server: ViteDevServer, options: RegisterRuntimeCompatHandlersOptions): void {
	const { verbose, requireGuardSnippet, appRootDir, defaultMainEntry, defaultMainEntryVirtual, getGraphVersion, getServerOrigin } = options;

	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			if (!(urlObj.pathname === '/ns/rt' || /^\/ns\/rt\/[\d]+$/.test(urlObj.pathname))) return next();
			setJavascriptResponseHeaders(res);
			const rtVerSeg = urlObj.pathname.replace(/^\/ns\/rt\/?/, '');
			const rtVer = /^[0-9]+$/.test(rtVerSeg) ? rtVerSeg : String(getGraphVersion() || 0);
			res.statusCode = 200;
			res.end(buildNsRtBridgeModule(rtVer, requireGuardSnippet));
		} catch {
			res.statusCode = 500;
			res.end('export {}\n');
		}
	});

	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			if (urlObj.pathname !== '/ns/entry-rt') return next();
			try {
				if (verbose) {
					const remoteAddress = (req.socket as any)?.remoteAddress;
					const remotePort = (req.socket as any)?.remotePort;
					console.log('[hmr-http] GET /ns/entry-rt from', remoteAddress + (remotePort ? ':' + remotePort : ''));
				}
			} catch {}
			setJavascriptResponseHeaders(res);
			const content = await loadEntryRuntimeContent(verbose);
			if (verbose) console.log('[hmr-http] /ns/entry-rt serving', content.length, 'bytes');
			res.statusCode = 200;
			res.end(content);
		} catch (error) {
			console.warn('[hmr-http] /ns/entry-rt error', error);
			next();
		}
	});

	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			if (!(urlObj.pathname === '/ns/entry' || /^\/ns\/entry\/[\d]+$/.test(urlObj.pathname))) return next();
			try {
				if (verbose) {
					const remoteAddress = (req.socket as any)?.remoteAddress;
					const remotePort = (req.socket as any)?.remotePort;
					console.log('[hmr-http] GET /ns/entry from', remoteAddress + (remotePort ? ':' + remotePort : ''));
				}
			} catch {}
			const verSeg = urlObj.pathname.replace(/^\/ns\/entry\/?/, '');
			setNoStoreHeaders(res);
			const ver = /^[0-9]+$/.test(verSeg) ? verSeg : String(getGraphVersion() || 0);
			const origin = getServerOrigin(server) || `${urlObj.protocol}//${urlObj.host}`;
			const mainEntry = resolveMainEntry(appRootDir, defaultMainEntry, defaultMainEntryVirtual);
			res.statusCode = 200;
			res.end(
				buildNsEntryWrapper({
					origin,
					mainEntry,
					ver,
					verbose,
					requireGuardSnippet,
				}),
			);
		} catch {
			next();
		}
	});
}
