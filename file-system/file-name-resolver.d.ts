/**
 * Provides FileNameResolver class used for loading files based on device capabilities.
 */
declare module "file-system/file-name-resolver" {
    interface PlatformContext {
        width: number;
        height: number;
        os: string;
        deviceType: string;
    }

    class FileNameResolver {
        constructor(context: PlatformContext);
        resolveFileName(path: string, ext: string): string;
    }
}