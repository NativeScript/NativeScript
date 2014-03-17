Steps to build the BCL solution:

The BCL solution relies on a custom build task used to filter and rename the compiled javascript files by platform. 
E.g. the file `application.android.js`, containing the actual platform-specific implementation will become `application.js`.
The BCL itself uses a pre-built copy of the task, residing in the `Build/lib` folder.

### BuildTasks solution 

In case you want to change the custom build task you will need to rebuild the solution and copy the newly generated assembly to the `Build/lib` folder.

[BuildTasks](https://github.com/telerik/xPlatCore/tree/master/Build/Tasks)

The output of this project is located at (../bin/)

### Build the BCL project

There are four different configurations of the project:

1. Android <br/>
   This configuration will create a `bin/Android` folder and output all the Android-related files there.
2. iOS <br/>
   This configuration will create a `bin/iOS` folder and output all the iOS-related files there.
3. Android_Deploy <br/>
   [Still working on]
4. iOS_Deploy <br/>
   Same as the iOS configuration plus the generated javascript is copied to the JS folder in the testing xCode project. 
   The path to the project is taken from the `BCL/Deploy/xCode/Configuration.xml` file. The expected XML structure is:
   ```
<?xml version="1.0" encoding="utf-8" ?>
<JSFolder>
  <Path>Z:\Kimera\JDBridgeApp\JDBridgeApp\js</Path>
</JSFolder>
   ```
   In order to use this path you will need to map a shared MAC's folder and access it from your PC.

### Useful links

[VSCommands](http://vscommands.squaredinfinity.com/)

Adds the option to "Group Items" (DependentUpon tag) within the Visual Studio Solution Explorer. Select several items, right-click -> Group Items.