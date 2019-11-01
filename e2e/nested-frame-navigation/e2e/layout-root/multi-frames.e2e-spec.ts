import { AppiumDriver, createDriver, logWarn, nsCapabilities } from "nativescript-dev-appium";

import { Screen, playersData, somePage, otherPage, teamsData, driverDefaultWaitTime } from "../screens/screen";
import * as shared from "../screens/shared";
import { suspendTime, appSuspendResume, dontKeepActivities, allTransitions } from "../config";
import { TabNavigationScreen } from "../screens/tab-navigation-screen";

describe("layout-root-with-multi-frames", async function () {
    let driver: AppiumDriver;
    let screen: Screen;
    let transitions = [...allTransitions];

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
        await driver.restartApp();
        screen = new TabNavigationScreen(driver);
        logWarn("====== layout-root-with-multi-frames ========");
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
        const transition = allTransitions[index];

        const playerOne = playersData[`playerOne${transition}`];
        const playerTwo = playersData[`playerTwo${transition}`];
        const teamOne = teamsData[`teamOne${transition}`];

        describe(`layout-root-with-multi-frames-transition-${transition}-scenario:`, async function () {

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

            it("loaded layout root with multi nested frames", async function () {
                await screen.loadedHome();

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
});
