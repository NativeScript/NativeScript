// >> imagesource-require
// var imageSource = require("image-source");
// << imagesource-require

// >> imagesource-require-alt
// var fs = require("file-system");
// << imagesource-require-alt

import * as imageSource from "image-source";
import * as fs from "file-system";
import * as enums from "ui/enums";
import * as app from "application";
import * as TKUnit from "./TKUnit";
import * as platform from "platform";

var imagePath = fs.path.join(__dirname, "/logo.png");
var smallImagePath = fs.path.join(__dirname, "/small-image.png");

/* TODO: We need a way to programmatically add an image to resources and then load it from, otherwise we do not know if there is such resource in the target native app.
export function testFromResource() {
    // >> imagesource-resname
    var img = imageSource.fromResource("logo");
    // << imagesource-resname
    TKUnit.assert(img.height > 0, "image.fromResource failed");
}
*/
export function testFromUrl(done) {
    //var completed;
    var result: imageSource.ImageSource;

    // >> imagesource-load-url
    imageSource.fromUrl("https://www.google.com/images/errors/logo_sm_2.png")
        .then(function (res: imageSource.ImageSource) {
        //console.log("Image successfully loaded");
        // >> (hide)
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
        // << (hide)
    }, function (error) {
            //console.log("Error loading image: " + error);
            // >> (hide)
            //completed = true;
            done(error);
            // << (hide)
        });
    // << imagesource-load-url
}

export function testSaveToFile() {
    // >> imagesource-save-to
    var img = imageSource.fromFile(imagePath);
    var folder = fs.knownFolders.documents();
    var path = fs.path.join(folder.path, "Test.png");
    var saved = img.saveToFile(path, enums.ImageFormat.png);
    // << imagesource-save-to
    TKUnit.assert(saved, "Image not saved to file");
    TKUnit.assert(fs.File.exists(path), "Image not saved to file");
}

export function testFromFile() {
    // >> imagesource-load-local
    var folder = fs.knownFolders.documents();
    var path = fs.path.join(folder.path, "Test.png");
    var img = imageSource.fromFile(path);
    // << imagesource-load-local

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

var fullJpegImage = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAEAAQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+Pz/h5j+1Z/z9fBr/AMRt+AH/AM7uiiiv9fV9E36KOn/HMX0f+n/NlvDT/p3/ANUv/V3vrf8AP1nueaf8LOa9P+ZjjP8Ap3/0/wD6u99b/wD/2Q==";
var expectedJpegStart = "/9j/4AAQSkZJRgAB";

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

    var result = img.toBase64String(enums.ImageFormat.jpeg);
    result = result.substr(0, expectedJpegStart.length);

    TKUnit.assertEqual(
        result,
        expectedJpegStart,
        "Base 64 encoded JPEG");
}

export function testLoadFromBase64Encode_JPEG() {
    var img: imageSource.ImageSource;
    img = imageSource.fromBase64(fullJpegImage);

    TKUnit.assert(img !== null, "Actual: " + img);
    TKUnit.assertEqual(img.width, 4, "img.width");
    TKUnit.assertEqual(img.height, 4, "img.height");
}

export function testLoadFromBase64Encode_PNG() {
    var img: imageSource.ImageSource;
    if (app.android) {
        img = imageSource.fromBase64(expectedAndroidPng);
    } else if (app.ios) {
        if (platform.device.osVersion[0] === '7') {
            img = imageSource.fromBase64(expectedIos7Png);
        }
        else {
            img = imageSource.fromBase64(expectedIos8Png);
        }
    }

    TKUnit.assert(img !== null, "Actual: " + img);
    TKUnit.assertEqual(img.width, 4, "img.width");
    TKUnit.assertEqual(img.height, 4, "img.height");
}