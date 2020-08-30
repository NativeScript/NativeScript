import { Observable } from '@nativescript/core/data/observable';

export class ViewModel extends Observable {
	items: Array<any>;

	constructor() {
		super();

		this.items = [];

		for (let i = 0; i < 50; i++) {
			this.items.push({
				id: 'child' + i.toString(),
				text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut scelerisque enim mi, id ultrices felis maximus vel.',
				shortText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			});
		}
	}
}
