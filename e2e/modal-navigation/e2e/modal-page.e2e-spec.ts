import { AppiumDriver, createDriver } from "nativescript-dev-appium";
import { Screen, driverDefaultWaitTime } from "./screen"
import {
    roots,
    modalPageBackground,
    testSecondPageBackground,
    testNestedModalFrameBackground,
    testNestedModalPageBackground,
    testDialogBackground
} from "./shared.e2e-spec"

describe("modal-page:", () => {

    let driver: AppiumDriver;
    let screen: Screen;

    before(async () => {
        driver = await createDriver();
        driver.defaultWaitTime = driverDefaultWaitTime;
        screen = new Screen(driver);
    });

    roots.forEach(root => {
        describe(`${root} modal page background scenarios:`, () => {

            before(async () => {
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

            after(async () => {
                await screen.closeModal();
                await screen.loadedHome();
            });

            it("should show dialog confirm, run in background", async () => {
                await testDialogBackground(driver, screen, false);
            });

            it("should run modal page in background", async () => {
                await modalPageBackground(driver, screen, false);
            });

            it("should show nested modal page with frame, run in background, close", async () => {
                await testNestedModalFrameBackground(driver, screen, false);
            });

            it("should show nested modal page, run in background, close", async () => {
                await testNestedModalPageBackground(driver, screen, false);
            });
        });
    });
});
