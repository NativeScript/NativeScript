import { AppiumDriver, logError, IRectangle, logInfo, SearchOptions } from "nativescript-dev-appium";

export class NavigationHelper {

    protected _samples: Map<string, IRectangle> = new Map();

    constructor(protected _driver: AppiumDriver, protected _suitMainPage: Array<string>, private _shouldCacheElements: boolean = false) {
    }

    async initSuite() {
        await this.navigateToSuitMainPage();
        if (this._shouldCacheElements) {
            const allSamples = await this._driver.findElementsByClassName(this._driver.locators.button);
            for (let index = 0; index < allSamples.length; index++) {
                const element = allSamples[index];
                const rect = await element.getRectangle();
                const text = (await element.text()).toLowerCase();
                if (!this._samples.has(text)) {
                    console.log(text);
                    this._samples.set(text, rect);
                }
            }
        }
    }

    async endSuite() {
        logInfo("End of suit 'button' tests!");
        await this._driver.takeScreenshot("end_button_suit");
    }

    async navigateToSuitMainPage() {
        for (let index = 0; index < this._suitMainPage.length; index++) {
            const mainPage = this._suitMainPage[index];
            await this.navigateToSample(mainPage);
        }
    }

    async navigateToSample(sample: string) {
        logInfo(`Navigate to ${sample}`);
        if (this._samples.size > 0) {
            const sampleElement = this._samples.get(sample.toLowerCase());
            await this._driver.clickPoint(sampleElement.x + (sampleElement.width / 2), sampleElement.y + (sampleElement.height / 2));
        } else {
            const sampleElement = await this._driver.waitForElement(sample);
            await sampleElement.click();
        }
    }

    async navigateBackToSuitMainPage() {
        logInfo(`Navigate to back`);
        await this._driver.navBack();
    }

    async swipeBackToSuitMainPage() {
        logInfo(`Swipe to back`);
        throw new Error("Not implemented!");
    }
}


