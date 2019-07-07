import { AppiumDriver, Point, IRectangle, UIElement, logInfo } from "nativescript-dev-appium";
import { PageObjectBaseModel } from "../../../page-object-base-model";
import { ElementCacheStrategy } from "../../../helpers/navigation-helper";

export class BottomNavigationBasePage extends PageObjectBaseModel {
    private _bottomNavigatioinTabRect: IRectangle;
    private _bottomNavigationItems: Array<UIElement>;
    private _bottomNavigationItemsRects: Map<number, Point> = new Map();

    constructor(_driver: AppiumDriver, elementCacheStrategy?: ElementCacheStrategy) {
        super(_driver, ["bottom-navigation"], elementCacheStrategy);
    }

    async init(subSuiteName: string) {
        this._naviagtionLinks.push(subSuiteName);
        await super.initSuite();
    }

    async refreshBottomNavigationTab() {
        let bottomNavigatioinTab;
        if (this._driver.nsCapabilities.isAndroid) {
            bottomNavigatioinTab = await this._driver.findElementByXPath(`//android.view.ViewGroup[@content-desc="bottomNavigation"]/android.widget.LinearLayout`);
            this._bottomNavigationItems = await this._driver.findElementsByXPath(`//android.view.ViewGroup[@content-desc="bottomNavigation"]/android.widget.LinearLayout/android.widget.LinearLayout/*`);
        } else {
            bottomNavigatioinTab = await this._driver.findElementByXPath(`//XCUIElementTypeOther[@name="bottomNavigation"]/XCUIElementTypeTabBar`);
            this._bottomNavigationItems = await this._driver.findElementsByXPath(`//XCUIElementTypeOther[@name="bottomNavigation"]/XCUIElementTypeTabBar/*`);
        }

        for (let index = 0; index < this._bottomNavigationItems.length; index++) {
            const point = await this._bottomNavigationItems[index].getRectangle();
            this._bottomNavigationItemsRects.set(index, new Point(point.y + point.width / 2, point.x + point.height / 2));
        }

        this._bottomNavigatioinTabRect = await bottomNavigatioinTab.getRectangle();

        return this._bottomNavigatioinTabRect;
    }

    async tabOnItem(index: number) {
        if (this._bottomNavigationItemsRects.size === 0) {
            await this.refreshBottomNavigationTab();
        }
        const point = this._bottomNavigationItemsRects.get(index);
        logInfo(`Click on TabStrip index: ${index}`);
        await this._driver.clickPoint(point.x, point.y);

    }
}