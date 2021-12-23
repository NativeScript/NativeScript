import { merge } from 'webpack-merge';

import {
	getPackageJson,
	getProjectRootPath,
	getProjectFilePath,
} from './project';
import { addVirtualEntry, addVirtualModule } from './virtualModules';
import { applyFileReplacements } from './fileReplacements';
import { addCopyRule, removeCopyRule } from './copyRules';
import { error, info, warn, warnOnce } from './log';
import { determineProjectFlavor } from './flavor';
import { getValue } from './config';
import { getIPS } from './host';
import {
	getAllDependencies,
	hasDependency,
	getDependencyPath,
} from './dependencies';
import {
	addPlatform,
	getAbsoluteDistPath,
	getDistPath,
	getEntryDirPath,
	getEntryPath,
	getPlatform,
	getPlatformName,
} from './platform';
import { readTsConfig } from './typescript';

// intentionally populated manually
// as this generates nicer typings
// that show all the utils inline
// rather than imports to types
// todo: maybe use api-extractor instead
export default {
	merge,
	addCopyRule,
	removeCopyRule,
	applyFileReplacements,
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
	host: {
		getIPS,
	},
	log: {
		error,
		info,
		warn,
		warnOnce,
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
	project: {
		getProjectFilePath,
		getProjectRootPath,
		getPackageJson,
	},
	virtualModules: {
		addVirtualEntry,
		addVirtualModule,
	},
	tsconfig: {
		readTsConfig,
	},
};
