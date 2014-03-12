export module tk {
    export module io {
        var REQUEST_IMAGE_CAPTURE: number = 1;
        var REQUEST_SELECT_PICTURE: number = 2;

        export class CameraManager {
            public takePicture(params: any, onSuccess: (imageData: any) => any, onError?: (error: any) => any) {
            }

            // options { useSavedPhotos: true }
            public pictureFromLibrary(params: any, onSuccess: (imageData: any) => any, onError?: (error: any) => any) {
            }
        }
    }
} 