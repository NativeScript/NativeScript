import { ImageSource } from '@nativescript/core/image-source';
import * as imageAssetModule from '@nativescript/core/image-asset';
import * as fs from '@nativescript/core/file-system';
import * as TKUnit from '../tk-unit';
import { Application, Font, Color, Utils, Label } from '@nativescript/core';
import * as helper from '../ui-helper';

const imagePath = '~/assets/logo.png';
const splashscreenPath = '~/assets/splashscreen.png';
const splashscreenWidth = 372;
const splashscreenHeight = 218;
const smallImagePath = '~/assets/small-image.png';

export function testFromResource() {
	// >> imagesource-resname
	const img = ImageSource.fromResourceSync('icon');
	// << imagesource-resname

	TKUnit.assert(img.height > 0, 'image.fromResource failed');
}

export function testDrawableSetNativeSource() {
	if (global.isAndroid) {
		const context = Utils.android.getApplicationContext() as android.content.Context;
		const rDrawable = `${context.getPackageName()}.R$drawable`;
		const rClazz = java.lang.Class.forName(`${rDrawable}`);
		const iconId = rClazz.getDeclaredField('icon').get(null) as java.lang.Integer;
		const splashScreenId = rClazz.getDeclaredField('splash_screen').get(null) as java.lang.Integer;

		const icon = androidx.appcompat.content.res.AppCompatResources.getDrawable(context, iconId?.intValue?.() ?? 0);
		const splashScreen = androidx.appcompat.content.res.AppCompatResources.getDrawable(context, splashScreenId?.intValue?.() ?? 0);

		let type = icon?.getClass?.().toString?.() ?? '';

		// >> imagesource-setNativeSource
		const img = new ImageSource();
		img.setNativeSource(icon as any);
		// << imagesource-setNativeSource

		TKUnit.assert(img.height > 0, `image ${type} setNativeSource failed`);

		type = splashScreen?.getClass?.().toString?.() ?? '';

		// >> imagesource-setNativeSource
		img.setNativeSource(splashScreen as any);
		// << imagesource-setNativeSource

		TKUnit.assert(img.height > 0, `image ${type} setNativeSource failed`);
	}
}

export function testFromUrl(done) {
	let result: ImageSource;

	// Deprecated method fromUrl
	ImageSource.fromUrl('https://www.google.com/images/errors/logo_sm_2.png').then(
		(res: ImageSource) => {
			// console.log("Image successfully loaded");
			// completed = true;
			result = res;
			try {
				TKUnit.assertNotEqual(result, undefined, 'Image not downloaded');
				TKUnit.assert(result.height > 0, 'Image not downloaded');
				done(null);
			} catch (e) {
				done(e);
			}
		},
		(error) => {
			// console.log("Error loading image: " + error);
			//completed = true;
			done(error);
		},
	);
}

export function testSaveToFile() {
	// >> imagesource-save-to
	const img = ImageSource.fromFileSync(imagePath);
	const folder = fs.knownFolders.documents();
	const path = fs.path.join(folder.path, 'test.png');
	const saved = img.saveToFile(path, 'png');
	// << imagesource-save-to
	TKUnit.assert(saved, 'Image not saved to file');
	TKUnit.assert(fs.File.exists(path), 'Image not saved to file');
}

export function testSaveToFile_WithQuality() {
	const img = ImageSource.fromFileSync(imagePath);
	const folder = fs.knownFolders.documents();
	const path = fs.path.join(folder.path, 'test.png');
	const saved = img.saveToFile(path, 'png', 70);
	TKUnit.assert(saved, 'Image not saved to file');
	TKUnit.assert(fs.File.exists(path), 'Image not saved to file');
}

// export function testFromFile() {
// 	// >> imagesource-load-local
// 	const folder = fs.knownFolders.documents();
// 	const path = fs.path.join(folder.path, 'test.png');
// 	const img = ImageSource.fromFileSync(path);
// 	// << imagesource-load-local

// 	TKUnit.assert(img.height > 0, 'image.fromResource failed');

// 	// remove the image from the file system
// 	const file = folder.getFile('test.png');
// 	file.remove();
// 	TKUnit.assert(!fs.File.exists(path), 'test.png not removed');
// }

