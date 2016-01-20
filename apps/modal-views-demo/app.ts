import application = require("application");
import trace = require("trace");
trace.enable();
trace.setCategories(trace.categories.concat(
    trace.categories.Navigation
    //trace.categories.Layout,
    //"LayoutRootView.iOS"
    ));
application.start({ moduleName: "main-page" });
