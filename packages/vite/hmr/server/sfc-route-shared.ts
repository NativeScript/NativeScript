import { createRequire } from 'node:module';

import traverse from '@babel/traverse';

import { vueSfcCompiler } from '../frameworks/vue/server/compiler.js';
import type { FrameworkServerStrategy } from './framework-strategy.js';

/**
 * Plugin-closure dependencies the SFC route handlers need. The pure transform
 * functions (`cleanCode`, `processCodeForDevice`, `rewriteImports`) and the
 * device-origin resolver (`getServerOrigin`) are imported directly (from
 * `websocket-device-transform.ts` / `server-origin.ts`); only genuine plugin
 * state is injected here.
 */
export interface RegisterSfcHandlersOptions {
	verbose: boolean;
	appVirtualWithSlash: string;
	sfcFileMap: Map<string, string>;
	depFileMap: Map<string, string>;
	getGraphVersion(): number;
	getStrategy(): FrameworkServerStrategy;
}

// Babel/Vue-compiler singletons shared by the SFC route modules (serve + assemble).
// Extracted verbatim from the former websocket-sfc.ts module scope so the routes
// resolve the exact same instances they did when they lived in one file.
export const babelTraverse: any = (traverse as any)?.default || (traverse as any);
export const { parse, compileTemplate, compileScript } = vueSfcCompiler;

export const pluginTransformTypescript: any = (() => {
	const requireFromHere = createRequire(import.meta.url);
	const loaded = requireFromHere('@babel/plugin-transform-typescript');
	return loaded?.default || loaded;
})();
