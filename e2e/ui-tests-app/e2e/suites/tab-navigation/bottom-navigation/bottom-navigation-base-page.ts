import { AppiumDriver } from "nativescript-dev-appium";
import { ElementCacheStrategy } from "../../../helpers/navigation-helper";
import { TabNavigationBasePage } from "../tab-navigation-base-page";

export class BottomNavigationBasePage extends TabNavigationBasePage {
    private readonly mainWidgetXPath: string;
    constructor(_driver: AppiumDriver) {
        super(_driver, ["bottom-navigation"]);
        this.mainWidgetXPath = this._driver.isIOS ?
        `//XCUIElementTypeOther[@name="tabNavigation"]/XCUIElementTypeTabBar`
        : `//android.view.ViewGroup[@content-desc="tabNavigation"]/android.widget.LinearLayout/android.widget.LinearLayout`;
    }
    //android.view.ViewGroup[@content-desc="tabNavigation"]/android.widget.LinearLayout/android.widget.LinearLayout/*
    async getItems() {
        return await this._driver.findElementsByXPath(`${this.mainWidgetXPath}/*`);
    }

    async mainWidget() {
        return await this._driver.findElementByXPath(this.mainWidgetXPath);
    }
}