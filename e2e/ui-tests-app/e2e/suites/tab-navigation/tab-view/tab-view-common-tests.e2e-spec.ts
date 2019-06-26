import { nsCapabilities, createDriver, AppiumDriver } from "nativescript-dev-appium";
import { TabViewBasePage } from "./tab-view-base-page";
import { Platform } from "mobile-devices-controller";

const suite = "tabs";
const spec = "tab-view";

describe(`${suite}-${spec}-common-tests-suite`, async function () {
    let driver: AppiumDriver;
    let tabViewBasePage: TabViewBasePage;

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        await driver.resetApp();
        tabViewBasePage = new TabViewBasePage(driver);
        await tabViewBasePage.initSuite();
    });

    after(async function () {
        await tabViewBasePage.endSuite();
    });

    beforeEach(async function () {
        tabViewBasePage.imageHelper.setImageName(suite, spec, this.currentTest.title);
        tabViewBasePage.imageHelper.defualtOptions = {
            tolerance: 0.01,
            timeOutSeconds: 5
        };
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
            await driver.resetApp();
            await tabViewBasePage.initSuite();
        }
    });

    it(`${spec}-style`, async function () {
        await tabViewBasePage.navigateToSample("tabStyle");

        await tabViewBasePage.imageHelper.compareScreen({ timeOutSeconds: 5, tolerance: 0.01 });
        await tabViewBasePage.imageHelper.assertImages();

        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-more-items`, async function () {
        await tabViewBasePage.navigateToSample("tabmore");

        await tabViewBasePage.imageHelper.compareScreen();
        await tabViewBasePage.imageHelper.assertImages();

        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-icons`, async function () {
        await tabViewBasePage.navigateToSample("tab-view-icons");
        await tabViewBasePage.imageHelper.compareScreen();

        const rect = await (await driver.waitForElement("automatic")).getActualRectangle();

        await driver.clickPoint(rect.x + 10, rect.y + 10);
        await tabViewBasePage.imageHelper.compareScreen();

        await driver.clickPoint(rect.x + 10, rect.y + 10);
        await tabViewBasePage.imageHelper.compareScreen();

        await driver.clickPoint(rect.x + 10, rect.y + 10);
        await tabViewBasePage.imageHelper.compareScreen();

        await tabViewBasePage.imageHelper.assertImages();

        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-fonts`, async function () {
        await tabViewBasePage.navigateToSample("text-transform");
        await tabViewBasePage.imageHelper.compareScreen();

        await (await driver.waitForElement("apply")).tap();
        await tabViewBasePage.imageHelper.compareScreen();

        await (await driver.waitForElement("reset")).tap();
        await tabViewBasePage.imageHelper.compareScreen();
        await tabViewBasePage.imageHelper.assertImages();

        await tabViewBasePage.navigateBackToSuitMainPage();
    });

    it(`${spec}-icon-change`, async function () {
        await tabViewBasePage.navigateToSample("tab-view-icon-change");
        const index = driver.nsCapabilities.device.platform === Platform.IOS
            ? (driver.nsCapabilities.device.apiLevel >= 11 ? 2 : 3) : 1;

        let btns = await driver.findElementsByClassName(driver.locators.button, 5000);
        await btns[index].tap();
        await tabViewBasePage.imageHelper.compareScreen();

        btns = await driver.findElementsByClassName(driver.locators.button, 5000);
        await btns[index - 1].tap();
        await tabViewBasePage.imageHelper.compareScreen();

        await tabViewBasePage.imageHelper.assertImages();

        await tabViewBasePage.navigateBackToSuitMainPage();
    });
});