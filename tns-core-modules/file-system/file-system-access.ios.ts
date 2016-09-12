import textModule = require("text");
import * as utilsModule from "utils/utils";

import * as utils from "utils/utils";

// TODO: Implement all the APIs receiving callback using async blocks
// TODO: Check whether we need try/catch blocks for the iOS implementation
export class FileSystemAccess {

    public getLastModified(path: string): Date {
        var fileManager = utils.ios.getter(NSFileManager, NSFileManager.defaultManager);
        var attributes = fileManager.attributesOfItemAtPathError(path);

        if (attributes) {
            return attributes.objectForKey("NSFileModificationDate");
        } else {
            return new Date();
        }
    }

    public getParent(path: string, onError?: (error: any) => any): { path: string; name: string } {
        try {
            var fileManager = utils.ios.getter(NSFileManager, NSFileManager.defaultManager);
            var nsString = NSString.stringWithString(path);

            var parentPath = nsString.stringByDeletingLastPathComponent;
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
            var fileManager = utils.ios.getter(NSFileManager, NSFileManager.defaultManager);
            var exists = fileManager.fileExistsAtPath(path);

            if (!exists) {
                var parentPath = this.getParent(path, onError).path;
                if (!fileManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(parentPath, true, null) ||
                        !fileManager.createFileAtPathContentsAttributes(path, null, null)) {
                    if (onError) {
                        onError(new Error("Failed to create file at path '" + path + "'"));
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
            var fileManager = utils.ios.getter(NSFileManager, NSFileManager.defaultManager);
            var exists = this.folderExists(path);

            if (!exists) {
                try {
                    fileManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(path, true, null)
                }
                catch (ex) {
                    if (onError) {
                        onError(new Error("Failed to create folder at path '" + path + "': " + ex));
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

    public getEntities(path: string, onError?: (error: any) => any): Array<{ path: string; name: string; extension: string }> {
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

        this.enumEntities(path, onEntity, localError);

        if (!errorOccurred) {
            return fileInfos;
        }

        return null;
    }

    public fileExists(path: string): boolean {
        var result = this.exists(path);
        return result.exists;
    }

    public folderExists(path: string): boolean {
        var result = this.exists(path);
        return result.exists && result.isDirectory;
    }

    private exists(path: string): { exists: boolean, isDirectory: boolean } {
        var fileManager = utils.ios.getter(NSFileManager, NSFileManager.defaultManager);
        var isDirectory = new interop.Reference(interop.types.bool, false);
        var exists = fileManager.fileExistsAtPathIsDirectory(path, isDirectory);

        return { exists: exists, isDirectory: isDirectory.value };
    }

    public concatPath(left: string, right: string): string {
        var utils: typeof utilsModule = require("utils/utils");

        // TODO: This probably is not efficient, we may try concatenation with the "/" character
        var nsArray = utils.ios.collections.jsArrayToNSArray([left, right]);
        var nsString = NSString.pathWithComponents(nsArray);

        return nsString.toString();
    }

    public deleteFile(path: string, onError?: (error: any) => any) {
        this.deleteEntity(path, onError);
    }

    public deleteFolder(path: string, onError?: (error: any) => any) {
        this.deleteEntity(path, onError);
    }

    public emptyFolder(path: string, onError?: (error: any) => any) {
        var fileManager = utils.ios.getter(NSFileManager, NSFileManager.defaultManager);
        var entities = this.getEntities(path, onError);

        if (!entities) {
            return;
        }

        var i;
        for (i = 0; i < entities.length; i++) {
            try {
                fileManager.removeItemAtPathError(entities[i].path);
            }
            catch (ex) {
                if (onError) {
                    onError(new Error("Failed to empty folder '" + path + "': " + ex));
                }

                return;
            }
        }
    }

    public rename(path: string, newPath: string, onError?: (error: any) => any) {
        var fileManager = utils.ios.getter(NSFileManager, NSFileManager.defaultManager);

        try {
            fileManager.moveItemAtPathToPathError(path, newPath);
        }
        catch (ex) {
            if (onError) {
                onError(new Error("Failed to rename '" + path + "' to '" + newPath + "': " + ex));
            }
        }
    }

    public getLogicalRootPath(): string {
        let mainBundlePath = utils.ios.getter(NSBundle, NSBundle.mainBundle).bundlePath;
        let resolvedPath = NSString.stringWithString(mainBundlePath).stringByResolvingSymlinksInPath;
        return resolvedPath;
    }

    public getDocumentsFolderPath(): string {
        return this.getKnownPath(NSSearchPathDirectory.DocumentDirectory);
    }

    public getTempFolderPath(): string {
        return this.getKnownPath(NSSearchPathDirectory.CachesDirectory);
    }
    
    public getCurrentAppPath(): string {
        const currentDir = __dirname;
        const tnsModulesIndex = currentDir.indexOf("/tns_modules");

        // Module not hosted in ~/tns_modules when bundled. Use current dir.
        let appPath = currentDir;
        if (tnsModulesIndex !== -1) {
            // Strip part after tns_modules to obtain app root
            appPath = currentDir.substring(0, tnsModulesIndex);
        }
        
        return appPath;
    }

    public readText(path: string, onError?: (error: any) => any, encoding?: any) {
        var actualEncoding = encoding;
        if (!actualEncoding) {
            actualEncoding = textModule.encoding.UTF_8;
        }

        try {
            var nsString = NSString.stringWithContentsOfFileEncodingError(path, actualEncoding);
            return nsString.toString();
        }
        catch (ex) {
            if (onError) {
                onError(new Error("Failed to read file at path '" + path + "': " + ex));
            }
        }
    }

    public read(path: string, onError?: (error: any) => any): NSData {
        try {
            return NSData.dataWithContentsOfFile(path);
        }
        catch (ex) {
            if (onError) {
                onError(new Error("Failed to read file at path '" + path + "': " + ex));
            }
        }
    }

    public writeText(path: string, content: string, onError?: (error: any) => any, encoding?: any) {
        var nsString = NSString.stringWithString(content);

        var actualEncoding = encoding;
        if (!actualEncoding) {
            actualEncoding = textModule.encoding.UTF_8;
        }

        // TODO: verify the useAuxiliaryFile parameter should be false
        try {
            nsString.writeToFileAtomicallyEncodingError(path, false, actualEncoding);
        }
        catch (ex) {
            if (onError) {
                onError(new Error("Failed to write to file '" + path + "': " + ex));
            }
        }
    }

    public write(path: string, content: NSData, onError?: (error: any) => any) {
        try {
            content.writeToFileAtomically(path, true);
        }
        catch (ex) {
            if (onError) {
                onError(new Error("Failed to write to file '" + path + "': " + ex));
            }
        }
    }

    private getKnownPath(folderType: number): string {
        var fileManager = utils.ios.getter(NSFileManager, NSFileManager.defaultManager);
        var paths = fileManager.URLsForDirectoryInDomains(folderType, NSSearchPathDomainMask.UserDomainMask);

        var url = paths.objectAtIndex(0);
        return url.path;
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

    private deleteEntity(path: string, onError?: (error: any) => any) {
        var fileManager = utils.ios.getter(NSFileManager, NSFileManager.defaultManager);
        try {
            fileManager.removeItemAtPathError(path);
        }
        catch (ex) {
            if (onError) {
                onError(new Error("Failed to delete file at path '" + path + "': " + ex));
            }
        }
    }

    private enumEntities(path: string, callback: (entity: { path: string; name: string; extension: string }) => boolean, onError?: (error) => any) {
        try {
            var fileManager = utils.ios.getter(NSFileManager, NSFileManager.defaultManager);
            try {
                var files = fileManager.contentsOfDirectoryAtPathError(path);
            }
            catch (ex) {
                if (onError) {
                    onError(new Error("Failed to enum files for folder '" + path + "': " + ex));
                }

                return;
            }

            var file;
            var i;
            var info;
            var retVal;

            for (i = 0; i < files.count; i++) {
                file = files.objectAtIndex(i);

                info = {
                    path: this.concatPath(path, file),
                    name: file
                };

                if (!this.folderExists(this.joinPath(path, file))) {
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
        var nsString: NSString = NSString.stringWithString(path);
        var normalized = nsString.stringByStandardizingPath;

        return normalized;
    }

    public joinPath(left: string, right: string): string {
        var nsString: NSString = NSString.stringWithString(left);
        return nsString.stringByAppendingPathComponent(right);
    }

    public joinPaths(paths: string[]): string {
        if (!paths || paths.length === 0) {
            return "";
        }

        var nsArray = NSMutableArray.alloc<string>().initWithCapacity(paths.length);

        var i;
        for (i = 0; i < paths.length; i++) {
            nsArray.addObject(paths[i]);
        }

        var nsString = NSString.stringWithString(NSString.pathWithComponents(nsArray));
        return nsString.stringByStandardizingPath;
    }
}
