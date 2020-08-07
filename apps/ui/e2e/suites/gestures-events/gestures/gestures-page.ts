import { AppiumDriver } from "nativescript-dev-appium";
import { EventsGesturesBasePage } from "../events-gestures-base-page";

export class GesturesPage extends EventsGesturesBasePage {

    constructor(_driver: AppiumDriver) {
        super(_driver, ["gestures"]);
    }

    async btnStopDetection() {
        return this._driver.waitForElement("stopGesturesDetecting");
    }

    async stopDetection() {
        return await (await this.btnStopDetection()).click();
    }
}