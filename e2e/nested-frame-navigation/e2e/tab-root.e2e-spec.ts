import { AppiumDriver, createDriver } from "nativescript-dev-appium";
import { Screen, playerOne, playerTwo, teamOne, teamTwo } from "./screen"
import {
    testPlayerNavigated,
    testPlayerNavigatedBack,
    testTeamNavigated
} from "./shared.e2e-spec"

const roots = ["TabTop", "TabBottom"];

function hyphenate(s: string) {
    return s.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
}

describe("tab-root:", () => {
    let driver: AppiumDriver;
    let screen: Screen;

    before(async () => {
        driver = await createDriver();
        screen = new Screen(driver);
    });

    after(async () => {
        await driver.quit();
        console.log("Quit driver!");
    });

    roots.forEach(root => {
        const rootWithHyphen = hyphenate(root);

        describe(`${rootWithHyphen} scenarios:`, () => {

            afterEach(async function () {
                if (this.currentTest.state === "failed") {
                    await driver.logTestArtifacts(this.currentTest.title);
                }
            });

            it("loaded home page", async () => {
                await screen.loadedHome();
            });

            it(`loaded ${rootWithHyphen} root with frames`, async () => {
                await screen[`navigateTo${root}RootWithFrames`]();
                await screen[`loaded${root}RootWithFrames`]();
            });

            it("loaded players list", async () => {
                await screen.loadedPlayersList();
            });

            it("loaded player details and go back twice", async () => {
                await testPlayerNavigated(playerOne, screen);
                await testPlayerNavigatedBack(screen, driver);
        
                await testPlayerNavigated(playerTwo, screen);
                await testPlayerNavigatedBack(screen, driver);
            });

            it("toggle teams tab", async () => {
                await screen.toggleTeamsTab();
            });

            it("loaded teams list", async () => {
                await screen.loadedTeamsList();
            });

            it("mix player and team list actions and go back", async () => {
                await screen.togglePlayersTab();
                await screen.loadedPlayersList();

                await testPlayerNavigated(playerTwo, screen);

                await screen.toggleTeamsTab();
                await screen.loadedTeamsList();

                await testTeamNavigated(teamOne, screen);

                await screen.togglePlayersTab();

                await screen.loadedPlayerDetails(playerTwo);

                await screen.toggleTeamsTab();

                await screen.goBackToTeamsList();
                await screen.loadedTeamsList();

                await screen.togglePlayersTab();
                
                await screen.goBackToPlayersList();
                await screen.loadedPlayersList();
            });

            it("loaded home page again", async () => {
                await screen.resetToHome();
                await screen.loadedHome();
            });
        });
    });
});
