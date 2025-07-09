/**
 * Provides ModuleNameResolver class used for loading files based on device capabilities.
 */ /** */

import type { PlatformContext } from './qualifier-matcher';
import type { ModuleListProvider } from './helpers';
export { PlatformContext } from './qualifier-matcher';

export class ModuleNameResolver {
	constructor(context: PlatformContext, moduleListProvider?: ModuleListProvider);
	resolveModuleName(path: string, ext: string): string;
	clearCache(): void;
}

export function resolveModuleName(path: string, ext: string): string;
