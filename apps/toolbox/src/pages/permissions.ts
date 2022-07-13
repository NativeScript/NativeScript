import { Observable, EventData, Page, Trace } from '@nativescript/core';
import { Permissions, PermissionsType } from '@nativescript/permissions';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new PermissionsModel();
	Trace.enable();
	Trace.setCategories(Trace.categories.Permissions);
}

export class PermissionsModel extends Observable {
	permissions = ['location', 'camera', 'microphone', 'photo', 'contacts', 'event', 'reminder', 'bluetooth', 'bluetoothScan', 'notification', 'backgroundRefresh', 'speechRecognition', 'mediaLibrary', 'motion', 'location', 'callPhone', 'readSms', 'receiveSms', 'requestMultiple'].map((v) => {
		if (v === 'requestMultiple') {
			return {
				name: 'Request Multiple Permissions',
				checkPermission: (args) => {
					this.checkPermission(args, ['camera', 'contacts']);
				},
				requestPermission: (args) => {
					this.requestPermission(args, ['camera', 'contacts']);
				},
			};
		} else {
			return {
				name: v,
				checkPermission: this.checkPermission.bind(this),
				requestPermission: this.requestPermission.bind(this),
			};
		}
	});

	constructor() {
		super();
	}

	async checkPermission(args, multiple?: Array<PermissionsType>) {
		const perm = args.object.bindingContext.name;
		try {
			console.log('checkPermission', perm);
			if (multiple) {
				for (const p of multiple) {
					const result = await Permissions.check(p, { type: 'none' });
					alert(JSON.stringify(result));
				}
			} else {
				const result = await Permissions.check(perm, { type: 'none' });
				alert(JSON.stringify(result));
			}
		} catch (err) {
			console.error(err);
			alert(err);
		}
	}
	async requestPermission(args, multiple?: Array<string>) {
		const perm = multiple || args.object.bindingContext.name;
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