export function testFromAssetFileNotFound(done) {
	let asset = new imageAssetModule.ImageAsset('invalidFile.png');
	asset.options = {
		width: 0,
		height: 0,
		keepAspectRatio: true,
	};

	ImageSource.fromAsset(asset).then(
		(source) => {
			done('Should not resolve with invalid file name.');
		},
		(error) => {
			TKUnit.assertNotNull(error);
			done();
		},
	);
}

export function testFromAssetSimple(done) {
	let asset = new imageAssetModule.ImageAsset(splashscreenPath);
	asset.options = {
		width: 0,
		height: 0,
		keepAspectRatio: true,
	};

	ImageSource.fromAsset(asset).then(
		(source) => {
			TKUnit.assertEqual(source.width, splashscreenWidth);
			TKUnit.assertEqual(source.height, splashscreenHeight);
			done();
		},
		(error) => {
			done(error);
		},
	);
}

export function testFromAssetWithExactScaling(done) {
	let asset = new imageAssetModule.ImageAsset(splashscreenPath);
	let scaleWidth = 10;
	let scaleHeight = 11;
	asset.options = {
		width: scaleWidth,
		height: scaleHeight,
		keepAspectRatio: false,
		autoScaleFactor: false,
	};

	ImageSource.fromAsset(asset).then(
		(source) => {
			TKUnit.assertEqual(source.width, scaleWidth);
			TKUnit.assertEqual(source.height, scaleHeight);

			const targetFilename = `splashscreenTemp.png`;
			const tempPath = fs.knownFolders.temp().path;
			const localFullPath = fs.path.join(tempPath, targetFilename);

			const fullImageSaved = source.saveToFile(localFullPath, 'png');

			if (fullImageSaved) {
				ImageSource.fromFile(localFullPath).then((sourceImage) => {
					TKUnit.assertEqual(sourceImage.width, scaleWidth);
					TKUnit.assertEqual(sourceImage.height, scaleHeight);
					done();
				});
			} else {
				done(`Error saving photo to local temp folder: ${localFullPath}`);
			}
		},
		(error) => {
			done(error);
		},
	);
}

export function testFromAssetWithScalingAndAspectRatio(done) {
	let asset = new imageAssetModule.ImageAsset(splashscreenPath);
	let scaleWidth = 10;
	let scaleHeight = 11;
	asset.options = {
		width: scaleWidth,
		height: scaleHeight,
		keepAspectRatio: true,
	};

	ImageSource.fromAsset(asset).then(
		(source) => {
			TKUnit.assertEqual(source.width, 18);
			TKUnit.assertEqual(source.height, scaleHeight);
			done();
		},
		(error) => {
			done(error);
		},
	);
}

export function testFromAssetWithScalingAndDefaultAspectRatio(done) {
	let asset = new imageAssetModule.ImageAsset(splashscreenPath);
	let scaleWidth = 10;
	let scaleHeight = 11;
	asset.options.width = scaleWidth;
	asset.options.height = scaleHeight;

	ImageSource.fromAsset(asset).then(
		(source) => {
			TKUnit.assertEqual(source.width, 18);
			TKUnit.assertEqual(source.height, scaleHeight);
			done();
		},
		(error) => {
			done(error);
		},
	);
}

export function testFromAssetWithBiggerScaling(done) {
	let asset = new imageAssetModule.ImageAsset(splashscreenPath);
	let scaleWidth = 600;
	let scaleHeight = 600;
	asset.options = {
		width: scaleWidth,
		height: scaleHeight,
		keepAspectRatio: false,
	};

	ImageSource.fromAsset(asset).then(
		(source) => {
			TKUnit.assertEqual(source.width, scaleWidth);
			TKUnit.assertEqual(source.height, scaleHeight);
			done();
		},
		(error) => {
			done(error);
		},
	);
}

export function testNativeFields() {
	const img = ImageSource.fromFileSync(imagePath);
	if (Application.android) {
		TKUnit.assert(img.android != null, 'Image.android not updated.');
	} else if (Application.ios) {
		TKUnit.assert(img.ios != null, 'Image.ios not updated.');
	}
}
const fullAndroidPng = 'iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAA3NCSVQICAjb4U/gAAAAFUlEQVQImWP8z4AAjAz/kTnIPGQAAG86AwGcuMlCAAAAAElFTkSuQmCC';
const fullIosPng = 'iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAAXNSR0IArs4c6QAAABxpRE9UAAAAAgAAAAAAAAACAAAAKAAAAAIAAAACAAAARiS4uJEAAAASSURBVBgZYvjPwABHSMz/DAAAAAD//0GWpK0AAAAOSURBVGNgYPiPhBgQAACEvQv1D5y/pAAAAABJRU5ErkJggg==';

