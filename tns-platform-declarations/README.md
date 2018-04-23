**`tns-platform-declarations`**

This plugin contains the type information to the underlying native platforms as exposed by the NativeScript framework.

Offically supported entry points:
 - [`android.d.ts`](android/android.d.ts) - for android platform SDK and runtime types
 - [`ios.d.ts`](ios/ios.d.ts) - for iOS platform SDK and runtime types
 - desktop future maybe https://github.com/NativeScript/NativeScript/issues/27

Using the declarations may conflict with DOM typings,
consider using TypeScript 2.+ and the following settings in the `tsconfig.json`:
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

- processing `*.d.ts` files require a lot of memory and CPU
- consider adding `skipLibCheck` option to `tsconfig.json` file.
