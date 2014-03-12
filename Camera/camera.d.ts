export declare module tk {
    export module camera {
        export enum CameraPosition {
            FRONT = 0,
            BACK = 1,
        }

        export enum FlashMode {
            AUTO = 0,  // default
            ON = 1,
            OFF = 2
        }

        // TODO most of hardware related parts need to handle onPause and onResume of the calling activities
        export class CameraManager {
            takePicture(params: any, onSuccess: (imageData: any) => any, onError?: (error: any) => any);

            // options { useSavedPhotos: true }
            pictureFromLibrary(params: any, onSuccess: (imageData: any) => any, onError?: (error: any) => any);
        }
    }
} 