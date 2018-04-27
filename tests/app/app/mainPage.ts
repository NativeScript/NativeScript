import { Page } from "tns-core-modules/ui/page";
import * as trace from "tns-core-modules/trace";
import * as tests from "../testRunner";

trace.enable();
trace.addCategories(trace.categories.Test + "," + trace.categories.Error);

// When debugging
// trace.setCategories(trace.categories.concat(
//    trace.categories.Test,
//    trace.categories.Navigation,
//    trace.categories.Transition,
//    trace.categories.NativeLifecycle,
//    trace.categories.ViewHierarchy,
//    trace.categories.VisualTreeEvents
// ));

function runTests() {
    setTimeout(() => tests.runAll(""), 10);
}

export function onNavigatedTo(args) {
    args.object.off(Page.loadedEvent, onNavigatedTo);

    runTests();
}
