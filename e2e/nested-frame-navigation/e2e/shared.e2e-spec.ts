import { AppiumDriver } from "nativescript-dev-appium";

import { Screen, Item } from "./screen";

export async function testPlayerNavigated(player: Item, screen: Screen) {
    await screen.navigateToPlayerDetails(player);
    await screen.loadedPlayerDetails(player);
}

export async function testPlayerNavigatedBack(screen: Screen, driver: AppiumDriver) {
    if (driver.isAndroid) {
        await driver.navBack();
    } else {
        await screen.goBackToPlayersList();
    }

    await screen.loadedPlayersList();
}

export async function testStillOtherPageNavigatedSlide(screen: Screen) {
    await screen.navigateToStillOtherPageSlide();
    await screen.loadedStillOtherPage();
}

export async function testSomePageNavigatedDefault(screen: Screen) {
    await screen.navigateToSomePageDefault();
    await screen.loadedSomePage();
}

export async function testSomePageNavigatedNone(screen: Screen) {
    await screen.navigateToSomePageNone();
    await screen.loadedSomePage();
}

export async function testSomePageNavigatedSlide(screen: Screen) {
    await screen.navigateToSomePageSlide();
    await screen.loadedSomePage();
}

export async function testSomePageNavigatedFlip(screen: Screen) {
    await screen.navigateToSomePageFlip();
    await screen.loadedSomePage();
}

export async function testTeamNavigated(team: Item, screen: Screen) {
    await screen.navigateToTeamDetails(team);
    await screen.loadedTeamDetails(team);
}

export async function testTeamNavigatedBack(screen: Screen, driver: AppiumDriver) {
    if (driver.isAndroid) {
        await driver.navBack();
    } else {
        await screen.goBackToTeamsList();
    }

    await screen.loadedTeamsList();
}

export async function testOtherPageNavigatedDefault(screen: Screen) {
    await screen.navigateToOtherPageDefault();
    await screen.loadedOtherPage();
}

export async function testOtherPageNavigatedNone(screen: Screen) {
    await screen.navigateToOtherPageNone();
    await screen.loadedOtherPage();
}

export async function testOtherPageNavigatedSlide(screen: Screen) {
    await screen.navigateToOtherPageSlide();
    await screen.loadedOtherPage();
}

export async function testOtherPageNavigatedFlip(screen: Screen) {
    await screen.navigateToOtherPageFlip();
    await screen.loadedOtherPage();
}
