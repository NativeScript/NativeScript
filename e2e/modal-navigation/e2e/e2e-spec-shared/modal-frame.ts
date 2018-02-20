import { AppiumDriver, createDriver } from "nativescript-dev-appium";
import { Screen } from "../screen"

const time = 5;

export async function testSecondPage(screen: Screen) {
    await screen.navigateToSecondPage();
    await screen.loadedSecondPage();

    await screen.goBackFromSecondPage();
    await screen.loadedModalFrame();
}

export async function testNestedModalFrame(screen: Screen) {
    await screen.showNestedModalFrame();
    await screen.loadedNestedModalFrame();

    await screen.closeModalNested();
    await screen.loadedModalFrame();
}

export async function testNestedModalPage(screen: Screen) {
    await screen.showNestedModalPage();
    await screen.loadedNestedModalPage();

    await screen.closeModalNested();
    await screen.loadedModalFrame();
}

export async function modalFrameBackground(driver: AppiumDriver, screen: Screen) {
    await driver.backgroundApp(time);
    await screen.loadedModalFrame();
}

// Background
export async function testSecondPageBackground(driver: AppiumDriver, screen: Screen) {
    await screen.navigateToSecondPage();
    await screen.loadedSecondPage();

    await driver.backgroundApp(time);
    await screen.loadedSecondPage();

    await screen.goBackFromSecondPage();
    await screen.loadedModalFrame();
}

export async function testNestedModalFrameBackground(driver: AppiumDriver, screen: Screen) {
    await screen.showNestedModalFrame();
    await screen.loadedNestedModalFrame();

    await driver.backgroundApp(time);
    await screen.loadedNestedModalFrame();

    await screen.closeModalNested();
    await screen.loadedModalFrame();
}

export async function testNestedModalPageBackground(driver: AppiumDriver, screen: Screen) {
    await screen.showNestedModalPage();
    await screen.loadedNestedModalPage();

    await driver.backgroundApp(time);
    await screen.loadedNestedModalPage();

    await screen.closeModalNested();
    await screen.loadedModalFrame();
}
