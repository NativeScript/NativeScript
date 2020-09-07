import { isIOS, isAndroid, knownFolders, path, Utils } from '@nativescript/core';

export function openFile() {
	let directory;
	if (isIOS) {
		directory = knownFolders.ios.downloads();
	} else if (isAndroid) {
		directory = android.os.Environment.getExternalStorageDirectory().getAbsolutePath().toString();
	}

	const filePath = path.join(directory, 'Test_File_Open.txt');
	Utils.openFile(filePath);
}
