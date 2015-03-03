/**
 * Allows you to take pictrues with the device's camera.
 */
declare module "camera" {

    import imageSource = require("image-source");

    /**
     * Take a photo using the camera.
     */
    export function takePicture(): Promise<imageSource.ImageSource>;
}
