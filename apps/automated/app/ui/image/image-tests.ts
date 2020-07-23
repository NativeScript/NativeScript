import { Image } from '@nativescript/core/ui/image';
import { StackLayout } from '@nativescript/core/ui/layouts/stack-layout';
import { GridLayout } from '@nativescript/core/ui/layouts/grid-layout';
import { PropertyChangeData } from '@nativescript/core';
import * as utils from '@nativescript/core/utils';
import * as TKUnit from '../../tk-unit';
import { getColor } from '../../ui-helper';

// >> img-require
import * as ImageModule from '@nativescript/core/ui/image';
// << img-require

import * as types from '@nativescript/core/utils/types';
import { ImageSource } from '@nativescript/core/image-source';
import * as ViewModule from '@nativescript/core/ui/core/view';
import * as helper from '../../ui-helper';
import * as color from '@nativescript/core/color';
import * as backgroundModule from '@nativescript/core/ui/styling/background';
import { android as androidApp } from '@nativescript/core/application';
const imagePath = '~/assets/logo.png';

export function test_recycling() {
	helper.nativeView_recycling_test(() => new Image());
}

if (global.isAndroid) {
	(<any>backgroundModule).initImageCache(androidApp.startActivity, (<any>backgroundModule).CacheMode.memory); // use memory cache only.
}

export const test_Image_Members = function () {
	const image = new ImageModule.Image();
	TKUnit.assert(types.isUndefined(image.src), 'Image.src is defined');
	TKUnit.assert(types.isDefined(image.isLoading), 'Image.isLoading is not defined');
	TKUnit.assert(image.isLoading === false, 'Image.isLoading is default value should be false.');
};

export const test_setting_src_to_resource = function () {
	// >> img-create
	const image = new ImageModule.Image();
	image.src = 'res://icon';
	// << img-create

	const testFunc = function (views: Array<ViewModule.View>) {
		TKUnit.waitUntilReady(() => image.isLayoutValid);
		const width = image.getMeasuredWidth();
		const height = image.getMeasuredHeight();

		TKUnit.assert(width > 0, 'Width should be greater than 0.');
		TKUnit.assert(height > 0, 'Height should be greater than 0.');
	};

	helper.buildUIAndRunTest(image, testFunc);
};

const IMAGE_LOADED_EVENT = 'isLoadingChange';

function runImageTestSync(image: ImageModule.Image, src: string) {
	image.loadMode = 'sync';
	image.src = null;

	const page = helper.getCurrentPage();
	page.content = image;

	image.src = src;

	let imageSourceAvailable = global.isIOS ? !!image.imageSource : true;
	TKUnit.assertFalse(image.isLoading, 'Image.isLoading should be false.');
	TKUnit.assertTrue(imageSourceAvailable, 'imageSource should be set.');
}

function runImageTestAsync(image: ImageModule.Image, src: string, done: (e: any) => void) {
	image.loadMode = 'async';
	image.src = null;

	let handler = function (data: PropertyChangeData) {
		image.off(IMAGE_LOADED_EVENT, handler);

		try {
			let imageSourceAvailable = global.isIOS ? !!image.imageSource : true;
			TKUnit.assertFalse(image.isLoading, 'Image.isLoading should be false.');
			TKUnit.assertTrue(imageSourceAvailable, 'imageSource should be set.');
			done(null);
		} catch (e) {
			done(e);
		}
	};

	let page = helper.getCurrentPage();
	page.content = image;
	image.src = src;
	image.on(IMAGE_LOADED_EVENT, handler);
	TKUnit.assertTrue(image.isLoading, 'Image.isLoading should be true.');
}

export const test_SettingImageSrcToURL_async = function (done) {
	// >> img-create-src
	const image = new ImageModule.Image();
	image.src = 'https://www.google.com/images/errors/logo_sm_2.png';
	// << img-create-src
	(<any>image).useCache = false;
	runImageTestAsync(image, image.src, done);
};

export const test_SettingImageSrcToFileWithinApp_sync = function () {
	// >> img-create-local
	const image = new ImageModule.Image();
	image.src = '~/assets/logo.png';
	// << img-create-local

	runImageTestSync(image, image.src);
};

export const test_SettingImageSrcToFileWithinApp_async = function (done) {
	const image = new ImageModule.Image();
	(<any>image).useCache = false;
	image.src = '~/assets/logo.png';
	runImageTestAsync(image, image.src, done);
};

