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

    > As this is a [grunt](http://gruntjs.com/) script, the arguments are passed
    the grunt way (--argName=argValue)

    - `platform`: The platform to run the tests application on: iOS or Android
    - `tnsPath`: [Optional] The path to the NativeScript executable. If not
    found, the globally installed `tns` gets called.
    - `emuPId`: The ID of the emulator process. This one is used to refresh the
    emulator process, as the emulator sometimes hangs.
    - `avd`: The name of the Android Virtual Device to be started to run the
    tests.
    - `logFilePath`: [Optional] The path to the file, which the test app run
    log will get saved to. Defaults to "./TestRunResult.txt".
    - `androidRuntimePath`: [Optional] The path to a custom Android Runtime
    package to have the tests run onto. If not specified, the newest available
    build on [npmjs.com](http://npmjs.com).
    - `showEmu`: [Optional] Specifies whether the emulator should get launched
    in a window or headless mode. Defaults to `false`.

# Sample run:
```
grunt testsapp --platform=Android [--tnsPath="tns"] --emuPId=".*emulator64-x86"
--avd="Api19" [--logFilePath="./TestRunResult.txt"] [--androidRuntimePath="./tns-android.tgz"] --showEmu=true
```
