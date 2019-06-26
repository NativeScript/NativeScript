import { AppiumDriver, IRectangle, logInfo } from "nativescript-dev-appium";

export enum ElementCacheStrategy {
    allAtOnce,
    onload,
    none,
}

export interface ICachedElement {
    name: string;
    children: Map<string, ICachedElement>;
    parent?: ICachedElement;
    rect?: IRectangle;
}

export class NavigationHelper {

    private _cachedElements: ICachedElement;
    private _currentSuite: ICachedElement;

    constructor(protected _driver: AppiumDriver, protected _suitMainPageNavigationLinks: Array<string>, private _elemtsCacheStrategy: ElementCacheStrategy = ElementCacheStrategy.onload) {
    }

    async initSuite() {
        if (this._elemtsCacheStrategy === ElementCacheStrategy.allAtOnce
            || this._elemtsCacheStrategy === ElementCacheStrategy.onload) {
            if (this._currentSuite) {
                while (this._currentSuite.parent) {
                    this._currentSuite = this._currentSuite.parent;
                }
            } else {
                if (!this._cachedElements || this._cachedElements.children.size === 0) {
                    this._cachedElements = { name: "initSuite", children: new Map<string, ICachedElement>() };
                    if (this._elemtsCacheStrategy === ElementCacheStrategy.allAtOnce) {
                        await this.cacheAllElements(this._cachedElements);
                    }
                }

                this._currentSuite = this._cachedElements;
            }
        }

        await this.navigateToSuitMainPage();
    }

    async endSuite() {
        logInfo("End of suit 'button' tests!");
        await this._driver.takeScreenshot("end_button_suit");
    }

    async navigateToSuitMainPage() {
        for (let index = 0; index < this._suitMainPageNavigationLinks.length; index++) {
            const mainPage = this._suitMainPageNavigationLinks[index];
            await this.navigateToSample(mainPage);
        }
    }

    async navigateToSample(sample: string) {
        logInfo(`Navigate to ${sample}`);
        sample = sample.toLowerCase();
        if (this._elemtsCacheStrategy === ElementCacheStrategy.allAtOnce) {
            if (!this._currentSuite.children.has(sample)) {
                await this.cacheAllElements(this._currentSuite);
            }
            if (!this._currentSuite.children.has(sample)) {
                throw new Error(`Could not find ${sample}`);
            }
            const sampleElement = this._currentSuite.children.get(sample).rect;
            await this._driver.clickPoint(sampleElement.x + (sampleElement.width / 2), sampleElement.y + (sampleElement.height / 2));
            this._currentSuite = this._currentSuite.children.get(sample);
        } else if (this._elemtsCacheStrategy === ElementCacheStrategy.onload) {
            if (this._currentSuite.children.has(sample)) {
                const sampleElement = this._currentSuite.children.get(sample).rect;
                await this._driver.clickPoint(sampleElement.x + (sampleElement.width / 2), sampleElement.y + (sampleElement.height / 2));
                this._currentSuite = this._currentSuite.children.get(sample);
            } else {
                const sampleElement = await this._driver.waitForElement(sample);
                if (!sampleElement) {
                    throw new Error(`Could not find ${sample}`);
                }
                const rect = await sampleElement.getRectangle();
                const text = (await sampleElement.text()).toLowerCase();
                const newSuite: ICachedElement = { name: text, rect: rect, children: new Map(), parent: this._currentSuite };
                this._currentSuite.children.set(sample, newSuite);
                this._currentSuite = newSuite;
                await this._driver.clickPoint(rect.x + (rect.width / 2), rect.y + (rect.height / 2));
            }
        } else {
            const sampleElement = await this._driver.waitForElement(sample);
            await sampleElement.click();
        }
    }

    async navigateBackToSuitMainPage() {
        logInfo(`Navigate to back`);
        this._currentSuite = this._currentSuite.parent;
        await this._driver.navBack();
    }

    async swipeBackToSuitMainPage() {
        logInfo(`Swipe to back`);
        throw new Error("Not implemented!");
    }

    private async cacheAllElements(cachedElements: ICachedElement) {
        const allSamples = await this._driver.findElementsByClassName(this._driver.locators.button);
        for (let index = 0; index < allSamples.length; index++) {
            const element = allSamples[index];
            const rect = await element.getRectangle();
            const text = (await element.text()).toLowerCase();
            if (!cachedElements.children.has(text)) {
                console.log(text);
                cachedElements.children.set(text, { parent: cachedElements, name: text, rect: rect, children: new Map() });
            }
        }
    }
}
