import * as application from "application";
import * as fps from "fps-meter";
fps.addCallback(function (fps, minFps) {
    console.info("fps=" + fps + " minFps=" + minFps);
});
fps.start();

// Start the application
application.start({ moduleName: "cuteness.io/main-page" });
