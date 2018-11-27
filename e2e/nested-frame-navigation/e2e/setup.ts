import { startServer, stopServer } from "nativescript-dev-appium";

before("start server", async () => {
    await startServer();
});

after("stop server", async () => {
    await stopServer();
});
