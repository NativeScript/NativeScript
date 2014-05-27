
declare module "camera" {

    import promises = require("promises");
    import imageSource = require("image-source");

    /**
    * Specifies a camera position on a device.
    */
    enum CameraPosition {
        /**
        * The camera is located at the back of the device.
        */
        BACK = 0,

        /**
        * The camera is located at the front of the device, facing the user.
        */
        FRONT = 1,
    }

    /**
    * Specifies a camera flash mode.
    */
    enum FlashMode {
        /**
        * Flash will be fired automatically when required.
        */
        AUTO = 0,
        /**
        * The camera flash is enabled.
        */
        ON = 1,
        /**
        * The camera flash is disabled.
        */
        OFF = 2
    }

    /**
    * Camera options for capture an image.
    */
    interface Options {
        /**
        * Specifies which Camera to use.
        */
        cameraPosition?: CameraPosition;

        /**
        * Specifies flash mode.
        */
        flashMode?: FlashMode;
    }

    // TODO most of hardware related parts need to handle onPause and onResume of the calling activities

    /**
    * This class provides access to the device camera and photo libraries.
    */
    class CameraManager {
        /**
        * Take a photo using the camera.
        */
        takePicture(params: any, onSuccess: (imageData: any) => any, onError?: (error: any) => any);

        // TODO: Create an interface with the pictrue from library options: { useSavedPhotos: true }

        /**
        * Requests an image from the user.
        * The result may be a new photo taken or an existing image from the library.
        */
        pictureFromLibrary(params: any, onSuccess: (imageData: any) => any, onError?: (error: any) => any);
    }

    /**
    * Take a photo using the camera.
    */
    function takePicture(options?: Options): promises.Promise<imageSource.ImageSource>;
}
