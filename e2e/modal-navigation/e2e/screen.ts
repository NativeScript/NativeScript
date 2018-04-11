import { AppiumDriver } from "nativescript-dev-appium";
import { assert } from "chai";

const home = "Home"
const first = "First"
const modal = "Modal";
const modalFirst = "Modal First";
const modalSecond = "Modal Second";
const modalNested = "Modal Nested";

const modalFrame = "Show Modal Page With Frame";
const modalPage = "Show Modal Page";
const modalTabView = "Show Modal TabView";
const navToSecondPage = "Navigate To Second Page";
const resetFrameRootView = "Reset Frame Root View";
const resetTabRootView = "Reset Tab Root View";
const resetLayoutRootView = "Reset Layout Root View";

const showNestedModalFrame = "Show Nested Modal Page With Frame";
const showNestedModalPage = "Show Nested Modal Page";

const closeModalNested = "Close Modal Nested";
const closeModal = "Close Modal";
const goBack = "Go Back";

export class Screen {

    private _driver: AppiumDriver

    constructor(driver: AppiumDriver) {
        this._driver = driver;
    }

    loadedHome = async () => {
        const lblHome = await this._driver.findElementByText(home);
        assert.isTrue(await lblHome.isDisplayed());
        console.log(home + " loaded!");
    }

    resetFrameRootView = async () => {
        const btnResetFrameRootView = await this._driver.findElementByText(resetFrameRootView);
        await btnResetFrameRootView.tap();
    }

    resetTabRootView = async () => {
        const btnResetTabRootView = await this._driver.findElementByText(resetTabRootView);
        await btnResetTabRootView.tap();
    }

    resetLayoutRootView = async () => {
        const btnResetLayoutRootView = await this._driver.findElementByText(resetLayoutRootView);
        await btnResetLayoutRootView.tap();
    }

    loadedTabRootView = async () => {
        const tabFirst = await this._driver.findElementByText(first);
        assert.isTrue(await tabFirst.isDisplayed());
        console.log("Tab root view loaded!");
    }

    setTabRootView = async () => {
        // should load tab root
        await this.loadedHome();
        try {
            await this.loadedTabRootView();
        } catch (err) {
            await this.resetTabRootView();
            await this.loadedTabRootView();
        }
    }

    showModalFrame = async () => {
        const btnModalFrame = await this._driver.findElementByText(modalFrame);
        await btnModalFrame.tap();
    }

    loadedModalFrame = async () => {
        const lblModal = await this._driver.findElementByText(modal);
        assert.isTrue(await lblModal.isDisplayed());
        console.log(modal + " loaded!");
    }

    showModalPage = async () => {
        const btnModalPage = await this._driver.findElementByText(modalPage);
        await btnModalPage.tap();
    }

    loadedModalPage = async () => {
        const btnShowNestedModalPage = await this._driver.findElementByText(showNestedModalPage);
        assert.isTrue(await btnShowNestedModalPage.isDisplayed());
        console.log("Modal Page loaded!");
    }

    showModalTabView = async () => {
        const btnModalTabView = await this._driver.findElementByText(modalTabView);
        await btnModalTabView.tap();
    }

    loadedModalTabView = async () => {
        const itemModalFirst = await this._driver.findElementByText(modalFirst);
        assert.isTrue(await itemModalFirst.isDisplayed());
        console.log("Modal TabView loaded!");
    }

    navigateToSecondPage = async () => {
        const btnNavToSecondPage = await this._driver.findElementByText(navToSecondPage);
        await btnNavToSecondPage.tap();
    }

    navigateToFirstItem = async () => {
        const itemModalFirst = await this._driver.findElementByText(modalFirst);
        await itemModalFirst.tap();
    }

    navigateToSecondItem = async () => {
        const itemModalSecond = await this._driver.findElementByText(modalSecond);
        await itemModalSecond.tap();
    }

    loadedSecondPage = async () => {
        const lblModalSecond = await this._driver.findElementByText(modalSecond);
        assert.isTrue(await lblModalSecond.isDisplayed());
        console.log(modalSecond + " loaded!");
    }

    loadedFirstItem = async () => {
        const lblModal = await this._driver.findElementByText(modal);
        assert.isTrue(await lblModal.isDisplayed());
        console.log("First Item loaded!");
    }

    loadedSecondItem = async () => {
        const btnGoBack = await this._driver.findElementByText(goBack);
        assert.isTrue(await btnGoBack.isDisplayed());
        console.log("Second Item loaded!");
    }

    goBackFromSecondPage = async () => {
        const btnGoBackFromSecondPage = await this._driver.findElementByText(goBack);
        await btnGoBackFromSecondPage.tap();
    }

    showNestedModalFrame = async () => {
        const btnShowNestedModalFrame = await this._driver.findElementByText(showNestedModalFrame);
        await btnShowNestedModalFrame.tap();
    }

    loadedNestedModalFrame = async () => {
        const lblModalNested = await this._driver.findElementByText(modalNested);
        assert.isTrue(await lblModalNested.isDisplayed());
        console.log(modalNested + " loaded!");
    }

    closeModalNested = async () => {
        const btnCloseNestedModal = await this._driver.findElementByText(closeModalNested);
        await btnCloseNestedModal.tap();
    }

    showNestedModalPage = async () => {
        const btnShowNestedModalPage = await this._driver.findElementByText(showNestedModalPage);
        await btnShowNestedModalPage.tap();
    }

    loadedNestedModalPage = async () => {
        const btnCloseModalNested = await this._driver.findElementByText(closeModalNested);
        assert.isTrue(await btnCloseModalNested.isDisplayed());
        console.log(closeModalNested + " loaded!");
    }

    closeModal = async () => {
        const btnCloseModal = await this._driver.findElementByText(closeModal);
        await btnCloseModal.tap();
    }

    loadModalFrame = async () => {
        try {
            await this.loadedModalFrame();
        } catch (err) {
            // should show modal page with frame
            await this.showModalFrame();
            await this.loadedModalFrame();
        }
    }

    loadModalPage = async () => {
        try {
            await this.loadedModalPage();
        } catch (err) {
            // should show modal page
            await this.showModalPage();
            await this.loadedModalPage();
        }
    }

    loadModalTabView = async () => {
        try {
            await this.loadedModalTabView();
        } catch (err) {
            // should show modal tab view with frame
            await this.showModalTabView();
            await this.loadedModalTabView();
        }
    }
}