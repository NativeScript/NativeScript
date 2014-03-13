Steps to build the BCL solution:

The BCL solution relies on a custom build task used to filter and rename the compiled javascript files by platform. 
E.g. the file `application.android.js`, containing the actual platform-specific implementation will become `application.js`

### Build the BuildTasks solution 

[BuildTasks](https://github.com/telerik/xPlatCore/tree/master/Build/Tasks)

The output of this project is located at (../bin/)

### Build the BCL project

There are two build configurations - iOS and Android. Depending on the configuration, the custom build task will prepare the `bin/iOS` and `bin/Android` folders
where the files only needed for the specified platform will be copied.