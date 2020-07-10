/**
 * An utility class used to provide methods to access and work with the file system.
 */
export class FileSystemAccess {
	/**
	 * Gets the last modified date of a file with a given path.
	 * @param path Path to the file.
	 */
	getLastModified(path: string): Date;

	/**
	 * Gets the size in bytes of a file with a given path.
	 * @param path Path to the file.
	 */
	getFileSize(path: string): number;

	/**
	 * Gets the parent folder of a file with a given path.
	 * @param path Path to the file.
	 * @param onError A callback function to use if any error occurs.
	 * Returns path Absolute path of the parent folder, name Name of the parent folder.
	 */
	getParent(path: string, onError?: (error: any) => any): { path: string; name: string };

	/**
	 * Gets a file from a given path.
	 * @param path Path to the file.
	 * @param onError A callback function to use if any error occurs.
	 * Returns path Absolute path of the file, name Name of the file, extension Extension of the file.
	 */
	getFile(path: string, onError?: (error: any) => any): { path: string; name: string; extension: string };

	/**
	 * Gets the folder of a file with a given path.
	 * @param path Path to the file.
	 * @param onError A callback function to use if any error occurs.
	 * Returns path Absolute path of the folder, name Name of the folder.
	 */
	getFolder(path: string, onError?: (error: any) => any): { path: string; name: string };

	/**
	 * Gets all entities of a given path (folder)
	 * @param path Path to the file.
	 * @param onError (optional) A callback function to use if any error occurs.
	 * Returns an array of entities in the folder.
	 */
	getEntities(path: string, onError?: (error: any) => any): Array<{ path: string; name: string; extension: string }>;

	/**
	 * Performs an action onSuccess for every entity in a folder with a given path.
	 * Breaks the loop if onSuccess function returns false
	 * @param path Path to the file.
	 * @param onEntity A callback function which is called for each entity.
	 * @param onError (optional) A callback function to use if any error occurs.
	 */
	eachEntity(path: string, onEntity: (entity: { path: string; name: string; extension: string }) => boolean, onError?: (error: any) => any);

	/**
	 * Checks if a file with a given path exist.
	 */
	fileExists(path: string): boolean;

	/**
	 * Checks if a folder with a given path exist.
	 */
	folderExists(path: string): boolean;

	/**
	 * Deletes a file with a given path.
	 * @param path Path of the file.
	 * @param onError (optional) A callback function to use if any error occurs.
	 */
	deleteFile(path: string, onError?: (error: any) => any);

	/**
	 * Deletes a folder with a given path.
	 * @param path Path of the folder.
	 * @param onError (optional) A callback function to use if any error occurs.
	 */
	deleteFolder(path: string, onError?: (error: any) => any);

	/**
	 * Deletes all content of a folder with a given path.
	 * @param path Path of the folder.
	 * @param onError (optional) A callback function to use if any error occurs.
	 */
	emptyFolder(path: string, onError?: (error: any) => any): void;

	/**
	 * Rename a file or a folder with a given path.
	 * @param path Current path of the entity which should be renamed.
	 * @param newPath The new path which will be asigned of the entity.
	 * @param onError (optional) A callback function to use if any error occurs.
	 */
	rename(path: string, newPath: string, onError?: (error: any) => any): void;

	/**
	 * Gets the special documents folder.
	 * Returns for Android: "/data/data/applicationPackageName/files", iOS: "/var/mobile/Applications/appID/Documents"
	 */
	getDocumentsFolderPath(): string;

	/**
	 * Gets the special temp folder.
	 * Returns for Android: "/data/data/applicationPackageName/cache", iOS: "/var/mobile/Applications/appID/Library/Caches"
	 */
	getTempFolderPath(): string;

	/**
	 * Gets the path to the logical root of the application - that is /path/to/appfiles/app.
	 */
	getLogicalRootPath(): string;

	/**
	 * Gets the root folder for the current application. This Folder is private for the application and not accessible from Users/External apps.
	 * iOS - this folder is read-only and contains the app and all its resources.
	 */
	getCurrentAppPath(): string;