const jpgImageAsBase64String =
	'/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAEAAQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+Pz/h5j+1Z/z9fBr/AMRt+AH/AM7uiiiv9fV9E36KOn/HMX0f+n/NlvDT/p3/ANUv/V3vrf8AP1nueaf8LOa9P+ZjjP8Ap3/0/wD6u99b/wD/2Q==';
const expectedJpegStart = '/9j/4AAQSkZJRgAB';
const expectedPngStart = 'iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAA';

export function testBase64Encode_PNG() {
	// >> imagesource-to-base-string
	const img = ImageSource.fromFileSync(smallImagePath);
	let base64String = img.toBase64String('png');
	// << imagesource-to-base-string

	base64String = base64String.substr(0, expectedPngStart.length);
	TKUnit.assertEqual(base64String, expectedPngStart, 'Base 64 encoded PNG');
}

export function testBase64Encode_PNG_WithQuality() {
	const img = ImageSource.fromFileSync(smallImagePath);
	let base64String = img.toBase64String('png', 80);
	base64String = base64String.substr(0, expectedPngStart.length);
	TKUnit.assertEqual(base64String, expectedPngStart, 'Base 64 encoded PNG');
}

export function testBase64Encode_JPEG() {
	const img = ImageSource.fromFileSync(smallImagePath);

	let base64String = img.toBase64String('jpeg');
	base64String = base64String.substr(0, expectedJpegStart.length);

	TKUnit.assertEqual(base64String, expectedJpegStart, 'Base 64 encoded JPEG');
}

export function testBase64Encode_JPEG_With_Quality() {
	const img = ImageSource.fromFileSync(smallImagePath);

	let base64String = img.toBase64String('jpeg', 80);
	base64String = base64String.substr(0, expectedJpegStart.length);

	TKUnit.assertEqual(base64String, expectedJpegStart, 'Base 64 encoded JPEG');
}

export function testLoadFromBase64Encode_JPEG() {
	// >> imagesource-from-base-string
	let img: ImageSource;
	img = ImageSource.fromBase64Sync(jpgImageAsBase64String);
	// << imagesource-from-base-string

	TKUnit.assert(img !== null, 'Actual: ' + img);
	TKUnit.assertEqual(img.width, 4, 'img.width');
	TKUnit.assertEqual(img.height, 4, 'img.height');
}

export function testLoadFromBase64Encode_PNG() {
	let img: ImageSource;
	if (Application.android) {
		img = ImageSource.fromBase64Sync(fullAndroidPng);
	} else if (Application.ios) {
		img = ImageSource.fromBase64Sync(fullIosPng);
	}

	TKUnit.assert(img !== null, 'Actual: ' + img);
	TKUnit.assertEqual(img.width, 4, 'img.width');
	TKUnit.assertEqual(img.height, 4, 'img.height');
}

export function testLoadFromFontIconCode() {
	let img: ImageSource;
	img = ImageSource.fromFontIconCodeSync('F10B', Font.default.withFontFamily('FontAwesome'), new Color('red'));

	TKUnit.assert(img !== null, 'Actual: ' + img);
	TKUnit.assert(img.width !== null, 'img.width');
	TKUnit.assert(img.height !== null, 'img.width');
}

export function testResize() {
	const img = ImageSource.fromFileSync(imagePath);

	const newSize = Math.floor(Math.max(img.width, img.height) / 2);

	const resized = img.resize(newSize);

	TKUnit.assert(resized.width === newSize || resized.height === newSize, 'Image not resized correctly');
}

// ---------------------------------------------------------------------------
// Local image manipulation API. Every test below runs the same assertions on
// iOS and Android; colour checks use tolerances because the two platforms use
// different (but equivalent) colour pipelines.
// ---------------------------------------------------------------------------

function tempPath(name: string): string {
	return fs.path.join(fs.knownFolders.temp().path, name);
}

function assertSize(img: ImageSource, width: number, height: number, message: string) {
	const size = img.getPixelSize();
	TKUnit.assertEqual(size.width, width, `${message}: width`);
	TKUnit.assertEqual(size.height, height, `${message}: height`);
}

export function testGetPixelSizeMatchesFileDimensions() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	assertSize(img, splashscreenWidth, splashscreenHeight, 'getPixelSize');
}

