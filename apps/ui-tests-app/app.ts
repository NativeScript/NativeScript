import application = require("application");
application.mainModule = "mainPage";

application.onUncaughtError = function (error: application.NativeScriptError) {
    console.warn(error.message);
    if (error.nativeError) {
        console.warn("native error: " + error.nativeError);
    }
}

application.start();
