import application = require("application");
import navPageModule = require("../nav-page");

import trace = require("trace");
trace.enable();
trace.setCategories(trace.categories.concat(
    trace.categories.NativeLifecycle,
    trace.categories.Navigation,
    //trace.categories.Animation,
    trace.categories.Transition
));

application.mainEntry = {
    create: function () {
        return new navPageModule.NavPage({
            index: 0,
            backStackVisible: true,
            clearHistory: false,
            animated: true,
            transition: 0,
            curve: 0,
            duration: 0,
        });
    }
    //backstackVisible: false,
    //clearHistory: true
};
application.start();
