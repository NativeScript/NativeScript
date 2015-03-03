export var test_DummyTestForSnippetOnly0 = function () {
    // <snippet module="console" title="console">
    // # Console
    // ### Logging
    // Logging to the console does not require the "console" module since the console variable is global. It can be used anywhere within your code.
    // You can log your message in several different categories.
    // ``` JavaScript
    //// Verbously logs a message.
    console.log("Hello, world!");
    console.info("I am NativeScript");
    console.warn("Low memory");
    console.error("Uncaught Application Exception");
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly1 = function () {
    // <snippet module="console" title="console">
    // ### Time
    // ``` JavaScript
    //// Begins counting a time span for a given name (key).
    console.time("LoadTime");
    //// Do something...
    //// Ends a previously started time span through the time method.
    console.timeEnd("LoadTime");
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly2 = function () {
    // <snippet module="console" title="console">
    // ### Assert
    // ``` JavaScript
    //// Asserts a boolean condition and prints a message in case the assert fails.
    console.assert(2 === 2, "2 equals 2");
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly3 = function () {
    // <snippet module="console" title="console">
    // ### Dir
    // ``` JavaScript
    //// Prints the state of the specified object to the console.
    var obj = {name: "John", age: 34};
    console.dir(obj);
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly4 = function () {
    // <snippet module="console" title="console">
    // ### Dump
    // ``` JavaScript
    //// Prints the state of the specified object to the console.
    var obj = { name: "John", age: 34 };
    console.dump(obj);
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly5 = function () {
    // <snippet module="console" title="console">
    // ### Trace
    // ``` JavaScript
    //// Prints the current stack trace in the console.
    console.trace();
    // ```
    // </snippet>
}