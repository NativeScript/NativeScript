import { AppiumDriver } from "nativescript-dev-appium";
import { assert } from "chai";

const home = "Home"
const first = "First"
const modal = "Modal";
const modalFirst = "Modal First";
const dialogConfirm = "Dialog";
const modalSecond = "Modal Second";
const modalNested = "Modal Nested";

const modalFrame = "Show Modal Page With Frame";
const modalPage = "Show Modal Page";
const modalLayout = "Show Modal Layout";
const modalTabView = "Show Modal TabView";
const navToSecondPage = "Navigate To Second Page";
const showDialog = "Show Dialog";
const resetFrameRootView = "Reset Frame Root View";
const resetTabRootView = "Reset Tab Root View";
const resetLayoutRootView = "Reset Layout Root View";

const showNestedModalFrame = "Show Nested Modal Page With Frame";
const showNestedModalPage = "Show Nested Modal Page";

const confirmDialog = "Yes";
const confirmDialogMessage = "Message";
const closeModalNested = "Close Modal Nested";
const closeModal = "Close Modal";
const goBack = "Go Back";

export const driverDefaultWaitTime = 10000;
export const elementDefaultWaitTimeInSeconds = 10;

export class Screen {

    private _driver: AppiumDriver

    constructor(driver: AppiumDriver) {
        this._driver = driver;
    }

    loadedHome = async () => {
        const lblHome = await this._driver.waitForElement(home);
        assert.isTrue(await lblHome.isDisplayed());
        console.log(home + " loaded!");
    }

    resetFrameRootView = async () => {
        console.log("Setting frame root ...");
        const btnResetFrameRootView = await this._driver.waitForElement(resetFrameRootView);
        await btnResetFrameRootView.tap();
    }

    resetLayoutRootView = async () => {
        console.log("Setting layout root ...");
        const btnResetLayoutRootView = await this._driver.waitForElement(resetLayoutRootView);
        await btnResetLayoutRootView.tap();
    }

    resetTabRootView = async () => {
        const btnResetTabRootView = await this._driver.waitForElement(resetTabRootView);
        await btnResetTabRootView.tap();
    }

    loadedTabRootView = async () => {
        const tabFirst = await this._driver.waitForElement(first);
        assert.isTrue(await tabFirst.isDisplayed());
        console.log("Tab root view loaded!");
    }

    setFrameRootView = async () => {
        // should load frame root, no need to verify it is loaded
        await this.loadedHome();
        await this.resetFrameRootView();
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

    setLayoutRootView = async () => {
        // should load layout root, no need to verify it is loaded
        await this.loadedHome();
        await this.resetLayoutRootView();
    }

    showModalFrame = async () => {
        const btnModalFrame = await this._driver.waitForElement(modalFrame);
        await btnModalFrame.tap();
    }

    loadedModalFrame = async () => {
        const lblModal = await this._driver.waitForElement(modal);
        assert.isTrue(await lblModal.isDisplayed());
        console.log(modal + " loaded!");
    }

    showModalPage = async () => {
        const btnModalPage = await this._driver.waitForElement(modalPage);
        await btnModalPage.tap();
    }

    loadedModalPage = async () => {
        const btnShowNestedModalPage = await this._driver.waitForElement(showNestedModalPage);
        assert.isTrue(await btnShowNestedModalPage.isDisplayed());
        console.log("Modal Page loaded!");
    }

    showModalLayout = async () => {
        const btnModalLayout = await this._driver.waitForElement(modalLayout);
        await btnModalLayout.tap();
    }

    loadedModalLayout = async () => {
        await this.loadedModalFrame();
    }

    showModalTabView = async () => {
        const btnModalTabView = await this._driver.waitForElement(modalTabView);
        await btnModalTabView.tap();
    }

    loadedModalTabView = async () => {
        const itemModalFirst = await this._driver.waitForElement(modalFirst);
        assert.isTrue(await itemModalFirst.isDisplayed());
        console.log("Modal TabView loaded!");
    }

    navigateToSecondPage = async () => {
        const btnNavToSecondPage = await this._driver.waitForElement(navToSecondPage);
        await btnNavToSecondPage.tap();
    }

    showDialogConfirm = async () => {
        const btnShowDialogConfirm = await this._driver.waitForElement(showDialog);
        await btnShowDialogConfirm.tap();
    }

    navigateToFirstItem = async () => {
        const itemModalFirst = await this._driver.waitForElement(modalFirst);
        await itemModalFirst.tap();
    }

    navigateToSecondItem = async () => {
        const itemModalSecond = await this._driver.waitForElement(modalSecond);
        await itemModalSecond.tap();
    }

    loadedConfirmDialog = async () => {
        const lblDialogMessage = await this._driver.waitForElement(confirmDialogMessage);
        assert.isTrue(await lblDialogMessage.isDisplayed());
        console.log(dialogConfirm + " shown!");
    }

    loadedSecondPage = async () => {
        const lblModalSecond = await this._driver.waitForElement(modalSecond);
        assert.isTrue(await lblModalSecond.isDisplayed());
        console.log(modalSecond + " loaded!");
    }

    loadedFirstItem = async () => {
        const lblModal = await this._driver.waitForElement(modal);
        assert.isTrue(await lblModal.isDisplayed());
        console.log("First Item loaded!");
    }

    loadedSecondItem = async () => {
        const btnGoBack = await this._driver.waitForElement(goBack);
        assert.isTrue(await btnGoBack.isDisplayed());
        console.log("Second Item loaded!");
    }

    closeDialog = async () => {
        const btnYesDialog = await this._driver.waitForElement(confirmDialog);
        await btnYesDialog.tap();
    }

    goBackFromSecondPage = async () => {
        const btnGoBackFromSecondPage = await this._driver.waitForElement(goBack);
        await btnGoBackFromSecondPage.tap();
    }

    showNestedModalFrame = async () => {
        const btnShowNestedModalFrame = await this._driver.waitForElement(showNestedModalFrame);
        await btnShowNestedModalFrame.tap();
    }

    loadedNestedModalFrame = async () => {
        const lblModalNested = await this._driver.waitForElement(modalNested);
        assert.isTrue(await lblModalNested.isDisplayed());
        console.log(modalNested + " loaded!");
    }

    closeModalNested = async () => {
        const btnCloseNestedModal = await this._driver.waitForElement(closeModalNested);
        await btnCloseNestedModal.tap();
    }

    showNestedModalPage = async () => {
        const btnShowNestedModalPage = await this._driver.waitForElement(showNestedModalPage);
        await btnShowNestedModalPage.tap();
    }

    loadedNestedModalPage = async () => {
        const btnCloseModalNested = await this._driver.waitForElement(closeModalNested);
        assert.isTrue(await btnCloseModalNested.isDisplayed());
        console.log(closeModalNested + " loaded!");
    }

    closeModal = async () => {
        const btnCloseModal = await this._driver.waitForElement(closeModal);
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

    loadModalLayout = async () => {
        try {
            await this.loadedModalLayout();
        } catch (err) {
            // should show modal layout
            await this.showModalLayout();
            await this.loadedModalLayout();
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