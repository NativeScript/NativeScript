import { AppiumDriver } from "nativescript-dev-appium";
import { TabNavigationBasePage } from "../tab-navigation-base-page";
import { NsCapabilities } from "nativescript-dev-appium/lib/ns-capabilities";
import { AutomationName } from "nativescript-dev-appium/lib/automation-name";

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
        const automationName = (<NsCapabilities>this._driver.nsCapabilities).automationName;
        if (this._driver.isAndroid
            && automationName === AutomationName.UiAutomator1 || automationName === AutomationName.Appium) {
            this.mainWidgetXPath = `//android.view.View[@content-desc="tabNavigation"]/android.widget.LinearLayout/android.widget.LinearLayout`;
        } else if (this._driver.isAndroid && automationName === AutomationName.UiAutomator2) {
            this.mainWidgetXPath = `//android.view.ViewGroup[@content-desc="tabNavigation"]/android.widget.LinearLayout/android.widget.LinearLayout`;
        } else if (this._driver.isIOS) {
            this.mainWidgetXPath = `//XCUIElementTypeOther[@name="tabNavigation"]/XCUIElementTypeTabBar`;
        } else {
            throw new Error("Run type is missing! Please, check appium settings and run test again!");
        }
    }
}
