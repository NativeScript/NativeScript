import * as application from "tns-core-modules/application";
import * as trace from "tns-core-modules/trace";
trace.addCategories(
    trace.categories.Transition)
// + "," + 
//     trace.categories.NativeLifecycle + "," + 
//     trace.categories.Navigation);
trace.enable();

// Needed only for build infrastructure
application.setCssFileName("navigation-app/app.css");
application.start({ moduleName: "navigation-app/main-page" });