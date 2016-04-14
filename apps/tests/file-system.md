---
nav-title: "file-system How-To"
title: "How-To"
description: "Examples for using file-system"
---
# File System
Using the file system requires the FileSystem module.
<snippet id='file-system-require'/>
The pre-required `fs` module is used throughout the following code snippets.
## Path
### Normalize a Path
<snippet id='file-system-normalize'/>

### Path Join
Concatenate a path to a file by providing multiple path arguments.
<snippet id='file-system-multiple-args'/>

### Get the Path Separator
<snippet id='file-system-separator'/>

### Get or Create a File With Path
The following example writes some text to a file created for path.
It will create a new file or overwrite an existing file.
<snippet id='file-system-create'/>

### Get or Create a Folder With Path
<snippet id='file-system-create-folder'/>

## Create
### Writing a string to a File
The following example writes some text to a file.
It will create a new file or overwrite an existing file.
<snippet id='file-system-write-string'/>

### Get or Create a File
<snippet id='file-system-create-file'/>

### Get or Create a Folder
<snippet id='file-system-get-folder'/>

## Read
### Reading from a File
The following example writes some text to a file and then reads it back.
<snippet id='file-system-example-text'/>

### Reading/writing binary data from/to a File
<snippet id='file-system-read-binary'/>

### Getting the Known Folders
Each app has several well known folders. This is how to access them:
<snippet id='file-system-known-folders'/>

### Getting Folder Contents
Getting all files and folders within a folder:
<snippet id='file-system-folders-content'/>

### Enumerating Folder Contents
Getting all folder entities in array may be slow with large number of files.
Enumerating the folder entities would iterate the files one by one without blocking the UI.
<snippet id='file-system-enum-content'/>

### Getting Parent Folder
<snippet id='file-system-parent'/>

### Getting File Name and Extension
<snippet id='file-system-extension'/>

### Checking if a File Exists
<snippet id='file-system-fileexists'/>

### Checking if a Folder Exists
<snippet id='file-system-folderexists'/>

## Update
### Renaming a File
<snippet id='file-system-renaming'/>

### Renaming a Folder
<snippet id='file-system-renaming-folder'/>

## Delete
### Removing a File
To 'delete', 'remove' or 'unlink' a file use the file's remove method:
<snippet id='file-system-remove-file'/>

### Removing a Folder
<snippet id='file-system-remove-folder'/>

### Clearing the Contents of a Folder
The clear method removes all files within a folder.
<snippet id='file-system-clear-folder'/>
