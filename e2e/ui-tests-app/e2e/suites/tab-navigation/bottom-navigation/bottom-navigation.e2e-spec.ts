import { nsCapabilities, createDriver, AppiumDriver, DeviceOrientaion, logInfo } from "nativescript-dev-appium";
import { BottomNavigationBasePage } from "./bottom-navigation-base-page";
import { assert } from "chai";
import { setImageName } from "../../../helpers/image-helper";

const suite = "tab-navigation";
const spec = "bottom-navigation";

describe(`${suite}-${spec}-suite`, async function () {
    let driver: AppiumDriver;
    let bottomNavigationBasePage: BottomNavigationBasePage;

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        await driver.resetApp();
        bottomNavigationBasePage = new BottomNavigationBasePage(driver);
        await bottomNavigationBasePage.initSuite();
    });

    after(async function () {
        await bottomNavigationBasePage.endSuite();
    });

    beforeEach(async function () {
        driver.imageHelper.testName = setImageName(suite, spec, this.currentTest.title);
        driver.imageHelper.options = {
            tolerance: 0.01,
            timeOutSeconds: 5,
            preserveImageName: true
        };
    });

    afterEach(async function () {
        const orientation = await driver.getOrientation();
        if (orientation === DeviceOrientaion.LANDSCAPE) {
            await driver.setOrientation(DeviceOrientaion.PORTRAIT);
        }
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
            await driver.resetApp();
            await bottomNavigationBasePage.initSuite();
        }
    });

    // it(`${spec}-background-color`, async function () {
    //     await bottomNavigationBasePage.navigateToSample("background-color");

    //     await driver.imageHelper.compareScreen();
    //     assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

    //     await bottomNavigationBasePage.navigateBackToSuitMainPage();
    // });

    // it(`${spec}-bottom-navigation`, async function () {
    //     await bottomNavigationBasePage.navigateToSample("bottom-navigation");
    //     await driver.imageHelper.compareScreen();
    //     assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    //     await bottomNavigationBasePage.navigateBackToSuitMainPage();
    // });

    // it(`${spec}-color`, async function () {
    //     await bottomNavigationBasePage.navigateToSample("color");
    //     await driver.imageHelper.compareScreen();
    //     assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    //     await bottomNavigationBasePage.navigateBackToSuitMainPage();
    // });

    // it(`${spec}-icon-change`, async function () {
    //     await bottomNavigationBasePage.navigateToSample("tab-view-icon-change");
    //     const index = driver.nsCapabilities.device.platform === Platform.IOS
    //         ? (driver.nsCapabilities.device.apiLevel >= 11 ? 2 : 3) : 1;

    //     let btns = await driver.findElementsByClassName(driver.locators.button, 5000);
    //     await btns[index].tap();
    //     await driver.imageHelper.compareScreen();

    //     btns = await driver.findElementsByClassName(driver.locators.button, 5000);
    //     await btns[index - 1].tap();
    //     await driver.imageHelper.compareScreen();

    //     assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

    //     await bottomNavigationBasePage.navigateBackToSuitMainPage();
    // });

    // it(`${spec}-icon-title-placment`, async function () {
    //     await bottomNavigationBasePage.navigateToSample("icon-title-placement");
    //     await driver.imageHelper.compareScreen();
    //     assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    //     await bottomNavigationBasePage.navigateBackToSuitMainPage();
    // });

    // // it(`${spec}-issue-5470`, async function () {
    // //     await bottomNavigationBasePage.navigateToSample("issue-5470");
    // //     await driver.imageHelper.compareScreen();
    // //     assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    // //     await bottomNavigationBasePage.navigateBackToSuitMainPage();
    // // });

    // // it(`${spec}-swipe-enabled`, async function () {
    // //     await bottomNavigationBasePage.navigateToSample("swipe-enabled");
    // //     await driver.imageHelper.compareScreen();
    // //     assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    // //     await bottomNavigationBasePage.navigateBackToSuitMainPage();
    // // });

    // // it(`${spec}-tabs-position`, async function () {
    // //     await bottomNavigationBasePage.navigateToSample("tabs-position");
    // //     await driver.imageHelper.compareScreen();
    // //     assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    // //     await bottomNavigationBasePage.navigateBackToSuitMainPage();
    // // });

    it(`${spec}-fancy-fonts-select-tabs`, async function () {
        await bottomNavigationBasePage.navigateToSample("fancy-fonts");
        await driver.imageHelper.compareScreen();

        for (let index = 1; index < 4; index++) {
            await bottomNavigationBasePage.tabOnItem(index);
            await driver.imageHelper.compareScreen();
        }

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-fancy-fonts-selected-index`, async function () {
        await bottomNavigationBasePage.navigateToSample("fancy-fonts");
        let selectSecondTabFromCodeBehind = await driver.waitForElement("selectSecondTab");
        logInfo(`Click on "select second tab button"`);
        await selectSecondTabFromCodeBehind.tap();
        await driver.imageHelper.compareScreen();

        await driver.backgroundApp(1);
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        selectSecondTabFromCodeBehind = await driver.waitForElement("selectSecondTab");
        logInfo(`Click on "select second tab button"`);
        await selectSecondTabFromCodeBehind.tap();
        await driver.imageHelper.compareScreen();

        await driver.backgroundApp(1);
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.tabOnItem(3);
        await driver.imageHelper.compareScreen();

        await driver.backgroundApp(1);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-fancy-fonts-change-orientation`, async function () {
        await bottomNavigationBasePage.navigateToSample("fancy-fonts");
        await driver.setOrientation(DeviceOrientaion.LANDSCAPE);
        await driver.imageHelper.compareScreen();

        await driver.backgroundApp(1);
        await driver.imageHelper.compareScreen();

        await driver.setOrientation(DeviceOrientaion.PORTRAIT);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });
});