import { AppiumDriver, createDriver, nsCapabilities } from "nativescript-dev-appium";
import { ButtonBackgroundPage } from "./button-background-page";
import { assert } from "chai";
import { setImageName } from "../../../helpers/image-helper";

const suite = "button";
const spec = "background";
const imagePrefix = `${suite}-${spec}`;

describe(`${imagePrefix}-suite`, () => {
    let driver: AppiumDriver;
    let backgroundPage: ButtonBackgroundPage;

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        await driver.restartApp();
        backgroundPage = new ButtonBackgroundPage(driver);
        await backgroundPage.initSuite();
    });

    after(async function () {
        await backgroundPage.endSuite();
    });

    beforeEach(function () {
        driver.imageHelper.testName = setImageName(suite, spec, this.currentTest.title);
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
            await driver.restartApp();
            await backgroundPage.initSuite();
        }
    });

    it(`${imagePrefix}-init`, async function () {
        const presenter = await backgroundPage.testElement();
        const result = await driver.compareElement(presenter, `${imagePrefix}-reset`);
        assert.isTrue(result);
    });

    it(`${imagePrefix}-1`, async function () {
        await await backgroundPage.executeScenario("1");
    });

    it(`${imagePrefix}-reset`, async function () {
        await backgroundPage.tapResetBtn();
        const presenter = await backgroundPage.testElement();
        const result = await driver.compareElement(presenter, `${imagePrefix}-reset`);
        assert.isTrue(result);
    });

    // Border
    it(`${imagePrefix}-21-borders`, async function () {
        await backgroundPage.executeScenario("21");
    });

    it(`${imagePrefix}-22-borders`, async function () {
        await backgroundPage.executeScenario("22");
    });

    it(`${imagePrefix}-23-borders`, async function () {
        await backgroundPage.executeScenario("23");
    });

    // Repeat
    it(`${imagePrefix}-31-repeat`, async function () {
        await backgroundPage.executeScenario("31");
    });

    it(`${imagePrefix}-32-repeat`, async function () {
        await backgroundPage.executeScenario("32");
    });

    it(`${imagePrefix}-33-repeat`, async function () {
        await backgroundPage.executeScenario("33");
    });

    // Position
    it(`${imagePrefix}-41-position`, async function () {
        await backgroundPage.executeScenario("41");
    });

    it(`${imagePrefix}-42-position`, async function () {
        await backgroundPage.executeScenario("42");
    });

    it(`${imagePrefix}-43-position`, async function () {
        await backgroundPage.executeScenario("43");
    });

    it(`${imagePrefix}-44-position`, async function () {
        await backgroundPage.executeScenario("44");
    });

    it(`${imagePrefix}-45-position`, async function () {
        await backgroundPage.executeScenario("45");
    });

    it(`${imagePrefix}-46-position`, async function () {
        await backgroundPage.executeScenario("46");
    });

    it(`${imagePrefix}-47-position`, async function () {
        await backgroundPage.executeScenario("47");
    });

    it(`${imagePrefix}-48-position`, async function () {
        await backgroundPage.executeScenario("48");
    });

    it(`${imagePrefix}-49-position`, async function () {
        await backgroundPage.executeScenario("49");
    });

    it(`${imagePrefix}-50-position`, async function () {
        await backgroundPage.executeScenario("50");
    });

    it(`${imagePrefix}-51-position`, async function () {
        await backgroundPage.executeScenario("51");
    });

    it(`${imagePrefix}-52-position`, async function () {
        await backgroundPage.executeScenario("52");
    });

    // Size
    it(`${imagePrefix}-61-size`, async function () {
        await backgroundPage.executeScenario("61");
    });

    it(`${imagePrefix}-62-size`, async function () {
        await backgroundPage.executeScenario("62");
    });

    it(`${imagePrefix}-63-size`, async function () {
        await backgroundPage.executeScenario("63");
    });

    it(`${imagePrefix}-64-size`, async function () {
        await backgroundPage.executeScenario("64");
    });

    // All
    it(`${imagePrefix}-71-all`, async function () {
        await backgroundPage.executeScenario("71");
    });

    it(`${imagePrefix}-72-all`, async function () {
        await backgroundPage.executeScenario("72");
    });

    // Antialiasing
    it(`${imagePrefix}-78-antialiasing`, async function () {
        await backgroundPage.executeScenario("78");
    });
});
