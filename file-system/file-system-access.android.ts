import appModule = require("application");
import textModule = require("text");
import types = require("utils/types");

export class FileSystemAccess {
    private _pathSeparator = java.io.File.separator.toString();

    public getLastModified(path: string): Date {
        var javaFile = new java.io.File(path);
        return new Date(javaFile.lastModified());
    }

    public getParent(path: string, onError?: (error: any) => any): { path: string; name: string } {
        try {
            var javaFile = new java.io.File(path);
            var parent = javaFile.getParentFile();

            return { path: parent.getAbsolutePath(), name: parent.getName() };
        } catch (exception) {
            // TODO: unified approach for error messages
            if (onError) {
                onError(exception);
            }

            return undefined;
        }
    }

    public getFile(path: string, onError?: (error: any) => any): { path: string; name: string; extension: string } {
        return this.ensureFile(new java.io.File(path), false, onError);
    }

    public getFolder(path: string, onError?: (error: any) => any): { path: string; name: string } {
        var javaFile = new java.io.File(path);
        var dirInfo = this.ensureFile(javaFile, true, onError);
        if (!dirInfo) {
            return undefined;
        }

        return { path: dirInfo.path, name: dirInfo.name };
    }

    public eachEntity(path: string, onEntity: (file: { path: string; name: string; extension: string }) => boolean, onError?: (error: any) => any) {
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

        this.enumEntities(path, onEntity, localError);

        if (!errorOccurred) {
            onSuccess(fileInfos);
        }
    }

    public fileExists(path: string): boolean {
        var file = new java.io.File(path);
        return file.exists();
    }

    public folderExists(path: string): boolean {
        var file = new java.io.File(path);
        var exists = file.exists();
        var dir = file.isDirectory();

        // return file.exists() && file.getCanonicalFile().isDirectory();
        return exists && dir;
    }

    public deleteFile(path: string, onSuccess?: () => any, onError?: (error: any) => any) {
        try {
            var javaFile = new java.io.File(path);
            if (!javaFile.isFile()) {
                if (onError) {
                    onError({ message: "The specified parameter is not a File entity." });
                }

                return;
            }

            if (!javaFile.delete()) {
                if (onError) {
                    onError({ message: "File deletion failed" });
                }
            } else if (onSuccess) {
                onSuccess();
            }
        } catch (exception) {
            if (onError) {
                onError(exception);
            }
        }
    }

    public deleteFolder(path: string, isKnown?: boolean, onSuccess?: () => any, onError?: (error: any) => any) {
        try {
            var javaFile = new java.io.File(path);
            if (!javaFile.getCanonicalFile().isDirectory()) {
                if (onError) {
                    onError({ message: "The specified parameter is not a Folder entity." });
                }

                return;
            }

            // TODO: Asynchronous
            this.deleteFolderContent(javaFile);

            if (!isKnown) {
                if (javaFile.delete()) {
                    if (onSuccess) {
                        onSuccess();
                    }
                } else {
                    if (onError) {
                        onError({ message: "Folder deletion failed." });
                    }
                }
            } else {
                // TODO: Notify error?
            }
        } catch (exception) {
            if (onError) {
                onError(exception);
            }
        }
    }

    public emptyFolder(path: string, onSuccess?: () => any, onError?: (error: any) => any) {
        try {
            var javaFile = new java.io.File(path);
            if (!javaFile.getCanonicalFile().isDirectory()) {
                if (onError) {
                    onError({ message: "The specified parameter is not a Folder entity." });
                }

                return;
            }

            // TODO: Asynchronous
            this.deleteFolderContent(javaFile);

            if (onSuccess) {
                onSuccess();
            }

        } catch (exception) {
            if (onError) {
                onError(exception);
            }
        }
    }

    public rename(path: string, newPath: string, onSuccess?: () => any, onError?: (error: any) => any) {
        var javaFile = new java.io.File(path);
        if (!javaFile.exists()) {
            if (onError) {
                onError(new Error("The file to rename does not exist"));
            }

            return;
        }

        var newFile = new java.io.File(newPath);
        if (newFile.exists()) {
            if (onError) {
                onError(new Error("A file with the same name already exists."));
            }

            return;
        }

        if (!javaFile.renameTo(newFile)) {
            if (onError) {
                onError(new Error("Failed to rename file '" + path + "' to '" + newPath + "'"));
            }

            return;
        }

        if (onSuccess) {
            onSuccess();
        }
    }

    public getDocumentsFolderPath(): string {
        var context = appModule.android.context;
        var dir = context.getFilesDir();
        return dir.getAbsolutePath();
    }

    public getTempFolderPath(): string {
        var context = appModule.android.context;
        var dir = context.getCacheDir();
        return dir.getAbsolutePath();
    }

