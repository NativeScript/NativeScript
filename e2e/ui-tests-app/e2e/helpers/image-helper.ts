import { AppiumDriver, logError, IRectangle, UIElement, logInfo, SearchOptions } from "nativescript-dev-appium";
import { ImageOptions } from "nativescript-dev-appium/lib/image-options";
import { assert } from "chai";

export class ImageHelper {
    private _imagesResults = new Map<string, boolean>();

    constructor(private _driver: AppiumDriver, waitOnCreatingInitialSnapshot: number = 1000  ) {
        this._driver.imageHelper.waitOnCreatingInitialSnapshot = waitOnCreatingInitialSnapshot;
     }

    public async compareScreen(imageName: string, timeOutSeconds?: number, tolerance?: number, toleranceType?: ImageOptions) {
        imageName = this.increaseImageName(imageName);
        const result = await this._driver.compareScreen(imageName, timeOutSeconds, tolerance, toleranceType)
        this._imagesResults.set(imageName, result);

        return result;
    }

    public async compareElement(imageName: string, element: UIElement, tolerance: number, timeOutSeconds: number, toleranceType: ImageOptions = ImageOptions.pixel) {
        imageName = this.increaseImageName(imageName);        
        const result = await this._driver.compareElement(element, imageName, tolerance, timeOutSeconds, toleranceType)
        this._imagesResults.set(imageName, result);

        return result;
    }

    public async compareRectangle(imageName: string, element: IRectangle, tolerance: number, timeOutSeconds: number, toleranceType: ImageOptions = ImageOptions.pixel) {
        imageName = this.increaseImageName(imageName);        
        const result = await this._driver.compareRectangle(element, imageName, timeOutSeconds, tolerance, toleranceType)
        this._imagesResults.set(imageName, result);

        return result;
    }

    public assertImages() {
        let shouldFailTest = false;
        console.log();
        this._imagesResults.forEach((v, k, map) => {
            if (!this._imagesResults.get(k)) {
                shouldFailTest = true;
                logError(`Image comparisson for image ${k} failed`);
            }
        });

        this.reset();
        assert.isTrue(!shouldFailTest, `Image comparisson failers`)
    }

    public reset() {
        this._imagesResults.clear();
    }

    private increaseImageName(imageName: string) {
        if (this._imagesResults && this._imagesResults.size > 0 && this._imagesResults.has(imageName)) {
            imageName = `${imageName}_1`;
        }

        return imageName;
    }
}