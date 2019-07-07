import { nsCapabilities, createDriver, AppiumDriver, DeviceOrientaion, logInfo } from "nativescript-dev-appium";
import { BottomNavigationBasePage } from "./bottom-navigation-base-page";
import { assert } from "chai";
import { setImageName } from "../../../helpers/image-helper";
import { Platform } from "mobile-devices-controller";

const suite = "tab-navigation";
const spec = "bottom-navigation";

describe(`${suite}-${spec}-suite`, async function () {
    let driver: AppiumDriver;
    let bottomNavigationBasePage: BottomNavigationBasePage;

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        await driver.restartApp();
        bottomNavigationBasePage = new BottomNavigationBasePage(driver);
        await bottomNavigationBasePage.initSuite();
        driver.imageHelper.blockOutAreas = [{ x: 40, y: 0, height: 150, width: 325 }];
    });

    after(async function () {
        await bottomNavigationBasePage.endSuite();
    });

    beforeEach(async function () {
        driver.imageHelper.testName = setImageName(suite, spec, this.currentTest.title);
        driver.imageHelper.options = {
            timeOutSeconds: 5,
            donNotAppendActualSuffixOnIntialImageCapture: true,
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

    it(`${spec}-background-color`, async function () {
        await bottomNavigationBasePage.navigateToSample("background-color");
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.refreshBottomNavigationTab();
        await bottomNavigationBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    /*
    * Bug
    */
    it(`${spec}-binding-add-items`, async function () {
        await bottomNavigationBasePage.navigateToSample("binding");
        await driver.imageHelper.compareScreen();

        const addTabBtn = await driver.waitForElement("add-tab");
        const addTabBtnRect = await addTabBtn.getActualRectangle();
        const clickAddTab = async () => {
            await driver.clickPoint((addTabBtnRect.y + addTabBtnRect.width) / 2, (addTabBtnRect.x + addTabBtnRect.height) / 2);
        };

        await clickAddTab();
        await driver.imageHelper.compareScreen();

        await clickAddTab();
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.refreshBottomNavigationTab();
        await bottomNavigationBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    /*
    * Bug
    */
    it(`${spec}-binding-remove-items`, async function () {
        await bottomNavigationBasePage.navigateToSample("binding");
        await driver.imageHelper.compareScreen();

        const removeTabBtn = await driver.waitForElement("remove-last-tab");
        const removeTabBtnRect = await removeTabBtn.getActualRectangle();
        const clickRemoveTab = async () => {
            await driver.clickPoint((removeTabBtnRect.y + removeTabBtnRect.width) / 2, (removeTabBtnRect.x + removeTabBtnRect.height) / 2);
        };

        await clickRemoveTab();
        await driver.imageHelper.compareScreen();

        // Remove all items.
        await clickRemoveTab();
        await driver.imageHelper.compareScreen();

        // add items
        const addTabBtn = await driver.waitForElement("add-tab");
        await addTabBtn.tap();
        await addTabBtn.tap();
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.refreshBottomNavigationTab();
        await bottomNavigationBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-bottom-navigation`, async function () {
        await bottomNavigationBasePage.navigateToSample("bottom-navigation");
        await driver.imageHelper.compareScreen();

        const goToSecondBtn = await driver.waitForElement("goToSecond");
        await goToSecondBtn.tap();
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.refreshBottomNavigationTab();
        await bottomNavigationBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-color`, async function () {
        await bottomNavigationBasePage.navigateToSample("color");
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.refreshBottomNavigationTab();
        await bottomNavigationBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-fancy-fonts-select-tabs`, async function () {
        await bottomNavigationBasePage.navigateToSample("fancy-fonts");
        await driver.imageHelper.compareScreen();
        await bottomNavigationBasePage.refreshBottomNavigationTab();

        for (let index = 1; index < 4; index++) {
            await bottomNavigationBasePage.tabOnItem(index);
            await driver.imageHelper.compareScreen();
        }

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-fancy-fonts-selected-index`, async function () {
        await bottomNavigationBasePage.navigateToSample("fancy-fonts");
        await bottomNavigationBasePage.refreshBottomNavigationTab();

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

    it(`${spec}-icon-change`, async function () {
        await bottomNavigationBasePage.navigateToSample("icon-change");
        const index = driver.nsCapabilities.device.platform === Platform.IOS
            ? (+driver.nsCapabilities.device.apiLevel >= 11 ? 2 : 3) : 1;

        let btns = await driver.findElementsByClassName(driver.locators.button, 5000);
        await btns[index].tap();
        await driver.imageHelper.compareScreen();

        btns = await driver.findElementsByClassName(driver.locators.button, 5000);
        await btns[index - 1].tap();
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-icon-title-placment`, async function () {
        await bottomNavigationBasePage.navigateToSample("icon-title-placement");
        await driver.imageHelper.compareScreen();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-5470-issue`, async function () {
        await bottomNavigationBasePage.navigateToSample("issue-5470");
        await bottomNavigationBasePage.refreshBottomNavigationTab();
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });
});