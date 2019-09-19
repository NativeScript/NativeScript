import { AppiumDriver } from "nativescript-dev-appium";
import { TabNavigationBasePage } from "../tab-navigation-base-page";
import { NsCapabilities } from "nativescript-dev-appium/lib/ns-capabilities";
import { AutomationName } from "nativescript-dev-appium/lib/automation-name";

export class TabsViewBasePage extends TabNavigationBasePage {
    private mainWidgetXPath: string;
    constructor(_driver: AppiumDriver) {
        super(_driver, ["tabs"]);
        this.loadMainWidgetXpath();
    }

    async getItems() {
        const items = await this._driver.findElementsByXPath(`${this.mainWidgetXPath}/*`);
        if (this._driver.isIOS) {
            items.shift();
        }

        return items;
    }

    async mainWidget() {
        return await this._driver.findElementByXPath(this.mainWidgetXPath);
    }

    private loadMainWidgetXpath() {
        const automationName = (<NsCapabilities>this._driver.nsCapabilities).automationName;
        if (this._driver.isAndroid
            && automationName === AutomationName.UiAutomator1 || automationName === AutomationName.Appium) {
            this.mainWidgetXPath = `//android.view.View[@content-desc="tabNavigation"]/android.widget.HorizontalScrollView/android.widget.LinearLayout`;
        } else if (this._driver.isAndroid && automationName === AutomationName.UiAutomator2) {
            this.mainWidgetXPath = `//android.view.ViewGroup[@content-desc="tabNavigation"]/android.widget.HorizontalScrollView/android.widget.LinearLayout`;
        } else if (this._driver.isIOS) {
            this.mainWidgetXPath = `//XCUIElementTypeOther[@name="tabNavigation"]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeCollectionView`;
        } else {
            throw new Error("Run type is missing! Please, check appium settings and run test again!");
        }
    }
}
