import { AppiumDriver, logInfo } from "nativescript-dev-appium";
import { NavigationHelper, ElementCacheStrategy } from "./helpers/navigation-helper";
import { ImageOptions } from "nativescript-dev-appium/lib/image-options";

export abstract class PageObjectBaseModel {

    public navigationHelper: NavigationHelper;

    constructor(protected _driver: AppiumDriver, protected _navigationLinks: Array<string>, elementCacheStrategy: ElementCacheStrategy = ElementCacheStrategy.none) {
        this.navigationHelper = new NavigationHelper(this._driver, this._navigationLinks, elementCacheStrategy);
        this._driver.imageHelper.options.overwriteActualImage = process.env["OVERWRITE_ACTUAL_IMAGE"] === "true";
        this._driver.imageHelper.options.waitBeforeCreatingInitialImageCapture = +process.env["WAIT_BEFORE_CREATING_INITIAL_IMAGE_CAPTURE"] || 9000;
        this._driver.imageHelper.options.keepOriginalImageSize = false;
        this._driver.imageHelper.options.tolerance = 0;
        this._driver.imageHelper.options.toleranceType = ImageOptions.pixel;
    }

    async initSuite() {
        await this.navigationHelper.initSuite();
    }

    async endSuite() {
        const suiteName = this._navigationLinks.join("-");
        logInfo(`End of suit ${suiteName}  tests!`);
    }

    async navigateToSuitMainPage() {
        await this.navigationHelper.navigateBackToSuitMainPage();
    }

    async navigateToSample(sample: string) {
        await this.navigationHelper.navigateToSample(sample);
    }

    async navigateBackToSuitMainPage() {
        await this.navigationHelper.navigateBackToSuitMainPage();
    }

    async swipeBackToSuitMainPage() {
        await this.navigationHelper.swipeBackToSuitMainPage();
    }
}
