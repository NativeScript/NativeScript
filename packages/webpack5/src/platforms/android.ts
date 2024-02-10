import { INativeScriptPlatform } from "../helpers/platform";
import { env } from '../';

function getDistPath() {
	return `${env.buildPath ?? "platforms"}/android/app/src/main/assets/app`;
}

const AndroidPlatform: INativeScriptPlatform = {
	getDistPath,
}

export default AndroidPlatform;
