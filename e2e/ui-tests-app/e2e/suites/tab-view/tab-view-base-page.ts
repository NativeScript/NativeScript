import { AppiumDriver } from "nativescript-dev-appium";
import { PageObjectBaseModel } from "../../page-object-base-model";

export class TabViewBasePage extends PageObjectBaseModel {

    constructor(_driver: AppiumDriver) {
        super(_driver, ["tab-view"], false);
    }

    async init(subSuiteName: string) {
        this._naviagtionLinks.push(subSuiteName);
        await super.initSuite();
    }
}