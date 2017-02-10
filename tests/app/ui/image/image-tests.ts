import { Image } from "ui/image";
import { StackLayout } from "ui/layouts/stack-layout";
import { GridLayout } from "ui/layouts/grid-layout";
import { isIOS, isAndroid } from "platform";
import { PropertyChangeData } from "data/observable";
import * as utils from "utils/utils";
import * as TKUnit from "../../TKUnit";

// >> img-require
import * as ImageModule from "ui/image";
// << img-require

import * as types from "utils/types";
import * as ImageSourceModule from "image-source";
import * as ViewModule from "ui/core/view";
import * as helper from "../helper";
import * as ObservableModule from "data/observable";
import * as fs from "file-system";
import * as color from "color";

const imagePath = fs.path.join(__dirname, "../../logo.png");

if (isAndroid) {
    const imageModule = require("ui/image");
    imageModule.currentMode = imageModule.CacheMode.memory; // use memory cache only.
}

export const test_Image_Members = function () {
    const image = new ImageModule.Image();
    TKUnit.assert(types.isUndefined(image.src), "Image.src is defined");
    TKUnit.assert(types.isDefined(image.isLoading), "Image.isLoading is not defined");
    TKUnit.assert(image.isLoading === false, "Image.isLoading is default value should be false.");
};

/* TODO: We need a way to programmatically add an image to resources and then load it from, otherwise we do not know if there is such resource in the target native app.
export const test_settingImageSource = function () {
    // >> img-create
    const image = new ImageModule.Image();
    image.imageSource = ImageSourceModule.fromResource("logo");
    // << img-create
    
    const testFunc = function (views: Array<ViewModule.View>) {
        const testImage = <ImageModule.Image> views[0];

        const desiredSize = testImage._measureNativeView(new geometry.Size(100, 100));
        const width = desiredSize.width;
        const height = desiredSize.height;

        TKUnit.assert(width > 0, "Width should be greater than 0.");
        TKUnit.assert(height > 0, "Height should be greater than 0.");
    }

    helper.buildUIAndRunTest(image, testFunc);
}
*/

const IMAGE_LOADED_EVENT = "isLoadingChange";

function runImageTestSync(image: ImageModule.Image, src: string) {
    image.loadMode = "sync";
    image.src = null;

    const page = helper.getCurrentPage();
    page.content = image;

    image.src = src;

    let imageSourceAvailable = isIOS ? !!image.imageSource : true;
    TKUnit.assertFalse(image.isLoading, "Image.isLoading should be false.");
    TKUnit.assertTrue(imageSourceAvailable, "imageSource should be set.");
}

function runImageTestAsync(image: ImageModule.Image, src: string, done: (e: any) => void) {
    image.loadMode = "async";
    image.src = null;

    let handler = function (data: ObservableModule.PropertyChangeData) {
        image.off(IMAGE_LOADED_EVENT, handler);

        try {
            let imageSourceAvailable = isIOS ? !!image.imageSource : true;
            TKUnit.assertFalse(image.isLoading, "Image.isLoading should be false.");
            TKUnit.assertTrue(imageSourceAvailable, "imageSource should be set.");
            done(null);
        }
        catch (e) {
            done(e);
        }
    };

    let page = helper.getCurrentPage();
    page.content = image;
    image.src = src;
    image.on(IMAGE_LOADED_EVENT, handler);
    TKUnit.assertTrue(image.isLoading, "Image.isLoading should be true.");
}

export const test_SettingImageSrcToURL_async = function (done) {
    // >> img-create-src
    const image = new ImageModule.Image();
    image.src = "https://www.google.com/images/errors/logo_sm_2.png";
    // << img-create-src
    (<any>image).useCache = false;
    runImageTestAsync(image, image.src, done);
};

export const test_SettingImageSrcToFileWithinApp_sync  = function () {
    // >> img-create-local
    const image = new ImageModule.Image();
    image.src = "~/logo.png";
    // << img-create-local

    runImageTestSync(image, image.src);
};

