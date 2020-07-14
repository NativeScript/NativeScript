import { nsCapabilities, createDriver, AppiumDriver } from "nativescript-dev-appium";
import { TabsViewBasePage } from "./tabs-view-base-page";
import { assert } from "chai";
import { setImageName } from "../../../helpers/image-helper";
import { NsCapabilities } from "nativescript-dev-appium/lib/ns-capabilities";
import { AutomationName } from "nativescript-dev-appium/lib/automation-name";

const suite = "tab-navigation";
const spec = "tabs";
const imagePrefix = `${suite}-${spec}`;

describe(`${imagePrefix}-suite`, async function () {
    let driver: AppiumDriver;
    let tabsViewBasePage: TabsViewBasePage;

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        await driver.restartApp();
        tabsViewBasePage = new TabsViewBasePage(driver);
        await tabsViewBasePage.initSuite();
    });

    after(async function () {
        await tabsViewBasePage.endSuite();
    });

    beforeEach(async function () {
        driver.imageHelper.testName = setImageName(suite, spec, this.currentTest.title);
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
            await driver.resetApp();
            await tabsViewBasePage.initSuite();
        }
    });

    it(`${imagePrefix}-background-color`, async function () {
        await tabsViewBasePage.navigateToSample("background-color");
        await tabsViewBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();

        await tabsViewBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await tabsViewBasePage.navigateBackToSuitMainPage();
    });

    // not all css is applied.
    it(`${imagePrefix}-color`, async function () {
        await tabsViewBasePage.navigateToSample("color");
        await tabsViewBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();

        await tabsViewBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await tabsViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${imagePrefix}-font`, async function () {
        await tabsViewBasePage.navigateToSample("font");
        await tabsViewBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();

        await tabsViewBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        await tabsViewBasePage.tabOnItem(0);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await tabsViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${imagePrefix}-font-icons`, async function () {
        await tabsViewBasePage.navigateToSample("font-icons");
        await tabsViewBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();

        await tabsViewBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        if (driver.isAndroid && (<NsCapabilities>driver.nsCapabilities).automationName === AutomationName.UiAutomator1
            || driver.isAndroid && (<NsCapabilities>driver.nsCapabilities).automationName === AutomationName.Appium) {
            await tabsViewBasePage.tabOnItem(1);
        } else {
            await tabsViewBasePage.tabOnItem(2);
        }
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await tabsViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${imagePrefix}-highlight-color`, async function () {
        await tabsViewBasePage.navigateToSample("highlight-color");
        await tabsViewBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();

        await tabsViewBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await tabsViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${imagePrefix}-icon-change`, async function () {
        await tabsViewBasePage.navigateToSample("icon-change");
        await tabsViewBasePage.refreshTabItems();

        await driver.imageHelper.compareScreen();

        await tabsViewBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        await tabsViewBasePage.tabOnItem(0);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await tabsViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${imagePrefix}-icon-title-placment`, async function () {
        await tabsViewBasePage.navigateToSample("icon-title-placement");
        await tabsViewBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await tabsViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${imagePrefix}-issue-5470`, async function () {
        await tabsViewBasePage.navigateToSample("issue-5470");
        await tabsViewBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();

        await tabsViewBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await tabsViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${imagePrefix}-strip-item`, async function () {
        await tabsViewBasePage.navigateToSample("strip-item");
        await tabsViewBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await tabsViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${imagePrefix}-android-swipe-disabled`, async function () {
        if (driver.isIOS) {
            this.skip();
        }
        await tabsViewBasePage.navigateToSample("swipe-disabled");
        await tabsViewBasePage.refreshTabItems();

        await tabsViewBasePage.swipeRightToLeft();
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await tabsViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${imagePrefix}-swipe`, async function () {
        await tabsViewBasePage.navigateToSample("tabs");
        await tabsViewBasePage.refreshTabItems();
        await tabsViewBasePage.swipeRightToLeft();

        await driver.imageHelper.compareScreen();
        await tabsViewBasePage.swipeRightToLeft();

        await driver.imageHelper.compareScreen();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await tabsViewBasePage.navigateBackToSuitMainPage();
    });

    /*
    * Bug
    */
    it(`${imagePrefix}-binding-add-items`, async function () {
        if (driver.isIOS) {
            this.skip();
        }
        await tabsViewBasePage.navigateToSample("tabs-binding");
        await tabsViewBasePage.refreshTabItems();
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

        await tabsViewBasePage.refreshTabItems();
        await tabsViewBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await tabsViewBasePage.navigateBackToSuitMainPage();
    });

    /*
    * Bug
    */
    it(`${imagePrefix}-binding-remove-items`, async function () {
        if (driver.isIOS) {
            this.skip();
        }
        await tabsViewBasePage.navigateToSample("tabs-binding");
        await tabsViewBasePage.refreshTabItems();
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

        await tabsViewBasePage.refreshTabItems();
        await tabsViewBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await tabsViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${imagePrefix}-text-transform`, async function () {
        await tabsViewBasePage.navigateToSample("text-transform");
        await tabsViewBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();

        await tabsViewBasePage.refreshTabItems();
        await tabsViewBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await tabsViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${imagePrefix}-custom-tabstrip`, async function () {
        await tabsViewBasePage.navigateToSample("custom-tabstrip");
        await driver.imageHelper.compareScreen();

        const secondTab = await driver.waitForElement("second-tab");
        await secondTab.click();
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await tabsViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${imagePrefix}-frame-in-tabs`, async function () {
        await tabsViewBasePage.navigateToSample("frame-in-tabs");
        await tabsViewBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();

        // go through the tabs and check that they are loaded
        await tabsViewBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        await tabsViewBasePage.tabOnItem(2);
        await driver.imageHelper.compareScreen();

        await tabsViewBasePage.tabOnItem(3);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await tabsViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-item-color`, async function () {
        await tabsViewBasePage.navigateToSample("item-color");
        await tabsViewBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();

        // go through the tabs and check that they are loaded
        await tabsViewBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        await tabsViewBasePage.tabOnItem(2);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await tabsViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-dynamic-color-change`, async function () {
        await tabsViewBasePage.navigateToSample("dynamic-color-change");
        await tabsViewBasePage.refreshTabItems();
        await driver.imageHelper.compareScreen();

        // go through the tabs and check that they are loaded
        await tabsViewBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        await tabsViewBasePage.tabOnItem(2);
        await driver.imageHelper.compareScreen();

        await tabsViewBasePage.tabOnItem(0);
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

        await tabsViewBasePage.tabOnItem(1);
        await driver.imageHelper.compareScreen();

        // change style again
        await changeStyleBtn.click();
        await driver.imageHelper.compareScreen();

        await tabsViewBasePage.tabOnItem(2);
        await driver.imageHelper.compareScreen();

        await changeIconSource.click();
        await driver.imageHelper.compareScreen();

        // change style again
        await changeStyleBtn.click();
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await tabsViewBasePage.navigateBackToSuitMainPage();
    });
});
