import * as application from "tns-core-modules/application";

import * as trace from "tns-core-modules/trace";
trace.enable();
trace.setCategories(trace.categories.concat(
    trace.categories.Layout
//, trace.categories.NativeLifecycle
//, trace.categories.Navigation
//, trace.categories.ViewHierarchy
//, trace.categories.VisualTreeEvents
    ));

application.start({ moduleName: "styling/mainPage" });
