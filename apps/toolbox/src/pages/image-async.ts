import { Page, ImageSource, Observable, EventData, knownFolders, path } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new SampleData();
}

export class SampleData extends Observable {
	src: string = 'https://source.unsplash.com/random';
	savedData: string = '';
	resizedImage: ImageSource;
	async save() {
		try {
			const imageSource = await ImageSource.fromUrl(this.src);
			const tempFile = path.join(knownFolders.temp().path, `${Date.now()}.jpg`);
			const base64 = imageSource.toBase64StringAsync('jpg');
			const image = imageSource.saveToFileAsync(tempFile, 'jpg');
			const resizedImage = imageSource.resizeAsync(50);
			const results = await Promise.all([image, base64, resizedImage]);
			const saved = results[0];
			const base64Result = results[1];
			if (saved) {
				this.notifyPropertyChange('savedData', tempFile);
				console.log('ImageAsset saved', saved, tempFile);
			}
			console.log('base64', base64Result);
			console.log(results[2].width, results[2].height);
			this.notifyPropertyChange('resizedImage', results[2]);
		} catch (e) {
			console.log('Failed to save ImageAsset');
		}
	}
}
