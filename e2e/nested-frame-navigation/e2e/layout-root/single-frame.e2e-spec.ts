import { AppiumDriver, createDriver, logWarn, nsCapabilities } from "nativescript-dev-appium";

import { Screen, playersData, home, somePage, teamsData, driverDefaultWaitTime } from "../screens/screen";
import * as shared from "../screens/shared";
import { suspendTime, appSuspendResume, dontKeepActivities, allTransitions } from "../config";
import { TabNavigationScreen } from "../screens/tab-navigation-screen";

describe("layout-root-with-single-frame", async function () {
    let driver: AppiumDriver;
    let screen: Screen;
    let transitions = [...allTransitions];

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        await driver.restartApp();
        screen = new TabNavigationScreen(driver);
        logWarn("====== layout-root-with-single-frame ========");
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

        const playerOne = playersData[`playerOne${transition}`];
        const playerTwo = playersData[`playerTwo${transition}`];

        describe(`layout-root-with-single-frame-transition-${transition}-scenario:`, async function () {

            before(async function () {
                nsCapabilities.testReporter.context = this;
                if (shared.isApiLevel19(driver) && (transition === "None" || transition === "Flip")) {
                    // TODO: known issue https://github.com/NativeScript/NativeScript/issues/6798
                    logWarn("Skipping flip or none transition tests on api level 19");
                    this.skip();
                } else {
                    logWarn(`========= ${index}. ${transition} =========`);
                }
            });

            it("loaded home page", async function () {
                await screen.loadedHome();
            });

            it("loaded layout root with nested frames", async function () {
                await screen.navigateToLayoutWithFrame();
                await screen.loadedLayoutWithFrame();
            });

            it("loaded players list", async function () {
                await screen.loadedPlayersList();
            });

            it("loaded player details and go back twice", async function () {
                await shared.testPlayerNavigated(playerTwo, screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await driver.waitForElement(playerTwo.name); // wait for player
                }

                await shared.testPlayerNavigatedBack(screen, driver);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await driver.waitForElement(playerOne.name); // wait for players list
                }

                await shared.testPlayerNavigated(playerTwo, screen);
                await shared.testPlayerNavigatedBack(screen, driver);
            });

            it("navigate parent frame and go back", async function () {
                await shared[`testSomePageNavigated${transition}`](screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await driver.waitForElement(somePage); // wait for some page
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
                    await driver.waitForElement(playerTwo.name); // wait for player
                }

                await shared[`testSomePageNavigated${transition}`](screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await driver.waitForElement(somePage); // wait for some page
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
                await screen.resetToHome();
                await screen.loadedHome();

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await driver.waitForElement(home); // wait for home page
                }
            });
        });
    }

    describe(`layout-root-with-single-frame-players-list-slide-transition with parent frame default transition:`, async function () {
        const playerOne = playersData["playerOneSlide"];
        const playerTwo = playersData["playerTwoSlide"];

        before(async function () {
            nsCapabilities.testReporter.context = this;
        });

        it("loaded layout root with nested frames", async function () {
            await screen.navigateToLayoutWithFrame();
            await screen.loadedLayoutWithFrame();
        });

        it("loaded players list", async function () {
            await screen.loadedPlayersList();
        });

        it("loaded player details with slide", async function () {
            await shared.testPlayerNavigated(playerTwo, screen);

            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(playerTwo.name); // wait for player
            }
        });

        it("navigate parent frame and go back", async function () {
            await shared.testSomePageNavigatedDefault(screen);

            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(somePage); // wait for some page
            }

            if (driver.isAndroid) {
                await driver.navBack(); // some page back navigation
            } else {
                await screen.goBackFromSomePage();
            }

            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(playerTwo.name); // wait for player
            }

            await screen.loadedPlayerDetails(playerTwo);
        });

        it("loaded player list", async function () {
            await screen.goBackToPlayersList();

            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(playerOne.name); // wait for players list
            }
        });

        it("loaded home page again", async function () {
            await screen.resetToHome();
            await screen.loadedHome();
        });
    });

    describe(`layout-root-with-single-frame-players-list-slide-transition with parent frame no transition:`, async function () {
        const playerOne = playersData["playerOneSlide"];
        const playerTwo = playersData["playerTwoSlide"];

        before(async function () {
            nsCapabilities.testReporter.context = this;
            if (shared.isApiLevel19(driver)) {
                // TODO: known issue https://github.com/NativeScript/NativeScript/issues/6798
                logWarn("Skip tests on api level 19");
                this.skip();
            }
        });

        it("loaded layout root with nested frames", async function () {
            await screen.navigateToLayoutWithFrame();
            await screen.loadedLayoutWithFrame();
        });

        it("loaded players list", async function () {
            await screen.loadedPlayersList();
        });

        it("loaded player details with slide", async function () {
            await shared.testPlayerNavigated(playerTwo, screen);

            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(playerTwo.name); // wait for player
            }
        });

        it("navigate parent frame and go back", async function () {
            await shared.testSomePageNavigatedNone(screen);

            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(somePage); // wait for some page
            }

            if (driver.isAndroid) {
                await driver.navBack(); // some page back navigation
            } else {
                await screen.goBackFromSomePage();
            }

            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(playerTwo.name); // wait for player
            }

            await screen.loadedPlayerDetails(playerTwo);
        });

        it("loaded player list", async function () {
            await screen.goBackToPlayersList();

            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(playerOne.name); // wait for players list
            }
        });

        it("loaded home page again", async function () {
            await screen.resetToHome();
            await screen.loadedHome();
        });
    });

    describe(`layout-root-with-single-frame-players-list-flip-transition with parent frame default transition:`, async function () {
        const playerOne = playersData["playerOneFlip"];
        const playerTwo = playersData["playerTwoFlip"];

        before(async function () {
            nsCapabilities.testReporter.context = this;
        });

        it("loaded layout root with nested frames", async function () {
            await screen.navigateToLayoutWithFrame();
            await screen.loadedLayoutWithFrame();
        });

        it("loaded players list", async function () {
            await screen.loadedPlayersList();
        });

        it("loaded player details with slide", async function () {
            await shared.testPlayerNavigated(playerTwo, screen);

            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(playerTwo.name); // wait for player
            }
        });

        it("navigate parent frame and go back", async function () {
            await shared.testSomePageNavigatedDefault(screen);

            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(somePage); // wait for some page
            }

            if (driver.isAndroid) {
                await driver.navBack(); // some page back navigation
            } else {
                await screen.goBackFromSomePage();
            }

            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(playerTwo.name); // wait for player
            }

            await screen.loadedPlayerDetails(playerTwo);
        });

        it("loaded player list", async function () {
            await screen.goBackToPlayersList();

            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(playerOne.name); // wait for players list
            }
        });

        it("loaded home page again", async function () {
            await screen.resetToHome();
            await screen.loadedHome();
        });
    });

    describe(`layout-root-with-single-frame-players-list-flip-transition with parent frame no transition:`, async function () {
        const playerOne = playersData["playerOneFlip"];
        const playerTwo = playersData["playerTwoFlip"];

        before(async function () {
            nsCapabilities.testReporter.context = this;
            if (shared.isApiLevel19(driver)) {
                // TODO: known issue https://github.com/NativeScript/NativeScript/issues/6798
                logWarn("Skip tests on api level 19");
                this.skip();
            }
        });

        it("loaded layout root with nested frames", async function () {
            await screen.navigateToLayoutWithFrame();
            await screen.loadedLayoutWithFrame();
        });

        it("loaded players list", async function () {
            await screen.loadedPlayersList();
        });

        it("loaded player details with slide", async function () {
            await shared.testPlayerNavigated(playerTwo, screen);

            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(playerTwo.name); // wait for player
            }
        });

        it("navigate parent frame and go back", async function () {
            await shared.testSomePageNavigatedNone(screen);

            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(somePage); // wait for some page
            }

            if (driver.isAndroid) {
                await driver.navBack(); // some page back navigation
            } else {
                await screen.goBackFromSomePage();
            }

            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(playerTwo.name); // wait for player
            }

            await screen.loadedPlayerDetails(playerTwo);
        });

        it("loaded player list", async function () {
            await screen.goBackToPlayersList();

            if (appSuspendResume) {
                await driver.backgroundApp(suspendTime);
                await driver.waitForElement(playerOne.name); // wait for players list
            }
        });

        it("loaded home page again", async function () {
            await screen.resetToHome();
            await screen.loadedHome();
        });
    });
});
