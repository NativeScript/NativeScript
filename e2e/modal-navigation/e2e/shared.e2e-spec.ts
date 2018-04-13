import { AppiumDriver, createDriver } from "nativescript-dev-appium";
import { Screen } from "./screen"

const time = 1;

export const roots = ["frame", "layout", "tab"];

export const setRoot = async (root: String, screen: Screen) => {
    console.log("Application root:", root);
    switch (root) {
        case "frame": {
            await screen.setFrameRootView();
            break;
        }
        case "layout": {
            await screen.setLayoutRootView();
            break;
        }
        case "tab": {
            await screen.setTabRootView();
            break;
        }
    }
};

export async function modalFrameBackground(driver: AppiumDriver, screen: Screen) {
    await driver.backgroundApp(time);
    await screen.loadedModalFrame();
}

export async function testSecondPageBackground(driver: AppiumDriver, screen: Screen) {
    await screen.navigateToSecondPage();
    await screen.loadedSecondPage();

    await driver.backgroundApp(time);
    await screen.loadedSecondPage();

    await screen.goBackFromSecondPage();
    await screen.loadedModalFrame();
}

export async function testSecondPageClose(driver: AppiumDriver, screen: Screen) {
    await screen.navigateToSecondPage();
    await screen.loadedSecondPage();

    await screen.closeModal();
    await screen.loadedHome();
}

export async function testNestedModalFrameBackground(driver: AppiumDriver, screen: Screen, isInFrame: boolean = true) {
    await screen.showNestedModalFrame();
    await screen.loadedNestedModalFrame();

    await driver.backgroundApp(time);
    await screen.loadedNestedModalFrame();

    await screen.closeModalNested();
    isInFrame ? await screen.loadedModalFrame() : await screen.loadedModalPage();
}

export async function testNestedModalPageBackground(driver: AppiumDriver, screen: Screen, isInFrame: boolean = true) {
    await screen.showNestedModalPage();
    await screen.loadedNestedModalPage();

    await driver.backgroundApp(time);
    await screen.loadedNestedModalPage();

    await screen.closeModalNested();
    isInFrame ? await screen.loadedModalFrame() : await screen.loadedModalPage();
}

export async function modalPageBackground(driver: AppiumDriver, screen: Screen, isInFrame: boolean = true) {
    await driver.backgroundApp(time);
    isInFrame ? await screen.loadedModalFrame() : await screen.loadedModalPage();
}

export async function modalTabViewBackground(driver: AppiumDriver, screen: Screen) {
    await driver.backgroundApp(time);
    await screen.loadedModalTabView();
}

export async function testSecondItemBackground(driver: AppiumDriver, screen: Screen) {
    await screen.navigateToSecondItem();
    await screen.loadedSecondItem();

    await driver.backgroundApp(time);
    await screen.loadedSecondItem();

    await screen.navigateToFirstItem();
    await screen.loadedFirstItem();
}
