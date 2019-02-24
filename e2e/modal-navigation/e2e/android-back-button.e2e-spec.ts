import { AppiumDriver, createDriver, SearchOptions } from "nativescript-dev-appium";
import { Screen, driverDefaultWaitTime, elementDefaultWaitTimeInSeconds } from "./screen"
import { assert } from "chai";

const exampleAndroidBackBtnEvents = "Android Back Btn Events";

describe("android-navigate-back", () => {
    let driver: AppiumDriver;
    let screen: Screen;

    before(async () => {
        driver = await createDriver();
        driver.defaultWaitTime = driverDefaultWaitTime;
        screen = new Screen(driver);
        const btnShowNestedModalFrame = await driver.findElementByText(exampleAndroidBackBtnEvents);
        await btnShowNestedModalFrame.click();
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
        }
    });

    after(async () => {
        await driver.resetApp();
    });

    it("should skip first navigate back", async function () {
        if (driver.isIOS) {
            this.skip();
        }

        await driver.navBack();
        const textElement = await driver.findElementsByText("will cancel next back press: false", SearchOptions.contains, elementDefaultWaitTimeInSeconds);
        assert.isTrue(textElement !== null);
        await driver.navBack();
        await screen.loadedHome();
    })
})