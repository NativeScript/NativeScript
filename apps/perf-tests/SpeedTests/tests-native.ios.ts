/* tslint:disable:no-unused-variable */
import imageSource = require("image-source");

export function compareTwoNativeDates(secondsSince1970: number): void {
    var date1 = NSDate.dateWithTimeIntervalSince1970(secondsSince1970);
    var date2 = NSDate.date();
    var result = date1.compare(date2);
}

export function toByteArrayAndBack(image: imageSource.ImageSource): void {
    var bmp = image.ios;
    var data = UIImagePNGRepresentation(bmp);

    var bmpCopy = UIImage.imageWithData(data);
}