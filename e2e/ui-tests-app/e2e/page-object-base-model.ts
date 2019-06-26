import { AppiumDriver, logInfo } from "nativescript-dev-appium";
import { NavigationHelper, ElementCacheStrategy } from "./helpers/navigation-helper";
import { ImageHelper } from "./helpers/image-helper";

export abstract class PageObjectBaseModel {

    public navigationHelper: NavigationHelper;
    public imageHelper: ImageHelper;

    constructor(protected _driver: AppiumDriver, protected _naviagtionLinks: Array<string>, elementCacheStrategy: ElementCacheStrategy = ElementCacheStrategy.none) {
        this.navigationHelper = new NavigationHelper(this._driver, this._naviagtionLinks, elementCacheStrategy);
        this.imageHelper = new ImageHelper(this._driver);
    }

    async initSuite() {
        await this.navigationHelper.initSuite();
    }

    async endSuite() {
        const suiteName = this._naviagtionLinks.join("-");
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