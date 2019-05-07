import { startServer, stopServer, ITestReporter, nsCapabilities, LogImageType, AppiumDriver, createDriver } from "nativescript-dev-appium";
const addContext = require("mochawesome/addContext");

const testReporterContext = <ITestReporter>{};
testReporterContext.name = "mochawesome";
testReporterContext.reportDir = "mochawesome-report";
testReporterContext.log = addContext;
testReporterContext.logImageTypes = [LogImageType.screenshots];
nsCapabilities.testReporter = testReporterContext;
let driver: AppiumDriver;

before("start server", async function () {
    nsCapabilities.testReporter.context = this;
    await startServer();
    driver = await createDriver();
    await driver.setDontKeepActivities(true);
});

after("stop server", async function () {
    await driver.setDontKeepActivities(false);
    await driver.quit();
    await stopServer();
});
