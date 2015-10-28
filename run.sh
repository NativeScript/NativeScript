#! /bin/bash

#grunt testsapp --verbose --platform=Android --emuPId=".*emulator64-x86" --avd="Api19" --logFilePath="./TestRunResult.txt" --runtimePath="/Users/erjan/tns-android.tgz" --showEmu=true --modulesPath=/Volumes/distributions/DailyBuilds/NativeScript/tns-modules/Stable/tns-core-modules.tgz

grunt testsapp --verbose --platform=iOS --logFilePath="./TestRunResult.txt" --runtimePath="/Users/erjan/tns-ios.tgz" --showEmu=true --modulesPath=/Volumes/distributions/DailyBuilds/NativeScript/tns-modules/Stable/tns-core-modules.tgz --avd="2ADF1A49-F09E-4D5F-A099-AD557ABFA91C"