export const test_SettingImageSrcToFileWithinApp_async = function (done) {
    const image = new ImageModule.Image();
    (<any>image).useCache = false;
    image.src = "~/logo.png";
    runImageTestAsync(image, image.src, done);
};

export const test_SettingImageSrcToDataURI_sync = function () {
    // >> img-create-datauri
    const image = new ImageModule.Image();
    image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAAXNSR0IArs4c6QAAABxpRE9UAAAAAgAAAAAAAAACAAAAKAAAAAIAAAACAAAARiS4uJEAAAASSURBVBgZYvjPwABHSMz/DAAAAAD//0GWpK0AAAAOSURBVGNgYPiPhBgQAACEvQv1D5y/pAAAAABJRU5ErkJggg==";
    // << img-create-datauri

    runImageTestSync(image, image.src);
};

export const test_SettingImageSrcToDataURI_async = function (done) {
    // >> img-create-datauri
    const image = new ImageModule.Image();
    image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAAXNSR0IArs4c6QAAABxpRE9UAAAAAgAAAAAAAAACAAAAKAAAAAIAAAACAAAARiS4uJEAAAASSURBVBgZYvjPwABHSMz/DAAAAAD//0GWpK0AAAAOSURBVGNgYPiPhBgQAACEvQv1D5y/pAAAAABJRU5ErkJggg==";
    // << img-create-datauri

    runImageTestAsync(image, image.src, done);
};

export function test_imageSourceNotResetAfterCreateUI() {
    let image = new ImageModule.Image();
    let imageSource = ImageSourceModule.fromResource("splashscreen.9");
    image.imageSource = imageSource;
    helper.buildUIAndRunTest(image, () => {
        TKUnit.waitUntilReady(() => image.isLoaded);
        TKUnit.assertEqual(image.imageSource, imageSource);
    });
}

// NOTE: This tests that setting multiple times src will not show the imageSource of a previous src value.
// It however will never be reliable as to properly detect failure we need to use somewhat large timeout
// waiting for imageSource to be set to the wrong value.
export const __test_SettingImageSrcTwiceMustNotMismatch = function (done) {
    const image = new Image();
    image.on("propertyChange", (args: PropertyChangeData) => {
        if (args.propertyName === "isLoading" && args.value === false) {
            setTimeout(() => {
                if (image.imageSource) {
                    done(new Error("Images source set from previous async src setting"));
                } else {
                    done();
                }
            }, 50); /* Slow! */
        }
    });
    image.loadMode = "async";
    image.src = "~/logo.png";
    image.src = null;
    // At somepoint image.imageSource was set to "~/logo.png";
};

export const test_SettingStretch_AspectFit = function () {
    // >> img-set-stretch
    const image = new ImageModule.Image();
    image.imageSource = ImageSourceModule.fromFile(imagePath);
    // There are 4 modes of stretching none, fill, aspectFill, aspectFit
    // The default value is aspectFit.
    // Image stretch can be set by using ImageModule.stretch enum.
    image.stretch = "aspectFit";
    // << img-set-stretch

    const testFunc = function (views: Array<ViewModule.View>) {
        const testImage = <ImageModule.Image>views[0];

        if (image.android) {
            const actualScaleType = testImage.android.getScaleType();
            const expectedScaleType = android.widget.ImageView.ScaleType.FIT_CENTER;
            TKUnit.assertEqual(actualScaleType, expectedScaleType, "actualScaleType");
        }
        else if (image.ios) {
            const actualContentMode = testImage.ios.contentMode;
            const expectedContentMode = UIViewContentMode.ScaleAspectFit;
            TKUnit.assertEqual(actualContentMode, expectedContentMode, "actualContentMode");
        }
    };

    helper.buildUIAndRunTest(image, testFunc);
};

