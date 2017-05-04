This plugin contains type information about the native platforms as exposed by the NativeScript framework.

Offically supported entry points:
 - `android.d.ts` - For android SDK and runtime types.
 - `ios.d.ts` - For iOS SDK and runtime types.

Using the declarations may conflict with DOM typings,
consider using TypeScript 2.0.3 or newer,
and the following settings in your `tsconfig.json`:
```
{
  "compilerOptions": {
    ...
    "lib": ["es6", "dom"],
    "baseUrl": ".",
    "paths": {
    "*": [
      "./node_modules/tns-core-modules/*",
      "./node_modules/*"]
  }
}
```

Create `reference.d.ts` file at the root directory of your project and add the following:
```
/// <reference path="./node_modules/tns-platform-declarations/ios.d.ts" />
/// <reference path="./node_modules/tns-platform-declarations/android.d.ts" />
```

d.ts files require a lot of memory and CPU. Consider adding skipLibCheck option to tsconfig file.
