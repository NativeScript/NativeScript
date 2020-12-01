import { merge } from 'webpack-merge';

import {
	getAllDependencies,
	hasDependency,
	getDependencyPath,
} from './dependencies';
import { determineProjectFlavor } from './flavor';
import { error, info, warn } from './log';
import { getValue } from './config';
import {
	getAbsoluteDistPath,
	getDistPath,
	getEntryPath,
	getEntryDirPath,
	getPackageJson,
	getPlatform,
	getProjectRootPath,
} from './project';

// intentionally populated manually
// as this generates nicer typings
// that show all the utils inline
// rather than imports to types
export default {
	merge,
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
	},
	log: {
		error,
		info,
		warn,
	},
	project: {
		getProjectRootPath,
		getAbsoluteDistPath,
		getEntryPath,
		getEntryDirPath,
		getDistPath,
		getPlatform,
		getPackageJson,
	},
};
