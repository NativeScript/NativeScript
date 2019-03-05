import { AppiumDriver, createDriver, logWarn } from "nativescript-dev-appium";

import { Screen, playersData, home, somePage, teamsData, driverDefaultWaitTime, Item } from "./screen";
import * as shared from "./shared.e2e-spec";
import { suspendTime, appSuspendResume, dontKeepActivities, transitions } from "./config";

describe("frame-root:", () => {
    let driver: AppiumDriver;
    let screen: Screen;

    before(async () => {
        driver = await createDriver();
        screen = new Screen(driver);
        if (dontKeepActivities) {
            await driver.setDontKeepActivities(true);
        }

        driver.defaultWaitTime = driverDefaultWaitTime;
    });

    after(async () => {
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

        describe(`transition: ${transition} scenarios:`, () => {
            before(async function () {
                logWarn(`==== Transition ${transition}`);

                if (transition === "Flip" &&
                    driver.isAndroid && parseInt(driver.platformVersion) === 19) {
                    // TODO: known issue https://github.com/NativeScript/NativeScript/issues/6798
                    console.log("skipping flip transition tests on api level 19");
                    this.skip();
                }
            });

            it("loaded home page", async () => {
                await screen.loadedHome();
            });

            it("loaded frame root with nested frame", async () => {
                await screen.navigateToPageWithFrame();
                await screen.loadedPageWithFrame();
            });

            it("loaded players list", async () => {
                await screen.loadedPlayersList();
            });

            it("loaded player details and go back twice", async () => {
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

            it("navigate parent frame and go back", async () => {
                await shared[`testSomePageNavigated${transition}`](screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedSomePage() // wait for some page
                }

                if (driver.isAndroid) {
                    await driver.navBack(); // some page back navigation
                } else {
                    await screen.goBackFromSomePage();
                }

                await screen.loadedPlayersList();
            });

            it("loaded player details and navigate parent frame and go back", async () => {
                await shared.testPlayerNavigated(playerTwo, screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedElement(playerTwo.name);
                }

                await shared[`testSomePageNavigated${transition}`](screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedSomePage() // wait for some page
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

            it("loaded home page again", async () => {
                await screen.goBackFromFrameHome();
                await screen.loadedHome();

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedHome();
                }
            });

            it("loaded frame root with multi nested frames", async () => {
                await screen.navigateToPageWithMultiFrame();
                await screen.loadedPageWithMultiFrame();
            });

            it("loaded players list", async () => {
                await screen.loadedPlayersList();
            });

            it("loaded teams list", async () => {
                await screen.loadedTeamsList();
            });

            it("loaded player details and go back twice", async () => {
                await shared.testPlayerNavigated(playerTwo, screen);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedElement(playerTwo.description);
                }

                await shared.testPlayerNavigatedBack(screen, driver);

                if (appSuspendResume) {
                    await driver.backgroundApp(suspendTime);
                    await screen.loadedElement(playerOne.name) // wait for players list
                }

                await shared.testPlayerNavigated(playerTwo, screen);
                await shared.testPlayerNavigatedBack(screen, driver);
            });

            it("navigate players parent frame and go back", async () => {
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

            it("loaded players details and navigate parent frame and go back", async () => {
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

            it("loaded frame root with multi nested frames again", async () => {
                await screen.loadedPageWithMultiFrame();
            });

            it("loaded players list", async () => {
                await screen.loadedPlayersList();
            });

            it("loaded teams list", async () => {
                await screen.loadedTeamsList();
            });

            it("mix player and team list actions and go back", async () => {
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

            it("loaded home page again", async () => {
                await screen.goBackFromFrameHome();
                await screen.loadedHome();
            });
        });
    };
});
