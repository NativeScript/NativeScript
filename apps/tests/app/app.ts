import application = require("application");
application.mainModule = "app/mainPage";

application.on("onLaunch", function (args) {
    console.log("onLaunch: " + args);
});

application.on("onUncaughtError", function (args) {
    console.log("onUncaughtError: " + args);
});

application.on("onSuspend", function (args) {
    console.log("onSuspend: " + args);
});

application.on("onResume", function (args) {
    console.log("onResume: " + args);
});

application.on("onExit", function (args) {
    console.log("onExit: " + args);
});

application.on("onLowMemory", function (args) {
    console.log("onLowMemory: " + args);
});

application.start();
