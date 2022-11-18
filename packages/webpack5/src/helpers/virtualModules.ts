import { ContextExclusionPlugin } from 'webpack';
import Config from 'webpack-chain';
import { dirname, join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

import VirtualModulesPlugin from 'webpack-virtual-modules';
import { getEntryDirPath } from './platform';
import dedent from 'ts-dedent';
import { getProjectFilePath } from './project';

/**
 * @deprecated Virtual entries are not recommended by the webpack team, use real files instead. For example, resolve a path in node_modules if necessary.
 */
export function addVirtualEntry(
	config: Config,
	name: string,
	contents: string
): string {
	return addVirtualModule(
		config,
		`__@nativescript_webpack_virtual_entry_${name}__`,
		contents
	);
}

/**
 * @deprecated Virtual modules are not recommended by the webpack team, use real files instead. For example, resolve a path in node_modules if necessary.
 */
export function addVirtualModule(
	config: Config,
	name: string,
	contents: string
): string {
	const virtualEntryPath = join(getEntryDirPath(), `${name}`);

	// add the virtual entry to the context exclusions
	// makes sure that require.context will never
	// include the virtual entry.
	config
		.plugin(`ContextExclusionPlugin|${name}`)
		.use(ContextExclusionPlugin, [new RegExp(`${name}\.js$`)]);

	const options = {
		[virtualEntryPath]: dedent(contents),
	};

	// AngularCompilerPlugin does not support virtual modules
	// https://github.com/sysgears/webpack-virtual-modules/issues/96
	// This is only an issue on v11, which has experimental webpack 5 support
	// AngularCompilerPlugin gets replaced by AngularWebpackPlugin on v12
	// todo: we can remove this special handling once we no longer support v11
	if (config.plugins.has('AngularCompilerPlugin')) {
		const compatEntryPath = getProjectFilePath(
			join('node_modules', '.nativescript', `${name}`)
		);
		mkdirSync(dirname(compatEntryPath), { recursive: true });
		writeFileSync(compatEntryPath, options[virtualEntryPath]);
		return compatEntryPath;
	}

	if (config.plugins.has('VirtualModulesPlugin')) {
		config.plugin('VirtualModulesPlugin').tap((args) => {
			Object.assign(args[0], options);
			return args;
		});
	} else {
		config.plugin('VirtualModulesPlugin').use(VirtualModulesPlugin, [options]);
	}

	return virtualEntryPath;
}
