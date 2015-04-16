/**
 * Allows you to take pictrues with the device's camera.
 */
declare module "camera" {

    import imageSource = require("image-source");

    /**
     * Take a photo using the camera.
     * @param width - Optional parameter which defines the required width of the taken picture.
     * @param height - Optional parameter which defines the required height of the taken picture.
     * @param keepAspectRatio - Optional parameter which controls if the result picture will keep the aspect ratio of the picture taken by camera.
     */
    export function takePicture(width?: number, heigth?: number, keepAspectRatio?: boolean): Promise<imageSource.ImageSource>;
}