	/**
	 * Reads a text from a file with a given path.
	 * @param path The path to the source file.
	 * @param onError (optional) A callback function to use if any error occurs.
	 * @param encoding (optional) If set reads the text with the specified encoding (default UTF-8).
	 * Returns the text read.
	 */
	readText(path: string, onError?: (error: any) => any, encoding?: any): string;

	/**
	 * Reads a text from a file with a given path.
	 * @param path The path to the source file.
	 * @param encoding (optional) If set reads the text with the specified encoding (default UTF-8).
	 * Returns Promise of the text read.
	 */
	readTextAsync(path: string, encoding?: any): Promise<string>;

	/**
	 * Reads a text from a file with a given path.
	 * @param path The path to the source file.
	 * @param onError (optional) A callback function to use if any error occurs.
	 * @param encoding (optional) If set reads the text with the specified encoding (default UTF-8).
	 * Returns the text read.
	 */
	readTextSync(path: string, onError?: (error: any) => any, encoding?: any): string;

	/**
	 * Reads a binary content from a file with a given path.
	 * @param path The path to the source file.
	 * @param onError (optional) A callback function to use if any error occurs.
	 * Returns the binary content read.
	 */
	read(path: string, onError?: (error: any) => any): any;

	/**
	 * Reads a binary content from a file with a given path.
	 * @param path The path to the source file.
	 * Returns a Promise with the binary content read.
	 */
	readAsync(path: string): Promise<any>;

	/**
	 * Reads a binary content from a file with a given path.
	 * @param path The path to the source file.
	 * @param onError (optional) A callback function to use if any error occurs.
	 * Returns the binary content read.
	 */
	readSync(path: string, onError?: (error: any) => any): any;

	/**
	 * Writes a text to a file with a given path.
	 * @param path The path to the source file.
	 * @param content The content which will be written to the file.
	 * @param onError (optional) A callback function to use if any error occurs.
	 * @param encoding (optional) If set writes the text with the specified encoding (default UTF-8).
	 */
	writeText(path: string, content: string, onError?: (error: any) => any, encoding?: any);

	/**
	 * Writes a text to a file with a given path.
	 * @param path The path to the source file.
	 * @param content The content which will be written to the file.
	 * @param encoding (optional) If set writes the text with the specified encoding (default UTF-8).
	 */
	writeTextAsync(path: string, content: string, encoding?: any): Promise<void>;

	/**
	 * Writes a text to a file with a given path.
	 * @param path The path to the source file.
	 * @param content The content which will be written to the file.
	 * @param onError (optional) A callback function to use if any error occurs.
	 * @param encoding (optional) If set writes the text with the specified encoding (default UTF-8).
	 */
	writeTextSync(path: string, content: string, onError?: (error: any) => any, encoding?: any);

	/**
	 * Writes a binary to a file with a given path.
	 * @param path The path to the source file.
	 * @param content The content which will be written to the file.
	 * @param onError (optional) A callback function to use if any error occurs.
	 */
	write(path: string, content: any, onError?: (error: any) => any);

	/**
	 * Writes a binary to a file with a given path.
	 * @param path The path to the source file.
	 * @param content The content which will be written to the file.
	 */
	writeAsync(path: string, content: any): Promise<void>;

	/**
	 * Writes a binary to a file with a given path.
	 * @param path The path to the source file.
	 * @param content The content which will be written to the file.
	 * @param onError (optional) A callback function to use if any error occurs.
	 */
	writeSync(path: string, content: any, onError?: (error: any) => any);

	/**
	 * Gets extension of the file with a given path.
	 * @param path A path to the file.
	 */
	getFileExtension(path: string): string;

	/**
	 * Gets the path separator (for the current platform).
	 */
	getPathSeparator(): string;

	/**
	 * Normalizes a path.
	 * @param path A path which should be normalized.
	 * Returns a normalized path as string.
	 */
	normalizePath(path: string): string;

	/**
	 * Joins two paths (without normalize). Only removes some trailing and duplicate path separators.
	 * @param left First path to join.
	 * @param right Second path to join.
	 * Returns the joined path.
	 */
	joinPath(left: string, right: string): string;

	/**
	 * Joins an array of file paths.
	 * @param paths An array of paths.
	 * Returns the joined path.
	 */
	joinPaths(paths: string[]): string;
}
