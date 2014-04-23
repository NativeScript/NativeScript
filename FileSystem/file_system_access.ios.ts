import app_module = require("Application/application");
import utilsModule = require("Utils/utils_ios");

// TODO: Implement all the APIs receiving callback using async blocks
// TODO: Check whether we need try/catch blocks for the iOS implementation

export class FileSystemAccess {
    private keyFileType = "NSFileType";
    private keyModificationTime = "NSFileModificationDate";
    private keyReadonly = "NSFileImmutable";
    private documentDir = 9;
    private cachesDir = 13;
    private userDomain = 1;
    private NSUTF8StringEncoding = 4;

    public getLastModified(path: string): Date {
        var fileManager = Foundation.NSFileManager.defaultManager();
        var attributes = fileManager.attributesOfItemAtPathError(path, null);

        if (attributes) {
            var date = attributes.objectForKey(this.keyModificationTime);
            var interval = date.timeIntervalSince1970();

            // time interval is in seconds, Date constructor expects milliseconds, hence this multiply by 1000
            return new Date(interval * 1000);
        } else {
            return new Date();
        }
    }

    public getParent(path: string, onError?: (error: any) => any): { path: string; name: string } {
        try {
            var fileManager = Foundation.NSFileManager.defaultManager();
            var nsString = Foundation.NSString.initWithString(path);

            var parentPath = nsString.stringByDeletingLastPathComponent();
            var name = fileManager.displayNameAtPath(parentPath);

            return {
                path: parentPath.toString(),
                name: name
            };
        }
        catch (exception) {
            if (onError) {
                onError(exception);
            }

            return undefined;
        }
    }

    public getFile(path: string, onError?: (error: any) => any): { path: string; name: string; extension: string } {
        try {
            var fileManager = Foundation.NSFileManager.defaultManager();
            var exists = fileManager.fileExistsAtPath(path);

            if (!exists) {
                if (!fileManager.createFileAtPathContentsAttributes(path, null, null)) {
                    if (onError) {
                        onError(new Error("Failed to create folder at path '" + path + "'"));
                    }

                    return undefined;
                }
            }

            var fileName = fileManager.displayNameAtPath(path);
            
            return {
                path: path,
                name: fileName,
                extension: this.getFileExtension(path)
            };
        }
        catch (exception) {
            if (onError) {
                onError(exception);
            }

            return undefined;
        }
    }

    public getFolder(path: string, onError?: (error: any) => any): { path: string; name: string } {
        try {
            var fileManager = Foundation.NSFileManager.defaultManager();
            var exists = this.folderExists(path);

            if (!exists) {
                if (!fileManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(path, true, null, null)) {
                    // error
                    if (onError) {
                        onError(new Error("Failed to create folder at path '" + path + "'"));
                    }

                    return undefined;
                }
            }

            var dirName = fileManager.displayNameAtPath(path);
            
            return {
                path: path,
                name: dirName
            };
        }
        catch (ex) {
            if (onError) {
                onError(new Error("Failed to create folder at path '" + path + "'"));
            }

            return undefined;
        }
    }

    public enumFiles(path: string, onSuccess: (files: Array<{ path: string; name: string; extension: string }>) => any, onError?: (error: any) => any) {
        try {
            var fileManager = Foundation.NSFileManager.defaultManager();
            var files = fileManager.contentsOfDirectoryAtPathError(path, null);

            if (!files) {
                if (onError) {
                    onError(new Error("Failed to enum files for forlder '" + path + "'"));
                }

                return;
            }

            var fileInfos = new Array<{ path: string; name: string; extension: string }>();
            var file,
                i,
                info;


            for (i = 0; i < files.count(); i++) {
                file = files.objectAtIndex(i);

                info = {
                    path: this.concatPath(path, file),
                    name: file
                };

                if (!this.folderExists(file)) {
                    info.extension = this.getFileExtension(info.path);
                }

                fileInfos.push(info);
            }

            if (onSuccess) {
                onSuccess(fileInfos);
            }
        }
        catch (ex) {
            if (onError) {
                onError(ex);
            }
        }
    }

