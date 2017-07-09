import * as application from "tns-core-modules/application";

// Needed only for build infrastructure
application.setCssFileName("devtools-app/app.css");

application.start({ moduleName: "devtools-app/main-page" });
