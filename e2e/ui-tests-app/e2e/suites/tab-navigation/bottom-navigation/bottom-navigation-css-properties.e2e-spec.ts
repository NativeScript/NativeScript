import { nsCapabilities, createDriver, AppiumDriver, Direction } from "nativescript-dev-appium";
import { BottomNavigationBasePage } from "./bottom-navigation-base-page";
import { Platform } from "mobile-devices-controller";
import { setImageName } from "../../../helpers/image-helper";
import { assert } from "chai";

const suite = "tab-navigation";
const spec = "bottom-navigation-css";
const imagePrefix = `${suite}-${spec}`;

describe(`${imagePrefix}-suite`, async function () {
    let driver: AppiumDriver;
    let bottomNavigationBasePage: BottomNavigationBasePage;

    const samples = [
        { sample: "text-transform: uppercase;", tab1: "IteM onE", tab2: "IteM twO" },
        { sample: "text-transform: lowercase;", tab1: "IteM onE", tab2: "IteM twO" },
        { sample: "text-transform: capitalize;", tab1: "IteM onE", tab2: "IteM twO" },
        { sample: "text-transform: none;", tab1: "IteM onE", tab2: "IteM twO" },
        { sample: "reset", tab1: "IteM onE", tab2: "IteM twO" },
    ];

    before(async function () {
        this.skip();
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        await driver.restartApp();
        bottomNavigationBasePage = new BottomNavigationBasePage(driver);
        await bottomNavigationBasePage.init("css-text-transform");
    });

    after(async function () {
        this.skip();
        await bottomNavigationBasePage.endSuite();
    });

    afterEach(async function () {
        this.skip();
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
            await driver.restartApp();
            await bottomNavigationBasePage.initSuite();
        }
    });

    for (let index = 0; index < samples.length; index++) {
        const sample = samples[index];
        let imageName = `${spec}-${sample.sample.replace(/[^a-z]/ig, "-").replace(/(-+)/ig, "-").replace(/(_+)/ig, "_").replace(/-$/, "")}`;
        it(imageName, async function () {
            this.skip();
            if (driver.platformName === Platform.ANDROID
                && (sample.sample.toLowerCase() === "all"
                    || sample.sample.toLowerCase() === "reset")) {
                await driver.scroll(Direction.down, 400, 200, 300, 200);
            }
            const scenarioBtn = await driver.waitForElement(sample.sample);
            await scenarioBtn.click();
            imageName = setImageName(suite, spec, imageName);
            await driver.imageHelper.compareScreen({ imageName: imageName });
            const tabTwo = await driver.waitForElement(sample.tab2);
            await tabTwo.click();
            await driver.imageHelper.compareScreen({ imageName: imageName });

            const imageComparisonResult = driver.imageHelper.hasImageComparisonPassed();
            assert.isTrue(imageComparisonResult);

            if (imageComparisonResult) {
                const tabOne = await driver.waitForElement(sample.tab1);
                await tabOne.click();
            }
        });
    }
});
