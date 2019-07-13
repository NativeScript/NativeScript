import { AppiumDriver, Point, IRectangle, UIElement, logInfo, logWarn } from "nativescript-dev-appium";
import { PageObjectBaseModel } from "../../page-object-base-model";
import { ElementCacheStrategy } from "../../helpers/navigation-helper";
import { ImageOptions } from "nativescript-dev-appium/lib/image-options";

export abstract class TabNavigationBasePage extends PageObjectBaseModel {
    protected bottomNavigatioinTabRect: IRectangle;
    protected bottomNavigationItems: Array<UIElement>;
    protected bottomNavigationItemsRects: Map<number, Point> = new Map();

    constructor(_driver: AppiumDriver, navigationLinks: Array<string>) {
        super(_driver, navigationLinks, ElementCacheStrategy.none);
        this._driver.imageHelper.options.waitBeforeCreatingInitialImageCapture = 6000;
        this._driver.imageHelper.options.keepOriginalImageSize = false;
        this._driver.imageHelper.options.tolerance = 0;
        this._driver.imageHelper.options.toleranceType = ImageOptions.pixel;
        this._driver.imageHelper.options.donNotAppendActualSuffixOnIntialImageCapture = true;
        this._driver.imageHelper.options.timeOutSeconds = 7;
    }

    abstract async mainWidget();
    abstract async getItems();

    async init(subSuiteName: string) {
        this._naviagtionLinks.push(subSuiteName);
        await super.initSuite();
    }

    async navigateToSample(sample: string) {
        await super.navigateToSample(sample);
        await this.refreshTabItems();
    }

    async refreshTabItems() {
        this.bottomNavigationItems = await this.getItems();

        for (let index = 0; index < this.bottomNavigationItems.length; index++) {
            const point = await this.bottomNavigationItems[index].getRectangle();
            this.bottomNavigationItemsRects.set(index, new Point(point.x + point.width / 2, point.y + point.height / 2));
        }
    }

    async refreshTabWidget() {
        const bottomNavigatioinTab = await this.mainWidget();
        this.bottomNavigatioinTabRect = await bottomNavigatioinTab.getRectangle();
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
            startPoint.x = this._driver.nsCapabilities.device.viewportRect.width - 5;
            startPoint.y = this._driver.nsCapabilities.device.viewportRect.y
                + this._driver.nsCapabilities.device.viewportRect.height / 2;
            endPoint.x = this._driver.nsCapabilities.device.viewportRect.x + 5;
            endPoint.y = startPoint.y;
        }

        await this._driver.swipe(startPoint, endPoint);
        logWarn("Swipe from right to left!");
    }
}