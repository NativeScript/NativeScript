This plugin contains type information about the native platforms as exposed by the NativeScript framework.

Offically supported entry points:
 - `android.d.ts` - For android SDK and runtime types.
 - `ios.d.ts` - For iOS SDK and runtime types.

Using the declarations may conflict with DOM typings,
consider using TypeScript 2.x.x and the following settings in your `tsconfig.json`:
```
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
```
/// <reference path="./node_modules/tns-platform-declarations/ios.d.ts" />
/// <reference path="./node_modules/tns-platform-declarations/android.d.ts" />
```

d.ts files require a lot of memory and CPU. Consider adding skipLibCheck option to tsconfig file.

## Generate android .d.ts files
* To generate android dependencies use [android-dts-generator](https://github.com/NativeScript/android-dts-generator) with the appropriate android version and android support jars
* To regenerate android-*.d.ts file use the **android-dts-generator** passing the corresponding android jar (described [here](https://github.com/NativeScript/android-dts-generator/blob/master/README.md#generate-definitons-for-android-sdk))
* Run the **android-dts-generator** for every support jar if needed. You can check [here](https://github.com/NativeScript/android-dts-generator/blob/master/README.md#support-libraries) where you can find that jar files. Rename the ouput .d.ts file with the library name and replace the existing android-support-* files in [android](android) folder.