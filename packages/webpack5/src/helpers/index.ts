import { merge } from 'webpack-merge';

import { addCopyRule, removeCopyRule } from './copyRules';
import { error, info, warn, warnOnce } from './log';
import { determineProjectFlavor, projectUsesCustomFlavor } from './flavor';
import { readTsConfig } from './typescript';
import { getValue } from './config';
import {
	getAllDependencies,
	hasDependency,
	getDependencyPath,
} from './dependencies';
import { getPackageJson, getProjectRootPath } from './project';
import {
	addPlatform,
	getAbsoluteDistPath,
	getDistPath,
	getEntryDirPath,
	getEntryPath,
	getPlatform,
	getPlatformName,
} from './platform';

// intentionally populated manually
// as this generates nicer typings
// that show all the utils inline
// rather than imports to types
// todo: maybe use api-extractor instead
export default {
	merge,
	addCopyRule,
	removeCopyRule,
	config: {
		getValue,
	},
	dependencies: {
		getAllDependencies,
		hasDependency,
		getDependencyPath,
	},
	flavor: {
		determineProjectFlavor,
		projectUsesCustomFlavor,
	},
	log: {
		error,
		info,
		warn,
	},
	project: {
		getProjectRootPath,
		getPackageJson,
	},
	platform: {
		addPlatform,
		getAbsoluteDistPath,
		getDistPath,
		getEntryDirPath,
		getEntryPath,
		getPlatform,
		getPlatformName,
	},
	tsconfig: {
		readTsConfig,
	},
};
