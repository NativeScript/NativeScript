import { basename } from 'path';

import { INativeScriptPlatform } from "../helpers/platform";
import { getProjectRootPath } from "../helpers/project";
import { env } from '../';
import { sanitizeName } from '../helpers/name';

function getDistPath() {
    const appName = sanitizeName(basename(getProjectRootPath()));
    const platform = process.env.USER_PROJECT_PLATFORMS_WINDOWS ? process.env.USER_PROJECT_PLATFORMS_WINDOWS : `${env.buildPath ?? "platforms"}/windows`;
    return `${platform}/${appName}/app`;
}

const WindowsPlatform: INativeScriptPlatform = {
    getDistPath,
}

export default WindowsPlatform;
