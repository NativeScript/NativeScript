require("~/ui-tests-app/app-base");
import * as application from "tns-core-modules/application";

console.log("####### ------ RUN APP MODULES USING PAGE AS A ROOT ELEMENT ------ #######");

application.run({ moduleName: "ui-tests-app/main-page" });
