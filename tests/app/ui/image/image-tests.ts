import { Image } from "ui/image";
import { StackLayout } from "ui/layouts/stack-layout";
import { GridLayout } from "ui/layouts/grid-layout";
import { isIOS, isAndroid } from "platform";
import { PropertyChangeData } from "data/observable";
import utils = require("utils/utils");

// import {target} from "../../TKUnit";

import TKUnit = require("../../TKUnit");

// >> img-require
import ImageModule = require("ui/image");
// << img-require

import types = require("utils/types");
import ImageSourceModule = require("image-source");
import ViewModule = require("ui/core/view");
import helper = require("../helper");
import ObservableModule = require("data/observable");
import enumsModule = require("ui/enums");
import fs = require("file-system");
import color = require("color");

var imagePath = fs.path.join(__dirname, "../../logo.png");

if (isAndroid) {
    var imageModule = require("ui/image");
    imageModule.currentMode = imageModule.CacheMode.memory; // use memory cache only.
}

export var test_Image_Members = function () {
    var image = new ImageModule.Image();
    TKUnit.assert(types.isUndefined(image.src), "Image.src is defined");
    TKUnit.assert(types.isDefined(image.isLoading), "Image.isLoading is not defined");
    TKUnit.assert(image.isLoading === false, "Image.isLoading is default value should be false.");
}

/* TODO: We need a way to programmatically add an image to resources and then load it from, otherwise we do not know if there is such resource in the target native app.
export var test_settingImageSource = function () {
    // >> img-create
    var image = new ImageModule.Image();
    image.imageSource = ImageSourceModule.fromResource("logo");
    // << img-create
    
    var testFunc = function (views: Array<ViewModule.View>) {
        var testImage = <ImageModule.Image> views[0];

        var desiredSize = testImage._measureNativeView(new geometry.Size(100, 100));
        var width = desiredSize.width;
        var height = desiredSize.height;

        TKUnit.assert(width > 0, "Width should be greater than 0.");
        TKUnit.assert(height > 0, "Height should be greater than 0.");
    }

    helper.buildUIAndRunTest(image, testFunc);
}
*/

function runImageTest(done, image: ImageModule.Image, src: string) {
    image.src = null;

    var testModel = new ObservableModule.Observable();
    testModel.set("imageIsLoading", false);

    let handler = function (data: ObservableModule.PropertyChangeData) {
        testModel.off(ObservableModule.Observable.propertyChangeEvent, handler);

        try {
            let imageIsLoaded = isIOS ? !!image.imageSource : true;
            TKUnit.assertTrue(!image.isLoading, "Image.isLoading should be false.");
            TKUnit.assertTrue(!testModel.get("imageIsLoading"), "imageIsLoading on viewModel should be false.");
            TKUnit.assertTrue(imageIsLoaded, "imageSource should be set.");
            if (done) {
                done(null);
            }
        }
        catch (e) {
            if (done) {
                done(e);
            } else {
                throw e;
            }
        }
    };

    image.bind({
        sourceProperty: "imageIsLoading",
        targetProperty: "isLoading",
        twoWay: true
    }, testModel);

    let page = helper.getCurrentPage();
    page.content = image;
    image.src = src;
    testModel.on(ObservableModule.Observable.propertyChangeEvent, handler);
    if (done) {
        TKUnit.assertTrue(image.isLoading, "Image.isLoading should be true.");
        TKUnit.assertTrue(testModel.get("imageIsLoading"), "model.isLoading should be true.");
    } else {
        // Since it is synchronous check immediately.
        handler(null);
    }
}

export var test_SettingImageSrc = function (done) {
    // >> img-create-src
    var image = new ImageModule.Image();
    image.src = "https://www.google.com/images/errors/logo_sm_2.png";
    // << img-create-src
    (<any>image).useCache = false;
    runImageTest(done, image, image.src)
}

export var test_SettingImageSrcToFileWithinApp = function () {
    // >> img-create-local
    var image = new ImageModule.Image();
    image.src = "~/logo.png";
    // << img-create-local

    runImageTest(null, image, image.src)
}

export var test_SettingImageSrcToDataURI = function () {
    // >> img-create-datauri
    var image = new ImageModule.Image();
    image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAAXNSR0IArs4c6QAAABxpRE9UAAAAAgAAAAAAAAACAAAAKAAAAAIAAAACAAAARiS4uJEAAAASSURBVBgZYvjPwABHSMz/DAAAAAD//0GWpK0AAAAOSURBVGNgYPiPhBgQAACEvQv1D5y/pAAAAABJRU5ErkJggg==";
    // << img-create-datauri

    runImageTest(null, image, image.src)
}

export var test_SettingImageSrcToFileWithinAppAsync = function (done) {
    var image = new ImageModule.Image();
    (<any>image).useCache = false;
    image.loadMode = "async";
    image.src = "~/logo.png";
    runImageTest(done, image, image.src)
}

