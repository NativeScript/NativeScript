import Config from 'webpack-chain';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import get from 'lodash.get'

import { getProjectFilePath, getProjectRootPath } from '../helpers/project';
import { getEntryPath, getPlatformName } from '../helpers/platform';
import { env as _env, IWebpackEnv } from '../index';
import { addCopyRule } from "../helpers/copyRules";
import base from './base';

export default function (config: Config, env: IWebpackEnv = _env): Config {
	base(config, env);

	const tsConfigPath = getProjectFilePath('tsconfig.json')

	applyFileReplacements(config)

	// remove default ts rule
	config.module.rules.delete('ts');

	// remove fork ts checked as not needed
	config.plugins.delete('ForkTsCheckerWebpackPlugin');

	// explicitly define mainFields to make sure ngcc compiles as es2015 (module field)
	// instead of umd (main field).
	config.resolve.mainFields.add('module').add('main');

	config.module
		.rule('angular')
		.test(/(?:\.ngfactory.js|\.ngstyle\.js|\.ts)$/)
		.use('@ngtools/webpack')
		.loader('@ngtools/webpack');

	config.module
		.rule('@angular/core')
		.test(/[\/\\]@angular[\/\\]core[\/\\].+\.js$/)
		.parser({ system: true });

	// set up html
	config.module
		.rule('html')
		.test(/\.html$/)
		.use('raw-loader')
		.loader('raw-loader');

	config.plugin('AngularCompilerPlugin').use(getAngularCompilerPlugin(), [
		{
			tsConfigPath,
			mainPath: getEntryPath(),
			platformTransformers: [require('../transformers/NativeClass').default],
		},
	]);

	return config;
}

function getAngularCompilerPlugin() {
	const { AngularCompilerPlugin } = require('@ngtools/webpack');
	return AngularCompilerPlugin;
}

/**
 * @internal exported for tests
 */
export function applyFileReplacements(
	config,
	fileReplacements = getFileReplacementsFromWorkspaceConfig()
) {
	if (!fileReplacements) {
		return
	}

	Object.entries(fileReplacements).forEach(([_replace, _with]) => {
		// in case we are replacing source files - we'll use aliases
		if (_replace.match(/\.ts$/)) {
			return config.resolve.alias.set(_replace, _with)
		}

		// otherwise we will override the replaced file with the replacement
		addCopyRule({
			from: _with, // copy the replacement file
			to: _replace, // to the original "to-be-replaced" file
			force: true,
		})
	})
}

// todo: move into project helper if used elsewhere
// todo: write tests
function findFile(fileName, currentDir): string | null {
	// console.log(`findFile(${fileName}, ${currentDir})`)
	const path = resolve(currentDir, fileName);

	if (existsSync(path)) {
		return path
	}

	// bail if we reached the root dir
	if (currentDir === resolve('/')) {
		return null
	}

	// traverse to the parent folder
	return findFile(fileName, resolve(currentDir, '..'))
}

function findWorkspaceConfig(): string {
	const possibleConfigNames = [
		'angular.json',
		'workspace.json'
	]

	for (const name of possibleConfigNames) {
		const path = findFile(name, getProjectRootPath());

		if (path) {
			return path
		}
	}

	// not found
	return null;
}

interface IWorkspaceConfigFileReplacement {
	replace: string,
	with: string
}

interface IReplacementMap {
	[from: string]: string
}

/**
 * @internal exported for tests
 */
export function getFileReplacementsFromWorkspaceConfig(
	configPath: string = findWorkspaceConfig()
): IReplacementMap | null {
	const platform = getPlatformName();

	if (!_env.configuration || !_env.projectName) {
		return null;
	}

	const configurations = _env.configuration.split(',').map(c => c.trim())

	if (!configPath || configPath === '') {
		return null;
	}

	const config = require(configPath);
	const project = get(config, `projects.${_env.projectName}`)
	const targetProp = project?.architect ? 'architect' : 'targets';

	if (!project) {
		return null;
	}

	const replacements = {};

	const setReplacement = (entry: IWorkspaceConfigFileReplacement) => {
		const relativeReplace = resolve(dirname(configPath), entry.replace)
		const relativeWith = resolve(dirname(configPath), entry.with)
		replacements[relativeReplace] = relativeWith
	}

	configurations.forEach(configuration => {
		const defaultReplacements = get(project, `${targetProp}.default.configurations.${configuration}.fileReplacements`)
		const platformReplacements = get(project, `${targetProp}.${platform}.configurations.${configuration}.fileReplacements`)

		// add default replacements
		defaultReplacements?.map(setReplacement)
		// add platform replacements (always override defaults!)
		platformReplacements?.map(setReplacement)
	})

	return replacements;
}
