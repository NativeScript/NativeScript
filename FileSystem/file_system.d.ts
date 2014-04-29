export declare class FileSystemEntity {
    /**
      * Gets the Date object specifying the last time this entity was modified.
      */
    public lastModified: Date;

    /**
      * Gets the name of the entity.
      */
    public name: string;

    /**
      * Gets the fully-qualified path (including the extension for a File) of the entity.
      */
    public path: string;

    /**
      * Gets the Folder object representing the parent of this entity. Will be null for a root folder like Documents or Temporary.
      */
    public getParent(onError?: (error: any) => any): Folder;

    /**
      * Removes (deletes) the current Entity from the file system.
      */
    public remove(onSuccess?: () => any, onError?: (error: any) => any);

    /**
    * Renames the current entity using the specified name.
    */
    public rename(newName: string, onSuccess?: () => any, onError?: (error) => any);
}

export declare class File extends FileSystemEntity {
    /**
      * Checks whether a File with the specified path already exists.
      */
    public static exists(path: string): boolean;

    /**
      * Gets the extension of the file.
      */
    public extension: string;

    /**
      * Gets a value indicating whether the file is currently locked, meaning a background operation associated with this file is running.
      */
    public isLocked: boolean;

    /**
      * Gets or creates a File entity at the specified path.
      */
    public static fromPath(path: string, onError?: (error: any) => any): File;
    
    /**
      * Reads the content of the file as a string using the specified encoding (defaults to UTF-8).
      */
    public readText(onSuccess: (content: string) => any, onError?: (error: any) => any, encoding?: string);

    /**
      * Writes the provided string to the file, using the specified encoding (defaults to UTF-8).
      */
    public writeText(content: string, onSuccess?: () => any, onError?: (error: any) => any, encoding?: string);
}

export declare class Folder extends FileSystemEntity {
    /**
      * Determines whether this instance is a KnownFolder (accessed through the KnownFolders object).
      */
    public isKnown: boolean;

    /**
      * Gets or creates a Folder entity at the specified path.
      */
    public static fromPath(path: string, onError?: (error: any) => any): Folder;

    /**
      * Checks whether a Folder with the specified path already exists.
      */
    public static exists(path: string): boolean;

    /**
    Checks whether this Folder contains an Entity with the specified name.
    The path of the folder is added to the name to resolve the complete path to check for.
      */
    public contains(name: string): boolean;

    /**
      * Deletes all the files and folders (recursively), contained within this Folder.
      */
    public clear(onSuccess?: () => any, onError?: (error: any) => any);

    /**
      * Gets or creates a File entity with the specified name within this Folder.
      */
    public getFile(name: string, onError?: (error: any) => any): File;

    /**
    * Gets or creates a Folder entity with the specified name within this Folder.
    */
    public getFolder(name: string, onError?: (error: any) => any): Folder;

    /**
    * Gets all the top-level entities residing within this folder.
    */
    public getEntities(onSuccess: (entities: Array<FileSystemEntity>) => any, onError?: (error) => any);

    /**
    Enumerates all the top-level FileSystem entities residing within this folder.
    The first parameter is a callback that receives the current entity.
    If the callback returns false this will mean for the iteration to stop.
    */
    public eachEntity(onEntity: (entity: FileSystemEntity) => boolean, onError?: (error: any) => any);
}

/**
  * Provides access to the top-level Folders instances that are accessible from the application. Use these as entry points to access the FileSystem.
  */
export declare module knownFolders {
    /**
    * Gets the Documents folder available for the current application. This Folder is private for the application and not accessible from Users/External apps.
    */
    export function documents(): Folder;

    /**
    * Gets the Temporary (Caches) folder available for the current application. This Folder is private for the application and not accessible from Users/External apps.
    */
    export function temp(): Folder;
}

///**
//  * Base class for FileReader and FileWriter APIs.
//  */
//export declare class FileAccess {
//    constructor(file: File);

//    /**
//    * Unlocks the file and allows other operations over it.
//    */
//    public release();

//    /**
//    * Gets the underlying File instance.
//    */
//    file: File;
//}

///**
//  * Enables reading the content of a File entity.
//  */
//export declare class FileReader extends FileAccess {
///**
//* Reads the content of the underlying File as a UTF8 encoded string.
//*/
//public readText(onSuccess: (content: string) => any, onError?: (error: any) => any);
//}

///**
//  * Enables saving data to a File entity.
//  */
//export declare class FileWriter extends FileAccess {
//    /**
//    * Enables saving string to a File entity.
//    */
//    public writeText(content: string, onSuccess?: () => any, onError?: (error: any) => any);
//}