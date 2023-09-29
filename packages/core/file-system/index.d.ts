import { FileSystemAccess } from './file-system-access';

export enum AndroidDirectory {
	ALARMS,
	AUDIOBOOKS,
	DCIM,
	DOCUMENTS,
	DOWNLOADS,
	MOVIES,
	MUSIC,
	NOTIFICATIONS,
	PICTURES,
	PODCASTS,
	RINGTONES,
	SCREENSHOTS,
}

/**
 * Returns FileSystemAccess, a shared singleton utility class to provide methods to access and work with the file system. This is used under the hood of all the file system apis in @nativescript/core and provided as a lower level convenience if needed.
 * @returns FileSystemAccess
 */
export function getFileAccess(): FileSystemAccess;

/**
 * Represents a single entity on the file system.
 */
export class FileSystemEntity {
	/**
	 * Gets the Date object specifying the last time this entity was modified.
	 */
	lastModified: Date;

	/**
	 * Gets the name of the entity.
	 */
	name: string;

	/**
	 * Gets the fully-qualified path (including the extension for a File) of the entity.
	 */
	path: string;

	/**
	 * Gets the Folder object representing the parent of this entity.
	 * Will be null for a root folder like Documents or Temporary.
	 * This property is readonly.
	 */
	parent: Folder;

	/**
	 * Removes (deletes) the current Entity from the file system.
	 */
	remove(): Promise<any>;

	/**
	 * Removes (deletes) the current Entity from the file system synchronously.
	 */
	removeSync(onError?: (error: any) => any): void;

	/**
	 * Renames the current entity using the specified name.
	 * @param newName The new name to be applied to the entity.
	 */
	rename(newName: string): Promise<any>;

	/**
	 * Renames the current entity synchronously, using the specified name.
	 * @param newName The new name to be applied to the entity.
	 */
	renameSync(newName: string, onError?: (error: any) => any): void;
}

/**
 * Contains Android-specific the file system helpers.
 */
class Android {
	createFile(options: { relativePath?: string; name: string; mime: string; directory: AndroidDirectory }): File;
}

/**
 * Contains iOS-specific the file system helpers.
 */

class iOS {}

/**
 * Represents a File entity on the file system.
 */
export class File extends FileSystemEntity {
	static readonly android: Android;

	static readonly ios: iOS;

	/**
	 * Checks whether a File with the specified path already exists.
	 * @param path The path to check for.
	 */
	static exists(path: string): boolean;

	/**
	 * Gets the extension of the file.
	 */
	extension: string;

	/**
	 * Gets the size in bytes of the file.
	 */
	size: number;

	/**
	 * Gets a value indicating whether the file is currently locked, meaning a background operation associated with this file is running.
	 */
	isLocked: boolean;

	/**
	 * Appends the provided string to the file, using the specified encoding (defaults to UTF-8).
	 * @param content The content to be saved to the file.
	 * @param encoding An optional value specifying the preferred encoding (defaults to UTF-8).
	 */
	appendText(content: string, encoding?: string): Promise<any>;

	/**
	 * Appends the provided string to the file synchronously, using the specified encoding (defaults to UTF-8).
	 * @param content The content to be saved to the file.
	 * @param onError An optional function to be called if some IO-error occurs.
	 * @param encoding An optional value specifying the preferred encoding (defaults to UTF-8).
	 */
	appendTextSync(content: string, onError?: (error: any) => any, encoding?: string): void;

	/**
	 * Appends the provided binary content to the file.
	 * @param content The binary content to be saved to the file.
	 */
	append(content: any): Promise<void>;

	/**
	 * Appends the provided binary content to the file synchronously.
	 * @param content The binary content to be saved to the file.
	 * @param onError An optional function to be called if some IO-error occurs.
	 */
	appendSync(content: any, onError?: (error: any) => any): void;

	/**
	 * Copies a file to a given path.
	 * @param dest The path to the destination file.
	 * Returns a Promise with a boolean.
	 */
	copy(dest: string): Promise<boolean>;

	/**
	 * Copies a file to a given path.
	 * @param dest The path to the destination file.
	 * @param onError (optional) A callback function to use if any error occurs.
	 * Returns a Promise with a boolean.
	 */
	copySync(dest: string, onError?: (error: any) => any): any;

	/**
	 * Gets or creates a File entity at the specified path.
	 * @param path The path to get/create the file at.
	 * @param copy An optional value when set, copies the content-uri to a temp file enabling the legacy behaviour
	 */
	static fromPath(path: string, copy?: boolean): File;

	/**
	 * Reads the content of the file as a string using the specified encoding (defaults to UTF-8).
	 * @param encoding An optional value specifying the preferred encoding (defaults to UTF-8).
	 */
	readText(encoding?: string): Promise<string>;

	/**
	 * Reads the content of the file as a string synchronously, using the specified encoding (defaults to UTF-8).
	 * @param onError An optional function to be called if some IO-error occurs.
	 * @param encoding An optional value specifying the preferred encoding (defaults to UTF-8).
	 */
	readTextSync(onError?: (error: any) => any, encoding?: string): string;

	/**
	 * Reads the binary content of the file asynchronously.
	 */
	read(): Promise<any>;

	/**
	 * Reads the binary content of the file synchronously.
	 * @param onError An optional function to be called if some IO-error occurs.
	 */
	readSync(onError?: (error: any) => any): any;

	/**
	 * Writes the provided string to the file, using the specified encoding (defaults to UTF-8).
	 * @param content The content to be saved to the file.
	 * @param encoding An optional value specifying the preferred encoding (defaults to UTF-8).
	 */
	writeText(content: string, encoding?: string): Promise<any>;

