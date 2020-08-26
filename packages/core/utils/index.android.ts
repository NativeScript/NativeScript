import { ad } from './native-helper';
import { Device } from '../platform';
import { FileSystemAccess } from '../file-system/file-system-access';
import { Trace } from '../trace';

export { ad, iOSNativeHelper } from './native-helper';
export * from './utils-common';
export { Source } from './debug';

const MIN_URI_SHARE_RESTRICTED_APK_VERSION = 24;

export function GC() {
	gc();
}

export function releaseNativeObject(object: java.lang.Object) {
	__releaseNativeCounterpart(object);
}

export function openUrl(location: string): boolean {
	const context = ad.getApplicationContext();
	try {
		const intent = new android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(location.trim()));
		intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);

		context.startActivity(intent);
	} catch (e) {
		// We Don't do anything with an error.  We just output it
		Trace.write('Error in OpenURL', Trace.categories.Error, Trace.messageType.error);

		return false;
	}

	return true;
}

/**
 * Check whether external storage is read only
 *
 * @returns {boolean} whether the external storage is read only
 */
function isExternalStorageReadOnly(): boolean {
	const extStorageState = android.os.Environment.getExternalStorageState();
	if (android.os.Environment.MEDIA_MOUNTED_READ_ONLY === extStorageState) {
		return true;
	}

	return false;
}

/**
 * Checks whether external storage is available
 *
 * @returns {boolean} whether external storage is available
 */
function isExternalStorageAvailable(): boolean {
	const extStorageState = android.os.Environment.getExternalStorageState();
	if (android.os.Environment.MEDIA_MOUNTED === extStorageState) {
		return true;
	}

	return false;
}

/**
 * Detect the mimetype of a file at a given path
 *
 * @param {string} filePath
 * @returns {string} mimetype
 */
function getMimeTypeNameFromExtension(filePath: string): string {
	const mimeTypeMap = android.webkit.MimeTypeMap.getSingleton();
	const extension = new FileSystemAccess().getFileExtension(filePath).replace('.', '').toLowerCase();

	return mimeTypeMap.getMimeTypeFromExtension(extension);
}

/**
 * Open a file
 *
 * @param {string} filePath
 * @returns {boolean} whether opening the file succeeded or not
 */
export function openFile(filePath: string): boolean {
	const context = ad.getApplicationContext();
	try {
		// Ensure external storage is available
		if (!isExternalStorageAvailable()) {
			Trace.write(
				`
External storage is unavailable (please check app permissions).
Applications cannot access internal storage of other application on Android (see: https://developer.android.com/guide/topics/data/data-storage).
`,
				Trace.categories.Error,
				Trace.messageType.error
			);

			return false;
		}

		// Ensure external storage is available
		if (isExternalStorageReadOnly()) {
			Trace.write('External storage is read only', Trace.categories.Error, Trace.messageType.error);

			return false;
		}

		// Determine file mimetype & start creating intent
		const mimeType = getMimeTypeNameFromExtension(filePath);
		const intent = new android.content.Intent(android.content.Intent.ACTION_VIEW);
		const chooserIntent = android.content.Intent.createChooser(intent, 'Open File...');

		intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
		chooserIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);

		// Android SDK <28 only requires starting the chooser Intent straight forwardly
		const sdkVersion = parseInt(Device.sdkVersion, 10);
		if (sdkVersion && sdkVersion < MIN_URI_SHARE_RESTRICTED_APK_VERSION) {
			Trace.write(`detected sdk version ${sdkVersion} (< ${MIN_URI_SHARE_RESTRICTED_APK_VERSION}), using simple openFile`, Trace.categories.Debug);
			intent.setDataAndType(android.net.Uri.fromFile(new java.io.File(filePath)), mimeType);
			context.startActivity(chooserIntent);

			return true;
		}

		Trace.write(`detected sdk version ${sdkVersion} (>= ${MIN_URI_SHARE_RESTRICTED_APK_VERSION}), using URI openFile`, Trace.categories.Debug);

		// Android SDK 24+ introduced file system permissions changes that disallow
		// exposing URIs between applications
		//
		// see: https://developer.android.com/reference/android/os/FileUriExposedException
		// see: https://github.com/NativeScript/NativeScript/issues/5661#issuecomment-456405380
		const providerName = `${context.getPackageName()}.provider`;
		Trace.write(`fully-qualified provider name [${providerName}]`, Trace.categories.Debug);

		const apkURI = androidx.core.content.FileProvider.getUriForFile(context, providerName, new java.io.File(filePath));

		// Set flags & URI as data type on the view action
		intent.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
		chooserIntent.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);

		// Finish intent setup
		intent.setDataAndType(apkURI, mimeType);

		context.startActivity(chooserIntent);

		return true;
	} catch (err) {
		const msg = err.message ? `: ${err.message}` : '';
		Trace.write(`Error in openFile${msg}`, Trace.categories.Error, Trace.messageType.error);

		if (msg && msg.includes('Attempt to invoke virtual method') && msg.includes('android.content.pm.ProviderInfo.loadXmlMetaData') && msg.includes('on a null object reference')) {
			// Alert user to possible fix
			Trace.write(
				`
Please ensure you have your manifest correctly configured with the FileProvider.
(see: https://developer.android.com/reference/android/support/v4/content/FileProvider#ProviderDefinition)
`,
				Trace.categories.Error
			);
		}

		return false;
	}
}

export function isRealDevice(): boolean {
	return ad.isRealDevice();
}
