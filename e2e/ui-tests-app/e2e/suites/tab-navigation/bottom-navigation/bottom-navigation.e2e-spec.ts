import { nsCapabilities, createDriver, AppiumDriver, DeviceOrientation, logInfo } from "nativescript-dev-appium";
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
        await driver.restartApp();
        bottomNavigationBasePage = new BottomNavigationBasePage(driver);
        await bottomNavigationBasePage.initSuite();
    });

    after(async function () {
        await bottomNavigationBasePage.endSuite();
    });

    beforeEach(async function () {
        driver.imageHelper.testName = setImageName(suite, spec, this.currentTest.title);
    });

    afterEach(async function () {
        const orientation = await driver.getOrientation();
        if (orientation === DeviceOrientation.LANDSCAPE) {
            await driver.setOrientation(DeviceOrientation.PORTRAIT);
        }
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
            await driver.resetApp();
            await bottomNavigationBasePage.initSuite();
        }
    });

    it(`${spec}-background-color`, async function () {
        await bottomNavigationBasePage.navigateToSample("background-color");
        await bottomNavigationBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();

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
        await bottomNavigationBasePage.refreshTabItems();
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

        await bottomNavigationBasePage.refreshTabItems();
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
        await bottomNavigationBasePage.refreshTabItems();
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
        await addTabBtn.click();
        await addTabBtn.click();
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.refreshTabItems();
        await bottomNavigationBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-bottom-navigation`, async function () {
        await bottomNavigationBasePage.navigateToSample("bottom-navigation");
        await bottomNavigationBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();

        const goToSecondBtn = await driver.waitForElement("goToSecond");
        await goToSecondBtn.click();
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-color`, async function () {
        await bottomNavigationBasePage.navigateToSample("color");
        await bottomNavigationBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-fancy-fonts-select-tabs`, async function () {
        await bottomNavigationBasePage.navigateToSample("fancy-fonts");
        await bottomNavigationBasePage.refreshTabItems();
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
        await bottomNavigationBasePage.refreshTabItems();

        let selectSecondTabFromCodeBehind = await driver.waitForElement("selectSecondTab");
        logInfo(`Click on "select second tab button"`);
        await selectSecondTabFromCodeBehind.click();
        await driver.imageHelper.compareScreen();

        await driver.backgroundApp(1);
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        selectSecondTabFromCodeBehind = await driver.waitForElement("selectSecondTab");
        logInfo(`Click on "select second tab button"`);
        await selectSecondTabFromCodeBehind.click();
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
        await bottomNavigationBasePage.refreshTabItems();
        await driver.setOrientation(DeviceOrientation.LANDSCAPE);
        await driver.imageHelper.compareScreen();

        await driver.backgroundApp(1);
        if (driver.isAndroid) {
            driver.imageHelper.resetDefaultOptions();
        }
        await driver.imageHelper.compareScreen();

        await driver.setOrientation(DeviceOrientation.PORTRAIT);
        if (driver.isAndroid) {
            await driver.imageHelper.compareScreen(
                {
                    imageName: "tab-navigation-bottom-navigation-fancy-fonts-change-orientation_2.png",
                    keepOriginalImageName: true
                });
        } else {
            await driver.imageHelper.compareScreen();
        }

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-font-icons`, async function () {
        await bottomNavigationBasePage.navigateToSample("font-icons");
        await bottomNavigationBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.tabOnItem(2);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-icon-change`, async function () {
        await bottomNavigationBasePage.navigateToSample("icon-change");
        await bottomNavigationBasePage.refreshTabItems();
        await bottomNavigationBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.tabOnItem(0);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-icon-title-placment`, async function () {
        await bottomNavigationBasePage.navigateToSample("icon-title-placement");
        await bottomNavigationBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-5470-issue`, async function () {
        await bottomNavigationBasePage.navigateToSample("issue-5470");
        await bottomNavigationBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-text-transform`, async function () {
        await bottomNavigationBasePage.navigateToSample("text-transform");
        await bottomNavigationBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-fonts`, async function () {
        await bottomNavigationBasePage.navigateToSample("text-transform");
        await bottomNavigationBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-custom-tabstrip`, async function () {
        await bottomNavigationBasePage.navigateToSample("custom-tabstrip");
        await driver.imageHelper.compareScreen();

        const secondTab = await driver.waitForElement("second-tab");
        await secondTab.click();
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-item-color`, async function () {
        await bottomNavigationBasePage.navigateToSample("item-color");
        await bottomNavigationBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();

        // go through the tabs and check that they are loaded
        await bottomNavigationBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.tabOnItem(2);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-dynamic-color-change`, async function () {
        await bottomNavigationBasePage.navigateToSample("dynamic-color-change");
        await bottomNavigationBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();

        // go through the tabs and check that they are loaded
        await bottomNavigationBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.tabOnItem(2);
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.tabOnItem(0);
        await driver.imageHelper.compareScreen();

        // change icon sources and check the result
        const changeIconSource = await driver.waitForElement("changeIconSource");
        await changeIconSource.click();
        await driver.imageHelper.compareScreen();

        const changeStyleBtn = await driver.waitForElement("changeStyle");
        await changeStyleBtn.click();
        await driver.imageHelper.compareScreen();

        // change icon sources again
        await changeIconSource.click();
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        // change style again
        await changeStyleBtn.click();
        await driver.imageHelper.compareScreen();

        await bottomNavigationBasePage.tabOnItem(2);
        await driver.imageHelper.compareScreen();

        await changeIconSource.click();
        await driver.imageHelper.compareScreen();

        // change style again
        await changeStyleBtn.click();
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await bottomNavigationBasePage.navigateBackToSuitMainPage();
    });
});
