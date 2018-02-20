import { AppiumDriver, createDriver, SearchOptions } from "nativescript-dev-appium";
import { assert } from "chai";
import { Screen } from "./screen"

const TIME = 5;

describe("app root modal frame background scenarios", () => {

    let driver: AppiumDriver;
    let screen: Screen;

    before(async () => {
        driver = await createDriver();
        screen = new Screen(driver);
        // should load app root
        await screen.loaded();
    });

    beforeEach(async function () {
        try {
            await screen.loadedModalFrame();
        } catch (err) {
            // should show modal page with frame
            await screen.showModalFrame();
            await screen.loadedModalFrame();
        }
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logPageSource(this.currentTest.title);
            await driver.logScreenshot(this.currentTest.title);
            await driver.resetApp();
        }
    });

    after(async () => {
        // should close page with frame
        await screen.closeModal();
        await screen.loaded();

        await driver.quit();
        console.log("Quit driver!");
    });

    it("should run modal page with frame in background", async () => {
        await driver.backgroundApp(TIME);
        await screen.loadedModalFrame();
    });

    it("should navigate to second page, run in background, go back", async () => {
        await screen.navigateToSecondPage();
        await screen.loadedSecondPage();

        await driver.backgroundApp(TIME);
        await screen.loadedSecondPage();

        await screen.goBackFromSecondPage();
        await screen.loadedModalFrame();
    });

    it("should show nested modal page with frame, run in background, close", async () => {
        await screen.showNestedModalFrame();
        await screen.loadedNestedModalFrame();

        await driver.backgroundApp(TIME);
        await screen.loadedNestedModalFrame();

        await screen.closeModalNested();
        await screen.loadedModalFrame();
    });

    it("should show nested modal page, run in background, close", async () => {
        await screen.showNestedModalPage();
        await screen.loadedNestedModalPage();

        await driver.backgroundApp(TIME);
        await screen.loadedNestedModalPage();

        await screen.closeModalNested();
        await screen.loadedModalFrame();
    });

    it("should navigate to second page, run in background, go back", async () => {
        await screen.navigateToSecondPage();
        await screen.loadedSecondPage();

        await driver.backgroundApp(TIME);
        await screen.loadedSecondPage();

        await screen.goBackFromSecondPage();
        await screen.loadedModalFrame();
    });
});