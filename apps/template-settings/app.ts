import application = require("application");

// Remove this in the AppBuilder templates
application.cssFile = "./app.css"

application.mainModule = "main-page";
application.start();
