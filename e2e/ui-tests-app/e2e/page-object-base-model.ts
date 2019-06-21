import { AppiumDriver, logInfo } from "nativescript-dev-appium";
import { NavigationHelper } from "./helpers/navigation-helper";
import { ImageHelper } from "./helpers/image-helper";

export abstract class PageObjectBaseModel {

    public navigationHelper: NavigationHelper;
    public imageHelper: ImageHelper;

    constructor(protected _driver: AppiumDriver, protected _naviagtionLinks: Array<string>, cashePages: boolean) {
        this.navigationHelper = new NavigationHelper(this._driver, this._naviagtionLinks, cashePages);
        this.imageHelper = new ImageHelper(this._driver);
    }

    async initSuite() {
        await this.navigationHelper.initSuite();
    }

    async endSuite() {
        const suiteName = this._naviagtionLinks.join("-");
        logInfo(`End of suit ${suiteName}  tests!`);
        await this._driver.takeScreenshot(suiteName);
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