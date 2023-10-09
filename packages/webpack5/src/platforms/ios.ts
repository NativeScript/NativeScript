import { basename } from "path";

import { INativeScriptPlatform } from "../helpers/platform";
import { getProjectRootPath } from "../helpers/project";

function sanitizeName(appName: string): string {
	return appName.split("").filter((c) =>
		/[a-zA-Z0-9]/.test(c)
	).join("");
}
function getDistPath() {
	const appName = sanitizeName(basename(getProjectRootPath()));
	const platform = process.env.USER_PROJECT_PLATFORMS_IOS ? process.env.USER_PROJECT_PLATFORMS_IOS : "platforms/ios"
	return `${platform}/${appName}/app`;
}

const iOSPlatform: INativeScriptPlatform = {
	getDistPath,
}

export default iOSPlatform;
