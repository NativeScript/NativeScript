import { ImageSource } from '@nativescript/core/image-source';
import * as fs from '@nativescript/core/file-system';
// >> imagesource-from-imageasset-save-to

export function imageSourceFromAsset(imageAsset) {
	ImageSource.fromAsset(imageAsset).then((imageSource) => {
		const folder = fs.knownFolders.documents().path;
		const fileName = 'test.png';
		const path = fs.path.join(folder, fileName);
		const saved = imageSource.saveToFile(path, 'png');
		if (saved) {
			console.log('Image saved successfully!');
		}
	});
}
// << imagesource-from-imageasset-save-to
