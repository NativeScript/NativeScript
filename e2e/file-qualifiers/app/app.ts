import * as application from "tns-core-modules/application";
import { setCategories, categories, enable } from "tns-core-modules/trace";

setCategories(categories.Livesync);
enable();

application.run({ moduleName: "app-root" });
