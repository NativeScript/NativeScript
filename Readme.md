Steps to build the BCL solution:

The BCL solution relies on a custom build task used to filter and rename the compiled javascript files by platform. 
E.g. the file `application.android.js`, containing the actual platform-specific implementation will become `application.js`.
There is also the .impl suffix for files where we have definition and implementation file with the same name, e.g.:

file-system.d.ts

file-system.impl.ts

This is done to force the typescript compiler in Visual Studio to feed its definitions from the *.d.ts file rather than the implementation one.
The build task removes this private suffix and the final output is

files-system.js

The BCL itself uses a pre-built copy of the task, residing in the `Build/lib` folder.

### BuildTasks solution 

In case you want to change the custom build task you will need to rebuild the solution and copy the newly generated assembly to the `Build/lib` folder.

[BuildTasks](https://github.com/telerik/xPlatCore/tree/master/Build/Tasks)

The output of this project is located at (../bin/)

### Build the BCL project

There are six different configurations of the project:

1. Android <br/>
   This configuration will create a `bin/Android` folder and output all the Android-related files there.
2. Android_Deploy <br/>
   Same as the Android configuration plus the generated javascript is copied to the tns_modules folder in the targeted Eclipse project.
   The path to the project is taken from the `BCL/Deploy/Eclipse/Configuration.xml` file. The expected XML structure is:

```xml
<?xml version="1.0" encoding="utf-8" ?>
<JSFolder>
  <Path>C:\Work\Git\xPlatCore\Applications\Android\UnitTestApp\assets\tns_modules</Path>
</JSFolder>
```

3. Android_Tests <br/>
   Same as Android_Deploy plus the Tests folder in the BCL is copied to the output directory.

4. iOS <br/>
   This configuration will create a `bin/iOS` folder and output all the iOS-related files there.

5. iOS_Deploy <br/>
   Same as the iOS configuration plus the generated javascript is copied to the JS folder in the testing xCode project. 
   The path to the project is taken from the `BCL/Deploy/xCode/Configuration.xml` file. The expected XML structure is:

```xml
<?xml version="1.0" encoding="utf-8" ?>
<JSFolder>
  <Path>Z:\Kimera\JDBridgeApp\JDBridgeApp\js</Path>
</JSFolder>
```
   In order to use this path you will need to map a shared MAC's folder and access it from your PC.

6. iOS_Tests <br/> 
   Same as iOS_Deploy plus the Tests folder in the BCL is copied to the output directory.   
   
### UnitTestApp - Ready to run
```xml
<?xml version="1.0" encoding="utf-8" ?>
<JSFolder>
  <Path>C:\Work\Git\xPlatCore\Applications\Android\UnitTestApp\assets\tns_modules</Path>
</JSFolder> 
```

### Useful links

[VSCommands](http://vscommands.squaredinfinity.com/)

Adds the option to "Group Items" (DependentUpon tag) within the Visual Studio Solution Explorer. Select several items, right-click -> Group Items.
