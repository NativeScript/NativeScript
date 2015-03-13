import TKUnit = require("../../TKUnit");
// <snippet module="ui/image" title="Image">
// # Image
// Using an image requires the Image module to be loaded.
// ``` JavaScript
import ImageModule = require("ui/image");
// ```

// Binding the image source property to a view-model property.
//```XML
// <Page>
//   <StackLayout>
//      <!--Bind the image source property to view-model property -->
//      {%raw%}<Image src="{{ thumbnailImageUrl }}" />{%endraw%}
//      <!--Load form image from application -->
//      <Image source="~/app/logo.png" stretch ="none" / > 
//      <!--Load form image resource -->
//      <Image source="res://app/logo.png" stretch ="none" / > 
//      <!--Load form image URL-->
//      <Image source="http://www.google.com/images/errors/logo_sm_2.png" stretch ="none" /> 
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

var imagePath = __dirname + "../../logo.png";

export var test_Image_Members = function () {
    var image = new ImageModule.Image();
    TKUnit.assert(types.isDefined(image.src), "Image.src is not defined");
    TKUnit.assert(types.isDefined(image.isLoading), "Image.isLoading is not defined");
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
    image.src = "https://www.google.bg/images/srpr/logo11w.png";
    // ```
    // </snippet>

    var testModel = new ObservableModule.Observable();
    testModel.set("imageIsLoading", true);

    image.bind({
        sourceProperty: "imageIsLoading",
        targetProperty: "isLoading",
        twoWay: true
    }, testModel);

    var imageIsLoaded = false;

    var testFunc = function (views: Array<ViewModule.View>) {
        var testImage = <ImageModule.Image> views[0];
        imageIsLoaded = !!testImage.imageSource;
        try {
            TKUnit.assert(testModel.get("imageIsLoading") === false, "Expected: false, Actual: " + testModel.get("imageIsLoading"));
            TKUnit.assert(imageIsLoaded === true, "Expected: true, Actual: " + imageIsLoaded);
            done(null);
        }
        catch (e) {
            done(e);
        }
    }

    // wait for a second in order to download the image.
    setTimeout(() => { helper.buildUIAndRunTest(image, testFunc) }, 3000);
}

export var test_SettingImageSrcToFileWithinApp = function (done) {
    // <snippet module="ui/image" title="Image">
    // ### How to create an image and set its src to file within the application.
    // ``` JavaScript
    var image = new ImageModule.Image();
    image.src = "~/app/logo.png";
    // ```
    // </snippet>

    var imageIsLoaded = false;

    var testFunc = function (views: Array<ViewModule.View>) {
        var testImage = <ImageModule.Image> views[0];
        imageIsLoaded = !!testImage.imageSource;
        try {
            TKUnit.assert(imageIsLoaded === true, "Expected: true, Actual: " + imageIsLoaded);
            done(null);
        }
        catch (e) {
            done(e);
        }
    }

    // wait for a second in order to download the image.
    setTimeout(() => { helper.buildUIAndRunTest(image, testFunc) }, 3000);
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
