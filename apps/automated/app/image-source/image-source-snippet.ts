import { ImageSource } from '@nativescript/core/image-source';
import * as fs from '@nativescript/core/file-system';
// >> imagesource-from-imageasset-save-to

export function imageSourceFromAsset(imageAsset) {
	ImageSource.fromAsset(imageAsset).then((imageSource) => {
		let folder = fs.knownFolders.documents().path;
		let fileName = 'test.png';
		let path = fs.path.join(folder, fileName);
		let saved = imageSource.saveToFile(path, 'png');
		if (saved) {
			console.log('Image saved successfully!');
		}
	});
}
// << imagesource-from-imageasset-save-to
