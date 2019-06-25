import { AppiumDriver, createDriver, nsCapabilities } from "nativescript-dev-appium";
import { Screen, driverDefaultWaitTime } from "./screen";
import {
    roots,
    modalPageBackground,
    testNestedModalFrameBackground,
    testNestedModalPageBackground,
    testDialogBackground
} from "./shared.e2e-spec";

describe("modal-page:", async function () {

    let driver: AppiumDriver;
    let screen: Screen;

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        driver.defaultWaitTime = driverDefaultWaitTime;
        screen = new Screen(driver);
    });

    for (let index = 0; index < roots.length; index++) {
        const root = roots[index];
        describe(`${root} modal page background scenarios:`, async function () {

            before(async function () {
                nsCapabilities.testReporter.context = this;
                if (driver.isAndroid) {
                    await driver.resetApp();
                }
                await screen[root]();
            });

            beforeEach(async function () {
                await screen.loadModalPage();
            });

            afterEach(async function () {
                if (this.currentTest.state === "failed") {
                    await driver.logTestArtifacts(this.currentTest.title);
                    await driver.resetApp();
                    await screen[root]();
                }
            });

            after(async function () {
                await screen.closeModal();
                await screen.loadedHome();
            });

            it("should show dialog confirm, run in background", async function () {
                await testDialogBackground(driver, screen, false);
            });

            it("should run modal page in background", async function () {
                await modalPageBackground(driver, screen, false);
            });

            it("should show nested modal page with frame, run in background, close", async function () {
                await testNestedModalFrameBackground(driver, screen, false);
            });

            it("should show nested modal page, run in background, close", async function () {
                await testNestedModalPageBackground(driver, screen, false);
            });
        });
    }
});
