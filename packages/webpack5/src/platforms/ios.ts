import { basename } from "path";

import { INativeScriptPlatform } from "../helpers/platform";
import { getProjectRootPath } from "../helpers/project";
import { env } from '../';
import { getValue } from '../helpers/config';
import { sanitizeName } from '../helpers/name';
function getDistPath() {
	// if nativescript.config projectName is defined, use that custom name
	// otherwise, default to base project directory name for project name
	const appName = getValue('projectName') ?? sanitizeName(basename(getProjectRootPath()));
	const platform = process.env.USER_PROJECT_PLATFORMS_IOS ? process.env.USER_PROJECT_PLATFORMS_IOS : `${env.buildPath ?? "platforms"}/ios`;
	return `${platform}/${appName}/app`;
}

const iOSPlatform: INativeScriptPlatform = {
	getDistPath,
}

export default iOSPlatform;