export const test_SettingImageSrcToDataURI_sync = function () {
	// >> img-create-datauri
	const image = new ImageModule.Image();
	image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAAXNSR0IArs4c6QAAABxpRE9UAAAAAgAAAAAAAAACAAAAKAAAAAIAAAACAAAARiS4uJEAAAASSURBVBgZYvjPwABHSMz/DAAAAAD//0GWpK0AAAAOSURBVGNgYPiPhBgQAACEvQv1D5y/pAAAAABJRU5ErkJggg==';
	// << img-create-datauri

	runImageTestSync(image, image.src);
};

export const test_SettingImageSrcToDataURI_async = function (done) {
	const image = new ImageModule.Image();
	image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAAXNSR0IArs4c6QAAABxpRE9UAAAAAgAAAAAAAAACAAAAKAAAAAIAAAACAAAARiS4uJEAAAASSURBVBgZYvjPwABHSMz/DAAAAAD//0GWpK0AAAAOSURBVGNgYPiPhBgQAACEvQv1D5y/pAAAAABJRU5ErkJggg==';

	runImageTestAsync(image, image.src, done);
};

export const test_SettingImageSrcToFontIconCode_sync = function () {
	const image = new ImageModule.Image();
	image.style.fontFamily = 'FontAwesome';
	image.src = 'font://&#xF10B';

	runImageTestSync(image, image.src);
};

export function test_imageSourceNotResetAfterCreateUI() {
	let image = new ImageModule.Image();
	let imageSource = ImageSource.fromResourceSync('splashscreen');
	TKUnit.assertNotEqual(null, imageSource);
	image.imageSource = imageSource;
	helper.buildUIAndRunTest(image, () => {
		TKUnit.waitUntilReady(() => image.isLoaded);
		TKUnit.assertEqual(image.imageSource, imageSource);
	});
}

// NOTE: This tests that setting multiple times src will not show the imageSource of a previous src value.
// It however will never be reliable as to properly detect failure we need to use somewhat large timeout
// waiting for imageSource to be set to the wrong value.
export const __test_SettingImageSrcTwiceMustNotMismatch = function (done) {
	const image = new Image();
	image.on('propertyChange', (args: PropertyChangeData) => {
		if (args.propertyName === 'isLoading' && args.value === false) {
			setTimeout(() => {
				if (image.imageSource) {
					done(new Error('Images source set from previous async src setting'));
				} else {
					done();
				}
			}, 50); /* Slow! */
		}
	});
	image.loadMode = 'async';
	image.src = '~/assets/logo.png';
	image.src = null;
	// At somepoint image.imageSource was set to "~/assets/logo.png";
};

export const test_SettingStretch_AspectFit = function () {
	// There are 4 modes of stretching none, fill, aspectFill, aspectFit
	// The default value is aspectFit.
	// Image stretch can be set by using ImageModule.stretch enum.
	// >> img-set-stretch
	const image = new ImageModule.Image();
	image.stretch = 'aspectFit';
	// << img-set-stretch

	const testFunc = function (views: Array<ViewModule.View>) {
		if (image.android) {
			TKUnit.assertEqual(image.android.getScaleType(), android.widget.ImageView.ScaleType.FIT_CENTER);
		} else if (image.ios) {
			TKUnit.assertEqual(image.ios.contentMode, UIViewContentMode.ScaleAspectFit);
		}
	};

	helper.buildUIAndRunTest(image, testFunc);
};

export const test_SettingStretch_Default = function () {
	const image = new ImageModule.Image();
	const testFunc = function (views: Array<ViewModule.View>) {
		if (image.android) {
			TKUnit.assertEqual(image.android.getScaleType(), android.widget.ImageView.ScaleType.FIT_CENTER);
		} else if (image.ios) {
			TKUnit.assertEqual(image.ios.contentMode, UIViewContentMode.ScaleAspectFit);
		}
	};

	helper.buildUIAndRunTest(image, testFunc);
};

export const test_SettingStretch_AspectFill = function () {
	const image = new ImageModule.Image();
	image.stretch = 'aspectFill';

	const testFunc = function (views: Array<ViewModule.View>) {
		if (image.android) {
			TKUnit.assertEqual(image.android.getScaleType(), android.widget.ImageView.ScaleType.CENTER_CROP);
		} else if (image.ios) {
			TKUnit.assertEqual(image.ios.contentMode, UIViewContentMode.ScaleAspectFill);
		}
	};

	helper.buildUIAndRunTest(image, testFunc);
};

export const test_SettingStretch_Fill = function () {
	const image = new ImageModule.Image();
	image.stretch = 'fill';

	const testFunc = function (views: Array<ViewModule.View>) {
		if (image.android) {
			TKUnit.assertEqual(image.android.getScaleType(), android.widget.ImageView.ScaleType.FIT_XY);
		} else if (image.ios) {
			TKUnit.assertEqual(image.ios.contentMode, UIViewContentMode.ScaleToFill);
		}
	};

	helper.buildUIAndRunTest(image, testFunc);
};

