import * as application from "application";

// Needed only for build infrastructure
application.setCssFileName("gallery-app/app.css");

application.start({ moduleName: "gallery-app/main-page" });
