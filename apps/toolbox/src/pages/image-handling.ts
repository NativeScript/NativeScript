import { Observable, EventData, Page, ImageSource, knownFolders, path } from '@nativescript/core';
import { create, ImagePickerMediaType } from '@nativescript/imagepicker';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new DemoModel();
}

export class DemoModel extends Observable {
	addingPhoto = false;

	pickImage() {
		const context = create({
			mode: 'single',
			mediaType: ImagePickerMediaType.Image,
		});

		context
			.authorize()
			.then(() => {
				return context.present();
			})
			.then((selection) => {
				const imageAsset = selection.length > 0 ? selection[0] : null;
				if (imageAsset) {
					this.addingPhoto = true;

					ImageSource.fromAsset(imageAsset).then(
						(savedImage) => {
							const folder = knownFolders.documents();
							const filePath = path.join(folder.path, `assets-${Date.now()}.jpg`);
							console.log('filePath:', filePath);

							const saved = savedImage.saveToFile(filePath, 'jpg');
							if (saved) {
								console.log(`file saved:`, filePath);
							} else {
								console.log('file not saved!');
							}
							this.addingPhoto = false;
						},
						(err) => {
							this.addingPhoto = false;
						}
					);
				}
			})
			.catch((e) => {
				console.log(e);
			});
	}
}
