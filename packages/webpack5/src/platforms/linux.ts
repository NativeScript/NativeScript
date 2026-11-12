import { basename } from 'path';

import { INativeScriptPlatform } from "../helpers/platform";
import { getProjectRootPath } from "../helpers/project";
import { env } from '../';
import { sanitizeName } from '../helpers/name';

function getDistPath() {
    const appName = sanitizeName(basename(getProjectRootPath()));
    const platform = process.env.USER_PROJECT_PLATFORMS_LINUX ? process.env.USER_PROJECT_PLATFORMS_LINUX : `${env.buildPath ?? "platforms"}/linux`;
    return `${platform}/${appName}/app`;
}

const LinuxPlatform: INativeScriptPlatform = {
    getDistPath,
}

export default LinuxPlatform;
