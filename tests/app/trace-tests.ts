// >> trace-require
import * as trace from "trace";
// << trace-require

export var test_DummyTestForSnippetOnly0 = function () {
    // >> trace-all-categories
    trace.setCategories(trace.categories.All);
    trace.enable();
    // << trace-all-categories
}

export var test_DummyTestForSnippetOnly1 = function () {
    // >> trace-specific-categories
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
    // << trace-specific-categories
}

export var test_DummyTestForSnippetOnly2 = function () {
    // >> trace-message
    trace.setCategories(trace.categories.Debug);
    trace.enable();
    if (trace.enabled) {
        trace.write("My Debug Message", trace.categories.Debug);
    }
    // << trace-message
}