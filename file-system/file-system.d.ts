
declare module "file-system" {

    import promises = require("promises");

    /**
    * Represents a single entity on the file system.
    */
    class FileSystemEntity {
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
        remove(): promises.Promise<any>;

        /**
        * Renames the current entity using the specified name.
        * @param newName The new name to be applied to the entity.
        */
        rename(newName: string): promises.Promise<any>;
    }

    /**
    * Represents a File entity on the file system.
    */
    export class File extends FileSystemEntity {
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
        * Gets a value indicating whether the file is currently locked, meaning a background operation associated with this file is running.
        */
        isLocked: boolean;

        /**
        * Gets or creates a File entity at the specified path.
        * @param path The path to get/create the file at.
        */
        static fromPath(path: string): File;

        /**
        * Reads the content of the file as a string using the specified encoding (defaults to UTF-8).
        * @param encoding An optional value specifying the preferred encoding (defaults to UTF-8).
        */
        readText(encoding?: string): promises.Promise<string>;

        /**
        * Writes the provided string to the file, using the specified encoding (defaults to UTF-8).
        * @param content The content to be saved to the file.
        * @param encoding An optional value specifying the preferred encoding (defaults to UTF-8).
        */
        writeText(content: string, encoding?: string): promises.Promise<any>;
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
        clear(): promises.Promise<any>;

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
        getEntities(): promises.Promise<Array<FileSystemEntity>>;

        /**
        * Enumerates all the top-level FileSystem entities residing within this folder.
        * @param onEntity A callback that receives the current entity. If the callback returns false this will mean for the iteration to stop.
        */
        eachEntity(onEntity: (entity: FileSystemEntity) => boolean);
    }

    /**
    * Provides access to the top-level Folders instances that are accessible from the application. Use these as entry points to access the FileSystem.
    */
    module knownFolders {
        /**
        * Gets the Documents folder available for the current application. This Folder is private for the application and not accessible from Users/External apps.
        */
        function documents(): Folder;

        /**
        * Gets the Temporary (Caches) folder available for the current application. This Folder is private for the application and not accessible from Users/External apps.
        */
        function temp(): Folder;
    }

    /**
    * Enables path-specific operations like join, extension, etc.
    */
    module path {
        /**
        * Normalizes a path, taking care of occurrances like ".." and "//".
        * @param path The path to be normalized.
        */
        function normalize(path: string): string;

        /**
        * Joins all the provided string components, forming a valid and normalized path.
        * @param paths An array of string components to be joined.
        */
        function join(...paths: string[]): string;

        /**
        * Gets the string used to separate file paths.
        */
        var separator: string;
    }
}