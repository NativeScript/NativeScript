// <snippet module="trace" title="trace">
// # Trace
// Tracing information about your app requires the "trace" module.
// ``` JavaScript
import trace = require("trace");
// ```
// </snippet>

export var test_DummyTestForSnippetOnly0 = function () {
    // <snippet module="trace" title="trace">
    // ### Tracing all categories of events.
    // ``` JavaScript
    trace.setCategories(trace.categories.All);
    trace.enable();
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly1 = function () {
    // <snippet module="trace" title="trace">
    // ### Tracing specific categories of events.
    // ``` JavaScript
    trace.setCategories(trace.categories.concat(
        trace.categories.Binding
        , trace.categories.Debug
        , trace.categories.Layout
        , trace.categories.NativeLifecycle
        , trace.categories.Navigation
        , trace.categories.Style
        , trace.categories.ViewHierarchy
        , trace.categories.VisualTreeEvents
        ));
    trace.enable();
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly2 = function () {
    // <snippet module="trace" title="trace">
    // ### Write your own trace message.
    // ``` JavaScript
    trace.setCategories(trace.categories.Debug);
    trace.enable();
    trace.write("My Debug Message", trace.categories.Debug);
    // ```
    // </snippet>
}