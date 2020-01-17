import { nsCapabilities, createDriver, AppiumDriver, Direction, logError } from "nativescript-dev-appium";
import { TabViewBasePage } from "./tab-view-base-page";
import { ImageOptions } from "nativescript-dev-appium/lib/image-options";
import { Platform } from "mobile-devices-controller";
import { ElementCacheStrategy } from "../../../helpers/navigation-helper";
import { setImageName } from "../../../helpers/image-helper";
import { assert } from "chai";

const suite = "tab-navigation";
const spec = "tab-view-css";

describe(`${suite}-${spec}-suite`, async function () {
    let driver: AppiumDriver;
    let tabViewBasePage: TabViewBasePage;

    const samples = [
        { sample: "tab-text-color: green;", tab1: "IteM onE", tab2: "IteM twO" },
        { sample: "tab-background-color: yellow;", tab1: "IteM onE", tab2: "IteM twO" },
        { sample: "selected-tab-text-color: red;", tab1: "IteM onE", tab2: "IteM twO" },
        { sample: "android-selected-tab-highlight-color: orange;", tab1: "IteM onE", tab2: "IteM twO" },
        { sample: "text-transform: uppercase;", tab1: "IteM onE", tab2: "IteM twO" },
        { sample: "text-transform: lowercase;", tab1: "IteM onE", tab2: "IteM twO" },
        { sample: "text-transform: capitalize;", tab1: "IteM onE", tab2: "IteM twO" },
        { sample: "text-transform: none;", tab1: "IteM onE", tab2: "IteM twO" },
        { sample: "all", tab1: "IteM onE", tab2: "IteM twO" },
        { sample: "reset", tab1: "IteM onE", tab2: "IteM twO" },
    ];

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        await driver.restartApp();
        tabViewBasePage = new TabViewBasePage(driver, ElementCacheStrategy.none);
        await tabViewBasePage.init("tabViewCss");
    });

    after(async function () {
        await tabViewBasePage.endSuite();
    });

    afterEach(async function () {
        // Fixes crashes when we try to apply some css. all -> reset
        if (driver.isAndroid) {
            await tabViewBasePage.navigateBackToSuitMainPage();
            await tabViewBasePage.navigateToSample("tabViewCss");
        }

        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
            await driver.resetApp();
            await tabViewBasePage.initSuite();
        }
    });

    for (let index = 0; index < samples.length; index++) {
        const sample = samples[index];
        let imageName = `${spec}-${sample.sample.replace(/[^a-z]/ig, "-").replace(/(-+)/ig, "-").replace(/(_+)/ig, "_").replace(/-$/, "")}`;
        it(imageName, async function () {
            if (driver.isIOS && imageName.includes("android")) {
                this.skip();
            }
            let scenarioBtn = await driver.waitForElement(sample.sample);
            if (!scenarioBtn) {
                await driver.scroll(Direction.up, 400, 200, 300, 200);
                scenarioBtn = await driver.waitForElement(sample.sample);
            }
            await scenarioBtn.click();
            imageName = setImageName(suite, spec, imageName);
            await driver.imageHelper.compareScreen({ imageName: imageName, timeOutSeconds: 5, tolerance: 0, toleranceType: ImageOptions.pixel });
            const tabTwo = await driver.waitForElement(sample.tab2);
            await tabTwo.click();
            await driver.imageHelper.compareScreen({ imageName: imageName, timeOutSeconds: 5 });

            const imageComparisonResult = driver.imageHelper.hasImageComparisonPassed();
            assert.isTrue(imageComparisonResult);

            if (imageComparisonResult) {
                const tabOne = await driver.waitForElement(sample.tab1);
                await tabOne.click();
            }
        });
    }
});
