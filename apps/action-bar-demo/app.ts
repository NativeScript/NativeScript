import application = require("application");
application.mainModule = "main-page";

// Needed only for build infrastructure
application.cssFile = "app.css";

application.start();
