import {
	AppiumDriver,
	IRectangle,
	logInfo,
	logWarn,
	Point
} from "nativescript-dev-appium";

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

    constructor(
			protected _driver: AppiumDriver,
			protected _suitMainPageNavigationLinks: Array<string>,
			private _elementsCacheStrategy: ElementCacheStrategy = ElementCacheStrategy.onload
    ) {}

    async initSuite(): Promise<void> {
        if (this._elementsCacheStrategy === ElementCacheStrategy.allAtOnce
            || this._elementsCacheStrategy === ElementCacheStrategy.onload) {
            if (this._currentSuite) {
                while (this._currentSuite.parent) {
                    this._currentSuite = this._currentSuite.parent;
                }
            } else {
                if (!this._cachedElements || this._cachedElements.children.size === 0) {
                    this._cachedElements = { name: "initSuite", children: new Map<string, ICachedElement>() };
                    if (this._elementsCacheStrategy === ElementCacheStrategy.allAtOnce) {
                        await this.cacheAllElements(this._cachedElements);
                    }
                }

                this._currentSuite = this._cachedElements;
            }
        }

        await this.navigateToSuitMainPage();
    }

		async endSuite(): Promise<void> {
        logInfo(`End of suit 'button' tests!`);
        await this._driver.takeScreenshot("end_button_suit");
    }

    async navigateToSuitMainPage(): Promise<void> {
        for (let index = 0; index < this._suitMainPageNavigationLinks.length; index++) {
            const mainPage = this._suitMainPageNavigationLinks[index];
            await this.navigateToSample(mainPage);
        }
    }

    async navigateToSample(sample: string) {
        logInfo(`Navigate to ${sample}`);
        const sampleName = sample.toLowerCase();

        if (this._elementsCacheStrategy === ElementCacheStrategy.allAtOnce) {
            if (!this._currentSuite.children.has(sampleName)) {
                await this.cacheAllElements(this._currentSuite);
            }
            if (!this._currentSuite.children.has(sampleName)) {
                throw new Error(`Could not find ${sample}`);
            }
            const sampleElement = this._currentSuite.children.get(sampleName).rect;
            await this._driver.clickPoint(sampleElement.x + (sampleElement.width / 2), sampleElement.y + (sampleElement.height / 2));
            this._currentSuite = this._currentSuite.children.get(sampleName);
        } else if (this._elementsCacheStrategy === ElementCacheStrategy.onload) {
            if (this._currentSuite.children.has(sampleName)) {
                const sampleElement = this._currentSuite.children.get(sampleName).rect;
                await this._driver.clickPoint(sampleElement.x + (sampleElement.width / 2), sampleElement.y + (sampleElement.height / 2));
                this._currentSuite = this._currentSuite.children.get(sampleName);
            } else {
                const sampleElement = await this._driver.waitForElement(sample);
                if (!sampleElement) {
                    throw new Error(`Could not find ${sample}`);
                }
                const rect = await sampleElement.getRectangle();
                const text = (await sampleElement.text()).toLowerCase();
                const newSuite: ICachedElement = { name: text, rect: rect, children: new Map(), parent: this._currentSuite };
                this._currentSuite.children.set(sampleName, newSuite);
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
        if (this._elementsCacheStrategy === ElementCacheStrategy.allAtOnce
            || this._elementsCacheStrategy === ElementCacheStrategy.onload) {
            this._currentSuite = this._currentSuite && this._currentSuite.parent;
        }
        await this._driver.navBack();
    }

    async swipeBackToSuitMainPage(): Promise<void> {
        logInfo(`Swipe to back`);
        const startPoint = <Point>{};
        const endPoint = <Point>{};

        if (this._driver.isIOS) {
            const rect = this._driver.getScreenActualViewPort();
            startPoint.x = 5;
            startPoint.y = rect.y;
            endPoint.x = (rect.width / this._driver.nsCapabilities.device.deviceScreenDensity) - 5;
            endPoint.y = startPoint.y;

            await this._driver.swipe(startPoint, endPoint);
        } else {
            logWarn(`Swipe back is not supported from android!`);
        }
    }

    private async cacheAllElements(cachedElements: ICachedElement): Promise<void> {
				const allSamples = await this._driver.findElementsByClassName(this._driver.locators.button);
        for (let index = 0; index < allSamples.length; index++) {
            const element = allSamples[index];
            const rect = await element.getRectangle();
						const text = (await element.text()).toLowerCase();

						if (cachedElements.children.has(text)) continue

						logInfo(text);
						cachedElements.children.set(
							  text,
							  {
								    parent: cachedElements,
								    name: text,
								    rect: rect,
								    children: new Map()
							  }
					  );
        }
    }
}
