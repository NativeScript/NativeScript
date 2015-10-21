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

# Prerequisites
- Node JS
- grunt
- NativeScript CLI
- Android/iOS setup
- expect

# Sample run:
```
grunt testsapp --platform=Android [--tnsPath="tns"] --emuPId=".*emulator64-x86"
--emuAvdName="Api19" [--logFilePath="./TestRunResult.txt"] [--androidRuntimePath="./tns-android.tgz"]
```
