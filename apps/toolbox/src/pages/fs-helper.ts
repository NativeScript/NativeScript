import { Page, EventData, Application, File, Folder, knownFolders, path, getFileAccess, Utils, Screen, Http, AndroidDirectory, ImageSource, alert } from '@nativescript/core';

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

export function pickFiles() {
	if (!global.isAndroid) {
		return;
	}
	const Intent = android.content.Intent;
	Application.android.on('activityResult', (args) => {
		if (args.requestCode === 1000) {
			const intent: android.content.Intent = args.intent;
			const clip = intent.getClipData();
			if (clip) {
				const count = clip.getItemCount();
				for (let i = 0; i < count; i++) {
					const item = clip.getItemAt(i);
					readFile(item.getUri().toString());
				}
			} else {
				readFile(intent.getData().toString());
			}
		}
	});
	const picker = new Intent(Intent.ACTION_OPEN_DOCUMENT);
	picker.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
	picker.addCategory(Intent.CATEGORY_OPENABLE);
	picker.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
	picker.setType('*/*');
	Application.android.foregroundActivity.startActivityForResult(picker, 1000);
}

export function pickFile() {
	if (!global.isAndroid) {
		return;
	}
	Application.android.on('activityResult', (args) => {
		if (args.requestCode === 1000) {
			const file = args.intent.getData().toString();
			//const file = File.fromPath(args.intent.getData().toString());
			//console.log(file);
			//readFile(file);
			//copyFile(file);
			console.time('fromPath: copy');
			const f = File.fromPath(file, true);
			console.timeEnd('fromPath: copy');
			console.log('old path: ', file);
			console.log('new path: ', f.path, f.extension, f.size);
		}
	});
	const Intent = android.content.Intent;
	const picker = new Intent(Intent.ACTION_OPEN_DOCUMENT);
	picker.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
	picker.addCategory(Intent.CATEGORY_OPENABLE);
	picker.setType('*/*');
	Application.android.foregroundActivity.startActivityForResult(picker, 1000);
}

function readFile(selected: string) {
	let applicationContext = Utils.android.getApplicationContext();
	const getOrSetHelper: org.nativescript.widgets.FileHelper = org.nativescript.widgets.FileHelper.fromString(applicationContext, selected);

	console.log('==== CONTEXT START =========');
	console.log('applicationContext', applicationContext);
	console.log('selected: ', decodeURIComponent(selected));
	console.log('getOrSetHelper: ', getOrSetHelper);
	console.log('==== CONTEXT END =========');

	console.log('==== READ START =========');
	const fileRead = getFileAccess().read(selected);
	console.log('# read: ', fileRead);

	const readSync = getFileAccess().readSync(selected);
	console.log('# readSync: ', readSync);

	const readText = getFileAccess().readText(selected);
	console.log('# readText: ', readText);

	getFileAccess()
		.readAsync(selected)
		.then(
			(readAsyncResolve) => {
				console.log('# readAsynccResolve: ', readAsyncResolve);
			},
			(readAsyncRejected) => {
				console.log('# readAsyncRejected: ', readAsyncRejected);
			}
		);
	console.log('==== READ END =========');

	saveFile(selected, readSync);
}

function saveFile(selected, readSync) {
	const folder: Folder = <Folder>knownFolders.documents();

	let newPath: string = path.join(folder.path, getFileNameFromContent(selected));

	File.fromPath(newPath).writeSync(readSync, (error) => {
		console.log(error);
	});

	let savedFile = folder.getFile(getFileNameFromContent(selected));

	console.log('==== SAVE START =========');
	console.log('# saved file: ', savedFile);
	console.log('# save size: ', savedFile.size);
	console.log('==== SAVE END =========');
}

function copyFile(file) {
	const picked = File.fromPath(file);
	const ext = picked.extension;
	const name = picked.name.replace(`.${ext}`, '');
	const tempCopy = File.fromPath(path.join(knownFolders.temp().path, `${name}-copy.${ext}`));

	// const done  = picked
	// 	.copySync(tempCopy.path);
	// 	console.log('done: ' + done + '\n' + 'Original path: ' + picked.path + '\n' + 'Copied to: ' + tempCopy.path + '\n' + 'Original size: ' + picked.size + '\n' + 'Copy size: ' + tempCopy.size + '\n');

	picked
		.copy(tempCopy.path)
		.then((done) => {
			console.log('done: ' + done + '\n' + 'Original path: ' + picked.path + '\n' + 'Copied to: ' + tempCopy.path + '\n' + 'Original size: ' + picked.size + '\n' + 'Copy size: ' + tempCopy.size + '\n');
		})
		.catch((error) => {
			console.log(error);
		});
}

