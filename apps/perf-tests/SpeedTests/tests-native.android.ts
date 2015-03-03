/* tslint:disable:no-unused-variable */
import imageSource = require("image-source");

// Declare these for performance rasons.
var javaDate = java.util.Date;

export function compareTwoNativeDates(secondsSince1970: number): void {
    var date1 = new javaDate(secondsSince1970 * 1000);
    var date2 = new javaDate();
    var result = date1.compareTo(date2);
}

var options = new android.graphics.BitmapFactory.Options();
options.inMutable = true;

// Declare these for performance rasons.
var javaByteArrayOutputStream = java.io.ByteArrayOutputStream;
var javaCompressFormatPNG = android.graphics.Bitmap.CompressFormat.PNG;
var javaBitmapFactory = android.graphics.BitmapFactory;

export function toByteArrayAndBack(image: imageSource.ImageSource): void {
    var bmp = image.android;

    var stream = new javaByteArrayOutputStream();
    bmp.compress(javaCompressFormatPNG, 100, stream);
    var data = stream.toByteArray();

    var bmpCopy = javaBitmapFactory.decodeByteArray(data, 0, data.length, options);
}