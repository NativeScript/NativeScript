import { INativeScriptPlatform } from '.';

function getDistPath() {
	return `platforms/android/app/src/main/assets/app`;
}

const AndroidPlatform: INativeScriptPlatform = {
	getDistPath,
}

export default AndroidPlatform;
