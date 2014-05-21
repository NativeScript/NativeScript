
declare module "camera" {

    import promises = require("promises");
    import imageSource = require("image-source");

    enum CameraPosition {
        FRONT = 0,
        BACK = 1,
    }

    enum FlashMode {
        AUTO = 0,  // default
        ON = 1,
        OFF = 2
    }

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
    class CameraManager {
        takePicture(params: any, onSuccess: (imageData: any) => any, onError?: (error: any) => any);

        // options { useSavedPhotos: true }
        pictureFromLibrary(params: any, onSuccess: (imageData: any) => any, onError?: (error: any) => any);
    }

    var takePicture: (options?: Options) => promises.Promise<imageSource.ImageSource>;
}
