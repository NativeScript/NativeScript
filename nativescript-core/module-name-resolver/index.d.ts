/**
 * Provides ModuleNameResolver class used for loading files based on device capabilities.
 */ /** */

import { PlatformContext } from './qualifier-matcher';

export { PlatformContext } from './qualifier-matcher';

export type ModuleListProvider = () => string[];

export class ModuleNameResolver {
	constructor(context: PlatformContext, moduleListProvider?: ModuleListProvider);
	resolveModuleName(path: string, ext: string): string;
	clearCache(): void;
}

export function resolveModuleName(path: string, ext: string): string;
export function clearCache(): void;

/**
 * Used to set a global singular instance of ModuleNameResolver
 * @param resolver instance
 */
export function _setResolver(resolver: ModuleNameResolver);