export function testGetPixelSizeOnEmptySourceIsNaN() {
	const img = new ImageSource();
	const size = img.getPixelSize();
	TKUnit.assertTrue(Number.isNaN(size.width) && Number.isNaN(size.height), 'empty source has NaN pixel size');
}

export function testFromFileSyncWithMaxSizeDecodesBounded() {
	const img = ImageSource.fromFileSync(splashscreenPath, { maxSize: 100 });
	const size = img.getPixelSize();
	TKUnit.assertEqual(Math.max(size.width, size.height), 100, 'longest edge is maxSize');
	TKUnit.assertAreClose(size.width / size.height, splashscreenWidth / splashscreenHeight, 0.05, 'aspect ratio preserved');
}

export function testFromFileWithMaxSizeDecodesBounded(done) {
	ImageSource.fromFile(splashscreenPath, { maxSize: 64 })
		.then((img) => {
			const size = img.getPixelSize();
			TKUnit.assertEqual(Math.max(size.width, size.height), 64, 'longest edge is maxSize');
			done();
		})
		.catch(done);
}

export function testFromFileRejectsWhenFileIsMissing(done) {
	ImageSource.fromFile('~/assets/does-not-exist.png').then(
		() => done(new Error('fromFile resolved for a missing file')),
		() => done(),
	);
}

export function testFromBase64RejectsGarbage(done) {
	ImageSource.fromBase64('bm90IGFuIGltYWdl').then(
		() => done(new Error('fromBase64 resolved for non-image data')),
		() => done(),
	);
}

export function testFromDataSyncAcceptsArrayBuffer() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const buffer = img.toData('png');
	TKUnit.assertTrue(buffer instanceof ArrayBuffer, 'toData returns an ArrayBuffer');
	TKUnit.assertTrue(buffer.byteLength > 0, 'toData has bytes');

	const decoded = ImageSource.fromDataSync(buffer);
	assertSize(decoded, splashscreenWidth, splashscreenHeight, 'round trip through toData/fromDataSync');
}

export function testFromDataAcceptsTypedArray(done) {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const view = new Uint8Array(img.toData('jpeg', 90));
	ImageSource.fromData(view, { maxSize: 50 })
		.then((decoded) => {
			const size = decoded.getPixelSize();
			TKUnit.assertEqual(Math.max(size.width, size.height), 50, 'decoded with maxSize');
			done();
		})
		.catch(done);
}

export function testToDataAsync(done) {
	const img = ImageSource.fromFileSync(splashscreenPath);
	img
		.toDataAsync('png')
		.then((buffer) => {
			TKUnit.assertTrue(buffer.byteLength > 0, 'toDataAsync has bytes');
			done();
		})
		.catch(done);
}

export function testToDataJpegQualityChangesSize() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const high = img.toData('jpeg', 100).byteLength;
	const low = img.toData('jpeg', 10).byteLength;
	TKUnit.assertTrue(low < high, `quality 10 (${low}) should be smaller than quality 100 (${high})`);
}

export function testSaveToFileDefaultQualityIsMaximum() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const defaultPath = tempPath('quality-default.jpg');
	const explicitPath = tempPath('quality-100.jpg');
	TKUnit.assertTrue(img.saveToFile(defaultPath, 'jpeg'), 'saved with default quality');
	TKUnit.assertTrue(img.saveToFile(explicitPath, 'jpeg', 100), 'saved with quality 100');
	TKUnit.assertEqual(fs.File.fromPath(defaultPath).size, fs.File.fromPath(explicitPath).size, 'default quality equals 100 on both platforms');
}

export function testSaveToFileThenReloadKeepsDimensions() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const path = tempPath('reload.jpg');
	TKUnit.assertTrue(img.saveToFile(path, 'jpeg', 90), 'saved');
	const reloaded = ImageSource.fromFileSync(path);
	assertSize(reloaded, splashscreenWidth, splashscreenHeight, 'reloaded jpeg');
}

export function testSaveToFileAsyncRejectsWithoutImage(done) {
	new ImageSource().saveToFileAsync(tempPath('never.png'), 'png').then(
		() => done(new Error('saveToFileAsync resolved for an empty source')),
		() => done(),
	);
}

