import application = require("application");

// Remove this in the AppBuilder templates
application.cssFile = "app/template-settings/app.css"

application.mainModule = "app/main-page";
application.start();
