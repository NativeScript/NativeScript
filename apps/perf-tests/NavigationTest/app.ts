import application = require("application");
import frameModule = require("ui/frame");
import navPageModule = require("../nav-page");

import trace = require("trace");
trace.enable();
trace.setCategories(trace.categories.concat(
    trace.categories.NativeLifecycle
    , trace.categories.Navigation
    , trace.categories.ViewHierarchy
    , trace.categories.VisualTreeEvents
    ));

application.onLaunch = function (context) {
    var frame = new frameModule.Frame();
    var pageFactory = function () {
        return new navPageModule.NavPage(0);
    };
    frame.navigate(pageFactory);
}
