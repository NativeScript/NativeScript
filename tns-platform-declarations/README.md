This plugin contains type information about the native platforms as exposed by the NativeScript framework.

Offically supported entry points:
 - `android.d.ts` - For android SDK and runtime types.
 - `ios.d.ts` - For iOS SDK and runtime types.

Using the declarations may conflict with DOM typings,
consider using TypeScript 2.x.x and the following settings in your `tsconfig.json`:
```JSON
{
    "compilerOptions": {
        "module": "commonjs",
        "target": "es5",
        "experimentalDecorators": true,
        "lib": [
            "es6",
            "dom"
        ]
    }
}
```

Create `reference.d.ts`and add the following content:
```TypeScript
/// <reference path="./node_modules/tns-platform-declarations/ios.d.ts" />
/// <reference path="./node_modules/tns-platform-declarations/android.d.ts" />
```

By default the android.d.ts file contains the typings for android API level 17. If your application has a higher minimum API level you can reference that level instead:
```TypeScript
/// <reference path="./node_modules/tns-platform-declarations/android-24.d.ts" />
```

d.ts files require a lot of memory and CPU. Consider adding skipLibCheck option to tsconfig file.

## Generate android .d.ts files
* To generate android dependencies use [android-dts-generator](https://github.com/NativeScript/android-dts-generator) with the appropriate android version and androidx jars
* To regenerate android-*.d.ts file use the **android-dts-generator** passing the corresponding android jar (described [here](https://github.com/NativeScript/android-dts-generator/blob/master/README.md#generate-definitons-for-android-sdk))

### Generate new Android platform typings
The easiest way is to use the [makefile](https://github.com/NativeScript/android-dts-generator/blob/master/Makefile) in the [android-dts-generator](https://github.com/NativeScript/android-dts-generator) repo.

Open the makefile and check whether it already contains the command entry for the Android platform version you'd like to generate typings for. If it does not exist, add it. For example for api level 29 you need to add the following:
``` bash
android-platform-29:
        java -jar dts-generator/build/libs/dts-generator.jar -input ${ANDROID_HOME}/platforms/android-29/android.jar
        mv out/android.d.ts out/android-platform-29.d.ts
```

Again in the makefile update the `android-platform-all` command like this:
``` bash
android-platform-all: android-platform-17 android-platform-18 android-platform-19 android-platform-20 android-platform-21 \
        android-platform-22 android-platform-23 android-platform-24 android-platform-25 android-platform-26 android-platform-27 \
        android-platform-28 android-platform-29
```
Now execute from command line the following:
``` bash
make android-platform-29
```

Copy the output from `out/android-platform-29.d.ts` to `tns-platform-declarations/android` folder in this repo.
Again in NativeScript repo create a new platform d.ts file in `tns-platform-declarations` folder by copying and updating an existing d.ts. For example as we are generating typings for api level 29 copy `tns-platform-declarations/android-28.d.ts`, rename it to `tns-platform-declarations/android-29.d.ts` and update its file contents like this:
``` ts
/// <reference path="./android/android-platform-29.d.ts" />
/// <reference path="./android/androidx-28.d.ts" />
/// <reference path="./android/common.d.ts" />
```

NOTE that at this point we did not update the androidx reference above. To avoid having androidx typings for every different API level we try to reuse androidx typings built with an older API level for a range of Android versions (e.g. androidx 26 typings can be used for both api levels 26 and 27). Now we need to check whether the new platform typings can use the existing androidx d.ts, or we need to generate new ones.

In `tns-platform-declarations` folder in main NativeScript repo execute the following:
``` bash
# not mandatory, just to verify that the existing setup was ok (should complete without errors)
tsc android-28.d.ts

# this is the actual check for the new platform typings
tsc android-29.d.ts
```

If `tsc` command completed without errors, you are good to go; otherwise you need to generate the androidx typings with the same android API level super jar (more details [here](https://github.com/NativeScript/android-dts-generator#android-support-specifics) but you can also just follow the section below). 

### Generate Androidx typings for new platform version
You can find the Androidx 1.0.0 jars [here](https://github.com/NativeScript/android-dts-generator/tree/master/libs/androidx/1.0.0) but we'll demonstrate how to extract the jars from scratch that will be useful for androidx version update. As androidx needs the base android jar file to create its typings you need to pass the android.jar file as a **super** parameter to the generator.

Open makefile in the [android-dts-generator](https://github.com/NativeScript/android-dts-generator) repo and the following (as we are generating typings for android api level 29):
``` bash
androidx-29:
		java -jar dts-generator/build/libs/dts-generator.jar \
		-input dts-generator/jar-files/ -input-generics libs/generics.txt \
		-super ${ANDROID_HOME}/platforms/android-29/android.jar -skip-declarations
		mv out/android.d.ts out/androidx-29.d.ts
```
Again in the makefile update the `androidx-all` command like this:
``` bash
androidx-all: androidx-17 androidx-23 androidx-26 androidx-28 androidx-29
```
Now we need to extract all androidx jars in`dts-generator/jar-files` folder (follow [https://github.com/NativeScript/android-dts-generator#finding-package-dependencies](https://github.com/NativeScript/android-dts-generator#finding-package-dependencies). Note that the necessary androidx dependencies are commented out in the [dts-generator/build.gradle](https://github.com/NativeScript/android-dts-generator/blob/master/dts-generator/build.gradle) file, you just need to temporarily uncomment them:
```
// ...

dependencies {
implementation 'org.apache.bcel:bcel:6.2'
implementation 'commons-io:commons-io:2.6'
implementation 'com.google.code.findbugs:findbugs:3.0.1'

// add your dependency here as the example bellow, make sure you are using testCompileOnly
//AndroidX
//testCompileOnly "androidx.legacy:legacy-support-v4:1.0.0" 	<------ uncomment but do not commit
//testCompileOnly "androidx.appcompat:appcompat:1.0.0" 			<------ uncomment but do not commit
//testCompileOnly "com.google.android.material:material:1.0.0" 	<------ uncomment but do not commit
}

// ...
```
From `dts-generator` folder execute the following in command line (that will get the needed jars in `dts-generator/jar-files` folder):
``` bash
./gradlew extractAllJars
```

Now execute from command line the following:
``` bash
make android-platform-29
```
Copy the output from `out/androidx-29.d.ts` to `tns-platform-declarations/android` folder in the main [NativeScript](https://github.com/NativeScript/NativeScript) repo. Again in main NativeScript repo update the contents of `tns-platform-declarations/android-29.d.ts` like this:
``` ts
/// <reference path="./android/android-platform-29.d.ts" />
/// <reference path="./android/androidx-29.d.ts" />
/// <reference path="./android/common.d.ts" />
```

In `tns-platform-declarations` folder in main NativeScript repo execute the following:
``` bash
# should complete without errors now
tsc android-29.d.ts
```

## Generate ios .d.ts files

The `.d.ts` files for iOS are generated using iOS Runtime's metadata generator. You can use the [typings-gen.sh](./typings-gen.sh) script like this:

```BASH
./typings-gen.sh rc [<path-to-medatadata-generator-binary>]
```
Where `rc` can be an NPM tag/version of `tns-ios` that will be used for generating the typings. If the metadata generator to be used has not been released in NPM, you can optionally specify its path as a 2nd argument.

> Note: Apply [this](https://github.com/NativeScript/NativeScript/commit/45b4b061e470c19cdc582f220ee86fd3169269a0) commit on hand, due to a TypeScript error.

> The script expressly deletes the `objc!MaterialComponents.d.ts` file which [distributes](https://github.com/NativeScript/NativeScript/pull/7480) along with the `tns-core-modules` package to avoid plugins clashes.

> However, the metadata generator for iOS includes metadata and typings for the whole SDK and all native libraries in use, including `MaterialComponents`. Therefore, there are typings which reference types from `objc!MaterialComponents.d.ts` file and fail on transpilation.

> Currently, remove these by hand to avoid transpilation errors. A proposed Solution is to specify which entries to be generated metadata for and be accessible from JavaScript. These are the feature requests for [Android](https://github.com/NativeScript/android-runtime/issues/1485) and [iOS](https://github.com/NativeScript/ios-runtime/issues/1209)
