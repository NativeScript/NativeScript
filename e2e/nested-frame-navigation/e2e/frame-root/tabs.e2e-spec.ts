import { AppiumDriver, createDriver, logWarn, nsCapabilities } from "nativescript-dev-appium";

import { Screen, playersData, somePage, teamsData, driverDefaultWaitTime, Item } from "../screens/screen";
import * as shared from "../screens/shared";
import { suspendTime, appSuspendResume, dontKeepActivities, allTransitions } from "../config";
import { TabNavigationScreen } from "../screens/tab-navigation-screen";

const roots = ["TabsTop", "TabsBottom"];

describe("frame-root-with-tabs", async function () {
    let driver: AppiumDriver;
    let screen: Screen;
    let transitions = [...allTransitions];

    before(async function () {
        nsCapabilities.testReporter.context = this;
        logWarn(`====== frame-root-with-tabs ========`);
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

    for (let index = 0; index < roots.length; index++) {
        const root = roots[index];

        describe(`frame-root-with-tabs-${root} scenario:`, async function () {
            logWarn(`===== ${index++}. Root: ${root}`);
            for (let trIndex = 0; trIndex < transitions.length; trIndex++) {
                const transition = transitions[trIndex];
                const playerOne: Item = playersData[`playerOne${transition}`];
                const playerTwo: Item = playersData[`playerTwo${transition}`];
                const teamOne: Item = teamsData[`teamOne${transition}`];
                const teamTwo: Item = teamsData[`teamTwo${transition}`];

                describe(`frame-root-with-tabs-${root}-transition-${transition}-scenario:`, async function () {

                    before(async function () {
                        nsCapabilities.testReporter.context = this;
                        if (shared.isApiLevel19(driver) && (transition === "None" || transition === "Flip")) {
                            // TODO: known issue https://github.com/NativeScript/NativeScript/issues/6798
                            logWarn("Skipping flip or none transition tests on api level 19");
                            this.skip();
                        } else {
                            logWarn(`========= ${root}-${transition} =========`);
                        }
                    });

                    it("loaded home page", async function () {
                        await screen.loadedHome();
                    });

                    it(`loaded frame ${root} root with nested frames`, async function () {
                        await screen[`navigateToPage${root}WithFrames`]();
                        await screen[`loadedPage${root}WithFrames`]();
                    });

                    it("loaded players list", async function () {
                        await screen.loadedPlayersList();
                    });

                    it("loaded player details and go back twice", async function () {
                        await shared.testPlayerNavigated(playerTwo, screen);

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await screen.loadedElement(playerTwo.name); // wait for player
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
                            await screen.loadedElement(somePage); // wait for some page
                        }

                        if (driver.isAndroid) {
                            await driver.navBack();
                        } else {
                            await screen.goBackFromSomePage();
                        }

                        await screen.loadedPlayersList();
                    });

                    it("loaded player details and navigate parent frame and go back", async function () {
                        await shared.testPlayerNavigated(playerTwo, screen);

                        if (!shared.preventApplicationCrashCausedByAutomation(driver)) {
                            if (appSuspendResume) {
                                await driver.backgroundApp(suspendTime);
                                await screen.loadedElement(playerTwo.name); // wait for player
                            }
                        }

                        await shared[`testSomePageNavigated${transition}`](screen);

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await screen.loadedElement(somePage); // wait for some page
                        }

                        if (driver.isAndroid) {
                            await driver.navBack();
                        } else {
                            await screen.goBackFromSomePage();
                        }

                        await screen.loadedPlayerDetails(playerTwo);

                        await screen.goBackToPlayersList();
                        await screen.loadedPlayersList();
                    });

                    it("toggle teams tab", async function () {
                        await screen.toggleTeamsTab();

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await screen.loadedElement(teamOne.name); // wait for team
                        }
                    });

                    it("loaded teams list", async function () {
                        await screen.loadedTeamsList();
                    });

                    it("mix player and team list actions and go back", async function () {
                        await screen.togglePlayersTab();

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await screen.loadedElement(playerOne.name); // wait for players list
                        }

                        await screen.loadedPlayersList();

                        await shared.testPlayerNavigated(playerTwo, screen);

                        if (!shared.preventApplicationCrashCausedByAutomation(driver)) {
                            if (appSuspendResume) {
                                await driver.backgroundApp(suspendTime);
                                await screen.loadedElement(playerTwo.name); // wait for player
                            }
                        }

                        await screen.loadedPlayerDetails(playerTwo);

                        await shared[`testSomePageNavigated${transition}`](screen);

                        if (!shared.preventApplicationCrashCausedByAutomation(driver)) {
                            if (appSuspendResume) {
                                await driver.backgroundApp(suspendTime);
                                await screen.loadedElement(somePage); // wait for some page
                            }
                        }

                        if (driver.isAndroid) {
                            await driver.navBack();
                        } else {
                            await screen.goBackFromSomePage();
                        }

                        if (!shared.preventApplicationCrashCausedByAutomation(driver)) {
                            if (appSuspendResume) {
                                // This sleeps prevent test to fail
                                await driver.sleep(1000);
                                await driver.backgroundApp(suspendTime);
                                await screen.loadedElement(playerTwo.name); // wait for player
                            }
                        }

                        await screen.loadedPlayerDetails(playerTwo);

                        await screen.toggleTeamsTab();

                        if (!shared.preventApplicationCrashCausedByAutomation(driver)) {
                            if (appSuspendResume) {
                                await driver.backgroundApp(suspendTime);
                                await screen.loadedElement(teamOne.name); // wait for teams list
                            }
                        }

                        await screen.loadedTeamsList();

                        await shared.testTeamNavigated(teamTwo, screen);

                        if (!shared.preventApplicationCrashCausedByAutomation(driver)) {
                            if (appSuspendResume) {
                                await screen.loadedElement(teamTwo.name); // wait for team
                                await driver.backgroundApp(suspendTime);
                                await screen.loadedElement(teamTwo.name); // wait for team
                            }
                        }

                        await screen.loadedTeamDetails(teamTwo);

                        await shared[`testSomePageNavigated${transition}`](screen);

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await screen.loadedElement(somePage); // wait for some page
                        }

                        if (driver.isAndroid) {
                            await driver.navBack();
                        } else {
                            await screen.goBackFromSomePage();
                        }

                        if (appSuspendResume) {
                            await screen.loadedElement(teamTwo.name); // wait for team
                            await driver.backgroundApp(suspendTime);
                            await screen.loadedElement(teamTwo.name); // wait for team
                        }

                        await screen.loadedTeamDetails(teamTwo);

                        await screen.togglePlayersTab();

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await screen.loadedElement(playerTwo.name); // wait for player
                        }

                        await screen.loadedPlayerDetails(playerTwo);

                        await screen.toggleTeamsTab();

                        await screen.goBackToTeamsList();
                        await screen.loadedTeamsList();

                        await screen.togglePlayersTab();

                        await screen.goBackToPlayersList();
                        await screen.loadedPlayersList();
                    });

                    it("loaded home page again", async function () {
                        await screen[`goBackFrom${root}Page`]();
                        await screen.loadedHome();
                    });
                });
            }
        });
    }
});