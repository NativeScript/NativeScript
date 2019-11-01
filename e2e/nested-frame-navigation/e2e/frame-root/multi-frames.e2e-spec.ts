
import { AppiumDriver, createDriver, logWarn, nsCapabilities } from "nativescript-dev-appium";

import { Screen, playersData, teamsData, driverDefaultWaitTime, Item } from "../screens/screen";
import { suspendTime, appSuspendResume, dontKeepActivities, allTransitions } from "../config";
import * as shared from "../screens/shared";
import { TabNavigationScreen } from "../screens/tab-navigation-screen";

describe("frame-root-with-multi-frames", async function () {
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
        const teamOne: Item = teamsData[`teamOne${transition}`];
        const teamTwo: Item = teamsData[`teamTwo${transition}`];

        describe(`frame-root-with-multi-frames-transition-${transition}-scenario:`, async function () {
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
});
