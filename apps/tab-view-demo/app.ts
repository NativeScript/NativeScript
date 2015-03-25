import application = require("application");

application.mainModule = "mainPage";

import trace = require("trace");
trace.enable();
trace.setCategories(trace.categories.concat(
    trace.categories.Debug
    , "TabView"
    //, trace.categories.Navigation
    //, trace.categories.ViewHierarchy
    //, trace.categories.VisualTreeEvents
    ));

application.start();
