import {
    setCssFileName as applicationSetCssFileName,
    start as applicationStart
} from "tns-core-modules/application";
import {
    addCategories as traceAddCategories,
    categories as traceCategories,
    enable as traceEnable
} from "tns-core-modules/trace";

traceAddCategories(traceCategories.Transition)
// + "," +
//     trace.categories.NativeLifecycle + "," +
//     trace.categories.Navigation);
traceEnable();

// Needed only for build infrastructure
applicationSetCssFileName("navigation-app/app.css");
applicationStart({ moduleName: "navigation-app/main-page" });
