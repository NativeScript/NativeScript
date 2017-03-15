---
nav-title: "file-system How-To"
title: "file-system"
environment: nativescript
description: "Examples for using file-system"
previous_url: /ApiReference/file-system/HOW-TO
---
# File System
Using the file system requires the FileSystem module.
{%snippet file-system-require%}
The pre-required `fs` module is used throughout the following code snippets.
## Path
### Normalize a Path
{%snippet file-system-normalize%}

### Path Join
Concatenate a path to a file by providing multiple path arguments.
{%snippet file-system-multiple-args%}

### Get the Path Separator
{%snippet file-system-separator%}

### Get or Create a File With Path
The following example writes some text to a file created for path.
It will create a new file or overwrite an existing file.
{%snippet file-system-create%}

### Get or Create a Folder With Path
{%snippet file-system-create-folder%}

## Create
### Writing a string to a File
The following example writes some text to a file.
It will create a new file or overwrite an existing file.
{%snippet file-system-write-string%}

### Get or Create a File
{%snippet file-system-create-file%}

### Get or Create a Folder
{%snippet file-system-get-folder%}

## Read
### Reading from a File
The following example writes some text to a file and then reads it back.
{%snippet file-system-example-text%}

### Reading/writing binary data from/to a File
{%snippet file-system-read-binary%}

### Getting the Known Folders
Each app has several well known folders. This is how to access them:
{%snippet file-system-known-folders%}

### Getting Folder Contents
Getting all files and folders within a folder:
{%snippet file-system-folders-content%}

### Enumerating Folder Contents
Getting all folder entities in array may be slow with large number of files.
Enumerating the folder entities would iterate the files one by one without blocking the UI.
{%snippet file-system-enum-content%}

### Getting Parent Folder
{%snippet file-system-parent%}

### Getting File Name and Extension
{%snippet file-system-extension%}

### Checking if a File Exists
{%snippet file-system-fileexists%}

### Checking if a Folder Exists
{%snippet file-system-folderexists%}

## Update
### Renaming a File
{%snippet file-system-renaming%}

### Renaming a Folder
{%snippet file-system-renaming-folder%}

## Delete
### Removing a File
To 'delete', 'remove' or 'unlink' a file use the file's remove method:
{%snippet file-system-remove-file%}

### Removing a Folder
{%snippet file-system-remove-folder%}

### Clearing the Contents of a Folder
The clear method removes all files within a folder.
{%snippet file-system-clear-folder%}
