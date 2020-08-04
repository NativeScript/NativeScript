import { AngularCompilerPlugin } from '@ngtools/webpack';
import * as semver from 'semver';
import { getAngularVersion } from '../helpers/projectHelpers';

export function getResolvedEntryModule(ngCompiler: AngularCompilerPlugin, projectDir: string) {
	const ngCoreVersion = projectDir && semver.coerce(getAngularVersion({ projectDir }));
	let workaroundResolveModule;
	// https://github.com/angular/angular-cli/commit/d2e22e97818c6582ce4a9942c59fcac4a8aaf60e#diff-0f65e27eb122d9efa58bf08adada7f82L364
	if (!ngCoreVersion || semver.gte(ngCoreVersion, '8.0.0')) {
		workaroundResolveModule = require('@ngtools/webpack/src/utils');
	} else {
		workaroundResolveModule = require('@ngtools/webpack/src/compiler_host');
	}

	return ngCompiler.entryModule ? { path: workaroundResolveModule.workaroundResolve(ngCompiler.entryModule.path), className: ngCompiler.entryModule.className } : ngCompiler.entryModule;
}
