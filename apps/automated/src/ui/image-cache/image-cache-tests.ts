import * as imageCacheModule from '@nativescript/core/ui/image-cache';
import { ImageSource } from '@nativescript/core/image-source';
import { isAndroid, Device } from '@nativescript/core/platform';
import lazy from '@nativescript/core/utils/lazy';

const sdkVersion = lazy(() => parseInt(Device.sdkVersion));

export const test_ImageCache_ValidUrl = function (done: (err: Error, res?: string) => void) {
	// see https://github.com/NativeScript/NativeScript/issues/6643
	if (isAndroid && sdkVersion() < 20) {
		done(null);

		return;
	}

	const cache = new imageCacheModule.Cache();
	cache.maxRequests = 5;

	let imgSource: ImageSource;
	const url = 'https://github.com/NativeScript.png';
	// Try to read the image from the cache
	const image = cache.get(url);
	if (image) {
		// If present -- use it.
		imgSource = new ImageSource(image);
		done(new Error('The image was found in the cache'));
	} else {
		// If not present -- request its download.
		cache.push({
			key: url,
			url: url,
			completed: (image: any, key: string) => {
				if (url === key) {
					imgSource = new ImageSource(image);
					console.log('Valid url: ', key);
					done(null);
				}
			},
		});
	}
};

export const test_ImageCache_NothingAtProvidedUrl = function (done: (err: Error, res?: string) => void) {
	const cache = new imageCacheModule.Cache();
	cache.maxRequests = 5;

	let imgSource: ImageSource;
	const url = 'https://github.com/NativeScript-NoImage.png';
	// Try to read the image from the cache
	const image = cache.get(url);
	if (image) {
		// If present -- use it.
		imgSource = new ImageSource(image);
		done(new Error('The image was found in the cache'));
	} else {
		// If not present -- request its download.
		cache.push({
			key: url,
			url: url,
			completed: (image: any, key: string) => {
				if (url === key) {
					imgSource = new ImageSource(image);
				}
				done(new Error('The completed callback was not expected to be called'));
			},
			error: (key: string) => {
				console.log('No image for key: ', key);
				done(null);
			},
		});
	}
};
