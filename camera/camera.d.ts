/**
 * Allows you to take pictrues with the device's camera.
 */
declare module "camera" {

    import imageSource = require("image-source");

    /**
     * Take a photo using the camera.
     * @param width - Optional parameter which defines the required width of the taken picture.
     * @param height - Optional parameter which defines the required height of the taken picture.
     */
    export function takePicture(width?: number, heigth?: number): Promise<imageSource.ImageSource>;
}
