import TKUnit = require("../../TKUnit");
// <snippet module="ui/image" title="Image">
// # Image
// Using an image requires the Image module to be loaded.
// ``` JavaScript
import ImageModule = require("ui/image");
// ```

// Binding the image source property to a view-model property.
//``` XML
// <Page>
//   <StackLayout>
//      <!--Bind the image source property to view-model property -->
//      {%raw%}<Image src="{{ thumbnailImageUrl }}" />{%endraw%}
//      <!--Load form image from application -->
//      <Image src="~/logo.png" stretch ="none" / > 
//      <!--Load form image resource -->
//      <Image src="res://logo.png" stretch ="none" / > 
//      <!--Load form image URL-->
//      <Image src="http://www.google.com/images/errors/logo_sm_2.png" stretch ="none" /> 
//   </StackLayout>
// </Page>
//```

// </snippet>

import types = require("utils/types");
import ImageSourceModule = require("image-source");
import ViewModule = require("ui/core/view");
import helper = require("../helper");
import ObservableModule = require("data/observable");
import enumsModule = require("ui/enums");
import fs = require("file-system");

var imagePath = fs.path.join(__dirname, "../../logo.png");

export var test_Image_Members = function () {
    var image = new ImageModule.Image();
    TKUnit.assert(types.isUndefined(image.src), "Image.src is defined");
    TKUnit.assert(types.isDefined(image.isLoading), "Image.isLoading is not defined");
    TKUnit.assert(image.isLoading === false, "Image.isLoading is default value should be false.");
}

