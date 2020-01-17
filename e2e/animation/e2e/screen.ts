import { AppiumDriver } from "nativescript-dev-appium";
import { assert } from "chai";

const home = "Home";
const chainingWithAnimationSet = "chaining-with-animation-set";
const animateSequentially = "Animate Sequentially";

export class Screen {

    private _driver: AppiumDriver;

    constructor(driver: AppiumDriver) {
        this._driver = driver;
    }

    loadedHome = async () => {
        const labelHome = await this._driver.findElementByText(home);
        assert.isTrue(await labelHome.isDisplayed());
        console.log(home + " loaded!");
    }

    loadedChainingWithAnimationSet = async () => {
        const buttonChainingWithAnimationSet = await this._driver.findElementByText(chainingWithAnimationSet);
        assert.isTrue(await buttonChainingWithAnimationSet.isDisplayed());

        await buttonChainingWithAnimationSet.click();

        const buttonAnimateSequentially = await this._driver.findElementByText(animateSequentially);
        assert.isTrue(await buttonAnimateSequentially.isDisplayed());

        console.log(chainingWithAnimationSet + " loaded!");
    }
}
