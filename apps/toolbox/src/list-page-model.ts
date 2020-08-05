import { Observable, Dialogs, DialogStrings } from '@nativescript/core';

export class ListPageModel extends Observable {
	components: Array<any> = [
		{ name: 'Button', iconText: 'p' },
		{ name: 'Image', iconText: 'q' },
		{ name: 'Label', iconText: 't' },
		{ name: 'Switch', iconText: 'z' },
		{ name: 'Slider', iconText: 'v' },
		{ name: 'TextField', iconText: 'x' },
		{ name: 'TextView', iconText: 'w' },
		{ name: 'DatePicker', iconText: 'A' },
		{ name: 'Chart', iconText: 'B' },
		{ name: 'ListView', iconText: 'u' },
		{ name: 'Accelerometer', iconText: 'E' },
		{ name: 'Location', iconText: 'D' },
		{ name: 'Camera', iconText: String.fromCharCode(parseInt('e034', 16)) },
		{ name: 'ImagePicker', iconText: 'q' },
	];

	selectItemTemplate(item: any, index: number, items: Array<any>) {
		return index == items.length - 1 ? 'last' : 'not-last';
	}

	componentsItemTap(args): void {
		Dialogs.alert({
			title: 'Want to play?',
			message: 'Nothing to see here yet. Feel free to add more examples to play around.',
			okButtonText: DialogStrings.OK,
		});
	}
}