/* TODO: We need a way to programmatically add an image to resources and then load it from, otherwise we do not know if there is such resource in the target native app.
export var test_settingImageSource = function () {
    // <snippet module="ui/image" title="Image">
    // ### How to create an image and set its source.
    // ``` JavaScript
    var image = new ImageModule.Image();
    image.imageSource = ImageSourceModule.fromResource("logo");
    // ```
    // </snippet>
    
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

export var test_SettingImageSrc = function (done) {
    // <snippet module="ui/image" title="Image">
    // ### How to create an image and set its src.
    // ``` JavaScript
    var image = new ImageModule.Image();
    image.src = "https://www.google.com/images/errors/logo_sm_2.png";
    // ```
    // </snippet>

    image.src = null;

    var testModel = new ObservableModule.Observable();
    testModel.set("imageIsLoading", false);

    let handler = function (data: ObservableModule.PropertyChangeData) {
        testModel.off(ObservableModule.Observable.propertyChangeEvent, handler);

        try {
            let imageIsLoaded = !!image.imageSource;
            TKUnit.assertTrue(!image.isLoading, "Image.isLoading should be false.");
            TKUnit.assertTrue(!testModel.get("imageIsLoading"), "imageIsLoading on viewModel should be false.");
            TKUnit.assertTrue(imageIsLoaded, "imageIsLoading should be true.");
            done(null);
        }
        catch (e) {
            done(e);
        }
    };

    image.bind({
        sourceProperty: "imageIsLoading",
        targetProperty: "isLoading",
        twoWay: true
    }, testModel);

    image.src = "https://www.google.com/images/errors/logo_sm_2.png";
    testModel.on(ObservableModule.Observable.propertyChangeEvent, handler);
    TKUnit.assertTrue(image.isLoading, "Image.isLoading should be true.");
    TKUnit.assertTrue(testModel.get("imageIsLoading"), "model.isLoading should be true.");
}

export var test_SettingImageSrcToFileWithinApp = function (done) {
    // <snippet module="ui/image" title="Image">
    // ### How to create an image and set its src to file within the application.
    // ``` JavaScript
    var image = new ImageModule.Image();
    image.src = "~/logo.png";
    // ```
    // </snippet>

    var testFunc = function (views: Array<ViewModule.View>) {
        var testImage = <ImageModule.Image> views[0];
        TKUnit.waitUntilReady(() => !testImage.isLoading, 3);
        try {
            TKUnit.assertTrue(!testImage.isLoading, "isLoading should be false.");
            done(null);
        }
        catch (e) {
            done(e);
        }
    }

    helper.buildUIAndRunTest(image, testFunc);
}

export var test_SettingImageSrcToDataURI = function (done) {
    // <snippet module="ui/image" title="Image">
    // ### How to create an image and set its src to Data URI.
    // ``` JavaScript
    var image = new ImageModule.Image();
    image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAAXNSR0IArs4c6QAAABxpRE9UAAAAAgAAAAAAAAACAAAAKAAAAAIAAAACAAAARiS4uJEAAAASSURBVBgZYvjPwABHSMz/DAAAAAD//0GWpK0AAAAOSURBVGNgYPiPhBgQAACEvQv1D5y/pAAAAABJRU5ErkJggg==";
    // ```
    // </snippet>

    var testFunc = function (views: Array<ViewModule.View>) {
        var testImage = <ImageModule.Image>views[0];
        TKUnit.waitUntilReady(() => !testImage.isLoading, 3);
        try {
            TKUnit.assertTrue(!testImage.isLoading, "isLoading should be false.");
            TKUnit.assertNotNull(testImage.imageSource);
            done(null);
        }
        catch (e) {
            done(e);
        }
    }

    helper.buildUIAndRunTest(image, testFunc);
}

export var test_SettingStretch_AspectFit = function () {
    // <snippet module="ui/image" title="Image">
    // ### How to set image stretching.
    // ``` JavaScript
    var image = new ImageModule.Image();
    image.imageSource = ImageSourceModule.fromFile(imagePath);
    //// There are 4 modes of stretching none, fill, aspectFill, aspectFit
    //// The default value is aspectFit.
    //// Image stretch can be set by using ImageModule.stretch enum.
    image.stretch = enumsModule.Stretch.aspectFit;
    // ```
    // </snippet>

    var testFunc = function (views: Array<ViewModule.View>) {
        var testImage = <ImageModule.Image> views[0];

        if (image.android) {
            var actualScaleType = testImage.android.getScaleType();
            var expectedScaleType = android.widget.ImageView.ScaleType.FIT_CENTER;
            TKUnit.assertEqual(actualScaleType, expectedScaleType, "actualScaleType");
        }
        else if (image.ios) {
            var actualContentMode = testImage.ios.contentMode;
            var expectedContentMode = UIViewContentMode.UIViewContentModeScaleAspectFit;
            TKUnit.assertEqual(actualContentMode, expectedContentMode, "actualContentMode");
        }
    }

    helper.buildUIAndRunTest(image, testFunc);
}

export var test_SettingStretch_Default = function () {
    var image = new ImageModule.Image();
    image.imageSource = ImageSourceModule.fromFile(imagePath);

    var testFunc = function (views: Array<ViewModule.View>) {
        var testImage = <ImageModule.Image> views[0];

        if (image.android) {
            var actualScaleType = testImage.android.getScaleType();
            var expectedScaleType = android.widget.ImageView.ScaleType.FIT_CENTER;
            TKUnit.assert(actualScaleType === expectedScaleType, "Expected: " + expectedScaleType + ", Actual: " + actualScaleType);
        }
        else if (image.ios) {
            var actualContentMode = testImage.ios.contentMode;
            var expectedContentMode = UIViewContentMode.UIViewContentModeScaleAspectFit;
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
        var testImage = <ImageModule.Image> views[0];

        if (image.android) {
            var actualScaleType = testImage.android.getScaleType();
            var expectedScaleType = android.widget.ImageView.ScaleType.CENTER_CROP;
            TKUnit.assert(actualScaleType === expectedScaleType, "Expected: " + expectedScaleType + ", Actual: " + actualScaleType);
        }
        else if (image.ios) {
            var actualContentMode = testImage.ios.contentMode;
            var expectedContentMode = UIViewContentMode.UIViewContentModeScaleAspectFill;
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
        var testImage = <ImageModule.Image> views[0];

        if (image.android) {
            var actualScaleType = testImage.android.getScaleType();
            var expectedScaleType = android.widget.ImageView.ScaleType.FIT_XY;
            TKUnit.assert(actualScaleType === expectedScaleType, "Expected: " + expectedScaleType + ", Actual: " + actualScaleType);
        }
        else if (image.ios) {
            var actualContentMode = testImage.ios.contentMode;
            var expectedContentMode = UIViewContentMode.UIViewContentModeScaleToFill;
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
        var testImage = <ImageModule.Image> views[0];

        if (image.android) {
            var actualScaleType = testImage.android.getScaleType();
            var expectedScaleType = android.widget.ImageView.ScaleType.MATRIX;
            TKUnit.assert(actualScaleType === expectedScaleType, "Expected: " + expectedScaleType + ", Actual: " + actualScaleType);
        }
        else if (image.ios) {
            var actualContentMode = testImage.ios.contentMode;
            var expectedContentMode = UIViewContentMode.UIViewContentModeTopLeft;
            TKUnit.assert(actualContentMode === expectedContentMode, "Expected: " + expectedContentMode + ", Actual: " + actualContentMode);
        }
    }

    helper.buildUIAndRunTest(image, testFunc);
}
