import { Page, EventData, Application, File } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
}

export function createRandom(args) {
	if (global.isAndroid) {
		try {
			const activity = Application.android.foregroundActivity as androidx.appcompat.app.AppCompatActivity;
			const selection = [android.provider.MediaStore.MediaColumns.DISPLAY_NAME, android.provider.MediaStore.MediaColumns._ID];
			// testing with downloads as rename only works with a well know collection downloads/audio/photos/videos API 29+
			let cursor = activity.getContentResolver().query(android.provider.MediaStore.Downloads.getContentUri('external'), selection, null, null);

			let uri;

			while (cursor.moveToNext()) {
				const index = cursor.getColumnIndex(selection[0]);
				const name = cursor.getString(index);
				if (name === 'ns_tmp.txt') {
					const idIndex = cursor.getColumnIndex(selection[1]);
					const id = cursor.getLong(idIndex);
					uri = android.net.Uri.parse(`${android.provider.MediaStore.Downloads.getContentUri('external').toString()}/${id}`);
					cursor.close();
					break;
				}
			}

			if (!uri) {
				const values = new android.content.ContentValues();
				values.put(android.provider.MediaStore.MediaColumns.DISPLAY_NAME, 'ns_tmp.txt');
				values.put(android.provider.MediaStore.MediaColumns.MIME_TYPE, 'text/plain');
				uri = activity.getContentResolver().insert(android.provider.MediaStore.Downloads.getContentUri('external'), values);
			}

			doWork(uri.toString());
		} catch (e) {
			console.error(e);
		}
	}
}

function doWork(path: string) {
	try {
		const file = File.fromPath(path) as File;
		console.log('name: ', file.name);
		console.log('path: ', file.path);
		console.log('parent: ', file.parent);
		console.log('size: ', file.size);
		console.log('lastModified: ', file.lastModified);
		console.log('extension: ', file.extension);
		if (file.size > 0) {
			console.log('current text: ', file.readTextSync());
		} else {
			file.writeTextSync('Hello World');
			console.log('after write: ', file.readTextSync());
			console.log('after write size: ', file.size);
		}

		file.renameSync(`ns_temp_${Date.now()}.txt`);

		console.log('rename: ', file.name);
		console.log('rename lastModified: ', file.lastModified);

		file.removeSync();

		console.log('deleted ?', !File.exists(path));
	} catch (e) {
		console.error(e);
	}
}
