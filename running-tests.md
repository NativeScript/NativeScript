Running NativeScript Tests
=========================


# Details
NativeScript is a framework for building applications on mobile devices. Many
of its components are UI elements which get tested most efficiently on the
respective device or simulator/emulator. Thus, running the tests involves
the following steps:

- Create a NativeScript project
- Build it to a native image
- Start a simulator/emulator
- Deploy the application image
- Start the application
- Monitor its output
- Gather test output

These steps are automated via the `run-testsapp.grunt.js` grunt script, located
under the `build` directory. It gets called by the main `gruntfile.js`, but is
split to a separate file for simplicity.

# Prerequisites
- Node JS
- grunt
- NativeScript CLI
- Android/iOS setup
- expect

# Arguments:

>As this is a [grunt](http://gruntjs.com/) script, the arguments are passed
    the grunt way (`--argName=argValue`)

- `platform`: The platform to run the tests application on: iOS or Android
- `showEmu`: [Optional] Specifies whether the emulator should get launched
in a window or headless mode. Defaults to `false`.
- `modulesPath`: [Optional] The path to the tns-core-modules npm package
to be tested. Defaults to the npm package, located in the current
`bin/dist/` folder. The modules must have been built before that.
- `tnsPath`: [Optional] The path to the NativeScript executable. If not
found, the globally installed `tns` gets called.
- `emuPId`: The ID of the emulator process. This one is used to refresh the
emulator process, as the emulator sometimes hangs.
- `avd`: The name of the Android Virtual Device or the iOS simulator GUID
to be started to run the tests.
- `logFilePath`: [Optional] The path to the file, which the test app run
log will get saved to. Defaults to "./TestRunResult.txt".
- `runtimePath`: [Optional] The path to a custom iOS or Android Runtime
package to have the tests run onto. If not specified, the newest available
build on [npmjs.com](http://npmjs.com) -
[tns-ios](https://www.npmjs.com/package/tns-ios) or
[tns-android](https://www.npmjs.com/package/tns-android).

# Sample run:
```
grunt testsapp --platform=Android [--tnsPath="tns"] --emuPId=".*emulator64-x86"
--avd="Api19" [--logFilePath="./TestRunResult.txt"] [--androidRuntimePath="./tns-android.tgz"] --showEmu=true
```
