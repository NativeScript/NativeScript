import { AppiumDriver } from "nativescript-dev-appium";
import { PageObjectBaseModel } from "../../page-object-base-model";
import { ElementCacheStrategy } from "../../helpers/navigation-helper";

export class EventsGesturesBasePage extends PageObjectBaseModel {

    constructor(_driver: AppiumDriver, navigationLinks?: Array<string>) {
        super(_driver, navigationLinks ? navigationLinks.unshift("events") && navigationLinks : ["events"], ElementCacheStrategy.none);
    }
}