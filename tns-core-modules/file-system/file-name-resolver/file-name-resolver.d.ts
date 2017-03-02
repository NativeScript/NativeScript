/**
 * Provides FileNameResolver class used for loading files based on device capabilities.
 */
export interface PlatformContext {
    width: number;
    height: number;
    os: string;
    deviceType: string;
}

export class FileNameResolver {
    constructor(context: PlatformContext);
    resolveFileName(path: string, ext: string): string;
    clearCache(): void;
}

export function resolveFileName(path: string, ext: string): string;
export function clearCache(): void;
export function _findFileMatch(path: string, ext: string, candidates: Array<string>, context: PlatformContext): string;
