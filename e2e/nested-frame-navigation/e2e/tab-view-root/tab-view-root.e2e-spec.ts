import { AppiumDriver, createDriver, logWarn, nsCapabilities } from "nativescript-dev-appium";

import { Screen, playersData, teamsData } from "../screens/screen";
import * as shared from "../screens/shared";
import { suspendTime, appSuspendResume, dontKeepActivities, allTransitions } from "../config";
import { TabViewNavigationScreen } from "../screens/tabview-navigation-screen";

// NOTE: TabViewTop is Android only scenario (for iOS we will essentially execute 2x TabViewBottom)
const roots = ["TabViewTop", "TabViewBottom"];

describe("tab-view-root", async function () {
    let driver: AppiumDriver;
    let screen: Screen;
    let transitions = [...allTransitions];
    before(async function () {
        nsCapabilities.testReporter.context = this;
        logWarn(`====== tab-view-root ========`);
        driver = await createDriver();
        await driver.restartApp();
        screen = new TabViewNavigationScreen(driver);
        await driver.setDontKeepActivities(dontKeepActivities);
        driver.defaultWaitTime = 8000;
    });

    after(async function () {
        if (dontKeepActivities) {
            await driver.setDontKeepActivities(false);
        }
        if (driver.isIOS) {
            roots.shift();
            logWarn("TabViewTop is Android only scenario (for iOS it will be skipped)");
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
        describe(`tab-view-root-${root}-scenario:`, async function () {

            before(async function () {
                nsCapabilities.testReporter.context = this;
            });

            for (let index = 0; index < transitions.length; index++) {
                const transition = transitions[index];

                const playerOne = playersData[`playerOne${transition}`];
                const playerTwo = playersData[`playerTwo${transition}`];
                const teamOne = teamsData[`teamOne${transition}`];
                const teamTwo = teamsData[`teamTwo${transition}`];

                describe(`tab-view-root-${root}-transition-${transition}-scenario:`, async function () {

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

                    it(`loaded ${root} root with frames`, async function () {
                        await screen[`navigateTo${root}RootWithFrames`]();
                        await screen[`loaded${root}RootWithFrames`]();
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

                    it("toggle teams tab", async function () {
                        await screen.toggleTeamsTab();

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await driver.waitForElement(teamOne.name); // wait for teams list
                        }
                    });

                    it("loaded teams list", async function () {
                        await screen.loadedTeamsList();
                    });

                    it("mix player and team list actions and go back", async function () {
                        await screen.togglePlayersTab();

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await driver.waitForElement(playerOne.name); // wait for players list
                        }

                        await screen.loadedPlayersList();

                        await shared.testPlayerNavigated(playerTwo, screen);

                        if (driver.isIOS) {
                            if (appSuspendResume) {
                                await driver.backgroundApp(suspendTime);
                                await driver.waitForElement(playerTwo.name); // wait for player
                            }
                        }

                        await screen.toggleTeamsTab();

                        if (driver.isIOS) {
                            // TODO: run in background from appium breaks the test. Investigate the issue, once with the app and with appium
                            if (appSuspendResume) {
                                await driver.backgroundApp(suspendTime);
                                await driver.waitForElement(teamOne.name); // wait for teams list
                            }
                        }

                        await screen.loadedTeamsList();

                        await shared.testTeamNavigated(teamTwo, screen);

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await driver.waitForElement(teamTwo.name); // wait for team
                        }

                        await screen.togglePlayersTab();

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await driver.waitForElement(playerTwo.name); // wait for player
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
                        await screen.resetToHome();
                        await screen.loadedHome();
                    });
                });
            }
        });
    }
});
