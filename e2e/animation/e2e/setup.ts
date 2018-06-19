import { AppiumDriver, createDriver, startServer, stopServer } from "nativescript-dev-appium";

let driver: AppiumDriver;

before("start server", async () => {
    await startServer();
    driver = await createDriver();
    await driver.setDontKeepActivities(true);
});

after("stop server", async () => {
    await driver.setDontKeepActivities(false);
    await driver.quit();
    await stopServer();
});
