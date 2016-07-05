import application = require("application");

// Needed only for build infrastructure
application.cssFile = "gallery-app/app.css";

application.start({ moduleName: "gallery-app/main-page" });
