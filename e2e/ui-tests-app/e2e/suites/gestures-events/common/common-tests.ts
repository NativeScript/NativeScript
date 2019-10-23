import { AppiumDriver, createDriver, nsCapabilities } from "nativescript-dev-appium";
import { assert } from "chai";
import { setImageName } from "../../../helpers/image-helper";
import { EventsGesturesBasePage } from "../events-gestures-base-page";

const suite = "gestures-events";
const spec = "common";
const imagePrefix = `${suite}-${spec}`;

describe(`${imagePrefix}-suite`, () => {
    let driver: AppiumDriver;
    let basePage: EventsGesturesBasePage;

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        await driver.restartApp();
        basePage = new EventsGesturesBasePage(driver);
        await basePage.initSuite();
    });

    after(async function () {
        await basePage.endSuite();
    });

    beforeEach(function () {
        driver.imageHelper.testName = setImageName(suite, spec, this.currentTest.title);
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
            await driver.restartApp();
            await basePage.initSuite();
        }
    });

    it(`${imagePrefix}-handlers`, async function () {
        const getResult = async (text) => {
            return (await driver.waitForElement(text));
        };

        const cleanResult = async () => {
            return await (await driver.waitForElement("clean-result")).click();
        };

        await basePage.navigateToSample("handlers");

        const handlersExport = await driver.findElementByText("Handlers as exports");
       
        await handlersExport.click();
        assert.isTrue(getResult("tapAction") != null);
        await cleanResult();

        await handlersExport.doubleTap();
        assert.isTrue(getResult("doubleTapAction") != null);
        await cleanResult();

        const boundHandlers = await driver.findElementByText("Bound handlers");
        await boundHandlers.click();
        assert.isTrue(getResult("tapAction") != null);
        await cleanResult();
        await handlersExport.doubleTap();
        assert.isTrue(getResult("doubleTapAction") != null);
        await cleanResult();
    });
});