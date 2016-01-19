import application = require("application");

// Needed only for build infrastructure
application.cssFile = "app.css";

application.start({ moduleName: "main-page" });
