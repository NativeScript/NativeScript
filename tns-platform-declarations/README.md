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
* To generate android dependencies use [android-dts-generator](https://github.com/NativeScript/android-dts-generator) with the appropriate android version and android support jars
* To regenerate android-*.d.ts file use the **android-dts-generator** passing the corresponding android jar (described [here](https://github.com/NativeScript/android-dts-generator/blob/master/README.md#generate-definitons-for-android-sdk))
* More details for using the **android-dts-generator** can be found in [this article](https://docs.nativescript.org/core-concepts/android-runtime/metadata/generating-typescript-declarations).

## Generate ios .d.ts files

The `.d.ts` files for iOS are generated using iOS Runtime's metadata generator. You can use the [typings-gen.sh](./typings-gen.sh) script like this:

```BASH
./typings-gen.sh rc [<path-to-medatadata-generator-binary>]
```
Where `rc` can be an NPM tag/version of `tns-ios` that will be used for generating the typings. If the metadata generator to be used has not been released in NPM, you can optionally specify its path as a 2nd argument.
