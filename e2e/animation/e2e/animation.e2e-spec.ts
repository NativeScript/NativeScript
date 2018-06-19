import { AppiumDriver, createDriver, SearchOptions } from "nativescript-dev-appium";
import { Screen } from "./screen";
import { assert } from "chai";

describe("animation:", () => {

    let driver: AppiumDriver;
    let screen: Screen;

    before(async () => {
        driver = await createDriver();
        screen = new Screen(driver);

        await driver.resetApp();
    });

    after(async () => {
        await driver.quit();
        console.log("Quit driver!");
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logPageSource(this.currentTest.title);
            await driver.logScreenshot(this.currentTest.title);
        }
    });

    it("should play sequentially", async () => {
        await screen.loadedHome();

        const button = await driver.findElementByText("Play Sequential Animation With Translate", SearchOptions.exact);
        await button.click();

        const label = await driver.findElementByText("Label1 animated sequentially!", SearchOptions.exact);
        assert.isTrue(await label.isDisplayed()); 
    });

    it("should play simultaneously", async () => {
        await screen.loadedHome();

        const button = await driver.findElementByText("Play Simultaneous Animation With Translate", SearchOptions.exact);
        await button.click();

        const label = await driver.findElementByText("Label2 animated simultaneously!", SearchOptions.exact);
        assert.isTrue(await label.isDisplayed()); 
    });
});