export function copyTest() {
	const now = Date.now();
	const tempFile = File.fromPath(path.join(knownFolders.temp().path, `${now}.txt`));
	tempFile.writeTextSync('Hello World: ' + now);
	const tempCopy = File.fromPath(path.join(knownFolders.temp().path, `${now}-copy.txt`));
	tempFile
		.copy(tempCopy.path)
		.then((done) => {
			console.log('done: ' + done + '\n' + 'Original path: ' + tempFile.path + '\n' + 'Copied to: ' + tempCopy.path + '\n' + 'Original size: ' + tempFile.size + '\n' + 'Copy size: ' + tempCopy.size + '\n');
		})
		.catch((error) => {
			console.log(error);
		});
}

function getFileNameFromContent(content: string) {
	const file = getFileAccess().getFile(content);
	return decodeURIComponent(file.name).split('/').pop().toLowerCase();
}

let lastDownload: File;
export function createFileInDownloads() {
	if (!global.isAndroid) {
		return;
	}
	const width = Screen.mainScreen.widthPixels;
	const height = Screen.mainScreen.heightPixels;
	const randomImageUrl = `https://picsum.photos/${width}/${height}.jpg?random=${Date.now()}`;

	Http.getFile(randomImageUrl).then((result: File) => {
		let file = File.android.createFile({
			directory: AndroidDirectory.DOWNLOADS,
			name: `${Date.now()}.jpg`,
			mime: 'image/jpeg',
			relativePath: `NativeScript`,
		});
		result
			.copy(file.path)
			.then((done) => {
				lastDownload = file;
				console.log('done: ' + done + '\n' + 'Original path: ' + result.path + '\n' + 'Copied to: ' + file.path + '\n' + 'Original size: ' + result.size + '\n' + 'Copy size: ' + file.size + '\n');
				alert(`File saved in ${AndroidDirectory.DOWNLOADS}/NativeScript`);
			})
			.catch((error) => {
				console.error(error);
			});
	});
}

export function createFileInGallery() {
	if (!global.isAndroid) {
		return;
	}
	const width = Screen.mainScreen.widthPixels;
	const height = Screen.mainScreen.heightPixels;
	const randomImageUrl = `https://picsum.photos/${width}/${height}.jpg?random=${Date.now()}`;

	Http.getFile(randomImageUrl).then((result: File) => {
		let file = File.android.createFile({
			directory: AndroidDirectory.PICTURES,
			name: `${Date.now()}.jpg`,
			mime: 'image/jpeg',
			relativePath: `NativeScript`,
		});
		result
			.copy(file.path)
			.then((done) => {
				console.log('done: ' + done + '\n' + 'Original path: ' + result + '\n' + 'Copied to: ' + file.path + '\n' + 'Original size: ' + result.size + '\n' + 'Copy size: ' + file.size + '\n');
				alert(`File saved in ${AndroidDirectory.PICTURES}/NativeScript`);
			})
			.catch((error) => {
				console.error(error);
			});
	});
}

export function createFileInMusic() {
	if (!global.isAndroid) {
		return;
	}

	Http.getFile('https://github.com/rafaelreis-hotmart/Audio-Sample-files/raw/master/sample.mp3').then((result: File) => {
		let file = File.android.createFile({
			directory: AndroidDirectory.MUSIC,
			name: `${Date.now()}.MP3`,
			mime: 'audio/mp3',
			relativePath: `NativeScript/MP3`,
		});

		result
			.copy(file.path)
			.then((done) => {
				console.log('done: ' + done + '\n' + 'Original path: ' + result + '\n' + 'Copied to: ' + file.path + '\n' + 'Original size: ' + result.size + '\n' + 'Copy size: ' + file.size + '\n');

				alert(`File saved in ${AndroidDirectory.MUSIC}/NativeScript/MP3`);
			})
			.catch((error) => {
				console.error(error);
			});
	});
}

export function createAndAppendText() {
	const file = File.fromPath(path.join(knownFolders.temp().path, `${Date.now()}-app.txt`));
	file.appendTextSync('Hello');
	file.appendTextSync(' World');
	const data = file.readTextSync();
	console.log('createAndAppend:', data === 'Hello World');
}

export function createAndAppendData() {
	const file = File.fromPath(path.join(knownFolders.temp().path, `${Date.now()}-app.txt`));
	const hello = global.isIOS ? NSString.stringWithString('Hello').dataUsingEncoding(NSUTF8StringEncoding) : new java.lang.String('Hello').getBytes('UTF-8');
	const world = global.isIOS ? NSString.stringWithString(' World').dataUsingEncoding(NSUTF8StringEncoding) : new java.lang.String(' World').getBytes('UTF-8');
	file.appendSync(hello);
	file.appendSync(world);
	const data = file.readTextSync();
	console.log('createAndAppendData:', data === 'Hello World');
}
