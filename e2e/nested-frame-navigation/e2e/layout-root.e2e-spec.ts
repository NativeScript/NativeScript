import { AppiumDriver, createDriver, logWarn, nsCapabilities } from "nativescript-dev-appium";

import { Screen, playersData, home, somePage, otherPage, teamsData, driverDefaultWaitTime } from "./screen";
import * as shared from "./shared.e2e-spec";
import { suspendTime, appSuspendResume, dontKeepActivities, transitions } from "./config";

const rootType = "layout-root";
describe(rootType, async function () {
    let driver: AppiumDriver;
    let screen: Screen;

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        screen = new Screen(driver);
        logWarn("====== layout-root ========");
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

        const playerOne = playersData[`playerOne${transition}`];
        const playerTwo = playersData[`playerTwo${transition}`];
        const teamOne = teamsData[`teamOne${transition}`];

        describe(`${rootType}-transition-${transition}-scenarios:`, async function () {

            before(async function () {
                nsCapabilities.testReporter.context = this;
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

            it("loaded layout root with multi nested frames", async function () {
                await screen.navigateToLayoutWithMultiFrame();
                await screen.loadedLayoutWithMultiFrame();
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

            it("navigate players parent frame and go back", async function () {
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

            it("loaded players details and navigate parent frame and go back", async function () {
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

            it("loaded layout root with multi nested frames again", async function () {
                await screen.loadedLayoutWithMultiFrame();
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
                    await driver.waitForElement(playerTwo.name); // wait for player
                }

                await shared[`testOtherPageNavigated${transition}`](screen); // "teams" parent frame navigation

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await driver.waitForElement(otherPage); // wait for other page
                }

                await screen.loadedPlayerDetails(playerTwo);  // assert no changes in the sibling frame

                if (driver.isAndroid) {
                    await driver.navBack(); // other page back navigation
                } else {
                    await screen.goBackFromOtherPage();
                }

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await driver.waitForElement(teamOne.name); // wait for teams list
                }

                await screen.loadedTeamsList();
                await screen.loadedPlayerDetails(playerTwo);  // assert no changes in the sibling frame

                await shared[`testOtherPageNavigated${transition}`](screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await driver.waitForElement(otherPage); // wait for other page
                }

                await shared[`testSomePageNavigated${transition}`](screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await driver.waitForElement(somePage); // wait for some page
                }

                await screen.loadedOtherPage(); // assert no changes in the sibling frame

                if (driver.isAndroid) {
                    await driver.navBack(); // some page back navigation
                } else {
                    await screen.goBackFromSomePage();
                }

                await screen.loadedPlayerDetails(playerTwo);

                await screen.goBackToPlayersList();
                await screen.loadedPlayersList();

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await driver.waitForElement(playerOne.name); // wait for players list
                }

                await screen.goBackFromOtherPage();

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await driver.waitForElement(teamOne.name); // wait for team
                }

                await screen.loadedTeamsList();
            });

            it("loaded home page again", async function () {
                await screen.resetToHome();
                await screen.loadedHome();
            });
        });
    }

    describe(`${rootType}-players-list-slide-transition with parent frame default transition:`, async function () {
        const playerOne = playersData["playerOneSlide"];
        const playerTwo = playersData["playerTwoSlide"];

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

    describe(`${rootType}-players-list-slide-transition with parent frame no transition:`, async function () {
        const playerOne = playersData["playerOneSlide"];
        const playerTwo = playersData["playerTwoSlide"];

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

    describe(`${rootType}-players-list-flip-transition with parent frame default transition:`, async function () {
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

    describe(`${rootType}-players-list-flip-transition with parent frame no transition:`, async function () {
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
