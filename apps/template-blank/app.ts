import application = require("application");
application.mainModule = "main-page";

// Remove this in the AppBuilder templates
application.cssFile = "./app.css"

application.start();
