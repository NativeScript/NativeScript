import * as application from "tns-core-modules/application";
import * as trace from "tns-core-modules/trace";

trace.setCategories(trace.categories.Layout);
trace.enable();

application.run({ moduleName: "app-root" });
