import { AppiumDriver, logInfo, logError } from "nativescript-dev-appium";
import { Platform } from "mobile-devices-controller";
import { PageObjectBaseModel } from "../../../page-object-base-model";
import { ElementCacheStrategy } from "../../../helpers/navigation-helper";
import { assert } from "chai";
import { ImageOptions } from "nativescript-dev-appium/lib/image-options";
export class ButtonBackgroundPage extends PageObjectBaseModel {

    constructor(_driver: AppiumDriver) {
        super(_driver, ["button", "background"], ElementCacheStrategy.none);
    }

    public viewGroupLocator() {
        if (this._driver.nsCapabilities.device.platform === Platform.ANDROID) {
            return +this._driver.nsCapabilities.device.releaseVersion > 5.1 ? "android.view.ViewGroup" : "android.view.View";
        } else {
            throw new Error("Not implemented locator");
        }
    }

    async testElement() {
        return this._driver.waitForElement("test-element");
    }

    async btnReset() {
        return this._driver.waitForElement("r");
    }

    async tapResetBtn() {
        await (await this.btnReset()).click();
        logInfo("Tap on 'Reset' button.");
    }

    async tapBtn(button: string) {
        await (await this._driver.waitForElement(button)).click();
        logInfo(`Tap on "${button}" button.`);
    }

    async loaded() {
        if (await this.btnReset() != null) {
            logInfo("Background page loaded.");
        } else {
            logError("Background page NOT loaded.");
        }
    }

    async executeScenario(button: string) {
        const presenter = await this.testElement();
        await this.tapBtn(button);
        const result = await this._driver.compareElement(presenter, undefined, 0.01, 5, ImageOptions.percent);
        assert.isTrue(result);
    }
}
