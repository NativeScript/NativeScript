import { AppiumDriver } from "nativescript-dev-appium";
import { PageObjectBaseModel } from "../../page-object-base-model";

export class ActionBarBasePage extends PageObjectBaseModel {
    private readonly automationText: string = "actionBar";
    constructor(_driver: AppiumDriver) {
        super(_driver, ["action-bar"]);
    }

    get actionBar() {
        return this._driver.waitForElement(this.automationText);
    }
}
