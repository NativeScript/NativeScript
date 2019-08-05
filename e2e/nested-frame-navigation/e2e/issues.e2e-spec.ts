import { AppiumDriver, createDriver, nsCapabilities } from "nativescript-dev-appium";

import { suspendTime, dontKeepActivities } from "./config";
import { Screen, somePage } from "./screen";

describe("issues", async function () {
    let driver: AppiumDriver;
    let screen: Screen;

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        screen = new Screen(driver);
        if (dontKeepActivities) {
            await driver.setDontKeepActivities(true);
        }
    });

    after(async function () {
        if (dontKeepActivities) {
            await driver.setDontKeepActivities(false);
        }
        await driver.quit();
        console.log("Quit driver!");
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
            await driver.resetApp();
        }
    });

    it("issues: 6488, 7594", async function () {
        const navigateToSomePage = async function () {
            const somePageBtn = await driver.waitForElement(somePage);
            await somePageBtn.tap();
            await screen.loadedSomePage();
        };

        await screen.loadedHome();
        await navigateToSomePage();

        await driver.navBack();
        await screen.loadedHome();

        await driver.backgroundApp(suspendTime);

        await navigateToSomePage();
        await driver.navBack();
        await screen.loadedHome();

        await navigateToSomePage();
        await driver.navBack();
        await screen.loadedHome();
    });
});