export function testCompressToFitStaysUnderBudget() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	// Encoders differ per platform, so derive the budget from this platform's own output:
	// quality 1 is always far below half of quality 100.
	const budget = Math.floor(img.toData('jpeg', 100).byteLength / 2);
	const result = img.compressToFit(budget, 'jpeg');
	TKUnit.assertTrue(result.data.byteLength <= budget, `${result.data.byteLength} bytes exceeds budget ${budget}`);
	TKUnit.assertTrue(result.quality >= 1 && result.quality <= 100, 'quality in range');
	const decoded = ImageSource.fromDataSync(result.data);
	assertSize(decoded, splashscreenWidth, splashscreenHeight, 'compressed image decodes');
}

export function testCompressToFitReturnsNullWhenImpossible() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	TKUnit.assertNull(img.compressToFit(50, 'jpeg'), 'a 50 byte budget cannot hold a 372x218 jpeg');
}

export function testCompressToFitAsync(done) {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const budget = Math.floor(img.toData('jpeg', 100).byteLength / 2);
	img
		.compressToFitAsync(budget)
		.then((result) => {
			TKUnit.assertTrue(result.data.byteLength <= budget, 'under budget');
			done();
		})
		.catch(done);
}

export function testGetMetadataReadsSizeWithoutDecoding() {
	const metadata = ImageSource.getMetadataSync(splashscreenPath);
	TKUnit.assertEqual(metadata.width, splashscreenWidth, 'metadata width');
	TKUnit.assertEqual(metadata.height, splashscreenHeight, 'metadata height');
	TKUnit.assertEqual(metadata.orientation, 1, 'png has upright orientation');
	TKUnit.assertTrue(metadata.hasAlpha, 'png reports alpha');
}

export function testGetMetadataAsync(done) {
	ImageSource.getMetadata(splashscreenPath)
		.then((metadata) => {
			TKUnit.assertEqual(metadata.width, splashscreenWidth, 'metadata width');
			done();
		})
		.catch(done);
}

export function testGetMetadataReturnsNullForMissingFile() {
	TKUnit.assertNull(ImageSource.getMetadataSync('~/assets/does-not-exist.png'), 'missing file has no metadata');
}

export function testNormalizeOrientationKeepsDimensions() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const upright = img.normalizeOrientation();
	TKUnit.assertNotNull(upright, 'normalizeOrientation returns an image');
	assertSize(upright, splashscreenWidth, splashscreenHeight, 'normalized');
}

export function testCropReturnsRegion() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const cropped = img.crop(10, 20, 50, 40);
	assertSize(cropped, 50, 40, 'crop');
}

export function testCropOutsideImageThrows() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	TKUnit.assertThrows(() => img.crop(splashscreenWidth - 10, 0, 50, 50), 'crop outside the image should throw');
}

export function testRotateSwapsDimensions() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	assertSize(img.rotate(90), splashscreenHeight, splashscreenWidth, 'rotate 90');
	assertSize(img.rotate(180), splashscreenWidth, splashscreenHeight, 'rotate 180');
	assertSize(img.rotate(270), splashscreenHeight, splashscreenWidth, 'rotate 270');
}

export function testRotateFullCircleMatchesOriginal() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const twice = img.rotate(90).rotate(90).rotate(180);
	TKUnit.assertEqual(twice.perceptualHash(), img.perceptualHash(), 'four quarter turns give the original picture');
}

export function testFlipTwiceRestoresImage() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const flipped = img.flip('horizontal');
	assertSize(flipped, splashscreenWidth, splashscreenHeight, 'flip keeps size');
	TKUnit.assertEqual(flipped.flip('horizontal').perceptualHash(), img.perceptualHash(), 'flipping twice restores the original');
	TKUnit.assertEqual(img.flip('both').perceptualHash(), img.rotate(180).perceptualHash(), 'flip both equals rotate 180');
}

export function testResizeIsPixelAccurate() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const resized = img.resize(100);
	const size = resized.getPixelSize();
	TKUnit.assertEqual(Math.max(size.width, size.height), 100, 'resize maxSize is in pixels');
}

export function testResizeToFitLetterboxesWithTransparentPadding() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const fitted = img.resizeTo(100, 100, { mode: 'fit' });
	assertSize(fitted, 100, 100, 'fit');
	// 372x218 fitted into 100x100 leaves transparent bands top and bottom.
	TKUnit.assertNull(fitted.crop(0, 0, 100, 5).averageColor(), 'top band is transparent');
	TKUnit.assertNotNull(fitted.crop(0, 45, 100, 10).averageColor(), 'middle band has pixels');
}

