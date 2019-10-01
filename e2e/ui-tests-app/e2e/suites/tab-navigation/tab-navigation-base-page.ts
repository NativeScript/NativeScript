import { AppiumDriver, Point, IRectangle, UIElement, logInfo, logWarn } from "nativescript-dev-appium";
import { PageObjectBaseModel } from "../../page-object-base-model";
import { ElementCacheStrategy } from "../../helpers/navigation-helper";

export abstract class TabNavigationBasePage extends PageObjectBaseModel {
    protected bottomNavigationTabRect: IRectangle;
    protected bottomNavigationItems: Array<UIElement>;
    protected bottomNavigationItemsRects: Map<number, Point> = new Map();

    constructor(_driver: AppiumDriver, navigationLinks: Array<string>) {
        super(_driver, navigationLinks, ElementCacheStrategy.none);
    }

    abstract async mainWidget();
    abstract async getItems();

    async init(subSuiteName: string) {
        this._navigationLinks.push(subSuiteName);
        await super.initSuite();
    }

    async navigateToSample(sample: string) {
        await super.navigateToSample(sample);
    }

    async refreshTabItems() {
        this.bottomNavigationItems = await this.getItems();

        for (let index = 0; index < this.bottomNavigationItems.length; index++) {
            const point = await this.bottomNavigationItems[index].getRectangle();
            this.bottomNavigationItemsRects.set(index, new Point(point.x + point.width / 2, point.y + point.height / 2));
        }
    }

    async refreshTabWidget() {
        const bottomNavigationTab = await this.mainWidget();
        this.bottomNavigationTabRect = await bottomNavigationTab.getRectangle();
    }

    async tabOnItem(index: number) {
        if (this.bottomNavigationItemsRects.size === 0) {
            await this.refreshTabItems();
        }
        const point = this.bottomNavigationItemsRects.get(index);
        logInfo(`Click on TabStrip index: ${index}`);
        await this._driver.clickPoint(point.x, point.y);
    }

    async swipeRightToLeft() {
        const startPoint = <Point>{};
        const endPoint = <Point>{};

        if (this._driver.isIOS) {
            startPoint.x = (this._driver.nsCapabilities.device.viewportRect.x / this._driver.nsCapabilities.device.config.density
                + this._driver.nsCapabilities.device.viewportRect.width / this._driver.nsCapabilities.device.config.density);
            startPoint.y = this._driver.nsCapabilities.device.viewportRect.y / this._driver.nsCapabilities.device.config.density
                + (this._driver.nsCapabilities.device.viewportRect.height / this._driver.nsCapabilities.device.config.density) / 2;
            endPoint.x = this._driver.nsCapabilities.device.viewportRect.x / this._driver.nsCapabilities.device.config.density;
            endPoint.y = startPoint.y;
        } else {
            if (this._driver.nsCapabilities.device.viewportRect) {
                startPoint.x = this._driver.nsCapabilities.device.viewportRect.width - 5;
                startPoint.y = this._driver.nsCapabilities.device.viewportRect.y
                    + this._driver.nsCapabilities.device.viewportRect.height / 2;
                endPoint.x = this._driver.nsCapabilities.device.viewportRect.x + 5;
                endPoint.y = startPoint.y;
            } else {
                startPoint.x = this._driver.imageHelper.options.cropRectangle.width - 5;
                startPoint.y = this._driver.imageHelper.options.cropRectangle.y
                    + this._driver.imageHelper.options.cropRectangle.height / 2;
                endPoint.x = this._driver.imageHelper.options.cropRectangle.x + 5;
                endPoint.y = startPoint.y;
            }
        }

        await this._driver.swipe(startPoint, endPoint);
        logWarn("Swipe from right to left!");
    }
}
