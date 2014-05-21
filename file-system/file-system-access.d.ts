//@private
export declare class FileSystemAccess {
    getLastModified(path: string): Date;

    getParent(path: string, onError?: (error: any) => any): { path: string; name: string };
    getFile(path: string, onError?: (error: any) => any): { path: string; name: string; extension: string };
    getFolder(path: string, onError?: (error: any) => any): { path: string; name: string };

    getEntities(path: string, onSuccess: (files: Array<{ path: string; name: string; extension: string }>) => any, onError?: (error: any) => any);
    eachEntity(path: string, onSuccess: (entity: { path: string; name: string; extension: string }) => boolean, onError?: (error: any) => any);

    fileExists(path: string): boolean;
    folderExists(path: string): boolean;
    
    deleteFile(path: string, onSuccess?: () => any, onError?: (error: any) => any);
    deleteFolder(path: string, isKnown: boolean, onSuccess?: () => any, onError?: (error: any) => any);
    emptyFolder(path: string, onSuccess?: () => any, onError?: (error: any) => any): void;
    rename(path: string, newPath: string, onSuccess?: () => any, onError?: (error: any) => any): void;
    getDocumentsFolderPath(): string;
    getTempFolderPath(): string;

    readText(path: string, onSuccess: (content: string) => any, onError?: (error: any) => any, encoding?: string);
    writeText(path: string, content: string, onSuccess?: () => any, onError?: (error: any) => any, encoding?: string);

    getFileExtension(path: string): string;

    // path methods
    getPathSeparator(): string;
    normalizePath(path: string): string;
    joinPath(left: string, right: string): string;
    joinPaths(paths: string[]): string;
}
 