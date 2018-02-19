import { AppiumDriver, createDriver, SearchOptions } from "nativescript-dev-appium";
import { assert } from "chai";
import { Screen } from "./screen"

describe("app root modal frame scenarios", () => {

    let driver: AppiumDriver;
    let screen: Screen;

    before(async () => {
        driver = await createDriver();
        screen = new Screen(driver);
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logPageSource(this.currentTest.title);
            await driver.logScreenshot(this.currentTest.title);
        }
    });

    after(async () => {
        await driver.quit();
        console.log("Quit driver!");
    });

    it("should load app root", async () => {
        await screen.loaded();
    });

    it("should show modal page with frame", async () => {
        await screen.showModalFrame();
    });

    it("should navigate to second page", async () => {
        await screen.navigateToSecondPage();
    });

    it("should navigate back from second page", async () => {
        await screen.goBackFromSecondPage();
    });

    it("should show nested modal page with frame", async () => {
        await screen.showNestedModalFrame();
    });

    it("should close nested modal page with frame", async () => {
        await screen.closeModalNested();
    });

    it("should show nested modal page", async () => {
        await screen.showNestedModalPage();
    });

    it("should close nested modal page", async () => {
        await screen.closeModalNested();
    });

    it("should navigate to second page again", async () => {
        await screen.navigateToSecondPage();
    });

    it("should navigate back from second page again", async () => {
        await screen.goBackFromSecondPage();
    });

    it("should close page with frame", async () => {
        await screen.closeModal();
    });
});