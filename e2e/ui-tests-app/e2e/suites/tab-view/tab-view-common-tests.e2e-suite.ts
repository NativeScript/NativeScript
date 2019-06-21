import { nsCapabilities, createDriver, AppiumDriver, Direction } from "nativescript-dev-appium";
import { TabViewBasePage } from "./tab-view-base-page";
import { Platform } from "mobile-devices-controller";

describe("tab-view-common-tests-suite", async function () {
    let driver: AppiumDriver;
    let tabViewBasePage: TabViewBasePage;

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        tabViewBasePage = new TabViewBasePage(driver);
        await tabViewBasePage.initSuite();
    });

    after(async function () {
        await tabViewBasePage.endSuite();
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
            await driver.resetApp();
            await tabViewBasePage.initSuite();
        }
    });

    it("tabView_01", async function () {
        await tabViewBasePage.navigateToSample("tabStyle");

        await tabViewBasePage.imageHelper.compareScreen("tabView_01", 5, 0.01);
        await tabViewBasePage.imageHelper.assertImages();

        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it("tabView_02_more", async function () {
        await tabViewBasePage.navigateToSample("tabmore");

        await tabViewBasePage.imageHelper.compareScreen("tabView_02_more", 5, 0.01);
        await tabViewBasePage.imageHelper.assertImages();

        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it("tabView_03_tabViewIcons", async function () {
        await tabViewBasePage.navigateToSample("tab-view-icons");
        await tabViewBasePage.imageHelper.compareScreen("tabView_03_tabViewIcons", 5, 0.01);

        const rect = await (await driver.waitForElement("automatic")).getActualRectangle();

        await driver.clickPoint(rect.x + 10, rect.y + 10);
        await tabViewBasePage.imageHelper.compareScreen("tabView_03_tabViewIcons", 5, 0.01);

        await driver.clickPoint(rect.x + 10, rect.y + 10);
        await tabViewBasePage.imageHelper.compareScreen("tabView_03_tabViewIcons", 5, 0.01);

        await driver.clickPoint(rect.x + 10, rect.y + 10);
        await tabViewBasePage.imageHelper.compareScreen("tabView_03_tabViewIcons", 5, 0.01);

        await tabViewBasePage.imageHelper.assertImages();

        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it("tabView_03_font", async function () {
        await tabViewBasePage.navigateToSample("text-transform");
        await tabViewBasePage.imageHelper.compareScreen("tabView_03_font", 5, 0.01);

        await (await driver.waitForElement("apply")).tap();
        await tabViewBasePage.imageHelper.compareScreen("tabView_03_font", 5, 0.01);

        await (await driver.waitForElement("reset")).tap();
        await tabViewBasePage.imageHelper.compareScreen("tabView_03_font", 5, 0.01);
        await tabViewBasePage.imageHelper.assertImages();

        await tabViewBasePage.navigateBackToSuitMainPage();
    });


    it("tabView_icon_change", async function () {
        await tabViewBasePage.navigateToSample("tab-view-icon-change");
        const index = driver.nsCapabilities.device.platform == Platform.IOS
            ? (driver.nsCapabilities.device.apiLevel >= 11 ? 2 : 3) : 1;

        let btns = await driver.findElementsByClassName(driver.locators.button, 5000);
        await btns[index].tap();
        await tabViewBasePage.imageHelper.compareScreen("tabView_icon_change", 5, 0.01);

        btns = await driver.findElementsByClassName(driver.locators.button, 5000);
        await btns[index -1 ].tap();
        await tabViewBasePage.imageHelper.compareScreen("tabView_icon_change", 5, 0.01);

        await tabViewBasePage.imageHelper.assertImages();

        await tabViewBasePage.navigateBackToSuitMainPage();
    });
});