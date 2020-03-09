import { AppiumDriver, createDriver, nsCapabilities } from "nativescript-dev-appium";
import { Screen } from "./screen";
import { suspendTime, dontKeepActivities } from "./config";

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

    it("issue-6488", async function () {
        await screen.loadedHome();
        const showSomePage = async function () {
            const somePageBtn = await driver.waitForElement("somePageOnRoot");
            await somePageBtn.tap();
            await screen.loadedSomePage();
        };

        await showSomePage();

        await driver.navBack();
        await screen.loadedHome();

        await driver.backgroundApp(suspendTime);

        await showSomePage();
        await driver.navBack();

        await showSomePage();
        await driver.navBack();

        await screen.loadedHome();
    });
});