export function testResizeToFitWithBackgroundFillsPadding() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const fitted = img.resizeTo(100, 100, { mode: 'fit', background: '#ff0000' });
	const band = fitted.crop(0, 0, 100, 5).averageColor();
	TKUnit.assertNotNull(band, 'padding is painted');
	TKUnit.assertTrue(band.r > 240 && band.g < 15 && band.b < 15, `padding should be red, got ${band.hex}`);
}

export function testResizeToFillAndStretchCoverWholeOutput() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const filled = img.resizeTo(100, 100, { mode: 'fill' });
	assertSize(filled, 100, 100, 'fill');
	TKUnit.assertNotNull(filled.crop(0, 0, 100, 5).averageColor(), 'fill covers the top');

	const stretched = img.resizeTo(80, 120, { mode: 'stretch' });
	assertSize(stretched, 80, 120, 'stretch');
}

export function testResizeToRejectsInvalidSize() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	TKUnit.assertThrows(() => img.resizeTo(0, 10), 'zero width should throw');
}

export function testTransformAppliesAllStepsInOnePass() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const result = img.transform({
		crop: { x: 0, y: 0, width: 200, height: 100 },
		rotate: 90,
		flip: 'vertical',
		resize: { maxSize: 50 },
	});
	// crop -> 200x100, rotate -> 100x200, resize -> 25x50
	assertSize(result, 25, 50, 'transform');
}

export function testTransformWithExactResize() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const result = img.transform({ resize: { width: 30, height: 40, mode: 'fill' } });
	assertSize(result, 30, 40, 'transform exact resize');
}

export function testTransformAsync(done) {
	const img = ImageSource.fromFileSync(splashscreenPath);
	img
		.transformAsync({ crop: { x: 0, y: 0, width: 100, height: 100 } })
		.then((result) => {
			assertSize(result, 100, 100, 'transformAsync');
			done();
		})
		.catch(done);
}

export function testRoundCornersMakesCornersTransparent() {
	const img = ImageSource.fromFileSync(splashscreenPath).resizeTo(100, 100, { mode: 'stretch' });
	const rounded = img.roundCorners(30);
	assertSize(rounded, 100, 100, 'roundCorners');
	TKUnit.assertNull(rounded.crop(0, 0, 3, 3).averageColor(), 'corner is transparent');
	TKUnit.assertNotNull(rounded.crop(45, 45, 10, 10).averageColor(), 'centre is opaque');
}

export function testCircleCropMasksToCircle() {
	const img = ImageSource.fromFileSync(splashscreenPath).resizeTo(100, 100, { mode: 'stretch' });
	const circle = img.circleCrop();
	TKUnit.assertNull(circle.crop(0, 0, 8, 8).averageColor(), 'corner outside the circle is transparent');
	TKUnit.assertNotNull(circle.crop(45, 45, 10, 10).averageColor(), 'centre is opaque');
}

export function testOverlayDrawsOtherImageAtPosition() {
	const base = ImageSource.fromFileSync(splashscreenPath);
	const stamp = base.resizeTo(40, 40, { mode: 'stretch' }).tint('#0000ff');
	const result = base.overlay(stamp, { x: 10, y: 10, opacity: 1 });
	assertSize(result, splashscreenWidth, splashscreenHeight, 'overlay keeps base size');
	const sample = result.crop(15, 15, 20, 20).averageColor();
	TKUnit.assertTrue(sample.b > 240 && sample.r < 15 && sample.g < 15, `overlay area should be blue, got ${sample.hex}`);
}

export function testDrawTextChangesPixels() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const withText = img.drawText('NativeScript', { x: 10, y: 10, fontSize: 40, color: '#ffffff' });
	assertSize(withText, splashscreenWidth, splashscreenHeight, 'drawText keeps size');
	TKUnit.assertNotEqual(withText.toData('png').byteLength, img.toData('png').byteLength, 'text altered the image');
}

export function testTintRecoloursOpaquePixels() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const tinted = img.tint('#00ff00');
	const color = tinted.averageColor();
	TKUnit.assertTrue(color.g > 240 && color.r < 15 && color.b < 15, `tint should be green, got ${color.hex}`);
}

export function testApplyFiltersGrayscaleRemovesColour() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const gray = img.applyFilters([{ type: 'grayscale' }]).averageColor();
	TKUnit.assertTrue(Math.abs(gray.r - gray.g) <= 4 && Math.abs(gray.g - gray.b) <= 4, `grayscale channels should match, got ${gray.hex}`);
}

