import application = require("application");

// Set the start module for the application
application.mainModule = "app/main-page";

// TODO: This is only neede because of the deply script.
application.cssFile = "app/TelerikNEXT/app.css";

// Start the application
application.start();
