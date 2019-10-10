import { nsCapabilities, createDriver, AppiumDriver, SearchOptions, logError } from "nativescript-dev-appium";
import { ActionBarBasePage } from "./action-bar-base-page";
import { assert } from "chai";
import { setImageName } from "../../helpers/image-helper";
// import { unlinkSync, existsSync } from "fs";

const suite = "action-bar";
const testNamePrefix = `${suite}: `;

describe(`${suite}-suite`, async function () {
    let driver: AppiumDriver;
    let actionBarBasePage: ActionBarBasePage;

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        await driver.restartApp();
        actionBarBasePage = new ActionBarBasePage(driver);
        await actionBarBasePage.initSuite();
    });

    after(async function () {
        await actionBarBasePage.endSuite();
    });

    beforeEach(async function () {
        driver.imageHelper.testName = setImageName(suite, "", this.currentTest.title);
        driver.imageHelper.options = {
            donNotAppendActualSuffixOnIntialImageCapture: true
        };
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
            // await driver.resetApp();
            // await actionBarBasePage.initSuite();
        }
    });

    const btnGoToClearPageTap = async () => {
        await clickOnElement("go to cleared page");
    };

    const btnGoToPrevPageTap = async () => {
        await clickOnElement("go to previous page");
    };

    const btnTap = async () => {
        await clickOnElement("Tap");
    };

    const clickOnElement = async (automationText: string) => {
        const el = await driver.waitForElement(automationText);
        if (el === null) {
            logError(`Element ${automationText} not found!`);
            assert.isTrue(false, `Element ${automationText} should be visible`);
        }
        await el.click();
    };

    it(`${testNamePrefix}"actBG", set background color`, async function () {
        await actionBarBasePage.navigateToSample("actBG");
        await driver.imageHelper.compareScreen();

        await btnGoToClearPageTap();
        await driver.imageHelper.compareScreen();

        await btnGoToPrevPageTap();
        await driver.imageHelper.compareScreen();

        await actionBarBasePage.navigateBackToSuitMainPage();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    });

    it(`${testNamePrefix}"actBGCss", issue-516`, async function () {
        await actionBarBasePage.navigateToSample("actBGCss");
        const imageNameRed = setImageName(suite, "", `${testNamePrefix} should navigate to "actBGCss" issue-516-red`);
        const imageNameTrans = setImageName(suite, "", `${testNamePrefix} should navigate to "actBGCss" issue-516-trans`);
        await driver.imageHelper.compareElement(await actionBarBasePage.actionBar, { imageName: imageNameRed, keepOriginalImageName: true });
        await btnGoToClearPageTap();
        await driver.imageHelper.compareElement(await actionBarBasePage.actionBar, { imageName: imageNameTrans, keepOriginalImageName: true });

        await btnGoToPrevPageTap();
        await driver.imageHelper.compareElement(await actionBarBasePage.actionBar, { imageName: imageNameRed, keepOriginalImageName: true });

        await btnGoToClearPageTap();
        await (await driver.waitForElement("ITEM")).click();
        await driver.imageHelper.compareElement(await actionBarBasePage.actionBar, { imageName: imageNameRed, keepOriginalImageName: true });

        await actionBarBasePage.navigateBackToSuitMainPage();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    });

    it(`${testNamePrefix}"actColor", should set text color`, async function () {
        await actionBarBasePage.navigateToSample("actColor");
        const result = await driver.compareScreen();
        await actionBarBasePage.navigateBackToSuitMainPage();
        assert.isTrue(result);
    });

    it(`${testNamePrefix}"actIcons"`, async function () {
        await actionBarBasePage.navigateToSample("actIcons");
        const result = await driver.compareElement(await actionBarBasePage.actionBar);
        await actionBarBasePage.navigateBackToSuitMainPage();
        assert.isTrue(result);
    });

    it(`${testNamePrefix}"actLocalIcons"`, async function () {
        await actionBarBasePage.navigateToSample("actLocalIcons");
        await driver.imageHelper.compareElement(await actionBarBasePage.actionBar);

        await clickOnElement("undefined");
        await driver.imageHelper.compareElement(await actionBarBasePage.actionBar);

        await clickOnElement("alwaysTemplate");
        await driver.imageHelper.compareElement(await actionBarBasePage.actionBar);

        await clickOnElement("undefined");
        await driver.imageHelper.compareElement(await actionBarBasePage.actionBar);

        await clickOnElement("automatic");
        await driver.imageHelper.compareElement(await actionBarBasePage.actionBar);
        await actionBarBasePage.navigateBackToSuitMainPage();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    });

    it(`${testNamePrefix}"actResIcons"`, async function () {
        await actionBarBasePage.navigateToSample("actResIcons");
        await driver.imageHelper.compareElement(await actionBarBasePage.actionBar);

        await clickOnElement("undefined");
        await driver.imageHelper.compareElement(await actionBarBasePage.actionBar);

        await clickOnElement("alwaysTemplate");
        await driver.imageHelper.compareElement(await actionBarBasePage.actionBar);

        await clickOnElement("undefined");
        await driver.imageHelper.compareElement(await actionBarBasePage.actionBar);

        await clickOnElement("automatic");
        await driver.imageHelper.compareElement(await actionBarBasePage.actionBar);
        await actionBarBasePage.navigateBackToSuitMainPage();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    });

    it(`${testNamePrefix} should navigate to actStyle`, async function () {
        await actionBarBasePage.navigateToSample("actStyle");
        const result = await driver.compareElement(await actionBarBasePage.actionBar);
        assert.isTrue(result);
    });

    it(`${testNamePrefix} should "go to cleared page"`, async function () {
        await btnGoToClearPageTap();
        const result = await driver.compareElement(await actionBarBasePage.actionBar);
        assert.isTrue(result);
    });

    it(`${testNamePrefix} should "go to previous page"`, async function () {
        await btnGoToPrevPageTap();
        const result = await driver.compareElement(await actionBarBasePage.actionBar);
        assert.isTrue(result);
    });

    it(`${testNamePrefix} click on "ITEM" and navigate to clean page`, async function () {
        await (await driver.waitForElement("ITEM")).click();
        const result = await driver.compareElement(await actionBarBasePage.actionBar);
        assert.isTrue(result);
    });

    it(`${testNamePrefix} click on "ITEM" and navigate to action bar style initial page`, async function () {
        await (await driver.waitForElement("ITEM")).click();
        const result = await driver.compareElement(await actionBarBasePage.actionBar, `${suite}-navigate-to-actStyle`);

        await actionBarBasePage.navigateBackToSuitMainPage();
        assert.isTrue(result);
    });

    it(`${testNamePrefix} should navigate to "actView"`, async function () {
        await actionBarBasePage.navigateToSample("actView");
        const result = await driver.compareElement(await actionBarBasePage.actionBar);
        assert.isTrue(result);
    });

    it(`${testNamePrefix} should navigate with "Green" button`, async function () {
        await (await driver.waitForElement("Green")).click();
        const result = await driver.compareElement(await actionBarBasePage.actionBar, setImageName(suite, ``, `${testNamePrefix} should "go to cleared page"`));
        assert.isTrue(result);
    });

    it(`${testNamePrefix} should navigate back with "BACK"`, async function () {
        await driver.navBack();
        const result = await driver.compareElement(await actionBarBasePage.actionBar, setImageName(suite, "", `${testNamePrefix} should navigate to "actView"`));
        await actionBarBasePage.navigateBackToSuitMainPage();
        assert.isTrue(result);
    });

    it(`${testNamePrefix}"actionItemPosition",should change item position`, async function () {
        await actionBarBasePage.navigateToSample("actionItemPosition");
        await driver.imageHelper.compareScreen();

        await btnTap();
        await driver.imageHelper.compareScreen();

        await btnTap();
        await driver.imageHelper.compareScreen();

        await btnTap();
        await driver.imageHelper.compareScreen();

        await actionBarBasePage.navigateBackToSuitMainPage();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    });

    it(`${testNamePrefix}"actTransparentBgCss", page background color as actBackground color`, async function () {
        await actionBarBasePage.navigateToSample("actTransparentBgCss");
        await driver.imageHelper.compareScreen();

        await (await driver.waitForElement("go to cleared page")).click();
        await driver.imageHelper.compareScreen();

        await (await driver.waitForElement("ITEM")).click();
        await driver.imageHelper.compareScreen();

        await actionBarBasePage.navigateBackToSuitMainPage();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    });

    it(`${testNamePrefix} should navigate to "modalShownActBar" nav back with "Go Back"`, async function () {
        await actionBarBasePage.navigateToSample("modalShownActBar");
        await driver.imageHelper.compareScreen();

        await (await driver.waitForElement("Open Modal")).click();
        await driver.imageHelper.compareScreen();

        await (await driver.waitForElement("Close")).click();
        await driver.imageHelper.compareScreen();

        await (await driver.waitForElement("Go Back")).click();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    });

    it(`${testNamePrefix} should navigate to "modalHiddenActBar" nav back with "Go Back"`, async function () {
        await actionBarBasePage.navigateToSample("modalHiddenActBar");
        await driver.imageHelper.compareScreen();

        await (await driver.waitForElement("Open Modal")).click();
        await driver.imageHelper.compareScreen();

        await (await driver.waitForElement("Change text")).click();
        await driver.imageHelper.compareScreen();

        await (await driver.waitForElement("Close")).click();
        await driver.imageHelper.compareScreen();

        await (await driver.waitForElement("Go Back")).click();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    });

    it(`${testNamePrefix}"flat", change`, async function () {
        await actionBarBasePage.navigateToSample("flat");
        await driver.imageHelper.compareScreen();

        await (await driver.waitForElement("change flat property")).click();
        await driver.imageHelper.compareScreen();

        await actionBarBasePage.navigateBackToSuitMainPage();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    });

    it(`${testNamePrefix}flat-layout"`, async function () {
        await actionBarBasePage.navigateToSample("flat-layout");
        await driver.imageHelper.compareScreen();
        await actionBarBasePage.navigateBackToSuitMainPage();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    });

    it(`${testNamePrefix}flat-scrollview`, async function () {
        await actionBarBasePage.navigateToSample("flat-scrollview");
        await driver.imageHelper.compareScreen();
        await actionBarBasePage.navigateBackToSuitMainPage();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    });

    it(`${testNamePrefix}"flat-tab"`, async function () {
        await actionBarBasePage.navigateToSample("flat-tab");
        await driver.imageHelper.compareScreen();
        await actionBarBasePage.navigateBackToSuitMainPage();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    });

    // BUG
    it(`${testNamePrefix}flat-opaque-bar`, async function () {
        this.skip();
        await actionBarBasePage.navigateToSample("flat-tab-opaque-bar");
        await driver.imageHelper.compareScreen();
        await actionBarBasePage.navigateBackToSuitMainPage();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    });

    it(`${testNamePrefix}font-icons`, async function () {
        await actionBarBasePage.navigateToSample("font-icons");
        await driver.imageHelper.compareScreen();
        await actionBarBasePage.navigateBackToSuitMainPage();
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    });
});
