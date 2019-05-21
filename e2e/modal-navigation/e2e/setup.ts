import { AppiumDriver, createDriver, startServer, stopServer, LogImageType, ITestReporter, nsCapabilities } from "nativescript-dev-appium";
const addContext = require("mochawesome/addContext");

let driver: AppiumDriver;

const testReporterContext = <ITestReporter>{};
testReporterContext.name = "mochawesome";
testReporterContext.reportDir = "mochawesome-report";
testReporterContext.log = addContext;
testReporterContext.logImageTypes = [LogImageType.screenshots];
nsCapabilities.testReporter = testReporterContext;

before("start server", async function () {
    nsCapabilities.testReporter.context = this;
    await startServer();
    driver = await createDriver();
    await driver.setDontKeepActivities(true);
});

after("stop server", async function () {
    nsCapabilities.testReporter.context = this;
    await driver.setDontKeepActivities(false);
    await driver.quit();
    await stopServer();
});
