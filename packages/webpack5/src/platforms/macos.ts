import { basename } from "path";

import { INativeScriptPlatform } from "../helpers/platform";
import { getProjectRootPath } from "../helpers/project";
import { env } from '../';
import { getValue } from '../helpers/config';

function sanitizeName(appName: string): string {
	return appName.split("").filter((c) =>
		/[a-zA-Z0-9]/.test(c)
	).join("");
}

function getDistPath() {
	// if nativescript.config projectName is defined, use that custom name
	// otherwise, default to base project directory name for project name
	const appName = getValue('projectName') ?? sanitizeName(basename(getProjectRootPath()));
	const platform = process.env.USER_PROJECT_PLATFORMS_MACOS
		? process.env.USER_PROJECT_PLATFORMS_MACOS
		: `${env.buildPath ?? "platforms"}/macos`;
	return `${platform}/${appName}/app`;
}

const macOSPlatform: INativeScriptPlatform = {
	getDistPath,
};

export default macOSPlatform;