    public readText(path: string, onSuccess: (content: string) => any, onError?: (error: any) => any, encoding?: any) {
        try {
            var javaFile = new java.io.File(path);
            var stream = new java.io.FileInputStream(javaFile);

            var actualEncoding = encoding;
            if (!actualEncoding) {
                actualEncoding = textModule.encoding.UTF_8;
            }
            var reader = new java.io.InputStreamReader(stream, actualEncoding);
            var bufferedReader = new java.io.BufferedReader(reader);

            // TODO: We will need to read the entire file to a CharBuffer instead of reading it line by line
            // TODO: bufferedReader.read(CharBuffer) does not currently work
            var line = undefined;
            var result = "";
            while (true) {
                line = bufferedReader.readLine();
                if (types.isUndefined(line)) {
                    break;
                }

                if (result.length > 0) {
                    // add the new line manually to the result
                    // TODO: Try with CharBuffer at a later stage, when the Bridge allows it
                    result += "\n";
                }

                result += line;
            }

            if (actualEncoding === textModule.encoding.UTF_8) {
                // Remove UTF8 BOM if present. http://www.rgagnon.com/javadetails/java-handle-utf8-file-with-bom.html
                result = FileSystemAccess._removeUtf8Bom(result);
            }

            bufferedReader.close();

            if (onSuccess) {
                onSuccess(result);
            }
        } catch (exception) {
            if (onError) {
                onError(exception);
            }
        }
    }

    private static _removeUtf8Bom(s: string): string {
        if (s.charCodeAt(0) === 0xFEFF) {
            s = s.slice(1);
            //console.log("Removed UTF8 BOM.");
        }

        return s;
    }

    public writeText(path: string, content: string, onSuccess?: () => any, onError?: (error: any) => any, encoding?: any) {
        try {
            var javaFile = new java.io.File(path);
            var stream = new java.io.FileOutputStream(javaFile);

            var actualEncoding = encoding;
            if (!actualEncoding) {
                actualEncoding = textModule.encoding.UTF_8;
            }
            var writer = new java.io.OutputStreamWriter(stream, actualEncoding);

            writer.write(content);
            writer.close();

            if (onSuccess) {
                onSuccess();
            }
        } catch (exception) {
            if (onError) {
                onError(exception);
            }
        }
    }

    private deleteFolderContent(file: java.io.File): boolean {
        var filesList = file.listFiles();

        var i,
            childFile: java.io.File,
            success: boolean = false;

        for (i = 0; i < filesList.length; i++) {
            childFile = filesList[i];
            if (childFile.getCanonicalFile().isDirectory()) {
                success = this.deleteFolderContent(childFile);
                if (!success) {
                    break;
                }
            }

            success = childFile.delete();
        }

        return success;
    }

    private ensureFile(javaFile: java.io.File, isFolder: boolean, onError?: (error: any) => any): { path: string; name: string; extension: string } {
        try {
            if (!javaFile.exists()) {
                var created;
                if (isFolder) {
                    created = javaFile.mkdirs();
                } else {
                    created = javaFile.createNewFile();
                }

                if (!created) {
                    // TODO: unified approach for error messages
                    if (onError) {
                        onError("Failed to create new java File for path " + javaFile.getAbsolutePath());
                    }

                    return undefined;
                } else {
                    javaFile.setReadable(true);
                    javaFile.setWritable(true);
                }
            }

            var path = javaFile.getAbsolutePath();
            return { path: path, name: javaFile.getName(), extension: this.getFileExtension(path) };
        } catch (exception) {
            // TODO: unified approach for error messages
            if (onError) {
                onError(exception);
            }

            return undefined;
        }
    }

    // TODO: This method is the same as in the iOS implementation.
    // Make it in a separate file / module so it can be reused from both implementations.
    private getFileExtension(path: string): string {
        var dotIndex = path.lastIndexOf(".");
        if (dotIndex && dotIndex >= 0 && dotIndex < path.length) {
            return path.substring(dotIndex);
        }

        return "";
    }

    private enumEntities(path: string, callback: (entity: { path: string; name: string; extension: string }) => boolean, onError?: (error) => any) {
        try {
            var javaFile = new java.io.File(path);
            if (!javaFile.getCanonicalFile().isDirectory()) {
                if (onError) {
                    onError("There is no folder existing at path " + path);
                }

                return;
            }

            var filesList = javaFile.listFiles();
            var length = filesList.length;
            var i;
            var info;
            var retVal;

            for (i = 0; i < length; i++) {
                javaFile = filesList[i];

                info = {
                    path: javaFile.getAbsolutePath(),
                    name: javaFile.getName()
                };

                if (javaFile.isFile()) {
                    info.extension = this.getFileExtension(info.path);
                }

                retVal = callback(info);
                if (retVal === false) {
                    break;
                }
            }
        } catch (exception) {
            if (onError) {
                onError(exception);
            }
        }
    }

    public getPathSeparator(): string {
        return this._pathSeparator;
    }

    public normalizePath(path: string): string {
        var file = new java.io.File(path);
        return file.getAbsolutePath();
    }

    public joinPath(left: string, right: string): string {
        var file1 = new java.io.File(left);
        var file2 = new java.io.File(file1, right);

        return file2.getAbsolutePath();
    }

    public joinPaths(paths: string[]): string {
        if (!paths || paths.length === 0) {
            return "";
        }

        if (paths.length === 1) {
            return paths[0];
        }

        var i,
            result = paths[0];
        for (i = 1; i < paths.length; i++) {
            result = this.joinPath(result, paths[i]);
        }

        return this.normalizePath(result);
    }
}