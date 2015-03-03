import application = require("application");
application.mainModule = "app/main-page";

// Remove this in the AppBuilder templates
application.cssFile = "app/template-master-detail/app.css"

application.start();