export const test_SettingStretch_Default = function () {
    const image = new ImageModule.Image();
    image.imageSource = ImageSourceModule.fromFile(imagePath);

    const testFunc = function (views: Array<ViewModule.View>) {
        const testImage = <ImageModule.Image>views[0];

        if (image.android) {
            const actualScaleType = testImage.android.getScaleType();
            const expectedScaleType = android.widget.ImageView.ScaleType.FIT_CENTER;
            TKUnit.assert(actualScaleType === expectedScaleType, "Expected: " + expectedScaleType + ", Actual: " + actualScaleType);
        }
        else if (image.ios) {
            const actualContentMode = testImage.ios.contentMode;
            const expectedContentMode = UIViewContentMode.ScaleAspectFit;
            TKUnit.assert(actualContentMode === expectedContentMode, "Expected: " + expectedContentMode + ", Actual: " + actualContentMode);
        }
    };

    helper.buildUIAndRunTest(image, testFunc);
};

export const test_SettingStretch_AspectFill = function () {
    const image = new ImageModule.Image();
    image.imageSource = ImageSourceModule.fromFile(imagePath);
    image.stretch = "aspectFill";

    const testFunc = function (views: Array<ViewModule.View>) {
        const testImage = <ImageModule.Image>views[0];

        if (image.android) {
            const actualScaleType = testImage.android.getScaleType();
            const expectedScaleType = android.widget.ImageView.ScaleType.CENTER_CROP;
            TKUnit.assert(actualScaleType === expectedScaleType, "Expected: " + expectedScaleType + ", Actual: " + actualScaleType);
        }
        else if (image.ios) {
            const actualContentMode = testImage.ios.contentMode;
            const expectedContentMode = UIViewContentMode.ScaleAspectFill;
            TKUnit.assert(actualContentMode === expectedContentMode, "Expected: " + expectedContentMode + ", Actual: " + actualContentMode);
        }
    };

    helper.buildUIAndRunTest(image, testFunc);
};

export const test_SettingStretch_Fill = function () {
    const image = new ImageModule.Image();
    image.imageSource = ImageSourceModule.fromFile(imagePath);
    image.stretch = "fill";

    const testFunc = function (views: Array<ViewModule.View>) {
        const testImage = <ImageModule.Image>views[0];

        if (image.android) {
            const actualScaleType = testImage.android.getScaleType();
            const expectedScaleType = android.widget.ImageView.ScaleType.FIT_XY;
            TKUnit.assert(actualScaleType === expectedScaleType, "Expected: " + expectedScaleType + ", Actual: " + actualScaleType);
        }
        else if (image.ios) {
            const actualContentMode = testImage.ios.contentMode;
            const expectedContentMode = UIViewContentMode.ScaleToFill;
            TKUnit.assert(actualContentMode === expectedContentMode, "Expected: " + expectedContentMode + ", Actual: " + actualContentMode);
        }
    };

    helper.buildUIAndRunTest(image, testFunc);
};

export const test_SettingStretch_none = function () {
    const image = new ImageModule.Image();
    image.imageSource = ImageSourceModule.fromFile(imagePath);
    image.stretch = "none";

    const testFunc = function (views: Array<ViewModule.View>) {
        const testImage = <ImageModule.Image>views[0];

        if (image.android) {
            const actualScaleType = testImage.android.getScaleType();
            const expectedScaleType = android.widget.ImageView.ScaleType.MATRIX;
            TKUnit.assert(actualScaleType === expectedScaleType, "Expected: " + expectedScaleType + ", Actual: " + actualScaleType);
        }
        else if (image.ios) {
            const actualContentMode = testImage.ios.contentMode;
            const expectedContentMode = UIViewContentMode.TopLeft;
            TKUnit.assert(actualContentMode === expectedContentMode, "Expected: " + expectedContentMode + ", Actual: " + actualContentMode);
        }
    };

    helper.buildUIAndRunTest(image, testFunc);
};

