import { AppiumDriver, createDriver, logWarn, nsCapabilities } from "nativescript-dev-appium";

import { Screen, playersData, somePage, teamsData, driverDefaultWaitTime, Item, stillOtherPage } from "./screen";
import { suspendTime, appSuspendResume, dontKeepActivities, transitions } from "./config";
import * as shared from "./shared.e2e-spec";

const rootType = "frame-root";
describe(rootType, async function () {
    let driver: AppiumDriver;
    let screen: Screen;

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        screen = new Screen(driver);
        if (dontKeepActivities) {
            await driver.setDontKeepActivities(true);
        }

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
        const teamOne: Item = teamsData[`teamOne${transition}`];
        const teamTwo: Item = teamsData[`teamTwo${transition}`];

        describe(`${rootType}-transition-${transition}-scenarios:`, async function () {
            before(async function () {
                nsCapabilities.testReporter.context = this;
                logWarn(`==== Transition ${transition}`);

                if (transition === "Flip" &&
                    driver.isAndroid && parseInt(driver.platformVersion) === 19) {
                    // TODO: known issue https://github.com/NativeScript/NativeScript/issues/6798
                    console.log("skipping flip transition tests on api level 19");
                    this.skip();
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

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedHome();
                }
            });

            it("loaded frame root with multi nested frames", async function () {
                await screen.navigateToPageWithMultiFrame();
                await screen.loadedPageWithMultiFrame();
            });

            it("loaded players list", async function () {
                await screen.loadedPlayersList();
            });

            it("loaded teams list", async function () {
                await screen.loadedTeamsList();
            });

            it("loaded player details and go back twice", async function () {
                await shared.testPlayerNavigated(playerTwo, screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedElement(playerTwo.description);
                }

                await shared.testPlayerNavigatedBack(screen, driver);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedElement(playerOne.name); // wait for players list
                }

                await shared.testPlayerNavigated(playerTwo, screen);
                await shared.testPlayerNavigatedBack(screen, driver);
            });

            it("navigate players parent frame and go back", async function () {
                await shared[`testSomePageNavigated${transition}`](screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedSomePage();
                }

                if (driver.isAndroid) {
                    await driver.navBack(); // some page back navigation
                } else {
                    await screen.goBackFromSomePage();
                }

                await screen.loadedPlayersList();
            });

            it("loaded players details and navigate parent frame and go back", async function () {
                await shared.testPlayerNavigated(playerTwo, screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedElement(playerTwo.description);
                }

                await shared[`testSomePageNavigated${transition}`](screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedSomePage();
                }

                if (driver.isAndroid) {
                    await driver.navBack(); // some page back navigation
                } else {
                    await screen.goBackFromSomePage();
                }

                await screen.loadedPlayerDetails(playerTwo);
                await screen.loadedTeamsList(); // assert visible & no changes

                await screen.goBackToPlayersList();
                await screen.loadedPlayersList();
            });

            it("loaded frame root with multi nested frames again", async function () {
                await screen.loadedPageWithMultiFrame();
            });

            it("loaded players list", async function () {
                await screen.loadedPlayersList();
            });

            it("loaded teams list", async function () {
                await screen.loadedTeamsList();
            });

            it("mix player and team list actions and go back", async function () {
                await shared.testPlayerNavigated(playerTwo, screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedElement(playerTwo.name);
                }

                await shared[`testSomePageNavigated${transition}`](screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedSomePage();
                }

                if (driver.isAndroid) {
                    await driver.navBack(); // some page back navigation
                } else {
                    await screen.goBackFromSomePage();
                }

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedElement(teamOne.name);
                }

                await screen.loadedPlayerDetails(playerTwo);  // assert no changes after back navigation
                await screen.loadedTeamsList(); // assert no changes after back navigation

                await shared.testTeamNavigated(teamTwo, screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedElement(teamTwo.name);
                }

                await shared[`testSomePageNavigated${transition}`](screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedSomePage();
                }

                if (driver.isAndroid) {
                    await driver.navBack(); // some page back navigation
                } else {
                    await screen.goBackFromSomePage();
                }

                await screen.loadedPlayerDetails(playerTwo);  // assert no changes after back navigation
                await screen.loadedTeamDetails(teamTwo);

                await screen.goBackToPlayersList();
                await screen.loadedPlayersList();

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedElement(playerOne.name); // wait for players list
                }

                await screen.goBackToTeamsList();
                await screen.loadedTeamsList();
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
