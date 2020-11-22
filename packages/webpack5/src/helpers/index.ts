import { merge } from 'webpack-merge';
import { getValue } from './config';
import { getAllDependencies, getDependencyPath } from './dependencies';
import { determineProjectFlavor } from './flavor';
import { error, info, warn } from './log';
import {
	getAbsoluteDistPath,
	getDistPath,
	getEntryPath,
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
		getDistPath,
		getPlatform,
		getPackageJson,
	},
};
