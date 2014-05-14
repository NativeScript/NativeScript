import image = require("image/image"); 
import app = require("application/application"); 
import fs = require("filesystem/file_system"); 
import TKUnit = require("Tests/TKUnit"); 

export var testFromResource = function () {
    var img = image.fromResource(getTestImageName());
    TKUnit.assert(img.height > 0, "image.fromResource failed");
}

export var testFromUrl = function () {
    var completed;
    var result: image.Image;

    image.fromUrl("http://www.google.com/images/errors/logo_sm_2.png")
        .then(function (res: image.Image) {
            completed = true;
            result = res;
        })
        .fail(function (error) {
            completed = true;
        });

    var isReady = function () {
        return completed;
    }

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(typeof result !== "undefined", "Image not downloaded");
    TKUnit.assert(result.height > 0, "Image not downloaded");
}

export var testSaveToFile = function () {
    var img = image.fromResource(getTestImageName());
    var folder = fs.knownFolders.documents();
    var path = fs.path.join(folder.path, "Test.png");

    var saved = img.saveToFile(path, image.ImageFormat.PNG);
    TKUnit.assert(saved, "Image not saved to file");
    TKUnit.assert(fs.File.exists(path), "Image not saved to file");
}

export var testFromFile = function () {
    var folder = fs.knownFolders.documents();
    var path = fs.path.join(folder.path, "Test.png");

    var img = image.fromFile(path);
    
    TKUnit.assert(img.height > 0, "image.fromResource failed");

    // remove the image from the file system
    var file = folder.getFile("Test.png");
    file.remove();
    TKUnit.assert(!fs.File.exists(path), "Test.png not removed");
}

export var testNativeFields = function () {
    var img = image.fromResource(getTestImageName());
    if (app.android) {
        TKUnit.assert(img.android != null, "Image.android not updated.");
    } else if (app.ios) {
        TKUnit.assert(img.ios != null, "Image.ios not updated.");
    }
}

var getTestImageName = function (): string {
    if (app.ios) {
        return "AppIcon";
    }
    if (app.android) {
        return "ic_launcher";
    }

    return "";
}