	/**
	 * Writes the provided string to the file synchronously, using the specified encoding (defaults to UTF-8).
	 * @param content The content to be saved to the file.
	 * @param onError An optional function to be called if some IO-error occurs.
	 * @param encoding An optional value specifying the preferred encoding (defaults to UTF-8).
	 */
	writeTextSync(content: string, onError?: (error: any) => any, encoding?: string): void;

	/**
	 * Writes the provided binary content to the file.
	 * @param content The binary content to be saved to the file.
	 */
	write(content: any): Promise<void>;

	/**
	 * Writes the provided binary content to the file synchronously.
	 * @param content The binary content to be saved to the file.
	 * @param onError An optional function to be called if some IO-error occurs.
	 */
	writeSync(content: any, onError?: (error: any) => any): void;
}

/**
 * Represents a Folder (directory) entity on the file system.
 */
export class Folder extends FileSystemEntity {
	/**
	 * Determines whether this instance is a KnownFolder (accessed through the KnownFolders object).
	 */
	isKnown: boolean;

	/**
	 * Gets or creates a Folder entity at the specified path.
	 * @param path The path to get/create the folder at.
	 */
	static fromPath(path: string): Folder;

	/**
	 * Checks whether a Folder with the specified path already exists.
	 * @param path The path to check for.
	 */
	static exists(path: string): boolean;

	/**
	 * Checks whether this Folder contains an Entity with the specified name.
	 * The path of the folder is added to the name to resolve the complete path to check for.
	 * @param name The name of the entity to check for.
	 */
	contains(name: string): boolean;

	/**
	 * Deletes all the files and folders (recursively), contained within this Folder.
	 */
	clear(): Promise<any>;

	/**
	 * Deletes all the files and folders (recursively), contained within this Folder synchronously.
	 * @param onError An optional function to be called if some error occurs.
	 */
	clearSync(onError?: (error: any) => void): void;

	/**
	 * Gets or creates a File entity with the specified name within this Folder.
	 * @param name The name of the file to get/create.
	 */
	getFile(name: string): File;

	/**
	 * Gets or creates a Folder entity with the specified name within this Folder.
	 * @param name The name of the folder to get/create.
	 */
	getFolder(name: string): Folder;

	/**
	 * Gets all the top-level entities residing within this folder.
	 */
	getEntities(): Promise<Array<FileSystemEntity>>;

	/**
	 * Gets all the top-level entities residing within this folder synchronously.
	 * @param onError An optional function to be called if some error occurs.
	 */
	getEntitiesSync(onError?: (error: any) => any): Array<FileSystemEntity>;

	/**
	 * Enumerates all the top-level FileSystem entities residing within this folder.
	 * @param onEntity A callback that receives the current entity. If the callback returns false this will mean for the iteration to stop.
	 */
	eachEntity(onEntity: (entity: FileSystemEntity) => boolean);
}

/**
 * Provides access to the top-level Folders instances that are accessible from the application. Use these as entry points to access the FileSystem.
 */
export module knownFolders {
	/**
	 * Gets the Documents folder available for the current application. This Folder is private for the application and not accessible from Users/External apps.
	 */
	export function documents(): Folder;

	/**
	 * Gets the Documents folder available for the current application on an external storage. This Folder is private for the application and not accessible from Users/External apps.
	 * On android this requires READ_EXTERNAL_STORAGE/WRITE_EXTERNAL_STORAGE permissions
	 * There is no external storage on iOS os it is the same as `documents()`
	 */
	export function externalDocuments(): Folder;

	/**
	 * Gets the Temporary (Caches) folder available for the current application. This Folder is private for the application and not accessible from Users/External apps.
	 */
	export function temp(): Folder;

	/**
	 * Gets the root folder for the current application. This Folder is private for the application and not accessible from Users/External apps.
	 * iOS - this folder is read-only and contains the app and all its resources.
	 */
	export function currentApp(): Folder;

	/**
	 * Contains iOS-specific known folders.
	 */
	module ios {
		/**
		 * Gets the NSLibraryDirectory. Note that the folder will not be created if it did not exist.
		 */
		export function library(): Folder;

		/**
		 * Gets the NSDeveloperDirectory. Note that the folder will not be created if it did not exist.
		 */
		export function developer(): Folder;

		/**
		 * Gets the NSDesktopDirectory. Note that the folder will not be created if it did not exist.
		 */
		export function desktop(): Folder;

		/**
		 * Gets the NSDownloadsDirectory. Note that the folder will not be created if it did not exist.
		 */
		export function downloads(): Folder;

		/**
		 * Gets the NSMoviesDirectory. Note that the folder will not be created if it did not exist.
		 */
		export function movies(): Folder;

		/**
		 * Gets the NSMusicDirectory. Note that the folder will not be created if it did not exist.
		 */
		export function music(): Folder;

		/**
		 * Gets the NSPicturesDirectory. Note that the folder will not be created if it did not exist.
		 */
		export function pictures(): Folder;

		/**
		 * Gets the NSSharedPublicDirectory. Note that the folder will not be created if it did not exist.
		 */
		export function sharedPublic(): Folder;
	}
}

/**
 * Enables path-specific operations like join, extension, etc.
 */
export module path {
	/**
	 * Normalizes a path, taking care of occurrances like ".." and "//".
	 * @param path The path to be normalized.
	 */
	export function normalize(path: string): string;

	/**
	 * Joins all the provided string components, forming a valid and normalized path.
	 * @param paths An array of string components to be joined.
	 */
	export function join(...paths: string[]): string;

	/**
	 * Gets the string used to separate file paths.
	 */
	export const separator: string;
}
