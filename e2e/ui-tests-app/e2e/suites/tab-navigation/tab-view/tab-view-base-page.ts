import { AppiumDriver } from "nativescript-dev-appium";
import { PageObjectBaseModel } from "../../../page-object-base-model";
import { ElementCacheStrategy } from "./../../../helpers/navigation-helper";

export class TabViewBasePage extends PageObjectBaseModel {

    constructor(_driver: AppiumDriver, elementCacheStrategy?: ElementCacheStrategy) {
        super(_driver, ["tab-view"], elementCacheStrategy);
    }

    async init(subSuiteName: string) {
        this._naviagtionLinks.push(subSuiteName);
        await super.initSuite();
        this._driver.imageHelper.options.keepOriginalImageSize = false;
        this._driver.imageHelper.options.waitBeforeCreatingInitialImageCapture = 4000;
    }
}