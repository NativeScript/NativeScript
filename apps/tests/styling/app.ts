import application = require("application");

import trace = require("trace");
trace.enable();
trace.setCategories(trace.categories.concat(
    trace.categories.Layout
//, trace.categories.NativeLifecycle
//, trace.categories.Navigation
//, trace.categories.ViewHierarchy
//, trace.categories.VisualTreeEvents
    ));

application.mainModule = "styling/mainPage";
application.start();
