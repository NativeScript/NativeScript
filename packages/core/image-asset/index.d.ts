import { Observable } from '../data/observable';

export class ImageAsset extends Observable {
	constructor(asset: any);
	getImageAsync(callback: (image: any, error: any) => void); //UIImage for iOS and android.graphics.Bitmap for Android
	ios: any; //PHAsset
	nativeImage: any; //UIImage for iOS and android.graphics.Bitmap for Android
	android: any;
	options: ImageAssetOptions;
}

export interface ImageAssetOptions {
	width?: number | string;
	height?: number | string;
	keepAspectRatio?: boolean;
	autoScaleFactor?: boolean;
}
