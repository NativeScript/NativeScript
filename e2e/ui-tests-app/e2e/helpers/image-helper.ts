import { AppiumDriver, logError, IRectangle, UIElement } from "nativescript-dev-appium";
import { ImageOptions } from "nativescript-dev-appium/lib/image-options";
import { assert } from "chai";

interface IImageCompareOptions {
    imageName?: string;
    timeOutSeconds?: number;
    tolerance?: number;
    toleranceType?: ImageOptions;
    waitOnCreatingInitialSnapshot?: number;
}

export class ImageHelper {

    private _imagesResults = new Map<string, boolean>();
    private _testName: string;

    constructor(private _driver: AppiumDriver, private _imageComppareOptions?: IImageCompareOptions) {
        this._driver.imageHelper.waitOnCreatingInitialSnapshot = (this._imageComppareOptions && this._imageComppareOptions.waitOnCreatingInitialSnapshot) || this.defualtOptions.waitOnCreatingInitialSnapshot;
    }

    public defualtOptions: IImageCompareOptions = {
        timeOutSeconds: 2,
        tolerance: 0,
        toleranceType: ImageOptions.pixel,
        waitOnCreatingInitialSnapshot: 2000,
    };

    get imageComppareOptions() {
        this.extendOptions(this._imageComppareOptions);

        return this._imageComppareOptions;
    }

    set imageComppareOptions(imageComppareOptions: IImageCompareOptions) {
        this._imageComppareOptions = imageComppareOptions;
    }

    public async compareScreen(options?: IImageCompareOptions) {
        options = this.extendOptions(options);
        const imageName = this.increaseImageName(options.imageName || this._testName);
        const result = await this._driver.compareScreen(imageName, options.timeOutSeconds, options.tolerance, options.toleranceType);
        this._imagesResults.set(imageName, result);

        return result;
    }

    public async compareElement(element: UIElement, options?: IImageCompareOptions) {
        options = this.extendOptions(options);
        const imageName = this.increaseImageName(options.imageName || this._testName);
        const result = await this._driver.compareElement(element, imageName, options.tolerance, options.timeOutSeconds, options.toleranceType);
        this._imagesResults.set(imageName, result);

        return result;
    }

    public async compareRectangle(element: IRectangle, options?: IImageCompareOptions) {
        options = this.extendOptions(options);
        const imageName = this.increaseImageName(options.imageName || this._testName);
        const result = await this._driver.compareRectangle(element, imageName, options.timeOutSeconds, options.tolerance, options.toleranceType);
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
        assert.isTrue(!shouldFailTest, `Image comparisson failers`);
    }

    public reset() {
        this._imagesResults.clear();
    }

    public setImageName(suite: string, spec: string, testsName: string) {
        this._testName = `${suite}-${spec}-${testsName.replace(suite, "").replace(spec, "")}`.replace(/(\-+)/ig, "-").replace(/(\_+)/ig, "_");

        return this._testName;
    }

    private increaseImageName(imageName: string) {
        if (this._imagesResults.size > 1) {
            const number = /\d+$/.test(imageName) ? +`${/\d+$/.exec(imageName)}` + 1 : `2`;
            imageName = `${imageName}_${number}`;
        }

        return imageName;
    }

    private extendOptions(options: IImageCompareOptions) {
        options = options || {};
        Object.getOwnPropertyNames(this.defualtOptions).forEach(prop => {
            if (!options[prop]) {
                options[prop] = this.defualtOptions[prop];
            }
        });

        return options;
    }
}