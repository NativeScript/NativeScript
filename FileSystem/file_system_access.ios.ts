import app_module = require("Application/application");
import utilsModule = require("Utils/utils_ios");
import textModule = require("text/text");

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

    public eachEntity(path: string, onEntity: (file: { path: string; name: string; extension: string }) => any, onError?: (error: any) => any) {
        if (!onEntity) {
            return;
        }

        this.enumEntities(path, onEntity, onError);
    }

    public getEntities(path: string, onSuccess: (files: Array<{ path: string; name: string; extension: string }>) => any, onError?: (error: any) => any) {
        if (!onSuccess) {
            return;
        }

        var fileInfos = new Array<{ path: string; name: string; extension: string }>();
        var onEntity = function (entity: { path: string; name: string; extension: string }): boolean {
            fileInfos.push(entity);
            return true;
        }

        var errorOccurred;
        var localError = function (error: any) {
            if (onError) {
                onError(error);
            }

            errorOccurred = true;
        }

        this.enumEntities(path, onEntity, onError);

        if (!errorOccurred) {
            onSuccess(fileInfos);
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

        this.getEntities(path, filesEnum, onError);
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

    public readText(path: string, onSuccess: (content: string) => any, onError?: (error: any) => any, encoding?: string) {
        var actualEncoding = encoding;
        if (!actualEncoding) {
            actualEncoding = textModule.encoding.UTF_8;
        }

        var nsString = Foundation.NSString.stringWithContentsOfFileEncodingError(path, actualEncoding, null);
        if (!nsString) {
            if (onError) {
                onError(new Error("Failed to read file at path '" + path + "'"));
            }
        } else if (onSuccess) {
            onSuccess(nsString.toString());
        }
    }

    public writeText(path: string, content: string, onSuccess?: () => any, onError?: (error: any) => any, encoding?: string) {
        var nsString = Foundation.NSString.initWithString(content);

        var actualEncoding = encoding;
        if (!actualEncoding) {
            actualEncoding = textModule.encoding.UTF_8;
        }

        // TODO: verify the useAuxiliaryFile parameter should be false
        if (!nsString.writeToFileAtomicallyEncodingError(path, false, actualEncoding, null)) {
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

    // TODO: This method is the same as in the iOS implementation. 
    // Make it in a separate file / module so it can be reused from both implementations.
    private getFileExtension(path: string): string {
        // TODO [For Panata]: The definitions currently specify "any" as a return value of this method
        //var nsString = Foundation.NSString.stringWithString(path);
        //var extension = nsString.pathExtension();

        //if (extension && extension.length > 0) {
        //    extension = extension.concat(".", extension);
        //}

        //return extension;
        var dotIndex = path.lastIndexOf(".");
        if (dotIndex && dotIndex >= 0 && dotIndex < path.length) {
            return path.substring(dotIndex);
        }

        return "";
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

    private enumEntities(path: string, callback: (entity: { path: string; name: string; extension: string }) => boolean, onError?: (error) => any) {
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
                info,
                retVal;


            for (i = 0; i < files.count(); i++) {
                file = files.objectAtIndex(i);

                info = {
                    path: this.concatPath(path, file),
                    name: file
                };

                if (!this.folderExists(file)) {
                    info.extension = this.getFileExtension(info.path);
                }

                retVal = callback(info);
                if (retVal === false) {
                    // the callback returned false meaning we should stop the iteration
                    break;
                }
            }
        }
        catch (ex) {
            if (onError) {
                onError(ex);
            }
        }
    }

    public getPathSeparator(): string {
        return "/";
    }

    public normalizePath(path: string): string {
        var nsString: Foundation.NSString = Foundation.NSString.stringWithString(path);
        var normalized = nsString.stringByStandardizingPath();

        return normalized;
    }

    public joinPath(left: string, right: string): string {
        var nsString: Foundation.NSString = Foundation.NSString.stringWithString(left);
        return nsString.stringByAppendingPathComponent(right);
    }

    public joinPaths(paths: string[]): string {
        if (!paths || paths.length === 0) {
            return "";
        }

        var nsArray = new Foundation.NSMutableArray(paths.length);

        var i;
        for (i = 0; i < paths.length; i++) {
            nsArray.addObject(paths[i]);
        }

        // TODO: Static methods return NSString instance to enable its methods
        var nsString: any = Foundation.NSString.pathWithComponents(nsArray);
        return nsString.stringByStandardizingPath();
    }
}