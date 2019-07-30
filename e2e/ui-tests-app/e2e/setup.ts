import { startServer, stopServer, ITestReporter, nsCapabilities, LogImageType } from "nativescript-dev-appium";
const addContext = require("mochawesome/addContext");

const testReporterContext = <ITestReporter>{};
testReporterContext.name = "mochawesome";
testReporterContext.reportDir = "mochawesome-report";
testReporterContext.log = addContext;
nsCapabilities.testReporter = testReporterContext;

before("start server", async function () {
    nsCapabilities.testReporter.context = this;
    await startServer();
});

after("stop server", async function () {
    nsCapabilities.testReporter.context = this;
    await stopServer();
});
