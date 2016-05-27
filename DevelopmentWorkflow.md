Development Workflow
====================

## Full build
This will create all deliverables from the NativeScript repo in the `bin/dist/*.tgz` folder:
```
npm install
grunt
```

## Using tns-core-modules from source in app
This will register the location of the `tns-core-modules` sources as symlink in your npm:
```
cd tns-core-modules
npm link
```

To rebuild the JavaScript of the `tns-core-modules`, in the root of the NativeScript repo:
```
# this will update tns-core-modules.d.ts references with new .d.ts files
grunt generate-tns-core-modules-dev-dts
# this will rebuild the TS to JS
tsc
```

Then you can navigate to any NativeScript App and add the `tns-core-modules` from the NativeScript repo to the `node_modules/tns-core-modules` in the app with:
```
npm link tns-core-modules
```
You should be able to debug the App in VSCode, breakpoints in the `node_modules/tns-core-modules` TypeScript files should work.
Changes in the App's `node_modules/tns-core-modules` will edit the files in the NativeScript repo so you should be able to easily add changes to git.

## Running mobile unit tests
There is `tests` folder with regular NativeScript application that runs tests on the `tns-core-modules`.
To run them (see Using tns-core-modules from source in app):
```
npm install
grunt generate-tns-core-modules-dev-dts
tsc

cd tns-core-modules
npm link
cd ..

cd tests
npm link tns-core-modules
cd ..

tns run [ios|android] --path tests
```

You can rapidly apply canges to the `tns-core-modules` and `tests`, and to run the tests, at the root of the NativeScript repo, execute:
```
# optionally, if you have added new .d.ts files
grunt generate-tns-core-modules-dev-dts

tsc
tns run [ios|android] --path tests
```
