import { AppiumDriver, createDriver } from "nativescript-dev-appium";
import { Screen, playerOne, playerTwo, teamTwo } from "./screen"
import {
    testPlayerNavigated,
    testPlayerNavigatedBack,
    testSomePageNavigated,
    testTeamNavigated
} from "./shared.e2e-spec"

describe("frame-root:", () => {
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

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
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
        await testPlayerNavigated(playerOne, screen);
        await testPlayerNavigatedBack(screen, driver);

        await testPlayerNavigated(playerTwo, screen);
        await testPlayerNavigatedBack(screen, driver);
    });

    it("navigate parent frame and go back", async () => {
        await testSomePageNavigated(screen);
        
        await driver.navBack(); // some page back navigation
        await screen.loadedPlayersList();
    });

    it("loaded player details and navigate parent frame and go back", async () => {
        await testPlayerNavigated(playerOne, screen);
        await testSomePageNavigated(screen);

        await driver.navBack(); // some page back navigation
        await screen.loadedPlayerDetails(playerOne);

        await screen.goBackToPlayersList();
        await screen.loadedPlayersList();
    });

    it("loaded home page again", async () => {
        await screen.goBackFromFrameHome();
        await screen.loadedHome();
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
        await testPlayerNavigated(playerOne, screen);
        await testPlayerNavigatedBack(screen, driver);

        await testPlayerNavigated(playerTwo, screen);
        await testPlayerNavigatedBack(screen, driver);
    });

    it("navigate players parent frame and go back", async () => {
        await testSomePageNavigated(screen);

        await driver.navBack(); // some page back navigation
        await screen.loadedPlayersList();
    });

    it("loaded players details and navigate parent frame and go back", async () => {
        await testPlayerNavigated(playerOne, screen);
        await testSomePageNavigated(screen);

        await driver.navBack(); // some page back navigation
        await screen.loadedPlayerDetails(playerOne);
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

    it ("mix player and team list actions and go back", async () => {
        await testPlayerNavigated(playerOne, screen);

        await testSomePageNavigated(screen);

        await driver.navBack(); // some page back navigation
        await screen.loadedPlayerDetails(playerOne);  // assert no changes after back navigation
        await screen.loadedTeamsList(); // assert no changes after back navigation

        await testTeamNavigated(teamTwo, screen);
        await testSomePageNavigated(screen);

        await driver.navBack(); // some page back navigation
        await screen.loadedPlayerDetails(playerOne);  // assert no changes after back navigation
        await screen.loadedTeamDetails(teamTwo);

        await screen.goBackToPlayersList();
        await screen.loadedPlayersList();

        await screen.goBackToTeamsList();
        await screen.loadedTeamsList();
    });
});
