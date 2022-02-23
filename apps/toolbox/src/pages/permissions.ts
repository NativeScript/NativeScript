import { Observable, EventData, Page, Permissions, Trace } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new PermissionsModel();
	Trace.enable();
	Trace.setCategories(Trace.categories.Permissions);
}

export class PermissionsModel extends Observable {
	permissions = ['location', 'camera', 'microphone', 'photo', 'contacts', 'event', 'reminder', 'bluetooth', 'bluetoothScan', 'notification', 'backgroundRefresh', 'speechRecognition', 'mediaLibrary', 'motion', 'location', 'callPhone', 'readSms', 'receiveSms'].map((v) => {
		return {
			name: v,
			checkPermission: this.checkPermission.bind(this),
			requestPermission: this.requestPermission.bind(this),
		};
	});

	constructor() {
		super();
	}

	async checkPermission(args) {
		const perm = args.object.bindingContext.name;
		try {
			console.log('checkPermission', perm);
			const result = await Permissions.check(perm, { type: 'none' });
			alert(JSON.stringify(result));
		} catch (err) {
			console.error(err);
			alert(err);
		}
	}
	async requestPermission(args) {
		const perm = args.object.bindingContext.name;
		try {
			console.log('requestPermission', perm);
			const result = await Permissions.request(perm, { type: 'none' });
			alert(JSON.stringify(result));
		} catch (err) {
			console.error(err);
			alert(err);
		}
	}
}
