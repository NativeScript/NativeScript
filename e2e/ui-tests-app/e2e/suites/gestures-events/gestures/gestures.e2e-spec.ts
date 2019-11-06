import { AppiumDriver, createDriver, nsCapabilities, SearchOptions, Direction } from "nativescript-dev-appium";
import { GesturesPage } from "./gestures-page";
import { assert } from "chai";
import { setImageName } from "../../../helpers/image-helper";

const suite = "gestures-events";
const spec = "gestures";
const imagePrefix = `${suite}-${spec}`;

describe(`${imagePrefix}-suite`, () => {
    let driver: AppiumDriver;
    let gesturesPage: GesturesPage;

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        await driver.restartApp();
        gesturesPage = new GesturesPage(driver);
        await gesturesPage.initSuite();
    });

    after(async function () {
        await gesturesPage.endSuite();
    });

    beforeEach(function () {
        driver.imageHelper.testName = setImageName(suite, spec, this.currentTest.title);
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
            await driver.restartApp();
            await gesturesPage.initSuite();
        }
    });

    it("gestures_01_tap", async function () {
        const lblTap = await driver.waitForElement("Tap here");
        await lblTap.click();
        const result = await driver.findElementByTextIfExists("Tap gesture detected, true", SearchOptions.contains);
        assert.isTrue(result != null && result !== undefined, `Gestures event 'tap' not detected!`);
    });

    it("gestures_02_doubleTap", async function () {
        const lblDoubleTap = await driver.waitForElement("Double Tap here");
        await lblDoubleTap.doubleTap({ x: 20, y: 20 });
        const result = await driver.findElementByTextIfExists("Double Tap gesture detected, true", SearchOptions.contains);
        assert.isTrue(result != null && result !== undefined, `Gestures event 'Double Tap gesture detected, true' not detected!`);
    });

    it("gestures_03_longPress", async function () {
        const lblLongPress = await driver.waitForElement("Long Press here");
        await lblLongPress.hold(5000);
        const result = await driver.findElementByTextIfExists("Long Press gesture detected, true", SearchOptions.contains);
        assert.isTrue(result != null && result !== undefined, `Gestures event 'Long Press gesture detected, true' not detected!`);
    });

    it("gestures_longPress", async function () {
        const lblTapOrDoubleTap = await driver.waitForElement("Tap or Double Tap");
        const rect = await lblTapOrDoubleTap.getRectangle();
        await lblTapOrDoubleTap.doubleTap({ x: 20, y: 20 });
        let result = await driver.findElementByTextIfExists("Last action: Double tap gesture, true", SearchOptions.contains);
        assert.isTrue(result != null && result !== undefined, `Gestures event 'Last action: Double tap gesture, true' not detected!`);
        await driver.clickPoint(rect.x, rect.y);
        result = await driver.findElementByTextIfExists("Last action: Tap gesture, true", SearchOptions.contains);
        assert.isTrue(result != null && result !== undefined, `Gestures event 'Last action: Tap gesture, true' not detected!`);
    });

    it("gestures_04_swipe", async function () {
        const lblSwipe = await driver.waitForElement("Swipe here");
        await lblSwipe.swipe(Direction.left);
        const result = await driver.findElementByTextIfExists("Swipe Direction: 1, true", SearchOptions.contains);
        assert.isTrue(result != null && result !== undefined, `Gestures event 'Swipe Direction: 1, true' not detected!`);
    });

    it("gestures_05_pan", async function () {
        const lblSwipe = await driver.waitForElement("Pan here");
        await lblSwipe.pan([
            { x: 10, y: 20 },
            { x: 40, y: 30 },
            { x: 50, y: 60 }
        ], { x: 5, y: 5 });

        const result = await driver.findElementByTextIfExists("Pan deltaX", SearchOptions.contains);
        const text = await result.text();
        assert.isTrue(/Pan deltaX:([-+]?)\d+; deltaY:([-+]?)\d+;, true, states: ended/ig.test(text), `Gestures event 'Pan deltaX: ...' not detected!`);
    });

    it("gestures_06_pinch", async function () {
        const lblPan = await driver.waitForElement("Pinch here");
        await lblPan.pinch("out");
        const result = await driver.findElementByTextIfExists("Pinch Scale:", SearchOptions.contains);
        const text = await result.text();
        assert.isTrue(/Pinch Scale: \d+, true, states: ended/ig.test(text), `Gestures event '"Pinch Scale: 0, true, states: ended"' not detected!`);
    });

    it("gestures_07_rotate", async function () {
        const lblPan = await driver.waitForElement("Rotate here");
        await lblPan.rotate();
        const result = await driver.findElementByTextIfExists("Rotation: ", SearchOptions.contains);
        const text = await result.text();
        assert.isTrue(/Rotation: [a-z0-9 .,+-]\d+, true, states: ended/ig.test(text), `Gestures event 'rotate' not detected!`);
    });

    it("gestures_08_disconnectObserver", async function () {
        await gesturesPage.navigateBackToSuitMainPage();
        await gesturesPage.navigateToSample("gestures");
        const lblTap = await driver.waitForElement("Tap here");
        const rect = await lblTap.getRectangle();

        await gesturesPage.stopDetection();
        const result = await driver.findElementByTextIfExists("Gestures detection disabled", SearchOptions.contains);
        assert.isTrue(result != null && result !== undefined, `Gestures detection is not disabled!`);

        await driver.clickPoint(rect.x, rect.y);
        const lblTapResult = await driver.findElementByTextIfExists("Tap gesture detected, true", SearchOptions.contains);
        assert.isTrue(lblTapResult === null || lblTapResult === undefined, `Gestures event 'Tap gesture detected, true' detected but shouldn't since observables are disables!`);
    });
});