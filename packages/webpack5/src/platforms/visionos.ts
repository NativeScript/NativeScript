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
	return `platforms/visionos/${appName}/app`;
}

const visionOSPlatform: INativeScriptPlatform = {
	getDistPath,
}

export default visionOSPlatform;
