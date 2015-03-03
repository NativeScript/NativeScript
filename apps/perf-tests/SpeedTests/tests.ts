/* tslint:disable:no-unused-variable */
import testsNative = require("app/SpeedTests/tests-native");
import trace = require("trace");
import imageSourceModule = require("image-source");

export function compareNativeDates(count: number): string {
    console.log("Comparing Native dates " + count + " times.");
    var startTime = new Date().getMilliseconds();
    for (var i = 0; i < count; i++) {
        testsNative.compareTwoNativeDates(i);
    }
    var elapsedTime = Math.round(new Date().getMilliseconds() - startTime);
    var averageTime = (elapsedTime / count);
    var message = "Total: " + elapsedTime + " ms. Avg: " + averageTime + " ms.";
    trace.write(message, trace.categories.Test, trace.messageType.info);
    return message;
}

export function compareJavaScriptDates(count: number): string {
    console.log("Comparing JavaScript dates " + count + " times.");
    var startTime = new Date().getMilliseconds();
    for (var i = 0; i < count; i++) {
        compareTwoJavaScriptDates(i);
    }
    var elapsedTime = Math.round(new Date().getMilliseconds() - startTime);
    var averageTime = (elapsedTime / count);
    var message = "Total: " + elapsedTime + " ms. Avg: " + averageTime + " ms.";
    trace.write(message, trace.categories.Test, trace.messageType.info);
    return message;
}

var compareTwoJavaScriptDates = function (secondsSince1970: number) {
    var date1 = new Date(secondsSince1970 * 1000);
    var date2 = new Date();
    var result = date1 < date2;
}

export function decodeAndEncodeBitmap(count: number, finishedCallback: (message) => void): void {
    var url = "https://www.google.bg/images/srpr/mlogo2x_3.png";
    imageSourceModule.fromUrl(url).then(function (result) {
        console.log("Bitmap -> byte[] -> Bitmap " + count + " times.");
        var startTime = new Date().getMilliseconds();
        for (var i = 0; i < count; i++) {
            testsNative.toByteArrayAndBack(result);
        }
        var elapsedTime = Math.round(new Date().getMilliseconds() - startTime);
        var averageTime = (elapsedTime / count);
        var message = "Total: " + elapsedTime + " ms. Avg: " + averageTime + " ms.";
        trace.write(message, trace.categories.Test, trace.messageType.info);
        return finishedCallback(message);
    }, function (error) {
            console.log(error.message);
        });
}
