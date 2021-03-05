import { ContextExclusionPlugin } from 'webpack';
import Config from 'webpack-chain';
import { join } from 'path';

import VirtualModulesPlugin from 'webpack-virtual-modules';
import { getEntryDirPath } from './platform';
import dedent from 'ts-dedent';

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

export function addVirtualModule(
	config: Config,
	name: string,
	contents: string
): string {
	const virtualEntryPath = join(getEntryDirPath(), `${name}`);

	config
		.plugin('ContextExclusionPluginPlugin')
		.use(ContextExclusionPlugin, [new RegExp(`${name}\.js$`)]);

	const options = {
		[virtualEntryPath]: dedent(contents),
	};

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
