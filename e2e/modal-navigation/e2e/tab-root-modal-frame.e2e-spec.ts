import { AppiumDriver, createDriver } from "nativescript-dev-appium";
import { Screen } from "./screen"
import { testSecondPage, testNestedModalFrame, testNestedModalPage } from "./shared-e2e-spec/modal-frame"

describe("tab root modal frame scenarios", () => {

    let driver: AppiumDriver;
    let screen: Screen;

    before(async () => {
        driver = await createDriver();
        screen = new Screen(driver);
        await screen.setTabRootView();
    });

    beforeEach(async function () {
        await screen.loadModalFrame();
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logPageSource(this.currentTest.title);
            await driver.logScreenshot(this.currentTest.title);
            await driver.resetApp();
            await screen.setTabRootView();
        }
    });

    after(async () => {
        // should close page with frame
        await screen.closeModal();
        await screen.loaded();
        await driver.quit();
        console.log("Quit driver!");
    });

    it("should navigate to second page, go back", async () => {
        await testSecondPage(screen);
    });

    it("should show nested modal page with frame, close", async () => {
        await testNestedModalFrame(screen);
    });

    it("should show nested modal page, close", async () => {
        await testNestedModalPage(screen);
    });

    it("should navigate to second page, go back", async () => {
        await testSecondPage(screen);
    });
});