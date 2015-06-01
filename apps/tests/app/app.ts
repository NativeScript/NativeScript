import application = require("application");
application.mainModule = "app/mainPage";

application.on(application.launchEvent, function (args: application.ApplicationEventData) {
    console.log("launchEvent, iOS: " + args.ios + ", Android: " + args.android);
});

application.on(application.uncaughtErrorEvent, function (args: application.ApplicationEventData) {
    console.log("uncaughtErrorEvent, iOS: " + args.ios + ", Android: " + args.android);
});

application.on(application.suspendEvent, function (args: application.ApplicationEventData) {
    console.log("suspendEvent, iOS: " + args.ios + ", Android: " + args.android);

});

application.on(application.resumeEvent, function (args: application.ApplicationEventData) {
    console.log("resumeEvent, iOS: " + args.ios + ", Android: " + args.android);
});

application.on(application.exitEvent, function (args: application.ApplicationEventData) {
    console.log("exitEvent, iOS: " + args.ios + ", Android: " + args.android);
});

application.on(application.lowMemoryEvent, function (args: application.ApplicationEventData) {
    console.log("exitEvent, iOS: " + args.ios + ", Android: " + args.android);

});

application.start();
