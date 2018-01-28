require("~/ui-tests-app/app-base");
import * as application from "tns-core-modules/application";

console.log("####### ------ START APP MODULES USING PAGE AS A ROOT ELEMENT ------ #######");

application.start({ moduleName: "ui-tests-app/main-page" });
