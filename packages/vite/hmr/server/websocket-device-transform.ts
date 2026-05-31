// Public entry point for the device code-transform subsystem (the HMR plugin's
// hot path). The implementation lives in three focused modules; consumers and
// spec suites import the subsystem's surface from here.
export { processCodeForDevice, cleanCode, collectImportDependencies, processSfcCode } from './process-code-for-device.js';
export { rewriteImports, prepareAngularEntryForDevice } from './rewrite-imports.js';
export { shouldRemapImport } from './device-transform-helpers.js';
