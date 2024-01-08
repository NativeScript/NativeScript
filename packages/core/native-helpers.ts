declare const __non_webpack_require__;

if (global.isAndroid) {
	try {
		__non_webpack_require__('system_lib://libnativescriptcorev8.so');
	} catch (error) {}
}

if (global.isIOS) {
	try {
		const installer = global.NativeScriptCoreModuleInstaller.new();
		installer.install();
	} catch (error) {}
}
