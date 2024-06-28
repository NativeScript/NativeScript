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
	// try projectName from nativescript.config.ts, if not set, use original method
	const appName = getValue('projectName') ?? sanitizeName(basename(getProjectRootPath()));

	return `${env.buildPath ?? "platforms"}/ios/${appName}/app`;
}

const iOSPlatform: INativeScriptPlatform = {
	getDistPath,
}

export default iOSPlatform;
