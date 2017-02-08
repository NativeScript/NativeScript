This plugin contains type information about the native platforms as exposed by the NativeScript framework.

Offically supported entry points:
 - `android.d.ts` - For android SDK and runtime types.
 - `ios.d.ts` - For iOS SDK and runtime types.

Add to the content of `reference.d.ts`:
```
/// <reference path="./node_modules/tns-platform-declarations/ios.d.ts" />
/// <reference path="./node_modules/tns-platform-declarations/android.d.ts" />
```

d.ts files require a lot of memory and CPU. Consider adding `--skipLibCheck` option to tsconfig file.
