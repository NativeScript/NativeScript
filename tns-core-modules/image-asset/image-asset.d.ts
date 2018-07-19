/**
 * @module "image-asset"
 */ /** */

import { Observable } from "../data/observable";

export class ImageAsset extends Observable {
    constructor(asset: any);

    /**
    * Saves this instance to the Temporary (Caches) folder for the current application.
    * @param fileName The name of the image file (without extension).
    * @param callback Callback function which will be executed when the file is created. Returns the new full image path string.
    */
    saveToFile(fileName: string, callback: (imagePath: string, error: any) => void);
    getImageAsync(callback: (image: any, error: any) => void); //UIImage for iOS and android.graphics.Bitmap for Android
    ios: any; //PHAsset
    nativeImage: any; //UIImage for iOS and android.graphics.Bitmap for Android
    android: any;
    options: ImageAssetOptions;
}

export interface ImageAssetOptions {
    width?: number;
    height?: number;
    keepAspectRatio?: boolean;
}
