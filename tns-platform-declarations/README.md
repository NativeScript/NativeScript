This plugin contains type information about the native platforms as exposed by the NativeScript framework.

Officially supported entry points:
 - `android.d.ts` - For android SDK and runtime types.
 - `ios.d.ts` - For iOS SDK and runtime types.

Using the declarations may conflict with DOM typings,
consider using TypeScript 2.2.x or newer,
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

Projects created with NativeScript 3.0.0 will be shipped without `references.d.ts`.
Create `references.d.ts` in the root directory of your project and add the following:
```
/// <reference path="./node_modules/tns-platform-declarations/android.d.ts" />
/// <reference path="./node_modules/tns-platform-declarations/ios.d.ts" />
```

d.ts files require a lot of memory and CPU. Consider adding skipLibCheck option to tsconfig file.
