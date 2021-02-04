import { basename } from "path";

import { INativeScriptPlatform } from "../helpers/platform";
import { getProjectRootPath } from "../helpers/project";

function sanitizeName(appName: string): string {
	const sanitizedName = appName.split("").filter((c) =>
		/[a-zA-Z0-9]/.test(c)
	).join("");
	return sanitizedName;
}
function getDistPath() {
	const appName = sanitizeName(basename(getProjectRootPath()));
	return `platforms/ios/${appName}/app`;
}

const iOSPlatform: INativeScriptPlatform = {
	getDistPath,
}

export default iOSPlatform;
