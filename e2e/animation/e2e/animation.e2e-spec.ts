import { AppiumDriver, createDriver, SearchOptions, nsCapabilities } from "nativescript-dev-appium";
import { Screen } from "./screen";
import { assert } from "chai";

describe("animation:", async function () {

    let driver: AppiumDriver;
    let screen: Screen;

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        screen = new Screen(driver);

        await driver.resetApp();
    });

    after(async function () {
        await driver.quit();
        console.log("Quit driver!");
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logPageSource(this.currentTest.title);
            await driver.logScreenshot(this.currentTest.title);
        }
    });

    it("should navigate to chaining with animation set example", async function () {
        await screen.loadedHome();
        await screen.loadedChainingWithAnimationSet();
    });

    it("should play animation sequentially", async function () {
        const buttonAnimate = await driver.findElementByText("Animate Sequentially", SearchOptions.exact);
        await buttonAnimate.click();

        const label = await driver.findElementByText("{{N4}}", SearchOptions.exact);
        assert.isTrue(await label.isDisplayed());
    });

    it("should reset example", async () => {
        const buttonReset = await driver.findElementByText("Reset", SearchOptions.exact);
        await buttonReset.click();

        const label = await driver.findElementByText("{N4}", SearchOptions.exact);
        assert.isTrue(await label.isDisplayed());
    });

    it("should play animation simultaneously", async function () {
        const button = await driver.findElementByText("Animate Simultaneously", SearchOptions.exact);
        await button.click();

        const label = await driver.findElementByText("{{N4}}", SearchOptions.exact);
        assert.isTrue(await label.isDisplayed());
    });
});
