import application = require("application");
application.mainModule = "app/main-page";

// Remove this in the AppBuilder templates
application.cssFile = "app/template-tab-navigation/app.css"

application.start();
