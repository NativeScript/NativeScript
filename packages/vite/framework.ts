/**
 * `@nativescript/vite/framework` — the surface a framework package uses to
 * ship its own NativeScript HMR flavor (dev-server side, Node).
 *
 * A flavor is a name, a server strategy, and a client strategy module. The
 * server strategy runs in the Vite process; the client strategy is fetched by
 * the device next to the shared HMR client and is authored against
 * `@nativescript/vite/hmr/client/framework.js`.
 */
export { registerFrameworkFlavor, getFrameworkFlavor, getClientStrategyDevicePath, isBuiltInFlavor } from './hmr/framework-flavors.js';
export type { FrameworkFlavorDefinition } from './hmr/framework-flavors.js';

export type { FrameworkServerStrategy, FrameworkProcessFileContext, FrameworkRegistryContext, FrameworkServedModuleContext, FrameworkModuleRequestContext, FrameworkRouteContext } from './hmr/server/framework-strategy.js';
export type { FrameworkClientStrategy, FrameworkClientBatchContext, FrameworkClientMessageContext, FrameworkClientMountContext, ClientGraphModule } from './hmr/client/framework-client-strategy.js';

/** The generic device-module pipeline; the usual base for a new server strategy. */
export { typescriptServerStrategy } from './hmr/frameworks/typescript/server/strategy.js';
/** Shared hot-update prologue every server strategy's `handleHotUpdate` starts with. */
export { runHotUpdatePrologue } from './hmr/server/websocket-hot-update.js';
export type { NsHotUpdateContext, HotUpdatePrologueState, HmrUpdateMetrics } from './hmr/server/websocket-hot-update.js';
export { purgeTransformCachesForHotUpdate } from './hmr/server/transform-cache-invalidation.js';

export { baseConfig } from './configuration/base.js';
export { getTypeCheckPlugins } from './helpers/typescript-check.js';
export type { TypeCheckControlOptions, TypeCheckSetting, TypeCheckFlavor } from './helpers/typescript-check.js';
