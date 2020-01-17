import { AppiumDriver, createDriver, logWarn, nsCapabilities } from "nativescript-dev-appium";

import { Screen, playersData, somePage, driverDefaultWaitTime, Item, stillOtherPage } from "../screens/screen";
import { suspendTime, appSuspendResume, dontKeepActivities, allTransitions } from "../config";
import * as shared from "../screens/shared";
import { TabNavigationScreen } from "../screens/tab-navigation-screen";

describe("frame-root-with-single-frame", async function () {
    let driver: AppiumDriver;
    let screen: Screen;
    let transitions = [...allTransitions];

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        await driver.restartApp();
        screen = new TabNavigationScreen(driver);
        await driver.setDontKeepActivities(dontKeepActivities);
        driver.defaultWaitTime = driverDefaultWaitTime;
    });

    after(async function () {
        if (dontKeepActivities) {
            await driver.setDontKeepActivities(false);
        }
        await driver.quit();
        console.log("Quit driver!");
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
        }
    });

    for (let index = 0; index < transitions.length; index++) {
        const transition = transitions[index];

        const playerOne: Item = playersData[`playerOne${transition}`];
        const playerTwo: Item = playersData[`playerTwo${transition}`];

        describe(`frame-root-with-single-frame-transition-${transition}-scenario:`, async function () {
            before(async function () {
                nsCapabilities.testReporter.context = this;
                if (shared.isApiLevel19(driver) && (transition === "None" || transition === "Flip")) {
                    // TODO: known issue https://github.com/NativeScript/NativeScript/issues/6798
                    logWarn("Skipping flip or none transition tests on api level 19");
                    this.skip();
                } else {
                    logWarn(`==== ${index}. Transition ${transition}`);
                }
            });

            it("loaded home page", async function () {
                await screen.loadedHome();
            });

            it("loaded frame root with nested frame", async function () {
                await screen.navigateToPageWithFrame();
                await screen.loadedPageWithFrame();
            });

            it("loaded players list", async function () {
                await screen.loadedPlayersList();
            });

            it("loaded player details and go back twice", async function () {
                await shared.testPlayerNavigated(playerTwo, screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedElement(playerTwo.name);
                }

                await shared.testPlayerNavigatedBack(screen, driver);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedElement(playerOne.name);
                }

                await shared.testPlayerNavigated(playerTwo, screen);
                await shared.testPlayerNavigatedBack(screen, driver);
            });

            it("navigate parent frame and go back", async function () {
                await shared[`testSomePageNavigated${transition}`](screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedSomePage(); // wait for some page
                }

                if (driver.isAndroid) {
                    await driver.navBack(); // some page back navigation
                } else {
                    await screen.goBackFromSomePage();
                }

                await screen.loadedPlayersList();
            });

            it("loaded player details and navigate parent frame and go back", async function () {
                await shared.testPlayerNavigated(playerTwo, screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedElement(playerTwo.name);
                }

                await shared[`testSomePageNavigated${transition}`](screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedSomePage(); // wait for some page
                }

                if (driver.isAndroid) {
                    await driver.navBack(); // some page back navigation
                } else {
                    await screen.goBackFromSomePage();
                }

                await screen.loadedPlayerDetails(playerTwo);

                await screen.goBackToPlayersList();
                await screen.loadedPlayersList();
            });

            it("loaded home page again", async function () {
                await screen.goBackFromFrameHome();
                await screen.loadedHome();
            });
        });
    }

    describe("frame to nested frame with non-default transition", async function () { 
        const playerOne = playersData["playerOneSlide"];

        before(async function () {
            nsCapabilities.testReporter.context = this;
        });

        it("loaded home page", async function () {
            await screen.loadedHome();
        });

        it("loaded frame root with nested frame non-default transition", async function () {
            await screen.navigateToPageWithFrameNonDefaultTransition();
            await screen.loadedPageWithFrame();
        });

        it("go back to home page again", async function () {
            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(playerOne.name); // wait for players list
            }

            await screen.goBackFromFrameHome();
            await screen.loadedHome();
        });
    });

    describe("nested frame to frame with non-default transition", async function () {

        before(async function () {
            nsCapabilities.testReporter.context = this;
        });

        it("loaded home page", async function () {
            await screen.loadedHome();
        });

        it("loaded frame root with nested frame", async function () {
            await screen.navigateToPageWithFrame();
            await screen.loadedPageWithFrame();
        });

        it("navigate to some page with slide transition", async function () {
            shared.testSomePageNavigatedSlide(screen);

            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(somePage); // wait for some page
            }
        });

        it("navigate to still other page and go back twice", async function () {
            shared.testStillOtherPageNavigatedSlide(screen);

            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(stillOtherPage); // wait for still other page
            }

            if (driver.isAndroid) {
                await driver.navBack(); // some page back navigation
            } else {
                await screen.goBackFromStillOtherPage();
            }

            await screen.loadedSomePage();

            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(somePage); // wait for some page
            }

            shared.testStillOtherPageNavigatedSlide(screen);

            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(stillOtherPage); // wait for still other page
            }

            if (driver.isAndroid) {
                await driver.navBack(); // some page back navigation
            } else {
                await screen.goBackFromStillOtherPage();
            }

            await screen.loadedSomePage();
        });

        it("go back to home page again", async function () {
            await screen.goBackFromSomePage();

            await screen.goBackFromFrameHome();

            await screen.loadedHome();
        });
    });
});
