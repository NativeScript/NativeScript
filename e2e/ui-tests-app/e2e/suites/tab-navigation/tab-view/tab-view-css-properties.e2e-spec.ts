import { nsCapabilities, createDriver, AppiumDriver, Direction } from "nativescript-dev-appium";
import { TabViewBasePage } from "./tab-view-base-page";
import { ImageOptions } from "nativescript-dev-appium/lib/image-options";
import { Platform } from "mobile-devices-controller";
import { ElementCacheStrategy } from "../../../helpers/navigation-helper";

const suite = "tabs";
const spec = "tab-view";

describe(`${suite}-${spec}-css-suite`, async function () {
    let driver: AppiumDriver;
    let tabViewBasePage: TabViewBasePage;

    const samples = [
        "tab-text-color: green;",
        "tab-background-color: yellow;",
        "selected-tab-text-color: red;",
        "android-selected-tab-highlight-color: orange;",
        "text-transform: uppercase;",
        "text-transform: lowercase;",
        "text-transform: none;",
        "all",
        "reset"];

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        await driver.resetApp();
        tabViewBasePage = new TabViewBasePage(driver, ElementCacheStrategy.onload);
        await tabViewBasePage.init("tabViewCss");
    });

    after(async function () {
        await tabViewBasePage.endSuite();
    });

    beforeEach(function () {
        tabViewBasePage.imageHelper.setImageName(suite, spec, this.currentTest.title);
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
            await driver.resetApp();
            await tabViewBasePage.initSuite();
        }
    });

    for (let index = 0; index < samples.length; index++) {
        const sample = samples[index];
        const imageName = `${spec}-${sample.replace(/[^a-z]/ig, "-").replace(/(-+)/ig, "-").replace(/(_+)/ig, "_").replace(/-$/, "")}`;
        it(imageName, async function () {
            if (driver.platformName === Platform.ANDROID
                && (sample === "All" || sample === "reset")) {
                await driver.scroll(Direction.down, 400, 200, 300, 200);
            }
            const scenarioBtn = await driver.waitForElement(sample);
            await scenarioBtn.click();
            await driver.wait(2000);
            await tabViewBasePage.imageHelper.compareScreen({ imageName: imageName, timeOutSeconds: 5, tolerance: 0, toleranceType: ImageOptions.pixel });
            if (sample === "All") {
                const tabTwo = await driver.waitForElement("twO");
                await driver.wait(2000);

                await tabViewBasePage.imageHelper.compareElement(tabTwo, { timeOutSeconds: 5, tolerance: 0, toleranceType: ImageOptions.pixel });
            }
            tabViewBasePage.imageHelper.assertImages();
        });
    }
});