import { basename } from "path";

import { getProjectRootPath } from "../helpers/project";
import { INativeScriptPlatform } from '.';

function getDistPath() {
	const appName = basename(getProjectRootPath());
	return `platforms/ios/${appName}/app`;
}

const iOSPlatform: INativeScriptPlatform = {
	getDistPath,
}

export default iOSPlatform;
