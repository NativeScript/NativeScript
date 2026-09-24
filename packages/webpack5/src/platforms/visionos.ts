import { basename } from "path";

import { INativeScriptPlatform } from "../helpers/platform";
import { getProjectRootPath } from "../helpers/project";
import { env } from '../';
import { sanitizeName } from '../helpers/name';
function getDistPath() {
	const appName = sanitizeName(basename(getProjectRootPath()));
	return `${env.buildPath ?? "platforms"}/visionos/${appName}/app`;
}

const visionOSPlatform: INativeScriptPlatform = {
	getDistPath,
}

export default visionOSPlatform;
