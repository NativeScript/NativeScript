/**
 * Helps sanitize a module name if it is prefixed with '~/', '~' or '/'
 * @param moduleName the name
 * @param removeExtension whether to remove extension
 */
export function sanitizeModuleName(moduleName: string, removeExtension?: boolean): string;