export const test_SettingStretch_none = function () {
	const image = new ImageModule.Image();
	image.stretch = 'none';

	const testFunc = function (views: Array<ViewModule.View>) {
		if (image.android) {
			TKUnit.assertEqual(image.android.getScaleType(), android.widget.ImageView.ScaleType.MATRIX);
		} else if (image.ios) {
			TKUnit.assertEqual(image.ios.contentMode, UIViewContentMode.TopLeft);
		}
	};

	helper.buildUIAndRunTest(image, testFunc);
};

function ios<T>(func: T): T {
	return global.isIOS ? func : undefined;
}

export const test_SettingImageSourceWhenSizedToParentDoesNotRequestLayout = ios(() => {
	let host = new GridLayout();

	let image = new Image();

	host.width = { value: 300, unit: 'dip' };
	host.height = { value: 300, unit: 'dip' };
	host.addChild(image);

	let mainPage = helper.getCurrentPage();
	mainPage.content = host;
	TKUnit.waitUntilReady(() => host.isLoaded);

	let called = false;
	image.requestLayout = () => (called = true);
	image.src = '~/assets/logo.png';

	TKUnit.assertFalse(called, 'image.requestLayout should not be called.');
});

export const test_SettingImageSourceWhenFixedWidthAndHeightDoesNotRequestLayout = ios(() => {
	let host = new StackLayout();
	let image = new Image();
	image.width = { value: 100, unit: 'dip' };
	image.height = { value: 100, unit: 'dip' };
	host.addChild(image);

	let mainPage = helper.getCurrentPage();
	mainPage.content = host;
	TKUnit.waitUntilReady(() => host.isLoaded);

	let called = false;
	image.requestLayout = () => (called = true);
	image.src = '~/assets/logo.png';

	TKUnit.assertFalse(called, 'image.requestLayout should not be called.');
});

export const test_SettingImageSourceWhenSizedToContentShouldInvalidate = ios(() => {
	let host = new StackLayout();
	let image = new Image();
	host.addChild(image);

	let mainPage = helper.getCurrentPage();
	mainPage.content = host;
	TKUnit.waitUntilReady(() => host.isLoaded);

	let called = false;
	image.requestLayout = () => (called = true);
	image.src = '~/assets/logo.png';

	TKUnit.assertTrue(called, 'image.requestLayout should be called.');
});

export const test_DimensionsAreRoundedAfterScale = function () {
	let host = new StackLayout();
	let image = new Image();
	(<any>image).useCache = false;
	image.loadMode = 'sync';
	image.src = '~/ui/image/700x50.png';
	let imageWidth = 700;
	let imageHeight = 50;

	let density = utils.layout.getDisplayDensity();
	let hostWidth = 320;
	host.width = { value: hostWidth / density, unit: 'dip' };
	host.height = { value: hostWidth / density, unit: 'dip' };
	host.addChild(image);
	let mainPage = helper.getCurrentPage();
	mainPage.content = host;
	TKUnit.waitUntilReady(() => host.isLayoutValid);

	let scale = hostWidth / imageWidth;
	let expectedHeight = Math.round(imageHeight * scale);
	TKUnit.assertEqual(image.getMeasuredWidth(), hostWidth, 'Actual width is different from expected width.');
	TKUnit.assertEqual(image.getMeasuredHeight(), expectedHeight, 'Actual height is different from expected height.');
};

export const test_tintColor = function () {
	const colorRed = new color.Color('red');
	const image = new ImageModule.Image();
	image.src = imagePath;

	const testFunc = function (views: Array<ViewModule.View>) {
		const testImage = <ImageModule.Image>views[0];

		if (image.android) {
			const tintColor = testImage.android.getColorFilter();
			TKUnit.assert(tintColor === null, 'tintColor expected to be set to null');
		} else if (image.ios) {
			const imageColor = getColor(testImage.ios.tintColor);
			TKUnit.assert(!imageColor.equals(colorRed), 'imageColor expected to be different than tintColor');
		}
		image.tintColor = colorRed;

		if (image.android) {
			TKUnit.assert(testImage.android.getColorFilter() !== null, 'tintColor expected to be set to a nonnull value');
		} else if (image.ios) {
			const imageColor = getColor(testImage.ios.tintColor);
			TKUnit.assert(imageColor.equals(colorRed), 'tintColor expected to be set to: ' + colorRed);
		}
	};

	helper.buildUIAndRunTest(image, testFunc);
};
