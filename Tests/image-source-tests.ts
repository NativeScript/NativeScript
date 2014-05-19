// <snippet name="image-source">
// # Image source
// Using the image source requires the image-source module.
// ``` JavaScript
//var imageSource = require("image-source");
// ```
// The pre-required `imageSource` module is used throughout the following code snippets.
// We also use fs module defined as follows:
// ``` JavaScript
//var fs = require("file-system");
// ```
// ## Loading and saving images
// </snippet>

import imageSource = require("image-source/image-source");
import app = require("application/application"); 
import fs = require("file-system/file-system"); 
import TKUnit = require("Tests/TKUnit"); 


export var testFromResource = function () {
    // <snippet name="image-source">
    // ### Load image using resource name
    // this similar to loading Bitmap from `R.drawable.logo` on Android or calling `[UIImage imageNamed@"logo"]` on iOS
    // ``` JavaScript
    var img = imageSource.fromResource("logo");
    // ```
    // </snippet>
    TKUnit.assert(img.height > 0, "image.fromResource failed");
}

export var testFromUrl = function () {
    var completed;
    var result: imageSource.ImageSource;

    // <snippet name="image-source">
    // ### Load image from URL
    // ``` JavaScript
    imageSource.fromUrl("http://www.google.com/images/errors/logo_sm_2.png")
        .then(function (res: imageSource.ImageSource) {
            //console.log("Image successfully loaded");
            // <hide>
            completed = true;
            result = res;
            // </hide>
        })
        .fail(function (error) {
            //console.log("Error loading image: " + error);
            // <hide>
            completed = true;
            // </hide>
         });
    // ```
    // </snippet>

    var isReady = function () {
        return completed;
    }

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(typeof result !== "undefined", "Image not downloaded");
    TKUnit.assert(result.height > 0, "Image not downloaded");
}

export var testSaveToFile = function () {
    // <snippet name="image-source">
    // ### Save image source to PNG or JPG file
    // ``` JavaScript
    var img = imageSource.fromResource("logo");
    var folder = fs.knownFolders.documents();
    var path = fs.path.join(folder.path, "Test.png");
    var saved = img.saveToFile(path, imageSource.ImageFormat.PNG);
    // ```
    // </snippet>
    TKUnit.assert(saved, "Image not saved to file");
    TKUnit.assert(fs.File.exists(path), "Image not saved to file");
}

export var testFromFile = function () {
    // <snippet name="image-source">
    // ### Load image from a local file
    // ``` JavaScript
    var folder = fs.knownFolders.documents();
    var path = fs.path.join(folder.path, "Test.png");
    var img = imageSource.fromFile(path);
    // ```
    // </snippet>

    TKUnit.assert(img.height > 0, "image.fromResource failed");

    // remove the image from the file system
    var file = folder.getFile("Test.png");
    file.remove();
    TKUnit.assert(!fs.File.exists(path), "Test.png not removed");
}

export var testNativeFields = function () {
    var img = imageSource.fromResource("logo");
    if (app.android) {
        TKUnit.assert(img.android != null, "Image.android not updated.");
    } else if (app.ios) {
        TKUnit.assert(img.ios != null, "Image.ios not updated.");
    }
}
