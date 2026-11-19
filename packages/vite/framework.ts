/**
 * `@nativescript/vite/framework` — the surface a framework package uses to
 * register its own NativeScript flavor (dev-server side, Node). HMR for the
 * flavor comes from the framework's own Vite plugin; the flavor only supplies
 * device loader configuration and vendor policy.
 */
export { registerFrameworkFlavor, getFrameworkFlavor, isBuiltInFlavor } from './hmr/framework-flavors.js';
export type { FrameworkFlavorDefinition } from './hmr/framework-flavors.js';
export type { FrameworkServerStrategy } from './hmr/server/framework-strategy.js';

export { baseConfig } from './configuration/base.js';
export { getTypeCheckPlugins } from './helpers/typescript-check.js';
export type { TypeCheckControlOptions, TypeCheckSetting, TypeCheckFlavor } from './helpers/typescript-check.js';
