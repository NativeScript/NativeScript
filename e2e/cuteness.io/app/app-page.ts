import * as application from "tns-core-modules/application";

// Start the application
global.registerModule("app.css", () => require("~/app.css"));
application.setCssFileName("app.css");
application.run({ moduleName: "app-root-page" });
