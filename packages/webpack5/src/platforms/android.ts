import { INativeScriptPlatform } from "../helpers/platform";

function getDistPath() {
	if (process.env.USER_PROJECT_PLATFORMS_ANDROID) {
		return `${process.env.USER_PROJECT_PLATFORMS_ANDROID}/${process.env.USER_PROJECT_PLATFORMS_ANDROID_MODULE}/src/nativescript/assets/app`;
	}
	return `platforms/android/app/src/main/assets/app`;
}

const AndroidPlatform: INativeScriptPlatform = {
	getDistPath,
}

export default AndroidPlatform;
