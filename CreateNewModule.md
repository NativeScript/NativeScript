# How to create new Cross-Platform Module

1. Each module resides in a separate folder.
2. There must be a package.json file in this folder which tells the NS Runtime which is the main file of the module to load.
3. There is a declaration (*.d.ts) file describing the public API of the module.
4. When there is a ***.android.ts** named file this tells our CLI that this file is Android-specific and should be included in Android builds ONLY. When a build is started for the Android platform, the **.android** part of the file is stripped in the application package. For example **foo.android.js** will become ***foo.js**. Same convention works for ***.ios.ts** files.

## Declaration and implementation files
There are several major scenarios when writing modules:

### The module implementation contains pure JavaScript code ONLY and does not depend on native APIs. In this case the entire logic is executed on the JS Virtual Machine side and the TNS Runtime is not involved.

_Example:_ [matrix module](tns-core-modules/matrix)

**Declaration file (foo.d.ts):**

```typescript
export function a();

export class Foo {
    public var1: number;
}
```

**Implementation file (foo.ts):**

```typescript
import { Foo as FooDefinition } from ".";

export function a() {
    // do something here
}

// require the definition and put implements clause to ensure API consistency between the declaration and implementation
export class Foo implements FooDefinition {
  public var1: number;
}
```

### The module implementation depends on native APIs ONLY and the common pure JavaScript code between platform-specific implementations is minimal. 

_Example:_ [timer module](tns-core-modules/timer)


**Declaration file (foo.d.ts):**

```typescript
export class Foo {
    public running: number;
    public start(): void;
    public stop(): void;
}
```

**Android implementation file (foo.android.ts):**

```typescript
import { Foo as FooDefinition } from ".";

// require the definition and put implements clause to ensure API consistency between the declaration and implementation
export class Foo implements FooDefinition {
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

```typescript
import { Foo as FooDefinition } from ".";

// require the definition and put implements clause to ensure API consistency between the declaration and implementation
export class Foo implements FooDefinition {
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

#### Separate the common implementation (code) in a base class. Add two specific files that inherit the base class and provide the platform-specific implementation

This is the way most of the UI modules are written.

_Example:_ [image module](tns-core-modules/ui/image)

**Declaration file (foo.d.ts):**

```typescript
export class Foo {
    public running: number;
    public start(): void;
    public stop(): void;
}
```

**Common implementation file (foo-common.ts):**

```typescript
import { FooBase as FooDefinition } from ".";

// require the definition and put implements clause to ensure API consistency between the declaration and implementation
export class FooBase implements FooDefinition {
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

```typescript
import { FooBase } from "./foo-common";

// require the common file and extend the base common implementation
export class Foo extends FooBase {
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

```typescript
import { FooBase } from "./foo-common";

// require the common file and extend the base common implementation
export class Foo extends FooBase {
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

#### Extract the platform specific implementation in a separate Facade and aggregate/use it within the JavaScript implementation

_Example:_ [file-system module](tns-core-modules/file-system) (_Note:_ `file-system-access` is the platform specific implementation)

**Declaration file (foo.d.ts):**

```typescript
export class Foo {
    public running: number;
    public start(): void;
    public stop(): void;
}
```

**Native Implementation Declaration file (foo-native.d.ts):**

```typescript
//@private
// The above statement marks this definition as private so that it is not visible to the users

export function startNative();
export function stopNative();
```

**Android Native Implementation  file (foo-native.android.ts):**

```typescript
export function startNative(){
    // call native code here
}
export function stopNative(){
    // call native code here
}
```

**iOS Native Implementation  file (foo-native.ios.ts):**

```typescript
export function startNative(){
    // call native code here
}
export function stopNative(){
    // call native code here
}
```

**Common implementation file (foo.ts):**

```typescript
import { FooBase as FooDefinition } from ".";
import { startNative, stopNative } from "./foo-native";

// require the definition and put implements clause to ensure API consistency between the declaration and implementation
export class Foo implements FooDefinition {
  public running: number;
  public start(): void {
      this.running = true;
      // do the native call through the Facade
      startNative();
  }
  public stop(): void {
      this.running = false;
      // do the native call through the Facade
      stopNative();
  }
}
```
