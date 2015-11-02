#! /bin/bash

androidRuntimePath=$(realpath ../../../LATEST_RUNTIMES/tns-android.tgz)
builtApkPath=$(realpath ../../../THE_APK/TestsApp-debug.apk)
iosRuntimePath=/Users/erjitka/work/LATEST_RUNTIMES/tns-ios.tgz
builtAppPath=/Users/erjitka/work/THE_BUILT_APP/TestsApp.app

#grunt testsapp --verbose --platform=Android --emuPId=".*emulator64-x86" --avd="Api19" --logFilePath="./TestRunResult.txt" --runtimePath="/Users/erjan/tns-android.tgz" --showEmu=true --modulesPath=/Volumes/distributions/DailyBuilds/NativeScript/tns-modules/Stable/tns-core-modules.tgz

#grunt testsapp --verbose --platform=iOS --logFilePath="./TestRunResult.txt" --runtimePath="/Users/erjan/tns-ios.tgz" --showEmu=true --modulesPath=/Volumes/distributions/DailyBuilds/NativeScript/tns-modules/Stable/tns-core-modules.tgz --avd="'iPhone 6 (9.0) ['"

#grunt buildTestsApp --verbose --platform=iOS --logFilePath="./TestRunResult.txt" --runtimePath="/Users/erjan/tns-ios.tgz" --showEmu=true --modulesPath=/Volumes/distributions/DailyBuilds/NativeScript/tns-modules/Stable/tns-core-modules.tgz --avd="'iPhone 6 (9.0) ['"

#grunt testsapp --verbose --platform=iOS --runAppOnly --logFilePath="./TestRunResult.txt" --runtimePath="/Users/erjan/tns-ios.tgz" --showEmu=true --modulesPath=/Volumes/distributions/DailyBuilds/NativeScript/tns-modules/Stable/tns-core-modules.tgz --avd="'iPhone 6 (9.0) ['"

#grunt testsapp --runAppOnly --verbose --pathToApp="$builtApkPath" --platform=Android --emuPId=".*emulator64-x86" --avd="Api21" --logFilePath="./TestRunResult.txt" --runtimePath=$androidRuntimePath --showEmu=true #--modulesPath=/Volumes/distributions/DailyBuilds/NativeScript/tns-modules/Stable/tns-core-modules.tgz

grunt testsapp --runAppOnly --verbose --pathToApp="$builtAppPath" --platform=iOS --avd="3C67F2C2-BF43-4210-BD21-E28D84119247" --logFilePath="./TestRunResult.txt" --runtimePath=$iosRuntimePath --showEmu=true #--modulesPath=/Volumes/distributions/DailyBuilds/NativeScript/tns-modules/Stable/tns-core-modules.tgz

