# Writing Unit Tests for NativeScript Core Modules

Unit tests for NativeScript Modules are written and executed with a custom lightweight test-runner and assertion framework.
The purpose of this document is to get you familiar with it so that you can unit-test your contributions to the NativeScript framework.

# Run Unit Tests Project

Refer to the [development-workflow guide](DevelopmentWorkflow.md) for instructions on how to set up your repo and get it ready for development.
After the setup, navigate to the `tests` project and run it. It will execute all the tests and output the results in the console.

```bash
cd tests

tns run android
# or
tns run ios
```

# Test Modules

All unit tests are organized into test modules(bundles).
By default, the test app will run all the tests from all registered test modules. This happens in [`runTests()`](/tests/app/app/mainPage.ts#L26-L28) method in the main page of the test-app. By modifying this method, you can configure the app to:

* **Execute only the tests from a specific test module**:

```typescript
function runTests() {
    setTimeout(() => tests.runAll('HTTP'), 10);
}
``` 

* **Execute single test from a specific test module**:

```typescript
function runTests() {
    setTimeout(() => tests.runAll('HTTP.test_getJSON'), 10);
}
``` 

## Register Test Module
Test modules are organized in separate files and are registered in the [`tests/app/testRunner.ts`](tests/app/testRunner.ts) file:

```typescript
import * as httpTests from "./http/http-tests";
allTests["HTTP"] = httpTests;
```

## Writing Test Module
The test modules are actually TypeScript modules which export unit tests and hooks as functions following this convention:

* All exported functions with a `test` prefix are unit-tests.
* The `setUpModule()` hook is called once - before all the tests in the module.
* The `setUp()` hook is called before each test.
* The `tearDown()` hook called after each test.
* The `tearDownModule()` hook is called once - after all the tests in the module.

# Asserting
A test will fail if assert is not satisfied or if an error is thrown during execution.
There is a large set of asserting functions available in the [`tests/app/TKUnit.ts`](tests/app/TKUnit.ts) module. We recommend using those in your tests.

```typescript
import * as TKUnit from "../tk-unit";

export function testSomethingWorksFast() {
    let arr = [1, 2, 3];
    
    TKUnit.assertNotNull(arr, "Array should be defined");
    TKUnit.assertTrue(arr[2] > 2, "arr[2] is not big enough")
    TKUnit.assertEqual(arr.length, 3, "Array length should be 3");
}
```

# Async Tests

Unit tests can accept a single argument - a done callback. The test framework will wait for the `done()` callback to be called (or the test to timeout) before moving on.
Passing an `Error` to the `done()` callback will cause the test to fail:

```typescript
export function test_getJSON(done) {
    http.getJSON("https://httpbin.org/get").then(
        (result) => { done(); }, // success
        (error) => { done(error); }); // fail
};
```

# Misc

When looking into the code of the existing tests, you might encounter strange comments looking like this `// >> animation-chaining`. These are markers for code snippets generated in the docs documentation. They are not related to testing so you don't need to add any of those in your tests.
