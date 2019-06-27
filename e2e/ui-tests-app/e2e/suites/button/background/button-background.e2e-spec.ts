import { AppiumDriver, createDriver, nsCapabilities } from "nativescript-dev-appium";
import { ButtonBackgroundPage } from "./button-background-page";
import { assert } from "chai";

const suite = "button";
const spec = "background";

describe(`${suite}-${spec}-suite`, () => {
    let driver: AppiumDriver;
    let backgroundPage: ButtonBackgroundPage;

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        await driver.resetApp();
        backgroundPage = new ButtonBackgroundPage(driver);
        await backgroundPage.initSuite();
    });

    after(async function () {
        await backgroundPage.endSuite();
    });

    beforeEach(function () {
        driver.imageHelper.testName = this.currentTest.title;
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
            await driver.resetApp();
            await backgroundPage.initSuite();
        }
    });

    it("background_11", async function () {
        const presenter = await backgroundPage.testElement();
        await driver.imageHelper.compareElement(presenter, { imageName: "background_11_clean", tolerance: 0.1 });
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    });

    it("background_12", async function () {
        await await backgroundPage.executeScenario("background_12", "1");
    });

    it("background_13", async function () {
        await backgroundPage.tapResetBtn();
        const presenter = await backgroundPage.testElement();
        await driver.imageHelper.compareElement(presenter, { imageName: "background_11_clean", tolerance: 0.1 });
        assert.isTrue(driver.imageHelper.hasImageComparisonPassed());
    });

    // Border
    it("background_21_border", async function () {
        // await backgroundPage.navigateBackToSuitMainPage();
        await backgroundPage.executeScenario("background_21_border", "21");
    });

    it("background_22_border", async function () {
        await backgroundPage.executeScenario("background_22_border", "22");
    });

    it("background_23_border", async function () {
        await backgroundPage.executeScenario("background_23_border", "23");
    });

    // Repeat
    it("background_31_repeat", async function () {
        await backgroundPage.executeScenario("background_31_repeat", "31");
    });

    it("background_32_repeat", async function () {
        await backgroundPage.executeScenario("background_32_repeat", "32");
    });

    it("background_33_repeat", async function () {
        await backgroundPage.executeScenario("background_33_repeat", "33");
    });

    // Position
    it("background_41_position", async function () {
        await backgroundPage.executeScenario("background_41_position", "41");
    });

    it("background_42_position", async function () {
        await backgroundPage.executeScenario("background_42_position", "42");
    });

    it("background_43_position", async function () {
        await backgroundPage.executeScenario("background_43_position", "43");
    });

    it("background_44_position", async function () {
        await backgroundPage.executeScenario("background_44_position", "44");
    });

    it("background_45_position", async function () {
        await backgroundPage.executeScenario("background_45_position", "45");
    });

    it("background_46_position", async function () {
        await backgroundPage.executeScenario("background_46_position", "46");
    });

    it("background_47_position", async function () {
        await backgroundPage.executeScenario("background_47_position", "47");
    });

    it("background_48_position", async function () {
        await backgroundPage.executeScenario("background_48_position", "48");
    });

    it("background_49_position", async function () {
        await backgroundPage.executeScenario("background_49_position", "49");
    });

    it("background_50_position", async function () {
        await backgroundPage.executeScenario("background_50_position", "50");
    });

    it("background_51_position", async function () {
        await backgroundPage.executeScenario("background_51_position", "51");
    });

    it("background_52_position", async function () {
        await backgroundPage.executeScenario("background_52_position", "52");
    });

    // Size
    it("background_61_size", async function () {
        await backgroundPage.executeScenario("background_61_size", "61");
    });

    it("background_62_size", async function () {
        await backgroundPage.executeScenario("background_62_size", "62");
    });

    it("background_63_size", async function () {
        await backgroundPage.executeScenario("background_63_size", "63");
    });

    it("background_64_size", async function () {
        await backgroundPage.executeScenario("background_64_size", "64");
    });

    // All
    it("background_71_all", async function () {
        await backgroundPage.executeScenario("background_71_all", "71");
    });

    it("background_72_all", async function () {
        await backgroundPage.executeScenario("background_72_all", "72");
    });

    // Antialiasing
    it("background_78_antialiasing", async function () {
        await backgroundPage.executeScenario("background_78_antialiasing", "78");
    });
});