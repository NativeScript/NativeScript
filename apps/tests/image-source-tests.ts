// <snippet module="image-source" title="image-source">
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

import imageSource = require("image-source");
import fs = require("file-system");
import enums = require("ui/enums");
import app = require("application");
import TKUnit = require("./TKUnit");
import platform = require("platform");

var imagePath = __dirname + "/logo.png";
var smallImagePath = __dirname + "/small-image.png";

/* TODO: We need a way to programmatically add an image to resources and then load it from, otherwise we do not know if there is such resource in the target native app.
export function testFromResource() {
    // <snippet module="image-source" title="image-source">
    // ### Load image using resource name
    // This is similar to loading Bitmap from `R.drawable.logo` on Android or calling `[UIImage imageNamed@"logo"]` on iOS
    // ``` JavaScript
    var img = imageSource.fromResource("logo");
    // ```
    // </snippet>
    TKUnit.assert(img.height > 0, "image.fromResource failed");
}
*/
export function testFromUrl(done) {
    //var completed;
    var result: imageSource.ImageSource;

    // <snippet module="image-source" title="image-source">
    // ### Load image from URL
    // ``` JavaScript
    imageSource.fromUrl("http://www.google.com/images/errors/logo_sm_2.png")
        .then(function (res: imageSource.ImageSource) {
            //console.log("Image successfully loaded");
            // <hide>
            //completed = true;
            result = res;
            try {
                TKUnit.assert(typeof result !== "undefined", "Image not downloaded");
                TKUnit.assert(result.height > 0, "Image not downloaded");
                done(null);
            }
            catch (e) {
                done(e);
            }
            // </hide>
        }, function (error) {
            //console.log("Error loading image: " + error);
            // <hide>
            //completed = true;
            done(error);
            // </hide>
        });
    // ```
    // </snippet>
}

export function testSaveToFile() {
    // <snippet module="image-source" title="image-source">
    // ### Save image source to PNG or JPG file
    // ``` JavaScript
    var img = imageSource.fromFile(imagePath);
    var folder = fs.knownFolders.documents();
    var path = fs.path.join(folder.path, "Test.png");
    var saved = img.saveToFile(path, enums.ImageFormat.png);
    // ```
    // </snippet>
    TKUnit.assert(saved, "Image not saved to file");
    TKUnit.assert(fs.File.exists(path), "Image not saved to file");
}

export function testFromFile() {
    // <snippet module="image-source" title="image-source">
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

export function testNativeFields() {
    var img = imageSource.fromFile(imagePath);
    if (app.android) {
        TKUnit.assert(img.android != null, "Image.android not updated.");
    } else if (app.ios) {
        TKUnit.assert(img.ios != null, "Image.ios not updated.");
    }
}

var expectedAndroidPng = "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAA3NCSVQICAjb4U/gAAAAFUlEQVQImWP8z4AAjAz/kTnIPGQAAG86AwGcuMlCAAAAAElFTkSuQmCC";
var expectedIos7Png = "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAHGlET1QAAAACAAAAAAAAAAIAAAAoAAAAAgAAAAIAAABGJLi4kQAAABJJREFUCB1i+M/AAEdIzP8MAAAAAP//HD3fegAAAA5JREFUY2Bg+I+EGBAAAIS9C/UPnL+kAAAAAElFTkSuQmCC";
var expectedIos8Png = "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAAXNSR0IArs4c6QAAABxpRE9UAAAAAgAAAAAAAAACAAAAKAAAAAIAAAACAAAARiS4uJEAAAASSURBVBgZYvjPwABHSMz/DAAAAAD//0GWpK0AAAAOSURBVGNgYPiPhBgQAACEvQv1D5y/pAAAAABJRU5ErkJggg==";

var expectedAndoirdJpeg = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAEAAQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+Pz/h5j+1Z/z9fBr/AMRt+AH/AM7uiiiv9fV9E36KOn/HMX0f+n/NlvDT/p3/ANUv/V3vrf8AP1nueaf8LOa9P+ZjjP8Ap3/0/wD6u99b/wD/2Q==";
var expectedIos7Jpeg = "/9j/4AAQSkZJRgABAQAAAQABAAD/4QBYRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAABKADAAQAAAABAAAABAAAAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAEAAQDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+P7/h5j+1L/z8fBj/AMRz+BX/AMwFH+on0Vf+kM/Cn/xe30/f/qyxf6xePH/SaH0//wDxvL6Wv/03z//Z";
var expectedIos8Jpeg = "/9j/4AAQSkZJRgABAQEASABIAAD/4QBYRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAABKADAAQAAAABAAAABAAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgABAAEAwERAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/bAEMBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/dAAQAAf/aAAwDAQACEQMRAD8A/j+/4eY/tS/89/gx/wCI5/Av/wCYGj/UT6Kn/SGnhT/4vb6fv/1ZYv8AWHx3/wCk0Pp//wDjef0tf/pvH//Z";

export function testBase64Encode_PNG() {
    var img = imageSource.fromFile(smallImagePath);

    var expected: string;
    if (app.android) {
        expected = expectedAndroidPng;
    } else if (app.ios) {
        if (platform.device.osVersion[0] === '7') {
            expected = expectedIos7Png;
        }
        else {
            expected = expectedIos8Png;
        }
    }

    var result = img.toBase64String(enums.ImageFormat.png);
    TKUnit.assertEqual(
        result,
        expected,
        "Base 64 encoded PNG");
}

export function testBase64Encode_JPEG() {
    var img = imageSource.fromFile(smallImagePath);

    var expected: string;
    if (app.android) {
        expected = expectedAndoirdJpeg;
    } else if (app.ios) {
        if (platform.device.osVersion[0] === '7') {
            expected = expectedIos7Jpeg;
        }
        else {
            expected = expectedIos8Jpeg;
        }
    }

    var result = img.toBase64String(enums.ImageFormat.jpeg);
    TKUnit.assertEqual(
        result,
        expected,
        "Base 64 encoded JPEG");
}
