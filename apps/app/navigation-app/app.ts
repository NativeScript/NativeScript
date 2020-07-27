import {
    setCssFileName,
    start
} from "tns-core-modules/application";
import {
    addCategories,
    categories,
    enable
} from "tns-core-modules/trace";

addCategories(categories.Transition)
// + "," +
//     trace.categories.NativeLifecycle + "," +
//     trace.categories.Navigation);
enable();

// Needed only for build infrastructure
setCssFileName("navigation-app/app.css");
start({ moduleName: "navigation-app/main-page" });
