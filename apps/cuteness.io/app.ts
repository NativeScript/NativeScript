import application = require("application");
import fps = require("fps-meter");
fps.addCallback(function (fps, minFps) {
    console.info("fps=" + fps + " minFps=" + minFps);
});
fps.start();

// Set the start module for the application
application.mainModule = "main-page";

// Start the application
application.start();
