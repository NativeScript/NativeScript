// >> imagesource-require
// const imageSource = require("image-source");
// << imagesource-require

// >> imagesource-require-alt
// const fs = require("file-system");
// << imagesource-require-alt

import * as imageSource from "tns-core-modules/image-source";
import * as fs from "tns-core-modules/file-system";
import * as app from "tns-core-modules/application";
import * as TKUnit from "../TKUnit";
import * as platform from "tns-core-modules/platform";

const imagePath = "~/logo.png";
const smallImagePath = "~/small-image.png";

export function testFromResource() {
    // >> imagesource-resname
    const img = imageSource.fromResource("icon");
    // << imagesource-resname
    TKUnit.assert(img.height > 0, "image.fromResource failed");
}

export function testFromUrl(done) {
    let result: imageSource.ImageSource;

    // >> imagesource-load-url
    imageSource.fromUrl("https://www.google.com/images/errors/logo_sm_2.png")
        .then(function (res: imageSource.ImageSource) {
            //console.log("Image successfully loaded");
            // >> (hide)
            //completed = true;
            result = res;
            try {
                TKUnit.assertNotEqual(result, undefined, "Image not downloaded");
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
    const img = imageSource.fromFile(imagePath);
    const folder = fs.knownFolders.documents();
    const path = fs.path.join(folder.path, "test.png");
    const saved = img.saveToFile(path, "png");
    // << imagesource-save-to
    TKUnit.assert(saved, "Image not saved to file");
    TKUnit.assert(fs.File.exists(path), "Image not saved to file");
}

export function testFromFile() {
    // >> imagesource-load-local
    const folder = fs.knownFolders.documents();
    const path = fs.path.join(folder.path, "test.png");
    const img = imageSource.fromFile(path);
    // << imagesource-load-local

    TKUnit.assert(img.height > 0, "image.fromResource failed");

    // remove the image from the file system
    const file = folder.getFile("test.png");
    file.remove();
    TKUnit.assert(!fs.File.exists(path), "test.png not removed");
}

export function testNativeFields() {
    const img = imageSource.fromFile(imagePath);
    if (app.android) {
        TKUnit.assert(img.android != null, "Image.android not updated.");
    } else if (app.ios) {
        TKUnit.assert(img.ios != null, "Image.ios not updated.");
    }
}
const fullAndroidPng = "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAA3NCSVQICAjb4U/gAAAAFUlEQVQImWP8z4AAjAz/kTnIPGQAAG86AwGcuMlCAAAAAElFTkSuQmCC";
const fullIosPng = "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAAXNSR0IArs4c6QAAABxpRE9UAAAAAgAAAAAAAAACAAAAKAAAAAIAAAACAAAARiS4uJEAAAASSURBVBgZYvjPwABHSMz/DAAAAAD//0GWpK0AAAAOSURBVGNgYPiPhBgQAACEvQv1D5y/pAAAAABJRU5ErkJggg==";

const fullJpegImage = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAEAAQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+Pz/h5j+1Z/z9fBr/AMRt+AH/AM7uiiiv9fV9E36KOn/HMX0f+n/NlvDT/p3/ANUv/V3vrf8AP1nueaf8LOa9P+ZjjP8Ap3/0/wD6u99b/wD/2Q==";
const expectedJpegStart = "/9j/4AAQSkZJRgAB";
const expectedPngStart = "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAA";

export function testBase64Encode_PNG() {
    const img = imageSource.fromFile(smallImagePath);
    let result = img.toBase64String("png");

    result = result.substr(0, expectedPngStart.length);
    TKUnit.assertEqual(
        result,
        expectedPngStart,
        "Base 64 encoded PNG");
}

export function testBase64Encode_JPEG() {
    const img = imageSource.fromFile(smallImagePath);

    let result = img.toBase64String("jpeg");
    result = result.substr(0, expectedJpegStart.length);

    TKUnit.assertEqual(
        result,
        expectedJpegStart,
        "Base 64 encoded JPEG");
}

export function testLoadFromBase64Encode_JPEG() {
    let img: imageSource.ImageSource;
    img = imageSource.fromBase64(fullJpegImage);

    TKUnit.assert(img !== null, "Actual: " + img);
    TKUnit.assertEqual(img.width, 4, "img.width");
    TKUnit.assertEqual(img.height, 4, "img.height");
}

export function testLoadFromBase64Encode_PNG() {
    let img: imageSource.ImageSource;
    if (app.android) {
        img = imageSource.fromBase64(fullAndroidPng);
    } else if (app.ios) {
        img = imageSource.fromBase64(fullIosPng);
    }

    TKUnit.assert(img !== null, "Actual: " + img);
    TKUnit.assertEqual(img.width, 4, "img.width");
    TKUnit.assertEqual(img.height, 4, "img.height");
}