function ios<T>(func: T): T {
    return isIOS ? func : undefined;
}

export const test_SettingImageSourceWhenSizedToParentDoesNotRequestLayout = ios(() => {
    let host = new GridLayout();

    let image = new Image();

    host.width = { value: 300, unit: "dip" };
    host.height = { value: 300, unit: "dip" };
    host.addChild(image);

    let mainPage = helper.getCurrentPage();
    mainPage.content = host;
    TKUnit.waitUntilReady(() => host.isLoaded);

    let called = false;
    image.requestLayout = () => called = true;
    image.src = "~/logo.png";

    TKUnit.assertFalse(called, "image.requestLayout should not be called.");
});

export const test_SettingImageSourceWhenFixedWidthAndHeightDoesNotRequestLayout = ios(() => {
    let host = new StackLayout();
    let image = new Image();
    image.width = { value: 100, unit: "dip" };
    image.height = { value: 100, unit: "dip" };
    host.addChild(image);

    let mainPage = helper.getCurrentPage();
    mainPage.content = host;
    TKUnit.waitUntilReady(() => host.isLoaded);

    let called = false;
    image.requestLayout = () => called = true;
    image.src = "~/logo.png";

    TKUnit.assertFalse(called, "image.requestLayout should not be called.");
});

export const test_SettingImageSourceWhenSizedToContentShouldInvalidate = ios(() => {
    let host = new StackLayout();
    let image = new Image();
    host.addChild(image);

    let mainPage = helper.getCurrentPage();
    mainPage.content = host;
    TKUnit.waitUntilReady(() => host.isLoaded);

    let called = false;
    image.requestLayout = () => called = true;
    image.src = "~/logo.png";

    TKUnit.assertTrue(called, "image.requestLayout should be called.");
});

export const test_DimensionsAreRoundedAfterScale = function () {
    let host = new StackLayout();
    let image = new Image();
    (<any>image).useCache = false;
    image.loadMode = "sync";
    image.src = "~/ui/image/700x50.png";
    let imageWidth = 700;
    let imageHeight = 50;

    let density = utils.layout.getDisplayDensity();
    let hostWidth = 320;
    host.width = { value: hostWidth / density, unit: "dip" };
    host.height = { value: hostWidth / density, unit: "dip" };
    host.addChild(image);
    let mainPage = helper.getCurrentPage();
    mainPage.content = host;
    TKUnit.waitUntilReady(() => host.isLayoutValid);

    let scale = hostWidth / imageWidth;
    let expectedHeight = Math.round(imageHeight * scale);
    TKUnit.assertEqual(image.getMeasuredWidth(), hostWidth, "Actual width is different from expected width.");
    TKUnit.assertEqual(image.getMeasuredHeight(), expectedHeight, "Actual height is different from expected height.");
};

export const test_tintColor = function () {
    const colorRed = new color.Color("red");
    const image = new ImageModule.Image();
    image.imageSource = ImageSourceModule.fromFile(imagePath);

    const testFunc = function (views: Array<ViewModule.View>) {
        const testImage = <ImageModule.Image>views[0];

        if (image.android) {
            const tintColor = testImage.android.getColorFilter();
            TKUnit.assert(tintColor === null, "tintColor expected to be set to null");
        }
        else if (image.ios) {
            const imageColor = utils.ios.getColor(testImage.ios.tintColor);
            TKUnit.assert(!imageColor.equals(colorRed), "imageColor expected to be different than tintColor");
        }
        image.tintColor = colorRed;

        if (image.android) {
            TKUnit.assert(testImage.android.getColorFilter() !== null, "tintColor expected to be set to a nonnull value");
        }
        else if (image.ios) {
            const imageColor = utils.ios.getColor(testImage.ios.tintColor);
            TKUnit.assert(imageColor.equals(colorRed), "tintColor expected to be set to: " + colorRed);
        }
    };

    helper.buildUIAndRunTest(image, testFunc);
};