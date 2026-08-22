/**
 * `@nativescript/vite/hmr/client/framework.js` — the device-side surface a
 * framework's client strategy is written against.
 *
 * A registered flavor's client module is served to the device through
 * `/ns/m` and evaluates in the same realm as the shared HMR client. It must
 * reach the client's singletons — the module graph mirror, the hot registry,
 * the overlay — through this one module, so that both resolve to the same
 * canonical URLs and therefore the same instances. Importing the client's
 * internal files by path is not supported.
 */
export type { FrameworkClientStrategy, FrameworkClientBatchContext, FrameworkClientMessageContext, FrameworkClientMountContext, ClientGraphModule } from './framework-client-strategy.js';
export type { NsHotRegistry, NsHotContext } from './hot-context.js';

/** The process-wide `import.meta.hot` registry: accept/dispose callbacks, dependency acceptors, `hot.data`, events, full reload. */
export { getNsHotRegistry } from './hot-context.js';

/** Live mirror of the server's module graph (id → { deps, hash }). */
export { graph, getGraphVersion } from './utils.js';
/** Canonical-URL helpers and the evict + re-import primitives the shared queue uses. */
export { normalizeSpec, requestModuleFromServer, invalidateModulesByUrls, buildEvictionUrls, resolveHmrHttpOrigin, safeDynImport } from './utils.js';
/** `@nativescript/core` export lookup that resolves against the live core realm. */
export { getCore } from './utils.js';
export { ENV_VERBOSE } from './utils.js';

/** Drive the on-device "HMR update" overlay: 'received' | 'evicting' | 'reimporting' | 'rebooting' | 'complete'. */
export { setUpdateStage, getOverlayApi } from './overlay-driver.js';
export type { HmrUpdateOverlayStage } from './overlay-driver.js';

/** Swap the live root view for a freshly loaded component (the reset path). */
export { performResetRoot } from './root-reset.js';

export { getGlobalScope } from '../shared/runtime/global-scope.js';
/** The `ns:module` builtin as the runtime exposes it (`invalidateModules`, `getLoadedModuleUrls`, …); `{}` off-device. */
export { readNsRuntimeDevHostApi } from '../shared/runtime/browser-runtime-contract.js';
export type { NsRuntimeDevHostApi } from '../shared/runtime/browser-runtime-contract.js';
