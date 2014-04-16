// TODO: Implement "hidden" notation so that such declarations are not included in the d.ts file we will provide for the users.
//@hidden

export declare class FileSystemAccess {
    getLastModified(path: string): Date;

    getParent(path: string, onError?: (error: any) => any): { path: string; name: string };
    getFile(path: string, onError?: (error: any) => any): { path: string; name: string; extension: string };
    getFolder(path: string, onError?: (error: any) => any): { path: string; name: string };
    enumFiles(path: string, onSuccess: (files: Array<{ path: string; name: string; extension: string }>) => any, onError?: (error: any) => any);
    fileExists(path: string): boolean;
    folderExists(path: string): boolean;
    concatPath(left: string, right: string): string;
    deleteFile(path: string, onSuccess?: () => any, onError?: (error: any) => any);
    deleteFolder(path: string, isKnown: boolean, onSuccess?: () => any, onError?: (error: any) => any);
    emptyFolder(path: string, onSuccess?: () => any, onError?: (error: any) => any): void;
    rename(path: string, newPath: string, onSuccess?: () => any, onError?: (error: any) => any): void;
    getDocumentsFolderPath(): string;
    getTempFolderPath(): string;
    readText(path: string, onSuccess: (content: string) => any, onError?: (error: any) => any);
    writeText(path: string, content: string, onSuccess?: () => any, onError?: (error: any) => any);
    getFileExtension(path: string): string;
}
 