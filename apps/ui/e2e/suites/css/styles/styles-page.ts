import { AppiumDriver, logInfo } from "nativescript-dev-appium";

import { PageObjectBaseModel } from "../../../page-object-base-model";

export class StylesPage extends PageObjectBaseModel {

    private readonly app = "app";

    constructor(_driver: AppiumDriver) {
        super(_driver, ["css", "styles"]);
    }

    async btnApp() {
        return this._driver.waitForElement(this.app);
    }

    async tapAppBtn() {
        await (await this.btnApp()).click();
        logInfo(`Tap on '${this.app}' button.`);
    }
}
