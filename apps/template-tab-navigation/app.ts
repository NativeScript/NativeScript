import application = require("application");
application.mainModule = "main-page";

// Remove this in the AppBuilder templates
application.cssFile = "template-tab-navigation/app.css"

application.start();