export var test_SettingImageSrcToDataURIAsync = function (done) {
    var image = new ImageModule.Image();
    image.loadMode = "async";
    image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAAXNSR0IArs4c6QAAABxpRE9UAAAAAgAAAAAAAAACAAAAKAAAAAIAAAACAAAARiS4uJEAAAASSURBVBgZYvjPwABHSMz/DAAAAAD//0GWpK0AAAAOSURBVGNgYPiPhBgQAACEvQv1D5y/pAAAAABJRU5ErkJggg==";
    runImageTest(done, image, image.src)
}

// NOTE: This tests that setting multiple times src will not show the imageSource of a previous src value.
// It however will never be reliable as to properly detect failure we need to use somewhat large timeout
// waiting for imageSource to be set to the wrong value.
export var __test_SettingImageSrcTwiceMustNotMismatch = function (done) {
    var image = new Image();
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
}

export var test_SettingStretch_AspectFit = function () {
    // >> img-set-stretch
    var image = new ImageModule.Image();
    image.imageSource = ImageSourceModule.fromFile(imagePath);
    // There are 4 modes of stretching none, fill, aspectFill, aspectFit
    // The default value is aspectFit.
    // Image stretch can be set by using ImageModule.stretch enum.
    image.stretch = enumsModule.Stretch.aspectFit;
    // << img-set-stretch

    var testFunc = function (views: Array<ViewModule.View>) {
        var testImage = <ImageModule.Image>views[0];

        if (image.android) {
            var actualScaleType = testImage.android.getScaleType();
            var expectedScaleType = android.widget.ImageView.ScaleType.FIT_CENTER;
            TKUnit.assertEqual(actualScaleType, expectedScaleType, "actualScaleType");
        }
        else if (image.ios) {
            var actualContentMode = testImage.ios.contentMode;
            var expectedContentMode = UIViewContentMode.ScaleAspectFit;
            TKUnit.assertEqual(actualContentMode, expectedContentMode, "actualContentMode");
        }
    }

    helper.buildUIAndRunTest(image, testFunc);
}

export var test_SettingStretch_Default = function () {
    var image = new ImageModule.Image();
    image.imageSource = ImageSourceModule.fromFile(imagePath);

    var testFunc = function (views: Array<ViewModule.View>) {
        var testImage = <ImageModule.Image>views[0];

        if (image.android) {
            var actualScaleType = testImage.android.getScaleType();
            var expectedScaleType = android.widget.ImageView.ScaleType.FIT_CENTER;
            TKUnit.assert(actualScaleType === expectedScaleType, "Expected: " + expectedScaleType + ", Actual: " + actualScaleType);
        }
        else if (image.ios) {
            var actualContentMode = testImage.ios.contentMode;
            var expectedContentMode = UIViewContentMode.ScaleAspectFit;
            TKUnit.assert(actualContentMode === expectedContentMode, "Expected: " + expectedContentMode + ", Actual: " + actualContentMode);
        }
    }

    helper.buildUIAndRunTest(image, testFunc);
}

export var test_SettingStretch_AspectFill = function () {
    var image = new ImageModule.Image();
    image.imageSource = ImageSourceModule.fromFile(imagePath);
    image.stretch = enumsModule.Stretch.aspectFill;

    var testFunc = function (views: Array<ViewModule.View>) {
        var testImage = <ImageModule.Image>views[0];

        if (image.android) {
            var actualScaleType = testImage.android.getScaleType();
            var expectedScaleType = android.widget.ImageView.ScaleType.CENTER_CROP;
            TKUnit.assert(actualScaleType === expectedScaleType, "Expected: " + expectedScaleType + ", Actual: " + actualScaleType);
        }
        else if (image.ios) {
            var actualContentMode = testImage.ios.contentMode;
            var expectedContentMode = UIViewContentMode.ScaleAspectFill;
            TKUnit.assert(actualContentMode === expectedContentMode, "Expected: " + expectedContentMode + ", Actual: " + actualContentMode);
        }
    }

    helper.buildUIAndRunTest(image, testFunc);
}

export var test_SettingStretch_Fill = function () {
    var image = new ImageModule.Image();
    image.imageSource = ImageSourceModule.fromFile(imagePath);
    image.stretch = enumsModule.Stretch.fill;

    var testFunc = function (views: Array<ViewModule.View>) {
        var testImage = <ImageModule.Image>views[0];

        if (image.android) {
            var actualScaleType = testImage.android.getScaleType();
            var expectedScaleType = android.widget.ImageView.ScaleType.FIT_XY;
            TKUnit.assert(actualScaleType === expectedScaleType, "Expected: " + expectedScaleType + ", Actual: " + actualScaleType);
        }
        else if (image.ios) {
            var actualContentMode = testImage.ios.contentMode;
            var expectedContentMode = UIViewContentMode.ScaleToFill;
            TKUnit.assert(actualContentMode === expectedContentMode, "Expected: " + expectedContentMode + ", Actual: " + actualContentMode);
        }
    }

    helper.buildUIAndRunTest(image, testFunc);
}

