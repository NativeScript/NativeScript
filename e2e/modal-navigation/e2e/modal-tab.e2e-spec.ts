import { AppiumDriver, createDriver, nsCapabilities } from "nativescript-dev-appium";
import { Screen, driverDefaultWaitTime } from "./screen"
import {
    roots,
    modalFrameBackground,
    modalTabViewBackground,
    testSecondPageBackground,
    testSecondPageClose,
    testNestedModalFrameBackground,
    testNestedModalPageBackground,
    testSecondItemBackground,
    testDialogBackground
} from "./shared.e2e-spec"

describe("modal-tab:", () => {

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

        describe(`${root} modal tab view background scenarios:`, () => {
            before(async function () {
                nsCapabilities.testReporter.context = this;
                if (driver.isAndroid) {
                    await driver.resetApp();
                }
                await screen[root]();
            });

            beforeEach(async function () {
                await screen.loadModalTabView();
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
                await testDialogBackground(driver, screen);
            });

            it("should run modal tab view in background", async function () {
                await modalTabViewBackground(driver, screen);
            });

            it("should navigate to second page, run in background, go back", async function () {
                await testSecondPageBackground(driver, screen);
            });

            it("should show nested modal page with frame, run in background, close", async function () {
                await testNestedModalFrameBackground(driver, screen);
            });

            it("should show nested modal page, run in background, close", async function () {
                await testNestedModalPageBackground(driver, screen);
            });

            it("should navigate to second item, run in background, navigate back to first item", async function () {
                await testSecondItemBackground(driver, screen);
            });

            it("should navigate to second page, close", async function () {
                await testSecondPageClose(driver, screen);
            });

            it("should navigate to second page, run in background, go back", async function () {
                await testSecondPageBackground(driver, screen);
            });
        });
    };
});
