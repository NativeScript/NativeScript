import { AppiumDriver, createDriver, SearchOptions } from "nativescript-dev-appium";
import { assert } from "chai";

describe("sample scenario", () => {
    let driver: AppiumDriver;

    before(async () => {
        driver = await createDriver();
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

    it("should change root view", async () => {
        const btnChangeRootView = await driver.findElementByText("Change Root View", SearchOptions.exact);
        await btnChangeRootView.click();

        const tabFirst = await driver.findElementByText("First", SearchOptions.exact);
        const tabSecond = await driver.findElementByText("Second", SearchOptions.exact);

        assert.isTrue(await tabFirst.isDisplayed());
        assert.isTrue(await tabSecond.isDisplayed());
    });
});