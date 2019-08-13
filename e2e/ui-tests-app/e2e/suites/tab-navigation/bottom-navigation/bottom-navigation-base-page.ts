import { AppiumDriver } from "nativescript-dev-appium";
import { ElementCacheStrategy } from "../../../helpers/navigation-helper";
import { TabNavigationBasePage } from "../tab-navigation-base-page";
import { NsCapabilities } from "nativescript-dev-appium/lib/ns-capabilities";

export class BottomNavigationBasePage extends TabNavigationBasePage {
    private mainWidgetXPath: string;
    constructor(_driver: AppiumDriver) {
        super(_driver, ["bottom-navigation"]);
        this.loadMainWidgetXpath();
    }

    async getItems() {
        return await this._driver.findElementsByXPath(`${this.mainWidgetXPath}/*`);
    }

    async mainWidget() {
        return await this._driver.findElementByXPath(this.mainWidgetXPath);
    }

    private loadMainWidgetXpath() {
        if (this._driver.isAndroid && (<NsCapabilities>this._driver.nsCapabilities).tryGetApiLevel() < 6.0) {
            this.mainWidgetXPath = `//android.view.View[@content-desc="tabNavigation"]/android.widget.LinearLayout/android.widget.LinearLayout`;
        } else if (this._driver.isAndroid && (<NsCapabilities>this._driver.nsCapabilities).tryGetApiLevel() >= 6.0) {
            this.mainWidgetXPath = `//android.view.ViewGroup[@content-desc="tabNavigation"]/android.widget.LinearLayout/android.widget.LinearLayout`;
        } else if (this._driver.isIOS) {
            this.mainWidgetXPath = `//XCUIElementTypeOther[@name="tabNavigation"]/XCUIElementTypeTabBar`;
        } else {
            throw new Error("Run type is missing! Please, check appium settings and run test again!");
        }
    }
}