import { AppiumDriver } from "nativescript-dev-appium";
import { PageObjectBaseModel } from "../../../page-object-base-model";
import { ElementCacheStrategy } from "../../../helpers/navigation-helper";

export class TabsViewBasePage extends PageObjectBaseModel {

    constructor(_driver: AppiumDriver, elementCacheStrategy?: ElementCacheStrategy) {
        super(_driver, ["tabs"], elementCacheStrategy);
    }

    async init(subSuiteName: string) {
        this._naviagtionLinks.push(subSuiteName);
        await super.initSuite();
    }
}