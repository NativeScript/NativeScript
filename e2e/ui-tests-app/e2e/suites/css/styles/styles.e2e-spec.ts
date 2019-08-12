import { assert } from "chai";
import { AppiumDriver, createDriver, nsCapabilities } from "nativescript-dev-appium";

import { setImageName } from "../../../helpers/image-helper";
import { StylesPage } from "./styles-page";

const suite = "css";
const spec = "styles";

describe(`${suite}-${spec}-suite`, () => {
    let driver: AppiumDriver;
    let stylesPage: StylesPage;

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        await driver.restartApp();
        stylesPage = new StylesPage(driver);
        await stylesPage.initSuite();
    });

    after(async function () {
        await stylesPage.endSuite();
    });

    beforeEach(async function () {
        driver.imageHelper.testName = setImageName(suite, spec, this.currentTest.title);
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
        }
    });

    it(`${suite}-${spec}-apply`, async function () {
        await stylesPage.tapAppBtn();
        await driver.imageHelper.compareScreen();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    });
});
