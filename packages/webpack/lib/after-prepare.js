const { installSnapshotArtefacts } = require("../snapshot/android/project-snapshot-generator");
const { shouldSnapshot } = require("./utils");

module.exports = function (hookArgs) {
	if (hookArgs && hookArgs.appFilesUpdaterOptions && !hookArgs.appFilesUpdaterOptions.bundle) {
		return;
	}

	const env = hookArgs.prepareData.env || {};
	const shouldSnapshotOptions = {
		platform: hookArgs.prepareData.platform,
		release: hookArgs.prepareData.release
	};

	if (env.snapshot &&
		shouldSnapshot(shouldSnapshotOptions) &&
		(!hookArgs.prepareData ||
			!hookArgs.prepareData.nativePrepare ||
			!hookArgs.prepareData.nativePrepare.skipNativePrepare)) {

		installSnapshotArtefacts(hookArgs.prepareData.projectDir);
	}
}