    public fileExists(path: string): boolean {
        var fileManager = Foundation.NSFileManager.defaultManager();
        return fileManager.fileExistsAtPath(path);
    }

    public folderExists(path: string): boolean {
        var fileManager = Foundation.NSFileManager.defaultManager();

        var buffer = NativePointer.create(PrimitiveType.BOOL, 1);
        var exists = fileManager.fileExistsAtPathIsDirectory(path, buffer);

        var isDir = buffer[0] && buffer[0] > 0;

        buffer.delete();

        return exists && isDir;
    }

    public concatPath(left: string, right: string): string {
        // TODO: This probably is not efficient, we may try concatenation with the "/" character
        var nsArray = utilsModule.Collections.jsArrayToNSArray([left, right]);
        var nsString = Foundation.NSString.pathWithComponents(nsArray);

        return nsString.toString();
    }

    public deleteFile(path: string, onSuccess?: () => any, onError?: (error: any) => any) {
        this.deleteEntity(path, onSuccess, onError);
    }

    public deleteFolder(path: string, isKnown?: boolean, onSuccess?: () => any, onError?: (error: any) => any) {
        this.deleteEntity(path, onSuccess, onError);
    }

    public emptyFolder(path: string, onSuccess?: () => any, onError?: (error: any) => any) {
        var fileManager = Foundation.NSFileManager.defaultManager();

        var filesEnum = function (files: Array<{ path: string; name: string; extension: string }>) {
            var i;
            for (i = 0; i < files.length; i++) {
                if (!fileManager.removeItemAtPathError(files[i].path, null)) {
                    if (onError) {
                        onError(new Error("Failed to empty folder '" + path + "'"));
                    }

                    return;
                }
            }

            if (onSuccess) {
                onSuccess();
            }
        }

        this.enumFiles(path, filesEnum, onError);
    }

    public rename(path: string, newPath: string, onSuccess?: () => any, onError?: (error: any) => any) {
        var fileManager = Foundation.NSFileManager.defaultManager();
        if (!fileManager.moveItemAtPathToPathError(path, newPath, null)) {
            if (onError) {
                onError(new Error("Failed to rename '" + path + "' to '" + newPath + "'"));
            }
        } else if (onSuccess) {
            onSuccess();
        }
    }

    public getDocumentsFolderPath(): string {
        return this.getKnownPath(this.documentDir);
    }

    public getTempFolderPath(): string {
        return this.getKnownPath(this.cachesDir);
    }

    public readText(path: string, onSuccess: (content: string) => any, onError?: (error: any) => any) {
        var nsString = Foundation.NSString.stringWithContentsOfFileEncodingError(path, this.NSUTF8StringEncoding, null);
        if (!nsString) {
            if (onError) {
                onError(new Error("Failed to read file at path '" + path + "'"));
            }
        } else if (onSuccess) {
            onSuccess(nsString.toString());
        }
    }

    public writeText(path: string, content: string, onSuccess?: () => any, onError?: (error: any) => any) {
        var nsString = Foundation.NSString.initWithString(content);

        // TODO: verify the useAuxiliaryFile parameter should be false
        if (!nsString.writeToFileAtomicallyEncodingError(path, false, this.NSUTF8StringEncoding, null)) {
            if (onError) {
                onError(new Error("Failed to write to file '" + path + "'"));
            }
        } else if (onSuccess) {
            onSuccess();
        }
    }

    private getKnownPath(folderType: number): string {
        var fileManager = Foundation.NSFileManager.defaultManager();
        var paths = fileManager.URLsForDirectoryInDomains(folderType, this.userDomain);

        var url = paths.objectAtIndex(0);
        return url.path();
    }

    private getFileExtension(path: string): string {
        var url = Foundation.NSURL.fileURLWithPathIsDirectory(path, false);
        return url.pathExtension();
    }

    private deleteEntity(path: string, onSuccess?: () => any, onError?: (error: any) => any) {
        var fileManager = Foundation.NSFileManager.defaultManager();
        if (!fileManager.removeItemAtPathError(path, null)) {
            if (onError) {
                onError(new Error("Failed to delete file at path '" + path + "'"));
            }
        } else {
            if (onSuccess) {
                onSuccess();
            }
        }
    }
}