
import promises = require("promises/promises");
import imageSource = require("image-source/image-source");

export declare enum CameraPosition {
    FRONT = 0,
    BACK = 1,
}

export declare enum FlashMode {
    AUTO = 0,  // default
    ON = 1,
    OFF = 2
}

export interface Options {
    /**
    * Specifies which Camera to use
    */
    cameraPosition?: CameraPosition;

    /**
    * Specifies flash mode
    */
    flashMode?: FlashMode;
}

// TODO most of hardware related parts need to handle onPause and onResume of the calling activities
export declare class CameraManager {
    takePicture(params: any, onSuccess: (imageData: any) => any, onError?: (error: any) => any);

    // options { useSavedPhotos: true }
    pictureFromLibrary(params: any, onSuccess: (imageData: any) => any, onError?: (error: any) => any);
}

export declare var takePicture: (options?: Options) => promises.Promise<imageSource.ImageSource>;
