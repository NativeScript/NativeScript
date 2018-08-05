import { AppiumDriver, createDriver } from "nativescript-dev-appium";
import { Screen } from "./screen"
import {
    roots,
    modalFrameBackground,
    testSecondPageBackground,
    testSecondPageClose,
    testNestedModalFrameBackground,
    testNestedModalPageBackground,
    testDialogBackground
} from "./shared.e2e-spec"

describe("modal-frame:", function () {
    this.retries(2);
    let driver: AppiumDriver;
    let screen: Screen;

    before(async () => {
        driver = await createDriver();
        screen = new Screen(driver);
    });

    roots.forEach(root => {
        describe(`${root} modal frame background scenarios:`, () => {

            before(async () => {
                await screen[root]();
            });

            const prepareImageName = (prefix, imageName) => `${prefix}_${imageName.replace(" ", "_").replace(",", "_")}`;
            beforeEach(async function () {
                await driver.logTestArtifacts(prepareImageName("before", this.currentTest.title));
                await screen.loadModalFrame();
            });

            afterEach(async function () {
                if (this.currentTest.state === "failed") {
                    await driver.resetApp();
                    await screen[root]();
                } else {
                    await driver.logTestArtifacts(prepareImageName("fail_after", this.currentTest.title));
                }
            });

            after(async () => {
                await screen.closeModal();
                await screen.loadedHome();
            });

            it("should show dialog confirm, run in background", async () => {
                await testDialogBackground(driver, screen);
            });

            it("should run modal page with frame in background", async () => {
                await modalFrameBackground(driver, screen);
            });

            it("should navigate to second page, run in background, go back", async () => {
                await testSecondPageBackground(driver, screen);
            });

            it("should show nested modal page with frame, run in background, close", async () => {
                await testNestedModalFrameBackground(driver, screen);
            });

            it("should show nested modal page, run in background, close", async () => {
                await testNestedModalPageBackground(driver, screen);
            });

            it("should navigate to second page, close", async () => {
                await testSecondPageClose(driver, screen);
            });

            it("should navigate to second page, run in background, go back", async () => {
                await testSecondPageBackground(driver, screen);
            });
        });
    });
});