export function testApplyFiltersInvertFlipsChannels() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const original = img.averageColor();
	const inverted = img.applyFilters([{ type: 'invert' }]).averageColor();
	TKUnit.assertAreClose(inverted.r, 255 - original.r, 6, 'red inverted');
	TKUnit.assertAreClose(inverted.g, 255 - original.g, 6, 'green inverted');
	TKUnit.assertAreClose(inverted.b, 255 - original.b, 6, 'blue inverted');
}

export function testApplyFiltersBrightnessAndContrastKeepSize() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const adjusted = img.applyFilters([
		{ type: 'brightness', amount: 0.2 },
		{ type: 'contrast', amount: 1.3 },
		{ type: 'saturation', amount: 0.5 },
		{ type: 'sepia', amount: 0.5 },
	]);
	assertSize(adjusted, splashscreenWidth, splashscreenHeight, 'filters keep size');
}

export function testApplyFiltersBlur() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const blurred = img.applyFilters([{ type: 'blur', radius: 6 }]);
	assertSize(blurred, splashscreenWidth, splashscreenHeight, 'blur keeps size');
	TKUnit.assertTrue(blurred.isSimilarTo(img, 24), 'blurred image still resembles the original');
}

export function testApplyFiltersRejectsUnknownType() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	TKUnit.assertThrows(() => img.applyFilters([{ type: 'posterize' } as any]), 'unknown filter should throw');
}

export function testApplyFiltersAsync(done) {
	const img = ImageSource.fromFileSync(splashscreenPath);
	img
		.applyFiltersAsync([{ type: 'grayscale' }])
		.then((gray) => {
			assertSize(gray, splashscreenWidth, splashscreenHeight, 'applyFiltersAsync');
			done();
		})
		.catch(done);
}

export function testAverageColorOfSolidImageIsThatColour() {
	const solid = ImageSource.fromFileSync(splashscreenPath).tint('#336699');
	const color = solid.averageColor();
	TKUnit.assertAreClose(color.r, 0x33, 3, 'red');
	TKUnit.assertAreClose(color.g, 0x66, 3, 'green');
	TKUnit.assertAreClose(color.b, 0x99, 3, 'blue');
}

export function testDominantColorsReturnsMostCommonFirst() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const colors = img.dominantColors(3);
	TKUnit.assertTrue(colors.length > 0 && colors.length <= 3, 'up to three colours');
	// The letterbox band of a 'fit' resize is pure background: a genuinely solid region.
	const solid = img.resizeTo(100, 100, { mode: 'fit', background: '#ff8800' }).crop(0, 0, 100, 5).dominantColors(2);
	TKUnit.assertEqual(solid.length, 1, 'a solid region has one dominant colour');
	TKUnit.assertAreClose(solid[0].r, 0xff, 3, 'dominant red');
	TKUnit.assertAreClose(solid[0].g, 0x88, 3, 'dominant green');
}

export function testPerceptualHashIsStableAndSimilarityWorks() {
	const img = ImageSource.fromFileSync(splashscreenPath);
	const hash = img.perceptualHash();
	TKUnit.assertMatches(hash, /^[0-9a-f]{16}$/, 'hash is 16 hex characters');
	TKUnit.assertEqual(ImageSource.fromFileSync(splashscreenPath).perceptualHash(), hash, 'same file gives the same hash');
	TKUnit.assertTrue(img.isSimilarTo(img.resize(120)), 'a resized copy is similar');
	TKUnit.assertFalse(img.isSimilarTo(img.applyFilters([{ type: 'invert' }])), 'the inverted image is not similar');
}

export function testFromViewSnapshotsRenderedView() {
	const label = new Label();
	label.text = 'snapshot';
	label.width = 120;
	label.height = 40;
	label.backgroundColor = '#ff0000';
	helper.buildUIAndRunTest(label, () => {
		helper.waitUntilLayoutReady(label);
		const snapshot = ImageSource.fromView(label);
		TKUnit.assertNotNull(snapshot, 'fromView returns an image');
		const size = snapshot.getPixelSize();
		TKUnit.assertTrue(size.width > 0 && size.height > 0, 'snapshot has pixels');
		const color = snapshot.crop(2, 2, 4, 4).averageColor();
		TKUnit.assertTrue(color.r > 200 && color.g < 60 && color.b < 60, `snapshot background should be red, got ${color.hex}`);
	});
}
