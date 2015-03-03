# How to create new Cross-Platform Module

1. Each module resides in a separate folder.
2. There must be a package.json file in this folder which tells the NS Runtime which is the main file of the module to load.
3. There is a declaration (*.d.ts) file describing the public API of the module.
4. When there is a ***.android.ts** named file this tells our CLI that this file is Android-specific and should be icluded in Android builds ONLY. When a build is started for the Android platform, the **.android** part of the file is stripped in the application package. For example **foo.android.js** will become ***foo.js**. Same convention works for ***.ios.ts** files.

## Declaration and implementation files
There are several major scenarios when writing modules:

### The module implementation contains pure JavaScript code ONLY and does not depend on native APIs. In this case the entire logic is executed on the JS Virtual Machine side and the TNS Runtime is not involved.

**Declaration file (foo.d.ts):**

```javascript
declare module "foo"{
    function a();
    class Foo {
        public var1: number;
    }
}
```

**Implementation file (foo.ts):**

```javascript
import definition = require("foo");

export function a(){
    // do somethign here
}

// require the definition and put implements clause to ensure API consistency between the declaration and implementation
export class Foo implements definition.Foo {
  public var1: number;
}
```

### The module implementation depends on native APIs ONLY and the common pure JavaScript code between platform-specific implementations is minimal. 

**Declaration file (foo.d.ts):**

```javascript
declare module "foo"{
    class Foo {
        public running: number;
        public start(): void;
        public stop(): void;
    }
}
```

**Android implementation file (foo.android.ts):**

```javascript
import definition = require("foo");

// require the definition and put implements clause to ensure API consistency between the declaration and implementation
export class Foo implements definition.Foo {
  public running: number;
  public start(): void {
      // Call android APIs - e.g. android.os.SystemClock.[xxx]
      this.running = true;
  }
  public stop(): void {
      // Call android APIs - e.g. android.os.SystemClock.[xxx]
      this.running = false;
  }
}
```

**iOS implementation file (foo.ios.ts):**

```javascript
import definition = require("foo");

// require the definition and put implements clause to ensure API consistency between the declaration and implementation
export class Foo implements definition.Foo {
  public running: number;
  public start(): void {
      // Call iOS APIs - e.g. Foundation.NSObject.[xxx]
      this.running = true;
  }
  public stop(): void {
      // Call iOS APIs - e.g. Foundation.NSObject.[xxx]
      this.running = false;
  }
}
```

### The module is more complex and contains significant part of pure JavaScript code as well as native APIs calls.

In this case we will need to reuse the common JavaScript code and to split the implementation only for the platform specific native APIs. There are two different approaches here:

* _Separate the common implementation (code) in a base class. Add two specific files that inherit the base class and provide the platform-specific implementation:_

**Declaration file (foo.d.ts):**

```javascript
declare module "foo"{
    class Foo {
        public running: number;
        public start(): void;
        public stop(): void;
    }
}
```

**Common implementation file (foo-common.ts):**

```javascript
import definition = require("foo");

// require the definition and put implements clause to ensure API consistency between the declaration and implementation
export class Foo implements definition.Foo {
  public running: number;
  public start(): void {
      this.running = true;
      // add some common implementation here
  }
  public stop(): void {
      this.running = false;
      // add some common implementation here
  }
}
```

**Android implementation file (foo.android.ts):**

```javascript
import common = require("foo-common");

// require the common file and extend the base common implementation
export class Foo extends common.Foo {
  public start(): void {
      // call the base method which does the common job
      super.start();
      // add platform-specific implementation - e.g. call android.os.SystemClock.[xxx]
  }
  public stop(): void {
      // call the base method which does the common job
      super.stop();
      // add platform-specific implementation - e.g. call android.os.SystemClock.[xxx]
  }
}
```

**iOS implementation file (foo.ios.ts):**

```javascript
import common = require("foo-common");

// require the common file and extend the base common implementation
export class Foo extends common.Foo {
  public start(): void {
      // call the base method which does the common job
      super.start();
      // add platform-specific implementation - e.g. call Foundation.NSObject.[xxx]
  }
  public stop(): void {
      // call the base method which does the common job
      super.stop();
      // add platform-specific implementation - e.g. call Foundation.NSObject.[xxx]
  }
}
```

* _Extract the platform specific implementation in a separate Facade and aggregate/use it within the JavaScript implementation:_

**Declaration file (foo.d.ts):**

```javascript
declare module "foo"{
    class Foo {
        public running: number;
        public start(): void;
        public stop(): void;
    }
}
```

**Native Implementation Declaration file (foo-native.d.ts):**

```javascript
//@private
// The above statement marks this definition as private so that it is not visible to the users
declare module "foo-native"{
    function startNative();
    function stopNative();
}
```

**Android Native Implementation  file (foo-native.android.ts):**

```javascript
export function startNative(){
    // call native code here
}
export function stopNative(){
    // call native code here
}
```

**iOS Native Implementation  file (foo-native.ios.ts):**

```javascript
export function startNative(){
    // call native code here
}
export function stopNative(){
    // call native code here
}
```

**Common implementation file (foo.ts):**

```javascript
import definition = require("foo");
import fooNative = require("foo-native");

// require the definition and put implements clause to ensure API consistency between the declaration and implementation
export class Foo implements definition.Foo {
  public running: number;
  public start(): void {
      this.running = true;
      // do the native call through the Facade
      fooNative.startNative();
  }
  public stop(): void {
      this.running = false;
      // do the native call through the Facade
      fooNative.stopNative();
  }
}
```
