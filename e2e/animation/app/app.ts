import * as application from "tns-core-modules/application";

import { enable, setCategories, categories } from "tns-core-modules/trace"
setCategories(categories.Animation);
enable();

application.run({ moduleName: "app-root" });
