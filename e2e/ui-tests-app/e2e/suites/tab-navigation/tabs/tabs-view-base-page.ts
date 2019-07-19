import { AppiumDriver } from "nativescript-dev-appium";
import { TabNavigationBasePage } from "../tab-navigation-base-page";

export class TabsViewBasePage extends TabNavigationBasePage {
    private readonly mainWidgetXPath: string;
    constructor(_driver: AppiumDriver) {
        super(_driver, ["tabs"]);
        this.mainWidgetXPath = this._driver.isIOS ?
            `//XCUIElementTypeOther[@name="tabNavigation"]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeCollectionView`
            : `//android.view.ViewGroup[@content-desc="tabNavigation"]/android.widget.HorizontalScrollView/android.widget.LinearLayout`;
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
}