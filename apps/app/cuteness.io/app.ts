import * as application from "tns-core-modules/application";

// Start the application
global.registerModule("cuteness.io/app.css", () => require("~/cuteness.io/app.css"));
application.setCssFileName("cuteness.io/app.css");
application.run({ moduleName: "cuteness.io/app-root" });
