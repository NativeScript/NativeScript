import { AppiumDriver, createDriver } from "nativescript-dev-appium";
import { Screen } from "./screen"
import {
    roots,
    modalFrameBackground,
    testSecondPageBackground,
    testSecondPageClose,
    testNestedModalFrameBackground,
    testNestedModalPageBackground
} from "./shared.e2e-spec"

describe("modal-frame:", () => {

    let driver: AppiumDriver;
    let screen: Screen;

    before(async () => {
        driver = await createDriver();
        screen = new Screen(driver);
    });

    roots.forEach(root => {
        describe(`${root} modal frame background scenarios:`, () => {

            before(async () => {
                await screen[root]();
            });

            beforeEach(async function () {
                await screen.loadModalFrame();
            });

            afterEach(async function () {
                if (this.currentTest.state === "failed") {
                    await driver.logPageSource(this.currentTest.title);
                    await driver.logScreenshot(this.currentTest.title);
                    await driver.resetApp();
                    await screen[root]();
                }
            });

            after(async () => {
                await screen.closeModal();
                await screen.loadedHome();
            });

            it("should run modal page with frame in background", async () => {
                await modalFrameBackground(driver, screen);
            });

            it("should navigate to second page, run in background, go back", async () => {
                await testSecondPageBackground(driver, screen);
            });

            it("should show nested modal page with frame, run in background, close", async () => {
                await testNestedModalFrameBackground(driver, screen);
            });

            it("should show nested modal page, run in background, close", async () => {
                await testNestedModalPageBackground(driver, screen);
            });

            it("should navigate to second page, close", async () => {
                await testSecondPageClose(driver, screen);
            });

            it("should navigate to second page, run in background, go back", async () => {
                await testSecondPageBackground(driver, screen);
            });
        });
    });
});
