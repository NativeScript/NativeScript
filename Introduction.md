NativeScript Modules
===

#What are the cross-platform modules
The cross-platform modules repository contains the framework to be used for writing code that will run on any of the platforms, supported by NativeScript.

#Basics
For faster and more stable development, the modules are written in TypeScript, that gets 'transpiled' to JavaScript, which actually runs on the target device. To have that, the JavaScript code is accompanied with a set of platform-specific (native) binaries, called runtimes. These are a middle layer, running the JavaScript code on the device.

#Code organization
Each runtime provides JavaScript wrappers over the native platform classes. The classes in the cross-platform modules are common wrappers over the native wrappers, organized in a manner, allowing the straightforward development of powerful cross-platform mobile applications.
A cross-platform class would typically have different imlementations for the different platforms. The cross-platform library must have them both and decide which one to use. To avoid runtime checking, a convention is chosen that any files, named \*.[platform].ts (and, respectively, \*.[platform].js) are valid for the specific platform only. That way, common API gets only declared in a file, named `file-system-access.d.ts` while its iOS and Android implementations get coded in the `file-system-access.ios.ts` and `file-system-access.android.ts` respectively.

One would notice the `apps` folder, which does not fit the notation of a module. Normally each of the subfolders of the `apps` folder would be a separate repository or a project, with its own build and packaging. For a faster and more stable development, aided with code completion and due to limitations in Visual Studio, the current setup is chosen.

#Steps to build the CrossPlatformModules solution:

#Before start
1. Make sure you have nodejs and npm installed
2. Navigate to the CrossPlatformModules directory
3. Run `npm install -g grunt-cli` (to be able to trigger the grunt build).<br/>
**Note**: Might require sudo permissions on some *nix systems
4. Run `npm install` (will install the dependencies and devDependencies)


#Visual Studio and Project Structure
The CrossPlatformModules project calls a grunt task that transpiles the typescript code to JavaScript.

A module file that cannot have a common implementation across the platforms
would have a `modulename.d.ts` file, containing the declarations of the
module API and `modulename.[platform].ts` files, containing the actual
platform-specific implementation of the module functionality.
The `modulename.d.ts` file in that case is used by Visual Studio as an intellisense
helper, forcing the Visual Studio typescript compiler to feed its definitions
from the \*.d.ts file rather than the implementation one.

When built, the project outputs npm packages, containing the fully transpiled
code. There is a package for the modules only and packages for each subfolder
of the apps folder, each representing a standalone cross-platform NativeScript
application.

### Useful links

[VSCommands](http://vscommands.squaredinfinity.com/)

Adds the option to "Group Items" (DependentUpon tag) within the Visual Studio Solution Explorer. Select several items, right-click -> Group Items.

[A comparison of various features and APIs across mobile platforms](https://github.com/w3c-webmob/web-api-gap/blob/master/features/compass.md)

## CLI
Run `grunt` to have the the packages built and output to the `bin/dist` subfolder.
