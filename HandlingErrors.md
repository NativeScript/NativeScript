# Handling Errors in NativeScript Core Modules

One big difference between web-app and NativeScript app is that throwing an `Error` in NativeScript app causes the app to **crash**. Such crashes can be a serious problem for a production applications as they hurt the application credibility and drive away customers.

We want to provide the application developers with the flexibility to handle errors differently in *development* and *production* modes.

## Using the Trace Module
The `tns-core-modules/trace` utility module provides a good way to streamline error logging and handling throughout the framework. It gives application developers a way to define custom `TraceWriter`s and `ErrorHandler`s for their apps and even specify different sets of those to be used in during development and in production.

Here are the guidelines how to use this when contributing to core-modules or creating your own plugins.

### Use `trace.write()`
Use trace.write() with the appropriate type to log non critical errors. 

>Note: For the `error` message level all loggers will be notified unconditionally, for all other levels (`log`,`info`,`warn`), tracing should be enabled and the corresponding categories should be added.

### Use `trace.error()`
Using `trace.error()` gives the user of you API for a [flexible way of handling the errors](https://github.com/NativeScript/NativeScript/issues/5914).

Use the `error()` when an error has occurred which compromises the stability of the app. The default `ErrorHandler` provided in the `trace` module will throw the error which will include the stack trace and information useful for debugging during development. Application developers can handle this error using a custom `ErrorHandler` in production and decide if they should trigger a crash, send an error report, try to recover the application in other way or combination of those. 

After calling `trace.error()` consider just returning from the function you are currently in without completing. 

There are cases when code execution jumps between native code (ex. Android/iOS SDKs) and JavaScript trough callbacks. In those cases it is most difficult to determine if an error (ex. expected argument is `undefined` or current state of components is invalid) is critical or not. Although, it seems that error is unrecoverable, it might be the case that the callback is called when the app has gone to the background or trough activity/window that is not longer visible. So just reporting the error with `write()` or `error()` is a good option in such cases.


## Throw the Error directly in code
Avoid throwing errors directly, especially in code that is not directly called from application developers (for example in properties set in markup/CSS or in callbacks called form native code). This will cause a crash and usually it will be hard for users of the code to `try/catch` and handle the error. Resort to throwing for cases when: 

1. Continuing execution will cause data loss or corruption. Compromising future runs of the application or persisting corrupt data is even worse than crashing.
2. Obviously misused public APIs (ex. wrong arguments types) which developers will call directly.  

## Clearing Legacy Code
Not all the code in the `tns-core-modules` might conform to this guide as it might be written before some of the improvements of the trace modules (ex. `error()`). If you came across to such code you can always [give us a PR](CONTRIBUTING.md) referencing [this issue](https://github.com/NativeScript/NativeScript/issues/5914).

 
