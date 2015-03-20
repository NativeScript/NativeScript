/**
 * Provides FileNameResolver class used for loading files based on device capabilities.
 */
declare module "file-system/file-name-resolver" {
    export interface PlatformContext {
        width: number;
        height: number;
        os: string;
        deviceType: string;
    }

    export class FileNameResolver {
        constructor(context: PlatformContext);
        resolveFileName(path: string, ext: string): string;
    }

    //@private
    export function findFileMatch(path: string, ext: string, candidates: Array<string>, context: PlatformContext): string
    //@endprivate
}