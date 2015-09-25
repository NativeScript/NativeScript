import application = require("application");
import navPageModule = require("../nav-page");

import trace = require("trace");
trace.enable();
trace.setCategories(trace.categories.concat(
    trace.categories.NativeLifecycle
    , trace.categories.Navigation
));

application.mainEntry = {
    create: function () {
        return new navPageModule.NavPage(0);
    }
    //backstackVisible: false,
    //clearHistory: true
};
application.start();
