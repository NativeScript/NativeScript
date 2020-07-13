This document describes comment messages available to execute tests on pull request.

|Comment                 |Commit Status Context|Description|
|:----------------------:|:-------------------:|:---------:|
|`run ci`                |ci/jenkins/unit-tests|Builds NativeScript cross-platform modules and tests, assembles the [UnitTests](https://github.com/NativeScript/NativeScript/tree/master/tests) app using prebuild .apk and .app, run it for both iOS and Android. It executes __by default__ on pull request.|
|`cuteness [android/ios]`|ci/jenkins/cuteness-[android/ios]|Builds NativeScript cross-platform modules and apps, assembles the [Cuteness](https://github.com/NativeScript/NativeScript/tree/master/apps/app/cuteness.io) app using prebuild .apk and .app, run it in separate jobs for Android and iOS.                    |
|`uitests [android/ios]`|ci/jenkins/uitests-[android/ios]|Builds NativeScript cross-platform modules and apps, assembles the [UITests](https://github.com/NativeScript/NativeScript/tree/master/apps/app/ui-tests-app) app using prebuild .apk and .app, run it in separate jobs for Android and iOS.                    |
|`full build`|ci/jenkins/full-build|Builds NativeScript cross-platform modules and tests, builds the [UnitTests](https://github.com/NativeScript/NativeScript/tree/master/tests) app, run it for both iOS and Android.|
|`widgets`|ci/jenkins/widgets|Builds NativeScript cross-platform modules and tests, takes latest widgets build on PR, builds the [UnitTests](https://github.com/NativeScript/NativeScript/tree/master/tests) app, run it for both iOS and Android.|
