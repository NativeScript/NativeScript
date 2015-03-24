declare module "SpeedTests/tests-native" {
    import imageSource = require("image-source");

    export function compareTwoNativeDates(secondsSince1970: number): void;
    export function toByteArrayAndBack(image: imageSource.ImageSource): void;
}
 
