import type { ViteDevServer } from 'vite';

import type { RegisterSfcHandlersOptions } from './sfc-route-shared.js';
import { registerSfcServeRoute } from './sfc-route-serve.js';
import { registerSfcMetaRoute } from './sfc-route-meta.js';
import { registerSfcAsmRoute } from './sfc-route-assemble.js';

export type { RegisterSfcHandlersOptions };

/**
 * Registers the three Vue SFC endpoints on the dev server:
 *   - `GET /ns/sfc`      — serves SFC modules (full delegates to the assembler; variants processed)
 *   - `GET /ns/sfc-meta` — JSON metadata (script exports, render presence) for an SFC
 *   - `GET /ns/asm`      — deterministic, self-contained SFC assembler module
 *
 * The implementation of each endpoint lives in its own focused module
 * (`sfc-route-{serve,meta,assemble}.ts`); this barrel preserves the public surface
 * (`registerSfcHandlers` + `RegisterSfcHandlersOptions`) and the middleware
 * registration order (/ns/sfc, /ns/sfc-meta, /ns/asm).
 */
export function registerSfcHandlers(server: ViteDevServer, options: RegisterSfcHandlersOptions): void {
	registerSfcServeRoute(server, options);
	registerSfcMetaRoute(server, options);
	registerSfcAsmRoute(server, options);
}
