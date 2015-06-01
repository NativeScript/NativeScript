import application = require("application");
application.mainModule = "app/mainPage";

application.on(application.launch, function (args: application.ApplicationEventData) {
    console.log("launch, iOS: " + args.ios + ", Android: " + args.android);
});

application.on(application.uncaughtError, function (args: application.ApplicationEventData) {
    console.log("uncaughtError, iOS: " + args.ios + ", Android: " + args.android);
});

application.on(application.suspend, function (args: application.ApplicationEventData) {
    console.log("suspend, iOS: " + args.ios + ", Android: " + args.android);

});

application.on(application.resume, function (args: application.ApplicationEventData) {
    console.log("resume, iOS: " + args.ios + ", Android: " + args.android);
});

application.on(application.exit, function (args: application.ApplicationEventData) {
    console.log("exit, iOS: " + args.ios + ", Android: " + args.android);
});

application.on(application.lowMemory, function (args: application.ApplicationEventData) {
    console.log("exit, iOS: " + args.ios + ", Android: " + args.android);

});

application.start();
