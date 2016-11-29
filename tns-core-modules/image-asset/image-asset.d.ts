declare module "image-asset" {
    import observable = require("data/observable");

    export class ImageAsset extends observable.Observable {
        constructor(asset: any);
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
}