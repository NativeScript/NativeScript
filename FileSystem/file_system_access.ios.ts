import app_module = require("Application/application");

export class FileSystemAccess {
    private keyFileType = "NSFileType";
    private keyModificationTime = "NSFileModificationDate";
    private keyReadonly = "NSFileImmutable";

    public getReadonly(path: string): boolean {
        // TODO: Not implemented
        return false;
    }

    public getLastModified(path: string): Date {
        // TODO: Not implemented
        return undefined;
    }

    public getParent(path: string, onSuccess: (path: string) => any, onError?: (error: any) => any) {
        // TODO: Not implemented
    }

    public getFile(path: string, onSuccess: (path: string) => any, onError?: (error: any) => any) {
        // TODO: Not implemented
    }

    public getFolder(path: string, onSuccess: (path: string) => any, onError?: (error: any) => any) {
        // TODO: Not implemented
    }

    public enumFiles(path: string, onSuccess: (files: Array<string>) => any, onError?: (error: any) => any) {
        // TODO: Not implemented
    }

    public fileExists(path: string): boolean {
        // TODO: Not implemented
        return false;
    }

    public folderExists(path: string): boolean {
        // TODO: Not implemented
        return false;
    }

    public concatPath(left: string, right: string): string {
        // TODO: Not implemented
        return undefined;
    }

    public deleteFile(path: string, onSuccess?: () => any, onError?: (error: any) => any) {
        // TODO: Not implemented
    }

    public deleteFolder(path: string, isKnown?: boolean, onSuccess?: () => any, onError?: (error: any) => any) {
        // TODO: Not implemented
    }

    public emptyFolder(path: string, onSuccess?: () => any, onError?: (error: any) => any) {
        // TODO: Not implemented
    }

    public rename(path: string, onSuccess?: () => any, onError?: (error: any) => any) {
        // TODO: No implementation
    }

    public getDocumentsFolderPath(): string {
        // TODO: Not implemented
        return undefined;
    }

    public getTempFolderPath(): string {
        // TODO: Not implemented
        return undefined;
    }

    public readText(path: string, onSuccess: (content: string) => any, onError?: (error: any) => any) {
        // TODO: Not implemented
    }

    public writeText(path: string, content: string, onSuccess?: () => any, onError?: (error: any) => any) {
        // TODO: Not implemented
    }

    //private getKnownPath(folderType: number): string {
    //    var fileManager = Foundation.NSFileManager.defaultManager();


    //    return folder;
    //}
}