import { AppiumDriver, logInfo, logError } from "nativescript-dev-appium";
import { Platform } from "mobile-devices-controller";
import { ImageOptions } from "nativescript-dev-appium/lib/image-options";
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