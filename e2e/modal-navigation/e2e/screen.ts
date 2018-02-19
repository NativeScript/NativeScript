import { AppiumDriver } from "nativescript-dev-appium";
import { assert } from "chai";

const home = "Home"
const modal = "Modal";
const modalSecond = "Modal Second";
const modalNested = "Modal Nested";

const modalFrame = "Show Modal Page With Frame";

const navToSecondPage = "Navigate To Second Page";
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

    // TODO:
    loaded = async () => {
        const lblHome = await this._driver.findElementByText(home);
        assert.isTrue(await lblHome.isDisplayed());
        console.log(home + " loaded!");
    }

    showModalFrame = async () => {
        const btnModalFrame = await this._driver.findElementByText(modalFrame);
        await btnModalFrame.tap();

        const lblModal = await this._driver.findElementByText(modal);
        assert.isTrue(await lblModal.isDisplayed());
        console.log(modal + " loaded!");
    }

    navigateToSecondPage = async () => {
        const btnNavToSecondPage = await this._driver.findElementByText(navToSecondPage);
        await btnNavToSecondPage.tap();

        const lblModalSecond = await this._driver.findElementByText(modalSecond);
        assert.isTrue(await lblModalSecond.isDisplayed());
        console.log(modalSecond + " loaded!");
    }

    goBackFromSecondPage = async () => {
        const btnGoBackFromSecondPage = await this._driver.findElementByText(goBack);
        await btnGoBackFromSecondPage.tap();

        const lblModal = await this._driver.findElementByText(modal);
        assert.isTrue(await lblModal.isDisplayed());
        console.log(modal + " loaded!");
    }

    showNestedModalFrame = async () => {
        const btnShowNestedModalFrame = await this._driver.findElementByText(showNestedModalFrame);
        await btnShowNestedModalFrame.tap();

        const lblModalNested = await this._driver.findElementByText(modalNested);
        assert.isTrue(await lblModalNested.isDisplayed());
        console.log(modalNested + " loaded!");
    }

    closeModalNested = async () => {
        const btnCloseNestedModal = await this._driver.findElementByText(closeModalNested);
        await btnCloseNestedModal.tap();

        const lblModal = await this._driver.findElementByText(modal);
        assert.isTrue(await lblModal.isDisplayed());
        console.log(modal + " loaded!");
    }

    showNestedModalPage = async () => {
        const btnShowNestedModalPage = await this._driver.findElementByText(showNestedModalPage);
        await btnShowNestedModalPage.tap();

        const btnCloseModalNested = await this._driver.findElementByText(closeModalNested);
        assert.isTrue(await btnCloseModalNested.isDisplayed());
        console.log(closeModalNested + " loaded!");
    }

    closeModal = async () => {
        const btnCloseModal = await this._driver.findElementByText(closeModal);
        await btnCloseModal.tap();

        const lblHome = await this._driver.findElementByText(home);
        assert.isTrue(await lblHome.isDisplayed());
        console.log(home + " loaded!");
    }
}