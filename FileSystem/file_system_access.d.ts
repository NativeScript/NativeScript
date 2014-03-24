// TODO: Implement "hidden" notation so that such declarations are not included in the d.ts file we will provide for the users.
//@hidden
export declare class FileSystemAccess {
    getReadonly(path: string): boolean;
    getLastModified(path: string): Date;

    getParent(path: string, onSuccess: (path: string) => any, onError?: (error: any) => any);
    getFile(path: string, onSuccess: (path: string) => any, onError?: (error: any) => any);
    getFolder(path: string, onSuccess: (path: string) => any, onError?: (error: any) => any);
    enumFiles(path: string, onSuccess: (files: Array<string>) => any, onError?: (error: any) => any);
    fileExists(path: string): boolean;
    folderExists(path: string): boolean;
    concatPath(left: string, right: string): string;
    deleteFile(path: string, onSuccess?: () => any, onError?: (error: any) => any);
    deleteFolder(path: string, isKnown: boolean, onSuccess?: () => any, onError?: (error: any) => any);
    emptyFolder(path: string, onSuccess?: () => any, onError?: (error: any) => any): void;
    rename(path: string, onSuccess?: () => any, onError?: (error: any) => any): void;
    getDocumentsFolderPath(): string;
    getTempFolderPath(): string;
    readText(path: string, onSuccess: (content: string) => any, onError?: (error: any) => any);
    writeText(path: string, content: string, onSuccess?: () => any, onError?: (error: any) => any);
}