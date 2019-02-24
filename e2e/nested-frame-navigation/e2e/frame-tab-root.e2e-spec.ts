import { AppiumDriver, createDriver } from "nativescript-dev-appium";

import { Screen, playersData, somePage, teamsData, driverDefaultWaitTime } from "./screen";
import * as shared from "./shared.e2e-spec";
import { suspendTime, appSuspendResume, dontKeepActivities, transitions } from "./config";

// NOTE: TabTop is Android only scenario (for iOS we will essentially execute 2x TabBottom)
const roots = ["TabTop", "TabBottom"];

function hyphenate(s: string) {
    return s.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
}

describe("frame-tab-root:", () => {
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

    roots.forEach(root => {
        const rootWithHyphen = hyphenate(root);

        describe(`${rootWithHyphen} scenarios:`, () => {

            transitions.forEach(transition => {
                const playerOne = playersData[`playerOne${transition}`];
                const playerTwo = playersData[`playerTwo${transition}`];
                const teamOne = teamsData[`teamOne${transition}`];
                const teamTwo = teamsData[`teamTwo${transition}`];
        
                describe(`transition: ${transition} scenarios:`, () => {

                    it("loaded home page", async () => {
                        await screen.loadedHome();
                    });

                    it(`loaded frame ${rootWithHyphen} root with nested frames`, async () => {
                        await screen[`navigateToPage${root}WithFrames`]();
                        await screen[`loadedPage${root}WithFrames`]();
                    });

                    it("loaded players list", async () => {
                        await screen.loadedPlayersList();
                    });
                
                    it("loaded player details and go back twice", async () => {
                        await shared.testPlayerNavigated(playerTwo, screen);

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await driver.waitForElement(playerTwo.name) // wait for player
                        }

                        await shared.testPlayerNavigatedBack(screen, driver);

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await driver.waitForElement(playerOne.name) // wait for players list
                        }
                
                        await shared.testPlayerNavigated(playerTwo, screen);
                        await shared.testPlayerNavigatedBack(screen, driver);
                    });
                
                    it("navigate parent frame and go back", async () => {
                        await shared[`testSomePageNavigated${transition}`](screen);

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await driver.waitForElement(somePage) // wait for some page
                        }
                        
                        if (driver.isAndroid) {
                            await driver.navBack();
                        } else {
                            await screen.goBackFromSomePage();
                        }

                        await screen.loadedPlayersList();
                    });
                
                    it("loaded player details and navigate parent frame and go back", async () => {
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
                            await driver.navBack();
                        } else {
                            await screen.goBackFromSomePage();
                        }

                        await screen.loadedPlayerDetails(playerTwo);
                
                        await screen.goBackToPlayersList();
                        await screen.loadedPlayersList();
                    });

                    it("toggle teams tab", async () => {
                        await screen.toggleTeamsTab();

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await driver.waitForElement(teamOne.name); // wait for team
                        }
                    });

                    it("loaded teams list", async () => {
                        await screen.loadedTeamsList();
                    });

                    it("mix player and team list actions and go back", async () => {
                        await screen.togglePlayersTab();

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await driver.waitForElement(playerOne.name); // wait for players list
                        }

                        await screen.loadedPlayersList();

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
                            await driver.navBack();
                        } else {
                            await screen.goBackFromSomePage();
                        }

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await driver.waitForElement(playerTwo.name); // wait for player
                        }

                        await screen.loadedPlayerDetails(playerTwo);

                        await screen.toggleTeamsTab();

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await driver.waitForElement(teamOne.name); // wait for teams list
                        }

                        await screen.loadedTeamsList();

                        await shared.testTeamNavigated(teamTwo, screen);

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await driver.waitForElement(teamTwo.name); // wait for team
                        }

                        await shared[`testSomePageNavigated${transition}`](screen);

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await driver.waitForElement(somePage); // wait for some page
                        }

                        if (driver.isAndroid) {
                            await driver.navBack();
                        } else {
                            await screen.goBackFromSomePage();
                        }

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await driver.waitForElement(teamTwo.name); // wait for team
                        }

                        await screen.loadedTeamDetails(teamTwo);

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

                    it("loaded home page again", async () => {
                        await screen[`goBackFrom${root}Page`]();
                        await screen.loadedHome();
                    });
                });
            });
        });
    });
});