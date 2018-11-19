import { AppiumDriver, createDriver } from "nativescript-dev-appium";
import { Screen, playerOne, playerTwo } from "./screen"
import {
    testPlayerNavigated,
    testPlayerNavigatedBack,
    testSomePageNavigated,
    testOtherPageNavigated
} from "./shared.e2e-spec"

describe("layout-root:", () => {
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

    it("loaded layout root with nested frames", async () => {
        await screen.navigateToLayoutWithFrame();
        await screen.loadedLayoutWithFrame();
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
        await screen.resetToHome();
        await screen.loadedHome();
    });

    it("loaded layout root with multi nested frames", async () => {
        await screen.navigateToLayoutWithMultiFrame();
        await screen.loadedLayoutWithMultiFrame();
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

        await screen.goBackToPlayersList();
        await screen.loadedPlayersList();
    });

    it("loaded layout root with multi nested frames again", async () => {
        await screen.loadedLayoutWithMultiFrame();
    });

    it("loaded players list", async () => {
        await screen.loadedPlayersList();
    });

    it("loaded teams list", async () => {
        await screen.loadedTeamsList();
    });

    it ("mix player and team list actions and go back", async () => {
        await testPlayerNavigated(playerOne, screen);

        await testOtherPageNavigated(screen); // "teams" parent frame navigation
        await screen.loadedPlayerDetails(playerOne);  // assert no changes in the sibling frame

        await driver.navBack(); // other page back navigation
        await screen.loadedTeamsList();
        await screen.loadedPlayerDetails(playerOne);  // assert no changes in the sibling frame

        await testOtherPageNavigated(screen);
        await testSomePageNavigated(screen);
        await screen.loadedOtherPage(); // assert no changes in the sibling frame

        await driver.navBack(); // some page back navigation
        await screen.loadedPlayerDetails(playerOne);

        await screen.goBackToPlayersList();
        await screen.loadedPlayersList();

        await screen.goBackFromOtherPage();
        await screen.loadedTeamsList();
    });
});
