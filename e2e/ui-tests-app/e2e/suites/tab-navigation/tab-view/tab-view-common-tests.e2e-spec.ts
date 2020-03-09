import { nsCapabilities, createDriver, AppiumDriver } from "nativescript-dev-appium";
import { TabViewBasePage } from "./tab-view-base-page";
import { Platform } from "mobile-devices-controller";
import { setImageName } from "../../../helpers/image-helper";
import { assert } from "chai";
import { ElementCacheStrategy } from "../../../helpers/navigation-helper";

const suite = "tab-navigation";
const spec = "tab-view-common";

describe(`${suite}-${spec}-suite`, async function () {
    let driver: AppiumDriver;
    let tabViewBasePage: TabViewBasePage;

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        await driver.restartApp();
        tabViewBasePage = new TabViewBasePage(driver, ElementCacheStrategy.onload);
        await tabViewBasePage.initSuite();
    });

    after(async function () {
        await tabViewBasePage.endSuite();
    });

    beforeEach(async function () {
        driver.imageHelper.testName = setImageName(suite, spec, this.currentTest.title);
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
            await driver.resetApp();
            await tabViewBasePage.initSuite();
        }
    });

    it(`${spec}-5470-issue`, async function () {
        await tabViewBasePage.navigateToSample("issue-5470");
        await driver.imageHelper.compareScreen();

        const tab2 = await driver.waitForElement("Tab2");
        await tab2.click();
        await driver.imageHelper.compareScreen();

        const tab1 = await driver.waitForElement("Tab1");
        await tab1.click();
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-text-color`, async function () {
        await tabViewBasePage.navigateToSample("tab-text-color");
        await driver.imageHelper.compareScreen();

        const tab2 = await driver.waitForElement("Tab 2");
        await tab2.click();
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-android-swipe-disabled`, async function () {
        if (driver.isIOS) {
            this.skip();
        }
        await tabViewBasePage.navigateToSample("tab-view-android-swipe");

        await driver.swipe(
            {
                x: driver.imageHelper.options.cropRectangle.width + driver.imageHelper.options.cropRectangle.x - 10,
                y: driver.imageHelper.options.cropRectangle.height / 2
            },
            {
                y: 0,
                x: driver.imageHelper.options.cropRectangle.x + 10
            }
            , 100);
        await driver.imageHelper.compareScreen({ timeOutSeconds: 5, tolerance: 0.01 });
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-bottom-position`, async function () {
        await tabViewBasePage.navigateToSample("tab-view-bottom-position");
        await driver.imageHelper.compareScreen();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-icon-change`, async function () {
        await tabViewBasePage.navigateToSample("tab-view-icon-change");
        const index = driver.nsCapabilities.device.platform === Platform.IOS
            ? (+driver.nsCapabilities.device.apiLevel >= 11 ? 2 : 3) : 1;

        const tabItemLocator = driver.isAndroid ? driver.locators.image : driver.locators.getElementByName("imagebutton");
        let btns = await driver.findElementsByClassName(tabItemLocator, 5000);
        await btns[index].click();
        await driver.imageHelper.compareScreen();

        btns = await driver.findElementsByClassName(tabItemLocator, 5000);
        await btns[index - 1].click();
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-icon-title-placement`, async function () {
        await tabViewBasePage.navigateToSample("tab-view-icon-title-placement");
        await driver.imageHelper.compareScreen();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-icons`, async function () {
        if (driver.isAndroid) {
            this.skip();
        }
        await tabViewBasePage.navigateToSample("tab-view-icons");
        await driver.imageHelper.compareScreen();

        const rect = await (await driver.waitForElement("automatic")).getActualRectangle();

        await driver.clickPoint(rect.x + 10, rect.y + 10);
        await driver.imageHelper.compareScreen();

        await driver.clickPoint(rect.x + 10, rect.y + 10);
        await driver.imageHelper.compareScreen();

        await driver.clickPoint(rect.x + 10, rect.y + 10);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-icons-local`, async function () {
        if (driver.isAndroid) {
            this.skip();
        }
        await tabViewBasePage.navigateToSample("tab-view-icons-local");
        await driver.imageHelper.compareScreen();

        const rect = await (await driver.waitForElement("automatic")).getActualRectangle();

        await driver.clickPoint(rect.x + 10, rect.y + 10);
        await driver.imageHelper.compareScreen();

        await driver.clickPoint(rect.x + 10, rect.y + 10);
        await driver.imageHelper.compareScreen();

        await driver.clickPoint(rect.x + 10, rect.y + 10);
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-text-font-size`, async function () {
        await tabViewBasePage.navigateToSample("tab-view-tab-text-font-size");
        await driver.imageHelper.compareScreen();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-background`, async function () {
        await tabViewBasePage.navigateToSample("tabBG");
        await driver.imageHelper.compareScreen();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-color`, async function () {
        await tabViewBasePage.navigateToSample("tabColor");
        await driver.imageHelper.compareScreen();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-style`, async function () {
        await tabViewBasePage.navigateToSample("tabStyle");
        await driver.imageHelper.compareScreen();

        const tab1 = await driver.waitForElement("First");
        await tab1.click();
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-tabs-background-color`, async function () {
        await tabViewBasePage.navigateToSample("tabTabsBG");
        await driver.imageHelper.compareScreen();

        const tab2 = await driver.waitForElement("Second");
        await tab2.click();
        await driver.imageHelper.compareScreen();

        const tab1 = await driver.waitForElement("First");
        await tab1.click();
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-more`, async function () {
        await tabViewBasePage.navigateToSample("tabmore");
        await driver.imageHelper.compareScreen();

        const tab2 = await driver.waitForElement("Tab 2");
        await tab2.click();
        await driver.imageHelper.compareScreen();

        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-text-transform`, async function () {
        await tabViewBasePage.navigateToSample("text-transform");
        await driver.imageHelper.compareScreen();

        await (await driver.waitForElement("apply")).click();
        await driver.imageHelper.compareScreen();

        await (await driver.waitForElement("reset")).click();
        await driver.imageHelper.compareScreen();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());

        await tabViewBasePage.navigateBackToSuitMainPage();
    });
});