export var test_SettingStretch_none = function () {
    var image = new ImageModule.Image();
    image.imageSource = ImageSourceModule.fromFile(imagePath);
    image.stretch = enumsModule.Stretch.none;

    var testFunc = function (views: Array<ViewModule.View>) {
        var testImage = <ImageModule.Image>views[0];

        if (image.android) {
            var actualScaleType = testImage.android.getScaleType();
            var expectedScaleType = android.widget.ImageView.ScaleType.MATRIX;
            TKUnit.assert(actualScaleType === expectedScaleType, "Expected: " + expectedScaleType + ", Actual: " + actualScaleType);
        }
        else if (image.ios) {
            var actualContentMode = testImage.ios.contentMode;
            var expectedContentMode = UIViewContentMode.TopLeft;
            TKUnit.assert(actualContentMode === expectedContentMode, "Expected: " + expectedContentMode + ", Actual: " + actualContentMode);
        }
    }

    helper.buildUIAndRunTest(image, testFunc);
}

function ios<T>(func: T): T {
    return isIOS ? func : undefined;
}

export var test_SettingImageSourceWhenSizedToParentDoesNotRequestLayout = ios(() => {
    let host = new GridLayout();

    let image = new Image();

    host.width = 300;
    host.height = 300;
    host.addChild(image);

    let mainPage = helper.getCurrentPage();
    mainPage.content = host;
    TKUnit.waitUntilReady(() => host.isLoaded);

    let called = false;
    image.requestLayout = () => called = true;
    image.src = "~/logo.png";

    TKUnit.assertFalse(called, "image.requestLayout should not be called.");
});

export var test_SettingImageSourceWhenFixedWidthAndHeightDoesNotRequestLayout = ios(() => {
    let host = new StackLayout();
    let image = new Image();
    image.width = 100;
    image.height = 100;
    host.addChild(image);

    let mainPage = helper.getCurrentPage();
    mainPage.content = host;
    TKUnit.waitUntilReady(() => host.isLoaded);

    let called = false;
    image.requestLayout = () => called = true;
    image.src = "~/logo.png";

    TKUnit.assertFalse(called, "image.requestLayout should not be called.");
});

export var test_SettingImageSourceWhenSizedToContentShouldInvalidate = ios(() => {
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

export var test_DimensionsAreRoundedAfterScale = function () {
    let host = new StackLayout();
    let image = new Image();
    (<any>image).useCache = false;
    image.src = "~/ui/image/700x50.png";
    let imageWidth = 700;
    let imageHeight = 50;

    let density = utils.layout.getDisplayDensity();
    let hostWidth = 320;
    host.width = hostWidth / density;
    host.height = hostWidth / density;
    host.addChild(image);
    let mainPage = helper.getCurrentPage();
    mainPage.content = host;
    TKUnit.waitUntilReady(() => host.isLayoutValid);

    let scale = hostWidth / imageWidth;
    let expectedHeight = Math.round(imageHeight * scale);
    TKUnit.assertEqual(image.getMeasuredWidth(), hostWidth, "Actual width is different from expected width.");
    TKUnit.assertEqual(image.getMeasuredHeight(), expectedHeight, "Actual height is different from expected height.");
};

export var test_tintColor = function () {
    var colorRed = new color.Color("red");
    var image = new ImageModule.Image();
    image.imageSource = ImageSourceModule.fromFile(imagePath);

    var testFunc = function (views: Array<ViewModule.View>) {
        var testImage = <ImageModule.Image>views[0];

        if (image.android) {
            var tintColor = testImage.android.getColorFilter();
            TKUnit.assert(tintColor === null, "tintColor expected to be set to null");
        }
        else if (image.ios) {
            var tintColor = testImage.ios.tintColor;
            var imageColor = utils.ios.getColor(testImage.ios.tintColor);
            TKUnit.assert(!imageColor.equals(colorRed), "imageColor expected to be different than tintColor");
        }
        image.tintColor = colorRed;

        if (image.android) {
            TKUnit.assert(testImage.android.getColorFilter() !== null, "tintColor expected to be set to a nonnull value");
        }
        else if (image.ios) {
            var imageColor = utils.ios.getColor(testImage.ios.tintColor);
            TKUnit.assert(imageColor.equals(colorRed), "tintColor expected to be set to: " + colorRed);
        }
    }

    helper.buildUIAndRunTest(image, testFunc);
}