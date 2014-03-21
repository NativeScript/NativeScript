import app_module = require("Application/application");


export class FileSystemAccess {
    private _encoding = "UTF-8";
    private _pathSeparator = "/";

    public getReadonly(path: string): boolean {
        var javaFile = new java.io.File(path);
        return javaFile.exists() && !javaFile.canWrite();
    }

    public getLastModified(path: string): Date {
        var javaFile = new java.io.File(path);
        return new Date(javaFile.lastModified());
    }

    public getParent(path: string, onError?: (error: any) => any): string {
        try {
            var javaFile = new java.io.File(path);
            var parent = javaFile.getParentFile();
            return parent.getPath();
        } catch (exception) {
            // TODO: unified approach for error messages
            if (onError) {
                onError(exception);
            }

            return undefined;
        }
    }

    public getFile(path: string, onSuccess: (path: string) => any, onError?: (error: any) => any) {
        this.ensureFile(new java.io.File(path), onSuccess, onError);
    }

    public getFolder(path: string, onSuccess: (path: string) => any, onError?: (error: any) => any) {
        var javaFile = new java.io.File(path);
        if (javaFile.exists() && !javaFile.isDirectory()) {
            if (onError) {
                onError("The path " + path + "exists and is not a directory");
            }
        } else {
            this.ensureFile(javaFile, onSuccess, onError);
        }
    }

    public enumFiles(path: string, onSuccess: (files: Array<string>) => any, onError?: (error: any) => any) {
        try {
            var javaFile = new java.io.File(path);
            if (!javaFile.isDirectory()) {
                if (onError) {
                    onError("There is no folder existing at path " + path);
                }

                return;
            }

            if (javaFile.isDirectory()) {
                var filesList: Array<java.io.File> = javaFile.listFiles();
                var filePaths = new Array<string>();

                var length = filesList.length,
                    i,
                    filePath;

                for (i = 0; i < length; i++) {
                    javaFile = filesList[i];

                    if (javaFile.isFile()) {
                        filePath = javaFile.getPath();
                        filesList.push(filePath);
                    }
                }

                if (onSuccess) {
                    onSuccess(filePaths);
                }
            }

        } catch (exception) {
            if (onError) {
                onError(exception);
            }
        }
    }

    public fileExists(path: string): boolean {
        var file = new java.io.File(path);
        return file.exists();
    }

    public folderExists(path: string): boolean {
        var file = new java.io.File(path);
        return file.exists() && file.isDirectory();
    }

    public concatPath(left: string, right: string): string {
        return left + this._pathSeparator + right;
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
            if (!javaFile.isDirectory()) {
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
            if (!javaFile.isDirectory()) {
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

    public rename(path: string, onSuccess?: () => any, onError?: (error: any) => any) {
        // TODO: No implementation
    }

    public getDocumentsFolderPath(): string {
        var context = app_module.tk.ui.Application.current.android.context;
        var dir: java.io.File = context.getFilesDir();
        return dir.getPath();
    }

    public getTempFolderPath(): string {
        var context = app_module.tk.ui.Application.current.android.context;
        var dir: java.io.File = context.getCacheDir();
        return dir.getPath();
    }

    public readText(path: string, onSuccess: (content: string) => any, onError?: (error: any) => any) {
        try {
            var javaFile = new java.io.File(path);
            var stream = new java.io.FileInputStream(javaFile);
            var reader = new java.io.InputStreamReader(stream, this._encoding);
            var bufferedReader = new java.io.BufferedReader(reader);

            // TODO: We will need to read the entire file to a CharBuffer instead of reading it line by line
            // TODO: bufferedReader.read(CharBuffer) does not currently work
            var line = undefined;
            var result = "";
            while (true) {
                line = bufferedReader.readLine();
                if (!line) {
                    break;
                }

                if (result.length > 0) {
                    // add the new line manually to the result
                    // TODO: Try with CharBuffer at a later stage, when the Bridge allows it
                    // result += "\n";
                }
                result += line;
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

    public writeText(path: string, content: string, onSuccess?: () => any, onError?: (error: any) => any) {
        try {
            var javaFile = new java.io.File(path);
            var stream = new java.io.FileOutputStream(javaFile);
            var writer = new java.io.OutputStreamWriter(stream, this._encoding);
            var bufferedWriter = new java.io.BufferedWriter(writer);

            bufferedWriter.write(content);
            bufferedWriter.close();

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
            if (childFile.isDirectory()) {
                success = this.deleteFolderContent(childFile);
                if (!success) {
                    break;
                }
            }

            success = childFile.delete();
        }

        return success;
    }

    private ensureFile(javaFile: java.io.File, onSuccess: (path: string) => any, onError?: (error: any) => any) {
        try {
            if (!javaFile.exists()) {
                if (!javaFile.createNewFile()) {
                    // TODO: unified approach for error messages
                    if (onError) {
                        onError("Failed to create new file for path " + javaFile.getPath());
                    }
                }
            }

            if (onSuccess) {
                onSuccess(javaFile.getPath());
            }
        } catch (exception) {
            // TODO: unified approach for error messages
            if (onError) {
                onError(exception);
            }
        }
    }
}