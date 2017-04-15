import * as application from "tns-core-modules/application";
import * as fps from "tns-core-modules/fps-meter";
fps.addCallback(function (fps, minFps) {
    console.info("fps=" + fps + " minFps=" + minFps);
});
fps.start();

// Start the application
application.start({ moduleName: "cuteness.io/main-page" });
